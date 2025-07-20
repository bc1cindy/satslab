/**
 * Secure Logger Utility
 * Drop-in replacement for console.log with automatic sanitization
 */

import { securityLogger, SecurityEventType } from './security-logger'

interface LogOptions {
  sanitize?: boolean
  level?: 'debug' | 'info' | 'warn' | 'error'
  category?: string
  skipSensitiveCheck?: boolean
}

export class SecureLogger {
  private static instance: SecureLogger
  private readonly sensitivePatterns = [
    // Private keys and seeds
    /[5KL][1-9A-HJ-NP-Za-km-z]{50,51}/g,        // Private keys WIF format
    /xprv[a-zA-Z0-9]{100,}/g,                   // Extended private keys
    /[a-f0-9]{64}/g,                            // Hex private keys (64 chars)
    
    // Passwords and secrets
    /password[\s]*[:=][\s]*['"]?[^'";\s,}]+/gi,
    /secret[\s]*[:=][\s]*['"]?[^'";\s,}]+/gi,
    /token[\s]*[:=][\s]*['"]?[^'";\s,}]+/gi,
    /api[\s_-]*key[\s]*[:=][\s]*['"]?[^'";\s,}]+/gi,
    
    // Email addresses
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    
    // Credit card numbers
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    
    // Bitcoin addresses
    /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/g,
    /bc1[a-z0-9]{39,59}/g,
    
    // Phone numbers
    /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    
    // SSN format
    /\b\d{3}-\d{2}-\d{4}\b/g,
    
    // Common sensitive field names in JSON
    /"(password|secret|token|key|credential|auth|session)"[\s]*:[\s]*"[^"]+"/gi
  ]

  private constructor() {}

  static getInstance(): SecureLogger {
    if (!SecureLogger.instance) {
      SecureLogger.instance = new SecureLogger()
    }
    return SecureLogger.instance
  }

  /**
   * Sanitize sensitive data from log message
   */
  private sanitize(message: any): string {
    let sanitized = typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message)
    
    this.sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, (match) => {
        if (pattern.source.includes('email')) {
          return this.maskEmail(match)
        }
        if (pattern.source.includes('card') || pattern.source.includes('\\d{4}')) {
          return 'XXXX-XXXX-XXXX-' + match.slice(-4)
        }
        if (pattern.source.includes('phone')) {
          return 'XXX-XXX-' + match.slice(-4)
        }
        return '[REDACTED]'
      })
    })
    
