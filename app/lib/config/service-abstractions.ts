/**
 * Service Abstraction Interfaces
 * Implements vendor-agnostic service interfaces to prevent lock-in
 * SECURITY: Hides vendor-specific implementation details from application code
 */

import { config } from './configuration-factory'

// Core Service Interfaces
export interface PaymentProvider {
  createInvoice(params: CreateInvoiceParams): Promise<Invoice>
  getInvoiceStatus(invoiceId: string): Promise<PaymentStatus>
  verifyWebhook(payload: string, signature: string): Promise<boolean>
  generateWebhookUrl(): string
}

export interface StorageProvider {
  generateSecureUrl(filePath: string, expirationHours?: number): Promise<string>
  uploadFile(file: Buffer, fileName: string, metadata?: any): Promise<string>
  deleteFile(filePath: string): Promise<boolean>
  listFiles(prefix?: string): Promise<StorageFile[]>
  getFileMetadata(filePath: string): Promise<StorageFileMetadata>
}

export interface DatabaseProvider {
  query<T>(sql: string, params?: any[]): Promise<T[]>
  insert<T>(table: string, data: any): Promise<T>
  update<T>(table: string, data: any, where: any): Promise<T>
  delete(table: string, where: any): Promise<boolean>
  authenticate(credentials: any): Promise<boolean>
}

export interface AnalyticsProvider {
  trackEvent(event: AnalyticsEvent): Promise<void>
  trackPageView(page: string, userId?: string): Promise<void>
  getAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsData>
  getUserInsights(userId: string): Promise<UserInsights>
}

export interface AuthenticationProvider {
  signIn(credentials: any): Promise<AuthSession>
  signOut(sessionId: string): Promise<boolean>
  validateSession(sessionId: string): Promise<AuthSession | null>
  refreshToken(refreshToken: string): Promise<AuthSession>
  getUserProfile(userId: string): Promise<UserProfile>
}

export interface BitcoinProvider {
  getAddressInfo(address: string): Promise<AddressInfo>
  broadcastTransaction(txHex: string): Promise<string>
  getTransaction(txId: string): Promise<Transaction>
  getBlockInfo(blockHash: string): Promise<BlockInfo>
  getFeeRecommendations(): Promise<FeeRecommendations>
  validateAddress(address: string): Promise<boolean>
}

// Data Types
export interface CreateInvoiceParams {
  amount: number
  currency: string
  description?: string
  userId?: string
  metadata?: any
  redirectUrl?: string
}

export interface Invoice {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentUrl: string
  expiresAt: Date
  createdAt: Date
  metadata?: any
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  FAILED = 'failed'
}

export interface StorageFile {
  name: string
  size: number
  lastModified: Date
  contentType: string
  publicUrl?: string
}

export interface StorageFileMetadata {
  name: string
  size: number
  contentType: string
  checksum: string
  lastModified: Date
  customMetadata?: any
}

export interface AnalyticsEvent {
  type: string
  userId?: string
  properties?: any
  timestamp?: Date
}

export interface AnalyticsFilters {
  startDate?: Date
  endDate?: Date
  userId?: string
  eventType?: string
}

export interface AnalyticsData {
  events: AnalyticsEvent[]
  totalEvents: number
  uniqueUsers: number
  topEvents: { type: string; count: number }[]
}

export interface UserInsights {
  userId: string
  totalEvents: number
  lastActivity: Date
  favoriteModules: string[]
  completionRate: number
}

export interface AuthSession {
  sessionId: string
  userId: string
  email: string
  expiresAt: Date
  refreshToken?: string
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  isAdmin: boolean
  hasProAccess: boolean
  createdAt: Date
}

export interface AddressInfo {
  address: string
  balance: number
  totalReceived: number
  totalSent: number
  txCount: number
  unconfirmedBalance: number
}

export interface Transaction {
  txId: string
  blockHeight?: number
  confirmations: number
  fee: number
  size: number
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
  timestamp: Date
}

export interface TransactionInput {
  txId: string
  vout: number
  address?: string
  value: number
}

export interface TransactionOutput {
  address?: string
  value: number
  scriptPubKey: string
}

export interface BlockInfo {
  hash: string
  height: number
  timestamp: Date
  txCount: number
  size: number
  weight: number
  merkleRoot: string
  previousBlockHash: string
}

export interface FeeRecommendations {
  fastestFee: number
  halfHourFee: number
  hourFee: number
  economyFee: number
  minimumFee: number
}

