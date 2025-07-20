import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Toggle like em um comentário
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { commentId } = body

    if (!commentId) {
      return NextResponse.json({ error: 'commentId é obrigatório' }, { status: 400 })
    }

    const userId = session.user.email

    // Verificar se já existe like
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    let liked = false

    if (existingLike) {
      // Remover like
      await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId)

      // Decrementar contador
      await supabase.rpc('decrement', { 
        table_name: 'comments',
        column_name: 'likes',
        row_id: commentId 
      })
    } else {
      // Adicionar like
      await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId
        })

      // Incrementar contador
      await supabase.rpc('increment', { 
        table_name: 'comments',
        column_name: 'likes',
        row_id: commentId 
      })
      
      liked = true
    }

    return NextResponse.json({ liked })
  } catch (error) {
    console.error('Erro ao toggle like:', error)
    return NextResponse.json({ error: 'Erro ao processar like' }, { status: 500 })
  }
}