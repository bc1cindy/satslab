import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Endpoint para receber webhooks da API externa
export async function POST(request: NextRequest) {
  try {
    // 🔒 VERIFICAR ASSINATURA DO WEBHOOK
    const signature = request.headers.get('x-webhook-signature')
    const webhookSecret = process.env.WEBHOOK_SECRET
    
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    const body = await request.text()
    
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')
      
      const providedSignature = signature.replace('sha256=', '')
      
      if (!crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      )) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      )
    }

    const { 
      invoiceId, 
      userEmail, 
      amount, 
      paymentMethod, 
      status 
    } = JSON.parse(body)

    // Log webhook verification securely
    securityLogger.info(SecurityEventType.WEBHOOK_RECEIVED, 'External webhook verified', { 
      hasInvoiceId: !!invoiceId, 
      status, 
      paymentMethod 
    }, request)

    // Se pagamento foi confirmado, liberar acesso Pro
    if (status === 'completed' || status === 'settled') {
      const { error } = await supabase.rpc('grant_pro_access', {
        user_email: userEmail,
        payment_method_used: paymentMethod,
        amount_paid: amount,
        invoice_id: invoiceId
      })

      if (error) {
        securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to grant Pro access via webhook', { 
          hasInvoiceId: !!invoiceId 
        }, request)
        return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 })
      }

      securityLogger.logPayment(SecurityEventType.PAYMENT_COMPLETED, amount, userEmail, invoiceId)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'External webhook processing failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, request)
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}