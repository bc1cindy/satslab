import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SatsLab Pro',
  description: 'Acesse as aulas exclusivas do SatsLab Pro.',
  keywords: 'aulas bitcoin, curso bitcoin online, vídeo aulas bitcoin, lightning network tutorial, mineração bitcoin curso, blockchain curso, segurança bitcoin',
  openGraph: {
    title: 'SatsLab Pro',
    description: 'Acesso exclusivo às aulas do SatsLab Pro.',
    url: 'https://satslabpro.com/pro',
    siteName: 'SatsLab Pro',
    type: 'website',
  },
  robots: {
    index: false, // Área privada não deve ser indexada
    follow: false,
  },
}