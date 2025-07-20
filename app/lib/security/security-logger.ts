/**
 * Enterprise Security Logging System
 * Implements OWASP A09 - Security Logging and Monitoring Failures
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  
  // Authorization events
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  
  // Data access events
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_EXPORT = 'data_export',
  ADMIN_DATA_ACCESS = 'admin_data_access',
  
  // Security events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INJECTION_ATTEMPT = 'injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_VIOLATION = 'security_violation',
  
  // System events
  CONFIGURATION_CHANGE = 'configuration_change',
  SYSTEM_ERROR = 'system_error',
  WEBHOOK_RECEIVED = 'webhook_received',
  
  // Payment events
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed'
}

interface SecurityEvent {
  timestamp: string
  level: LogLevel
  type: SecurityEventType
  message: string
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  method?: string
  statusCode?: number
  metadata?: Record<string, any>
  sensitive?: boolean
}

export class SecurityLogger {
  private static instance: SecurityLogger
  private logs: SecurityEvent[] = []
  private readonly MAX_LOGS = 10000 // Rotate after 10k logs
  
  private constructor() {}

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger()
    }
    return SecurityLogger.instance
  }

  /**
   * Log security event with automatic PII redaction
   */
  private log(
    level: LogLevel,
    type: SecurityEventType,
    message: string,
    metadata?: Record<string, any>,
    request?: Request
  ): void {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      level,
      type,
      message: this.sanitizeMessage(message),
      ...this.extractRequestInfo(request),
      metadata: metadata ? this.sanitizeMetadata(metadata) : undefined
    }

    // Add to in-memory store
    this.logs.push(event)
    
    // Rotate logs if needed
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS / 2)
    }

    // Output to console based on environment
    this.outputLog(event)
    
    // In production, you would also send to external logging service
    // this.sendToExternalLogger(event)
  }

  /**
   * Sanitize log messages to remove sensitive data
   */
  private sanitizeMessage(message: string): string {
    return message
      // Remove email addresses (replace with masked version)
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      // Remove potential passwords/secrets
      .replace(/password["\s]*[:=]["\s]*[^"\s,}]+/gi, 'password: [REDACTED]')
      .replace(/secret["\s]*[:=]["\s]*[^"\s,}]+/gi, 'secret: [REDACTED]')
      .replace(/token["\s]*[:=]["\s]*[^"\s,}]+/gi, 'token: [REDACTED]')
      // Remove credit card numbers
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
      // Remove phone numbers
      .replace(/\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[PHONE]')
  }

  /**
   * Sanitize metadata to remove sensitive information
   */
  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(metadata)) {
      const lowerKey = key.toLowerCase()
      
      // Skip sensitive fields entirely
      if (lowerKey.includes('password') || 
          lowerKey.includes('secret') || 
          lowerKey.includes('token') ||
          lowerKey.includes('key')) {
        sanitized[key] = '[REDACTED]'
        continue
      }
      
      // Mask email addresses
      if (lowerKey.includes('email') && typeof value === 'string') {
        sanitized[key] = this.maskEmail(value)
        continue
      }
      
      // For other values, apply string sanitization if it's a string
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeMessage(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  /**
   * Mask email address for logging
   */
  private maskEmail(email: string): string {
    const [username, domain] = email.split('@')
    if (username && domain) {
      const maskedUsername = username.length > 2 
        ? username.substring(0, 2) + '*'.repeat(username.length - 2)
        : '*'.repeat(username.length)
      return `${maskedUsername}@${domain}`
    }
    return '[EMAIL]'
  }

  /**
   * Extract request information safely
   */
  private extractRequestInfo(request?: Request): Partial<SecurityEvent> {
    if (!request) return {}

    return {
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent')?.substring(0, 200) || 'unknown',
      endpoint: new URL(request.url).pathname,
      method: request.method
    }
  }

  /**
   * Get client IP with proxy support
   */
  private getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    
    return cfConnectingIp || 
           realIp || 
           forwarded?.split(',')[0]?.trim() || 
           'unknown'
  }

  /**
   * Output log based on environment
   */
  private outputLog(event: SecurityEvent): void {
    const logMessage = `[${event.timestamp}] ${LogLevel[event.level]} ${event.type}: ${event.message}`
    
    switch (event.level) {
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(logMessage, event.metadata)
        }
        break
      case LogLevel.INFO:
        console.info(logMessage)
        break
      case LogLevel.WARN:
        console.warn(logMessage, event.metadata)
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(logMessage, event.metadata)
        break
    }
  }

  // Public logging methods
  info(type: SecurityEventType, message: string, metadata?: Record<string, any>, request?: Request): void {
    this.log(LogLevel.INFO, type, message, metadata, request)
  }

  warn(type: SecurityEventType, message: string, metadata?: Record<string, any>, request?: Request): void {
    this.log(LogLevel.WARN, type, message, metadata, request)
  }

  error(type: SecurityEventType, message: string, metadata?: Record<string, any>, request?: Request): void {
    this.log(LogLevel.ERROR, type, message, metadata, request)
  }

  critical(type: SecurityEventType, message: string, metadata?: Record<string, any>, request?: Request): void {
    this.log(LogLevel.CRITICAL, type, message, metadata, request)
  }

  /**
   * Log authentication events
   */
  logAuthentication(success: boolean, userEmail?: string, request?: Request): void {
    const type = success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE
    const message = success 
      ? 'User authentication successful'
      : 'User authentication failed'
    
    this.info(type, message, { userEmail: userEmail ? this.maskEmail(userEmail) : undefined }, request)
  }

  /**
   * Log access control events
   */
  logAccessControl(granted: boolean, resource: string, userEmail?: string, request?: Request): void {
    const type = granted ? SecurityEventType.ACCESS_GRANTED : SecurityEventType.ACCESS_DENIED
    const message = granted 
      ? `Access granted to resource: ${resource}`
      : `Access denied to resource: ${resource}`
    
    this.info(type, message, { 
      resource, 
      userEmail: userEmail ? this.maskEmail(userEmail) : undefined 
    }, request)
  }

  /**
   * Log security threats
   */
  logSecurityThreat(threatType: string, details: string, request?: Request): void {
    this.warn(SecurityEventType.SUSPICIOUS_ACTIVITY, `Security threat detected: ${threatType}`, {
      threatType,
      details: this.sanitizeMessage(details)
    }, request)
  }

  /**
   * Log injection attempts
   */
  logInjectionAttempt(injectionType: string, payload: string, request?: Request): void {
    this.error(SecurityEventType.INJECTION_ATTEMPT, `${injectionType} injection attempt detected`, {
      injectionType,
      payload: payload.substring(0, 200) // Limit payload length in logs
    }, request)
  }

  /**
   * Log rate limiting events
   */
  logRateLimit(limitType: string, clientId: string, request?: Request): void {
    this.warn(SecurityEventType.RATE_LIMIT_EXCEEDED, `Rate limit exceeded for ${limitType}`, {
      limitType,
      clientId: clientId.substring(0, 20) // Truncate client ID
    }, request)
  }

  /**
   * Log payment events
   */
  logPayment(type: SecurityEventType, amount?: number, userEmail?: string, invoiceId?: string): void {
    this.info(type, `Payment event: ${type}`, {
      amount,
      userEmail: userEmail ? this.maskEmail(userEmail) : undefined,
      invoiceId
    })
  }

  /**
   * Get recent security events (for admin dashboard)
   */
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.logs
      .filter(log => log.level >= LogLevel.WARN) // Only warnings and above
      .slice(-limit)
      .reverse() // Most recent first
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalEvents: number
    criticalEvents: number
    suspiciousActivity: number
    accessDenied: number
    injectionAttempts: number
  } {
    const total = this.logs.length
    const critical = this.logs.filter(log => log.level === LogLevel.CRITICAL).length
    const suspicious = this.logs.filter(log => log.type === SecurityEventType.SUSPICIOUS_ACTIVITY).length
    const denied = this.logs.filter(log => log.type === SecurityEventType.ACCESS_DENIED).length
    const injection = this.logs.filter(log => log.type === SecurityEventType.INJECTION_ATTEMPT).length

    return {
      totalEvents: total,
      criticalEvents: critical,
      suspiciousActivity: suspicious,
      accessDenied: denied,
      injectionAttempts: injection
    }
  }
}

// Export singleton instance
export const securityLogger = SecurityLogger.getInstance()
export { SecurityEventType }