    return sanitized
  }

  /**
   * Mask email address
   */
  private maskEmail(email: string): string {
    const [username, domain] = email.split('@')
    if (username && domain) {
      const maskedUsername = username.length > 2 
        ? username.substring(0, 2) + '*'.repeat(Math.min(username.length - 2, 6))
        : '*'.repeat(username.length)
      return `${maskedUsername}@${domain}`
    }
    return '[EMAIL]'
  }

  /**
   * Check if message contains sensitive data
   */
  private containsSensitiveData(message: string): boolean {
    return this.sensitivePatterns.some(pattern => pattern.test(message))
  }

  /**
   * Secure log method - replacement for console.log
   */
  log(message: any, ...args: any[]): void {
    this.secureLog('info', message, ...args)
  }

  /**
   * Secure info method
   */
  info(message: any, ...args: any[]): void {
    this.secureLog('info', message, ...args)
  }

  /**
   * Secure warn method
   */
  warn(message: any, ...args: any[]): void {
    this.secureLog('warn', message, ...args)
  }

  /**
   * Secure error method
   */
  error(message: any, ...args: any[]): void {
    this.secureLog('error', message, ...args)
  }

  /**
   * Secure debug method
   */
  debug(message: any, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      this.secureLog('debug', message, ...args)
    }
  }

  /**
   * Core secure logging method
   */
  private secureLog(level: 'debug' | 'info' | 'warn' | 'error', message: any, ...args: any[]): void {
    const allMessages = [message, ...args]
    const sanitizedMessages = allMessages.map(msg => this.sanitize(msg))
    
    // Check for sensitive data in original message
    const originalString = allMessages.map(msg => 
      typeof msg === 'object' ? JSON.stringify(msg) : String(msg)
    ).join(' ')
    
    if (this.containsSensitiveData(originalString)) {
      // Log security event for sensitive data detection
      securityLogger.warn(
        SecurityEventType.SENSITIVE_DATA_ACCESS,
        `Sensitive data detected in ${level} log`,
        {
          log_level: level,
          sanitized_message: sanitizedMessages[0].substring(0, 100),
          sensitive_data_detected: true
        }
      )
    }

    // Output sanitized logs based on environment
    if (process.env.NODE_ENV === 'production') {
      // In production, only log sanitized versions
      switch (level) {
        case 'error':
          console.error('[SECURE]', ...sanitizedMessages)
          break
        case 'warn':
          console.warn('[SECURE]', ...sanitizedMessages)
          break
        case 'info':
          console.info('[SECURE]', ...sanitizedMessages)
          break
        case 'debug':
          // No debug logs in production
          break
      }
    } else {
      // In development, show both original and sanitized if they differ
      const originalStr = allMessages.join(' ')
      const sanitizedStr = sanitizedMessages.join(' ')
      
      if (originalStr !== sanitizedStr) {
        console.warn('🔒 SENSITIVE DATA DETECTED - Showing sanitized version:')
        switch (level) {
          case 'error':
            console.error('[SANITIZED]', ...sanitizedMessages)
            break
          case 'warn':
            console.warn('[SANITIZED]', ...sanitizedMessages)
            break
          case 'info':
            console.info('[SANITIZED]', ...sanitizedMessages)
            break
          case 'debug':
            console.debug('[SANITIZED]', ...sanitizedMessages)
            break
        }
      } else {
        // Safe to show original
        switch (level) {
          case 'error':
            console.error(...allMessages)
            break
          case 'warn':
            console.warn(...allMessages)
            break
          case 'info':
            console.info(...allMessages)
            break
          case 'debug':
            console.debug(...allMessages)
            break
        }
      }
    }
  }

  /**
   * Enhanced authentication logging
   */
  logAuth(success: boolean, email?: string, details?: Record<string, any>): void {
    securityLogger.logAuthentication(success, email)
    
    const message = success ? 'Authentication successful' : 'Authentication failed'
    this.info(message, {
      success,
      email: email ? this.maskEmail(email) : undefined,
      timestamp: new Date().toISOString(),
      ...details
    })
  }

  /**
   * Enhanced payment logging
   */
  logPayment(type: 'initiated' | 'completed' | 'failed', amount?: number, userEmail?: string, invoiceId?: string): void {
    const eventType = type === 'initiated' ? SecurityEventType.PAYMENT_INITIATED :
                     type === 'completed' ? SecurityEventType.PAYMENT_COMPLETED :
                     SecurityEventType.PAYMENT_FAILED

    securityLogger.logPayment(eventType, amount, userEmail, invoiceId)
    
    this.info(`Payment ${type}`, {
      type,
      amount,
      userEmail: userEmail ? this.maskEmail(userEmail) : undefined,
      invoiceId,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Enhanced access control logging
   */
  logAccess(granted: boolean, resource: string, userEmail?: string): void {
    securityLogger.logAccessControl(granted, resource, userEmail)
    
    const message = granted ? 'Access granted' : 'Access denied'
    this.info(message, {
      granted,
      resource,
      userEmail: userEmail ? this.maskEmail(userEmail) : undefined,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Enhanced error logging with context
   */
  logError(error: Error | string, context?: Record<string, any>): void {
    const errorMessage = error instanceof Error ? error.message : error
    const stack = error instanceof Error ? error.stack : undefined
    
    this.error('Application error', {
      message: errorMessage,
      stack: stack?.substring(0, 500), // Limit stack trace
      context: context ? this.sanitize(context) : undefined,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Get security-safe version of any object for logging
   */
  sanitizeForLog(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitize(obj)
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = Array.isArray(obj) ? [] : {}
      
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase()
        
        // Skip sensitive fields entirely
        if (lowerKey.includes('password') || 
            lowerKey.includes('secret') || 
            lowerKey.includes('token') ||
            lowerKey.includes('key') ||
            lowerKey.includes('private')) {
          sanitized[key] = '[REDACTED]'
        } else if (lowerKey.includes('email') && typeof value === 'string') {
          sanitized[key] = this.maskEmail(value)
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeForLog(value)
        } else {
          sanitized[key] = this.sanitize(value)
        }
      }
      
      return sanitized
    }
    
    return obj
  }
}

// Export singleton instance
export const secureLogger = SecureLogger.getInstance()

// Export convenience methods for easy drop-in replacement
export const securelog = secureLogger.log.bind(secureLogger)
export const secureinfo = secureLogger.info.bind(secureLogger)
export const securewarn = secureLogger.warn.bind(secureLogger)
export const secureerror = secureLogger.error.bind(secureLogger)
export const securedebug = secureLogger.debug.bind(secureLogger)

// Example usage guide in comments:
/*
// Instead of:
console.log('User login:', userEmail, privateKey)

// Use:
secureLogger.log('User login:', userEmail, privateKey)
// or
securelog('User login:', userEmail, privateKey)

// For authentication:
secureLogger.logAuth(true, userEmail, { method: 'bitcoin' })

// For payments:
secureLogger.logPayment('completed', 50000, userEmail, invoiceId)

// For access control:
secureLogger.logAccess(true, '/api/pro/videos', userEmail)

// For errors with context:
secureLogger.logError(error, { userId, action: 'video_access' })
*/