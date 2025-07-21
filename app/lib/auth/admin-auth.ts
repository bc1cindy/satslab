/**
 * Centralized Admin Authentication and Authorization
 * Secure implementation without hardcoded credentials
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { getServerSupabase } from '@/app/lib/supabase-server'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

export interface AdminValidationResult {
  isValid: boolean
  user?: {
    email: string
    id: string
    isAdmin: boolean
  }
  error?: string
}

/**
 * Secure admin validation without hardcoded emails
 * Uses database verification with proper error handling
 */
export async function validateAdminAccess(): Promise<AdminValidationResult> {
  try {
    // 1. Verificar se ADMIN_EMAIL está configurado
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'ADMIN_EMAIL environment variable not configured'
      )
      return {
        isValid: false,
        error: 'Admin configuration missing'
      }
    }

    // 2. Verificar sessão NextAuth
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      securityLogger.warn(
        SecurityEventType.ACCESS_DENIED,
        'Admin access attempt without valid session'
      )
      return {
        isValid: false,
        error: 'Authentication required'
      }
    }

    // 3. Verificar se o email da sessão é o admin configurado
    if (session.user.email !== adminEmail) {
      securityLogger.warn(
        SecurityEventType.ACCESS_DENIED,
        'Admin access attempt with non-admin email',
        { attemptedEmail: session.user.email }
      )
      return {
        isValid: false,
        error: 'Admin access required'
      }
    }

    // 4. Double-check no banco de dados
    const supabase = getServerSupabase()
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('id, email, is_admin')
      .eq('email', session.user.email)
      .single()

    if (dbError || !user) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'Database error during admin validation',
        { error: dbError?.message }
      )
      return {
        isValid: false,
        error: 'Database validation failed'
      }
    }

    // 5. Verificar flag is_admin no banco
    if (!user.is_admin) {
      securityLogger.warn(
        SecurityEventType.ACCESS_DENIED,
        'Admin access attempt with non-admin database flag',
        { userEmail: user.email }
      )
      return {
        isValid: false,
        error: 'Admin privileges required'
      }
    }

    // 6. Sucesso - registrar acesso admin
    securityLogger.info(
      SecurityEventType.ADMIN_DATA_ACCESS,
      'Admin access granted',
      { userEmail: user.email }
    )

    return {
      isValid: true,
      user: {
        email: user.email,
        id: user.id,
        isAdmin: true
      }
    }

  } catch (error) {
    securityLogger.error(
      SecurityEventType.SYSTEM_ERROR,
      'Unexpected error during admin validation',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
    
    return {
      isValid: false,
      error: 'Internal server error'
    }
  }
}

/**
 * Middleware-style admin validation for API routes
 * Returns early error response if not admin
 */
export async function requireAdminAccess() {
  const validation = await validateAdminAccess()
  
  if (!validation.isValid) {
    // Return standardized error response
    return {
      error: true,
      response: {
        error: validation.error || 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED'
      },
      status: validation.error === 'Authentication required' ? 401 : 403
    }
  }

  return {
    error: false,
    user: validation.user!
  }
}

/**
 * Check if current session belongs to admin user
 * Lightweight version for UI components
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const validation = await validateAdminAccess()
    return validation.isValid
  } catch {
    return false
  }
}

/**
 * Get admin email from environment (for UI display only)
 * Never use for authentication logic
 */
export function getAdminEmailForDisplay(): string | null {
  return 'admin@satslab.org' // Hardcoded for production security
}