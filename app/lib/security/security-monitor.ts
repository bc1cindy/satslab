/**
 * Enterprise Security Monitoring and Logging
 * Implements OWASP A09 - Security Logging and Monitoring Failures prevention
 */

import { createHash } from 'crypto'

interface SecurityEvent {
  id: string
  timestamp: string
  type: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'authentication' | 'authorization' | 'input_validation' | 'session' | 'data_access' | 'system'
  source: string
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  details: Record<string, any>
  risk_score: number
  correlationId?: string
}

type SecurityEventType = 
  | 'login_success'
  | 'login_failure'
  | 'login_locked'
  | 'logout'
  | 'session_created'
  | 'session_expired'
  | 'session_invalidated'
  | 'unauthorized_access'
  | 'privilege_escalation'
  | 'input_validation_failure'
  | 'injection_attempt'
  | 'xss_attempt'
  | 'csrf_attack'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'data_access'
  | 'data_export'
  | 'configuration_change'
  | 'system_error'
  | 'security_alert'

interface SecurityMetrics {
  totalEvents: number
  eventsByType: Record<SecurityEventType, number>
  eventsBySeverity: Record<string, number>
  eventsByCategory: Record<string, number>
  failedLogins: number
  suspiciousActivities: number
  blockedRequests: number
  averageRiskScore: number
}

interface AlertRule {
  id: string
  name: string
  description: string
  condition: (events: SecurityEvent[]) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  threshold?: number
  timeWindow?: number
  cooldown?: number
}

interface SecurityAlert {
  id: string
  ruleId: string
  ruleName: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  events: SecurityEvent[]
  acknowledged: boolean
  resolvedAt?: string
}

export class SecurityMonitor {
  private static instance: SecurityMonitor
  private events: SecurityEvent[] = []
  private alerts: SecurityAlert[] = []
  private alertRules: AlertRule[] = []
  private metrics: SecurityMetrics
  private readonly maxEvents = 10000
  private readonly retentionDays = 30

