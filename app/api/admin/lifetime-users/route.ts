import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Sanitize email input
function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// Check if user is admin (with enhanced security)
async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.warn('No session found for admin access')
      return false
    }
    
    // Use service role key for secure admin check
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
      .select('is_admin, email')
      .eq('email', session.user.email)
      .single()
    
    if (error) {
      console.error('Admin check error:', error.message)
      return false
    }
    
    if (!user || user.is_admin !== true) {
      console.warn(`Unauthorized admin access attempt by: ${session.user.email}`)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Admin verification failed:', error)
    return false
  }
}

// Add lifetime access user
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    if (!(await isAdmin())) {
      return NextResponse.json({ 
        error: 'Acesso negado',
        message: 'Você não tem permissão para realizar esta ação'
      }, { status: 403 })
    }

    // Parse and validate request body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ 
        error: 'Requisição inválida',
        message: 'O corpo da requisição deve ser um JSON válido'
      }, { status: 400 })
    }

    const { email } = body

    // Validate email input
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ 
        error: 'Email é obrigatório',
        message: 'Por favor, forneça um email válido'
      }, { status: 400 })
    }

    // Sanitize and validate email format
    const sanitizedEmail = sanitizeEmail(email)
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ 
        error: 'Email inválido',
        message: 'Por favor, forneça um email no formato correto'
      }, { status: 400 })
    }

    // Initialize Supabase client with service role
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
    
    // Set expiration date to 100 years from now (effectively lifetime)
    const lifetimeExpiration = new Date()
    lifetimeExpiration.setFullYear(lifetimeExpiration.getFullYear() + 100)
    const lifetimeExpirationISO = lifetimeExpiration.toISOString()
    
    console.log(`Granting lifetime Pro access to: ${sanitizedEmail}`)
    
    // Use upsert to create user if doesn't exist, or update if exists
    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: sanitizedEmail,
        has_pro_access: true,
        pro_expires_at: lifetimeExpirationISO,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()

    if (error) {
      console.error('Failed to grant lifetime access:', error)
      return NextResponse.json({ 
        error: 'Erro ao conceder acesso vitalício',
        message: 'Ocorreu um erro ao processar a solicitação. Tente novamente.'
      }, { status: 500 })
    }

    // Log the action for audit trail
    console.log('Lifetime Pro access granted successfully:', {
      email: sanitizedEmail,
      grantedBy: (await getServerSession(authOptions))?.user?.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true, 
      message: `Acesso vitalício concedido para ${sanitizedEmail}`,
      email: sanitizedEmail,
      expires_at: lifetimeExpirationISO,
      user_data: data
    })

  } catch (error) {
    console.error('Lifetime user operation failed:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro inesperado. Por favor, tente novamente.'
    }, { status: 500 })
  }
}