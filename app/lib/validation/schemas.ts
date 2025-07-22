/**
 * Comprehensive Input Validation Schemas
 * Using Zod for type-safe validation and security
 */

import { z } from 'zod'

// Base validation patterns
const EmailSchema = z.string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(254, 'Email muito longo')
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de email inválido')

const UUIDSchema = z.string()
  .uuid('UUID inválido')

export const VideoIdSchema = z.string()
  .min(1, 'Video ID é obrigatório')
  .max(255, 'Video ID muito longo')
  .refine(
    (val) => !val.includes('..'),
    'Path traversal não é permitido no Video ID'
  )
  .refine(
    (val) => !/[<>:"|?*\x00-\x1f\\]/.test(val),
    'Video ID contém caracteres proibidos'
  )

// Payment schemas - Critical security validation
// Separate schemas for donations vs Pro payments
export const CreateDonationInvoiceSchema = z.object({
  amount: z.number()
    .positive('Valor deve ser positivo')
    .finite('Valor deve ser finito')
    .max(10000, 'Valor máximo é R$ 10.000'),
  
  currency: z.literal('BRL', {
    errorMap: () => ({ message: 'Apenas BRL é aceito' })
  }),
  
  userEmail: z.string().optional(), // Completamente opcional para doações
  
  // Donation-specific fields
  storeId: z.string().optional(),
  type: z.literal('donation').optional(),
  
  // Optional metadata validation
  metadata: z.object({
    source: z.string().max(50).optional(),
    referrer: z.string().url().optional()
  }).optional()
})

export const CreateProPaymentInvoiceSchema = z.object({
  amount: z.number()
    .min(1, 'Valor mínimo é R$ 1')
    .max(10000, 'Valor máximo é R$ 10.000')
    .positive('Valor deve ser positivo')
    .finite('Valor deve ser finito'),
  
  currency: z.literal('BRL', {
    errorMap: () => ({ message: 'Apenas BRL é aceito' })
  }),
  
  userEmail: EmailSchema, // Obrigatório para pagamentos Pro
  
  // Optional metadata validation
  metadata: z.object({
    source: z.string().max(50).optional(),
    referrer: z.string().url().optional()
  }).optional()
})

// Backward compatibility - dynamic schema based on donation detection
export const CreateInvoiceSchema = z.union([
  CreateDonationInvoiceSchema,
  CreateProPaymentInvoiceSchema
])

export const WebhookPayloadSchema = z.object({
  type: z.enum([
    'InvoiceSettled',
    'InvoicePaymentSettled', 
    'InvoiceExpired',
    'InvoiceInvalid'
  ], {
    errorMap: () => ({ message: 'Tipo de webhook inválido' })
  }),
  
  invoiceId: z.string()
    .min(1, 'Invoice ID é obrigatório')
    .max(100, 'Invoice ID muito longo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invoice ID inválido'),
  
  metadata: z.object({
    buyerEmail: EmailSchema.optional()
  }).optional()
})

// Comment schemas - XSS prevention
export const CreateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comentário não pode estar vazio')
    .max(2000, 'Comentário muito longo')
    .refine(
      (val) => !/<script|javascript:|on\w+\s*=/i.test(val),
      'Conteúdo contém código não permitido'
    )
    .refine(
      (val) => val.trim().length > 0,
      'Comentário não pode conter apenas espaços'
    ),
  
  videoId: VideoIdSchema,
  
  parentId: UUIDSchema.optional(),
  
  userEmail: EmailSchema
})

export const UpdateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comentário não pode estar vazio')
    .max(2000, 'Comentário muito longo')
    .refine(
      (val) => !/<script|javascript:|on\w+\s*=/i.test(val),
      'Conteúdo contém código não permitido'
    )
})

export const LikeCommentSchema = z.object({
  commentId: UUIDSchema,
  action: z.enum(['like', 'unlike'])
})

