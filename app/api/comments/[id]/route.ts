import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// PUT - Editar comentário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado - Login necessário' }, { status: 401 })
  }

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
      error: 'Acesso Pro necessário para editar comentários' 
    }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { content } = body
    const commentId = params.id

    if (!content) {
      return NextResponse.json({ error: 'content é obrigatório' }, { status: 400 })
    }

    // Verificar se o comentário pertence ao usuário
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!existingComment || existingComment.user_id !== session.user.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Atualizar comentário
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      id: data.id,
      content: data.content,
      edited: true
    })
  } catch (error) {
    console.error('Erro ao editar comentário:', error)
    return NextResponse.json({ error: 'Erro ao editar comentário' }, { status: 500 })
  }
}

// DELETE - Deletar comentário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado - Login necessário' }, { status: 401 })
  }

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
      error: 'Acesso Pro necessário para deletar comentários' 
    }, { status: 403 })
  }

  try {
    const commentId = params.id

    // Verificar se o comentário pertence ao usuário
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!existingComment || existingComment.user_id !== session.user.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Deletar comentário (replies serão deletadas em cascata)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar comentário:', error)
    return NextResponse.json({ error: 'Erro ao deletar comentário' }, { status: 500 })
  }
}