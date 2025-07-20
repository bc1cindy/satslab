import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { b2Service } from '@/app/lib/b2'
import { getServerSupabase } from '@/app/lib/supabase-server'
import { SecureVideoAccessSchema, validateInput } from '@/app/lib/validation/schemas'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'
import { BUSINESS_RULES } from '@/app/lib/config/business-rules'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Try different UTF-8 normalizations to match B2 storage
async function tryGenerateSecureUrl(filename: string): Promise<string> {
  // Try original filename first
  try {
    return await b2Service.generateSecureVideoUrl(filename, BUSINESS_RULES.VIDEO_URL_EXPIRATION_HOURS)
  } catch (error) {
    // Try NFD (decomposed) for files like video 8
    try {
      return await b2Service.generateSecureVideoUrl(filename.normalize('NFD'), BUSINESS_RULES.VIDEO_URL_EXPIRATION_HOURS)
    } catch (error2) {
      // Try NFC (composed) for files like video 3
      return await b2Service.generateSecureVideoUrl(filename.normalize('NFC'), BUSINESS_RULES.VIDEO_URL_EXPIRATION_HOURS)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // 🔒 VERIFICAR AUTENTICAÇÃO
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Não autorizado - Login necessário' 
      }, { status: 401 })
    }

    // 🔒 VERIFICAR ACESSO PRO
    const supabase = getServerSupabase()
    const { data: user, error } = await supabase
      .from('users')
      .select('has_pro_access, pro_expires_at')
      .eq('email', session.user.email)
      .single()

    if (error || !user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 403 })
    }

    const now = new Date()
    const expiresAt = user.pro_expires_at ? new Date(user.pro_expires_at) : null
    const hasValidProAccess = user.has_pro_access && (!expiresAt || expiresAt > now)

    if (!hasValidProAccess) {
      return NextResponse.json({ 
        error: 'Acesso Pro necessário ou expirado' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('file')
    
    if (!filename) {
      return NextResponse.json({ 
        error: 'Filename é obrigatório' 
      }, { status: 400 })
    }

    // 🔒 VALIDAÇÃO SEGURA CONTRA PATH TRAVERSAL
    const validation = validateInput(SecureVideoAccessSchema, { file: filename })
    
    if (!validation.success) {
      securityLogger.warn(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        'Potential path traversal attempt in video access',
        { 
          error: validation.error,
          userEmail: session.user.email,
          requestedFile: filename
        },
        request
      )
      
      return NextResponse.json(
        { error: `Acesso negado: ${validation.error}` },
        { status: 400 }
      )
    }
    
    securityLogger.info(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      'Pro user accessing secure video',
      { 
        userEmail: session.user.email,
        filePrefix: filename.substring(0, 20)
      }
    )
    
    try {
      // Generate secure URL from B2 with 24h expiration, trying different normalizations
      const secureUrl = await tryGenerateSecureUrl(filename)
      
      return NextResponse.json({
        url: secureUrl,
        filename,
        expires: new Date(Date.now() + BUSINESS_RULES.VIDEO_URL_EXPIRATION_MS_ALT).toISOString(),
        source: 'backblaze_b2'
      })

    } catch (error) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'Error generating secure B2 video URL',
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          userEmail: session.user.email,
          filename
        }
      )
      
      // 🔒 SEGURANÇA: Nunca usar fallback público - falha segura
      return NextResponse.json({ 
        error: 'Serviço temporariamente indisponível',
        message: 'Não foi possível gerar acesso seguro ao vídeo. Tente novamente em alguns minutos.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      }, { status: 503 })
    }
  } catch (authError) {
    securityLogger.error(
      SecurityEventType.SYSTEM_ERROR,
      'Authentication error in video access',
      { error: authError instanceof Error ? authError.message : 'Unknown error' }
    )
    return NextResponse.json({ 
      error: 'Erro de autenticação' 
    }, { status: 500 })
  }
}