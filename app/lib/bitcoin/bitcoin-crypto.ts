import * as bitcoin from 'bitcoinjs-lib'
import { ECPairFactory } from 'ecpair'
import * as ecc from '@bitcoinerlab/secp256k1'
import { SIGNET_NETWORK } from './wallet-service'

// Initialize ECPair with secp256k1 implementation
const ECPair = ECPairFactory(ecc)

export interface BitcoinKeyPair {
  privateKey: string
  publicKey: string
  address: string
  network: typeof SIGNET_NETWORK
  wif: string
  compressed: boolean
}

export interface SignatureResult {
  signature: string
  recovery: number
  messageHash: string
}

/**
 * Real Bitcoin cryptographic functions for SIGNET network
 * Replaces the mock implementation with actual Bitcoin operations
 */
export class BitcoinCrypto {
  /**
   * Generates a new Bitcoin key pair for SIGNET network
   * @param {boolean} compressed - Whether to use compressed public key (default: true)
   * @returns {BitcoinKeyPair} New key pair with all relevant information
   */
  static generateKeyPair(compressed: boolean = true): BitcoinKeyPair {
    try {
      // Generate random key pair
      const keyPair = ECPair.makeRandom({ 
        network: SIGNET_NETWORK,
        compressed
      })
      
      if (!keyPair.privateKey || !keyPair.publicKey) {
        throw new Error('Failed to generate key pair')
      }

      // Create P2WPKH address (native segwit)
      const { address } = bitcoin.payments.p2wpkh({ 
        pubkey: keyPair.publicKey, 
        network: SIGNET_NETWORK 
      })

      if (!address) {
        throw new Error('Failed to generate address from key pair')
      }

      return {
        privateKey: keyPair.privateKey.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
        address,
        network: SIGNET_NETWORK,
        wif: keyPair.toWIF(),
        compressed: keyPair.compressed
      }
    } catch (error) {
      console.error('Error generating key pair:', error)
      throw new Error(`Failed to generate key pair: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Creates a key pair from a WIF (Wallet Import Format) private key
   * @param {string} wif - WIF private key
   * @returns {BitcoinKeyPair} Key pair information
   */
  static keyPairFromWIF(wif: string): BitcoinKeyPair {
    try {
      const keyPair = ECPair.fromWIF(wif, SIGNET_NETWORK)
      
      if (!keyPair.privateKey || !keyPair.publicKey) {
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
        privateKey: keyPair.privateKey.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
        address,
        network: SIGNET_NETWORK,
        wif: keyPair.toWIF(),
        compressed: keyPair.compressed
      }
    } catch (error) {
      console.error('Error creating key pair from WIF:', error)
      throw new Error(`Failed to create key pair from WIF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Creates a key pair from a hex private key
   * @param {string} privateKeyHex - Private key in hex format
   * @param {boolean} compressed - Whether to use compressed public key
   * @returns {BitcoinKeyPair} Key pair information
   */
  static keyPairFromPrivateKey(privateKeyHex: string, compressed: boolean = true): BitcoinKeyPair {
    try {
      const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex')
      const keyPair = ECPair.fromPrivateKey(privateKeyBuffer, { 
        network: SIGNET_NETWORK,
        compressed
      })
      
      if (!keyPair.privateKey || !keyPair.publicKey) {
        throw new Error('Invalid private key format')
      }

      const { address } = bitcoin.payments.p2wpkh({ 
        pubkey: keyPair.publicKey, 
        network: SIGNET_NETWORK 
      })

      if (!address) {
        throw new Error('Failed to generate address from private key')
      }

      return {
        privateKey: keyPair.privateKey.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
        address,
        network: SIGNET_NETWORK,
        wif: keyPair.toWIF(),
        compressed: keyPair.compressed
      }
    } catch (error) {
      console.error('Error creating key pair from private key:', error)
      throw new Error(`Failed to create key pair from private key: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validates a private key format
   * @param {string} privateKey - Private key in hex format
   * @returns {boolean} True if valid private key
   */
  static validatePrivateKey(privateKey: string): boolean {
    try {
      // Check if it's a valid hex string of correct length (64 chars = 32 bytes)
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
   * Validates a WIF private key format
   * @param {string} wif - WIF private key
   * @returns {boolean} True if valid WIF
   */
  static validateWIF(wif: string): boolean {
    try {
      const keyPair = ECPair.fromWIF(wif, SIGNET_NETWORK)
      return keyPair.privateKey !== null
    } catch (error) {
      return false
    }
  }

  /**
   * Signs a message with Bitcoin message signing
   * @param {string} message - The message to sign
   * @param {string} privateKey - Private key in hex format
   * @returns {string} Base64 encoded signature
   */
  static signMessage(message: string, privateKey: string): string {
    try {
      const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network: SIGNET_NETWORK })
      
      if (!keyPair.privateKey) {
        throw new Error('Invalid private key')
      }

      // Create message hash
      const messageBuffer = Buffer.from(message, 'utf8')
      const messageHash = bitcoin.crypto.hash256(
        Buffer.concat([
          Buffer.from(SIGNET_NETWORK.messagePrefix, 'utf8'),
          Buffer.from([messageBuffer.length]),
          messageBuffer
        ])
      )

      // Sign the hash
      const signature = keyPair.sign(messageHash)
      
      return signature.toString('base64')
    } catch (error) {
      console.error('Error signing message:', error)
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Verifies a message signature
   * @param {string} message - The original message
   * @param {string} signature - Base64 encoded signature
   * @param {string} publicKey - Public key in hex format
   * @returns {boolean} True if signature is valid
   */
  static verifySignature(message: string, signature: string, publicKey: string): boolean {
    try {
      const keyPair = ECPair.fromPublicKey(Buffer.from(publicKey, 'hex'), { network: SIGNET_NETWORK })
      
      // Create message hash
      const messageBuffer = Buffer.from(message, 'utf8')
      const messageHash = bitcoin.crypto.hash256(
        Buffer.concat([
          Buffer.from(SIGNET_NETWORK.messagePrefix, 'utf8'),
          Buffer.from([messageBuffer.length]),
          messageBuffer
        ])
      )

      // Verify signature
      const signatureBuffer = Buffer.from(signature, 'base64')
      return keyPair.verify(messageHash, signatureBuffer)
    } catch (error) {
      return false
    }
  }

  /**
   * Creates a recoverable signature for a message
   * @param {string} message - The message to sign
   * @param {string} privateKey - Private key in hex format
   * @returns {SignatureResult} Signature with recovery information
   */
  static signMessageRecoverable(message: string, privateKey: string): SignatureResult {
    try {
      const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network: SIGNET_NETWORK })
      
      if (!keyPair.privateKey) {
        throw new Error('Invalid private key')
      }

      // Create message hash
      const messageBuffer = Buffer.from(message, 'utf8')
      const messagePrefix = Buffer.from(SIGNET_NETWORK.messagePrefix, 'utf8')
      const messageHash = bitcoin.crypto.hash256(
        Buffer.concat([
          messagePrefix,
          Buffer.from([messageBuffer.length]),
          messageBuffer
        ])
      )

      // Sign with recovery
      const signature = keyPair.sign(messageHash)
      
      return {
        signature: signature.toString('base64'),
        recovery: 0, // Bitcoin Core doesn't use recovery ID in standard message signing
        messageHash: messageHash.toString('hex')
      }
    } catch (error) {
      console.error('Error signing message with recovery:', error)
      throw new Error(`Failed to sign message with recovery: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Derives a public key from a private key
   * @param {string} privateKey - Private key in hex format
   * @param {boolean} compressed - Whether to use compressed format
   * @returns {string} Public key in hex format
   */
  static derivePublicKey(privateKey: string, compressed: boolean = true): string {
    try {
      const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { 
        network: SIGNET_NETWORK,
        compressed
      })
      
      if (!keyPair.publicKey) {
        throw new Error('Failed to derive public key')
      }

      return keyPair.publicKey.toString('hex')
    } catch (error) {
      console.error('Error deriving public key:', error)
      throw new Error(`Failed to derive public key: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Derives an address from a public key
   * @param {string} publicKey - Public key in hex format
   * @param {'p2pkh' | 'p2wpkh' | 'p2sh'} addressType - Type of address to generate
   * @returns {string} Bitcoin address
   */
  static deriveAddress(publicKey: string, addressType: 'p2pkh' | 'p2wpkh' | 'p2sh' = 'p2wpkh'): string {
    try {
      const pubkeyBuffer = Buffer.from(publicKey, 'hex')
      
      let payment
      switch (addressType) {
        case 'p2pkh':
          payment = bitcoin.payments.p2pkh({ pubkey: pubkeyBuffer, network: SIGNET_NETWORK })
          break
        case 'p2wpkh':
          payment = bitcoin.payments.p2wpkh({ pubkey: pubkeyBuffer, network: SIGNET_NETWORK })
          break
        case 'p2sh':
          // P2SH-P2WPKH (wrapped segwit)
          const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: pubkeyBuffer, network: SIGNET_NETWORK })
          payment = bitcoin.payments.p2sh({ redeem: p2wpkh, network: SIGNET_NETWORK })
          break
        default:
          throw new Error(`Unsupported address type: ${addressType}`)
      }

      if (!payment.address) {
        throw new Error('Failed to derive address')
      }

      return payment.address
    } catch (error) {
      console.error('Error deriving address:', error)
      throw new Error(`Failed to derive address: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Converts a private key from hex to WIF format
   * @param {string} privateKeyHex - Private key in hex format
   * @param {boolean} compressed - Whether the key is compressed
   * @returns {string} WIF private key
   */
  static privateKeyToWIF(privateKeyHex: string, compressed: boolean = true): string {
    try {
      const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKeyHex, 'hex'), { 
        network: SIGNET_NETWORK,
        compressed
      })
      
      return keyPair.toWIF()
    } catch (error) {
      console.error('Error converting private key to WIF:', error)
      throw new Error(`Failed to convert private key to WIF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Converts a WIF private key to hex format
   * @param {string} wif - WIF private key
   * @returns {string} Private key in hex format
   */
  static wifToPrivateKey(wif: string): string {
    try {
      const keyPair = ECPair.fromWIF(wif, SIGNET_NETWORK)
      
      if (!keyPair.privateKey) {
        throw new Error('Invalid WIF format')
      }

      return keyPair.privateKey.toString('hex')
    } catch (error) {
      console.error('Error converting WIF to private key:', error)
      throw new Error(`Failed to convert WIF to private key: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generates a random private key
   * @returns {string} Random private key in hex format
   */
  static generateRandomPrivateKey(): string {
    try {
      const keyPair = ECPair.makeRandom({ network: SIGNET_NETWORK })
      
      if (!keyPair.privateKey) {
        throw new Error('Failed to generate random private key')
      }

      return keyPair.privateKey.toString('hex')
    } catch (error) {
      console.error('Error generating random private key:', error)
      throw new Error(`Failed to generate random private key: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Checks if a public key is compressed
   * @param {string} publicKey - Public key in hex format
   * @returns {boolean} True if compressed
   */
  static isCompressedPublicKey(publicKey: string): boolean {
    try {
      const pubkeyBuffer = Buffer.from(publicKey, 'hex')
      return pubkeyBuffer.length === 33 && (pubkeyBuffer[0] === 0x02 || pubkeyBuffer[0] === 0x03)
    } catch (error) {
      return false
    }
  }

  /**
   * Compresses a public key
   * @param {string} publicKey - Uncompressed public key in hex format
   * @returns {string} Compressed public key in hex format
   */
  static compressPublicKey(publicKey: string): string {
    try {
      const pubkeyBuffer = Buffer.from(publicKey, 'hex')
      
      if (pubkeyBuffer.length === 33) {
        return publicKey // Already compressed
      }
      
      if (pubkeyBuffer.length !== 65) {
        throw new Error('Invalid public key length')
      }

      // Extract x coordinate and y coordinate
      const x = pubkeyBuffer.slice(1, 33)
      const y = pubkeyBuffer.slice(33, 65)
      
      // Check if y is even or odd
      const yIsEven = y[31] % 2 === 0
      
      // Create compressed public key
      const compressed = Buffer.concat([
        Buffer.from([yIsEven ? 0x02 : 0x03]),
        x
      ])
      
      return compressed.toString('hex')
    } catch (error) {
      console.error('Error compressing public key:', error)
      throw new Error(`Failed to compress public key: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export the network configuration
export { SIGNET_NETWORK }

// Export legacy functions for backward compatibility
export function generateKeyPair(): BitcoinKeyPair {
  return BitcoinCrypto.generateKeyPair()
}

export function keyPairFromWIF(wif: string): BitcoinKeyPair {
  return BitcoinCrypto.keyPairFromWIF(wif)
}

export function validatePrivateKey(privateKey: string): boolean {
  return BitcoinCrypto.validatePrivateKey(privateKey)
}

export function signMessage(message: string, privateKey: string): string {
  return BitcoinCrypto.signMessage(message, privateKey)
}

export function verifySignature(message: string, signature: string, publicKey: string): boolean {
  return BitcoinCrypto.verifySignature(message, signature, publicKey)
}