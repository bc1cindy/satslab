/**
 * Enterprise-grade Session Manager
 * Implements secure session handling with OWASP best practices
 */

// Crypto compatibility layer for Edge Runtime and Node.js
function getCrypto() {
  if (typeof window !== 'undefined') {
    return window.crypto
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto
  }
  // Fallback to Node.js crypto
  const crypto = require('crypto')
  return {
    ...crypto,
    getRandomValues: (array: Uint8Array) => {
      const randomBytes = crypto.randomBytes(array.length)
      array.set(randomBytes)
      return array
    }
  }
}

function createHash(algorithm: string) {
  const crypto = getCrypto()
  if (crypto.createHash) {
    return crypto.createHash(algorithm)
  }
  // Browser implementation using SubtleCrypto would go here
  throw new Error('Hash function not available in this environment')
}

function randomBytes(size: number): Buffer {
  const crypto = getCrypto()
  if (crypto.randomBytes) {
    return crypto.randomBytes(size)
  }
  // Browser implementation
  const array = new Uint8Array(size)
  crypto.getRandomValues(array)
  return Buffer.from(array)
}

function createCipheriv(algorithm: string, key: Buffer, iv: Buffer) {
  const crypto = getCrypto()
  if (crypto.createCipheriv) {
    return crypto.createCipheriv(algorithm, key, iv)
  }
  throw new Error('Cipher function not available in this environment')
}

function createDecipheriv(algorithm: string, key: Buffer, iv: Buffer) {
  const crypto = getCrypto()
  if (crypto.createDecipheriv) {
    return crypto.createDecipheriv(algorithm, key, iv)
  }
  throw new Error('Decipher function not available in this environment')
}

interface SecureSession {
  sessionId: string
  userId: string
  publicKey: string
  createdAt: number
  expiresAt: number
  lastActivity: number
  ipAddress?: string
  userAgent?: string
  csrfToken: string
  isValid: boolean
}

interface SessionConfig {
  maxAge: number // Session max age in milliseconds
  renewThreshold: number // Renew session when this close to expiry
  maxInactivity: number // Max inactivity before session expires
  enableIPBinding: boolean
  enableUserAgentBinding: boolean
  secureCookies: boolean
}

export class SecureSessionManager {
  private static instance: SecureSessionManager
  private sessions: Map<string, SecureSession> = new Map()
  private config: SessionConfig
  private encryptionKey: Buffer

  private constructor() {
    this.config = {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      renewThreshold: 30 * 60 * 1000, // 30 minutes
      maxInactivity: 2 * 60 * 60 * 1000, // 2 hours
      enableIPBinding: process.env.NODE_ENV === 'production',
      enableUserAgentBinding: process.env.NODE_ENV === 'production',
      secureCookies: process.env.NODE_ENV === 'production'
    }
    
    // Generate encryption key from environment or create secure random
    const keySource = process.env.SESSION_ENCRYPTION_KEY || 
      (process.env.NODE_ENV === 'development' ? 'development-key-not-for-production' : this.generateSecureKey())
    this.encryptionKey = Buffer.from(createHash('sha256').update(keySource).digest())
    
    // Clean up expired sessions every 15 minutes
    setInterval(() => this.cleanupExpiredSessions(), 15 * 60 * 1000)
  }

  public static getInstance(): SecureSessionManager {
    if (!SecureSessionManager.instance) {
      SecureSessionManager.instance = new SecureSessionManager()
    }
    return SecureSessionManager.instance
  }

  /**
   * Create a new secure session
   */
  public createSession(
    userId: string, 
    publicKey: string, 
    clientInfo?: { ipAddress?: string; userAgent?: string }
  ): { sessionToken: string; csrfToken: string; expiresAt: number } {
    // Generate cryptographically secure session ID
    const sessionId = this.generateSecureSessionId()
    const csrfToken = this.generateCSRFToken()
    const now = Date.now()
    
    const session: SecureSession = {
      sessionId,
      userId,
      publicKey,
      createdAt: now,
      expiresAt: now + this.config.maxAge,
      lastActivity: now,
      ipAddress: clientInfo?.ipAddress,
      userAgent: clientInfo?.userAgent,
      csrfToken,
      isValid: true
    }
    
    // Store session securely
    this.sessions.set(sessionId, session)
    
    // Create encrypted session token
    const sessionToken = this.encryptSessionData({
      sessionId,
      userId,
      expiresAt: session.expiresAt
    })
    
    return {
      sessionToken,
      csrfToken,
      expiresAt: session.expiresAt
    }
  }

