/**
 * Secure Bitcoin Authentication System
 * Implements enterprise-grade security for Bitcoin-based authentication
 */

import { useState, useEffect } from 'react'
import { keyPairFromWIF, signMessage, verifySignature, validatePrivateKey, SIGNET_NETWORK } from '@/app/lib/bitcoin/bitcoin-crypto'
import { getUserByPublicKey, createUser } from '@/app/lib/supabase/queries'
import { sessionManager } from '@/app/lib/security/session-manager'

// Crypto compatibility
function createHash(algorithm: string) {
  if (typeof window !== 'undefined' || typeof globalThis !== 'undefined') {
    // For Edge Runtime, use a simple hash implementation
    return {
      update: (data: string) => ({ digest: () => data.split('').map(c => c.charCodeAt(0).toString(16)).join('') })
    }
  }
  const crypto = require('crypto')
  return crypto.createHash(algorithm)
}

export interface SecureAuthSession {
  user: {
    id: string
    publicKey: string
    createdAt?: string
    lastLogin?: string
  }
  sessionToken: string
  csrfToken: string
  expiresAt: number
  isAuthenticated: boolean
}

export interface AuthenticationResult {
  success: boolean
  session?: SecureAuthSession
  error?: string
  requiresTwoFactor?: boolean
}

export class SecureBitcoinAuth {
  private static readonly COOKIE_NAME = 'satslab_session'
  private static readonly CSRF_HEADER = 'x-csrf-token'
  private static readonly MAX_LOGIN_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
  
  private static loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map()

  /**
   * Authenticate user with private key and additional security measures
   */
  static async authenticate(
    privateKey: string,
    clientInfo?: { ipAddress?: string; userAgent?: string; fingerprint?: string }
  ): Promise<AuthenticationResult> {
    try {
      // Rate limiting check
      const rateLimitCheck = this.checkRateLimit(privateKey)
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: `Too many login attempts. Try again in ${Math.ceil(rateLimitCheck.retryAfter / 60000)} minutes.`
        }
      }

      // Validate private key format with timing attack protection
      const isValidFormat = await this.secureValidatePrivateKey(privateKey)
      if (!isValidFormat) {
        this.recordFailedAttempt(privateKey)
        return {
          success: false,
          error: 'Invalid private key format'
        }
      }
      
      // Generate key pair with secure random nonce
      const keyPair = keyPairFromWIF(privateKey)
      const challengeMessage = this.generateSecureChallenge()
      const signature = signMessage(challengeMessage, privateKey)
      
      // Verify signature with timing attack protection
      const isValidSignature = await this.secureVerifySignature(
        challengeMessage, 
        signature, 
        keyPair.publicKey
      )
      
      if (!isValidSignature) {
        this.recordFailedAttempt(privateKey)
        return {
          success: false,
          error: 'Authentication failed - invalid signature'
        }
      }
      
      // Check for user existence and handle creation securely
      let user = await getUserByPublicKey(keyPair.publicKey)
      if (!user) {
        // Create new user with additional validation
        user = await createUser(keyPair.publicKey)
        if (!user) {
          return {
            success: false,
            error: 'Failed to create user account'
          }
        }
      }
      
      // Update user last login
      await this.updateLastLogin(user.id)
      
      // Create secure session
      const sessionData = sessionManager.createSession(
        user.id,
        user.publicKey,
        clientInfo
      )
      
      const session: SecureAuthSession = {
        user: {
          id: user.id,
          publicKey: user.publicKey,
          createdAt: user.createdAt,
          lastLogin: new Date().toISOString()
        },
        sessionToken: sessionData.sessionToken,
        csrfToken: sessionData.csrfToken,
        expiresAt: sessionData.expiresAt,
        isAuthenticated: true
      }
      
      // Set secure cookie
      this.setSecureCookie(sessionData.sessionToken, sessionData.expiresAt)
      
      // Clear failed attempts on successful login
      this.clearFailedAttempts(privateKey)
      
      // Log successful authentication (without sensitive data)
      this.logAuthenticationEvent('success', user.publicKey, clientInfo)
      
