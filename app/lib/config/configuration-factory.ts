/**
 * Secure Configuration Factory
 * Implements configuration abstraction layer to hide implementation details
 * SECURITY: Prevents vendor lock-in and configuration exposure
 */

import { environmentValidator, ValidationResult } from './environment-validator'
import { securityLogger, SecurityEventType } from '../security/security-logger'

// Configuration Interfaces - Abstract away vendor-specific details
export interface AuthConfiguration {
  nextAuthSecret: string
  googleClientId: string
  googleClientSecret: string
  encryptionSecret: string
  uploadSecret: string
  baseUrl: string
}

export interface DatabaseConfiguration {
  url: string
  anonKey: string
  serviceRoleKey: string
  maxConnections?: number
  timeout?: number
}

export interface StorageConfiguration {
  provider: 'b2' | 'aws' | 'gcs' | 'local'
  credentials: {
    keyId: string
    key: string
  }
  bucket: {
    id: string
    name: string
  }
  baseUrl: string
  secureUrlExpiration: number
}

export interface PaymentConfiguration {
  provider: 'btcpay' | 'stripe' | 'mock'
  serverUrl: string
  apiKey: string
  storeId?: string
  webhookSecret: string
  network: 'mainnet' | 'testnet' | 'signet' | 'regtest'
}

export interface BitcoinConfiguration {
  network: 'mainnet' | 'testnet' | 'signet' | 'regtest'
  mempoolApiUrl: string
  faucetUrls?: string[]
  explorerUrl: string
}

export interface SecurityConfiguration {
  enableRateLimiting: boolean
  enableSecurityLogging: boolean
  enableInjectionProtection: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  alertThreshold: number
  monitoringWebhookUrl?: string
  adminEmail: string
}

export interface ApplicationConfiguration {
  auth: AuthConfiguration
  database: DatabaseConfiguration
  storage?: StorageConfiguration
  payment?: PaymentConfiguration
  bitcoin: BitcoinConfiguration
  security: SecurityConfiguration
  features: FeatureConfiguration
}

export interface FeatureConfiguration {
  enableProAccess: boolean
  enableVideoStreaming: boolean
  enableComments: boolean
  enableAnalytics: boolean
  enableDebugMode: boolean
}

// Configuration Provider Interface
export interface ConfigurationProvider {
  getAuthConfig(): AuthConfiguration
  getDatabaseConfig(): DatabaseConfiguration
  getStorageConfig(): StorageConfiguration | null
  getPaymentConfig(): PaymentConfiguration | null
  getBitcoinConfig(): BitcoinConfiguration
  getSecurityConfig(): SecurityConfiguration
  getFeatureConfig(): FeatureConfiguration
  getFullConfiguration(): ApplicationConfiguration
  validateConfiguration(): ValidationResult
}

// Environment-specific Configuration Providers
export class ProductionConfigurationProvider implements ConfigurationProvider {
  private env: { [key: string]: string }
  private validated: boolean = false

  constructor() {
    try {
      this.env = environmentValidator.getSanitizedEnvironment()
      this.validateConfiguration()
    } catch (error) {
      // Durante o build ou desenvolvimento, use valores padrão seguros
      const isDevelopment = process.env.NODE_ENV === 'development'
      const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
      
      if (isDevelopment || isBuildTime) {
        console.warn('Configuration validation failed, using environment variables directly for development/build')
        this.env = process.env as { [key: string]: string }
        this.validated = false
      } else {
        throw error
      }
    }
  }

  getAuthConfig(): AuthConfiguration {
    this.ensureValidated()
    
    return {
      nextAuthSecret: this.env.NEXTAUTH_SECRET,
      googleClientId: this.env.GOOGLE_CLIENT_ID,
      googleClientSecret: this.env.GOOGLE_CLIENT_SECRET,
      encryptionSecret: this.env.ENCRYPTION_SECRET,
      uploadSecret: this.env.UPLOAD_SECRET,
      baseUrl: this.env.NEXT_PUBLIC_BASE_URL || 'https://satslab.org'
    }
  }

  getDatabaseConfig(): DatabaseConfiguration {
    this.ensureValidated()
    
    return {
      url: this.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: this.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: this.env.SUPABASE_SERVICE_ROLE_KEY,
      maxConnections: 10,
      timeout: 30000
    }
  }

