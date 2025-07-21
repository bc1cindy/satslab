import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { getServerSupabase } from '@/app/lib/supabase-server'

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

    console.log('Checking Pro access for:', session.user.email)

    // Check Pro access in database
    const supabase = getServerSupabase()
    const { data: user, error } = await supabase
      .from('users')
      .select('has_pro_access, pro_expires_at, pro_started_at, created_at')
      .eq('email', session.user.email)
      .single()

    console.log('Database query result:', { user, error: error?.message })

    if (error || !user) {
      console.log('User not found or error:', error?.message)
      return NextResponse.json({
        hasProAccess: false,
        reason: 'User not found'
      })
    }

    // Check if Pro access is valid
    const now = new Date()
    const expiresAt = user.pro_expires_at ? new Date(user.pro_expires_at) : null
    const hasValidProAccess = user.has_pro_access && (!expiresAt || expiresAt > now)

    console.log('Pro access check:', {
      has_pro_access: user.has_pro_access,
      expires_at: user.pro_expires_at,
      hasValidProAccess
    })

    return NextResponse.json({
      hasProAccess: hasValidProAccess,
      pro_expires_at: user.pro_expires_at,
      // Use pro_started_at if available, fallback to created_at
      created_at: user.pro_started_at || user.created_at,
      expiresAt: expiresAt?.toISOString(),
      daysRemaining: expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
    })

  } catch (error) {
    console.error('Error in check-pro-access:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar acesso Pro' },
      { status: 500 }
    )
  }
}