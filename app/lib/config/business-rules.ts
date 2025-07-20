// Business rules and configuration constants
// This centralizes all hardcoded business logic to prevent exposure
export const BUSINESS_RULES = {
  // Pro subscription settings
  PRO_ACCESS_DURATION_DAYS: 365,
  PRO_PRICE_BRL: 749,
  
  // Video settings  
  VIDEO_URL_EXPIRATION_HOURS: 24,
  DEFAULT_VIDEO_DURATION_SECONDS: 2400,
  FALLBACK_VIDEO_DURATION_SECONDS: 1800,
  
  // Analytics settings
  ANALYTICS_CLEANUP_BATCH_SIZE: 1000,
  
  // Rate limiting and timeouts
  WEBHOOK_TIMEOUT_MS: 30000,
  
  // Time constants (computed getters for performance)
  get PRO_ACCESS_DURATION_MS() {
    return this.PRO_ACCESS_DURATION_DAYS * 24 * 60 * 60 * 1000
  },
  
  get VIDEO_URL_EXPIRATION_MS() {
    return this.VIDEO_URL_EXPIRATION_HOURS * 60 * 60 * 1000  
  },
  
  get VIDEO_URL_EXPIRATION_MS_ALT() {
    return this.VIDEO_URL_EXPIRATION_HOURS * 3600000  
  }
} as const

export default BUSINESS_RULES