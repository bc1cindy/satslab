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

    // Mapeamento seguro server-side - TÍTULOS CORRETOS
    const videoMap: Record<string, string> = {
      'SatsLabPro/01.ArquiteturadoSistemaBitcoin.mp4': process.env.VIDEO_01_YT || '',
      'SatsLabPro/02.BlockchainRedesTeste.mp4': process.env.VIDEO_02_YT || '',
      'SatsLabPro/03.ImplementacoesRodarNo.mp4': process.env.VIDEO_03_YT || '',
      'SatsLabPro/04.ChavesEnderecosScripts.mp4': process.env.VIDEO_04_YT || '',
      'SatsLabPro/05.CarteirasSegurancaAutocustodia.mp4': process.env.VIDEO_05_YT || '',
      'SatsLabPro/06.MineracaoConsenso.mp4': process.env.VIDEO_06_YT || '',
      'SatsLabPro/07.AssinaturasDigitais.mp4': process.env.VIDEO_07_YT || '',
      'SatsLabPro/08.TransacoesAvancadasTaxasLightning.mp4': process.env.VIDEO_08_YT || '',
      'SatsLabPro/09.ScriptingContratosInteligentes.mp4': process.env.VIDEO_09_YT || '',
      'SatsLabPro/10.ComprarVenderBitcoin.mp4': process.env.VIDEO_10_YT || '',
      'SatsLabPro/11.GerenciamentoRisco.mp4': process.env.VIDEO_11_YT || '',
      'SatsLabPro/12.Fiducia.mp4': process.env.VIDEO_12_YT || '',
      'SatsLabPro/13.BitcoinOpenSourceIA.mp4': process.env.VIDEO_13_YT || '',
      'SatsLabPro/14.CriarImagensClonesIA.mp4': process.env.VIDEO_14_YT || '',
    }

    const youtubeId = videoMap[filename] || null

    console.log('YouTube ID request for:', filename, '-> ID found:', !!youtubeId)

    return NextResponse.json({ youtubeId })

  } catch (error) {
    console.error('YouTube ID API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}