import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import ECPairFactory from 'ecpair'
import { SIGNET_NETWORK } from './crypto'
import { TaprootService } from './taproot-service'

bitcoin.initEccLib(ecc)
const ECPair = ECPairFactory(ecc)

export interface OrdinalInscription {
  inscriptionId: string
  content: string
  contentType: string
  owner: string
  fee: number
  txId: string
  vout: number
}

export interface BadgeNFT {
  badge: string
  user_id: string
  timestamp: number
  network: string
  description?: string
  rarity?: 'common' | 'rare' | 'legendary'
  requirements?: string[]
  icon?: string
  color?: string
}

export interface OrdinalUTXO {
  txid: string
  vout: number
  value: number
  address: string
  inscriptionId?: string
}

export class OrdinalsService {
  private network: bitcoin.Network
  private taprootService: TaprootService

  constructor(network: bitcoin.Network = SIGNET_NETWORK) {
    this.network = network
    this.taprootService = new TaprootService(network)
  }

  /**
   * Cria uma inscrição Ordinal com dados arbitrários
   */
  async createOrdinalInscription(
    content: string,
    contentType: string,
    privateKey: string,
    utxos: OrdinalUTXO[],
    feeRate: number = 1
  ): Promise<OrdinalInscription> {
    const keyPair = ECPair.fromWIF(privateKey, this.network)
    const internalKey = keyPair.publicKey.slice(1)
    
    // Cria o script de inscrição
    const inscriptionScript = this.createInscriptionScript(content, contentType)
    
    // Cria a transação commit (pré-revela)
    const commitPsbt = new bitcoin.Psbt({ network: this.network })
    
    // Adiciona UTXOs como inputs
    let totalInput = 0
    for (const utxo of utxos) {
      const { output } = bitcoin.payments.p2tr({
        internalPubkey: internalKey,
        network: this.network,
      })

      commitPsbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: output!,
          value: utxo.value,
        },
        tapInternalKey: internalKey,
      })
      totalInput += utxo.value
    }

    // Calcula taxas
    const estimatedFee = this.estimateInscriptionFee(content, feeRate)
    const changeAmount = totalInput - estimatedFee - 546 // 546 sats mínimo para output
    
    // Adiciona output para inscrição
    const { address: inscriptionAddress } = bitcoin.payments.p2tr({
      internalPubkey: internalKey,
      scriptTree: {
        output: inscriptionScript,
      },
      network: this.network,
    })

    commitPsbt.addOutput({
      address: inscriptionAddress!,
      value: 546,
    })

    // Adiciona change se necessário
    if (changeAmount > 546) {
      const { address: changeAddress } = bitcoin.payments.p2tr({
        internalPubkey: internalKey,
        network: this.network,
      })

      commitPsbt.addOutput({
        address: changeAddress!,
        value: changeAmount,
      })
    }

    // Assina a transação commit
    for (let i = 0; i < utxos.length; i++) {
      commitPsbt.signInput(i, keyPair)
    }

    commitPsbt.finalizeAllInputs()
    const commitTx = commitPsbt.extractTransaction()

    // Cria a transação reveal (mostra a inscrição)
    const revealPsbt = new bitcoin.Psbt({ network: this.network })
    
    revealPsbt.addInput({
      hash: commitTx.getId(),
      index: 0,
      witnessUtxo: {
        script: Buffer.from(inscriptionAddress!), // Simplificado
        value: 546,
      },
      tapInternalKey: internalKey,
    })

    // Output para o proprietário final
    const { address: ownerAddress } = bitcoin.payments.p2tr({
      internalPubkey: internalKey,
      network: this.network,
    })

    revealPsbt.addOutput({
      address: ownerAddress!,
      value: 546,
    })

    // Assina reveal
    revealPsbt.signInput(0, keyPair)
    revealPsbt.finalizeAllInputs()
    const revealTx = revealPsbt.extractTransaction()

    const inscriptionId = `${revealTx.getId()}:0`

    return {
      inscriptionId,
      content,
      contentType,
      owner: ownerAddress!,
      fee: estimatedFee,
      txId: revealTx.getId(),
      vout: 0,
    }
  }

  /**
   * Cria um NFT Badge como Ordinal
   */
  async mintBadgeNFT(
    badgeData: BadgeNFT,
    privateKey: string,
    utxos: OrdinalUTXO[],
    feeRate: number = 1
  ): Promise<OrdinalInscription> {
    const badgeJson = JSON.stringify({
      ...badgeData,
      timestamp: Date.now(),
      network: this.network === SIGNET_NETWORK ? 'signet' : 'mainnet',
    })

    return this.createOrdinalInscription(
      badgeJson,
      'application/json',
      privateKey,
      utxos,
      feeRate
    )
  }

  /**
   * Verifica a propriedade de um Ordinal
   */
  async verifyOrdinalOwnership(
    inscriptionId: string,
    address: string
  ): Promise<boolean> {
    // Em um ambiente real, isso consultaria um indexador de Ordinals
    // Para demonstração, assumimos que o endereço é válido
    try {
      const [txid, vout] = inscriptionId.split(':')
      return txid.length === 64 && parseInt(vout) >= 0
    } catch {
      return false
    }
  }

  /**
   * Obtém metadata de um Ordinal
   */
  async getOrdinalMetadata(inscriptionId: string): Promise<any> {
    // Em um ambiente real, isso consultaria um indexador de Ordinals
    // Para demonstração, retornamos dados mock
    const [txid, vout] = inscriptionId.split(':')
    
    if (txid.length !== 64) {
      throw new Error('Invalid inscription ID')
    }

    return {
      inscriptionId,
      contentType: 'application/json',
      contentLength: 0,
      timestamp: Date.now(),
      genesisHeight: 0,
      genesisTransaction: txid,
      location: `${txid}:${vout}:0`,
    }
  }

  /**
   * Cria script de inscrição para Ordinals
   */
  private createInscriptionScript(content: string, contentType: string): Buffer {
    const contentBuffer = Buffer.from(content, 'utf8')
    const contentTypeBuffer = Buffer.from(contentType, 'utf8')
    
    // Simplified inscription script
    return bitcoin.script.compile([
      bitcoin.opcodes.OP_FALSE,
      bitcoin.opcodes.OP_IF,
      Buffer.from('ord', 'utf8'),
      bitcoin.opcodes.OP_1,
      contentTypeBuffer,
      bitcoin.opcodes.OP_0,
      contentBuffer,
      bitcoin.opcodes.OP_ENDIF,
    ])
  }

  /**
   * Estima a taxa para uma inscrição baseada no tamanho do conteúdo
   */
  estimateInscriptionFee(content: string, feeRate: number = 1): number {
    const contentSize = Buffer.from(content, 'utf8').length
    const baseTransactionSize = 150 // bytes base
    const inscriptionOverhead = 50 // bytes overhead da inscrição
    
    const totalSize = baseTransactionSize + inscriptionOverhead + contentSize
    return Math.ceil(totalSize * feeRate)
  }

  /**
   * Valida se um ID de inscrição é válido
   */
  isValidInscriptionId(inscriptionId: string): boolean {
    try {
      const [txid, vout] = inscriptionId.split(':')
      return txid.length === 64 && !isNaN(parseInt(vout))
    } catch {
      return false
    }
  }

  /**
   * Gera dados para um badge NFT
   */
  generateBadgeData(badgeName: string, userPublicKey: string): BadgeNFT {
    return {
      badge: badgeName,
      user_id: userPublicKey,
      timestamp: Date.now(),
      network: this.network === SIGNET_NETWORK ? 'signet' : 'mainnet',
    }
  }
}