  private constructor() {
    this.metrics = this.initializeMetrics()
    this.setupDefaultAlertRules()
    this.startPeriodicCleanup()
  }

  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }

  /**
   * Log a security event
   */
  public logEvent(
    type: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    category: 'authentication' | 'authorization' | 'input_validation' | 'session' | 'data_access' | 'system',
    source: string,
    details: Record<string, any> = {},
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): void {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      type,
      severity,
      category,
      source,
      userId: userId ? this.hashSensitiveData(userId) : undefined,
      sessionId: sessionId ? this.hashSensitiveData(sessionId) : undefined,
      ipAddress: ipAddress ? this.hashSensitiveData(ipAddress) : undefined,
      userAgent: userAgent ? this.hashSensitiveData(userAgent) : undefined,
      details: this.sanitizeDetails(details),
      risk_score: this.calculateRiskScore(type, severity, details),
      correlationId: this.generateCorrelationId()
    }

    this.storeEvent(event)
    this.updateMetrics(event)
    this.checkAlertRules(event)
    this.logToConsole(event)

    // Forward to external monitoring systems if configured
    this.forwardToExternalSystems(event)
  }

  /**
   * Log authentication events
   */
  public logAuthentication(
    type: 'login_success' | 'login_failure' | 'logout',
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    details: Record<string, any> = {}
  ): void {
    const severity = type === 'login_failure' ? 'medium' : 'low'
    
    this.logEvent(
      type,
      severity,
      'authentication',
      'auth_system',
      {
        ...details,
        login_method: 'bitcoin_signature'
      },
      userId,
      undefined,
      ipAddress,
      userAgent
    )
  }

  /**
   * Log authorization events
   */
  public logAuthorization(
    success: boolean,
    resource: string,
    action: string,
    userId?: string,
    details: Record<string, any> = {}
  ): void {
    this.logEvent(
      success ? 'data_access' : 'unauthorized_access',
      success ? 'low' : 'high',
      'authorization',
      'access_control',
      {
        resource,
        action,
        ...details
      },
      userId
    )
  }

  /**
   * Log input validation failures
   */
  public logInputValidation(
    inputType: string,
    validationFailure: string,
    ipAddress?: string,
    details: Record<string, any> = {}
  ): void {
    const severity = this.determineSeverityFromValidation(validationFailure)
    
    this.logEvent(
      'input_validation_failure',
      severity,
      'input_validation',
      'input_validator',
      {
        input_type: inputType,
        failure_reason: validationFailure,
        ...details
      },
      undefined,
      undefined,
      ipAddress
    )
  }

  /**
   * Log security attacks
   */
  public logSecurityAttack(
    attackType: 'injection_attempt' | 'xss_attempt' | 'csrf_attack',
    ipAddress?: string,
    userAgent?: string,
    details: Record<string, any> = {}
  ): void {
    this.logEvent(
      attackType,
      'critical',
      'input_validation',
      'security_middleware',
      details,
      undefined,
      undefined,
      ipAddress,
      userAgent
    )
  }

  /**
   * Log rate limiting events
   */
  public logRateLimit(
    ipAddress: string,
    endpoint: string,
    requestCount: number,
    timeWindow: number
  ): void {
    this.logEvent(
      'rate_limit_exceeded',
      'medium',
      'system',
      'rate_limiter',
      {
        endpoint,
        request_count: requestCount,
        time_window: timeWindow
      },
      undefined,
      undefined,
      ipAddress
    )
  }

  /**
   * Get security metrics
   */
  public getMetrics(): SecurityMetrics {
    return { ...this.metrics }
  }

  /**
   * Get recent security events
   */
  public getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events
      .slice(-limit)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  /**
   * Get active security alerts
   */
  public getActiveAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => !alert.acknowledged)
  }

  /**
   * Acknowledge security alert
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      alert.resolvedAt = new Date().toISOString()
      return true
    }
    return false
  }

  /**
   * Search security events
   */
  public searchEvents(criteria: {
    type?: SecurityEventType
    severity?: string
    category?: string
    userId?: string
    ipAddress?: string
    startTime?: string
    endTime?: string
    limit?: number
  }): SecurityEvent[] {
    let filteredEvents = this.events

    if (criteria.type) {
      filteredEvents = filteredEvents.filter(e => e.type === criteria.type)
    }

    if (criteria.severity) {
      filteredEvents = filteredEvents.filter(e => e.severity === criteria.severity)
    }

    if (criteria.category) {
      filteredEvents = filteredEvents.filter(e => e.category === criteria.category)
    }

    if (criteria.userId) {
      const hashedUserId = this.hashSensitiveData(criteria.userId)
      filteredEvents = filteredEvents.filter(e => e.userId === hashedUserId)
    }

    if (criteria.ipAddress) {
      const hashedIpAddress = this.hashSensitiveData(criteria.ipAddress)
      filteredEvents = filteredEvents.filter(e => e.ipAddress === hashedIpAddress)
    }

    if (criteria.startTime) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= criteria.startTime!)
    }

    if (criteria.endTime) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= criteria.endTime!)
    }

    const limit = criteria.limit || 100
    return filteredEvents.slice(-limit)
  }

  /**
   * Generate security report
   */
  public generateSecurityReport(timeRange: 'hour' | 'day' | 'week' | 'month'): {
    summary: SecurityMetrics
    topThreats: Array<{ type: SecurityEventType; count: number }>
    riskTrend: Array<{ timestamp: string; riskScore: number }>
    recommendations: string[]
  } {
    const now = new Date()
    const startTime = new Date()
    
    switch (timeRange) {
      case 'hour':
        startTime.setHours(now.getHours() - 1)
        break
      case 'day':
        startTime.setDate(now.getDate() - 1)
        break
      case 'week':
        startTime.setDate(now.getDate() - 7)
        break
      case 'month':
        startTime.setMonth(now.getMonth() - 1)
        break
    }

    const events = this.events.filter(e => new Date(e.timestamp) >= startTime)
    
    return {
      summary: this.calculateMetricsForEvents(events),
      topThreats: this.getTopThreats(events),
      riskTrend: this.calculateRiskTrend(events),
      recommendations: this.generateRecommendations(events)
    }
  }

  /**
   * Private helper methods
   */
  private initializeMetrics(): SecurityMetrics {
    return {
      totalEvents: 0,
      eventsByType: {} as Record<SecurityEventType, number>,
      eventsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      eventsByCategory: {},
      failedLogins: 0,
      suspiciousActivities: 0,
      blockedRequests: 0,
      averageRiskScore: 0
    }
  }

  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'multiple_failed_logins',
        name: 'Multiple Failed Login Attempts',
        description: 'More than 5 failed login attempts in 15 minutes',
        condition: (events) => {
          const recentFailures = events.filter(e => 
            e.type === 'login_failure' && 
            new Date(e.timestamp).getTime() > Date.now() - 15 * 60 * 1000
          )
          return recentFailures.length >= 5
        },
        severity: 'high',
        enabled: true,
        threshold: 5,
        timeWindow: 15 * 60 * 1000
      },
      {
        id: 'injection_attack',
        name: 'Injection Attack Detected',
        description: 'Potential injection attack attempt',
        condition: (events) => {
          return events.some(e => e.type === 'injection_attempt')
        },
        severity: 'critical',
        enabled: true
      },
      {
        id: 'privilege_escalation',
        name: 'Privilege Escalation Attempt',
        description: 'Unauthorized access to privileged resources',
        condition: (events) => {
          return events.some(e => e.type === 'privilege_escalation')
        },
        severity: 'critical',
        enabled: true
      }
    ]
  }

  private generateEventId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    return `${timestamp}-${random}`
  }

  private generateCorrelationId(): string {
    return createHash('sha256')
      .update(`${Date.now()}-${Math.random()}`)
      .digest('hex')
      .substring(0, 16)
  }

  private hashSensitiveData(data: string): string {
    return createHash('sha256').update(data).digest('hex').substring(0, 16)
  }

  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'privateKey', 'sessionToken', 'apiKey', 'secret']
    const sanitized = { ...details }
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]'
      }
    })
    
    return sanitized
  }

  private calculateRiskScore(
    type: SecurityEventType,
    severity: string,
    details: Record<string, any>
  ): number {
    let score = 0
    
    // Base score by severity
    switch (severity) {
      case 'critical': score += 80; break
      case 'high': score += 60; break
      case 'medium': score += 40; break
      case 'low': score += 20; break
    }
    
    // Additional score by event type
    switch (type) {
      case 'injection_attempt':
      case 'xss_attempt':
      case 'privilege_escalation':
        score += 20
        break
      case 'login_failure':
      case 'unauthorized_access':
        score += 10
        break
    }
    
    return Math.min(score, 100)
  }

  private storeEvent(event: SecurityEvent): void {
    this.events.push(event)
    
    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
  }

  private updateMetrics(event: SecurityEvent): void {
    this.metrics.totalEvents++
    this.metrics.eventsByType[event.type] = (this.metrics.eventsByType[event.type] || 0) + 1
    this.metrics.eventsBySeverity[event.severity] = (this.metrics.eventsBySeverity[event.severity] || 0) + 1
    this.metrics.eventsByCategory[event.category] = (this.metrics.eventsByCategory[event.category] || 0) + 1
    
    if (event.type === 'login_failure') {
      this.metrics.failedLogins++
    }
    
    if (['injection_attempt', 'xss_attempt', 'csrf_attack'].includes(event.type)) {
      this.metrics.suspiciousActivities++
    }
    
    if (event.type === 'rate_limit_exceeded') {
      this.metrics.blockedRequests++
    }
    
    // Update average risk score
    const totalRiskScore = this.events.reduce((sum, e) => sum + e.risk_score, 0)
    this.metrics.averageRiskScore = totalRiskScore / this.events.length
  }

  private checkAlertRules(event: SecurityEvent): void {
    const recentEvents = this.events.filter(e => 
      new Date(e.timestamp).getTime() > Date.now() - 60 * 60 * 1000 // Last hour
    )

    for (const rule of this.alertRules) {
      if (rule.enabled && rule.condition(recentEvents)) {
        this.createAlert(rule, [event])
      }
    }
  }

  private createAlert(rule: AlertRule, triggerEvents: SecurityEvent[]): void {
    const alert: SecurityAlert = {
      id: this.generateEventId(),
      ruleId: rule.id,
      ruleName: rule.name,
      timestamp: new Date().toISOString(),
      severity: rule.severity,
      message: `Security alert: ${rule.description}`,
      events: triggerEvents,
      acknowledged: false
    }
    
    this.alerts.push(alert)
    
    // Log the alert as a security event
    this.logEvent(
      'security_alert',
      rule.severity,
      'system',
      'security_monitor',
      {
        rule_id: rule.id,
        rule_name: rule.name,
        trigger_events: triggerEvents.length
      }
    )
  }

  private logToConsole(event: SecurityEvent): void {
    const logLevel = this.getLogLevel(event.severity)
    const message = `[SECURITY] ${event.type} - ${event.severity.toUpperCase()} - ${event.source}`
    
    if (logLevel === 'error') {
      console.error(message, event)
    } else if (logLevel === 'warn') {
      console.warn(message, event)
    } else {
      console.log(message, event)
    }
  }

  private getLogLevel(severity: string): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error'
      case 'medium':
        return 'warn'
      default:
        return 'log'
    }
  }

  private forwardToExternalSystems(event: SecurityEvent): void {
    // In a real implementation, this would forward to external monitoring systems
    // like Splunk, ELK Stack, or cloud monitoring services
    if (process.env.NODE_ENV === 'production' && event.severity === 'critical') {
      // Example: Send to external monitoring
      console.log('Forwarding critical security event to external monitoring:', event.id)
    }
  }

  private determineSeverityFromValidation(failure: string): 'low' | 'medium' | 'high' | 'critical' {
    if (failure.includes('injection') || failure.includes('XSS') || failure.includes('attack')) {
      return 'critical'
    }
    if (failure.includes('suspicious') || failure.includes('malicious')) {
      return 'high'
    }
    if (failure.includes('format') || failure.includes('length')) {
      return 'medium'
    }
    return 'low'
  }

  private calculateMetricsForEvents(events: SecurityEvent[]): SecurityMetrics {
    const metrics: SecurityMetrics = {
      totalEvents: events.length,
      eventsByType: {} as Record<SecurityEventType, number>,
      eventsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      eventsByCategory: {},
      failedLogins: 0,
      suspiciousActivities: 0,
      blockedRequests: 0,
      averageRiskScore: 0
    }

    events.forEach(event => {
      metrics.eventsByType[event.type] = (metrics.eventsByType[event.type] || 0) + 1
      metrics.eventsBySeverity[event.severity]++
      metrics.eventsByCategory[event.category] = (metrics.eventsByCategory[event.category] || 0) + 1
      
      if (event.type === 'login_failure') metrics.failedLogins++
      if (['injection_attempt', 'xss_attempt', 'csrf_attack'].includes(event.type)) {
        metrics.suspiciousActivities++
      }
      if (event.type === 'rate_limit_exceeded') metrics.blockedRequests++
    })

    if (events.length > 0) {
      const totalRiskScore = events.reduce((sum, e) => sum + e.risk_score, 0)
      metrics.averageRiskScore = totalRiskScore / events.length
    }

    return metrics
  }

  private getTopThreats(events: SecurityEvent[]): Array<{ type: SecurityEventType; count: number }> {
    const threatCounts: Record<SecurityEventType, number> = {} as Record<SecurityEventType, number>
    
    events.forEach(event => {
      if (['injection_attempt', 'xss_attempt', 'csrf_attack', 'login_failure', 'unauthorized_access'].includes(event.type)) {
        threatCounts[event.type] = (threatCounts[event.type] || 0) + 1
      }
    })

    return Object.entries(threatCounts)
      .map(([type, count]) => ({ type: type as SecurityEventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private calculateRiskTrend(events: SecurityEvent[]): Array<{ timestamp: string; riskScore: number }> {
    const hourlyRisks: Record<string, number[]> = {}
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).toISOString().substring(0, 13)
      if (!hourlyRisks[hour]) hourlyRisks[hour] = []
      hourlyRisks[hour].push(event.risk_score)
    })

    return Object.entries(hourlyRisks)
      .map(([hour, scores]) => ({
        timestamp: hour + ':00:00.000Z',
        riskScore: scores.reduce((sum, score) => sum + score, 0) / scores.length
      }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }

  private generateRecommendations(events: SecurityEvent[]): string[] {
    const recommendations: string[] = []
    
    const failedLogins = events.filter(e => e.type === 'login_failure').length
    if (failedLogins > 10) {
      recommendations.push('Consider implementing account lockout policies')
      recommendations.push('Review authentication logs for potential brute force attacks')
    }

    const injectionAttempts = events.filter(e => e.type === 'injection_attempt').length
    if (injectionAttempts > 0) {
      recommendations.push('Review input validation mechanisms')
      recommendations.push('Consider implementing Web Application Firewall (WAF)')
    }

    const highRiskEvents = events.filter(e => e.risk_score > 70).length
    if (highRiskEvents > 5) {
      recommendations.push('Increase monitoring frequency')
      recommendations.push('Consider implementing additional security controls')
    }

    return recommendations
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      const cutoffTime = new Date()
      cutoffTime.setDate(cutoffTime.getDate() - this.retentionDays)
      
      this.events = this.events.filter(event => 
        new Date(event.timestamp) > cutoffTime
      )
      
      this.alerts = this.alerts.filter(alert => 
        new Date(alert.timestamp) > cutoffTime
      )
    }, 24 * 60 * 60 * 1000) // Run daily
  }
}

export const securityMonitor = SecurityMonitor.getInstance()