/**
 * Enterprise Cryptographic Implementation
 * Replaces crypto-mock with production-ready cryptography
 * Implements OWASP cryptographic best practices
 */

import * as bitcoin from 'bitcoinjs-lib'
import { ECPairFactory, ECPairInterface } from 'ecpair'
import * as ecc from '@bitcoinerlab/secp256k1'
import { createHash, createHmac, randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'crypto'

const ECPair = ECPairFactory(ecc)

// Network configurations
export const NETWORKS = {
  MAINNET: bitcoin.networks.bitcoin,
  TESTNET: bitcoin.networks.testnet,
  SIGNET: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  } as bitcoin.Network
}

export const SIGNET_NETWORK = NETWORKS.SIGNET

interface SecureKeyPair {
  privateKey: Buffer
  publicKey: Buffer
  wif: string
  compressed: boolean
  network: bitcoin.Network
}

interface EncryptedData {
  iv: string
  authTag: string
  encrypted: string
}

export class SecureCrypto {
  private static readonly PBKDF2_ITERATIONS = 100000
  private static readonly KEY_DERIVATION_SALT_LENGTH = 32
  private static readonly ENCRYPTION_KEY_LENGTH = 32
  private static readonly IV_LENGTH = 16
  private static readonly AUTH_TAG_LENGTH = 16

  /**
   * Generate cryptographically secure random key pair
   */
  static generateKeyPair(network: bitcoin.Network = SIGNET_NETWORK): SecureKeyPair {
    const keyPair = ECPair.makeRandom({ network, compressed: true })
    
    if (!keyPair.privateKey) {
      throw new Error('Failed to generate private key')
    }

    return {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      wif: keyPair.toWIF(),
      compressed: true,
      network
    }
  }

