/**
 * Bitcoin Faucet Service for SIGNET network
 * Handles faucet requests and rate limiting
 */
export interface FaucetRequest {
  address: string
  amount: number
  timestamp: number
  txid?: string
  status: 'pending' | 'completed' | 'failed'
}

export interface FaucetResponse {
  success: boolean
  message: string
  txid?: string
  amount?: number
  estimatedTime?: number
}

export interface FaucetEligibility {
  eligible: boolean
  reason?: string
  nextEligibleTime?: number
  remainingCooldown?: number
}

/**
 * Faucet Service for SIGNET testnet
 * Provides integration with various SIGNET faucets
 */
export class FaucetService {
  private static readonly FAUCET_ENDPOINTS = {
    SIGNETFAUCET: 'https://signetfaucet.com',
    BITCOINFAUCET: 'https://bitcoinfaucet.uo1.net',
    SIGNET_FAUCET_BC1: 'https://faucet.signet.bitcoin.com'
  }

  private static readonly RATE_LIMIT_HOURS = 24
  private static readonly MAX_AMOUNT_SATS = 100000 // 0.001 BTC
  private static readonly MIN_AMOUNT_SATS = 10000  // 0.0001 BTC

  // In-memory storage for demo purposes
  // In production, use a database or persistent storage
  private static faucetRequests: Map<string, FaucetRequest[]> = new Map()

