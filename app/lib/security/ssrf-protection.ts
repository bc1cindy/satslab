/**
 * Server-Side Request Forgery (SSRF) Protection
 * Implements OWASP A10 - Server-Side Request Forgery prevention
 */

import { URL } from 'url'
import { createHash } from 'crypto'

interface SSRFConfig {
  allowedDomains: string[]
  allowedProtocols: string[]
  blockedDomains: string[]
  blockedIPs: string[]
  allowPrivateIPs: boolean
  allowLoopback: boolean
  maxRedirects: number
  timeout: number
  userAgent: string
}

interface URLValidationResult {
  isValid: boolean
  url?: URL
  errors: string[]
  warnings: string[]
  risk: 'low' | 'medium' | 'high' | 'critical'
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: string
  timeout?: number
  followRedirects?: boolean
  validateSSL?: boolean
}

export class SSRFProtection {
  private static instance: SSRFProtection
  private config: SSRFConfig
  private readonly privateIPRanges = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^224\./,
    /^240\./,
    /^255\.255\.255\.255$/
  ]

  private readonly ipv6PrivateRanges = [
    /^::1$/,
    /^fc00:/,
    /^fd00:/,
    /^fe80:/,
    /^ff00:/
  ]

  private constructor() {
    this.config = this.getDefaultConfig()
  }

  public static getInstance(): SSRFProtection {
    if (!SSRFProtection.instance) {
      SSRFProtection.instance = new SSRFProtection()
    }
    return SSRFProtection.instance
  }

  /**
   * Validate URL for SSRF vulnerabilities
   */
  public validateURL(urlString: string): URLValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let risk: 'low' | 'medium' | 'high' | 'critical' = 'low'

    try {
      const url = new URL(urlString)

      // Protocol validation
      if (!this.config.allowedProtocols.includes(url.protocol.slice(0, -1))) {
        errors.push(`Protocol '${url.protocol}' is not allowed`)
        risk = 'high'
      }

      // Domain validation
      if (this.config.allowedDomains.length > 0) {
        const isAllowedDomain = this.config.allowedDomains.some(domain => {
          if (domain.startsWith('*.')) {
            const baseDomain = domain.slice(2)
            return url.hostname.endsWith(baseDomain)
          }
          return url.hostname === domain
        })

        if (!isAllowedDomain) {
          errors.push(`Domain '${url.hostname}' is not in allowed list`)
          risk = 'high'
        }
      }

      // Blocked domain validation
      if (this.config.blockedDomains.length > 0) {
        const isBlockedDomain = this.config.blockedDomains.some(domain => {
          if (domain.startsWith('*.')) {
            const baseDomain = domain.slice(2)
            return url.hostname.endsWith(baseDomain)
          }
          return url.hostname === domain
        })

        if (isBlockedDomain) {
          errors.push(`Domain '${url.hostname}' is blocked`)
          risk = 'critical'
        }
      }

      // IP address validation
      const isIP = this.isIPAddress(url.hostname)
      if (isIP) {
        // Check if IP is blocked
        if (this.config.blockedIPs.includes(url.hostname)) {
          errors.push(`IP address '${url.hostname}' is blocked`)
          risk = 'critical'
        }

        // Check private IP ranges
        if (!this.config.allowPrivateIPs && this.isPrivateIP(url.hostname)) {
          errors.push(`Private IP address '${url.hostname}' is not allowed`)
          risk = 'critical'
        }

        // Check loopback addresses
        if (!this.config.allowLoopback && this.isLoopbackIP(url.hostname)) {
          errors.push(`Loopback IP address '${url.hostname}' is not allowed`)
          risk = 'critical'
        }
      }

      // Port validation
      if (url.port) {
        const port = parseInt(url.port)
        if (this.isDangerousPort(port)) {
          errors.push(`Port ${port} is potentially dangerous`)
          risk = 'high'
        }
      }

      // Username/password in URL
      if (url.username || url.password) {
        warnings.push('URL contains credentials')
        risk = 'medium'
      }

      // Check for URL encoding attacks
      if (this.hasEncodingAttacks(urlString)) {
        errors.push('URL contains suspicious encoding patterns')
        risk = 'high'
      }

      // Check for DNS rebinding attempts
      if (this.isDNSRebindingAttempt(url.hostname)) {
        errors.push('Potential DNS rebinding attempt detected')
        risk = 'critical'
      }

      return {
        isValid: errors.length === 0,
        url: errors.length === 0 ? url : undefined,
        errors,
        warnings,
        risk
      }

    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid URL format'],
        warnings: [],
        risk: 'medium'
      }
    }
  }

  /**
   * Make a secure HTTP request with SSRF protection
   */
  public async makeSecureRequest(
    urlString: string, 
    options: RequestOptions = {}
  ): Promise<{
    success: boolean
    data?: any
    status?: number
    headers?: Record<string, string>
    error?: string
  }> {
    // Validate URL first
    const validation = this.validateURL(urlString)
    if (!validation.isValid) {
      return {
        success: false,
        error: `URL validation failed: ${validation.errors.join(', ')}`
      }
    }

    if (!validation.url) {
      return {
        success: false,
        error: 'Invalid URL'
      }
    }

    try {
      // Prepare request options
      const requestOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'User-Agent': this.config.userAgent,
          ...options.headers
        },
        signal: AbortSignal.timeout(options.timeout || this.config.timeout),
        redirect: options.followRedirects !== false ? 'follow' : 'manual'
      }

      if (options.body && (options.method === 'POST' || options.method === 'PUT')) {
        requestOptions.body = options.body
      }

      // Make the request
      const response = await fetch(validation.url.toString(), requestOptions)

      // Check for suspicious redirects
      if (response.redirected && options.followRedirects !== false) {
        const finalURL = response.url
        const finalValidation = this.validateURL(finalURL)
        if (!finalValidation.isValid) {
          return {
            success: false,
            error: `Redirect to unsafe URL: ${finalValidation.errors.join(', ')}`
          }
        }
      }

      // Parse response
      const contentType = response.headers.get('content-type') || ''
      let data: any

      if (contentType.includes('application/json')) {
        data = await response.json()
      } else if (contentType.includes('text/')) {
        data = await response.text()
      } else {
        data = await response.blob()
      }

      // Convert headers to object
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      return {
        success: response.ok,
        data,
        status: response.status,
        headers
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout'
          }
        }
        return {
          success: false,
          error: error.message
        }
      }
      return {
        success: false,
        error: 'Unknown error occurred'
      }
    }
  }

  /**
   * Validate and resolve hostname to IP
   */
  public async validateAndResolveHostname(hostname: string): Promise<{
    isValid: boolean
    ips: string[]
    errors: string[]
  }> {
    const errors: string[] = []

    try {
      // Use DNS lookup to resolve hostname
      const { promises: dns } = require('dns')
      const ips = await dns.resolve4(hostname).catch(() => [])
      
      // Validate each resolved IP
      for (const ip of ips) {
        if (this.config.blockedIPs.includes(ip)) {
          errors.push(`Resolved IP ${ip} is blocked`)
        }

        if (!this.config.allowPrivateIPs && this.isPrivateIP(ip)) {
          errors.push(`Resolved IP ${ip} is private`)
        }

        if (!this.config.allowLoopback && this.isLoopbackIP(ip)) {
          errors.push(`Resolved IP ${ip} is loopback`)
        }
      }

      return {
        isValid: errors.length === 0,
        ips,
        errors
      }

    } catch (error) {
      return {
        isValid: false,
        ips: [],
        errors: ['DNS resolution failed']
      }
    }
  }

  /**
   * Check if URL is safe for external requests
   */
  public isSafeForExternalRequest(urlString: string): boolean {
    const validation = this.validateURL(urlString)
    return validation.isValid && validation.risk !== 'critical'
  }

  /**
   * Get SSRF protection report
   */
  public getProtectionReport(): {
    config: SSRFConfig
    blockedDomains: string[]
    allowedDomains: string[]
    securityLevel: 'low' | 'medium' | 'high'
  } {
    let securityLevel: 'low' | 'medium' | 'high' = 'low'

    if (!this.config.allowPrivateIPs && !this.config.allowLoopback) {
      securityLevel = 'high'
    } else if (this.config.allowedDomains.length > 0) {
      securityLevel = 'medium'
    }

    return {
      config: { ...this.config },
      blockedDomains: [...this.config.blockedDomains],
      allowedDomains: [...this.config.allowedDomains],
      securityLevel
    }
  }

  /**
   * Private helper methods
   */
  private getDefaultConfig(): SSRFConfig {
    return {
      allowedDomains: [
        'mempool.space',
        '*.mempool.space',
        'api.mempool.space',
        'blockstream.info',
        '*.blockstream.info',
        'signetfaucet.com',
        'starbackr.me'
      ],
      allowedProtocols: ['http', 'https'],
      blockedDomains: [
        'localhost',
        '*.local',
        'metadata.google.internal',
        '169.254.169.254'
      ],
      blockedIPs: [
        '169.254.169.254', // AWS metadata
        '169.254.170.2',   // AWS metadata v2
        '127.0.0.1',       // Localhost
        '::1'              // IPv6 localhost
      ],
      allowPrivateIPs: false,
      allowLoopback: false,
      maxRedirects: 3,
      timeout: 10000, // 10 seconds
      userAgent: 'SatsLab-SecureClient/1.0'
    }
  }

  private isIPAddress(hostname: string): boolean {
    // IPv4
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    
    // IPv6
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
    
    return ipv4Regex.test(hostname) || ipv6Regex.test(hostname)
  }

  private isPrivateIP(ip: string): boolean {
    // IPv4 private ranges
    for (const range of this.privateIPRanges) {
      if (range.test(ip)) {
        return true
      }
    }

    // IPv6 private ranges
    for (const range of this.ipv6PrivateRanges) {
      if (range.test(ip)) {
        return true
      }
    }

    return false
  }

  private isLoopbackIP(ip: string): boolean {
    return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('127.')
  }

  private isDangerousPort(port: number): boolean {
    const dangerousPorts = [
      22,    // SSH
      23,    // Telnet
      25,    // SMTP
      53,    // DNS
      110,   // POP3
      143,   // IMAP
      993,   // IMAPS
      995,   // POP3S
      1433,  // SQL Server
      3306,  // MySQL
      5432,  // PostgreSQL
      6379,  // Redis
      27017, // MongoDB
      3389,  // RDP
      5900,  // VNC
      11211  // Memcached
    ]

    return dangerousPorts.includes(port) || port < 1024
  }

  private hasEncodingAttacks(url: string): boolean {
    // Check for double encoding
    if (url.includes('%25')) {
      return true
    }

    // Check for Unicode encoding attacks
    if (url.includes('\\u')) {
      return true
    }

    // Check for hex encoding of dangerous characters
    const dangerousHex = ['%00', '%0A', '%0D', '%2F', '%5C']
    return dangerousHex.some(hex => url.includes(hex))
  }

  private isDNSRebindingAttempt(hostname: string): boolean {
    // Check for IP addresses in subdomain format (like 192-168-1-1.evil.com)
    const ipInSubdomain = /\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3}/
    if (ipInSubdomain.test(hostname)) {
      return true
    }

    // Check for localhost variations
    const localhostVariations = [
      'localhost',
      'lvh.me',
      'localtest.me',
      'vcap.me',
      'lacolhost.com',
      'localho.st'
    ]

    return localhostVariations.some(variant => hostname.includes(variant))
  }

  /**
   * Create URL hash for caching/logging
   */
  public createURLHash(url: string): string {
    return createHash('sha256').update(url).digest('hex').substring(0, 16)
  }

  /**
   * Sanitize URL for logging
   */
  public sanitizeURLForLogging(url: string): string {
    try {
      const urlObj = new URL(url)
      
      // Remove credentials
      urlObj.username = ''
      urlObj.password = ''
      
      // Remove query parameters that might contain sensitive data
      const sensitiveParams = ['token', 'key', 'password', 'secret', 'auth']
      const params = new URLSearchParams(urlObj.search)
      
      for (const [key] of Array.from(params.entries())) {
        if (sensitiveParams.some(sensitive => key.toLowerCase().includes(sensitive))) {
          params.set(key, '[REDACTED]')
        }
      }
      
      urlObj.search = params.toString()
      
      return urlObj.toString()
    } catch {
      return '[INVALID_URL]'
    }
  }
}

// Export singleton instance
export const ssrfProtection = SSRFProtection.getInstance()

// Utility function for easy URL validation
export function validateExternalURL(url: string): URLValidationResult {
  return ssrfProtection.validateURL(url)
}

// Utility function for safe external requests
export async function makeSafeRequest(url: string, options?: RequestOptions) {
  return ssrfProtection.makeSecureRequest(url, options)
}