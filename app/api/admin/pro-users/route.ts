import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Check if user is admin (simplified)
async function isAdmin() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return false
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: user, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', session.user.email)
      .single()
    
    if (error || !user) {
      console.error('Admin status check failed:', error?.message)
      return false
    }
    
    return user.is_admin === true
  } catch (error) {
    console.error('Admin access check exception:', error)
    return false
  }
}

// Add user to Pro manually
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    if (!(await isAdmin())) {
      console.log('Admin access denied for pro user management')
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    console.log('Admin access granted for pro user management')

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Grant Pro access with 1 year expiration
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    
    console.log(`Granting Pro access to: ${email}`)
    
    // Use upsert to create user if doesn't exist, or update if exists
    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: email,
        has_pro_access: true,
        pro_expires_at: oneYearFromNow,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()

    if (error) {
      console.error('Failed to grant Pro access:', error.message, error)
      return NextResponse.json({ error: 'Erro ao liberar acesso Pro' }, { status: 500 })
    }

    console.log('Pro access granted successfully:', data)

    return NextResponse.json({ 
      success: true, 
      message: `Acesso Pro liberado para ${email}`,
      email,
      expires_at: oneYearFromNow,
      user_data: data
    })

  } catch (error) {
    console.error('Pro user management operation failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// List Pro users
export async function GET() {
  try {
    // Check admin access
    if (!(await isAdmin())) {
      console.log('Admin access denied for pro users list')
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    console.log('Admin access granted for pro users list')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log('Fetching Pro users from database...')
    
    const { data: proUsers, error } = await supabase
      .from('users')
      .select('email, has_pro_access, pro_expires_at, created_at, updated_at')
      .eq('has_pro_access', true)
      .order('pro_expires_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch Pro users:', error.message, error)
      return NextResponse.json({ error: 'Erro ao buscar usuários Pro' }, { status: 500 })
    }

    console.log(`Found ${proUsers?.length || 0} Pro users:`, proUsers)

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
    console.error('Pro users list operation failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Remove Pro access
export async function DELETE(request: NextRequest) {
  try {
    // Check admin access
    if (!(await isAdmin())) {
      console.log('Admin access denied for pro user removal')
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    console.log('Admin access granted for pro user removal')

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Remove Pro access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { error } = await supabase
      .from('users')
      .update({ 
        has_pro_access: false, 
        pro_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    if (error) {
      console.error('Failed to remove Pro access:', error.message)
      return NextResponse.json({ error: 'Erro ao remover acesso Pro' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Acesso Pro removido de ${email}`,
      email
    })

  } catch (error) {
    console.error('Pro user removal operation failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}