  getStorageConfig(): StorageConfiguration | null {
    if (!this.env.B2_APPLICATION_KEY_ID || !this.env.B2_APPLICATION_KEY) {
      return null
    }

    return {
      provider: 'b2',
      credentials: {
        keyId: this.env.B2_APPLICATION_KEY_ID,
        key: this.env.B2_APPLICATION_KEY
      },
      bucket: {
        id: this.env.B2_BUCKET_ID || '',
        name: this.env.B2_BUCKET_NAME || ''
      },
      baseUrl: this.env.SATSLAB_PRO_VIDEOS_BASE_URL || '',
      secureUrlExpiration: 24 * 60 * 60 // 24 hours
    }
  }

  getPaymentConfig(): PaymentConfiguration | null {
    if (!this.env.BTCPAY_URL || !this.env.BTCPAY_API_KEY) {
      return null
    }

    return {
      provider: 'btcpay',
      serverUrl: this.env.BTCPAY_URL,
      apiKey: this.env.BTCPAY_API_KEY,
      storeId: this.env.BTCPAY_STORE_ID,
      webhookSecret: this.env.BTCPAY_WEBHOOK_SECRET || '',
      network: (this.env.BITCOIN_NETWORK as any) || 'signet'
    }
  }

  getBitcoinConfig(): BitcoinConfiguration {
    const network = (this.env.BITCOIN_NETWORK as any) || 'signet'
    
    return {
      network,
      mempoolApiUrl: this.env.MEMPOOL_API_BASE_URL || this.getDefaultMempoolUrl(network),
      explorerUrl: this.getDefaultExplorerUrl(network),
      faucetUrls: this.getDefaultFaucetUrls(network)
    }
  }

  getSecurityConfig(): SecurityConfiguration {
    return {
      enableRateLimiting: this.env.ENABLE_RATE_LIMITING === 'true',
      enableSecurityLogging: this.env.ENABLE_SECURITY_LOGGING === 'true',
      enableInjectionProtection: this.env.ENABLE_INJECTION_PROTECTION === 'true',
      logLevel: (this.env.SECURITY_LOG_LEVEL as any) || 'info',
      alertThreshold: parseInt(this.env.SECURITY_ALERT_THRESHOLD || '70'),
      monitoringWebhookUrl: this.env.SLACK_SECURITY_WEBHOOK_URL,
      adminEmail: this.env.ADMIN_EMAIL
    }
  }

  getFeatureConfig(): FeatureConfiguration {
    const isProduction = process.env.NODE_ENV === 'production'
    
    return {
      enableProAccess: true,
      enableVideoStreaming: !!this.getStorageConfig(),
      enableComments: true,
      enableAnalytics: true,
      enableDebugMode: !isProduction
    }
  }

  getFullConfiguration(): ApplicationConfiguration {
    return {
      auth: this.getAuthConfig(),
      database: this.getDatabaseConfig(),
      storage: this.getStorageConfig() || undefined,
      payment: this.getPaymentConfig() || undefined,
      bitcoin: this.getBitcoinConfig(),
      security: this.getSecurityConfig(),
      features: this.getFeatureConfig()
    }
  }

  validateConfiguration(): ValidationResult {
    const result = environmentValidator.validateEnvironment()
    this.validated = result.valid

    if (!result.valid) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'Configuration validation failed',
        {
          missing: result.missing,
          invalid: result.invalid,
          insecure: result.insecure
        }
      )
    }

    return result
  }

  private ensureValidated(): void {
    if (!this.validated) {
      // Durante o build ou desenvolvimento, seja mais permissivo
      const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      if (isBuildTime || isDevelopment) {
        console.warn('Configuration not fully validated, but continuing for development/build')
        return
      }
      throw new Error('Configuration validation failed. Cannot provide configuration.')
    }
  }

  private getDefaultMempoolUrl(network: string): string {
    const urls = {
      mainnet: 'https://mempool.space/api',
      testnet: 'https://mempool.space/testnet/api',
      signet: 'https://mempool.space/signet/api',
      regtest: 'http://localhost:8080/api'
    }
    return urls[network as keyof typeof urls] || urls.signet
  }

  private getDefaultExplorerUrl(network: string): string {
    const urls = {
      mainnet: 'https://mempool.space',
      testnet: 'https://mempool.space/testnet',
      signet: 'https://mempool.space/signet',
      regtest: 'http://localhost:8080'
    }
    return urls[network as keyof typeof urls] || urls.signet
  }

  private getDefaultFaucetUrls(network: string): string[] {
    const faucets = {
      mainnet: [],
      testnet: [
        'https://bitcoinfaucet.uo1.net',
        'https://testnet-faucet.mempool.co'
      ],
      signet: [
        'https://signetfaucet.com',
        'https://signet.bc-2.jp',
        'https://faucet.signet.bitcoin.com'
      ],
      regtest: []
    }
    return faucets[network as keyof typeof faucets] || faucets.signet
  }
}

