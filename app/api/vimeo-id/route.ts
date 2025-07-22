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

    // Mapeamento seguro server-side - IDs do Vimeo
    const videoMap: Record<string, string> = {
      'SatsLabPro/01.ArquiteturadoSistemaBitcoin.mp4': '1103334870',
      'SatsLabPro/02.BlockchaineRedesdeTeste.mp4': '1103335420',
      'SatsLabPro/03.ImplementaçõesBTCeRodandoum Nó.mp4': '1103335579',
      'SatsLabPro/04.ChavesEnderecosScripts.mp4': '1103335857',
      'SatsLabPro/05. Gerenciamento de Carteiras e Segurança.mp4': '1103336012',
      'SatsLabPro/06. MineraçãoeConsenso.mp4': '1103336854',
      'SatsLabPro/07. Assinaturas Digitais.mp4': '1103338517',
      'SatsLabPro/08. Transações Avançadas, Taxas e Lightning.mp4': '1103337081',
      'SatsLabPro/09. Scripting e Contratos.mp4': '1103337308',
      'SatsLabPro/10. ComprarouVender.mp4': '1103337583',
      'SatsLabPro/11. GerenciamentodeRisco.mp4': '1103337725',
      'SatsLabPro/12. Fidúcia.mp4': '1103337884',
      'SatsLabPro/13. opensource+AI.mp4': '1103338140',
      'SatsLabPro/14. Replicate.mp4': '1103338593',
    }

    const vimeoId = videoMap[filename] || null

    console.log('Vimeo ID request for:', filename, '-> ID found:', !!vimeoId)

    return NextResponse.json({ vimeoId })

  } catch (error) {
    console.error('Vimeo ID API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}