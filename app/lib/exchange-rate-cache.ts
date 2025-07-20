/**
 * Secure Exchange Rate Cache Service
 * Prevents API abuse and ensures consistent pricing
 */

interface ExchangeRate {
  rate: number
  timestamp: number
  source: string
}

class ExchangeRateCache {
  private cache = new Map<string, ExchangeRate>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly MIN_RATE = 3.0 // Minimum acceptable BRL/USD rate
  private readonly MAX_RATE = 10.0 // Maximum acceptable BRL/USD rate
  private readonly FALLBACK_RATE = 5.0 // Safe fallback rate
  
  /**
   * Get USD to BRL exchange rate with caching and validation
   */
  async getUsdToBrlRate(): Promise<number> {
    const cacheKey = 'USD_BRL'
    const cached = this.cache.get(cacheKey)
    
    // Return cached rate if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Using cached exchange rate:', cached.rate)
      return cached.rate
    }
    
    try {
      // Try primary API
      let rate = await this.fetchFromPrimaryApi()
      
      // Fallback to secondary API if primary fails
      if (!rate) {
        rate = await this.fetchFromSecondaryApi()
      }
      
      // Validate rate is within acceptable range
      if (!this.isRateValid(rate)) {
        console.error(`Invalid exchange rate received: ${rate}`)
        rate = this.FALLBACK_RATE
      }
      
      // Ensure rate is not null - use fallback if necessary
      const finalRate = rate || this.FALLBACK_RATE
      
      // Cache the rate
      this.cache.set(cacheKey, {
        rate: finalRate,
        timestamp: Date.now(),
        source: finalRate === this.FALLBACK_RATE ? 'fallback' : 'api'
      })
      
      console.log(`Exchange rate updated: ${finalRate} BRL/USD`)
      return finalRate
      
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error)
      
      // Return last known good rate if available
      if (cached) {
        console.log('Using expired cache due to API failure')
        return cached.rate
      }
      
      return this.FALLBACK_RATE
    }
  }
  
  /**
   * Primary exchange rate API
   */
  private async fetchFromPrimaryApi(): Promise<number | null> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout
      
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { signal: controller.signal }
      )
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }
      
      const data = await response.json()
      return data.rates?.BRL || null
      
    } catch (error) {
      console.error('Primary API failed:', error)
      return null
    }
  }
  
  /**
   * Secondary exchange rate API (backup)
   */
  private async fetchFromSecondaryApi(): Promise<number | null> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      
      // Alternative API - adjust URL as needed
      const response = await fetch(
        'https://api.frankfurter.app/latest?from=USD&to=BRL',
        { signal: controller.signal }
      )
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        throw new Error(`Backup API returned ${response.status}`)
      }
      
      const data = await response.json()
      return data.rates?.BRL || null
      
    } catch (error) {
      console.error('Secondary API failed:', error)
      return null
    }
  }
  
  /**
   * Validate exchange rate is within reasonable bounds
   */
  private isRateValid(rate: number | null): boolean {
    if (!rate || typeof rate !== 'number') return false
    return rate >= this.MIN_RATE && rate <= this.MAX_RATE
  }
  
  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear()
  }
  
  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => 
        `${key}: ${value.rate} (${new Date(value.timestamp).toISOString()})`
      )
    }
  }
}

// Export singleton instance
export const exchangeRateCache = new ExchangeRateCache()

// Export for testing
export { ExchangeRateCache }