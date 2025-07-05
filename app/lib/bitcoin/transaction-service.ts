import * as bitcoin from 'bitcoinjs-lib'
import { ECPairFactory } from 'ecpair'
import * as ecc from '@bitcoinerlab/secp256k1'
import { SIGNET_NETWORK } from './wallet-service'

// Initialize ECPair with secp256k1 implementation
const ECPair = ECPairFactory(ecc)

export interface UTXO {
  txid: string
  vout: number
  value: number
  scriptPubKey: string
  address?: string
}

export interface TransactionInput {
  txid: string
  vout: number
  scriptSig?: string
  sequence?: number
}

export interface TransactionOutput {
  address: string
  value: number
}

export interface CreateTransactionParams {
  fromAddress: string
  toAddress: string
  amount: number
  feeRate: number
  utxos: UTXO[]
  changeAddress?: string
}

export interface SignedTransaction {
  txHex: string
  txid: string
  size: number
  vsize: number
  fee: number
}

export interface FeeEstimate {
  fastestFee: number
  halfHourFee: number
  hourFee: number
  economyFee: number
  minimumFee: number
}

/**
 * Bitcoin Transaction Service for SIGNET network
 * Handles transaction creation, signing, and broadcasting
 */
export class TransactionService {
  private static readonly MEMPOOL_API_BASE = 'https://mempool.space/signet/api'
  private static readonly DUST_LIMIT = 546 // satoshis

  /**
   * Creates a new Bitcoin transaction
   * @param {CreateTransactionParams} params - Transaction parameters
   * @returns {Promise<bitcoin.Transaction>} Unsigned transaction
   */
  static async createTransaction(params: CreateTransactionParams): Promise<bitcoin.Transaction> {
    try {
      const { fromAddress, toAddress, amount, feeRate, utxos, changeAddress } = params

      // Validate addresses
      if (!this.validateAddress(fromAddress) || !this.validateAddress(toAddress)) {
        throw new Error('Invalid address format')
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }

      // Calculate total available amount
      const totalAvailable = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
      
      // Create transaction builder
      const psbt = new bitcoin.Psbt({ network: SIGNET_NETWORK })

      // Add inputs
      let inputAmount = 0
      for (const utxo of utxos) {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: Buffer.from(utxo.scriptPubKey, 'hex'),
            value: utxo.value
          }
        })
        inputAmount += utxo.value
        