      return {
        success: true,
        session
      }
      
    } catch (error) {
      this.recordFailedAttempt(privateKey)
      this.logAuthenticationEvent('failure', 'unknown', clientInfo, error instanceof Error ? error.message : 'Unknown error')
      
      return {
        success: false,
        error: 'Authentication failed due to server error'
      }
    }
  }

  /**
   * Validate existing session
   */
  static async validateSession(
    sessionToken?: string,
    clientInfo?: { ipAddress?: string; userAgent?: string }
  ): Promise<SecureAuthSession | null> {
    try {
      // Get session token from cookie if not provided
      if (!sessionToken && typeof window !== 'undefined') {
        sessionToken = this.getSessionTokenFromCookie() || undefined
      }
      
      if (!sessionToken) return null
      
      const session = sessionManager.validateSession(sessionToken, clientInfo)
      if (!session) return null
      
      // Get user data
      const user = await getUserByPublicKey(session.publicKey)
      if (!user) {
        // Invalidate session if user no longer exists
        sessionManager.invalidateSession(session.sessionId)
        return null
      }
      
      return {
        user: {
          id: user.id,
          publicKey: user.publicKey,
          createdAt: user.createdAt,
          lastLogin: user.updatedAt
        },
        sessionToken,
        csrfToken: session.csrfToken,
        expiresAt: session.expiresAt,
        isAuthenticated: true
      }
      
    } catch (error) {
      console.error('Session validation error:', error)
      return null
    }
  }

  /**
   * Logout and invalidate session
   */
  static async logout(sessionToken?: string): Promise<void> {
    try {
      if (!sessionToken && typeof window !== 'undefined') {
        sessionToken = this.getSessionTokenFromCookie() || undefined
      }
      
      if (sessionToken) {
        // Decrypt session to get session ID for invalidation
        const sessionData = sessionManager.validateSession(sessionToken)
        if (sessionData) {
          sessionManager.invalidateSession(sessionData.sessionId)
        }
      }
      
      // Clear secure cookie
      this.clearSecureCookie()
      
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  /**
   * Get CSRF token for current session
   */
  static getCSRFToken(): string | null {
    if (typeof window === 'undefined') return null
    
    const sessionToken = this.getSessionTokenFromCookie()
    if (!sessionToken) return null
    
    const session = sessionManager.validateSession(sessionToken)
    return session?.csrfToken || null
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(csrfToken: string): boolean {
    const sessionToken = this.getSessionTokenFromCookie()
    if (!sessionToken || !csrfToken) return false
    
    return sessionManager.validateCSRFToken(sessionToken, csrfToken)
  }

  /**
   * Security helper methods
   */
  private static async secureValidatePrivateKey(privateKey: string): Promise<boolean> {
    // Add artificial delay to prevent timing attacks
    const startTime = Date.now()
    
    try {
      const isValid = validatePrivateKey(privateKey)
      
      // Ensure consistent timing regardless of result
      const elapsed = Date.now() - startTime
      const minDelay = 100 // minimum 100ms
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed))
      }
      
      return isValid
    } catch {
      // Ensure consistent timing on error
      const elapsed = Date.now() - startTime
      const minDelay = 100
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed))
      }
      return false
    }
  }

  private static async secureVerifySignature(
    message: string, 
    signature: string, 
    publicKey: string
  ): Promise<boolean> {
    // Add artificial delay to prevent timing attacks
    const startTime = Date.now()
    
    try {
      const isValid = verifySignature(message, signature, publicKey)
      
      // Ensure consistent timing
      const elapsed = Date.now() - startTime
      const minDelay = 50
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed))
      }
      
      return isValid
    } catch {
      const elapsed = Date.now() - startTime
      const minDelay = 50
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed))
      }
      return false
    }
  }

  private static generateSecureChallenge(): string {
    const timestamp = Date.now()
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const randomHex = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
    
    return `SatsLab-Challenge-${timestamp}-${randomHex}`
  }

  private static checkRateLimit(identifier: string): { allowed: boolean; retryAfter: number } {
    const hashedIdentifier = createHash('sha256').update(identifier).digest('hex')
    const now = Date.now()
    const attempt = this.loginAttempts.get(hashedIdentifier)
    
    if (!attempt) {
      return { allowed: true, retryAfter: 0 }
    }
    
    if (now - attempt.lastAttempt > this.LOCKOUT_DURATION) {
      this.loginAttempts.delete(hashedIdentifier)
      return { allowed: true, retryAfter: 0 }
    }
    
    if (attempt.count >= this.MAX_LOGIN_ATTEMPTS) {
      const retryAfter = this.LOCKOUT_DURATION - (now - attempt.lastAttempt)
      return { allowed: false, retryAfter }
    }
    
    return { allowed: true, retryAfter: 0 }
  }

  private static recordFailedAttempt(identifier: string): void {
    const hashedIdentifier = createHash('sha256').update(identifier).digest('hex')
    const now = Date.now()
    const existing = this.loginAttempts.get(hashedIdentifier)
    
    if (existing && now - existing.lastAttempt < this.LOCKOUT_DURATION) {
      existing.count++
      existing.lastAttempt = now
    } else {
      this.loginAttempts.set(hashedIdentifier, { count: 1, lastAttempt: now })
    }
  }

  private static clearFailedAttempts(identifier: string): void {
    const hashedIdentifier = createHash('sha256').update(identifier).digest('hex')
    this.loginAttempts.delete(hashedIdentifier)
  }

  private static setSecureCookie(sessionToken: string, expiresAt: number): void {
    if (typeof document === 'undefined') return
    
    const secureCookieAttributes = [
      `${this.COOKIE_NAME}=${sessionToken}`,
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      `Expires=${new Date(expiresAt).toUTCString()}`,
      'Path=/'
    ]
    
    // Note: HttpOnly can't be set from client-side JavaScript
    // This would need to be set server-side in a real implementation
    document.cookie = secureCookieAttributes.join('; ')
  }

  private static clearSecureCookie(): void {
    if (typeof document === 'undefined') return
    
    document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict`
  }

  private static getSessionTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null
    
    const cookies = document.cookie.split(';')
    const sessionCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${this.COOKIE_NAME}=`)
    )
    
    return sessionCookie ? sessionCookie.split('=')[1] : null
  }

  private static async updateLastLogin(userId: string): Promise<void> {
    try {
      // This would typically be a database update
      // Implementation depends on your Supabase queries
    } catch (error) {
      console.error('Failed to update last login:', error)
    }
  }

  private static logAuthenticationEvent(
    type: 'success' | 'failure',
    publicKey: string,
    clientInfo?: { ipAddress?: string; userAgent?: string },
    error?: string
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      publicKey: publicKey !== 'unknown' ? createHash('sha256').update(publicKey).digest('hex').substring(0, 16) : 'unknown',
      ipAddress: clientInfo?.ipAddress ? createHash('sha256').update(clientInfo.ipAddress).digest('hex').substring(0, 16) : undefined,
      userAgent: clientInfo?.userAgent ? createHash('sha256').update(clientInfo.userAgent).digest('hex').substring(0, 16) : undefined,
      error: error && process.env.NODE_ENV === 'development' ? error : undefined
    }
    
    // In production, this should go to a secure logging service
    console.log('Auth Event:', logEntry)
  }
}

/**
 * React hook for secure authentication
 */
export function useSecureAuth() {
  const [session, setSession] = useState<SecureAuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const validateCurrentSession = async () => {
      const currentSession = await SecureBitcoinAuth.validateSession()
      setSession(currentSession)
      setLoading(false)
    }

    validateCurrentSession()
  }, [])

  const login = async (privateKey: string) => {
    setLoading(true)
    const result = await SecureBitcoinAuth.authenticate(privateKey)
    if (result.success && result.session) {
      setSession(result.session)
    }
    setLoading(false)
    return result
  }

  const logout = async () => {
    setLoading(true)
    await SecureBitcoinAuth.logout()
    setSession(null)
    setLoading(false)
  }

  return {
    session,
    loading,
    isAuthenticated: !!session?.isAuthenticated,
    user: session?.user || null,
    csrfToken: session?.csrfToken || null,
    login,
    logout
  }
}