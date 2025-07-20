'use client'

import { Card, CardContent } from '@/app/components/ui/card'
import { Play, BookOpen, CheckCircle } from 'lucide-react'

interface VideoMapping {
  id: string
  public_id: string
  title: string
  description: string
  duration: number
  category: string
  thumbnail: string | null
  internal_filename: string
  created_at: string
}

interface VideoListProps {
  videos: VideoMapping[]
  selectedVideoId: string | null
  onVideoSelect: (video: VideoMapping) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function VideoList({ 
  videos, 
  selectedVideoId, 
  onVideoSelect, 
  selectedCategory, 
  onCategoryChange 
}: VideoListProps) {
  // Função para limpar títulos problemáticos
  function getCleanTitle(title: string): string {
    // Correções específicas
    if (title.includes('MineraçÃO') || title.includes('Mineração') || title.includes('06.')) {
      return 'Mineracao e Consenso'
    }
    if (title.includes('TransaçÕEs') || title.includes('Transações') || title.includes('08.')) {
      return 'Transacoes Avancadas, Taxas e Lightning'
    }
    if (title.includes('FidúCia') || title.includes('Fidúcia') || title.includes('12.')) {
      return 'Fiducia'
    }
    if (title.includes('Gerenciamento de Carteiras')) {
      return 'Carteiras e Segurança em Auto custódia'
    }
    return title
  }

  // Função para garantir descrições corretas
  function getDescription(video: VideoMapping): string {
    // Se for Fidúcia e não tiver descrição adequada
    if (video.title.includes('Fidú') && video.description.toLowerCase().includes('vídeo sobre')) {
      return 'Compreenda a diferenca entre precisar ou nao confiar em intermediarios.'
    }
    return video.description
  }
  const categories = ['all', 'general'] // Apenas 'Todos os vídeos' e 'Conteúdo complementar'
  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === selectedCategory)

  function getCategoryLabel(category: string) {
    const labels: { [key: string]: string } = {
      all: 'Todos os vídeos',
      general: 'Conteúdo complementar',
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
      lightning: 'Lightning',
      mining: 'Mineração',
      security: 'Segurança'
    }
    return labels[category] || category
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Lista de Vídeos */}
      {selectedCategory === 'all' ? (
        <>
          {/* Video List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredVideos.map((video, index) => (
              <Card 
                key={video.id} 
                className={`cursor-pointer transition-all hover:shadow-md bg-gray-800 border-gray-700 ${
                  selectedVideoId === video.internal_filename 
                    ? 'ring-2 ring-orange-500 bg-orange-500/10' 
                    : 'hover:bg-gray-700'
                }`}
                onClick={() => onVideoSelect(video)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Video Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      {selectedVideoId === video.internal_filename ? (
                        <Play className="w-3 h-3 text-orange-500" />
                      ) : (
                        <span className="text-xs font-medium text-white">{index + 1}</span>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight mb-1 truncate text-white">
                        {getCleanTitle(video.title)}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                        {getDescription(video)}
                      </p>
                      {selectedVideoId === video.internal_filename && (
                        <CheckCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <Card className="text-center py-8 bg-gray-900 border-gray-800">
              <CardContent>
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2 text-white">Nenhum vídeo encontrado</h3>
                <p className="text-gray-400">
                  {selectedCategory === 'all' 
                    ? 'Não há vídeos disponíveis no momento.'
                    : `Não há vídeos na categoria "${getCategoryLabel(selectedCategory)}".`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  )
}