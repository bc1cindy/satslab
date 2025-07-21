import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET - Listar comentários de um vídeo
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    
    if (!videoId) {
      return NextResponse.json({ error: 'videoId é obrigatório' }, { status: 400 })
    }

    console.log('Getting comments for video:', videoId)

    // Basic validation
    if (!videoId.match(/^[a-zA-Z0-9\-_]+$/)) {
      return NextResponse.json(
        { error: 'VideoId inválido' },
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
      console.error('Database error fetching comments:', error.message)
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
    console.error('Error fetching comments:', error)
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
    
    console.log('Creating comment for user:', session.user.email)
    
    // 🔒 VERIFICAR ACESSO PRO
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('has_pro_access, pro_expires_at')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      console.log('User not found for comment:', userError?.message)
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
    
    // Basic validation against XSS
    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    if (!body.videoId || typeof body.videoId !== 'string') {
      return NextResponse.json(
        { error: 'VideoId é obrigatório' },
        { status: 400 }
      )
    }

    if (body.content.length > 1000) {
      return NextResponse.json(
        { error: 'Comentário muito longo (máximo 1000 caracteres)' },
        { status: 400 }
      )
    }

    // Basic XSS protection
    const sanitizedContent = body.content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()

    if (!sanitizedContent) {
      return NextResponse.json(
        { error: 'Conteúdo inválido' },
        { status: 400 }
      )
    }

    console.log('Creating comment with content length:', sanitizedContent.length)

    // Criar comentário
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: sanitizedContent,
        video_id: body.videoId,
        user_id: session.user.email, // Usando email como ID
        user_name: session.user.name || 'Usuário',
        user_email: session.user.email,
        parent_id: body.parentId || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      throw error
    }

    console.log('Comment created successfully:', data.id)

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
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Erro ao criar comentário' }, { status: 500 })
  }
}