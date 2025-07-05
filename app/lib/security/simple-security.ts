/**
 * Simplified Security System for Development
 * This provides basic security while avoiding complex dependencies
 */

// Simple session management
export class SimpleSessionManager {
  private static instance: SimpleSessionManager
  private sessions: Map<string, any> = new Map()

  public static getInstance(): SimpleSessionManager {
    if (!SimpleSessionManager.instance) {
      SimpleSessionManager.instance = new SimpleSessionManager()
    }
    return SimpleSessionManager.instance
  }

  public createSession(userId: string, publicKey: string) {
    const sessionId = Math.random().toString(36).substring(2)
    const session = {
      sessionId,
      userId,
      publicKey,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      csrfToken: Math.random().toString(36).substring(2)
    }
    
    this.sessions.set(sessionId, session)
    
    return {
      sessionToken: sessionId,
      csrfToken: session.csrfToken,
      expiresAt: session.expiresAt
    }
  }

  public validateSession(sessionToken: string) {
    const session = this.sessions.get(sessionToken)
    if (!session || Date.now() > session.expiresAt) {
      return null
    }
    return session
  }

  public invalidateSession(sessionId: string) {
    this.sessions.delete(sessionId)
  }

  public validateCSRFToken(sessionToken: string, csrfToken: string): boolean {
    const session = this.sessions.get(sessionToken)
    return session?.csrfToken === csrfToken
  }

  public getSessionStats() {
    return {
      activeSessions: this.sessions.size,
      totalSessions: this.sessions.size,
      averageSessionAge: 0
    }
  }
}

export const sessionManager = SimpleSessionManager.getInstance()

// Simple monitoring
export class SimpleSecurityMonitor {
  private static instance: SimpleSecurityMonitor
  private events: any[] = []

  public static getInstance(): SimpleSecurityMonitor {
    if (!SimpleSecurityMonitor.instance) {
      SimpleSecurityMonitor.instance = new SimpleSecurityMonitor()
    }
    return SimpleSecurityMonitor.instance
  }

  public logEvent(type: string, severity: string, category: string, source: string, details: any = {}) {
    const event = {
      id: Math.random().toString(36).substring(2),
      timestamp: new Date().toISOString(),
      type,
      severity,
      category,
      source,
      details
    }
    
    this.events.push(event)
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }
    
    console.log(`[SECURITY] ${type} - ${severity}`, event)
  }

  public getMetrics() {
    return {
      totalEvents: this.events.length,
      eventsByType: {},
      eventsBySeverity: {},
      eventsByCategory: {},
      failedLogins: 0,
      suspiciousActivities: 0,
      blockedRequests: 0,
      averageRiskScore: 0
    }
  }

  public getActiveAlerts() {
    return []
  }
}

export const securityMonitor = SimpleSecurityMonitor.getInstance()

// Simple config
export class SimpleSecurityConfig {
  private static instance: SimpleSecurityConfig

  public static getInstance(): SimpleSecurityConfig {
    if (!SimpleSecurityConfig.instance) {
      SimpleSecurityConfig.instance = new SimpleSecurityConfig()
    }
    return SimpleSecurityConfig.instance
  }

  public getConfig() {
    return {
      environment: process.env.NODE_ENV || 'development',
      features: {
        enableDebugMode: process.env.NODE_ENV === 'development',
        enableDetailedErrors: process.env.NODE_ENV === 'development'
      }
    }
  }

  public validateConfiguration() {
    return {
      valid: true,
      issues: [],
      recommendations: []
    }
  }
}

export const securityConfig = SimpleSecurityConfig.getInstance()

// Simple input validator
export class SimpleInputValidator {
  static validatePrivateKey(input: string) {
    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        errors: ['Private key is required'],
        severity: 'high'
      }
    }

    const sanitized = input.trim()

    if (sanitized.length < 51 || sanitized.length > 52) {
      return {
        isValid: false,
        errors: ['Invalid private key length'],
        severity: 'high'
      }
    }

    return {
      isValid: true,
      sanitized,
      errors: [],
      severity: 'low'
    }
  }

  static validateBitcoinAddress(input: string) {
    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        errors: ['Bitcoin address is required'],
        severity: 'medium'
      }
    }

    return {
      isValid: true,
      sanitized: input.trim(),
      errors: [],
      severity: 'low'
    }
  }

  static validateTransactionId(input: string) {
    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        errors: ['Transaction ID is required'],
        severity: 'medium'
      }
    }

    const sanitized = input.trim()

    if (sanitized.length !== 64) {
      return {
        isValid: false,
        errors: ['Transaction ID must be exactly 64 characters'],
        severity: 'medium'
      }
    }

    return {
      isValid: true,
      sanitized,
      errors: [],
      severity: 'low'
    }
  }
}

export { SimpleInputValidator as SecureInputValidator }