  /**
   * Validate and retrieve session
   */
  public validateSession(
    sessionToken: string,
    clientInfo?: { ipAddress?: string; userAgent?: string }
  ): SecureSession | null {
    try {
      // Decrypt session token
      const sessionData = this.decryptSessionData(sessionToken)
      if (!sessionData) return null
      
      const session = this.sessions.get(sessionData.sessionId)
      if (!session || !session.isValid) return null
      
      const now = Date.now()
      
      // Check expiration
      if (now > session.expiresAt) {
        this.invalidateSession(sessionData.sessionId)
        return null
      }
      
      // Check inactivity timeout
      if (now - session.lastActivity > this.config.maxInactivity) {
        this.invalidateSession(sessionData.sessionId)
        return null
      }
      
      // Validate IP binding if enabled
      if (this.config.enableIPBinding && session.ipAddress && 
          clientInfo?.ipAddress && session.ipAddress !== clientInfo.ipAddress) {
        this.invalidateSession(sessionData.sessionId)
        return null
      }
      
      // Validate User-Agent binding if enabled
      if (this.config.enableUserAgentBinding && session.userAgent &&
          clientInfo?.userAgent && session.userAgent !== clientInfo.userAgent) {
        this.invalidateSession(sessionData.sessionId)
        return null
      }
      
      // Update last activity
      session.lastActivity = now
      
      // Auto-renew session if close to expiry
      if (session.expiresAt - now < this.config.renewThreshold) {
        session.expiresAt = now + this.config.maxAge
      }
      
      return session
    } catch (error) {
      console.error('Session validation error:', error)
      return null
    }
  }

  /**
   * Validate CSRF token
   */
  public validateCSRFToken(sessionToken: string, csrfToken: string): boolean {
    const sessionData = this.decryptSessionData(sessionToken)
    if (!sessionData) return false
    
    const session = this.sessions.get(sessionData.sessionId)
    return session?.csrfToken === csrfToken
  }

  /**
   * Invalidate a session
   */
  public invalidateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.isValid = false
      this.sessions.delete(sessionId)
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  public invalidateAllUserSessions(userId: string): void {
    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      if (session.userId === userId) {
        this.invalidateSession(sessionId)
      }
    }
  }

  /**
   * Get active sessions for a user
   */
  public getUserSessions(userId: string): SecureSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isValid)
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now()
    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      if (now > session.expiresAt || 
          now - session.lastActivity > this.config.maxInactivity) {
        this.invalidateSession(sessionId)
      }
    }
  }

  /**
   * Generate cryptographically secure session ID
   */
  private generateSecureSessionId(): string {
    return randomBytes(32).toString('hex')
  }

  /**
   * Generate CSRF token
   */
  private generateCSRFToken(): string {
    return randomBytes(32).toString('base64url')
  }

  /**
   * Generate secure encryption key
   */
  private generateSecureKey(): string {
    return randomBytes(64).toString('hex')
  }

  /**
   * Encrypt session data
   */
  private encryptSessionData(data: any): string {
    const iv = randomBytes(16)
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv)
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]).toString('base64url')
  }

  /**
   * Decrypt session data
   */
  private decryptSessionData(encryptedData: string): any | null {
    try {
      const buffer = Buffer.from(encryptedData, 'base64url')
      
      const iv = buffer.subarray(0, 16)
      const authTag = buffer.subarray(16, 32)
      const encrypted = buffer.subarray(32)
      
      const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv)
      decipher.setAuthTag(authTag)
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')
      
      return JSON.parse(decrypted)
    } catch (error) {
      return null
    }
  }

  /**
   * Get session statistics
   */
  public getSessionStats(): {
    activeSessions: number
    totalSessions: number
    averageSessionAge: number
  } {
    const now = Date.now()
    const activeSessions = Array.from(this.sessions.values())
      .filter(session => session.isValid)
    
    const averageAge = activeSessions.length > 0
      ? activeSessions.reduce((sum, session) => sum + (now - session.createdAt), 0) / activeSessions.length
      : 0
    
    return {
      activeSessions: activeSessions.length,
      totalSessions: this.sessions.size,
      averageSessionAge: averageAge
    }
  }
}

export const sessionManager = SecureSessionManager.getInstance()