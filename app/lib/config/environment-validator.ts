/**
 * Environment Configuration Validator
 * Implements secure environment variable validation and sanitization
 * SECURITY: Prevents secrets exposure and validates configuration integrity
 */

import { securityLogger, SecurityEventType } from '../security/security-logger'

export interface EnvironmentVariable {
  name: string
  required: boolean
  sensitive: boolean
  defaultValue?: string
  validator?: (value: string) => boolean
  description: string
}

export interface ValidationResult {
  valid: boolean
  missing: string[]
  invalid: string[]
  insecure: string[]
  warnings: string[]
  recommendations: string[]
}

export interface SanitizedEnvironment {
  [key: string]: string
}

export class EnvironmentValidator {
  private static instance: EnvironmentValidator
  private readonly requiredVariables: EnvironmentVariable[]
  private readonly sensitivePatterns: RegExp[]
  private validatedEnvironment: SanitizedEnvironment | null = null

  private constructor() {
    this.requiredVariables = this.defineRequiredVariables()
    this.sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /credential/i,
      /auth/i
    ]
  }

  public static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator()
    }
    return EnvironmentValidator.instance
  }

  /**
   * Validate all environment variables
   */
  public validateEnvironment(): ValidationResult {
    const missing: string[] = []
    const invalid: string[] = []
    const insecure: string[] = []
    const warnings: string[] = []
    const recommendations: string[] = []

    const environment = process.env
    const isProduction = environment.NODE_ENV === 'production'

    // Check required variables
    for (const variable of this.requiredVariables) {
      const value = environment[variable.name]

      if (!value && variable.required) {
        missing.push(variable.name)
        continue
      }

      if (value && variable.validator && !variable.validator(value)) {
        invalid.push(`${variable.name}: Invalid format or value`)
        continue
      }

      // Production security checks
      if (isProduction) {
        if (variable.sensitive && this.isInsecureValue(value)) {
          insecure.push(`${variable.name}: Using insecure or default value`)
        }

        if (value?.includes('demo') || value?.includes('test') || value?.includes('localhost')) {
          insecure.push(`${variable.name}: Contains development/test values`)
        }
      }

      // Generate recommendations
      if (variable.sensitive && !this.isStrongSecret(value)) {
        recommendations.push(`${variable.name}: Consider using a stronger secret`)
      }
    }

    // Check for unexpected sensitive variables
    const unexpectedSensitive = this.findUnexpectedSensitiveVariables(environment)
    warnings.push(...unexpectedSensitive)

    // Log validation results
    this.logValidationResults({ missing, invalid, insecure, warnings })

    return {
      valid: missing.length === 0 && invalid.length === 0 && insecure.length === 0,
      missing,
      invalid,
      insecure,
      warnings,
      recommendations
    }
  }

  /**
   * Get sanitized environment for safe usage
   */
  public getSanitizedEnvironment(): SanitizedEnvironment {
    if (!this.validatedEnvironment) {
      const validation = this.validateEnvironment()
      
      if (!validation.valid) {
        throw new Error(`Environment validation failed: ${[
          ...validation.missing.map(v => `Missing: ${v}`),
          ...validation.invalid.map(v => `Invalid: ${v}`),
          ...validation.insecure.map(v => `Insecure: ${v}`)
        ].join(', ')}`)
      }

      this.validatedEnvironment = this.sanitizeEnvironment()
    }

    return { ...this.validatedEnvironment }
  }

  /**
   * Generate secure default values for development
   */
  public generateSecureDefaults(): { [key: string]: string } {
    const crypto = require('crypto')
    
    return {
      NEXTAUTH_SECRET: crypto.randomBytes(64).toString('hex'),
      ENCRYPTION_SECRET: crypto.randomBytes(32).toString('hex'),
      UPLOAD_SECRET: crypto.randomBytes(32).toString('hex'),
      WEBHOOK_SECRET: crypto.randomBytes(32).toString('hex'),
      SESSION_ENCRYPTION_KEY: crypto.randomBytes(64).toString('hex')
    }
  }

  /**
   * Validate specific configuration category
   */
  public validateConfigurationCategory(category: 'auth' | 'database' | 'storage' | 'payment' | 'security'): ValidationResult {
    const categoryVariables = this.requiredVariables.filter(v => 
      v.name.toLowerCase().includes(category) || 
      this.getCategoryVariables(category).includes(v.name)
    )

    return this.validateVariables(categoryVariables)
  }

  /**
   * Check if environment is ready for production
   */
  public isProductionReady(): { ready: boolean; blockers: string[]; warnings: string[] } {
    const validation = this.validateEnvironment()
    const blockers: string[] = []
    const warnings: string[] = []

    if (process.env.NODE_ENV !== 'production') {
      return { ready: false, blockers: ['NODE_ENV must be set to production'], warnings: [] }
    }

    // Critical blockers
    blockers.push(...validation.missing.map(v => `Missing required variable: ${v}`))
    blockers.push(...validation.invalid.map(v => `Invalid configuration: ${v}`))
    blockers.push(...validation.insecure.map(v => `Insecure configuration: ${v}`))

    // Warnings
    warnings.push(...validation.warnings)
    warnings.push(...validation.recommendations)

    return {
      ready: blockers.length === 0,
      blockers,
      warnings
    }
  }

  private defineRequiredVariables(): EnvironmentVariable[] {
    return [
      // Authentication & Security
      {
        name: 'NEXTAUTH_SECRET',
        required: true,
        sensitive: true,
        validator: (value) => value.length >= 32,
        description: 'NextAuth session signing secret'
      },
      {
        name: 'GOOGLE_CLIENT_ID',
        required: true,
        sensitive: false,
        validator: (value) => value.includes('.googleusercontent.com'),
        description: 'Google OAuth client ID'
      },
      {
        name: 'GOOGLE_CLIENT_SECRET',
        required: true,
        sensitive: true,
        validator: (value) => value.length >= 24,
        description: 'Google OAuth client secret'
      },
      {
        name: 'ENCRYPTION_SECRET',
        required: true,
        sensitive: true,
        validator: (value) => value.length >= 32,
        description: 'Data encryption secret key'
      },
      {
        name: 'UPLOAD_SECRET',
        required: true,
        sensitive: true,
        validator: (value) => value.length >= 16,
        description: 'File upload token secret'
      },

      // Database Configuration
      {
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        required: true,
        sensitive: false,
        validator: (value) => value.startsWith('https://') && value.includes('supabase'),
        description: 'Supabase database URL'
      },
      {
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        required: true,
        sensitive: false,
        validator: (value) => value.length >= 100,
        description: 'Supabase anonymous access key'
      },
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        required: true,
        sensitive: true,
        validator: (value) => value.length >= 100,
        description: 'Supabase service role key'
      },

      // Storage Configuration
      {
        name: 'B2_APPLICATION_KEY_ID',
        required: false,
        sensitive: false,
        validator: (value) => /^[a-zA-Z0-9]{25}$/.test(value),
        description: 'Backblaze B2 application key ID'
      },
      {
        name: 'B2_APPLICATION_KEY',
        required: false,
        sensitive: true,
        validator: (value) => value.length >= 31,
        description: 'Backblaze B2 application key'
      },
      {
        name: 'B2_BUCKET_ID',
        required: false,
        sensitive: false,
        description: 'Backblaze B2 bucket ID'
      },

      // Payment Configuration
      {
        name: 'BTCPAY_URL',
        required: false,
        sensitive: false,
        validator: (value) => value.startsWith('https://'),
        description: 'BTCPay Server URL'
      },
      {
        name: 'BTCPAY_API_KEY',
        required: false,
        sensitive: true,
        validator: (value) => value.length >= 32,
        description: 'BTCPay Server API key'
      },
      {
        name: 'BTCPAY_WEBHOOK_SECRET',
        required: false,
        sensitive: true,
        validator: (value) => value.length >= 16,
        description: 'BTCPay webhook secret'
      },

      // Administrative Configuration
      {
        name: 'ADMIN_EMAIL',
        required: true,
        sensitive: false,
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        description: 'Administrator email address'
      },
      {
        name: 'NEXT_PUBLIC_ADMIN_EMAIL',
        required: false,
        sensitive: false,
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        description: 'Public administrator email'
      },

      // Network Configuration
      {
        name: 'BITCOIN_NETWORK',
        required: false,
        sensitive: false,
        defaultValue: 'signet',
        validator: (value) => ['mainnet', 'testnet', 'signet', 'regtest'].includes(value),
        description: 'Bitcoin network to use'
      },
      {
        name: 'MEMPOOL_API_BASE_URL',
        required: false,
        sensitive: false,
        defaultValue: 'https://mempool.space/signet/api',
        validator: (value) => value.startsWith('https://'),
        description: 'Mempool API base URL'
      }
    ]
  }

  private sanitizeEnvironment(): SanitizedEnvironment {
    const sanitized: SanitizedEnvironment = {}
    const environment = process.env

    for (const variable of this.requiredVariables) {
      const value = environment[variable.name] || variable.defaultValue

      if (value) {
        sanitized[variable.name] = value
      }
    }

    return sanitized
  }

  private isInsecureValue(value?: string): boolean {
    if (!value) return true

    const insecurePatterns = [
      'test',
      'demo',
      'default',
      'secret',
      'password',
      '123456',
      'changeme',
      'placeholder'
    ]

    return insecurePatterns.some(pattern => 
      value.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  private isStrongSecret(value?: string): boolean {
    if (!value) return false
    
    return value.length >= 32 && 
           /[a-z]/.test(value) && 
           /[A-Z]/.test(value) && 
           /[0-9]/.test(value)
  }

  private findUnexpectedSensitiveVariables(environment: NodeJS.ProcessEnv): string[] {
    const warnings: string[] = []
    
    for (const [key, value] of Object.entries(environment)) {
      if (!this.requiredVariables.find(v => v.name === key)) {
        if (this.sensitivePatterns.some(pattern => pattern.test(key))) {
          warnings.push(`Unexpected sensitive variable detected: ${key}`)
        }
      }
    }

    return warnings
  }

  private getCategoryVariables(category: string): string[] {
    const categoryMappings: { [key: string]: string[] } = {
      auth: ['NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'ENCRYPTION_SECRET'],
      database: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
      storage: ['B2_APPLICATION_KEY_ID', 'B2_APPLICATION_KEY', 'B2_BUCKET_ID', 'B2_BUCKET_NAME'],
      payment: ['BTCPAY_URL', 'BTCPAY_API_KEY', 'BTCPAY_STORE_ID', 'BTCPAY_WEBHOOK_SECRET'],
      security: ['WEBHOOK_SECRET', 'UPLOAD_SECRET', 'SESSION_ENCRYPTION_KEY']
    }

    return categoryMappings[category] || []
  }

  private validateVariables(variables: EnvironmentVariable[]): ValidationResult {
    const missing: string[] = []
    const invalid: string[] = []
    const insecure: string[] = []
    const warnings: string[] = []
    const recommendations: string[] = []

    const environment = process.env

    for (const variable of variables) {
      const value = environment[variable.name]

      if (!value && variable.required) {
        missing.push(variable.name)
      } else if (value && variable.validator && !variable.validator(value)) {
        invalid.push(variable.name)
      }
    }

    return {
      valid: missing.length === 0 && invalid.length === 0,
      missing,
      invalid,
      insecure,
      warnings,
      recommendations
    }
  }

  private logValidationResults(results: Partial<ValidationResult>): void {
    if (results.missing?.length) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'Missing required environment variables',
        { variables: results.missing }
      )
    }

    if (results.invalid?.length) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'Invalid environment variable values',
        { variables: results.invalid }
      )
    }

    if (results.insecure?.length) {
      securityLogger.warn(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        'Insecure environment variable values detected',
        { variables: results.insecure }
      )
    }
  }
}

export const environmentValidator = EnvironmentValidator.getInstance()