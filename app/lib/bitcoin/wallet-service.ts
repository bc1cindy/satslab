import * as bitcoin from 'bitcoinjs-lib'
import { ECPairFactory } from 'ecpair'
import * as ecc from '@bitcoinerlab/secp256k1'
import { MempoolAPI } from './mempool-api'

// Initialize ECPair with secp256k1 implementation
const ECPair = ECPairFactory(ecc)

// SIGNET network configuration
export const SIGNET_NETWORK = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}

export interface SignetWallet {
  address: string
  privateKey: string
  publicKey: string
  wif: string
  network: typeof SIGNET_NETWORK
}

export interface WalletBalance {
  confirmed: number
  unconfirmed: number
  total: number
}

/**
 * Bitcoin Wallet Service for SIGNET network
 * Provides wallet generation, validation, and balance checking functionality
 */
export class WalletService {
  private static readonly MEMPOOL_API_BASE = 'https://mempool.space/signet/api'

  /**
   * Generates a new SIGNET wallet with P2WPKH address
   * @returns {SignetWallet} New wallet with address, private key, and public key
   */
  static async generateSignetWallet(): Promise<SignetWallet> {
    try {
      // Generate a random key pair
      const keyPair = ECPair.makeRandom({ network: SIGNET_NETWORK })
      
      if (!keyPair.privateKey) {
        throw new Error('Failed to generate private key')
      }

      // Create P2WPKH address (native segwit - bech32)
      const { address } = bitcoin.payments.p2wpkh({ 
        pubkey: keyPair.publicKey, 
        network: SIGNET_NETWORK 
      })

      if (!address) {
        throw new Error('Failed to generate address')
      }

      return {
        address,
        privateKey: keyPair.privateKey.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
        wif: keyPair.toWIF(),
        network: SIGNET_NETWORK
      }
    } catch (error) {
      console.error('Error generating SIGNET wallet:', error)
      throw new Error(`Failed to generate wallet: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validates a Bitcoin address for SIGNET network
   * @param {string} address - The address to validate
   * @returns {boolean} True if valid SIGNET address
   */
  static validateAddress(address: string): boolean {
    try {
      // Check if it's a valid bitcoin address
      bitcoin.address.toOutputScript(address, SIGNET_NETWORK)
      
      // Additional check for SIGNET-specific prefixes
      const isTestnetBech32 = address.startsWith('tb1')
      const isTestnetLegacy = address.startsWith('m') || address.startsWith('n')
      const isTestnetScript = address.startsWith('2')
      
      return isTestnetBech32 || isTestnetLegacy || isTestnetScript
    } catch (error) {
      return false
    }
  }

  /**
   * Gets the balance for a given address using mempool.space API
   * @param {string} address - The address to check balance for
   * @returns {Promise<WalletBalance>} Balance in satoshis
   */
  static async getBalance(address: string): Promise<WalletBalance> {
    try {
      if (!this.validateAddress(address)) {
        throw new Error('Invalid address format')
      }

      const response = await fetch(`${this.MEMPOOL_API_BASE}/address/${address}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // Address not found, return zero balance
          return {
            confirmed: 0,
            unconfirmed: 0,
            total: 0
          }
        }
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        confirmed: data.chain_stats?.funded_txo_sum || 0,
        unconfirmed: data.mempool_stats?.funded_txo_sum || 0,
        total: (data.chain_stats?.funded_txo_sum || 0) + (data.mempool_stats?.funded_txo_sum || 0)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generates a BIP39 mnemonic phrase (12 words)
   * @returns {string} 12-word mnemonic phrase
   */
  static generateMnemonic(): string {
    // For now, we'll generate a simple word list
    // In production, you'd use a proper BIP39 library
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
      'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'agent',
      'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album'
    ]
    
    const mnemonic = []
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * words.length)
      mnemonic.push(words[randomIndex])
    }
    
    return mnemonic.join(' ')
  }

  /**
   * Imports a wallet from WIF (Wallet Import Format) private key
   * @param {string} wif - The WIF private key
   * @returns {SignetWallet} Imported wallet
   */
  static async importFromWIF(wif: string): Promise<SignetWallet> {
    try {
      const keyPair = ECPair.fromWIF(wif, SIGNET_NETWORK)
      
      if (!keyPair.privateKey) {
        throw new Error('Invalid WIF format')
      }

      const { address } = bitcoin.payments.p2wpkh({ 
        pubkey: keyPair.publicKey, 
        network: SIGNET_NETWORK 
      })

      if (!address) {
        throw new Error('Failed to generate address from WIF')
      }

      return {
        address,
        privateKey: keyPair.privateKey.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
        wif: keyPair.toWIF(),
        network: SIGNET_NETWORK
      }
    } catch (error) {
      console.error('Error importing wallet from WIF:', error)
      throw new Error(`Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validates a private key format
   * @param {string} privateKey - The private key to validate (hex format)
   * @returns {boolean} True if valid private key
   */
  static validatePrivateKey(privateKey: string): boolean {
    try {
      // Check if it's a valid hex string of correct length
      if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
        return false
      }
      
      // Try to create ECPair from the private key
      const keyBuffer = Buffer.from(privateKey, 'hex')
      const keyPair = ECPair.fromPrivateKey(keyBuffer, { network: SIGNET_NETWORK })
      
      return keyPair.privateKey !== null
    } catch (error) {
      return false
    }
  }

  /**
   * Converts satoshis to BTC format
   * @param {number} satoshis - Amount in satoshis
   * @returns {string} Formatted BTC amount
   */
  static formatSatoshis(satoshis: number): string {
    return (satoshis / 100000000).toFixed(8) + ' sBTC'
  }

  /**
   * Converts BTC to satoshis
   * @param {number} btc - Amount in BTC
   * @returns {number} Amount in satoshis
   */
  static btcToSatoshis(btc: number): number {
    return Math.round(btc * 100000000)
  }

  /**
   * Gets transaction history for an address
   * @param {string} address - The address to get history for
   * @param {number} limit - Maximum number of transactions to return
   * @returns {Promise<any[]>} Array of transactions
   */
  static async getTransactionHistory(address: string, limit: number = 25): Promise<any[]> {
    try {
      if (!this.validateAddress(address)) {
        throw new Error('Invalid address format')
      }

      const response = await fetch(`${this.MEMPOOL_API_BASE}/address/${address}/txs`)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const transactions = await response.json()
      return transactions.slice(0, limit)
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      throw new Error(`Failed to get transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}