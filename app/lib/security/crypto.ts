/**
 * Enterprise Cryptography Module
 * Implements OWASP A02 protection against Cryptographic Failures
 */

import crypto from 'crypto'

const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
const KEY_DERIVATION_ITERATIONS = 100000
const SALT_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

export class SecureCrypto {
  private static getEncryptionKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET
    if (!secret) {
      throw new Error('ENCRYPTION_SECRET environment variable is required')
    }
    
    // Derive a consistent key from the secret
    return crypto.pbkdf2Sync(secret, 'satslab-salt', KEY_DERIVATION_ITERATIONS, 32, 'sha256')
  }

  /**
   * Encrypt sensitive data for storage
   */
  static encrypt(plaintext: string): string {
    try {
      const key = this.getEncryptionKey()
      const iv = crypto.randomBytes(IV_LENGTH)
      const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv)
      cipher.setAAD(Buffer.from('satslab-auth'))
      
      let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
      ciphertext += cipher.final('hex')
      
      const tag = cipher.getAuthTag()
      
      // Combine IV + tag + ciphertext
      return iv.toString('hex') + tag.toString('hex') + ciphertext
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt sensitive data from storage
   */
  static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey()
      
      // Extract IV, tag, and ciphertext
      const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex')
      const tag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex')
      const ciphertext = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2)
      
      const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv)
      decipher.setAAD(Buffer.from('satslab-auth'))
      decipher.setAuthTag(tag)
      
      let plaintext = decipher.update(ciphertext, 'hex', 'utf8')
      plaintext += decipher.final('utf8')
      
      return plaintext
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Generate secure random tokens for sessions, API keys, etc.
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Hash passwords securely with salt
   */
  static async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, KEY_DERIVATION_ITERATIONS, 64, 'sha256').toString('hex')
    
    return { hash, salt }
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const computedHash = crypto.pbkdf2Sync(password, salt, KEY_DERIVATION_ITERATIONS, 64, 'sha256').toString('hex')
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'))
  }

  /**
   * Generate HMAC signature for webhooks and data integrity
   */
  static generateHMAC(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex')
  }

  /**
   * Verify HMAC signature with timing-safe comparison
   */
  static verifyHMAC(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateHMAC(data, secret)
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }

  /**
   * Encrypt sensitive configuration values
   */
  static encryptConfig(value: string): string {
    return this.encrypt(value)
  }

  /**
   * Decrypt sensitive configuration values
   */
  static decryptConfig(encryptedValue: string): string {
    return this.decrypt(encryptedValue)
  }

  /**
   * Generate secure file upload tokens
   */
  static generateUploadToken(userId: string, fileType: string): string {
    const timestamp = Date.now()
    const payload = `${userId}:${fileType}:${timestamp}`
    const signature = this.generateHMAC(payload, process.env.UPLOAD_SECRET || 'default-secret')
    
    return Buffer.from(`${payload}:${signature}`).toString('base64')
  }

  /**
   * Verify file upload token
   */
  static verifyUploadToken(token: string): { valid: boolean; userId?: string; fileType?: string } {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8')
      const parts = decoded.split(':')
      
      if (parts.length !== 4) {
        return { valid: false }
      }
      
      const [userId, fileType, timestamp, signature] = parts
      const payload = `${userId}:${fileType}:${timestamp}`
      
      // Check if token is expired (1 hour)
      if (Date.now() - parseInt(timestamp) > 3600000) {
        return { valid: false }
      }
      
      const isValid = this.verifyHMAC(payload, signature, process.env.UPLOAD_SECRET || 'default-secret')
      
      return isValid ? { valid: true, userId, fileType } : { valid: false }
    } catch (error) {
      return { valid: false }
    }
  }
}

/**
 * Secure session token management
 */
export class SessionSecurity {
  /**
   * Generate secure session ID
   */
  static generateSessionId(): string {
    return SecureCrypto.generateSecureToken(32)
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return SecureCrypto.generateSecureToken(24)
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken || token.length !== expectedToken.length) {
      return false
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    )
  }
}

/**
 * Data sanitization and validation
 */
export class DataSecurity {
  /**
   * Sanitize string input to prevent XSS
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>\"']/g, '') // Remove dangerous characters
      .trim()
      .slice(0, 1000) // Limit length
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  /**
   * Validate URL format and whitelist domains
   */
  static isValidURL(url: string, allowedDomains?: string[]): boolean {
    try {
      const urlObj = new URL(url)
      
      // Only allow HTTPS in production
      if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
        return false
      }
      
      // Check domain whitelist if provided
      if (allowedDomains && !allowedDomains.includes(urlObj.hostname)) {
        return false
      }
      
      return true
    } catch {
      return false
    }
  }

  /**
   * Sanitize file name for uploads
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/\.{2,}/g, '.') // Remove multiple dots
      .slice(0, 255) // Limit length
  }
}