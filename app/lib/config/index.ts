/**
 * Secure Configuration Management System
 * Centralized configuration access for SatsLab application
 * SECURITY: Abstracts configuration details and prevents vendor lock-in
 */

// Export main configuration interfaces and providers
export {
  type AuthConfiguration,
  type DatabaseConfiguration,
  type StorageConfiguration,
  type PaymentConfiguration,
  type BitcoinConfiguration,
  type SecurityConfiguration,
  type ApplicationConfiguration,
  type FeatureConfiguration,
  type ConfigurationProvider,
  configurationFactory,
  config
} from './configuration-factory'

// Export environment validation
export {
  type EnvironmentVariable,
  type ValidationResult,
  type SanitizedEnvironment,
  environmentValidator
} from './environment-validator'

// Export service abstractions
export {
  type PaymentProvider,
  type StorageProvider,
  type DatabaseProvider,
  type AnalyticsProvider,
  type AuthenticationProvider,
  type BitcoinProvider,
  type Invoice,
  type PaymentStatus,
  type StorageFile,
  type CreateInvoiceParams,
  serviceFactory
} from './service-abstractions'

// Convenience exports for common usage patterns
import { config } from './configuration-factory'
import { serviceFactory } from './service-abstractions'
import { environmentValidator } from './environment-validator'

/**
 * Quick access to commonly used configurations
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager()
    }
    return ConfigurationManager.instance
  }

  /**
   * Get authentication configuration
   */
  getAuth() {
    return config.getAuthConfig()
  }

  /**
   * Get database configuration
   */
  getDatabase() {
    return config.getDatabaseConfig()
  }

  /**
   * Get Bitcoin network configuration
   */
  getBitcoin() {
    return config.getBitcoinConfig()
  }

  /**
   * Get security settings
   */
  getSecurity() {
    return config.getSecurityConfig()
  }

  /**
   * Get feature flags
   */
  getFeatures() {
    return config.getFeatureConfig()
  }

  /**
   * Check if specific feature is enabled
   */
  isFeatureEnabled(feature: keyof import('./configuration-factory').FeatureConfiguration): boolean {
    return config.getFeatureConfig()[feature]
  }

  /**
   * Get payment provider (if configured)
   */
  getPaymentProvider() {
    try {
      return serviceFactory.getPaymentProvider()
    } catch {
      return null
    }
  }

  /**
   * Get storage provider (if configured)
   */
  getStorageProvider() {
    try {
      return serviceFactory.getStorageProvider()
    } catch {
      return null
    }
  }

  /**
   * Get storage configuration
   */
  getStorageConfig() {
    try {
      return config.getStorageConfig()
    } catch {
      return null
    }
  }

  /**
   * Get Bitcoin provider
   */
  getBitcoinProvider() {
    return serviceFactory.getBitcoinProvider()
  }

  /**
   * Validate current environment configuration
   */
  validateEnvironment() {
    return environmentValidator.validateEnvironment()
  }

  /**
   * Check if application is ready for production
   */
  isProductionReady() {
    return environmentValidator.isProductionReady()
  }

  /**
   * Get current environment
   */
  getEnvironment() {
    return process.env.NODE_ENV || 'development'
  }

  /**
   * Check if running in development mode
   */
  isDevelopment() {
    return this.getEnvironment() === 'development'
  }

  /**
   * Check if running in production mode
   */
  isProduction() {
    return this.getEnvironment() === 'production'
  }

  /**
   * Get base URLs for different environments
   */
  getBaseUrl() {
    const authConfig = this.getAuth()
    return authConfig.baseUrl
  }

  /**
   * Get API endpoints with proper base URL
   */
  getApiEndpoint(path: string) {
    return `${this.getBaseUrl()}/api/${path.replace(/^\//, '')}`
  }

  /**
   * Get external service URLs (abstracted)
   */
  getExternalUrls() {
    const bitcoin = this.getBitcoin()
    return {
      mempoolApi: bitcoin.mempoolApiUrl,
      explorer: bitcoin.explorerUrl,
      faucets: bitcoin.faucetUrls || []
    }
  }
}

/**
 * Configuration Usage Examples and Patterns
 */
export class ConfigurationExamples {
  /**
   * Example: Secure API endpoint access
   */
  static getSecureApiUrl(endpoint: string): string {
    const configManager = ConfigurationManager.getInstance()
    return configManager.getApiEndpoint(endpoint)
  }

  /**
   * Example: Safe database connection
   */
  static getDatabaseUrl(): string {
    const db = ConfigurationManager.getInstance().getDatabase()
    // Never expose the full URL with credentials
    const url = new URL(db.url)
    return `${url.protocol}//${url.host}${url.pathname}`
  }

  /**
   * Example: Environment-specific behavior
   */
  static shouldUseRealPayments(): boolean {
    const configManager = ConfigurationManager.getInstance()
    return configManager.isProduction() && configManager.getPaymentProvider() !== null
  }

  /**
   * Example: Feature flag usage
   */
  static canAccessProContent(): boolean {
    const configManager = ConfigurationManager.getInstance()
    return configManager.isFeatureEnabled('enableProAccess')
  }

  /**
   * Example: Secure external URL generation
   */
  static getBlockExplorerUrl(txId: string): string {
    const bitcoin = ConfigurationManager.getInstance().getBitcoin()
    return `${bitcoin.explorerUrl}/tx/${txId}`
  }