// Service Factory
export class ServiceFactory {
  private static instance: ServiceFactory
  private paymentProvider: PaymentProvider | null = null
  private storageProvider: StorageProvider | null = null
  private databaseProvider: DatabaseProvider | null = null
  private analyticsProvider: AnalyticsProvider | null = null
  private authProvider: AuthenticationProvider | null = null
  private bitcoinProvider: BitcoinProvider | null = null

  private constructor() {}

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory()
    }
    return ServiceFactory.instance
  }

  public getPaymentProvider(): PaymentProvider {
    if (!this.paymentProvider) {
      const paymentConfig = config.getPaymentConfig()
      
      if (!paymentConfig) {
        throw new Error('Payment configuration not available')
      }

      switch (paymentConfig.provider) {
        case 'btcpay':
          this.paymentProvider = new BTCPayProvider(paymentConfig)
          break
        case 'mock':
          this.paymentProvider = new MockPaymentProvider()
          break
        default:
          throw new Error(`Unsupported payment provider: ${paymentConfig.provider}`)
      }
    }
    return this.paymentProvider
  }

  public getStorageProvider(): StorageProvider {
    if (!this.storageProvider) {
      const storageConfig = config.getStorageConfig()
      
      if (!storageConfig) {
        this.storageProvider = new MockStorageProvider()
      } else {
        switch (storageConfig.provider) {
          case 'b2':
            this.storageProvider = new B2StorageProvider(storageConfig)
            break
          default:
            throw new Error(`Unsupported storage provider: ${storageConfig.provider}`)
        }
      }
    }
    return this.storageProvider
  }

  public getBitcoinProvider(): BitcoinProvider {
    if (!this.bitcoinProvider) {
      const bitcoinConfig = config.getBitcoinConfig()
      this.bitcoinProvider = new MempoolBitcoinProvider(bitcoinConfig)
    }
    return this.bitcoinProvider
  }

  // Reset all providers (useful for testing)
  public resetProviders(): void {
    this.paymentProvider = null
    this.storageProvider = null
    this.databaseProvider = null
    this.analyticsProvider = null
    this.authProvider = null
    this.bitcoinProvider = null
  }
}

// Implementation Examples (abstractions for existing services)

class BTCPayProvider implements PaymentProvider {
  constructor(private config: any) {}

