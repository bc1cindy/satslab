/**
 * Enterprise Rate Limiting System
 * Protects against brute force and DDoS attacks
 */

interface RateLimit {
  requests: number
  windowMs: number
  message?: string
}

interface RateLimitConfig {
  // API endpoints
  api_general: RateLimit
  api_auth: RateLimit
  api_payment: RateLimit
  api_admin: RateLimit
  api_upload: RateLimit
  
  // Content access
  video_access: RateLimit
  comment_creation: RateLimit
}

const RATE_LIMITS: RateLimitConfig = {
  api_general: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 req/15min
  api_auth: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 auth attempts/15min
  api_payment: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 payments/hour
  api_admin: { requests: 50, windowMs: 15 * 60 * 1000 }, // 50 admin actions/15min
  api_upload: { requests: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads/hour
  video_access: { requests: 200, windowMs: 60 * 60 * 1000 }, // 200 videos/hour
  comment_creation: { requests: 20, windowMs: 60 * 60 * 1000 } // 20 comments/hour
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitRecord>()
  
  private getKey(identifier: string, endpoint: string): string {
    return `${identifier}:${endpoint}`
  }
  
  private getClientIdentifier(request: Request): string {
    // Try multiple headers for client identification
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    
    const ip = cfConnectingIp || 
               realIp || 
               forwarded?.split(',')[0]?.trim() || 
               'unknown'
    
    // For authenticated users, also include user agent for additional entropy
    const userAgent = request.headers.get('user-agent') || 'unknown'
    return `${ip}:${userAgent.slice(0, 50)}`
  }
  
  async checkRateLimit(
    request: Request, 
    limitType: keyof RateLimitConfig,
    customIdentifier?: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number; error?: string }> {
    const config = RATE_LIMITS[limitType]
    const identifier = customIdentifier || this.getClientIdentifier(request)
    const key = this.getKey(identifier, limitType)
    
    const now = Date.now()
    const record = this.store.get(key)
    
    // Clean expired records periodically
    this.cleanupExpiredRecords()
    
    if (!record || now > record.resetTime) {
      // Create new record
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + config.windowMs
      }
      this.store.set(key, newRecord)
      
      return {
        allowed: true,
        remaining: config.requests - 1,
        resetTime: newRecord.resetTime
      }
    }
    
    if (record.count >= config.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        error: config.message || `Rate limit exceeded: ${config.requests} requests per ${config.windowMs / 1000}s`
      }
    }
    
    // Increment count
    record.count++
    this.store.set(key, record)
    
    return {
      allowed: true,
      remaining: config.requests - record.count,
      resetTime: record.resetTime
    }
  }
  
  private cleanupExpiredRecords() {
    const now = Date.now()
    Array.from(this.store.entries()).forEach(([key, record]) => {
      if (now > record.resetTime) {
        this.store.delete(key)
      }
    })
  }
  
  // Enhanced rate limiting for suspicious patterns
  async checkSuspiciousActivity(request: Request): Promise<{ suspicious: boolean; reason?: string }> {
    const userAgent = request.headers.get('user-agent') || ''
    const ip = this.getClientIdentifier(request)
    
    // Check for bot patterns
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /postman/i
    ]
    
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
      return { suspicious: true, reason: 'Bot user-agent detected' }
    }
    
    // Check for empty or suspicious user agents
    if (!userAgent || userAgent.length < 10) {
      return { suspicious: true, reason: 'Suspicious user-agent' }
    }
    
    // Check for rapid requests from same IP (basic DDoS protection)
    const rapidKey = `rapid:${ip}`
    const rapidRecord = this.store.get(rapidKey)
    const now = Date.now()
    
    if (!rapidRecord || now > rapidRecord.resetTime) {
      this.store.set(rapidKey, { count: 1, resetTime: now + 60000 }) // 1 minute window
    } else {
      rapidRecord.count++
      if (rapidRecord.count > 50) { // More than 50 requests per minute
        return { suspicious: true, reason: 'Rapid request pattern detected' }
      }
    }
    
    return { suspicious: false }
  }
}

export const rateLimiter = new RateLimiter()

/**
 * Middleware wrapper for rate limiting
 */
export function withRateLimit(limitType: keyof RateLimitConfig) {
  return async function(request: Request) {
    // Check for suspicious activity first
    const suspiciousCheck = await rateLimiter.checkSuspiciousActivity(request)
    if (suspiciousCheck.suspicious) {
      return {
        allowed: false,
        error: `Suspicious activity detected: ${suspiciousCheck.reason}`,
        status: 429
      }
    }
    
    // Apply rate limiting
    const result = await rateLimiter.checkRateLimit(request, limitType)
    
    if (!result.allowed) {
      return {
        allowed: false,
        error: result.error,
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS[limitType].requests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        }
      }
    }
    
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': RATE_LIMITS[limitType].requests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
      }
    }
  }
}