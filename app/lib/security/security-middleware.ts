/**
 * Enterprise Security Middleware
 * Implements OWASP security controls for Next.js
 */

import { NextRequest, NextResponse } from 'next/server'
import { sessionManager } from './session-manager'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface SecurityHeaders {
  'Content-Security-Policy'?: string
  'X-Frame-Options'?: string
  'X-Content-Type-Options'?: string
  'X-XSS-Protection'?: string
  'Strict-Transport-Security'?: string
  'Referrer-Policy'?: string
  'Permissions-Policy'?: string
}

class SecurityMiddleware {
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()
  private rateLimitConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // requests per window
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }

  private securityHeaders: SecurityHeaders = {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mempool.space",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://mempool.space https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }

  constructor() {
    // Clean up rate limit store every hour
    setInterval(() => this.cleanupRateLimitStore(), 60 * 60 * 1000)
  }

  /**
   * Main security middleware function
   */
  public async handleRequest(request: NextRequest): Promise<NextResponse | null> {
    const clientIP = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    const path = request.nextUrl.pathname

    // Apply rate limiting
    const rateLimitResult = this.checkRateLimit(clientIP, path)
    if (!rateLimitResult.allowed) {
      return this.createRateLimitResponse(rateLimitResult)
    }

    // Validate session for protected routes
    if (this.isProtectedRoute(path)) {
      const sessionValidation = await this.validateSession(request)
      if (!sessionValidation.valid) {
        return this.createUnauthorizedResponse(sessionValidation.reason)
      }
    }

    // Validate CSRF for state-changing operations
    if (this.isStateChangingOperation(request)) {
      const csrfValidation = this.validateCSRF(request)
      if (!csrfValidation.valid) {
        return this.createCSRFErrorResponse()
      }
    }

    // Check for suspicious patterns
    const threatDetection = this.detectThreats(request)
    if (threatDetection.blocked) {
      return this.createThreatBlockedResponse(threatDetection.reason || 'Unknown threat detected')
    }

    return null // Continue to next middleware/handler
  }

  /**
   * Add security headers to response
   */
  public addSecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(this.securityHeaders).forEach(([header, value]) => {
      if (value) {
        response.headers.set(header, value)
      }
    })

    // Add additional headers based on environment
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('X-Powered-By', '') // Remove server fingerprinting
      response.headers.set('Server', '') // Remove server fingerprinting
    }

    return response
  }

  /**
   * Rate limiting implementation
   */
  private checkRateLimit(clientIP: string, path: string): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const key = `${clientIP}:${path}`
    const now = Date.now()
    const windowStart = now - this.rateLimitConfig.windowMs

    let record = this.rateLimitStore.get(key)
    
    if (!record || record.resetTime <= now) {
      record = {
        count: 0,
        resetTime: now + this.rateLimitConfig.windowMs
      }
    }

    record.count++
    this.rateLimitStore.set(key, record)

    const allowed = record.count <= this.rateLimitConfig.maxRequests
    const remaining = Math.max(0, this.rateLimitConfig.maxRequests - record.count)

    return {
      allowed,
      remaining,
      resetTime: record.resetTime
    }
  }

  /**
   * Session validation for protected routes
   */
  private async validateSession(request: NextRequest): Promise<{
    valid: boolean
    reason?: string
    session?: any
  }> {
    const sessionToken = this.extractSessionToken(request)
    if (!sessionToken) {
      return { valid: false, reason: 'No session token' }
    }

    const clientInfo = {
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || ''
    }

    const session = sessionManager.validateSession(sessionToken, clientInfo)
    if (!session) {
      return { valid: false, reason: 'Invalid or expired session' }
    }

    return { valid: true, session }
  }

  /**
   * CSRF token validation
   */
  private validateCSRF(request: NextRequest): { valid: boolean; reason?: string } {
    const sessionToken = this.extractSessionToken(request)
    const csrfToken = request.headers.get('x-csrf-token') || 
                     request.nextUrl.searchParams.get('_token')

    if (!sessionToken || !csrfToken) {
      return { valid: false, reason: 'Missing CSRF token' }
    }

    const isValid = sessionManager.validateCSRFToken(sessionToken, csrfToken)
    return { valid: isValid, reason: isValid ? undefined : 'Invalid CSRF token' }
  }

  /**
   * Threat detection patterns
   */
  private detectThreats(request: NextRequest): { blocked: boolean; reason?: string } {
    const url = request.nextUrl.toString()
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    // SQL Injection patterns
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b)/i,
      /(\b(EXEC|EXECUTE|SP_|XP_)\b)/i,
      /([\'\";](\s)*(OR|AND)(\s)*[\'\"]?(\s)*[\'\"])/i,
      /(\b(WAITFOR|DELAY)\b)/i
    ]

    // XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ]

    // Path traversal patterns
    const pathTraversalPatterns = [
      /\.\.\//g,
      /\.\.\\+/g,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi
    ]

    // Check for malicious patterns
    const allPatterns = [...sqlInjectionPatterns, ...xssPatterns, ...pathTraversalPatterns]
    
    for (const pattern of allPatterns) {
      if (pattern.test(url)) {
        return { blocked: true, reason: 'Malicious URL pattern detected' }
      }
    }

    // Check for suspicious user agents
    const suspiciousUserAgents = [
      /sqlmap/i,
      /nikto/i,
      /burp/i,
      /nmap/i,
      /dirb/i,
      /masscan/i
    ]

    for (const pattern of suspiciousUserAgents) {
      if (pattern.test(userAgent)) {
        return { blocked: true, reason: 'Suspicious user agent' }
      }
    }

    // Check for unusual request patterns
    if (request.headers.get('content-length')) {
      const contentLength = parseInt(request.headers.get('content-length') || '0')
      if (contentLength > 10 * 1024 * 1024) { // 10MB limit
        return { blocked: true, reason: 'Excessive content length' }
      }
    }

    return { blocked: false }
  }

  /**
   * Helper methods
   */
  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
           request.headers.get('x-real-ip') ||
           request.headers.get('cf-connecting-ip') ||
           request.ip ||
           'unknown'
  }

  private extractSessionToken(request: NextRequest): string | null {
    // Try cookie first (preferred)
    const cookieToken = request.cookies.get('session_token')?.value
    if (cookieToken) return cookieToken

    // Fallback to Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    return null
  }

  private isProtectedRoute(path: string): boolean {
    const protectedRoutes = [
      '/dashboard',
      '/modules/2',
      '/modules/3',
      '/modules/4',
      '/modules/5',
      '/modules/6',
      '/modules/7',
      '/api/user',
      '/api/progress'
    ]

    return protectedRoutes.some(route => path.startsWith(route))
  }

  private isStateChangingOperation(request: NextRequest): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  }

  private cleanupRateLimitStore(): void {
    const now = Date.now()
    for (const [key, record] of Array.from(this.rateLimitStore.entries())) {
      if (record.resetTime <= now) {
        this.rateLimitStore.delete(key)
      }
    }
  }

  /**
   * Response creators
   */
  private createRateLimitResponse(rateLimitResult: any): NextResponse {
    const response = NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      },
      { status: 429 }
    )

    response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString())
    response.headers.set('X-RateLimit-Limit', this.rateLimitConfig.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())

    return this.addSecurityHeaders(response)
  }

  private createUnauthorizedResponse(reason?: string): NextResponse {
    const response = NextResponse.json(
      { 
        error: 'Unauthorized',
        message: 'Authentication required to access this resource.',
        reason: process.env.NODE_ENV === 'development' ? reason : undefined
      },
      { status: 401 }
    )

    return this.addSecurityHeaders(response)
  }

  private createCSRFErrorResponse(): NextResponse {
    const response = NextResponse.json(
      { 
        error: 'CSRF Token Mismatch',
        message: 'Invalid or missing CSRF token.'
      },
      { status: 403 }
    )

    return this.addSecurityHeaders(response)
  }

  private createThreatBlockedResponse(reason: string): NextResponse {
    const response = NextResponse.json(
      { 
        error: 'Request Blocked',
        message: 'Request blocked by security policy.',
        reason: process.env.NODE_ENV === 'development' ? reason : undefined
      },
      { status: 403 }
    )

    return this.addSecurityHeaders(response)
  }
}

export const securityMiddleware = new SecurityMiddleware()