/**
 * Secure Error Handling System
 * Implements OWASP best practices for error handling and information disclosure prevention
 */

import { NextResponse } from 'next/server'
import { securityLogger, SecurityEventType } from './security-logger'
import { v4 as uuidv4 } from 'uuid'

/**
 * Standard error codes for consistent error responses
 */
export enum ErrorCode {
  // Authentication errors (1xxx)
  AUTH_REQUIRED = 'AUTH_001',
  AUTH_INVALID_CREDENTIALS = 'AUTH_002',
  AUTH_SESSION_EXPIRED = 'AUTH_003',
  AUTH_TOKEN_INVALID = 'AUTH_004',
  AUTH_INSUFFICIENT_PRIVILEGES = 'AUTH_005',
  
  // Validation errors (2xxx)
  VALIDATION_FAILED = 'VAL_001',
  VALIDATION_MISSING_FIELD = 'VAL_002',
  VALIDATION_INVALID_FORMAT = 'VAL_003',
  VALIDATION_OUT_OF_RANGE = 'VAL_004',
  
  // Resource errors (3xxx)
  RESOURCE_NOT_FOUND = 'RES_001',
  RESOURCE_ALREADY_EXISTS = 'RES_002',
  RESOURCE_LOCKED = 'RES_003',
  RESOURCE_LIMIT_EXCEEDED = 'RES_004',
  
  // Business logic errors (4xxx)
  BUSINESS_RULE_VIOLATION = 'BUS_001',
  PAYMENT_FAILED = 'BUS_002',
  INSUFFICIENT_BALANCE = 'BUS_003',
  OPERATION_NOT_ALLOWED = 'BUS_004',
  
  // Rate limiting errors (5xxx)
  RATE_LIMIT_EXCEEDED = 'RATE_001',
  RATE_LIMIT_SUSPICIOUS = 'RATE_002',
  
  // Security errors (6xxx)
  SECURITY_VIOLATION = 'SEC_001',
  CSRF_TOKEN_INVALID = 'SEC_002',
  INJECTION_DETECTED = 'SEC_003',
  XSS_DETECTED = 'SEC_004',
  PATH_TRAVERSAL_DETECTED = 'SEC_005',
  
  // System errors (9xxx)
  INTERNAL_ERROR = 'SYS_001',
  SERVICE_UNAVAILABLE = 'SYS_002',
  DATABASE_ERROR = 'SYS_003',
  EXTERNAL_SERVICE_ERROR = 'SYS_004',
  CONFIGURATION_ERROR = 'SYS_005'
}

/**
 * Map error codes to HTTP status codes
 */
const ERROR_STATUS_MAP: Record<string, number> = {
  // 401 Unauthorized
  [ErrorCode.AUTH_REQUIRED]: 401,
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  [ErrorCode.AUTH_SESSION_EXPIRED]: 401,
  [ErrorCode.AUTH_TOKEN_INVALID]: 401,
  
  // 403 Forbidden
  [ErrorCode.AUTH_INSUFFICIENT_PRIVILEGES]: 403,
  [ErrorCode.SECURITY_VIOLATION]: 403,
  [ErrorCode.CSRF_TOKEN_INVALID]: 403,
  [ErrorCode.INJECTION_DETECTED]: 403,
  [ErrorCode.XSS_DETECTED]: 403,
  [ErrorCode.PATH_TRAVERSAL_DETECTED]: 403,
  [ErrorCode.OPERATION_NOT_ALLOWED]: 403,
  
  // 400 Bad Request
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.VALIDATION_MISSING_FIELD]: 400,
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 400,
  [ErrorCode.VALIDATION_OUT_OF_RANGE]: 400,
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 400,
  
  // 404 Not Found
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  
  // 409 Conflict
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: 409,
  [ErrorCode.RESOURCE_LOCKED]: 409,
  
  // 402 Payment Required
  [ErrorCode.PAYMENT_FAILED]: 402,
  [ErrorCode.INSUFFICIENT_BALANCE]: 402,
  
  // 429 Too Many Requests
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.RATE_LIMIT_SUSPICIOUS]: 429,
  [ErrorCode.RESOURCE_LIMIT_EXCEEDED]: 429,
  
  // 500 Internal Server Error
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.CONFIGURATION_ERROR]: 500,
  
  // 503 Service Unavailable
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 503
}

/**
 * User-friendly error messages (localized)
 */
