/**
 * Enterprise Injection Protection System
 * Implements OWASP A03 protection against Injection attacks
 */

import { DataSecurity } from './crypto'

export class InjectionProtection {
  /**
   * SQL Injection patterns to detect and block
   */
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /('|(\\x27)|(\\x2D\\x2D)|(%27)|(%2D%2D))/i,
    /(\b(OR|AND)\b.*=.*)/i,
    /(\/\*|\*\/|\/\/|#|--|;)/,
    /(\b(WAITFOR|DELAY|SLEEP|BENCHMARK)\b)/i,
    /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR|SYSCOLUMNS|SYSOBJECTS)\b)/i
  ]

  /**
   * NoSQL Injection patterns for MongoDB
   */
  private static readonly NOSQL_INJECTION_PATTERNS = [
    /\$where/i,
    /\$regex/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$or/i,
    /\$and/i,
    /\$in/i,
    /\$nin/i,
    /javascript:/i,
    /eval\(/i,
    /function\(/i
  ]

  /**
   * XSS patterns to detect and block
   */
  private static readonly XSS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<form[^>]*>.*?<\/form>/gi,
    /on\w+\s*=/gi, // Event handlers like onclick, onload
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /<[^>]*style[^>]*expression/gi,
    /<[^>]*style[^>]*javascript/gi
  ]

  /**
   * Command injection patterns
   */
  private static readonly COMMAND_INJECTION_PATTERNS = [
    /[;&|`${}()]/,
    /\.\.\//,
    /\/etc\/passwd/i,
    /\/bin\/(sh|bash|zsh|fish)/i,
    /(curl|wget|nc|netcat|telnet)/i,
    /(rm|del|format|fdisk)/i
  ]

  /**
   * Validate and sanitize SQL query parameters
   */
  static validateSQLInput(input: any): { isValid: boolean; sanitized?: any; error?: string } {
    if (typeof input !== 'string') {
      return { isValid: true, sanitized: input }
    }

    // Check for SQL injection patterns
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        return { 
          isValid: false, 
          error: 'Potential SQL injection detected' 
        }
      }
    }

    // Sanitize the input
    const sanitized = input
      .replace(/['"\\]/g, '') // Remove quotes and backslashes
      .trim()
      .slice(0, 1000) // Limit length

    return { isValid: true, sanitized }
  }

  /**
   * Validate NoSQL query parameters
   */
  static validateNoSQLInput(input: any): { isValid: boolean; sanitized?: any; error?: string } {
    if (typeof input === 'object' && input !== null) {
      // Check for MongoDB operator injection
      const inputStr = JSON.stringify(input)
      for (const pattern of this.NOSQL_INJECTION_PATTERNS) {
        if (pattern.test(inputStr)) {
          return { 
            isValid: false, 
            error: 'Potential NoSQL injection detected' 
          }
        }
      }
    }

    if (typeof input === 'string') {
      // Apply string-based NoSQL injection checks
      for (const pattern of this.NOSQL_INJECTION_PATTERNS) {
        if (pattern.test(input)) {
          return { 
            isValid: false, 
            error: 'Potential NoSQL injection detected' 
          }
        }
      }
    }

    return { isValid: true, sanitized: input }
  }

  /**
   * Validate and sanitize user input against XSS
   */
  static validateXSSInput(input: string): { isValid: boolean; sanitized?: string; error?: string } {
    if (typeof input !== 'string') {
      return { isValid: true, sanitized: String(input) }
    }

    // Check for XSS patterns
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(input)) {
        return { 
          isValid: false, 
          error: 'Potential XSS attack detected' 
        }
      }
    }

    // Sanitize HTML entities and dangerous characters
    const sanitized = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()
      .slice(0, 5000) // Limit length for content

    return { isValid: true, sanitized }
  }

  /**
   * Validate command line parameters
   */
  static validateCommandInput(input: string): { isValid: boolean; error?: string } {
    if (typeof input !== 'string') {
      return { isValid: false, error: 'Invalid input type' }
    }

    // Check for command injection patterns
    for (const pattern of this.COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        return { 
          isValid: false, 
          error: 'Potential command injection detected' 
        }
      }
    }

    return { isValid: true }
  }

  /**
   * Comprehensive input validation for API requests
   */
  static validateAPIInput(data: any, schema: ValidationSchema): ValidationResult {
    const errors: string[] = []
    const sanitized: any = {}

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]

      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${field}' is required`)
        continue
      }

      // Skip validation if field is not required and not present
      if (!rules.required && (value === undefined || value === null)) {
        continue
      }

      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push(`Field '${field}' must be of type ${rules.type}`)
        continue
      }

      // Length validation
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`Field '${field}' exceeds maximum length of ${rules.maxLength}`)
        continue
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`Field '${field}' is below minimum length of ${rules.minLength}`)
        continue
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`Field '${field}' does not match required pattern`)
        continue
      }

      // Injection validation
      let processedValue = value

      if (typeof value === 'string') {
        // XSS validation
        const xssCheck = this.validateXSSInput(value)
        if (!xssCheck.isValid) {
          errors.push(`Field '${field}': ${xssCheck.error}`)
          continue
        }

        // SQL injection validation
        const sqlCheck = this.validateSQLInput(value)
        if (!sqlCheck.isValid) {
          errors.push(`Field '${field}': ${sqlCheck.error}`)
          continue
        }

        processedValue = sqlCheck.sanitized
      }

      // NoSQL injection validation for objects
      const nosqlCheck = this.validateNoSQLInput(processedValue)
      if (!nosqlCheck.isValid) {
        errors.push(`Field '${field}': ${nosqlCheck.error}`)
        continue
      }

      sanitized[field] = nosqlCheck.sanitized
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    }
  }

  /**
   * Validate file upload content
   */
  static validateFileUpload(file: {
    name: string
    type: string
    size: number
  }): { isValid: boolean; error?: string } {
    // Validate file name
    const nameCheck = this.validateCommandInput(file.name)
    if (!nameCheck.isValid) {
      return { isValid: false, error: 'Invalid file name' }
    }

    // Check for dangerous file extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
      '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh'
    ]

    const fileExt = file.name.toLowerCase().split('.').pop()
    if (fileExt && dangerousExtensions.includes(`.${fileExt}`)) {
      return { isValid: false, error: 'File type not allowed' }
    }

    // Validate MIME type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'application/pdf', 'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'MIME type not allowed' }
    }

    // Size validation (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return { isValid: false, error: 'File size too large' }
    }

    return { isValid: true }
  }
}

// Interfaces for validation
interface ValidationRule {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'object'
  maxLength?: number
  minLength?: number
  pattern?: RegExp
}

interface ValidationSchema {
  [field: string]: ValidationRule
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitized?: any
}

/**
 * Common validation schemas for the application
 */
export const ValidationSchemas = {
  comment: {
    content: {
      required: true,
      type: 'string' as const,
      maxLength: 2000,
      minLength: 1
    },
    video_id: {
      required: true,
      type: 'string' as const,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9_-]+$/
    },
    video_title: {
      required: false,
      type: 'string' as const,
      maxLength: 200
    }
  },

  user: {
    email: {
      required: true,
      type: 'string' as const,
      maxLength: 254,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    name: {
      required: false,
      type: 'string' as const,
      maxLength: 100
    }
  },

  payment: {
    amount: {
      required: true,
      type: 'number' as const
    },
    email: {
      required: true,
      type: 'string' as const,
      maxLength: 254,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    currency: {
      required: false,
      type: 'string' as const,
      pattern: /^[A-Z]{3}$/
    }
  }
}