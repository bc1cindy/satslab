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
        'Unauthorized admin function creation attempt',
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
      'Admin function creation initiated',
      { adminEmail: adminValidation.user?.email },
      request
    )

    const supabase = getServerSupabase()
    
    // ✅ SEGURO: Use the comprehensive setup function instead of exec_sql
    const { data: setupResults, error: setupError } = await supabase
      .rpc('setup_analytics_safely')

    if (setupError) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'Function creation failed',
        { error: setupError.message }
      )
      throw setupError
    }

    securityLogger.info(
      SecurityEventType.CONFIGURATION_CHANGE,
      'Analytics functions created successfully',
      { results: setupResults?.length || 0 }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Funções criadas com sucesso',
      results: setupResults,
      note: 'Todas as funções necessárias foram criadas de forma segura'
    })

  } catch (error) {
    securityLogger.error(
      SecurityEventType.SYSTEM_ERROR,
      'Error creating functions',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
    
    return NextResponse.json(
      { error: 'Erro ao criar funções' },
      { status: 500 }
    )
  }
}

// GET endpoint to check function status
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
    
    // Check if our safe functions exist
    const { data: functions, error } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .in('routine_name', [
        'setup_analytics_safely',
        'clean_analytics_safely',
        'reset_analytics_safely',
        'get_platform_stats',
        'get_user_analytics'
      ])

    return NextResponse.json({
      functionsConfigured: functions && functions.length > 0,
      functionsFound: functions?.map(f => f.routine_name) || [],
      totalFunctions: functions?.length || 0
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar status das funções' },
      { status: 500 }
    )
  }
}