  /**
   * Import key pair from WIF with validation
   */
  static keyPairFromWIF(wif: string, network: bitcoin.Network = SIGNET_NETWORK): SecureKeyPair {
    try {
      const keyPair = ECPair.fromWIF(wif, network)
      
      if (!keyPair.privateKey) {
        throw new Error('Invalid WIF: No private key')
      }

      // Additional validation
      this.validateKeyPair(keyPair, network)

      return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        wif: keyPair.toWIF(),
        compressed: keyPair.compressed ?? true,
        network
      }
    } catch (error) {
      throw new Error(`Invalid WIF format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validate private key with comprehensive checks
   */
  static validatePrivateKey(privateKey: string, network: bitcoin.Network = SIGNET_NETWORK): boolean {
    try {
      // Check WIF format
      if (privateKey.length < 51 || privateKey.length > 52) {
        return false
      }

      // Attempt to create key pair
      const keyPair = ECPair.fromWIF(privateKey, network)
      
      // Validate key pair properties
      if (!keyPair.privateKey || !keyPair.publicKey) {
        return false
      }

      // Validate private key is in valid range (1 to n-1 where n is curve order)
      const privateKeyBigInt = BigInt('0x' + keyPair.privateKey.toString('hex'))
      const curveOrder = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141')
      
      if (privateKeyBigInt <= BigInt(0) || privateKeyBigInt >= curveOrder) {
        return false
      }

      // Additional validation - verify we can derive the same public key
      const derivedPublicKey = ecc.pointFromScalar(keyPair.privateKey, true)
      if (!derivedPublicKey || !keyPair.publicKey.equals(Buffer.from(derivedPublicKey))) {
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * Create secure Bitcoin message signature
   */
  static signMessage(message: string, privateKey: string, network: bitcoin.Network = SIGNET_NETWORK): string {
    try {
      const keyPair = this.keyPairFromWIF(privateKey, network)
      
      // Create deterministic message hash
      const messageHash = this.createSecureMessageHash(message)
      
      // Sign with RFC 6979 deterministic nonce
      const signature = ecc.sign(messageHash, keyPair.privateKey)
      
      return Buffer.from(signature).toString('hex')
    } catch (error) {
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Verify Bitcoin message signature with timing attack protection
   */
  static async verifySignature(
    message: string, 
    signature: string, 
    publicKey: string | Buffer
  ): Promise<boolean> {
    const startTime = Date.now()
    
    try {
      const messageHash = this.createSecureMessageHash(message)
      const signatureBuffer = Buffer.from(signature, 'hex')
      const publicKeyBuffer = typeof publicKey === 'string' ? Buffer.from(publicKey, 'hex') : publicKey
      
      // Validate signature length
      if (signatureBuffer.length !== 64) {
        return false
      }
      
      // Validate public key
      if (!this.validatePublicKey(publicKeyBuffer)) {
        return false
      }
      
      // Verify signature
      const isValid = ecc.verify(messageHash, publicKeyBuffer, signatureBuffer)
      
      return isValid
    } catch {
      return false
    } finally {
      // Constant-time execution to prevent timing attacks
      const elapsed = Date.now() - startTime
      const minDelay = 10 // minimum 10ms
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed))
      }
    }
  }

  /**
   * Encrypt sensitive data with AES-256-GCM
   */
  static encryptSensitiveData(data: string, password: string): EncryptedData {
    try {
      const salt = randomBytes(this.KEY_DERIVATION_SALT_LENGTH)
      const key = pbkdf2Sync(password, salt, this.PBKDF2_ITERATIONS, this.ENCRYPTION_KEY_LENGTH, 'sha256')
      
      const iv = randomBytes(this.IV_LENGTH)
      const cipher = createCipheriv('aes-256-gcm', key, iv)
      
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const authTag = cipher.getAuthTag()
      
      return {
        iv: Buffer.concat([salt, iv]).toString('hex'),
        authTag: authTag.toString('hex'),
        encrypted
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Decrypt sensitive data with AES-256-GCM
   */
  static decryptSensitiveData(encryptedData: EncryptedData, password: string): string {
    try {
      const ivBuffer = Buffer.from(encryptedData.iv, 'hex')
      const salt = ivBuffer.subarray(0, this.KEY_DERIVATION_SALT_LENGTH)
      const iv = ivBuffer.subarray(this.KEY_DERIVATION_SALT_LENGTH)
      
      const key = pbkdf2Sync(password, salt, this.PBKDF2_ITERATIONS, this.ENCRYPTION_KEY_LENGTH, 'sha256')
      const authTag = Buffer.from(encryptedData.authTag, 'hex')
      
      const decipher = createDecipheriv('aes-256-gcm', key, iv)
      decipher.setAuthTag(authTag)
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate secure random bytes
   */
  static generateSecureRandom(length: number): Buffer {
    return randomBytes(length)
  }

  /**
   * Create secure HMAC
   */
  static createHMAC(data: string, key: string, algorithm: string = 'sha256'): string {
    return createHmac(algorithm, key).update(data).digest('hex')
  }

  /**
   * Secure key derivation function
   */
  static deriveKey(
    password: string, 
    salt: Buffer, 
    iterations: number = this.PBKDF2_ITERATIONS,
    keyLength: number = this.ENCRYPTION_KEY_LENGTH
  ): Buffer {
    return pbkdf2Sync(password, salt, iterations, keyLength, 'sha256')
  }

  /**
   * Validate Bitcoin address with checksum verification
   */
  static validateBitcoinAddress(address: string, network: bitcoin.Network = SIGNET_NETWORK): boolean {
    try {
      bitcoin.address.toOutputScript(address, network)
      return true
    } catch {
      return false
    }
  }

  /**
   * Create Bitcoin address from public key
   */
  static createAddressFromPublicKey(
    publicKey: Buffer, 
    addressType: 'p2pkh' | 'p2wpkh' | 'p2tr' = 'p2wpkh',
    network: bitcoin.Network = SIGNET_NETWORK
  ): string {
    try {
      switch (addressType) {
        case 'p2pkh':
          const p2pkh = bitcoin.payments.p2pkh({ pubkey: publicKey, network })
          if (!p2pkh.address) throw new Error('Failed to create P2PKH address')
          return p2pkh.address

        case 'p2wpkh':
          const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: publicKey, network })
          if (!p2wpkh.address) throw new Error('Failed to create P2WPKH address')
          return p2wpkh.address

        case 'p2tr':
          const internalKey = publicKey.length === 33 ? publicKey.subarray(1) : publicKey
          const p2tr = bitcoin.payments.p2tr({ internalPubkey: internalKey, network })
          if (!p2tr.address) throw new Error('Failed to create P2TR address')
          return p2tr.address

        default:
          throw new Error('Unsupported address type')
      }
    } catch (error) {
      throw new Error(`Address creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Secure zero-fill memory (for private keys)
   */
  static secureWipeMemory(buffer: Buffer): void {
    if (buffer && buffer.length > 0) {
      buffer.fill(0)
    }
  }

  /**
   * Private helper methods
   */
  private static validateKeyPair(keyPair: ECPairInterface, network: bitcoin.Network): void {
    if (!keyPair.privateKey || !keyPair.publicKey) {
      throw new Error('Invalid key pair: missing keys')
    }

    if (keyPair.network !== network) {
      throw new Error('Network mismatch')
    }

    // Verify key pair consistency
    const derivedPublicKey = ecc.pointFromScalar(keyPair.privateKey, keyPair.compressed ?? true)
    if (!derivedPublicKey || !keyPair.publicKey.equals(Buffer.from(derivedPublicKey))) {
      throw new Error('Key pair consistency check failed')
    }
  }

  private static validatePublicKey(publicKey: Buffer): boolean {
    try {
      // Check length (33 bytes for compressed, 65 for uncompressed)
      if (publicKey.length !== 33 && publicKey.length !== 65) {
        return false
      }

      // Check compression flag
      if (publicKey.length === 33 && (publicKey[0] !== 0x02 && publicKey[0] !== 0x03)) {
        return false
      }

      if (publicKey.length === 65 && publicKey[0] !== 0x04) {
        return false
      }

      // Validate point is on curve
      return ecc.isPoint(publicKey)
    } catch {
      return false
    }
  }

  private static createSecureMessageHash(message: string): Buffer {
    // Use Bitcoin's standard message signing format
    const messagePrefix = '\x18Bitcoin Signed Message:\n'
    const messageBuffer = Buffer.from(message, 'utf8')
    const lengthBuffer = Buffer.from([messageBuffer.length])
    
    const fullMessage = Buffer.concat([
      Buffer.from(messagePrefix, 'utf8'),
      lengthBuffer,
      messageBuffer
    ])
    
    // Double SHA256 (Bitcoin standard)
    const firstHash = createHash('sha256').update(fullMessage).digest()
    return createHash('sha256').update(firstHash).digest()
  }
}

// Export functions for backwards compatibility
export const {
  generateKeyPair,
  keyPairFromWIF,
  validatePrivateKey,
  signMessage,
  verifySignature,
  validateBitcoinAddress,
  createAddressFromPublicKey,
  encryptSensitiveData,
  decryptSensitiveData,
  generateSecureRandom,
  createHMAC,
  deriveKey,
  secureWipeMemory
} = SecureCrypto

// Default network already exported above