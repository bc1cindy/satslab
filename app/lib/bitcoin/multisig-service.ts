import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import ECPairFactory from 'ecpair'
import { SIGNET_NETWORK } from './crypto'

bitcoin.initEccLib(ecc)
const ECPair = ECPairFactory(ecc)

export interface MultisigWallet {
  address: string
  redeemScript: Buffer
  publicKeys: string[]
  m: number
  n: number
  network: bitcoin.Network
  type: 'p2sh' | 'p2wsh' | 'p2tr'
}

export interface MultisigTransaction {
  txId: string
  psbt: bitcoin.Psbt
  signatures: Map<number, string>
  requiredSignatures: number
  isComplete: boolean
  fee: number
}

export interface MultisigKey {
  privateKey: string
  publicKey: string
  wif: string
}

export interface MultisigUTXO {
  txid: string
  vout: number
  value: number
  redeemScript: Buffer
}

export class MultisigService {
  private network: bitcoin.Network

  constructor(network: bitcoin.Network = SIGNET_NETWORK) {
    this.network = network
  }

  /**
   * Gera chaves para carteira multisig
   */
  generateMultisigKeys(count: number): MultisigKey[] {
    const keys: MultisigKey[] = []
    
    for (let i = 0; i < count; i++) {
      const keyPair = ECPair.makeRandom({ network: this.network })
      keys.push({
        privateKey: keyPair.privateKey!.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
        wif: keyPair.toWIF(),
      })
    }
    
    return keys
  }

  /**
   * Cria uma carteira multisig
   */
  createMultisigWallet(
    publicKeys: string[],
    m: number,
    n: number,
    type: 'p2sh' | 'p2wsh' | 'p2tr' = 'p2wsh'
  ): MultisigWallet {
    if (publicKeys.length !== n) {
      throw new Error(`Expected ${n} public keys, got ${publicKeys.length}`)
    }
    
    if (m > n) {
      throw new Error('m cannot be greater than n')
    }
    
    if (m < 1 || n < 1) {
      throw new Error('m and n must be positive integers')
    }

    const pubKeyBuffers = publicKeys.map(pk => Buffer.from(pk, 'hex'))
    
    let address: string
    let redeemScript: Buffer
    
    switch (type) {
      case 'p2sh':
        redeemScript = bitcoin.script.compile([
          bitcoin.script.number.encode(m),
          ...pubKeyBuffers,
          bitcoin.script.number.encode(n),
          bitcoin.opcodes.OP_CHECKMULTISIG,
        ])
        
        const p2sh = bitcoin.payments.p2sh({
          redeem: { output: redeemScript },
          network: this.network,
        })
        
        if (!p2sh.address) {
          throw new Error('Failed to generate P2SH address')
        }
        
        address = p2sh.address
        break
        
      case 'p2wsh':
        redeemScript = bitcoin.script.compile([
          bitcoin.script.number.encode(m),
          ...pubKeyBuffers,
          bitcoin.script.number.encode(n),
          bitcoin.opcodes.OP_CHECKMULTISIG,
        ])
        
        const p2wsh = bitcoin.payments.p2wsh({
          redeem: { output: redeemScript },
          network: this.network,
        })
        
        if (!p2wsh.address) {
          throw new Error('Failed to generate P2WSH address')
        }
        
        address = p2wsh.address
        break
        
      case 'p2tr':
        // Para Taproot multisig, usamos um script alternativo
        redeemScript = bitcoin.script.compile([
          bitcoin.script.number.encode(m),
          ...pubKeyBuffers,
          bitcoin.script.number.encode(n),
          bitcoin.opcodes.OP_CHECKMULTISIG,
        ])
        
        const scriptTree = { output: redeemScript }
        const p2tr = bitcoin.payments.p2tr({
          scriptTree,
          network: this.network,
        })
        
        if (!p2tr.address) {
          throw new Error('Failed to generate P2TR address')
        }
        
        address = p2tr.address
        break
        
      default:
        throw new Error(`Unsupported multisig type: ${type}`)
    }

    return {
      address,
      redeemScript,
      publicKeys,
      m,
      n,
      network: this.network,
      type,
    }
  }

  /**
   * Gera endereço multisig a partir de um script
   */
  generateMultisigAddress(
    redeemScript: Buffer,
    type: 'p2sh' | 'p2wsh' = 'p2wsh'
  ): string {
    let payment: bitcoin.payments.Payment
    
    switch (type) {
      case 'p2sh':
        payment = bitcoin.payments.p2sh({
          redeem: { output: redeemScript },
          network: this.network,
        })
        break
        
      case 'p2wsh':
        payment = bitcoin.payments.p2wsh({
          redeem: { output: redeemScript },
          network: this.network,
        })
        break
        
      default:
        throw new Error(`Unsupported address type: ${type}`)
    }
    
    if (!payment.address) {
      throw new Error('Failed to generate multisig address')
    }
    
    return payment.address
  }