const ERROR_MESSAGES: Record<ErrorCode, { en: string; pt: string }> = {
  // Authentication
  [ErrorCode.AUTH_REQUIRED]: {
    en: 'Authentication required',
    pt: 'Autenticação necessária'
  },
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: {
    en: 'Invalid credentials',
    pt: 'Credenciais inválidas'
  },
  [ErrorCode.AUTH_SESSION_EXPIRED]: {
    en: 'Session expired',
    pt: 'Sessão expirada'
  },
  [ErrorCode.AUTH_TOKEN_INVALID]: {
    en: 'Invalid authentication token',
    pt: 'Token de autenticação inválido'
  },
  [ErrorCode.AUTH_INSUFFICIENT_PRIVILEGES]: {
    en: 'Insufficient privileges',
    pt: 'Privilégios insuficientes'
  },
  
  // Validation
  [ErrorCode.VALIDATION_FAILED]: {
    en: 'Validation failed',
    pt: 'Falha na validação'
  },
  [ErrorCode.VALIDATION_MISSING_FIELD]: {
    en: 'Required field missing',
    pt: 'Campo obrigatório ausente'
  },
  [ErrorCode.VALIDATION_INVALID_FORMAT]: {
    en: 'Invalid format',
    pt: 'Formato inválido'
  },
  [ErrorCode.VALIDATION_OUT_OF_RANGE]: {
    en: 'Value out of range',
    pt: 'Valor fora do intervalo'
  },
  
  // Resources
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    en: 'Resource not found',
    pt: 'Recurso não encontrado'
  },
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: {
    en: 'Resource already exists',
    pt: 'Recurso já existe'
  },
  [ErrorCode.RESOURCE_LOCKED]: {
    en: 'Resource is locked',
    pt: 'Recurso está bloqueado'
  },
  [ErrorCode.RESOURCE_LIMIT_EXCEEDED]: {
    en: 'Resource limit exceeded',
    pt: 'Limite de recursos excedido'
  },
  
  // Business logic
  [ErrorCode.BUSINESS_RULE_VIOLATION]: {
    en: 'Business rule violation',
    pt: 'Violação de regra de negócio'
  },
  [ErrorCode.PAYMENT_FAILED]: {
    en: 'Payment processing failed',
    pt: 'Falha no processamento do pagamento'
  },
  [ErrorCode.INSUFFICIENT_BALANCE]: {
    en: 'Insufficient balance',
    pt: 'Saldo insuficiente'
  },
  [ErrorCode.OPERATION_NOT_ALLOWED]: {
    en: 'Operation not allowed',
    pt: 'Operação não permitida'
  },
  
  // Rate limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    en: 'Too many requests',
    pt: 'Muitas requisições'
  },
  [ErrorCode.RATE_LIMIT_SUSPICIOUS]: {
    en: 'Suspicious activity detected',
    pt: 'Atividade suspeita detectada'
  },
  
  // Security
  [ErrorCode.SECURITY_VIOLATION]: {
    en: 'Security violation detected',
    pt: 'Violação de segurança detectada'
  },
  [ErrorCode.CSRF_TOKEN_INVALID]: {
    en: 'Invalid security token',
    pt: 'Token de segurança inválido'
  },
  [ErrorCode.INJECTION_DETECTED]: {
    en: 'Invalid input detected',
    pt: 'Entrada inválida detectada'
  },
  [ErrorCode.XSS_DETECTED]: {
    en: 'Invalid input detected',
    pt: 'Entrada inválida detectada'
  },
  [ErrorCode.PATH_TRAVERSAL_DETECTED]: {
    en: 'Invalid path',
    pt: 'Caminho inválido'
  },
  
  // System
  [ErrorCode.INTERNAL_ERROR]: {
    en: 'An error occurred',
    pt: 'Ocorreu um erro'
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    en: 'Service temporarily unavailable',
    pt: 'Serviço temporariamente indisponível'
  },
  [ErrorCode.DATABASE_ERROR]: {
    en: 'An error occurred',
    pt: 'Ocorreu um erro'
  },
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: {
    en: 'External service error',
    pt: 'Erro no serviço externo'
  },
  [ErrorCode.CONFIGURATION_ERROR]: {
    en: 'Configuration error',
    pt: 'Erro de configuração'
  }
}

/**
 * Application error class with secure handling
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly requestId: string
  public readonly details?: any
  public readonly timestamp: Date
  
  constructor(
    code: ErrorCode,
    details?: any,
    originalError?: Error
  ) {
    const message = ERROR_MESSAGES[code]?.en || 'An error occurred'
    super(message)
    
    this.name = 'AppError'
    this.code = code
    this.statusCode = ERROR_STATUS_MAP[code] || 500
    this.requestId = uuidv4()
    this.details = details
    this.timestamp = new Date()
    
    // Preserve original error stack in development
    if (originalError && process.env.NODE_ENV === 'development') {
      this.stack = originalError.stack
    }
  }
}

/**
 * Secure error response builder
 */
