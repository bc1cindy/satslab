import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import { SIGNET_NETWORK } from './crypto'

bitcoin.initEccLib(ecc)
const BIP32 = bip32.BIP32Factory(ecc)

export interface HDWallet {
  mnemonic: string
  seed: Buffer
  masterKey: bip32.BIP32Interface
  network: bitcoin.Network
  fingerprint: string
}

export interface DerivedAddress {
  address: string
  privateKey: string
  publicKey: string
  path: string
  index: number
}

export interface DerivationPath {
  purpose: number
  coinType: number
  account: number
  change: number
  addressIndex: number
}

export class HDWalletService {
  private network: bitcoin.Network

  constructor(network: bitcoin.Network = SIGNET_NETWORK) {
    this.network = network
  }

  /**
   * Gera uma nova carteira HD
   */
  generateHDWallet(mnemonic?: string): HDWallet {
    const mnemonicPhrase = mnemonic || bip39.generateMnemonic() // 12 palavras
    
    if (!bip39.validateMnemonic(mnemonicPhrase)) {
      throw new Error('Invalid mnemonic phrase')
    }

    const seed = bip39.mnemonicToSeedSync(mnemonicPhrase)
    const masterKey = BIP32.fromSeed(seed, this.network)
    const fingerprint = Buffer.from(masterKey.fingerprint).toString('hex')

    return {
      mnemonic: mnemonicPhrase,
      seed: Buffer.from(seed),
      masterKey,
      network: this.network,
      fingerprint,
    }
  }

  /**
   * Deriva um endereço usando um path específico
   */
  deriveAddress(
    masterKey: bip32.BIP32Interface,
    path: string,
    addressType: 'p2wpkh' | 'p2sh' | 'p2tr' = 'p2wpkh'
  ): DerivedAddress {
    const derivedKey = masterKey.derivePath(path)
    
    if (!derivedKey.privateKey) {
      throw new Error('Failed to derive private key')
    }

    let address: string
    
    switch (addressType) {
      case 'p2wpkh':
        const p2wpkh = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(derivedKey.publicKey),
          network: this.network,
        })
        if (!p2wpkh.address) {
          throw new Error('Failed to generate P2WPKH address')
        }
        address = p2wpkh.address
        break
        
      case 'p2sh':
        const p2sh = bitcoin.payments.p2sh({
          redeem: bitcoin.payments.p2wpkh({
            pubkey: Buffer.from(derivedKey.publicKey),
            network: this.network,
          }),
          network: this.network,
        })
        if (!p2sh.address) {
          throw new Error('Failed to generate P2SH address')
        }
        address = p2sh.address
        break
        
      case 'p2tr':
        const internalKey = Buffer.from(derivedKey.publicKey).slice(1)
        const p2tr = bitcoin.payments.p2tr({
          internalPubkey: internalKey,
          network: this.network,
        })
        if (!p2tr.address) {
          throw new Error('Failed to generate P2TR address')
        }
        address = p2tr.address
        break
        