  /**
   * Cria uma transação multisig
   */
  createMultisigTransaction(
    wallet: MultisigWallet,
    utxos: MultisigUTXO[],
    outputs: { address: string; value: number }[],
    feeRate: number = 1
  ): MultisigTransaction {
    const psbt = new bitcoin.Psbt({ network: this.network })
    
    // Adiciona inputs
    let totalInput = 0
    for (const utxo of utxos) {
      switch (wallet.type) {
        case 'p2sh':
          psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            nonWitnessUtxo: Buffer.alloc(0), // Seria necessário a tx completa
            redeemScript: utxo.redeemScript,
          })
          break
          
        case 'p2wsh':
          psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
              script: bitcoin.payments.p2wsh({
                redeem: { output: utxo.redeemScript },
                network: this.network,
              }).output!,
              value: utxo.value,
            },
            witnessScript: utxo.redeemScript,
          })
          break
          
        case 'p2tr':
          // Taproot multisig é mais complexo
          psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
              script: bitcoin.payments.p2tr({
                scriptTree: { output: utxo.redeemScript },
                network: this.network,
              }).output!,
              value: utxo.value,
            },
          })
          break
      }
      
      totalInput += utxo.value
    }
    
    // Adiciona outputs
    let totalOutput = 0
    for (const output of outputs) {
      psbt.addOutput({
        address: output.address,
        value: output.value,
      })
      totalOutput += output.value
    }
    
    const fee = totalInput - totalOutput
    
    return {
      txId: '', // Será preenchido após assinatura completa
      psbt,
      signatures: new Map(),
      requiredSignatures: wallet.m,
      isComplete: false,
      fee,
    }
  }

  /**
   * Assina uma transação multisig
   */
  signMultisigTransaction(
    transaction: MultisigTransaction,
    privateKey: string,
    inputIndex: number
  ): MultisigTransaction {
    const keyPair = ECPair.fromWIF(privateKey, this.network)
    const publicKey = keyPair.publicKey.toString('hex')
    
    try {
      transaction.psbt.signInput(inputIndex, keyPair)
      transaction.signatures.set(inputIndex, publicKey)
      
      // Verifica se temos assinaturas suficientes
      if (transaction.signatures.size >= transaction.requiredSignatures) {
        transaction.isComplete = true
        try {
          transaction.psbt.finalizeAllInputs()
          const tx = transaction.psbt.extractTransaction()
          transaction.txId = tx.getId()
        } catch (error) {
          // Pode não ser possível finalizar se ainda faltam assinaturas
          transaction.isComplete = false
        }
      }
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error}`)
    }
    
    return transaction
  }

  /**
   * Valida uma carteira multisig
   */
  validateMultisigWallet(wallet: MultisigWallet): boolean {
    try {
      // Verifica se o número de chaves públicas está correto
      if (wallet.publicKeys.length !== wallet.n) {
        return false
      }
      
      // Verifica se m <= n
      if (wallet.m > wallet.n) {
        return false
      }
      
      // Verifica se as chaves públicas são válidas
      for (const pubKey of wallet.publicKeys) {
        if (!this.isValidPublicKey(pubKey)) {
          return false
        }
      }
      
      return true
    } catch {
      return false
    }
  }

  /**
   * Estima a taxa para uma transação multisig
   */
  estimateMultisigFee(
    numInputs: number,
    numOutputs: number,
    m: number,
    n: number,
    type: 'p2sh' | 'p2wsh' | 'p2tr' = 'p2wsh',
    feeRate: number = 1
  ): number {
    let inputSize: number
    let outputSize: number
    
    switch (type) {
      case 'p2sh':
        inputSize = 147 + (m * 73) + (n * 33) // Aproximação
        outputSize = 34
        break
        
      case 'p2wsh':
        inputSize = 104 + (m * 73) + (n * 33) // Menor que P2SH
        outputSize = 43
        break
        
      case 'p2tr':
        inputSize = 57 + (m * 65) // Taproot é mais eficiente
        outputSize = 43
        break
        
      default:
        throw new Error(`Unsupported type: ${type}`)
    }
    
    const overhead = 10
    const estimatedSize = overhead + (numInputs * inputSize) + (numOutputs * outputSize)
    
    return Math.ceil(estimatedSize * feeRate)
  }

  /**
   * Verifica se uma chave pública é válida
   */
  private isValidPublicKey(publicKey: string): boolean {
    try {
      const buffer = Buffer.from(publicKey, 'hex')
      return buffer.length === 33 && (buffer[0] === 0x02 || buffer[0] === 0x03)
    } catch {
      return false
    }
  }

  /**
   * Converte chaves WIF para chaves públicas
   */
  getPublicKeysFromWIFs(wifs: string[]): string[] {
    return wifs.map(wif => {
      const keyPair = ECPair.fromWIF(wif, this.network)
      return keyPair.publicKey.toString('hex')
    })
  }
}