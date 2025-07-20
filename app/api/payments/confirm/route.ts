import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { getServerSupabase } from '@/app/lib/supabase-server'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

export async function POST(request: NextRequest) {
  try {
    // 🔒 VERIFICAR AUTENTICAÇÃO DE ADMIN
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado - Login necessário' },
        { status: 401 }
      )
    }

    // 🔒 VERIFICAR SE É ADMIN
    const supabase = getServerSupabase()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', session.user.email)
      .single()
    
    if (userError || !user?.is_admin) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      )
    }

    const { email, paymentMethod, amount, invoiceId } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Grant Pro access using the SQL function
    const { error } = await supabase.rpc('grant_pro_access', {
      user_email: email,
      payment_method_used: paymentMethod,
      amount_paid: amount,
      invoice_id: invoiceId || null
    })

    if (error) {
      securityLogger.error(SecurityEventType.PAYMENT_FAILED, 'Failed to grant Pro access after payment', { errorCode: error.code, userEmail: email })
      return NextResponse.json(
        { error: 'Erro ao conceder acesso Pro' },
        { status: 500 }
      )
    }

    securityLogger.logPayment(SecurityEventType.PAYMENT_COMPLETED, amount, email, invoiceId)
    
    return NextResponse.json({
      success: true,
      message: 'Acesso Pro concedido com sucesso'
    })

  } catch (error) {
    securityLogger.error(SecurityEventType.PAYMENT_FAILED, 'Payment confirmation processing failed', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}

// Webhook para BTCPay (quando implementar)
export async function PUT(request: NextRequest) {
  try {
    // Verificar assinatura do webhook
    // Processar status do pagamento
    // Chamar POST acima se pagamento confirmado
    
    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}