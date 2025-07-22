import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { exchangeRateCache } from '@/app/lib/exchange-rate-cache'
import { 
  CreateInvoiceSchema, 
  CreateDonationInvoiceSchema, 
  CreateProPaymentInvoiceSchema, 
  validateInput 
} from '@/app/lib/validation/schemas'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 🔒 PARSING INICIAL PARA VERIFICAR TIPO
    const requestBody = await request.json()
    const isDonation = requestBody.storeId || requestBody.type === 'donation' // Doações têm storeId
    
    let session = null
    let userEmail = null
    
    if (!isDonation) {
      // 🔒 VERIFICAR AUTENTICAÇÃO APENAS PARA PAGAMENTOS PRO
      session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Não autorizado - Login necessário para pagamentos Pro' },
          { status: 401 }
        )
      }
      userEmail = session.user.email
    } else {
      // Para doações, usar email genérico ou opcional
      userEmail = requestBody.donorEmail || 'anonymous@satslab.org'
      
      securityLogger.info(
        SecurityEventType.PAYMENT_INITIATED,
        'Anonymous donation invoice creation',
        { 
          amount: requestBody.amount,
          currency: requestBody.currency || 'BRL',
          storeId: requestBody.storeId
        },
        request
      )
    }
    
    // 🔒 VALIDAÇÃO SEGURA COM ZOD - Esquema específico por tipo
    const schema = isDonation ? CreateDonationInvoiceSchema : CreateProPaymentInvoiceSchema
    const validationData = {
      amount: requestBody.amount,
      currency: requestBody.currency || 'BRL',
      userEmail: userEmail,
      metadata: requestBody.metadata,
      ...(isDonation && { 
        storeId: requestBody.storeId,
        type: requestBody.type 
      })
    }
    
    const validation = validateInput(schema, validationData)

    if (!validation.success) {
      securityLogger.warn(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        'Invalid invoice creation attempt',
        { 
          error: validation.error,
          userEmail: userEmail,
          isDonation: isDonation,
          requestData: {
            amount: requestBody.amount,
            currency: requestBody.currency
          }
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
    
    const { amount, currency, userEmail: validatedEmail } = validation.data

    // Log seguro da operação
    securityLogger.info(
      SecurityEventType.PAYMENT_INITIATED,
      isDonation ? 'BTCPay donation invoice requested' : 'BTCPay Pro payment invoice requested',
      { 
        amount, 
        currency, 
        type: isDonation ? 'donation' : 'pro_payment',
        requiresAuth: !isDonation
      },
      request
    )

    // Obter cotação USD/BRL com cache seguro
    const usdToBrlRate = await exchangeRateCache.getUsdToBrlRate()
    
    // Converter BRL para USD
    const amountUSD = amount / usdToBrlRate
    
    // Log seguro das conversões
    securityLogger.info(
      SecurityEventType.PAYMENT_INITIATED,
      'Currency conversion calculated',
      { 
        usdToBrlRate,
        amountBRL: amount,
        amountUSD: amountUSD.toFixed(2)
      }
    )

    const btcpayUrl = process.env.BTCPAY_URL || 'https://demo.btcpayserver.org'
    const apiKey = process.env.BTCPAY_API_KEY
    const storeId = process.env.BTCPAY_STORE_ID

    securityLogger.info(
      SecurityEventType.CONFIGURATION_CHANGE,
      'BTCPay configuration verified',
      { hasApiKey: !!apiKey, hasStoreId: !!storeId }
    )

    if (!apiKey || !storeId) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'BTCPay configuration incomplete'
      )
      return NextResponse.json(
        { error: 'BTCPay Server não configurado corretamente' },
        { status: 500 }
      )
    }

    const invoiceData = {
      amount: amountUSD.toFixed(2),
      currency: 'USD',
      metadata: {
        buyerEmail: validatedEmail || userEmail || (isDonation ? 'anonymous@satslab.org' : undefined),
        itemDesc: isDonation ? 'Doação para SatsLab' : 'SatsLab Pro - Curso Completo de Bitcoin',
        finalAmountBRL: amount,
        exchangeRate: usdToBrlRate,
        type: isDonation ? 'donation' : 'pro_payment',
        storeId: isDonation ? requestBody.storeId : undefined
      },
      checkout: {
        redirectURL: isDonation 
          ? `https://satslab.org/donation?status=success` 
          : `https://satslab.org/pro?payment=success`,
        paymentMethods: ['BTC', 'BTC-LightningNetwork']
      }
    }

    securityLogger.info(
      SecurityEventType.PAYMENT_INITIATED,
      'Sending invoice to BTCPay',
      { amount: amountUSD.toFixed(2), currency: 'USD' }
    )

    const response = await fetch(`${btcpayUrl}/api/v1/stores/${storeId}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${apiKey}`
      },
      body: JSON.stringify(invoiceData)
    })

    securityLogger.info(
      SecurityEventType.PAYMENT_INITIATED,
      'BTCPay response received',
      { status: response.status, statusText: response.statusText }
    )

    if (!response.ok) {
      const errorData = await response.text()
      securityLogger.error(
        SecurityEventType.PAYMENT_FAILED,
        'BTCPay API error',
        { status: response.status }
      )
      return NextResponse.json(
        { error: 'Erro ao criar invoice no BTCPay', details: errorData },
        { status: response.status }
      )
    }

    const invoice = await response.json()

    securityLogger.info(
      SecurityEventType.PAYMENT_COMPLETED,
      isDonation ? 'BTCPay donation invoice created successfully' : 'BTCPay Pro payment invoice created successfully',
      { 
        invoiceId: invoice.id, 
        amount: invoice.amount, 
        type: isDonation ? 'donation' : 'pro_payment' 
      }
    )

    const result = {
      success: true,
      id: invoice.id,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      checkoutUrl: invoice.checkoutLink || `${btcpayUrl}/i/${invoice.id}`,
      finalAmountBRL: amount,
      exchangeRate: usdToBrlRate,
      expiresAt: invoice.expirationTime
    }

    return NextResponse.json(result)
  } catch (error) {
    securityLogger.error(
      SecurityEventType.SYSTEM_ERROR,
      'Error creating BTCPay invoice',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}