export class DevelopmentConfigurationProvider extends ProductionConfigurationProvider {
  constructor() {
    super()
  }

  getAuthConfig(): AuthConfiguration {
    const config = super.getAuthConfig()
    
    // Override with development-friendly defaults if missing
    return {
      ...config,
      baseUrl: config.baseUrl || 'http://localhost:3000'
    }
  }

  getFeatureConfig(): FeatureConfiguration {
    return {
      enableProAccess: true,
      enableVideoStreaming: false, // Disable in development by default
      enableComments: true,
      enableAnalytics: false, // Disable in development
      enableDebugMode: true
    }
  }

  getSecurityConfig(): SecurityConfiguration {
    const config = super.getSecurityConfig()
    
    return {
      ...config,
      enableRateLimiting: false, // Disable in development
      logLevel: 'debug'
    }
  }
}

export class MockConfigurationProvider implements ConfigurationProvider {
  getAuthConfig(): AuthConfiguration {
    return {
      nextAuthSecret: 'mock-secret-for-testing-only',
      googleClientId: 'mock-google-client-id',
      googleClientSecret: 'mock-google-client-secret',
      encryptionSecret: 'mock-encryption-secret-32-chars',
      uploadSecret: 'mock-upload-secret',
      baseUrl: 'http://localhost:3000'
    }
  }

  getDatabaseConfig(): DatabaseConfiguration {
    return {
      url: 'https://mock.supabase.co',
      anonKey: 'mock-anon-key',
      serviceRoleKey: 'mock-service-role-key'
    }
  }

  getStorageConfig(): StorageConfiguration | null {
    return null // No storage in mock mode
  }

  getPaymentConfig(): PaymentConfiguration | null {
    return {
      provider: 'mock',
      serverUrl: 'https://mock-btcpay.local',
      apiKey: 'mock-api-key',
      webhookSecret: 'mock-webhook-secret',
      network: 'signet'
    }
  }

  getBitcoinConfig(): BitcoinConfiguration {
    return {
      network: 'signet',
      mempoolApiUrl: 'https://mempool.space/signet/api',
      explorerUrl: 'https://mempool.space/signet',
      faucetUrls: ['https://signetfaucet.com']
    }
  }

  getSecurityConfig(): SecurityConfiguration {
    return {
      enableRateLimiting: false,
      enableSecurityLogging: false,
      enableInjectionProtection: false,
      logLevel: 'debug',
      alertThreshold: 100,
      adminEmail: 'mock@example.com'
    }
  }

  getFeatureConfig(): FeatureConfiguration {
    return {
      enableProAccess: false,
      enableVideoStreaming: false,
      enableComments: false,
      enableAnalytics: false,
      enableDebugMode: true
    }
  }

  getFullConfiguration(): ApplicationConfiguration {
    return {
      auth: this.getAuthConfig(),
      database: this.getDatabaseConfig(),
      storage: this.getStorageConfig() || undefined,
      payment: this.getPaymentConfig() || undefined,
      bitcoin: this.getBitcoinConfig(),
      security: this.getSecurityConfig(),
      features: this.getFeatureConfig()
    }
  }

  validateConfiguration(): ValidationResult {
    return {
      valid: true,
      missing: [],
      invalid: [],
      insecure: [],
      warnings: ['Using mock configuration'],
      recommendations: []
    }
  }
}

// Configuration Factory
export class ConfigurationFactory {
  private static instance: ConfigurationFactory
  private provider: ConfigurationProvider | null = null

  private constructor() {}

  public static getInstance(): ConfigurationFactory {
    if (!ConfigurationFactory.instance) {
      ConfigurationFactory.instance = new ConfigurationFactory()
    }
    return ConfigurationFactory.instance
  }

  public createProvider(environment?: string): ConfigurationProvider {
    if (this.provider) {
      return this.provider
    }

    const env = environment || process.env.NODE_ENV || 'development'

    switch (env) {
      case 'production':
        this.provider = new ProductionConfigurationProvider()
        break
      case 'development':
        this.provider = new DevelopmentConfigurationProvider()
        break
      case 'test':
        this.provider = new MockConfigurationProvider()
        break
      default:
        this.provider = new DevelopmentConfigurationProvider()
    }

    // Validate configuration on creation
    const validation = this.provider.validateConfiguration()
    if (!validation.valid) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'Failed to create configuration provider',
        { environment: env, validation }
      )
    }

    return this.provider
  }

  public resetProvider(): void {
    this.provider = null
  }

  public getCurrentProvider(): ConfigurationProvider | null {
    return this.provider
  }
}

// Singleton access
export const configurationFactory = ConfigurationFactory.getInstance()
export const config = configurationFactory.createProvider()