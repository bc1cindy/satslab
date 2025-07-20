import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from '@/app/lib/auth'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)
    
    securityLogger.info(SecurityEventType.ACCESS_GRANTED, 'Pro access verification initiated')
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        hasProAccess: false, 
        message: 'Não autenticado' 
      }, { status: 401 })
    }

    // Check Pro access in database
    securityLogger.info(SecurityEventType.SENSITIVE_DATA_ACCESS, 'Checking Pro access in database')
    
    const { data: user, error } = await supabase
      .from('users')
      .select('has_pro_access, pro_expires_at, payment_status, created_at')
      .eq('email', session.user.email)
      .single()

    if (error) securityLogger.warn(SecurityEventType.SYSTEM_ERROR, 'User lookup failed', { errorMessage: error.message })
    if (user) securityLogger.info(SecurityEventType.ACCESS_GRANTED, 'User found in database')

    if (error || !user) {
      securityLogger.warn(SecurityEventType.ACCESS_DENIED, 'User not found in database')
      return NextResponse.json({ 
        hasProAccess: false, 
        message: 'Usuário não encontrado'
      })
    }

    // Check if Pro access is valid
    const now = new Date()
    const expiresAt = user.pro_expires_at ? new Date(user.pro_expires_at) : null
    
    // Access verification logging
    securityLogger.info(SecurityEventType.ACCESS_GRANTED, 'Verifying user Pro access status')
    
    // Lógica: usuário tem acesso se has_pro_access = true E não está expirado (se tiver data de expiração)
    const hasProAccess = user.has_pro_access
    const isNotExpired = !expiresAt || expiresAt > now
    const hasValidProAccess = hasProAccess && isNotExpired
    
    securityLogger.logAccessControl(hasValidProAccess, 'pro_content', session.user.email, request)

    return NextResponse.json({
      hasProAccess: hasValidProAccess,
      pro_expires_at: user.pro_expires_at,
      created_at: user.created_at,
      paymentStatus: user.payment_status
    })

  } catch (error) {
    securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Pro access verification failed', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json({ 
      hasProAccess: false, 
      error: 'Erro ao verificar acesso' 
    }, { status: 500 })
  }
}