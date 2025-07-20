import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { getServerSupabase } from '@/app/lib/supabase-server'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'
import { BUSINESS_RULES } from '@/app/lib/config/business-rules'

// Check if user is admin
async function isAdmin(request?: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return false
    }
    
    const supabase = getServerSupabase()
    const { data: user, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', session.user.email)
      .single()
    
    if (error || !user) {
      securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Admin status check failed', { 
        hasError: !!error,
        hasUser: !!user 
      }, request)
      return false
    }
    
    return user.is_admin === true
  } catch (error) {
    securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Admin access check exception', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, request)
    return false
  }
}

// Add user to Pro manually
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      securityLogger.logAccessControl(false, 'pro_user_management', undefined, request)
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    securityLogger.logAccessControl(true, 'pro_user_management', undefined, request)

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Grant Pro access with 1 year expiration
    const supabase = getServerSupabase()
    const { error } = await supabase.rpc('grant_pro_access', {
      user_email: email,
      payment_method_used: 'manual_admin',
      amount_paid: 0,
      invoice_id: `manual_${Date.now()}`
    })

    if (error) {
      securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to grant Pro access', { 
        hasEmail: !!email 
      }, request)
      return NextResponse.json({ error: 'Erro ao liberar acesso Pro' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Acesso Pro liberado para ${email}`,
      email,
      expires_at: new Date(Date.now() + BUSINESS_RULES.PRO_ACCESS_DURATION_MS).toISOString()
    })

  } catch (error) {
    securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Pro user management operation failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, request)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// List Pro users
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      securityLogger.logAccessControl(false, 'pro_users_list', undefined, request)
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    securityLogger.logAccessControl(true, 'pro_users_list', undefined, request)
    const supabase = getServerSupabase()
    const { data: proUsers, error } = await supabase
      .from('users')
      .select('email, is_pro, pro_expires_at, created_at, updated_at')
      .eq('is_pro', true)
      .order('pro_expires_at', { ascending: false })

    if (error) {
      securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to fetch Pro users', {}, request)
      return NextResponse.json({ error: 'Erro ao buscar usuários Pro' }, { status: 500 })
    }

    // Calculate days remaining for each user
    const usersWithDaysRemaining = proUsers.map(user => {
      const expiresAt = new Date(user.pro_expires_at)
      const now = new Date()
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        ...user,
        days_remaining: daysRemaining,
        is_expired: daysRemaining <= 0,
        expires_soon: daysRemaining <= 30 && daysRemaining > 0
      }
    })

    return NextResponse.json({ 
      success: true, 
      users: usersWithDaysRemaining,
      total: usersWithDaysRemaining.length,
      active: usersWithDaysRemaining.filter(u => !u.is_expired).length,
      expired: usersWithDaysRemaining.filter(u => u.is_expired).length,
      expiring_soon: usersWithDaysRemaining.filter(u => u.expires_soon).length
    })

  } catch (error) {
    securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Pro users list operation failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, request)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Remove Pro access
export async function DELETE(request: NextRequest) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      securityLogger.logAccessControl(false, 'pro_user_removal', undefined, request)
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    securityLogger.logAccessControl(true, 'pro_user_removal', undefined, request)

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Remove Pro access
    const supabase = getServerSupabase()
    const { error } = await supabase
      .from('users')
      .update({ 
        is_pro: false, 
        pro_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    if (error) {
      securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to remove Pro access', { 
        hasEmail: !!email 
      }, request)
      return NextResponse.json({ error: 'Erro ao remover acesso Pro' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Acesso Pro removido de ${email}`,
      email
    })

  } catch (error) {
    securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Pro user removal operation failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, request)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}