export class ErrorHandler {
  /**
   * Create a secure error response
   */
  static createErrorResponse(
    error: AppError | Error,
    request?: Request,
    locale: 'en' | 'pt' = 'en'
  ): NextResponse {
    let appError: AppError
    
    // Convert regular errors to AppError
    if (error instanceof AppError) {
      appError = error
    } else {
      // Map common errors to appropriate error codes
      const errorCode = this.mapErrorToCode(error)
      appError = new AppError(errorCode, undefined, error)
    }
    
    // Log the error with full details
    this.logError(appError, request)
    
    // Create safe response
    const response = this.createSafeResponse(appError, locale)
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Content-Type', 'application/json')
    
    return response
  }
  
  /**
   * Map generic errors to error codes
   */
  private static mapErrorToCode(error: Error): ErrorCode {
    const message = error.message.toLowerCase()
    
    // Database errors
    if (message.includes('database') || message.includes('supabase')) {
      return ErrorCode.DATABASE_ERROR
    }
    
    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized')) {
      return ErrorCode.AUTH_REQUIRED
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCode.VALIDATION_FAILED
    }
    
    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return ErrorCode.RESOURCE_NOT_FOUND
    }
    
    // Default to internal error
    return ErrorCode.INTERNAL_ERROR
  }
  
  /**
   * Log error with security context
   */
  private static logError(error: AppError, request?: Request): void {
    const logLevel = error.statusCode >= 500 ? 'error' : 'warn'
    const eventType = this.getSecurityEventType(error.code)
    
    const metadata = {
      errorCode: error.code,
      requestId: error.requestId,
      statusCode: error.statusCode,
      timestamp: error.timestamp.toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        details: error.details,
        stack: error.stack
      })
    }
    
    if (logLevel === 'error') {
      securityLogger.error(eventType, error.message, metadata, request)
    } else {
      securityLogger.warn(eventType, error.message, metadata, request)
    }
  }
  
  /**
   * Map error codes to security event types
   */
  private static getSecurityEventType(code: ErrorCode): SecurityEventType {
    const prefix = code.split('_')[0]
    
    switch (prefix) {
      case 'AUTH':
        return SecurityEventType.LOGIN_FAILURE
      case 'SEC':
        return SecurityEventType.SECURITY_VIOLATION
      case 'RATE':
        return SecurityEventType.RATE_LIMIT_EXCEEDED
      case 'BUS':
        return SecurityEventType.PAYMENT_FAILED
      default:
        return SecurityEventType.SYSTEM_ERROR
    }
  }
  
  /**
   * Create safe response without leaking information
   */
  private static createSafeResponse(
    error: AppError,
    locale: 'en' | 'pt'
  ): NextResponse {
    const message = ERROR_MESSAGES[error.code]?.[locale] || 
                   ERROR_MESSAGES[ErrorCode.INTERNAL_ERROR][locale]
    
    const responseBody = {
      error: {
        code: error.code,
        message,
        requestId: error.requestId
      }
    }
    
    // Add retry-after header for rate limiting
    if (error.code === ErrorCode.RATE_LIMIT_EXCEEDED) {
      const response = NextResponse.json(responseBody, { 
        status: error.statusCode 
      })
      response.headers.set('Retry-After', '60')
      return response
    }
    
    return NextResponse.json(responseBody, { 
      status: error.statusCode 
    })
  }
  
  /**
   * Handle validation errors with field details
   */
  static createValidationError(
    fields: Record<string, string>,
    locale: 'en' | 'pt' = 'en'
  ): NextResponse {
    const error = new AppError(ErrorCode.VALIDATION_FAILED, { fields })
    return this.createErrorResponse(error, undefined, locale)
  }
  
  /**
   * Handle rate limit errors with retry information
   */
  static createRateLimitError(
    retryAfter: number,
    locale: 'en' | 'pt' = 'en'
  ): NextResponse {
    const error = new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, { retryAfter })
    const response = this.createErrorResponse(error, undefined, locale)
    response.headers.set('Retry-After', retryAfter.toString())
    return response
  }
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  defaultErrorCode: ErrorCode = ErrorCode.INTERNAL_ERROR
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      const request = args[0] as Request | undefined
      
      if (error instanceof AppError) {
        return ErrorHandler.createErrorResponse(error, request)
      }
      
      const appError = new AppError(
        defaultErrorCode,
        undefined,
        error instanceof Error ? error : new Error(String(error))
      )
      
      return ErrorHandler.createErrorResponse(appError, request)
    }
  }) as T
}