      default:
        throw new Error(`Unsupported address type: ${addressType}`)
    }

    // Extrai o índice do path
    const pathParts = path.split('/')
    const index = parseInt(pathParts[pathParts.length - 1])

    return {
      address,
      privateKey: derivedKey.toWIF(),
      publicKey: Buffer.from(derivedKey.publicKey).toString('hex'),
      path,
      index,
    }
  }

  /**
   * Gera múltiplos endereços de recebimento
   */
  generateReceiveAddresses(
    masterKey: bip32.BIP32Interface,
    count: number,
    startIndex: number = 0,
    addressType: 'p2wpkh' | 'p2sh' | 'p2tr' = 'p2wpkh'
  ): DerivedAddress[] {
    const addresses: DerivedAddress[] = []
    
    for (let i = 0; i < count; i++) {
      const index = startIndex + i
      const path = this.getDerivationPath(44, this.getCoinType(), 0, 0, index)
      const address = this.deriveAddress(masterKey, path, addressType)
      addresses.push(address)
    }
    
    return addresses
  }

  /**
   * Gera múltiplos endereços de troco
   */
  generateChangeAddresses(
    masterKey: bip32.BIP32Interface,
    count: number,
    startIndex: number = 0,
    addressType: 'p2wpkh' | 'p2sh' | 'p2tr' = 'p2wpkh'
  ): DerivedAddress[] {
    const addresses: DerivedAddress[] = []
    
    for (let i = 0; i < count; i++) {
      const index = startIndex + i
      const path = this.getDerivationPath(44, this.getCoinType(), 0, 1, index)
      const address = this.deriveAddress(masterKey, path, addressType)
      addresses.push(address)
    }
    
    return addresses
  }

  /**
   * Constrói um path de derivação BIP44
   */
  getDerivationPath(
    purpose: number,
    coinType: number,
    account: number,
    change: number = 0,
    addressIndex: number = 0
  ): string {
    return `m/${purpose}'/${coinType}'/${account}'/${change}/${addressIndex}`
  }

  /**
   * Parseia um path de derivação
   */
  parseDerivationPath(path: string): DerivationPath {
    const parts = path.split('/')
    if (parts.length !== 6 || parts[0] !== 'm') {
      throw new Error('Invalid derivation path format')
    }

    return {
      purpose: parseInt(parts[1].replace("'", "")),
      coinType: parseInt(parts[2].replace("'", "")),
      account: parseInt(parts[3].replace("'", "")),
      change: parseInt(parts[4]),
      addressIndex: parseInt(parts[5]),
    }
  }

  /**
   * Valida um mnemônico
   */
  validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic)
  }

  /**
   * Restaura uma carteira HD a partir de um mnemônico
   */
  restoreHDWallet(mnemonic: string): HDWallet {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase')
    }

    return this.generateHDWallet(mnemonic)
  }

  /**
   * Obtém informações da carteira
   */
  getWalletInfo(wallet: HDWallet): {
    fingerprint: string
    publicKey: string
    chainCode: string
    depth: number
    index: number
  } {
    return {
      fingerprint: wallet.fingerprint,
      publicKey: Buffer.from(wallet.masterKey.publicKey).toString('hex'),
      chainCode: Buffer.from(wallet.masterKey.chainCode).toString('hex'),
      depth: wallet.masterKey.depth,
      index: wallet.masterKey.index,
    }
  }

  /**
   * Obtém o coin type baseado na rede
   */
  private getCoinType(): number {
    // 0 = Bitcoin mainnet
    // 1 = Bitcoin testnet/signet
    return this.network === bitcoin.networks.bitcoin ? 0 : 1
  }

  /**
   * Exporta chave pública estendida (xpub)
   */
  exportExtendedPublicKey(
    masterKey: bip32.BIP32Interface,
    path: string = "m/44'/1'/0'"
  ): string {
    const derivedKey = masterKey.derivePath(path)
    return derivedKey.neutered().toBase58()
  }

  /**
   * Exporta chave privada estendida (xprv)
   */
  exportExtendedPrivateKey(
    masterKey: bip32.BIP32Interface,
    path: string = "m/44'/1'/0'"
  ): string {
    const derivedKey = masterKey.derivePath(path)
    return derivedKey.toBase58()
  }

  /**
   * Importa chave estendida
   */
  importExtendedKey(extendedKey: string): bip32.BIP32Interface {
    try {
      return BIP32.fromBase58(extendedKey, this.network)
    } catch (error) {
      throw new Error(`Invalid extended key: ${error}`)
    }
  }

  /**
   * Gera endereços para diferentes propósitos BIP
   */
  generateBIP84Addresses(
    masterKey: bip32.BIP32Interface,
    count: number,
    startIndex: number = 0
  ): DerivedAddress[] {
    // BIP84 - Native SegWit (P2WPKH)
    const addresses: DerivedAddress[] = []
    
    for (let i = 0; i < count; i++) {
      const index = startIndex + i
      const path = this.getDerivationPath(84, this.getCoinType(), 0, 0, index)
      const address = this.deriveAddress(masterKey, path, 'p2wpkh')
      addresses.push(address)
    }
    
    return addresses
  }

  /**
   * Gera endereços Taproot BIP86
   */
  generateBIP86Addresses(
    masterKey: bip32.BIP32Interface,
    count: number,
    startIndex: number = 0
  ): DerivedAddress[] {
    // BIP86 - Taproot (P2TR)
    const addresses: DerivedAddress[] = []
    
    for (let i = 0; i < count; i++) {
      const index = startIndex + i
      const path = this.getDerivationPath(86, this.getCoinType(), 0, 0, index)
      const address = this.deriveAddress(masterKey, path, 'p2tr')
      addresses.push(address)
    }
    
    return addresses
  }

  /**
   * Encontra o próximo endereço não usado
   */
  async findNextUnusedAddress(
    masterKey: bip32.BIP32Interface,
    addressType: 'p2wpkh' | 'p2sh' | 'p2tr' = 'p2wpkh',
    maxGap: number = 20
  ): Promise<DerivedAddress> {
    // Em uma implementação real, isso verificaria o blockchain
    // Para demonstração, retornamos o primeiro endereço
    const path = this.getDerivationPath(44, this.getCoinType(), 0, 0, 0)
    return this.deriveAddress(masterKey, path, addressType)
  }
}