  /**
   * Example: Safe payment creation
   */
  static async createSecurePayment(amount: number, userId: string) {
    const configManager = ConfigurationManager.getInstance()
    const paymentProvider = configManager.getPaymentProvider()
    
    if (!paymentProvider) {
      throw new Error('Payment provider not configured')
    }

    return paymentProvider.createInvoice({
      amount,
      currency: 'BRL',
      userId,
      description: 'SatsLab Pro Access',
      redirectUrl: `${configManager.getBaseUrl()}/pro?payment=success`
    })
  }

  /**
   * Example: Secure file URL generation
   */
  static async getSecureVideoUrl(fileName: string): Promise<string | null> {
    const configManager = ConfigurationManager.getInstance()
    const storageProvider = configManager.getStorageProvider()
    
    if (!storageProvider) {
      return null
    }

    return storageProvider.generateSecureUrl(fileName, 24) // 24 hours expiration
  }
}

/**
 * Migration Helper Functions
 * These help migrate from direct process.env usage to secure configuration
 */
export class ConfigurationMigration {
  /**
   * Replace direct process.env access with secure configuration
   */
  static migrateEnvironmentAccess() {
    return {
      // Instead of: process.env.NEXT_PUBLIC_SUPABASE_URL
      supabaseUrl: ConfigurationManager.getInstance().getDatabase().url,
      
      // Instead of: process.env.ADMIN_EMAIL
      adminEmail: ConfigurationManager.getInstance().getSecurity().adminEmail,
      
      // Instead of: process.env.BITCOIN_NETWORK
      bitcoinNetwork: ConfigurationManager.getInstance().getBitcoin().network,
      
      // Instead of: process.env.NODE_ENV === 'development'
      isDevelopment: ConfigurationManager.getInstance().isDevelopment(),
      
      // Instead of: process.env.NEXT_PUBLIC_BASE_URL
      baseUrl: ConfigurationManager.getInstance().getBaseUrl()
    }
  }

  /**
   * Migrate hardcoded URLs to configuration-based URLs
   */
  static migrateHardcodedUrls() {
    const configManager = ConfigurationManager.getInstance()
    const urls = configManager.getExternalUrls()
    
    return {
      // Instead of: 'https://mempool.space/signet/api'
      mempoolApi: urls.mempoolApi,
      
      // Instead of: 'https://mempool.space/signet'
      explorer: urls.explorer,
      
      // Instead of: ['https://signetfaucet.com']
      faucets: urls.faucets,
      
      // Instead of: hardcoded API endpoints
      api: {
        analytics: configManager.getApiEndpoint('analytics'),
        payments: configManager.getApiEndpoint('payments'),
        videos: configManager.getApiEndpoint('videos')
      }
    }
  }

  /**
   * Validate migration completeness
   */
  static validateMigration(): {
    complete: boolean
    remainingIssues: string[]
    recommendations: string[]
  } {
    const configManager = ConfigurationManager.getInstance()
    const validation = configManager.validateEnvironment()
    const productionReadiness = configManager.isProductionReady()
    
    return {
      complete: validation.valid && productionReadiness.ready,
      remainingIssues: [
        ...validation.missing.map(v => `Missing environment variable: ${v}`),
        ...validation.invalid.map(v => `Invalid configuration: ${v}`),
        ...validation.insecure.map(v => `Insecure setting: ${v}`),
        ...productionReadiness.blockers
      ],
      recommendations: [
        ...validation.recommendations,
        ...productionReadiness.warnings
      ]
    }
  }
}

// Export singleton instance for easy access
export const configManager = ConfigurationManager.getInstance()

// Export migration helpers
export const configExamples = ConfigurationExamples
export const configMigration = ConfigurationMigration

/**
 * Usage Documentation and Examples
 * 
 * BEFORE (Insecure):
 * ```typescript
 * const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
 * const adminEmail = process.env.ADMIN_EMAIL
 * const isDev = process.env.NODE_ENV === 'development'
 * ```
 * 
 * AFTER (Secure):
 * ```typescript
 * import { configManager } from '@/app/lib/config'
 * 
 * const dbConfig = configManager.getDatabase()
 * const adminEmail = configManager.getSecurity().adminEmail
 * const isDev = configManager.isDevelopment()
 * ```
 * 
 * Service Usage:
 * ```typescript
 * // Payment creation
 * const paymentProvider = configManager.getPaymentProvider()
 * if (paymentProvider) {
 *   const invoice = await paymentProvider.createInvoice({ amount: 100, currency: 'BRL' })
 * }
 * 
 * // Secure file access
 * const storageProvider = configManager.getStorageProvider()
 * if (storageProvider) {
 *   const secureUrl = await storageProvider.generateSecureUrl('video.mp4')
 * }
 * 
 * // Bitcoin operations
 * const bitcoinProvider = configManager.getBitcoinProvider()
 * const addressInfo = await bitcoinProvider.getAddressInfo('tb1q...')
 * ```
 * 
 * Feature Flags:
 * ```typescript
 * if (configManager.isFeatureEnabled('enableProAccess')) {
 *   // Show Pro content
 * }
 * 
 * if (configManager.isFeatureEnabled('enableVideoStreaming')) {
 *   // Enable video player
 * }
 * ```
 */