// Video access schemas
export const SecureVideoAccessSchema = z.object({
  file: z.string()
    .min(1, 'Nome do arquivo é obrigatório')
    .max(255, 'Nome do arquivo muito longo')
    .refine(
      (val) => !val.includes('..'),
      'Path traversal não é permitido'
    )
    .refine(
      (val) => !/[<>:"|?*\x00-\x1f]/.test(val),
      'Nome de arquivo contém caracteres proibidos'
    )
    .refine(
      (val) => !val.includes('\\'),
      'Backslashes não são permitidos'
    )
    .refine(
      (val) => val.endsWith('.mp4') || val.endsWith('.webm'),
      'Apenas arquivos de vídeo são permitidos'
    )
    .refine(
      (val) => !val.startsWith('/'),
      'Paths absolutos não são permitidos'
    )
    .refine(
      (val) => !/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i.test(val),
      'Nomes reservados do Windows não são permitidos'
    )
})

// Admin schemas
export const AdminActionSchema = z.object({
  action: z.enum(['grant_pro', 'revoke_pro', 'analytics', 'audit']),
  targetEmail: EmailSchema.optional(),
  metadata: z.record(z.string()).optional()
})

export const GrantProAccessSchema = z.object({
  userEmail: EmailSchema,
  durationMonths: z.number()
    .min(1, 'Duração mínima é 1 mês')
    .max(24, 'Duração máxima é 24 meses')
    .int('Duração deve ser um número inteiro')
    .optional()
    .default(12)
})

// Analytics schemas
export const AnalyticsEventSchema = z.object({
  eventType: z.enum([
    'page_view',
    'video_start',
    'video_complete',
    'module_start',
    'module_complete',
    'comment_posted',
    'purchase_initiated',
    'purchase_completed'
  ]),
  
  eventData: z.object({
    page: z.string().max(255).optional(),
    videoId: VideoIdSchema.optional(),
    moduleId: z.string().max(50).optional(),
    duration: z.number().positive().optional(),
    timestamp: z.string().datetime().optional()
  }).optional(),
  
  userEmail: EmailSchema.optional(),
  sessionId: z.string().max(100).optional(),
  ipAddress: z.string().max(45).optional() // IPv6 max length
})

// User management schemas
export const UpdateUserProfileSchema = z.object({
  name: z.string()
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome contém caracteres inválidos')
    .optional(),
  
  image: z.string().url('URL da imagem inválida').optional()
})

// Environment validation
export const EnvironmentSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET muito curto'),
  ADMIN_EMAIL: EmailSchema,
  BTCPAY_WEBHOOK_SECRET: z.string().min(16, 'Webhook secret muito curto'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(100, 'Service role key inválida'),
  B2_APPLICATION_KEY: z.string().min(20, 'B2 key muito curta')
})

// Utility types for TypeScript
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>
export type CreateDonationInvoiceInput = z.infer<typeof CreateDonationInvoiceSchema>
export type CreateProPaymentInvoiceInput = z.infer<typeof CreateProPaymentInvoiceSchema>
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type SecureVideoAccess = z.infer<typeof SecureVideoAccessSchema>
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>
export type AdminAction = z.infer<typeof AdminActionSchema>
export type GrantProAccessInput = z.infer<typeof GrantProAccessSchema>

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: string
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Erro de validação desconhecido' }
  }
}

// Security validation helpers
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export function isValidEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]
  if (!domain) return false
  
  // Block disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'temp-mail.org',
    'guerrillamail.com',
    'mailinator.com'
  ]
  
  return !disposableDomains.includes(domain.toLowerCase())
}

