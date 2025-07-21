/**
 * Enterprise Security Configuration
 * Implements OWASP A05 - Security Misconfiguration prevention
 */

interface SecurityConfig {
  environment: 'development' | 'staging' | 'production'
  headers: SecurityHeaders
  cors: CorsConfig
  csp: ContentSecurityPolicy
  cookies: CookieConfig
  encryption: EncryptionConfig
  monitoring: MonitoringConfig
  features: FeatureFlags
}

interface SecurityHeaders {
  'Strict-Transport-Security': string
  'X-Content-Type-Options': string
  'X-Frame-Options': string
  'X-XSS-Protection': string
  'Referrer-Policy': string
  'Permissions-Policy': string
  'X-DNS-Prefetch-Control': string
  'X-Download-Options': string
  'X-Permitted-Cross-Domain-Policies': string
}

interface CorsConfig {
  origin: string[] | boolean
  credentials: boolean
  methods: string[]
  allowedHeaders: string[]
  exposedHeaders: string[]
  maxAge: number
  preflightContinue: boolean
  optionsSuccessStatus: number
}

interface ContentSecurityPolicy {
  directives: {
    'default-src': string[]
    'script-src': string[]
    'style-src': string[]
    'img-src': string[]
    'font-src': string[]
    'connect-src': string[]
    'media-src': string[]
    'object-src': string[]
    'child-src': string[]
    'worker-src': string[]
    'frame-ancestors': string[]
    'form-action': string[]
    'base-uri': string[]
    'manifest-src': string[]
  }
  reportUri?: string
  reportOnly: boolean
}

interface CookieConfig {
  secure: boolean
  httpOnly: boolean
  sameSite: 'strict' | 'lax' | 'none'
  domain?: string
  path: string
  maxAge: number
  signed: boolean
}

interface EncryptionConfig {
  algorithm: string
  keyLength: number
  ivLength: number
  saltLength: number
  iterations: number
  hashAlgorithm: string
}

interface MonitoringConfig {
  enableLogging: boolean
  logLevel: 'error' | 'warn' | 'info' | 'debug'
  enableMetrics: boolean
  enableTracing: boolean
  sensitiveFields: string[]
  retentionDays: number
}

interface FeatureFlags {
  enableDebugMode: boolean
  enableDetailedErrors: boolean
  enableSourceMaps: boolean
  enableAPIDocumentation: boolean
  enableDevelopmentTools: boolean
}