  async createInvoice(params: CreateInvoiceParams): Promise<Invoice> {
    // Implementation would use BTCPay Server API
    // Abstract away BTCPay-specific details
    const response = await fetch(`${this.config.serverUrl}/api/v1/stores/${this.config.storeId}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency,
        metadata: params.metadata
      })
    })

    const data = await response.json()
    
    return {
      id: data.id,
      amount: params.amount,
      currency: params.currency,
      status: this.mapBTCPayStatus(data.status),
      paymentUrl: data.checkoutLink,
      expiresAt: new Date(data.expirationTime),
      createdAt: new Date(data.createdTime),
      metadata: params.metadata
    }
  }

  async getInvoiceStatus(invoiceId: string): Promise<PaymentStatus> {
    // Implementation would query BTCPay Server
    const response = await fetch(`${this.config.serverUrl}/api/v1/stores/${this.config.storeId}/invoices/${invoiceId}`)
    const data = await response.json()
    return this.mapBTCPayStatus(data.status)
  }

  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    // Implementation would verify BTCPay webhook signature
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex')
    
    return signature === expectedSignature
  }

  generateWebhookUrl(): string {
    return `${config.getAuthConfig().baseUrl}/api/webhooks/btcpay`
  }

  private mapBTCPayStatus(btcpayStatus: string): PaymentStatus {
    const statusMap: { [key: string]: PaymentStatus } = {
      'New': PaymentStatus.PENDING,
      'Processing': PaymentStatus.PROCESSING,
      'Settled': PaymentStatus.CONFIRMED,
      'Expired': PaymentStatus.EXPIRED,
      'Invalid': PaymentStatus.FAILED
    }
    return statusMap[btcpayStatus] || PaymentStatus.PENDING
  }
}

class B2StorageProvider implements StorageProvider {
  constructor(private config: any) {}

  async generateSecureUrl(filePath: string, expirationHours: number = 24): Promise<string> {
    // Implementation would use B2 API to generate signed URLs
    // Abstract away B2-specific details
    return `${this.config.baseUrl}/${filePath}?auth=temp_token&expires=${Date.now() + expirationHours * 3600000}`
  }

  async uploadFile(file: Buffer, fileName: string, metadata?: any): Promise<string> {
    // Implementation would upload to B2
    return `uploads/${fileName}`
  }

  async deleteFile(filePath: string): Promise<boolean> {
    // Implementation would delete from B2
    return true
  }

  async listFiles(prefix?: string): Promise<StorageFile[]> {
    // Implementation would list B2 files
    return []
  }

  async getFileMetadata(filePath: string): Promise<StorageFileMetadata> {
    // Implementation would get B2 file metadata
    return {
      name: filePath,
      size: 0,
      contentType: 'application/octet-stream',
      checksum: '',
      lastModified: new Date()
    }
  }
}

class MempoolBitcoinProvider implements BitcoinProvider {
  constructor(private config: any) {}

  async getAddressInfo(address: string): Promise<AddressInfo> {
    const response = await fetch(`${this.config.mempoolApiUrl}/address/${address}`)
    const data = await response.json()
    
    return {
      address,
      balance: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
      totalReceived: data.chain_stats.funded_txo_sum,
      totalSent: data.chain_stats.spent_txo_sum,
      txCount: data.chain_stats.tx_count,
      unconfirmedBalance: data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum
    }
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    const response = await fetch(`${this.config.mempoolApiUrl}/tx`, {
      method: 'POST',
      body: txHex
    })
    return await response.text()
  }

  async getTransaction(txId: string): Promise<Transaction> {
    const response = await fetch(`${this.config.mempoolApiUrl}/tx/${txId}`)
    const data = await response.json()
    
    return {
      txId: data.txid,
      blockHeight: data.status.block_height,
      confirmations: data.status.confirmed ? 1 : 0,
      fee: data.fee,
      size: data.size,
      inputs: data.vin.map((input: any) => ({
        txId: input.txid,
        vout: input.vout,
        address: input.prevout?.scriptpubkey_address,
        value: input.prevout?.value || 0
      })),
      outputs: data.vout.map((output: any) => ({
        address: output.scriptpubkey_address,
        value: output.value,
        scriptPubKey: output.scriptpubkey
      })),
      timestamp: new Date(data.status.block_time * 1000)
    }
  }

  async getBlockInfo(blockHash: string): Promise<BlockInfo> {
    const response = await fetch(`${this.config.mempoolApiUrl}/block/${blockHash}`)
    const data = await response.json()
    
    return {
      hash: data.id,
      height: data.height,
      timestamp: new Date(data.timestamp * 1000),
      txCount: data.tx_count,
      size: data.size,
      weight: data.weight,
      merkleRoot: data.merkle_root,
      previousBlockHash: data.previousblockhash
    }
  }

  async getFeeRecommendations(): Promise<FeeRecommendations> {
    const response = await fetch(`${this.config.mempoolApiUrl}/v1/fees/recommended`)
    const data = await response.json()
    
    return {
      fastestFee: data.fastestFee,
      halfHourFee: data.halfHourFee,
      hourFee: data.hourFee,
      economyFee: data.economyFee || data.hourFee,
      minimumFee: data.minimumFee || 1
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      await this.getAddressInfo(address)
      return true
    } catch {
      return false
    }
  }
}

// Mock implementations for development/testing
class MockPaymentProvider implements PaymentProvider {
  async createInvoice(params: CreateInvoiceParams): Promise<Invoice> {
    return {
      id: `mock-${Date.now()}`,
      amount: params.amount,
      currency: params.currency,
      status: PaymentStatus.PENDING,
      paymentUrl: 'https://mock-payment.local',
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      metadata: params.metadata
    }
  }

  async getInvoiceStatus(): Promise<PaymentStatus> {
    return PaymentStatus.CONFIRMED
  }

  async verifyWebhook(): Promise<boolean> {
    return true
  }

  generateWebhookUrl(): string {
    return 'https://mock.local/webhook'
  }
}

class MockStorageProvider implements StorageProvider {
  async generateSecureUrl(filePath: string): Promise<string> {
    return `https://mock-storage.local/${filePath}`
  }

  async uploadFile(): Promise<string> {
    return 'mock-file-id'
  }

  async deleteFile(): Promise<boolean> {
    return true
  }

  async listFiles(): Promise<StorageFile[]> {
    return []
  }

  async getFileMetadata(filePath: string): Promise<StorageFileMetadata> {
    return {
      name: filePath,
      size: 1024,
      contentType: 'video/mp4',
      checksum: 'mock-checksum',
      lastModified: new Date()
    }
  }
}

export const serviceFactory = ServiceFactory.getInstance()