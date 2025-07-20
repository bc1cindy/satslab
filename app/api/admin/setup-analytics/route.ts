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
        'Unauthorized admin setup analytics attempt',
        { error: adminValidation.error },
        request
      )
      return NextResponse.json(
        { error: adminValidation.error },
        { status: 403 }
      )
    }

    securityLogger.info(
      SecurityEventType.ADMIN_DATA_ACCESS,
      'Admin analytics setup initiated',
      { adminEmail: adminValidation.user?.email },
      request
    )

    const supabase = getServerSupabase()
    
    // ✅ SEGURO: Usar função específica em vez de exec_sql
    const { data: setupResults, error: setupError } = await supabase
      .rpc('setup_analytics_safely')

    if (setupError) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'Analytics setup failed',
        { error: setupError.message }
      )
      throw setupError
    }

    securityLogger.info(
      SecurityEventType.CONFIGURATION_CHANGE,
      'Analytics setup completed successfully',
      { results: setupResults?.length || 0 }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Analytics configurado com sucesso',
      results: setupResults 
    })

  } catch (error) {
    securityLogger.error(
      SecurityEventType.SYSTEM_ERROR,
      'Error setting up analytics',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
    
    return NextResponse.json(
      { error: 'Erro ao configurar analytics' },
      { status: 500 }
    )
  }
}

// GET endpoint for checking analytics status
export async function GET(request: NextRequest) {
  try {
    const adminValidation = await validateAdminAccess()
    if (!adminValidation.isValid) {
      return NextResponse.json(
        { error: adminValidation.error },
        { status: 403 }
      )
    }

    const supabase = getServerSupabase()
    
    // Check if analytics tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'analytics_events')

    return NextResponse.json({
      analyticsConfigured: tables && tables.length > 0,
      tablesFound: tables?.length || 0
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar status do analytics' },
      { status: 500 }
    )
  }
}