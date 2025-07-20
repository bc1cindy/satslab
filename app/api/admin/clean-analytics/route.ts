import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/app/lib/supabase-server'
import { validateAdminAccess } from '@/app/lib/auth/admin-auth'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 🔒 VERIFICAÇÃO ADMIN ROBUSTA
    const adminValidation = await validateAdminAccess()
    if (!adminValidation.isValid) {
      securityLogger.warn(
        SecurityEventType.ACCESS_DENIED,
        'Unauthorized admin clean analytics attempt',
        { error: adminValidation.error },
        request
      )
      return NextResponse.json(
        { error: adminValidation.error },
        { status: 403 }
      )
    }

    const body = await request.json()
    const daysToKeep = body.daysToKeep || 90 // Default 90 days

    // Validate input
    if (typeof daysToKeep !== 'number' || daysToKeep < 1 || daysToKeep > 365) {
      return NextResponse.json(
        { error: 'daysToKeep deve ser um número entre 1 e 365' },
        { status: 400 }
      )
    }

    securityLogger.info(
      SecurityEventType.ADMIN_DATA_ACCESS,
      'Admin analytics cleanup initiated',
      { adminEmail: adminValidation.user?.email, daysToKeep },
      request
    )

    const supabase = getServerSupabase()
    
    // ✅ SEGURO: Usar função específica em vez de exec_sql
    const { data: cleanupResults, error: cleanupError } = await supabase
      .rpc('clean_analytics_safely', { days_to_keep: daysToKeep })

    if (cleanupError) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'Analytics cleanup failed',
        { error: cleanupError.message }
      )
      throw cleanupError
    }

    securityLogger.info(
      SecurityEventType.CONFIGURATION_CHANGE,
      'Analytics cleanup completed successfully',
      { results: cleanupResults?.length || 0 }
    )

    return NextResponse.json({ 
      success: true, 
      message: `Analytics limpo com sucesso (mantendo ${daysToKeep} dias)`,
      results: cleanupResults 
    })

  } catch (error) {
    securityLogger.error(
      SecurityEventType.SYSTEM_ERROR,
      'Error cleaning analytics',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
    
    return NextResponse.json(
      { error: 'Erro ao limpar analytics' },
      { status: 500 }
    )
  }
}