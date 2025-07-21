import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/app/lib/supabase-server'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'
import { WebhookPayloadSchema, validateInput } from '@/app/lib/validation/schemas'
import { requireAdminAccess } from '@/app/lib/auth/admin-auth'
import { BUSINESS_RULES } from '@/app/lib/config/business-rules'
import crypto from 'crypto'

// Verify webhook signature from BTCPay
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('BTCPay-Sig') || ''
    const webhookSecret = process.env.BTCPAY_WEBHOOK_SECRET
    
    // SECURITY: Webhook secret is required
    if (!webhookSecret) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'BTCPAY_WEBHOOK_SECRET not configured'
      )
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }
    
    // SECURITY: Always verify webhook signature
    if (!signature) {
      securityLogger.warn(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        'Webhook received without signature',
        {},
        request
      )
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    
    const isValid = verifyWebhookSignature(body, signature, webhookSecret)
    if (!isValid) {
      securityLogger.warn(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        'Invalid webhook signature',
        {},
        request
      )
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const parsedData = JSON.parse(body)
    
    // 🔒 VALIDAÇÃO SEGURA COM ZOD
    const validation = validateInput(WebhookPayloadSchema, parsedData)
    
    if (!validation.success) {
      securityLogger.warn(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        'Invalid webhook payload received',
        { 
          error: validation.error,
          payloadType: parsedData.type || 'unknown'
        },
        request
      )
      
      return NextResponse.json(
        { error: `Dados inválidos: ${validation.error}` },
        { status: 400 }
      )
    }

    if (!validation.data) {
      return NextResponse.json(
        { error: 'Erro na validação dos dados' },
        { status: 400 }
      )
    }

    const data = validation.data
    securityLogger.info(SecurityEventType.WEBHOOK_RECEIVED, 'BTCPay webhook received', {
      webhook_type: 'btcpay',
      event_type: data.type,
      invoice_id: data.invoiceId
    })

    // Handle different event types
    const { type, invoiceId, metadata } = data

    if (type === 'InvoiceSettled' || type === 'InvoicePaymentSettled') {
      // Payment confirmed! Grant Pro access
      const userEmail = metadata?.buyerEmail
      const amount = BUSINESS_RULES.PRO_PRICE_BRL // Fixed amount for Pro access
      
      if (!userEmail) {
        securityLogger.warn(
          SecurityEventType.SUSPICIOUS_ACTIVITY,
          'No email found in webhook metadata',
          { invoiceId, eventType: type }
        )
        return NextResponse.json({ error: 'No email found' }, { status: 400 })
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userEmail)) {
        securityLogger.warn(SecurityEventType.SUSPICIOUS_ACTIVITY, 'Invalid email format in webhook', {
          webhook_type: 'btcpay',
          validation_error: 'invalid_email_format'
        })
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
      
      const supabase = getServerSupabase()
      
      // Check if invoice was already processed (idempotency)
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('invoice_id', invoiceId)
        .single()
        
      if (existingPayment) {
        securityLogger.info(
          SecurityEventType.PAYMENT_COMPLETED,
          'Invoice already processed (idempotency)',
          { invoiceId }
        )
        return NextResponse.json({ 
          success: true, 
          message: 'Invoice already processed' 
        })
      }

      // Grant Pro access using the SQL function
      const { error } = await supabase.rpc('grant_pro_access', {
        user_email: userEmail,
        payment_method_used: 'bitcoin',
        amount_paid: amount,
        invoice_id: invoiceId
      })

      if (error) {
        securityLogger.error(
          SecurityEventType.SYSTEM_ERROR,
          'Error granting Pro access',
          { invoiceId, userEmail, error: error.message }
        )
        return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 })
      }

      securityLogger.info(
        SecurityEventType.PAYMENT_COMPLETED,
        'Pro access granted successfully',
        { invoiceId, userEmail, amount }
      )
      
      // Optional: Send confirmation email
      // await sendConfirmationEmail(userEmail)
    } else if (type === 'InvoiceExpired') {
      securityLogger.info(
        SecurityEventType.PAYMENT_FAILED,
        'Invoice expired',
        { invoiceId }
      )
      // Optional: Update payment status to 'expired'
    } else if (type === 'InvoiceInvalid') {
      securityLogger.info(
        SecurityEventType.PAYMENT_FAILED,
        'Invoice invalid',
        { invoiceId }
      )
      // Optional: Update payment status to 'failed'
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed' 
    })

  } catch (error) {
    securityLogger.error(
      SecurityEventType.SYSTEM_ERROR,
      'Webhook processing error',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Webhook configuration endpoint (for debugging)
export async function GET() {
  // 🔒 VERIFICAR AUTENTICAÇÃO DE ADMIN
  const adminAuth = await requireAdminAccess()
  if (adminAuth.error) {
    return NextResponse.json(
      adminAuth.response,
      { status: adminAuth.status }
    )
  }

  return NextResponse.json({
    webhookUrl: `https://satslab.org/api/webhooks/btcpay`, // Hardcoded for production
    events: [
      'InvoiceCreated',
      'InvoicePaymentSettled', 
      'InvoiceSettled',
      'InvoiceExpired',
      'InvoiceInvalid'
    ],
    note: 'Configure this URL in BTCPay Server webhook settings'
  })
}