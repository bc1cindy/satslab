import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { getServerSupabase } from '@/app/lib/supabase-server'
import { CreateCommentSchema, VideoIdSchema, validateInput } from '@/app/lib/validation/schemas'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

export const dynamic = 'force-dynamic'


// GET - Listar comentários de um vídeo
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    
    if (!videoId) {
      return NextResponse.json({ error: 'videoId é obrigatório' }, { status: 400 })
    }

    // 🔒 VALIDAÇÃO SEGURA COM ZOD
    const validation = validateInput(VideoIdSchema, videoId)
    
    if (!validation.success) {
      securityLogger.warn(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        'Invalid videoId in comment request',
        { 
          error: validation.error,
          providedVideoId: videoId
        },
        request
      )
      
      return NextResponse.json(
        { error: `VideoId inválido: ${validation.error}` },
        { status: 400 }
      )
    }

    // Buscar comentários principais (sem parent_id)
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('video_id', videoId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      securityLogger.error(
        SecurityEventType.SYSTEM_ERROR,
        'Database error fetching comments',
        { error: error.message, videoId }
      )
      throw error
    }

    // Para cada comentário, buscar suas respostas
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select('*')
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true })

        return {
          ...comment,
          replies: replies || []
        }
      })
    )

    return NextResponse.json({ comments: commentsWithReplies })
  } catch (error) {
    securityLogger.error(
      SecurityEventType.SYSTEM_ERROR,
      'Error fetching comments',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
    return NextResponse.json({ error: 'Erro ao buscar comentários' }, { status: 500 })
  }
}

// POST - Criar novo comentário
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const supabase = getServerSupabase()
    
    // 🔒 VERIFICAR ACESSO PRO
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('has_pro_access, pro_expires_at')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 403 })
    }

    const now = new Date()
    const expiresAt = user.pro_expires_at ? new Date(user.pro_expires_at) : null
    const hasValidProAccess = user.has_pro_access && (!expiresAt || expiresAt > now)

    if (!hasValidProAccess) {
      return NextResponse.json({ 
        error: 'Acesso Pro necessário para comentar' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // 🔒 VALIDAÇÃO SEGURA COM ZOD PARA PREVENIR XSS
    const validation = validateInput(CreateCommentSchema, {
      content: body.content,
      videoId: body.videoId,
      parentId: body.parentId,
      userEmail: session.user.email
    })

    if (!validation.success) {
      securityLogger.warn(
        SecurityEventType.XSS_ATTEMPT,
        'Invalid comment data - potential XSS attempt',
        { 
          error: validation.error,
          userEmail: session.user.email,
          providedData: {
            contentLength: body.content?.length || 0,
            videoId: body.videoId,
            hasParentId: !!body.parentId
          }
        },
        request
      )
      
      return NextResponse.json(
        { error: `Dados inválidos: ${validation.error}` },
        { status: 400 }
      )
    }

    if (!validation.data) {
      return NextResponse.json(
        { error: 'Erro na validação dos dados' },
        { status: 400 }
      )
    }

    const { content, videoId, parentId } = validation.data

    // Criar comentário
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content,
        video_id: videoId,
        user_id: session.user.email, // Usando email como ID
        user_name: session.user.name || 'Usuário',
        user_email: session.user.email,
        parent_id: parentId || null
      })
      .select()
      .single()

    if (error) throw error

    // Retornar comentário formatado
    const formattedComment = {
      id: data.id,
      content: data.content,
      author: data.user_name,
      timestamp: data.created_at,
      likes: 0,
      replies: []
    }

    return NextResponse.json(formattedComment)
  } catch (error) {
    securityLogger.error(
      SecurityEventType.SYSTEM_ERROR,
      'Error creating comment',
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userEmail: session.user?.email
      }
    )
    return NextResponse.json({ error: 'Erro ao criar comentário' }, { status: 500 })
  }
}