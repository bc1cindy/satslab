import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'

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

    console.log('Verificando acesso Pro para vídeos:', session.user.email)

    // 🔒 VERIFICAR ACESSO PRO
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

    const { data: user, error } = await supabase
      .from('users')
      .select('has_pro_access, pro_expires_at')
      .eq('email', session.user.email)
      .single()

    if (error || !user) {
      console.log('Usuário não encontrado para vídeos:', error?.message)
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 403 })
    }

    const now = new Date()
    const expiresAt = user.pro_expires_at ? new Date(user.pro_expires_at) : null
    const hasValidProAccess = user.has_pro_access && (!expiresAt || expiresAt > now)

    console.log('Verificação Pro para vídeos:', {
      has_pro_access: user.has_pro_access,
      hasValidProAccess
    })

    if (!hasValidProAccess) {
      return NextResponse.json({ 
        error: 'Acesso Pro necessário ou expirado' 
      }, { status: 403 })
    }
    // Vídeos reais do B2 com seus nomes corretos
    const realVideos = [
      {
        id: '1',
        public_id: 'arquitetura-sistema-bitcoin',
        title: '1. Arquitetura do Sistema Bitcoin',
        description: 'Entenda como o Bitcoin funciona, sua estrutura descentralizada e os princípios que garantem sua segurança e inovação.',
        duration: 1800,
        category: 'Iniciante',
        thumbnail: null,
        internal_filename: 'SatsLabPro/01.ArquiteturadoSistemaBitcoin.mp4',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        public_id: 'blockchain-redes-teste',
        title: '2. Blockchain e Redes de Teste',
        description: 'Explore o que é a blockchain, como ela registra transações e o papel das redes de teste no desenvolvimento de aplicações Bitcoin.',
        duration: 2100,
        category: 'Iniciante',
        thumbnail: null,
        internal_filename: 'SatsLabPro/02.BlockchaineRedesdeTeste.mp4',
        created_at: '2024-01-02T00:00:00Z'
      },
      {
        id: '3',
        public_id: 'implementacoes-btc-no',
        title: '3. Implementações BTC e Como Rodar um Nó',
        description: 'Aprenda a configurar e gerenciar um nó Bitcoin, entendendo as principais implementações do protocolo Bitcoin.',
        duration: 2400,
        category: 'Intermediário',
        thumbnail: null,
        internal_filename: 'SatsLabPro/03.ImplementaçõesBTCeRodandoum Nó.mp4',
        created_at: '2024-01-03T00:00:00Z'
      },
      {
        id: '4',
        public_id: 'chaves-enderecos-scripts',
        title: '4. Chaves, Endereços e Scripts',
        description: 'Descubra como funcionam as chaves públicas e privadas, endereços Bitcoin e scripts que garantem transações seguras.',
        duration: 2700,
        category: 'Intermediário',
        thumbnail: null,
        internal_filename: 'SatsLabPro/04.ChavesEnderecosScripts.mp4',
        created_at: '2024-01-04T00:00:00Z'
      },
      {
        id: '5',
        public_id: 'gerenciamento-carteiras',
        title: '5. Gerenciamento de Carteiras e Segurança em Auto custódia',
        description: 'Domine as melhores práticas para criar, gerenciar e proteger suas carteiras Bitcoin, evitando riscos comuns.',
        duration: 1950,
        category: 'Intermediário',
        thumbnail: null,
        internal_filename: 'SatsLabPro/05. Gerenciamento de Carteiras e Segurança.mp4',
        created_at: '2024-01-05T00:00:00Z'
      },
      {
        id: '6',
        public_id: 'mineracao-consenso',
        title: '6. Mineração e Consenso',
        description: 'Conheça o processo de mineração de Bitcoin, o algoritmo de consenso Proof-of-Work, sua importância para a rede e como minerar.',
        duration: 2200,
        category: 'Avançado',
        thumbnail: null,
        internal_filename: 'SatsLabPro/06. MineraçãoeConsenso.mp4',
        created_at: '2024-01-06T00:00:00Z'
      },
      {
        id: '7',
        public_id: 'assinaturas-digitais',
        title: '7. Assinaturas Digitais',
        description: 'Saiba como as assinaturas digitais garantem a autenticidade e integridade das transações no Bitcoin.',
        duration: 2400,
        category: 'Avançado',
        thumbnail: null,
        internal_filename: 'SatsLabPro/07. Assinaturas Digitais.mp4',
        created_at: '2024-01-07T00:00:00Z'
      },
      {
        id: '8',
        public_id: 'transacoes-avancadas',
        title: '8. Transações Avançadas, Taxas e Lightning',
        description: 'Aprenda sobre transações avançadas, como calcular taxas e utilizar a Lightning Network para transações rápidas e baratas.',
        duration: 2300,
        category: 'Avançado',
        thumbnail: null,
        internal_filename: 'SatsLabPro/08. Transações Avançadas, Taxas e Lightning.mp4',
        created_at: '2024-01-08T00:00:00Z'
      },
      {
        id: '9',
        public_id: 'scripting-contratos',
        title: '9. Scripting e Contratos Inteligentes',
        description: 'Explore o potencial do scripting Bitcoin e como criar contratos inteligentes para aplicações avançadas.',
        duration: 2500,
        category: 'Avançado',
        thumbnail: null,
        internal_filename: 'SatsLabPro/09. Scripting e Contratos.mp4',
        created_at: '2024-01-09T00:00:00Z'
      },
      {
        id: '10',
        public_id: 'comprar-vender',
        title: '10. Como Comprar ou Vender Bitcoin',
        description: 'Entenda o processo de comprar e vender Bitcoin de forma segura, escolhendo as melhores plataformas e estratégias.',
        duration: 2000,
        category: 'Intermediário',
        thumbnail: null,
        internal_filename: 'SatsLabPro/10. ComprarouVender.mp4',
        created_at: '2024-01-10T00:00:00Z'
      },
      {
        id: '11',
        public_id: 'gerenciamento-risco',
        title: '11. Gerenciamento de Risco',
        description: 'Aprenda a identificar e gerenciar riscos associados ao investimento e uso de Bitcoin.',
        duration: 1900,
        category: 'Intermediário',
        thumbnail: null,
        internal_filename: 'SatsLabPro/11. GerenciamentodeRisco.mp4',
        created_at: '2024-01-11T00:00:00Z'
      },
      {
        id: '12',
        public_id: 'fiducia',
        title: '12. Fidúcia',
        description: 'Compreenda a diferença entre precisar ou não confiar em intermediários.',
        duration: 1800,
        category: 'Intermediário',
        thumbnail: null,
        internal_filename: 'SatsLabPro/12. Fidúcia.mp4',
        created_at: '2024-01-12T00:00:00Z'
      },
      {
        id: '13',
        public_id: 'opensource-ai',
        title: '13. Bitcoin Open-Source e IA',
        description: 'Contribuindo com Bitcoin open-source com inteligência artificial para te apoiar no aprendizado.',
        duration: 2100,
        category: 'Avançado',
        thumbnail: null,
        internal_filename: 'SatsLabPro/13. opensource+AI.mp4',
        created_at: '2024-01-13T00:00:00Z'
      },
      {
        id: '14',
        public_id: 'replicate-ia',
        title: '14. Como crio imagens de clones com IA?',
        description: 'Aula Bônus: Como criar imagens de clones usando IA.',
        duration: 1600,
        category: 'Bônus',
        thumbnail: null,
        internal_filename: 'SatsLabPro/14. Replicate.mp4',
        created_at: '2024-01-14T00:00:00Z'
      }
    ]

    console.log(`📚 Retornando ${realVideos.length} vídeos reais do B2`)

    return NextResponse.json({
      success: true,
      videos: realVideos,
      total: realVideos.length,
      source: 'real_b2_videos'
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