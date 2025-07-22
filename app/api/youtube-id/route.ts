import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename } = await request.json()
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    // Mapeamento seguro server-side - FILENAMES CORRETOS DO B2
    const videoMap: Record<string, string> = {
      'SatsLabPro/01.ArquiteturadoSistemaBitcoin.mp4': process.env.VIDEO_01_YT || '',
      'SatsLabPro/02.BlockchaineRedesdeTeste.mp4': process.env.VIDEO_02_YT || '',
      'SatsLabPro/03.ImplementaçõesBTCeRodandoum Nó.mp4': process.env.VIDEO_03_YT || '',
      'SatsLabPro/04.ChavesEnderecosScripts.mp4': process.env.VIDEO_04_YT || '',
      'SatsLabPro/05. Gerenciamento de Carteiras e Segurança.mp4': process.env.VIDEO_05_YT || '',
      'SatsLabPro/06. MineraçãoeConsenso.mp4': process.env.VIDEO_06_YT || '',
      'SatsLabPro/07. Assinaturas Digitais.mp4': process.env.VIDEO_07_YT || '',
      'SatsLabPro/08. Transações Avançadas, Taxas e Lightning.mp4': process.env.VIDEO_08_YT || '',
      'SatsLabPro/09. Scripting e Contratos.mp4': process.env.VIDEO_09_YT || '',
      'SatsLabPro/10. ComprarouVender.mp4': process.env.VIDEO_10_YT || '',
      'SatsLabPro/11. GerenciamentodeRisco.mp4': process.env.VIDEO_11_YT || '',
      'SatsLabPro/12. Fidúcia.mp4': process.env.VIDEO_12_YT || '',
      'SatsLabPro/13. opensource+AI.mp4': process.env.VIDEO_13_YT || '',
      'SatsLabPro/14. Replicate.mp4': process.env.VIDEO_14_YT || '',
    }

    const youtubeId = videoMap[filename] || null

    console.log('YouTube ID request for:', filename, '-> ID found:', !!youtubeId)

    return NextResponse.json({ youtubeId })

  } catch (error) {
    console.error('YouTube ID API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}