export class SecurityConfigManager {
  private static instance: SecurityConfigManager
  private config: SecurityConfig
  private readonly requiredEnvVars: string[] = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NODE_ENV'
  ]

  private constructor() {
    this.validateEnvironment()
    this.config = this.buildSecurityConfig()
    this.applySecurityHardening()
  }

  public static getInstance(): SecurityConfigManager {
    if (!SecurityConfigManager.instance) {
      SecurityConfigManager.instance = new SecurityConfigManager()
    }
    return SecurityConfigManager.instance
  }

  /**
   * Get security configuration for current environment
   */
  public getConfig(): SecurityConfig {
    return { ...this.config }
  }

  /**
   * Get security headers for HTTP responses
   */
  public getSecurityHeaders(): SecurityHeaders {
    return { ...this.config.headers }
  }

  /**
   * Get Content Security Policy as string
   */
  public getCSPString(): string {
    const directives = Object.entries(this.config.csp.directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ')
    
    return directives
  }

  /**
   * Get CORS configuration
   */
  public getCorsConfig(): CorsConfig {
    return { ...this.config.cors }
  }

  /**
   * Get cookie configuration
   */
  public getCookieConfig(): CookieConfig {
    return { ...this.config.cookies }
  }

  /**
   * Validate security configuration
   */
  public validateConfiguration(): {
    valid: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // Environment validation
    if (this.config.environment === 'production') {
      if (this.config.features.enableDebugMode) {
        issues.push('Debug mode enabled in production')
      }
      
      if (this.config.features.enableDetailedErrors) {
        issues.push('Detailed errors enabled in production')
      }
      
      if (this.config.features.enableSourceMaps) {
        recommendations.push('Consider disabling source maps in production')
      }
    }

    // Headers validation
    if (!this.config.headers['Strict-Transport-Security'].includes('max-age')) {
      issues.push('HSTS header missing max-age directive')
    }

    if (this.config.headers['X-Frame-Options'] === 'ALLOWALL') {
      issues.push('X-Frame-Options allows all frames (clickjacking risk)')
    }

    // CSP validation
    if (this.config.csp.directives['script-src'].includes("'unsafe-eval'")) {
      recommendations.push('Avoid unsafe-eval in script-src directive')
    }

    if (this.config.csp.directives['default-src'].includes('*')) {
      issues.push('Wildcard in default-src directive too permissive')
    }

    // Cookie validation
    if (!this.config.cookies.secure && this.config.environment === 'production') {
      issues.push('Cookies not marked as secure in production')
    }

    if (!this.config.cookies.httpOnly) {
      issues.push('Cookies not marked as HttpOnly')
    }

    if (this.config.cookies.sameSite === 'none' && this.config.environment === 'production') {
      recommendations.push('Consider using strict or lax SameSite policy')
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    }
  }

  /**
   * Apply security hardening measures
   */
  private applySecurityHardening(): void {
    // Disable X-Powered-By header
    if (typeof process !== 'undefined' && process.env) {
      process.env.NEXT_TELEMETRY_DISABLED = '1'
    }

    // Set secure defaults for production
    if (this.config.environment === 'production') {
      this.config.features.enableDebugMode = false
      this.config.features.enableDetailedErrors = false
      this.config.features.enableDevelopmentTools = false
    }
  }

  /**
   * Build security configuration based on environment
   */
  private buildSecurityConfig(): SecurityConfig {
    const environment = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development'
    const isProduction = environment === 'production'
    const isDevelopment = environment === 'development'

    return {
      environment,
      headers: this.buildSecurityHeaders(isProduction),
      cors: this.buildCorsConfig(isProduction),
      csp: this.buildCSPConfig(isProduction),
      cookies: this.buildCookieConfig(isProduction),
      encryption: this.buildEncryptionConfig(),
      monitoring: this.buildMonitoringConfig(isDevelopment),
      features: this.buildFeatureFlags(isDevelopment)
    }
  }

  private buildSecurityHeaders(isProduction: boolean): SecurityHeaders {
    return {
      'Strict-Transport-Security': isProduction 
        ? 'max-age=31536000; includeSubDomains; preload'
        : 'max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=()',
      'X-DNS-Prefetch-Control': 'off',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none'
    }
  }

  private buildCorsConfig(isProduction: boolean): CorsConfig {
    return {
      origin: isProduction 
        ? ['https://satslab.app', 'https://www.satslab.app']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-CSRF-Token'
      ],
      exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
      maxAge: 86400, // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204
    }
  }

  private buildCSPConfig(isProduction: boolean): ContentSecurityPolicy {
    const isDev = !isProduction

    return {
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
          'https://mempool.space'
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'" // Required for styled-components and CSS-in-JS
        ],
        'img-src': [
          "'self'",
          'data:',
          'https:',
          'https://mempool.space'
        ],
        'font-src': [
          "'self'",
          'data:'
        ],
        'connect-src': [
          "'self'",
          'https://mempool.space',
          'https://*.supabase.co',
          'wss://*.supabase.co',
          ...(isDev ? ['http://localhost:*', 'ws://localhost:*'] : [])
        ],
        'media-src': ["'self'", 'https://f005.backblazeb2.com', 'blob:', 'data:'],
        'object-src': ["'none'"],
        'child-src': ["'none'"],
        'worker-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        'base-uri': ["'self'"],
        'manifest-src': ["'self'"]
      },
      reportUri: isProduction ? '/api/csp-report' : undefined,
      reportOnly: isDev
    }
  }

  private buildCookieConfig(isProduction: boolean): CookieConfig {
    return {
      secure: isProduction,
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      signed: true
    }
  }

  private buildEncryptionConfig(): EncryptionConfig {
    return {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16,
      saltLength: 32,
      iterations: 100000,
      hashAlgorithm: 'sha256'
    }
  }

  private buildMonitoringConfig(isDevelopment: boolean): MonitoringConfig {
    return {
      enableLogging: true,
      logLevel: isDevelopment ? 'debug' : 'warn',
      enableMetrics: true,
      enableTracing: !isDevelopment,
      sensitiveFields: [
        'password',
        'privateKey',
        'sessionToken',
        'apiKey',
        'secret',
        'token'
      ],
      retentionDays: 30
    }
  }

  private buildFeatureFlags(isDevelopment: boolean): FeatureFlags {
    return {
      enableDebugMode: isDevelopment,
      enableDetailedErrors: isDevelopment,
      enableSourceMaps: isDevelopment,
      enableAPIDocumentation: isDevelopment,
      enableDevelopmentTools: isDevelopment
    }
  }

  /**
   * Validate required environment variables
   */
  private validateEnvironment(): void {
    const missing: string[] = []
    const insecure: string[] = []

    for (const envVar of this.requiredEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar)
      }
    }

    // Check for insecure values
    if (process.env.NODE_ENV === 'production') {
      if (process.env.SESSION_ENCRYPTION_KEY === 'development-key') {
        insecure.push('SESSION_ENCRYPTION_KEY uses default development value')
      }
      
      if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('test')) {
        insecure.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a test key')
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }

    if (insecure.length > 0) {
      console.warn('Security Warning: Insecure environment configuration detected:', insecure)
    }
  }

  /**
   * Generate secure random configuration values
   */
  public generateSecureDefaults(): {
    sessionKey: string
    csrfSecret: string
    cookieSecret: string
  } {
    const crypto = require('crypto')
    
    return {
      sessionKey: crypto.randomBytes(64).toString('hex'),
      csrfSecret: crypto.randomBytes(32).toString('hex'),
      cookieSecret: crypto.randomBytes(32).toString('hex')
    }
  }

  /**
   * Export configuration for deployment
   */
  public exportConfigForDeployment(): {
    environment: string
    securityHeaders: SecurityHeaders
    cspHeader: string
    corsConfig: CorsConfig
  } {
    return {
      environment: this.config.environment,
      securityHeaders: this.getSecurityHeaders(),
      cspHeader: this.getCSPString(),
      corsConfig: this.getCorsConfig()
    }
  }
}

