/**
 * Enterprise Security Headers
 * Implements comprehensive security headers based on OWASP recommendations
 */

import { NextResponse } from 'next/server'

export class SecurityHeaders {
  /**
   * Get Content Security Policy for different page types
   */
  static getCSP(pageType: 'general' | 'admin' | 'payment' | 'video' = 'general'): string {
    const baseCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://www.gstatic.com https://ssl.gstatic.com https://www.youtube.com https://s.ytimg.com https://mempool.space",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https://api.exchangerate-api.com https://www.youtube.com https://*.supabase.co https://*.supabase.io wss://*.supabase.co wss://*.supabase.io",
      "frame-src 'self' https://www.youtube.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ]

    // Additional restrictions by page type
    switch (pageType) {
      case 'admin':
        return baseCSP.concat([
          "frame-ancestors 'none'",
          "upgrade-insecure-requests"
        ]).join('; ')

      case 'payment':
        return baseCSP.concat([
          "frame-ancestors 'none'",
          "upgrade-insecure-requests",
          "connect-src 'self' https://*.btcpayserver.org https://*.btcpayserver.com https://api.exchangerate-api.com https://*.supabase.co wss://*.supabase.co"
        ]).join('; ')

      case 'video':
        return baseCSP.concat([
          "media-src 'self' blob: https://*.backblazeb2.com https://*.b2-eu-west-001.backblazeb2.com https://www.youtube.com",
          "connect-src 'self' https://*.backblazeb2.com https://*.b2-eu-west-001.backblazeb2.com https://www.youtube.com https://*.supabase.co wss://*.supabase.co"
        ]).join('; ')

      default:
        return baseCSP.join('; ')
    }
  }

  /**
   * Apply comprehensive security headers to response
   */
  static applySecurityHeaders(
    response: NextResponse,
    options: {
      pageType?: 'general' | 'admin' | 'payment' | 'video'
      enableHSTS?: boolean
      enableCSP?: boolean
      enableNoSniff?: boolean
      enableFrameOptions?: boolean
      enableXSSProtection?: boolean
      enableReferrerPolicy?: boolean
      enablePermissionsPolicy?: boolean
    } = {}
  ): NextResponse {
    const {
      pageType = 'general',
      enableHSTS = true,
      enableCSP = true,
      enableNoSniff = true,
      enableFrameOptions = true,
      enableXSSProtection = true,
      enableReferrerPolicy = true,
      enablePermissionsPolicy = true
    } = options

    // Content Security Policy
    if (enableCSP) {
      response.headers.set('Content-Security-Policy', this.getCSP(pageType))
    }

    // HTTP Strict Transport Security (HSTS)
    if (enableHSTS && process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }

    // Prevent MIME type sniffing
    if (enableNoSniff) {
      response.headers.set('X-Content-Type-Options', 'nosniff')
    }

    // Clickjacking protection
    if (enableFrameOptions) {
      if (pageType === 'admin' || pageType === 'payment') {
        response.headers.set('X-Frame-Options', 'DENY')
      } else {
        response.headers.set('X-Frame-Options', 'SAMEORIGIN')
      }
    }

    // XSS Protection (legacy but still useful)
    if (enableXSSProtection) {
      response.headers.set('X-XSS-Protection', '1; mode=block')
    }

    // Referrer Policy
    if (enableReferrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    // Permissions Policy (formerly Feature Policy)
    if (enablePermissionsPolicy) {
      const permissionsPolicy = [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=(self)',
        'usb=()',
        'accelerometer=()',
        'gyroscope=()',
        'magnetometer=()'
      ].join(', ')
      
      response.headers.set('Permissions-Policy', permissionsPolicy)
    }

    // Additional security headers
    response.headers.set('X-Powered-By', '') // Remove server fingerprinting
    response.headers.set('Server', '') // Remove server information
    
    // Cache control for sensitive pages
    if (pageType === 'admin' || pageType === 'payment') {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }

    return response
  }

  /**
   * Apply API-specific security headers
   */
  static applyAPIHeaders(response: NextResponse, isAuthenticated: boolean = false): NextResponse {
    // Basic security headers for APIs
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'no-referrer')
    
    // CORS headers (restrictive)
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_BASE_URL,
      'http://localhost:3000',
      'https://satslabpro.com'
    ].filter(Boolean)

    response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0] || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

    // Prevent caching of authenticated responses
    if (isAuthenticated) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
    }

    return response
  }

  /**
   * Apply file upload security headers
   */
  static applyUploadHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Content-Disposition', 'attachment')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Frame-Options', 'DENY')
    
    return response
  }

  /**
   * Generate nonce for inline scripts (if needed)
   */
  static generateNonce(): string {
    const crypto = require('crypto')
    return crypto.randomBytes(16).toString('base64')
  }

  /**
   * Create secure cookie options
   */
  static getSecureCookieOptions(): {
    httpOnly: boolean
    secure: boolean
    sameSite: 'strict' | 'lax' | 'none'
    maxAge: number
    path: string
  } {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    }
  }

  /**
   * Validate and sanitize Content-Type header
   */
  static validateContentType(contentType: string): boolean {
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain'
    ]

    return allowedTypes.some(type => contentType.startsWith(type))
  }

  /**
   * Check if request has suspicious headers
   */
  static hasSuspiciousHeaders(request: Request): { suspicious: boolean; reason?: string } {
    const headers = request.headers
    const userAgent = headers.get('user-agent') || ''
    const contentType = headers.get('content-type') || ''

    // Check for empty or suspicious user agent
    if (!userAgent || userAgent.length < 10) {
      return { suspicious: true, reason: 'Suspicious or missing user agent' }
    }

    // Check for bot patterns in user agent
    const botPatterns = /bot|crawler|spider|scraper|curl|wget|postman/i
    if (botPatterns.test(userAgent)) {
      return { suspicious: true, reason: 'Bot user agent detected' }
    }

    // Check for invalid content type on POST/PUT requests
    const method = request.method
    if ((method === 'POST' || method === 'PUT') && contentType && !this.validateContentType(contentType)) {
      return { suspicious: true, reason: 'Invalid content type' }
    }

    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-host', 'x-real-ip', 'x-originating-ip']
    for (const header of suspiciousHeaders) {
      const value = headers.get(header)
      if (value && (value.includes('..') || value.includes('localhost') || value.includes('127.0.0.1'))) {
        return { suspicious: true, reason: `Suspicious ${header} header` }
      }
    }

    return { suspicious: false }
  }
}