  /**
   * Requests funds from a SIGNET faucet
   * @param {string} address - The address to send funds to
   * @param {number} amount - Amount in satoshis (optional)
   * @returns {Promise<FaucetResponse>} Faucet response
   */
  static async requestFunds(address: string, amount: number = 50000): Promise<FaucetResponse> {
    try {
      // Validate address
      if (!this.validateSignetAddress(address)) {
        return {
          success: false,
          message: 'Invalid SIGNET address format'
        }
      }

      // Check eligibility
      const eligibility = this.checkFaucetEligibility(address)
      if (!eligibility.eligible) {
        return {
          success: false,
          message: eligibility.reason || 'Not eligible for faucet request',
          estimatedTime: eligibility.nextEligibleTime
        }
      }

      // Validate amount
      if (amount < this.MIN_AMOUNT_SATS || amount > this.MAX_AMOUNT_SATS) {
        return {
          success: false,
          message: `Amount must be between ${this.MIN_AMOUNT_SATS} and ${this.MAX_AMOUNT_SATS} satoshis`
        }
      }

      // Try multiple faucets in order
      const faucetAttempts = [
        () => this.requestFromSignetFaucet(address, amount),
        () => this.requestFromBitcoinFaucet(address, amount),
        () => this.requestFromFallbackFaucet(address, amount)
      ]

      let lastError = ''
      for (const attemptFaucet of faucetAttempts) {
        try {
          const result = await attemptFaucet()
          if (result.success) {
            // Record successful request
            this.recordFaucetRequest(address, amount, result.txid, 'completed')
            return result
          }
          lastError = result.message
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error'
          continue
        }
      }

      // All faucets failed
      this.recordFaucetRequest(address, amount, undefined, 'failed')
      return {
        success: false,
        message: `All faucets failed. Last error: ${lastError}`
      }

    } catch (error) {
      console.error('Error requesting faucet funds:', error)
      return {
        success: false,
        message: `Faucet request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Checks if an address is eligible for faucet funds
   * @param {string} address - The address to check
   * @returns {FaucetEligibility} Eligibility status
   */
  static checkFaucetEligibility(address: string): FaucetEligibility {
    const requests = this.faucetRequests.get(address) || []
    const now = Date.now()
    const cooldownMs = this.RATE_LIMIT_HOURS * 60 * 60 * 1000

    // Find last successful request
    const lastSuccessfulRequest = requests
      .filter(req => req.status === 'completed')
      .sort((a, b) => b.timestamp - a.timestamp)[0]

    if (!lastSuccessfulRequest) {
      return { eligible: true }
    }

    const timeSinceLastRequest = now - lastSuccessfulRequest.timestamp
    const remainingCooldown = cooldownMs - timeSinceLastRequest

    if (timeSinceLastRequest < cooldownMs) {
      return {
        eligible: false,
        reason: `Please wait ${Math.ceil(remainingCooldown / (60 * 60 * 1000))} hours before requesting again`,
        nextEligibleTime: lastSuccessfulRequest.timestamp + cooldownMs,
        remainingCooldown
      }
    }

    return { eligible: true }
  }

  /**
   * Tracks faucet requests for rate limiting
   * @param {string} address - The address
   * @param {number} limit - Maximum number of requests to return
   * @returns {FaucetRequest[]} Array of faucet requests
   */
  static trackFaucetRequests(address: string, limit: number = 10): FaucetRequest[] {
    const requests = this.faucetRequests.get(address) || []
    return requests
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /**
   * Gets faucet statistics
   * @returns {any} Faucet statistics
   */
  static getFaucetStats(): any {
    const allRequests = Array.from(this.faucetRequests.values()).flat()
    const now = Date.now()
    const last24Hours = now - (24 * 60 * 60 * 1000)
    
    const recent = allRequests.filter(req => req.timestamp > last24Hours)
    const successful = recent.filter(req => req.status === 'completed')
    const failed = recent.filter(req => req.status === 'failed')
    
    return {
      totalRequests: allRequests.length,
      recentRequests: recent.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      successRate: recent.length > 0 ? (successful.length / recent.length) * 100 : 0,
      totalAmountDispensed: successful.reduce((sum, req) => sum + req.amount, 0),
      averageAmount: successful.length > 0 ? successful.reduce((sum, req) => sum + req.amount, 0) / successful.length : 0
    }
  }

  /**
   * Requests funds from signetfaucet.com
   * @param {string} address - The address to send funds to
   * @param {number} amount - Amount in satoshis
   * @returns {Promise<FaucetResponse>} Faucet response
   */
  private static async requestFromSignetFaucet(address: string, amount: number): Promise<FaucetResponse> {
    try {
      // This is a mock implementation since we can't actually integrate with the faucet API
      // In a real implementation, you'd make an HTTP request to the faucet API
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success/failure (70% success rate)
      const success = Math.random() > 0.3
      
      if (success) {
        const mockTxid = this.generateMockTxid()
        return {
          success: true,
          message: 'Funds requested successfully from signetfaucet.com',
          txid: mockTxid,
          amount,
          estimatedTime: 600 // 10 minutes
        }
      } else {
        throw new Error('Faucet temporarily unavailable')
      }
    } catch (error) {
      return {
        success: false,
        message: `Signet faucet error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Requests funds from bitcoinfaucet.uo1.net
   * @param {string} address - The address to send funds to
   * @param {number} amount - Amount in satoshis
   * @returns {Promise<FaucetResponse>} Faucet response
   */
  private static async requestFromBitcoinFaucet(address: string, amount: number): Promise<FaucetResponse> {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const success = Math.random() > 0.4
      
      if (success) {
        const mockTxid = this.generateMockTxid()
        return {
          success: true,
          message: 'Funds requested successfully from bitcoinfaucet.uo1.net',
          txid: mockTxid,
          amount: Math.min(amount, 25000), // This faucet has lower limits
          estimatedTime: 300 // 5 minutes
        }
      } else {
        throw new Error('Daily limit exceeded')
      }
    } catch (error) {
      return {
        success: false,
        message: `Bitcoin faucet error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Requests funds from fallback faucet
   * @param {string} address - The address to send funds to
   * @param {number} amount - Amount in satoshis
   * @returns {Promise<FaucetResponse>} Faucet response
   */
  private static async requestFromFallbackFaucet(address: string, amount: number): Promise<FaucetResponse> {
    try {
      // Mock implementation for fallback
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const success = Math.random() > 0.5
      
      if (success) {
        const mockTxid = this.generateMockTxid()
        return {
          success: true,
          message: 'Funds requested successfully from fallback faucet',
          txid: mockTxid,
          amount: Math.min(amount, 10000), // Lowest amount fallback
          estimatedTime: 1200 // 20 minutes
        }
      } else {
        throw new Error('Fallback faucet unavailable')
      }
    } catch (error) {
      return {
        success: false,
        message: `Fallback faucet error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Records a faucet request
   * @param {string} address - The address
   * @param {number} amount - Amount requested
   * @param {string} txid - Transaction ID (if successful)
   * @param {'pending' | 'completed' | 'failed'} status - Request status
   */
  private static recordFaucetRequest(
    address: string,
    amount: number,
    txid: string | undefined,
    status: 'pending' | 'completed' | 'failed'
  ): void {
    const requests = this.faucetRequests.get(address) || []
    
    requests.push({
      address,
      amount,
      timestamp: Date.now(),
      txid,
      status
    })
    
    this.faucetRequests.set(address, requests)
  }

  /**
   * Validates a SIGNET address
   * @param {string} address - Address to validate
   * @returns {boolean} True if valid SIGNET address
   */
  private static validateSignetAddress(address: string): boolean {
    // Basic validation for SIGNET addresses
    const isTestnetBech32 = address.startsWith('tb1')
    const isTestnetLegacy = address.startsWith('m') || address.startsWith('n')
    const isTestnetScript = address.startsWith('2')
    
    return isTestnetBech32 || isTestnetLegacy || isTestnetScript
  }

  /**
   * Generates a mock transaction ID for testing
   * @returns {string} Mock transaction ID
   */
  private static generateMockTxid(): string {
    const chars = '0123456789abcdef'
    let txid = ''
    for (let i = 0; i < 64; i++) {
      txid += chars[Math.floor(Math.random() * chars.length)]
    }
    return txid
  }

  /**
   * Clears old faucet requests (cleanup utility)
   * @param {number} olderThanHours - Remove requests older than this many hours
   */
  static cleanupOldRequests(olderThanHours: number = 168): void { // Default 7 days
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000)
    
    for (const [address, requests] of this.faucetRequests.entries()) {
      const filtered = requests.filter(req => req.timestamp > cutoff)
      
      if (filtered.length === 0) {
        this.faucetRequests.delete(address)
      } else {
        this.faucetRequests.set(address, filtered)
      }
    }
  }

  /**
   * Formats time remaining for cooldown
   * @param {number} milliseconds - Time in milliseconds
   * @returns {string} Formatted time string
   */
  static formatCooldownTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000))
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }
}