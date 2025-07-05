import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import ECPairFactory from 'ecpair'
import { SIGNET_NETWORK } from './crypto'

bitcoin.initEccLib(ecc)
const ECPair = ECPairFactory(ecc)

export interface TaprootAddress {
  address: string
  privateKey: string
  publicKey: string
  internalKey: string
  network: bitcoin.Network
}

interface ECPairInterface {
  privateKey?: Buffer
  publicKey: Buffer
  toWIF(): string
  sign(hash: Buffer): Buffer
}

export interface TaprootTransaction {
  txId: string
  inputs: TaprootTransactionInput[]
  outputs: TaprootTransactionOutput[]
  fee: number
  size: number
  vsize: number
}

export interface TaprootTransactionInput {
  txid: string
  vout: number
  value: number
  address: string
  privateKey: string
}

export interface TaprootTransactionOutput {
  address: string
  value: number
}

export class TaprootService {
  private network: bitcoin.Network

  constructor(network: bitcoin.Network = SIGNET_NETWORK) {
    this.network = network
  }

  /**
   * Cria um endereço Taproot a partir de uma chave interna
   */
  createTaprootAddress(internalKey?: string): TaprootAddress {
    let keyPair: ECPairInterface
    
    if (internalKey) {
      keyPair = ECPair.fromPrivateKey(Buffer.from(internalKey, 'hex'), { network: this.network })
    } else {
      keyPair = ECPair.makeRandom({ network: this.network })
    }

    // Para Taproot, usamos a chave interna diretamente
    const internalKeyBuffer = keyPair.publicKey.slice(1) // Remove o prefixo 0x02/0x03
    
    const { address } = bitcoin.payments.p2tr({
      internalPubkey: internalKeyBuffer,
      network: this.network,
    })

    if (!address) {
      throw new Error('Failed to generate Taproot address')
    }

    return {
      address,
      privateKey: keyPair.toWIF(),
      publicKey: keyPair.publicKey.toString('hex'),
      internalKey: internalKeyBuffer.toString('hex'),
      network: this.network
    }
  }

  /**
   * Cria uma transação Taproot
   */
  async createTaprootTransaction(
    inputs: TaprootTransactionInput[],
    outputs: TaprootTransactionOutput[],
    feeRate: number = 1
  ): Promise<TaprootTransaction> {
    const psbt = new bitcoin.Psbt({ network: this.network })

    // Adiciona inputs
    for (const input of inputs) {
      const keyPair = ECPair.fromWIF(input.privateKey, this.network)
      const internalKey = keyPair.publicKey.slice(1)
      
      const { output, witness } = bitcoin.payments.p2tr({
        internalPubkey: internalKey,
        network: this.network,
      })

      psbt.addInput({
        hash: input.txid,
        index: input.vout,
        witnessUtxo: {
          script: output!,
          value: input.value,
        },
        tapInternalKey: internalKey,
      })
    }

    // Adiciona outputs
    for (const output of outputs) {
      psbt.addOutput({
        address: output.address,
        value: output.value,
      })
    }

    // Assina inputs
    for (let i = 0; i < inputs.length; i++) {
      const keyPair = ECPair.fromWIF(inputs[i].privateKey, this.network)
      psbt.signInput(i, keyPair)
    }

    // Finaliza e extrai transação
    psbt.finalizeAllInputs()
    const tx = psbt.extractTransaction()

    const totalInput = inputs.reduce((sum, input) => sum + input.value, 0)
    const totalOutput = outputs.reduce((sum, output) => sum + output.value, 0)
    const fee = totalInput - totalOutput

    return {
      txId: tx.getId(),
      inputs: inputs,
      outputs: outputs,
      fee,
      size: tx.byteLength(),
      vsize: tx.virtualSize(),
    }
  }

  /**
   * Assina uma transação Taproot
   */
  signTaprootTransaction(
    psbt: bitcoin.Psbt,
    privateKey: string,
    inputIndex: number
  ): bitcoin.Psbt {
    const keyPair = ECPair.fromWIF(privateKey, this.network)
    psbt.signInput(inputIndex, keyPair)
    return psbt
  }

  /**
   * Calcula a taxa estimada para uma transação Taproot
   */
  estimateTaprootFee(
    numInputs: number,
    numOutputs: number,
    feeRate: number = 1
  ): number {
    // Taproot inputs são menores que P2WPKH
    const inputSize = 57.5 // bytes por input Taproot
    const outputSize = 43   // bytes por output P2TR
    const overhead = 10.5   // overhead da transação
    
    const estimatedSize = Math.ceil(
      overhead + (numInputs * inputSize) + (numOutputs * outputSize)
    )
    
    return Math.ceil(estimatedSize * feeRate)
  }

  /**
   * Valida se um endereço é Taproot válido
   */
  isTaprootAddress(address: string): boolean {
    try {
      const decoded = bitcoin.address.fromBech32(address)
      return decoded.version === 1 && decoded.data.length === 32
    } catch {
      return false
    }
  }

  /**
   * Converte chave pública para endereço Taproot
   */
  publicKeyToTaprootAddress(publicKey: string): string {
    const pubKeyBuffer = Buffer.from(publicKey, 'hex')
    const internalKey = pubKeyBuffer.subarray(1) // Remove prefixo

    const { address } = bitcoin.payments.p2tr({
      internalPubkey: internalKey,
      network: this.network,
    })

    if (!address) {
      throw new Error('Failed to convert public key to Taproot address')
    }

    return address
  }
}