import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { getServerSupabase } from '@/app/lib/supabase-server'
import { BUSINESS_RULES } from '@/app/lib/config/business-rules'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 🔒 VERIFICAR AUTENTICAÇÃO
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado - Login necessário para acessar informações do curso' },
        { status: 401 }
      )
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
    // 7 módulos reais do curso SatsLab baseados nos dados existentes
    const fallbackVideos = [
      {
        id: '1',
        public_id: 'modulo-1',
        title: '1. Introdução ao Bitcoin e Signet',
        description: 'Aprenda os conceitos fundamentais do Bitcoin e explore a rede Signet',
        duration: BUSINESS_RULES.FALLBACK_VIDEO_DURATION_SECONDS,
        category: 'Iniciante',
        thumbnail: null,
        internal_filename: 'modulo-1.mp4',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        public_id: 'modulo-2',
        title: '2. Segurança e Carteiras',
        description: 'Aprenda sobre chaves privadas, segurança de carteiras e criação de endereços Bitcoin',
        duration: 2100,
        category: 'Iniciante',
        thumbnail: null,
        internal_filename: 'modulo-2.mp4',
        created_at: '2024-01-02T00:00:00Z'
      },
      {
        id: '3',
        public_id: 'modulo-3',
        title: '3. Transações na Signet',
        description: 'Aprenda a criar e enviar transações Bitcoin, entender taxas e usar OP_RETURN',
        duration: BUSINESS_RULES.DEFAULT_VIDEO_DURATION_SECONDS,
        category: 'Intermediário',
        thumbnail: null,
        internal_filename: 'modulo-3.mp4',
        created_at: '2024-01-03T00:00:00Z'
      },
      {
        id: '4',
        public_id: 'modulo-4',
        title: '4. Mineração no Bitcoin',
        description: 'Aprenda como funciona a mineração Bitcoin e simule o processo de proof-of-work',
        duration: 2700,
        category: 'Intermediário',
        thumbnail: null,
        internal_filename: 'modulo-4.mp4',
        created_at: '2024-01-04T00:00:00Z'
      },
      {
        id: '5',
        public_id: 'modulo-5',
        title: '5. Lightning Network',
        description: 'Aprenda sobre a Lightning Network e faça transações instantâneas de Bitcoin',
        duration: 1950,
        category: 'Intermediário',
        thumbnail: null,
        internal_filename: 'modulo-5.mp4',
        created_at: '2024-01-05T00:00:00Z'
      },
      {
        id: '6',
        public_id: 'modulo-6',
        title: '6. Taproot e Inscrições',
        description: 'Explore as funcionalidades avançadas do Bitcoin: Taproot para privacidade e Inscrições para NFTs',
        duration: 2200,
        category: 'Avançado',
        thumbnail: null,
        internal_filename: 'modulo-6.mp4',
        created_at: '2024-01-06T00:00:00Z'
      },
      {
        id: '7',
        public_id: 'modulo-7',
        title: '7. Carteiras Multisig',
        description: 'Domine carteiras multisig para segurança avançada e transações colaborativas',
        duration: BUSINESS_RULES.DEFAULT_VIDEO_DURATION_SECONDS,
        category: 'Avançado',
        thumbnail: null,
        internal_filename: 'modulo-7.mp4',
        created_at: '2024-01-07T00:00:00Z'
      }
    ]

    return NextResponse.json({
      success: true,
      videos: fallbackVideos,
      total: fallbackVideos.length,
      source: 'fallback_local'
    })

  } catch (error) {
    console.error('Error in fallback video list:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao carregar lista de vídeos',
      videos: []
    }, { status: 500 })
  }
}