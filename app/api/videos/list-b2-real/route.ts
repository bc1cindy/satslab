import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { b2Service } from '@/app/lib/b2'
import { getServerSupabase } from '@/app/lib/supabase-server'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'
import { BUSINESS_RULES } from '@/app/lib/config/business-rules'

export const dynamic = 'force-dynamic'

// Mapping dos vídeos reais no B2 para metadados (recreado para garantir funcionamento)
const videoMetadata = new Map([
  ['SatsLabPro/01.ArquiteturadoSistemaBitcoin.mp4', {
    title: '1. Arquitetura do Sistema Bitcoin',
    description: 'Entenda como o Bitcoin funciona, sua estrutura descentralizada e os princípios que garantem sua segurança e inovação.',
    category: 'Iniciante',
    duration: BUSINESS_RULES.FALLBACK_VIDEO_DURATION_SECONDS
  }],
  ['SatsLabPro/02.BlockchaineRedesdeTeste.mp4', {
    title: '2. Blockchain e Redes de Teste',
    description: 'Explore o que é a blockchain, como ela registra transações e o papel das redes de teste no desenvolvimento de aplicações Bitcoin.',
    category: 'Iniciante', 
    duration: 2100
  }],
  ['SatsLabPro/03.ImplementaçõesBTCeRodandoum Nó.mp4', {
    title: '3. Implementações BTC e Como Rodar um Nó',
    description: 'Aprenda a configurar e gerenciar um nó Bitcoin, entendendo as principais implementações do protocolo Bitcoin.',
    category: 'Intermediário',
    duration: BUSINESS_RULES.DEFAULT_VIDEO_DURATION_SECONDS
  }],
  ['SatsLabPro/04.ChavesEnderecosScripts.mp4', {
    title: '4. Chaves, Endereços e Scripts',
    description: 'Descubra como funcionam as chaves públicas e privadas, endereços Bitcoin e scripts que garantem transações seguras.',
    category: 'Intermediário',
    duration: 2700
  }],
  ['SatsLabPro/05. Gerenciamento de Carteiras e Segurança.mp4', {
    title: '5. Gerenciamento de Carteiras e Segurança em Auto custódia',
    description: 'Domine as melhores práticas para criar, gerenciar e proteger suas carteiras Bitcoin, evitando riscos comuns.',
    category: 'Intermediário',
    duration: 1950
  }],
  ['SatsLabPro/06. MineraçãoeConsenso.mp4', {
    title: '6. Mineração e Consenso',
    description: 'Conheça o processo de mineração de Bitcoin, o algoritmo de consenso Proof-of-Work, sua importância para a rede e como minerar.',
    category: 'Avançado',
    duration: 2200
  }],
  ['SatsLabPro/07. Assinaturas Digitais.mp4', {
    title: '7. Assinaturas Digitais',
    description: 'Saiba como as assinaturas digitais garantem a autenticidade e integridade das transações no Bitcoin.',
    category: 'Avançado',
    duration: BUSINESS_RULES.DEFAULT_VIDEO_DURATION_SECONDS
  }],
  ['SatsLabPro/08. Transações Avançadas, Taxas e Lightning.mp4', {
    title: '8. Transações Avançadas, Taxas e Lightning',
    description: 'Aprenda sobre transações avançadas, como calcular taxas e utilizar a Lightning Network para transações rápidas e baratas.',
    category: 'Avançado',
    duration: 2300
  }],
  ['SatsLabPro/09. Scripting e Contratos.mp4', {
    title: '9. Scripting e Contratos Inteligentes',
    description: 'Explore o potencial do scripting Bitcoin e como criar contratos inteligentes para aplicações avançadas.',
    category: 'Avançado',
    duration: 2500
  }],
  ['SatsLabPro/10. ComprarouVender.mp4', {
    title: '10. Como Comprar ou Vender Bitcoin',
    description: 'Entenda o processo de comprar e vender Bitcoin de forma segura, escolhendo as melhores plataformas e estratégias.',
    category: 'Intermediário',
    duration: 2000
  }],
  ['SatsLabPro/11. GerenciamentodeRisco.mp4', {
    title: '11. Gerenciamento de Risco',
    description: 'Aprenda a identificar e gerenciar riscos associados ao investimento e uso de Bitcoin.',
    category: 'Intermediário',
    duration: 1900
  }],
  ['SatsLabPro/12. Fidúcia.mp4', {
    title: '12. Fidúcia',
    description: 'Compreenda a diferença entre precisar ou não confiar em intermediários.',
    category: 'Intermediário',
    duration: BUSINESS_RULES.FALLBACK_VIDEO_DURATION_SECONDS
  }],
  ['SatsLabPro/13. opensource+AI.mp4', {
    title: '13. Bitcoin Open-Source e IA',
    description: 'Contribuindo com Bitcoin open-source com inteligência artificial para te apoiar no aprendizado.',
    category: 'Avançado',
    duration: 2100
  }],
  ['SatsLabPro/14. Replicate.mp4', {
    title: '14. Como crio imagens de clones com IA?',
    description: 'Aula Bônus: Como criar imagens de clones usando IA.',
    category: 'Bônus',
    duration: 1600
  }]
])

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

    
    // List all video files from B2
    const b2Files = await b2Service.listVideoFiles()
    
    // Combine B2 files with metadata
    const videos = b2Files.map((file, index) => {
      // Normalize filename to composed UTF-8 to match mapping keys
      const normalizedFileName = file.fileName.normalize('NFC')
      
      const metadata = videoMetadata.get(normalizedFileName) || {
        title: `Vídeo ${index + 1}`,
        description: `Descrição do vídeo ${file.fileName}`,
        category: 'Geral',
        duration: BUSINESS_RULES.FALLBACK_VIDEO_DURATION_SECONDS
      }
      
      return {
        id: (index + 1).toString(),
        public_id: file.fileName.replace('.mp4', ''),
        title: metadata.title,
        description: metadata.description,
        duration: metadata.duration,
        category: metadata.category,
        thumbnail: null,
        internal_filename: file.fileName,
        created_at: new Date(file.uploadTimestamp).toISOString(),
        fileSize: file.fileSize
      }
    })


    return NextResponse.json({
      success: true,
      videos,
      total: videos.length,
      source: 'backblaze_b2_real'
    })

  } catch (error) {
    securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to load videos from B2', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, request)
    
    // Fallback para lista local se B2 falhar
    
    const fallbackResponse = await fetch(new URL('/api/videos/list-b2', request.url))
    const fallbackData = await fallbackResponse.json()
    
    return NextResponse.json({
      ...fallbackData,
      source: 'local_fallback_due_to_b2_error'
    })
  }
}