import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { getServerSupabase } from '@/app/lib/supabase-server'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Check Pro access in database
    const supabase = getServerSupabase()
    const { data: user, error } = await supabase
      .from('users')
      .select('has_pro_access, pro_expires_at, pro_started_at, created_at')
      .eq('email', session.user.email)
      .single()

    if (error || !user) {
      securityLogger.warn(
        SecurityEventType.ACCESS_DENIED,
        'User data lookup failed',
        { hasError: !!error, errorType: error?.code || 'unknown' }
      )
      return NextResponse.json({
        hasProAccess: false,
        reason: 'User not found'
      })
    }

    // Secure logging of Pro access check
    securityLogger.info(
      SecurityEventType.ACCESS_GRANTED,
      'Pro access verification completed',
      { 
        hasProAccess: user.has_pro_access,
        hasExpiration: !!user.pro_expires_at
      }
    )

    // Check if Pro access is valid
    const now = new Date()
    const expiresAt = user.pro_expires_at ? new Date(user.pro_expires_at) : null
    const hasValidProAccess = user.has_pro_access && (!expiresAt || expiresAt > now)

    return NextResponse.json({
      hasProAccess: hasValidProAccess,
      pro_expires_at: user.pro_expires_at,
      // Use pro_started_at if available, fallback to created_at
      created_at: user.pro_started_at || user.created_at,
      expiresAt: expiresAt?.toISOString(),
      daysRemaining: expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
    })

  } catch (error) {
    securityLogger.error(
      SecurityEventType.SYSTEM_ERROR,
      'Pro access check failed',
      { errorType: error instanceof Error ? error.constructor.name : 'unknown' }
    )
    return NextResponse.json(
      { error: 'Erro ao verificar acesso Pro' },
      { status: 500 }
    )
  }
}