/**
 * Security configuration validation utility
 */
export class SecurityConfigValidator {
  static validateProductionReadiness(config: SecurityConfig): {
    ready: boolean
    blockers: string[]
    warnings: string[]
  } {
    const blockers: string[] = []
    const warnings: string[] = []

    if (config.environment !== 'production') {
      return { ready: false, blockers: ['Not in production environment'], warnings: [] }
    }

    // Critical security checks
    if (config.features.enableDebugMode) {
      blockers.push('Debug mode must be disabled in production')
    }

    if (config.features.enableDetailedErrors) {
      blockers.push('Detailed error reporting must be disabled in production')
    }

    if (!config.cookies.secure) {
      blockers.push('Cookies must be marked as secure in production')
    }

    if (!config.headers['Strict-Transport-Security'].includes('max-age')) {
      blockers.push('HSTS header must include max-age directive')
    }

    // Warning-level checks
    if (config.features.enableSourceMaps) {
      warnings.push('Consider disabling source maps in production')
    }

    if (config.csp.directives['script-src'].includes("'unsafe-eval'")) {
      warnings.push('Avoid unsafe-eval in CSP script-src directive')
    }

    return {
      ready: blockers.length === 0,
      blockers,
      warnings
    }
  }
}

export const securityConfig = SecurityConfigManager.getInstance()