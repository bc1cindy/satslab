'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Play, ExternalLink, Video, Clock } from 'lucide-react'

interface VideoLibraryProps {
  driveUrl: string
}

export function VideoLibrary({ driveUrl }: VideoLibraryProps) {
  
  const handleOpenDrive = () => {
    window.open(driveUrl, '_blank', 'noopener,noreferrer')
  }

  const videoTopics = [
    "Introdução ao Bitcoin",
    "Como funciona a Blockchain", 
    "Chaves Públicas e Privadas",
    "Carteiras Bitcoin",
    "Enviando e Recebendo Bitcoin",
    "Taxas de Transação",
    "Mineração Bitcoin",
    "Lightning Network",
    "Segurança em Bitcoin",
    "DeFi e Bitcoin"
  ]

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-2xl">
          <Video className="h-6 w-6 text-orange-500" />
          Biblioteca de Vídeos
        </CardTitle>
        <p className="text-gray-300">
          Acesse nossa coleção completa de vídeo aulas sobre Bitcoin
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Video Preview Section */}
        <div className="relative bg-gradient-to-br from-orange-900/20 to-black rounded-lg p-8 border border-orange-500/20">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <Play className="h-12 w-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {videoTopics.length}+ Vídeo Aulas Disponíveis
            </h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Aprenda Bitcoin do básico ao avançado com nossos vídeos didáticos em português
            </p>
            
            <Button 
              onClick={handleOpenDrive}
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Play className="h-5 w-5 mr-2" />
              Assistir Vídeos
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Topics Grid */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Tópicos Disponíveis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {videoTopics.map((topic, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={handleOpenDrive}
              >
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-orange-400 text-sm font-semibold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-white text-sm font-medium flex-1">{topic}</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/50">
          <h5 className="text-blue-200 font-semibold mb-2">📺 Como Assistir:</h5>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Clique no botão "Assistir Vídeos" para abrir a biblioteca</li>
            <li>• Selecione qualquer vídeo da lista para reproduzir</li>
            <li>• Os vídeos estão organizados em sequência didática</li>
            <li>• Assista no seu próprio ritmo</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  )
}