export function validateFileUpload(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

// Missing Admin Validation Schemas
export const CleanupParamsSchema = z.object({
  dryRun: z.boolean().optional().default(false),
  maxAge: z.number()
    .min(1, 'Idade máxima deve ser pelo menos 1 dia')
    .max(365, 'Idade máxima não pode exceder 365 dias')
    .optional()
    .default(30),
  targetTypes: z.array(z.enum(['sessions', 'events', 'analytics', 'all']))
    .optional()
    .default(['all'])
})

export const ResetAnalyticsSchema = z.object({
  confirmReset: z.literal(true, {
    errorMap: () => ({ message: 'Confirmação de reset é obrigatória' })
  }),
  preserveUserData: z.boolean().optional().default(true),
  targetTables: z.array(z.enum(['user_events', 'user_sessions', 'user_analytics_summary']))
    .optional()
    .default(['user_events', 'user_sessions', 'user_analytics_summary'])
})

export const ManageProUserSchema = z.object({
  email: EmailSchema,
  action: z.enum(['grant', 'revoke', 'extend']),
  durationMonths: z.number()
    .min(1, 'Duração mínima é 1 mês')
    .max(24, 'Duração máxima é 24 meses')
    .int('Duração deve ser um número inteiro')
    .optional()
    .default(12),
  reason: z.string()
    .max(500, 'Razão muito longa')
    .optional()
})

// External Webhook Validation Schema
export const ExternalWebhookSchema = z.object({
  invoiceId: z.string()
    .min(1, 'Invoice ID é obrigatório')
    .max(100, 'Invoice ID muito longo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invoice ID contém caracteres inválidos'),
  
  userEmail: EmailSchema,
  
  amount: z.number()
    .min(0, 'Valor não pode ser negativo')
    .max(100000, 'Valor muito alto')
    .finite('Valor deve ser finito'),
  
  paymentMethod: z.enum([
    'bitcoin', 'lightning', 'credit_card', 'pix', 'bank_transfer', 'paypal'
  ]),
  
  status: z.enum([
    'pending', 'processing', 'completed', 'settled', 'failed', 'expired', 'cancelled'
  ]),
  
  timestamp: z.string().datetime().optional(),
  
  metadata: z.object({
    transactionId: z.string().max(100).optional(),
    gateway: z.string().max(50).optional(),
    currency: z.string().length(3).optional()
  }).optional()
})

// Enhanced Analytics Event Validation Schema
export const EnhancedAnalyticsEventSchema = z.object({
  eventType: z.enum([
    'page_view',
    'video_start',
    'video_complete',
    'video_progress',
    'module_start',
    'module_complete',
    'task_complete',
    'comment_posted',
    'purchase_initiated',
    'purchase_completed',
    'session_start',
    'session_end',
    'user_interaction',
    'badge_earned',
    'wallet_created'
  ]),
  
  sessionId: z.string()
    .min(1, 'Session ID é obrigatório')
    .max(100, 'Session ID muito longo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Session ID contém caracteres inválidos'),
  
  eventData: z.object({
    page: z.string()
      .max(255, 'URL da página muito longa')
      .refine(
        (val) => !val.includes('<script') && !val.includes('javascript:'),
        'URL contém código malicioso'
      )
      .optional(),
    
    videoId: VideoIdSchema.optional(),
    
    moduleId: z.string()
      .max(50, 'Module ID muito longo')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Module ID contém caracteres inválidos')
      .optional(),
    
    duration: z.number()
      .min(0, 'Duração não pode ser negativa')
      .max(86400, 'Duração não pode exceder 24 horas')
      .optional(),
    
    progress: z.number()
      .min(0, 'Progresso não pode ser negativo')
      .max(100, 'Progresso não pode exceder 100%')
      .optional(),
    
    timestamp: z.string().datetime().optional(),
    
    userAgent: z.string()
      .max(500, 'User agent muito longo')
      .optional(),
    
    referrer: z.string()
      .max(500, 'Referrer muito longo')
      .url('Referrer deve ser uma URL válida')
      .optional()
  }).optional(),
  
  userEmail: EmailSchema.optional(),
  ipAddress: z.string()
    .max(45, 'IP address muito longo') // IPv6 max length
    .regex(/^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, 'Formato de IP inválido')
    .optional()
})

// Payment Confirmation Schema
export const PaymentConfirmationSchema = z.object({
  paymentId: z.string()
    .min(1, 'Payment ID é obrigatório')
    .max(100, 'Payment ID muito longo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Payment ID contém caracteres inválidos'),
  
  userEmail: EmailSchema,
  
  amount: z.number()
    .min(0.01, 'Valor mínimo é 0.01')
    .max(100000, 'Valor muito alto')
    .finite('Valor deve ser finito'),
  
  currency: z.enum(['BRL', 'USD', 'EUR'], {
    errorMap: () => ({ message: 'Moeda não suportada' })
  }),
  
  status: z.enum(['confirmed', 'failed', 'pending']),
  
  transactionHash: z.string()
    .max(100, 'Hash da transação muito longo')
    .optional(),
  
  metadata: z.object({
    gateway: z.string().max(50).optional(),
    fees: z.number().min(0).optional(),
    exchangeRate: z.number().positive().optional()
  }).optional()
})

// User Session Management Schema
export const UserSessionSchema = z.object({
  sessionId: z.string()
    .min(1, 'Session ID é obrigatório')
    .max(100, 'Session ID muito longo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Session ID contém caracteres inválidos'),
  
  action: z.enum(['start', 'heartbeat', 'end']),
  
  duration: z.number()
    .min(0, 'Duração não pode ser negativa')
    .max(86400, 'Duração não pode exceder 24 horas')
    .optional(),
  
  geolocation: z.object({
    country: z.string().max(100).optional(),
    region: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    timezone: z.string().max(50).optional()
  }).optional(),
  
  metadata: z.object({
    userAgent: z.string().max(500).optional(),
    screenResolution: z.string()
      .regex(/^\d{3,5}x\d{3,5}$/, 'Formato de resolução inválido')
      .optional(),
    language: z.string().max(10).optional(),
    platform: z.enum(['web', 'mobile', 'tablet', 'desktop']).optional()
  }).optional()
})

// Pro User Management Validation (Enhanced)
export const ProUserManagementSchema = z.object({
  email: EmailSchema,
  action: z.enum(['grant', 'revoke', 'check', 'extend']),
  durationMonths: z.number()
    .min(1, 'Duração mínima é 1 mês')
    .max(24, 'Duração máxima é 24 meses')
    .int('Duração deve ser um número inteiro')
    .optional(),
  reason: z.string()
    .min(5, 'Razão muito curta')
    .max(500, 'Razão muito longa')
    .refine(
      (val) => !/<script|javascript:|on\w+\s*=/i.test(val),
      'Razão contém código não permitido'
    )
    .optional(),
  notifyUser: z.boolean().optional().default(true)
})

// Add type exports for new schemas
export type CleanupParams = z.infer<typeof CleanupParamsSchema>
export type ResetAnalyticsInput = z.infer<typeof ResetAnalyticsSchema>
export type ManageProUserInput = z.infer<typeof ManageProUserSchema>
export type ExternalWebhookInput = z.infer<typeof ExternalWebhookSchema>
export type EnhancedAnalyticsEvent = z.infer<typeof EnhancedAnalyticsEventSchema>
export type PaymentConfirmationInput = z.infer<typeof PaymentConfirmationSchema>
export type UserSessionInput = z.infer<typeof UserSessionSchema>
export type ProUserManagementInput = z.infer<typeof ProUserManagementSchema>