        // Stop adding inputs if we have enough
        if (inputAmount >= amount + (feeRate * 200)) { // Rough fee estimation
          break
        }
      }

      // Add main output
      psbt.addOutput({
        address: toAddress,
        value: amount
      })

      // Calculate fee
      const estimatedSize = this.estimateTransactionSize(psbt.inputCount, 2) // 2 outputs (main + change)
      const fee = Math.ceil(estimatedSize * feeRate)

      // Calculate change
      const change = inputAmount - amount - fee

      // Add change output if significant
      if (change > this.DUST_LIMIT) {
        const changeAddr = changeAddress || fromAddress
        psbt.addOutput({
          address: changeAddr,
          value: change
        })
      } else if (change < 0) {
        throw new Error('Insufficient funds for transaction and fees')
      }

      // Return the transaction (unsigned)
      return psbt.extractTransaction()
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw new Error(`Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Signs a transaction with the provided private key
   * @param {bitcoin.Transaction} transaction - The transaction to sign
   * @param {string} privateKey - Private key in hex format
   * @param {UTXO[]} utxos - UTXOs being spent
   * @returns {Promise<SignedTransaction>} Signed transaction
   */
  static async signTransaction(
    transaction: bitcoin.Transaction,
    privateKey: string,
    utxos: UTXO[]
  ): Promise<SignedTransaction> {
    try {
      // Create key pair from private key
      const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network: SIGNET_NETWORK })

      // Create PSBT from transaction
      const psbt = new bitcoin.Psbt({ network: SIGNET_NETWORK })

      // Add inputs with witness data
      for (let i = 0; i < transaction.ins.length; i++) {
        const input = transaction.ins[i]
        const utxo = utxos[i]
        
        psbt.addInput({
          hash: input.hash,
          index: input.index,
          witnessUtxo: {
            script: Buffer.from(utxo.scriptPubKey, 'hex'),
            value: utxo.value
          }
        })
      }

      // Add outputs
      for (const output of transaction.outs) {
        psbt.addOutput({
          script: output.script,
          value: output.value
        })
      }

      // Sign all inputs
      for (let i = 0; i < psbt.inputCount; i++) {
        psbt.signInput(i, keyPair)
      }

      // Finalize and extract
      psbt.finalizeAllInputs()
      const signedTx = psbt.extractTransaction()

      return {
        txHex: signedTx.toHex(),
        txid: signedTx.getId(),
        size: signedTx.byteLength(),
        vsize: signedTx.virtualSize(),
        fee: this.calculateTransactionFee(signedTx, utxos)
      }
    } catch (error) {
      console.error('Error signing transaction:', error)
      throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Broadcasts a signed transaction to the network
   * @param {string} txHex - Signed transaction in hex format
   * @returns {Promise<string>} Transaction ID
   */
  static async broadcastTransaction(txHex: string): Promise<string> {
    try {
      const response = await fetch(`${this.MEMPOOL_API_BASE}/tx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: txHex
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Broadcast failed: ${errorText}`)
      }

      const txid = await response.text()
      return txid
    } catch (error) {
      console.error('Error broadcasting transaction:', error)
      throw new Error(`Failed to broadcast transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Calculates transaction fee based on size and fee rate
   * @param {bitcoin.Transaction} transaction - The transaction
   * @param {number} feeRate - Fee rate in sat/vB
   * @returns {number} Fee in satoshis
   */
  static calculateFee(transaction: bitcoin.Transaction, feeRate: number): number {
    const vsize = transaction.virtualSize()
    return Math.ceil(vsize * feeRate)
  }

  /**
   * Creates an OP_RETURN transaction with a message
   * @param {string} message - Message to embed (max 80 bytes)
   * @param {string} fromAddress - Source address
   * @param {UTXO[]} utxos - Available UTXOs
   * @param {number} feeRate - Fee rate in sat/vB
   * @returns {Promise<bitcoin.Transaction>} OP_RETURN transaction
   */
  static async createOPReturn(
    message: string,
    fromAddress: string,
    utxos: UTXO[],
    feeRate: number
  ): Promise<bitcoin.Transaction> {
    try {
      if (Buffer.from(message, 'utf8').length > 80) {
        throw new Error('Message too long (max 80 bytes)')
      }

      const psbt = new bitcoin.Psbt({ network: SIGNET_NETWORK })

      // Add inputs
      let inputAmount = 0
      for (const utxo of utxos) {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: Buffer.from(utxo.scriptPubKey, 'hex'),
            value: utxo.value
          }
        })
        inputAmount += utxo.value
        
        // Estimate if we have enough for fees
        const estimatedSize = this.estimateTransactionSize(psbt.inputCount, 2)
        const estimatedFee = Math.ceil(estimatedSize * feeRate)
        
        if (inputAmount >= estimatedFee + this.DUST_LIMIT) {
          break
        }
      }

      // Add OP_RETURN output
      const opReturnScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_RETURN,
        Buffer.from(message, 'utf8')
      ])

      psbt.addOutput({
        script: opReturnScript,
        value: 0
      })

      // Calculate fee and change
      const estimatedSize = this.estimateTransactionSize(psbt.inputCount, 2)
      const fee = Math.ceil(estimatedSize * feeRate)
      const change = inputAmount - fee

      // Add change output if significant
      if (change > this.DUST_LIMIT) {
        psbt.addOutput({
          address: fromAddress,
          value: change
        })
      } else if (change < 0) {
        throw new Error('Insufficient funds for OP_RETURN transaction')
      }

      return psbt.extractTransaction()
    } catch (error) {
      console.error('Error creating OP_RETURN transaction:', error)
      throw new Error(`Failed to create OP_RETURN transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Gets current fee estimates from mempool
   * @returns {Promise<FeeEstimate>} Fee estimates in sat/vB
   */
  static async getFeeEstimates(): Promise<FeeEstimate> {
    try {
      const response = await fetch(`${this.MEMPOOL_API_BASE}/v1/fees/recommended`)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      return {
        fastestFee: data.fastestFee,
        halfHourFee: data.halfHourFee,
        hourFee: data.hourFee,
        economyFee: data.economyFee,
        minimumFee: data.minimumFee
      }
    } catch (error) {
      console.error('Error fetching fee estimates:', error)
      // Return default values if API fails
      return {
        fastestFee: 20,
        halfHourFee: 10,
        hourFee: 5,
        economyFee: 2,
        minimumFee: 1
      }
    }
  }

  /**
   * Estimates transaction size based on inputs and outputs
   * @param {number} inputCount - Number of inputs
   * @param {number} outputCount - Number of outputs
   * @returns {number} Estimated size in bytes
   */
  private static estimateTransactionSize(inputCount: number, outputCount: number): number {
    // P2WPKH input: 41 vbytes each
    // P2WPKH output: 31 vbytes each
    // Base transaction: 10.5 vbytes
    return Math.ceil(10.5 + (inputCount * 41) + (outputCount * 31))
  }

  /**
   * Calculates the actual fee paid by a transaction
   * @param {bitcoin.Transaction} transaction - The transaction
   * @param {UTXO[]} utxos - UTXOs being spent
   * @returns {number} Fee in satoshis
   */
  private static calculateTransactionFee(transaction: bitcoin.Transaction, utxos: UTXO[]): number {
    const inputValue = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
    const outputValue = transaction.outs.reduce((sum, output) => sum + output.value, 0)
    return inputValue - outputValue
  }

  /**
   * Validates a Bitcoin address
   * @param {string} address - Address to validate
   * @returns {boolean} True if valid
   */
  private static validateAddress(address: string): boolean {
    try {
      bitcoin.address.toOutputScript(address, SIGNET_NETWORK)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Converts a transaction to a readable format
   * @param {bitcoin.Transaction} transaction - The transaction
   * @returns {any} Readable transaction object
   */
  static transactionToReadable(transaction: bitcoin.Transaction): any {
    return {
      txid: transaction.getId(),
      version: transaction.version,
      locktime: transaction.locktime,
      size: transaction.byteLength(),
      vsize: transaction.virtualSize(),
      weight: transaction.weight(),
      inputs: transaction.ins.map((input, index) => ({
        txid: Buffer.from(input.hash).reverse().toString('hex'),
        vout: input.index,
        sequence: input.sequence,
        scriptSig: input.script.toString('hex'),
        witness: input.witness.map(w => w.toString('hex'))
      })),
      outputs: transaction.outs.map((output, index) => ({
        value: output.value,
        scriptPubKey: output.script.toString('hex'),
        address: this.getAddressFromScript(output.script)
      }))
    }
  }

  /**
   * Extracts address from script
   * @param {Buffer} script - Script buffer
   * @returns {string|null} Address or null if not extractable
   */
  private static getAddressFromScript(script: Buffer): string | null {
    try {
      return bitcoin.address.fromOutputScript(script, SIGNET_NETWORK)
    } catch (error) {
      return null
    }
  }
}