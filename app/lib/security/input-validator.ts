/**
 * Enterprise Input Validation and Sanitization
 * Implements OWASP input validation best practices
 * Prevents injection attacks (A03)
 */

import { createHash } from 'crypto'
import DOMPurify from 'isomorphic-dompurify'

interface ValidationResult {
  isValid: boolean
  sanitized?: string
  errors: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  customValidator?: (value: string) => boolean
  sanitizer?: (value: string) => string
}

export class SecureInputValidator {
  private static readonly MAX_INPUT_LENGTH = 1000000 // 1MB
  private static readonly DEFAULT_MAX_LENGTH = 10000
  
  // Pre-compiled regex patterns for performance
  private static readonly PATTERNS = {
    // Bitcoin-specific patterns
    BITCOIN_PRIVATE_KEY: /^[KLc][1-9A-HJ-NP-Za-km-z]{50,51}$/,
    BITCOIN_ADDRESS_LEGACY: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    BITCOIN_ADDRESS_SEGWIT: /^bc1[a-z0-9]{39,59}$/,
    BITCOIN_ADDRESS_SIGNET: /^(tb1|[2mn])[a-zA-Z0-9]{25,59}$/,
    BITCOIN_TXID: /^[a-fA-F0-9]{64}$/,
    BITCOIN_AMOUNT: /^\d+(\.\d{1,8})?$/,
    
    // General security patterns
    SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|EXECUTE|SP_|XP_)\b)|(\b(OR|AND)\s+[\'\"]?\d+[\'\"]?\s*=\s*[\'\"]?\d+[\'\"]?)|(\b(WAITFOR|DELAY)\b)|(['"];?(\s)*(OR|AND)(\s)*['"]?(\s)*['"])/gi,
    XSS_PATTERNS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    HTML_TAGS: /<[^>]*>/g,
    JAVASCRIPT_PROTOCOL: /javascript:/gi,
    DATA_URL: /data:/gi,
    
    // Path traversal
    PATH_TRAVERSAL: /(\.\.[\/\\])|(\.\.[\\])|(%2e%2e[\/\\])|(%2e%2e%2f)|(%2e%2e%5c)/gi,
    
    // NoSQL injection
    NOSQL_INJECTION: /(\$where|\$ne|\$in|\$nin|\$and|\$or|\$not|\$nor|\$exists|\$type|\$mod|\$regex|\$text|\$search)/gi,
    
    // LDAP injection
    LDAP_INJECTION: /(\(|\)|&|\||!|=|~|>|<|\*)/g,
    
    // Command injection
    COMMAND_INJECTION: /(;|\||&|`|\$\(|\$\{|<|>)/g,
    
    // Email validation (RFC 5322 compliant)
    EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    
    // URL validation
    URL: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&%=.])*)?(?:\#(?:\w)*)?)??$/,
    
    // Alphanumeric only
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    
    // Safe filename
    SAFE_FILENAME: /^[a-zA-Z0-9._-]+$/
  }

  /**
   * Validate Bitcoin private key with comprehensive security checks
   */
  static validatePrivateKey(input: string): ValidationResult {
    const errors: string[] = []
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Basic validation
    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        errors: ['Private key is required'],
        severity: 'high'
      }
    }

    const sanitized = this.sanitizeInput(input.trim())

    // Length check
    if (sanitized.length < 51 || sanitized.length > 52) {
      errors.push('Invalid private key length')
      severity = 'high'
    }

    // Pattern validation
    if (!this.PATTERNS.BITCOIN_PRIVATE_KEY.test(sanitized)) {
      errors.push('Invalid private key format')
      severity = 'high'
    }

    // Security checks
    const securityCheck = this.performSecurityChecks(sanitized)
    if (securityCheck.threats.length > 0) {
      errors.push(...securityCheck.threats)
      severity = 'critical'
    }

    return {
      isValid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors,
      severity
    }
  }

  /**
   * Validate Bitcoin address for multiple formats
   */
  static validateBitcoinAddress(input: string, network: 'mainnet' | 'testnet' | 'signet' = 'signet'): ValidationResult {
    const errors: string[] = []
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'

    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        errors: ['Bitcoin address is required'],
        severity: 'medium'
      }
    }

    const sanitized = this.sanitizeInput(input.trim())

    // Length validation
    if (sanitized.length < 25 || sanitized.length > 62) {
      errors.push('Invalid address length')
      severity = 'medium'
    }

    // Pattern validation based on network
    let isValidFormat = false
    switch (network) {
      case 'mainnet':
        isValidFormat = this.PATTERNS.BITCOIN_ADDRESS_LEGACY.test(sanitized) ||
                       this.PATTERNS.BITCOIN_ADDRESS_SEGWIT.test(sanitized)
        break
      case 'testnet':
      case 'signet':
        isValidFormat = this.PATTERNS.BITCOIN_ADDRESS_SIGNET.test(sanitized)
        break
    }

    if (!isValidFormat) {
      errors.push(`Invalid ${network} address format`)
      severity = 'medium'
    }

    // Security checks
    const securityCheck = this.performSecurityChecks(sanitized)
    if (securityCheck.threats.length > 0) {
      errors.push(...securityCheck.threats)
      severity = 'critical'
    }

    return {
      isValid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors,
      severity
    }
  }

  /**
   * Validate transaction ID
   */
  static validateTransactionId(input: string): ValidationResult {
    const errors: string[] = []
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'

    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        errors: ['Transaction ID is required'],
        severity: 'medium'
      }
    }

    const sanitized = this.sanitizeInput(input.trim())

    // Exact length check
    if (sanitized.length !== 64) {
      errors.push('Transaction ID must be exactly 64 characters')
      severity = 'medium'
    }

    // Hexadecimal pattern
    if (!this.PATTERNS.BITCOIN_TXID.test(sanitized)) {
      errors.push('Transaction ID must contain only hexadecimal characters')
      severity = 'medium'
    }

    // Security checks
    const securityCheck = this.performSecurityChecks(sanitized)
    if (securityCheck.threats.length > 0) {
      errors.push(...securityCheck.threats)
      severity = 'critical'
    }

    return {
      isValid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors,
      severity
    }
  }

  /**
   * Validate Bitcoin amount
   */
  static validateBitcoinAmount(input: string): ValidationResult {
    const errors: string[] = []
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'

    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        errors: ['Amount is required'],
        severity: 'medium'
      }
    }

    const sanitized = this.sanitizeInput(input.trim())

    // Pattern validation
    if (!this.PATTERNS.BITCOIN_AMOUNT.test(sanitized)) {
      errors.push('Invalid amount format')
      severity = 'medium'
    }

    // Numeric validation
    const amount = parseFloat(sanitized)
    if (isNaN(amount)) {
      errors.push('Amount must be a valid number')
      severity = 'medium'
    } else {
      // Range validation
      if (amount < 0) {
        errors.push('Amount cannot be negative')
        severity = 'medium'
      }
      
      if (amount > 21000000) {
        errors.push('Amount exceeds maximum possible Bitcoin supply')
        severity = 'high'
      }
      
      // Precision validation (Bitcoin has 8 decimal places)
      const decimalPart = sanitized.split('.')[1]
      if (decimalPart && decimalPart.length > 8) {
        errors.push('Amount cannot have more than 8 decimal places')
        severity = 'low'
      }
    }

    // Security checks
    const securityCheck = this.performSecurityChecks(sanitized)
    if (securityCheck.threats.length > 0) {
      errors.push(...securityCheck.threats)
      severity = 'critical'
    }

    return {
      isValid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors,
      severity
    }
  }

  /**
   * Validate and sanitize HTML content
   */
  static validateHTMLContent(input: string): ValidationResult {
    const errors: string[] = []
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'

    if (!input) {
      return {
        isValid: true,
        sanitized: '',
        errors: [],
        severity: 'low'
      }
    }

    // Length check
    if (input.length > this.DEFAULT_MAX_LENGTH) {
      errors.push(`Content exceeds maximum length of ${this.DEFAULT_MAX_LENGTH} characters`)
      severity = 'medium'
    }

    // Security checks before sanitization
    const securityCheck = this.performSecurityChecks(input)
    if (securityCheck.threats.length > 0) {
      errors.push(...securityCheck.threats)
      severity = 'critical'
    }

    // Sanitize HTML using DOMPurify
    let sanitized = ''
    try {
      sanitized = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: [],
        ALLOW_DATA_ATTR: false
      })
    } catch (error) {
      errors.push('HTML sanitization failed')
      severity = 'high'
    }

    return {
      isValid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors,
      severity
    }
  }

  /**
   * Validate URL with security checks
   */
  static validateURL(input: string): ValidationResult {
    const errors: string[] = []
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'

    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        errors: ['URL is required'],
        severity: 'medium'
      }
    }

    const sanitized = this.sanitizeInput(input.trim())

    // Basic URL pattern
    if (!this.PATTERNS.URL.test(sanitized)) {
      errors.push('Invalid URL format')
      severity = 'medium'
    }

    // Security checks
    if (sanitized.includes('javascript:')) {
      errors.push('JavaScript URLs are not allowed')
      severity = 'critical'
    }

    if (sanitized.includes('data:')) {
      errors.push('Data URLs are not allowed')
      severity = 'high'
    }

    // Check for suspicious patterns
    const securityCheck = this.performSecurityChecks(sanitized)
    if (securityCheck.threats.length > 0) {
      errors.push(...securityCheck.threats)
      severity = 'critical'
    }

    return {
      isValid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors,
      severity
    }
  }

  /**
   * Generic input validation with custom rules
   */
  static validateInput(input: string, rules: ValidationRule): ValidationResult {
    const errors: string[] = []
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Required check
    if (rules.required && (!input || input.trim().length === 0)) {
      return {
        isValid: false,
        errors: ['Field is required'],
        severity: 'medium'
      }
    }

    if (!input) {
      return {
        isValid: true,
        sanitized: '',
        errors: [],
        severity: 'low'
      }
    }

    let sanitized = rules.sanitizer ? rules.sanitizer(input) : this.sanitizeInput(input)

    // Length validation
    if (rules.minLength && sanitized.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength} characters`)
      severity = 'medium'
    }

    if (rules.maxLength && sanitized.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength} characters`)
      severity = 'medium'
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(sanitized)) {
      errors.push('Input format is invalid')
      severity = 'medium'
    }

    // Custom validation
    if (rules.customValidator && !rules.customValidator(sanitized)) {
      errors.push('Custom validation failed')
      severity = 'medium'
    }

    // Security checks
    const securityCheck = this.performSecurityChecks(sanitized)
    if (securityCheck.threats.length > 0) {
      errors.push(...securityCheck.threats)
      severity = 'critical'
    }

    return {
      isValid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors,
      severity
    }
  }

  /**
   * Comprehensive security threat detection
   */
  private static performSecurityChecks(input: string): { threats: string[]; risk: string } {
    const threats: string[] = []
    let risk = 'low'

    // Check input length to prevent DoS
    if (input.length > this.MAX_INPUT_LENGTH) {
      threats.push('Input exceeds maximum allowed length')
      risk = 'high'
    }

    // SQL Injection detection
    if (this.PATTERNS.SQL_INJECTION.test(input)) {
      threats.push('Potential SQL injection detected')
      risk = 'critical'
    }

    // XSS detection
    if (this.PATTERNS.XSS_PATTERNS.test(input)) {
      threats.push('Potential XSS attack detected')
      risk = 'critical'
    }

    // NoSQL injection detection
    if (this.PATTERNS.NOSQL_INJECTION.test(input)) {
      threats.push('Potential NoSQL injection detected')
      risk = 'critical'
    }

    // Path traversal detection
    if (this.PATTERNS.PATH_TRAVERSAL.test(input)) {
      threats.push('Path traversal attempt detected')
      risk = 'high'
    }

    // Command injection detection
    if (this.PATTERNS.COMMAND_INJECTION.test(input)) {
      threats.push('Potential command injection detected')
      risk = 'critical'
    }

    // LDAP injection detection
    const ldapMatches = input.match(this.PATTERNS.LDAP_INJECTION)
    if (ldapMatches && ldapMatches.length > 3) {
      threats.push('Potential LDAP injection detected')
      risk = 'high'
    }

    return { threats, risk }
  }

  /**
   * Basic input sanitization
   */
  private static sanitizeInput(input: string): string {
    if (!input) return ''
    
    return input
      .trim()
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\uFEFF/g, '') // Remove BOM
      .normalize('NFC') // Unicode normalization
  }

  /**
   * Create input hash for rate limiting
   */
  static createInputHash(input: string): string {
    return createHash('sha256').update(input).digest('hex').substring(0, 16)
  }

  /**
   * Validate multiple inputs as batch
   */
  static validateBatch(inputs: Array<{ value: string; rules: ValidationRule }>): Array<ValidationResult> {
    return inputs.map(({ value, rules }) => this.validateInput(value, rules))
  }
}

// Export common validation patterns
export const ValidationPatterns = SecureInputValidator['PATTERNS']
export type { ValidationRule, ValidationResult }
export default SecureInputValidator