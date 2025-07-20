'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { ExternalLink, FileText, Link, Globe, BookOpen, Users, MessageCircle } from 'lucide-react'

interface ComplementaryItem {
  id: string
  title: string
  description: string
  type: 'link' | 'document' | 'video' | 'resource' | 'discord' | 'forum'
  url: string
  category: string
  isExternal: boolean
  createdAt: string
}

interface ComplementaryContentProps {
  videoId?: string
  videoTitle?: string
}

export function ComplementaryContent({ videoId }: ComplementaryContentProps) {
  const [items, setItems] = useState<ComplementaryItem[]>([])

  // Carregar conteúdo complementar da API quando houver videoId
  useEffect(() => {
    if (videoId) {
      loadComplementaryContent()
    } else {
      setDefaultContent()
    }
  }, [videoId])

  const loadComplementaryContent = async () => {
    console.log('🔍 Carregando conteúdo complementar padrão')
    setDefaultContent()
  }

  const setDefaultContent = () => {
    setItems([
    {
      id: '1',
      title: 'Discord SatsLab',
      description: 'Participe da nossa comunidade oficial no Discord para tirar dúvidas e trocar experiências',
      type: 'discord',
      url: 'https://discord.gg/68gGQEP6P4',
      category: 'Comunidade',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Explorando Mempool',
      description: 'Vídeo explicativo sobre como funciona o mempool do Bitcoin e como monitorar transações',
      type: 'video',
      url: 'https://youtu.be/0Fx_heDVOOM?si=MpSQ_1-_pK0EDOFf',
      category: 'Vídeos',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      title: 'Deus abençoe Bitcoin',
      description: 'Documentário completo sobre a importância e o impacto do Bitcoin na sociedade',
      type: 'video',
      url: 'https://youtu.be/1Jx5rvb_Cpw?si=fj725DzApa3rzppY',
      category: 'Vídeos',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      title: 'O que aconteceu em 1971?',
      description: 'Site interativo que mostra o impacto do fim do padrão ouro na economia mundial',
      type: 'link',
      url: 'https://oqueaconteceuem1971.com',
      category: 'Recursos',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      title: 'Mastering Bitcoin (Livro)',
      description: 'Livro completo sobre Bitcoin por Andreas Antonopoulos - versão gratuita',
      type: 'document',
      url: 'https://github.com/bitcoinbook/bitcoinbook',
      category: 'Leitura',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      title: 'Mastering Lightning',
      description: 'Livro completo sobre Lightning Network por Andreas Antonopoulos - versão gratuita',
      type: 'document',
      url: 'https://github.com/lnbook/lnbook',
      category: 'Leitura',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '7',
      title: 'Canal Bitcoinheiros',
      description: 'Canal no YouTube com conteúdo educativo sobre Bitcoin e criptomoedas',
      type: 'video',
      url: 'https://www.youtube.com/@Bitcoinheiros',
      category: 'Canais YouTube',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '8',
      title: 'Area Bitcoin',
      description: 'Canal no YouTube especializado em análises e educação sobre Bitcoin',
      type: 'video',
      url: 'https://www.youtube.com/@AreaBitcoin',
      category: 'Canais YouTube',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '9',
      title: 'Canal Cindy',
      description: 'Canal no YouTube com conteúdo sobre Bitcoin e tecnologia',
      type: 'video',
      url: 'https://www.youtube.com/@cindyBTC',
      category: 'Canais YouTube',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '10',
      title: 'Playlist Sistemas Digitais',
      description: 'Playlist completa do Edil Medeiros sobre sistemas digitais e fundamentos da computação',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=Z8WfTCZiFTc&list=PLfdR3_dt2rbcPf-4Te36zw98P4DFKVNKm',
      category: 'Playlists Educativas',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '11',
      title: 'Playlist Protocolo Bitcoin',
      description: 'Playlist técnica do Edil Medeiros sobre o protocolo Bitcoin e suas implementações',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=gCgdCgyHFqw&list=PLfdR3_dt2rbexb-ohbaLLzAuNAp7Ypt8u',
      category: 'Playlists Educativas',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '12',
      title: 'As 6 Lições de Mises',
      description: 'Audiobook completo sobre as lições fundamentais da economia austríaca por Ludwig von Mises',
      type: 'video',
      url: 'https://youtu.be/2OSsfaqzQIc?si=19xCgugRq6YCr2X1',
      category: 'Audiobooks',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '13',
      title: 'Saving Satoshi',
      description: 'Plataforma interativa para aprender desenvolvimento Bitcoin com exercícios práticos',
      type: 'resource',
      url: 'https://savingsatoshi.com/pt',
      category: 'Desenvolvimento',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '14',
      title: 'The Bitcoin Dev Project',
      description: 'Projeto educacional para desenvolvedores Bitcoin com recursos e tutoriais',
      type: 'resource',
      url: 'https://bitcoindevs.xyz/',
      category: 'Desenvolvimento',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '16',
      title: 'Podcasts da Vinteum',
      description: 'Podcasts educativos sobre Bitcoin e tecnologia blockchain',
      type: 'video',
      url: 'https://fountain.fm/show/lMPJwZjJkDlElgdx8sxY',
      category: 'Podcasts',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '17',
      title: 'Manifesto Cypherpunk',
      description: 'Documentário sobre o movimento Cypherpunk e sua importância para a privacidade digital',
      type: 'video',
      url: 'https://youtu.be/wJv6eymZvro?si=Nv9TmB1RZZrRJi3y',
      category: 'Vídeos',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '18',
      title: 'Claude Code',
      description: 'Ferramenta de IA da Anthropic para desenvolvimento e análise de código',
      type: 'resource',
      url: 'https://www.anthropic.com/claude-code',
      category: 'Ferramentas IA',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '19',
      title: 'Augment',
      description: 'Assistente de IA para desenvolvimento e automação de tarefas',
      type: 'resource',
      url: 'https://www.augmentcode.com/',
      category: 'Ferramentas IA',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '20',
      title: 'Grok',
      description: 'IA conversacional avançada para pesquisa e análise',
      type: 'resource',
      url: 'https://grok.com',
      category: 'Ferramentas IA',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '21',
      title: 'Perplexity',
      description: 'Motor de busca baseado em IA para pesquisas precisas e informativas',
      type: 'resource',
      url: 'https://www.perplexity.ai/',
      category: 'Ferramentas IA',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '22',
      title: 'V0 Frontend',
      description: 'Ferramenta de IA para geração rápida de interfaces frontend',
      type: 'resource',
      url: 'https://v0.dev/',
      category: 'Ferramentas IA',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '23',
      title: 'Replicate',
      description: 'Plataforma para executar modelos de IA e criar aplicações com machine learning',
      type: 'resource',
      url: 'https://replicate.com/',
      category: 'Ferramentas IA',
      isExternal: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ])
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <Link className="w-5 h-5" />
      case 'document':
        return <FileText className="w-5 h-5" />
      case 'video':
        return <BookOpen className="w-5 h-5" />
      case 'resource':
        return <Globe className="w-5 h-5" />
      case 'discord':
        return <MessageCircle className="w-5 h-5" />
      case 'forum':
        return <Users className="w-5 h-5" />
      default:
        return <Globe className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discord':
        return 'bg-purple-500/20 text-purple-400'
      case 'document':
        return 'bg-blue-500/20 text-blue-400'
      case 'resource':
        return 'bg-green-500/20 text-green-400'
      case 'forum':
        return 'bg-orange-500/20 text-orange-400'
      case 'video':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'discord':
        return 'Discord'
      case 'document':
        return 'Documento'
      case 'resource':
        return 'Ferramenta'
      case 'forum':
        return 'Fórum'
      case 'video':
        return 'Vídeo'
      case 'link':
        return 'Link'
      default:
        return 'Recurso'
    }
  }

  // Agrupar por categoria
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ComplementaryItem[]>)

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Categorias */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            {category}
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {categoryItems.map((item) => (
              <Card key={item.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors max-w-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between max-w-full">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* Ícone */}
                      <div className={`p-2 rounded-lg ${getTypeColor(item.type)} flex-shrink-0`}>
                        {getIcon(item.type)}
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0 max-w-full">
                        <div className="flex items-center space-x-2 mb-1 max-w-full">
                          <h4 className="font-medium text-white truncate flex-1">{item.title}</h4>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(item.type)}
                            </Badge>
                            {item.isExternal && (
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-3 break-words">{item.description}</p>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-black"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          {item.type === 'discord' ? 'Entrar no Discord' : 
                           item.type === 'forum' ? 'Visitar Fórum' :
                           'Acessar'}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

    </div>
  )
}