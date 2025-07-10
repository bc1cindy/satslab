'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Play, List } from 'lucide-react'

interface Video {
  id: string
  title: string
  description: string
  youtubeId: string
}

export function RealVideoPlayer() {
  const videos: Video[] = [
    {
      id: "1",
      title: "00 - Introdução ao Bitcoin4all",
      description: "Introdução ao curso sobre Bitcoin",
      youtubeId: "pTgQ6Z_ozf0"
    },
    {
      id: "2", 
      title: "01 - O que é Bitcoin e por que foi criado",
      description: "Entenda os fundamentos e a origem do Bitcoin",
      youtubeId: "6Ly0L8_9Pu8"
    },
    {
      id: "3",
      title: "02 - O problema do dinheiro fiat",
      description: "Compreenda os problemas do sistema monetário atual",
      youtubeId: "55vAZdwc3Bs"
    },
    {
      id: "4",
      title: "03 - Por que Bitcoin é um dinheiro melhor",
      description: "Aprenda por que Bitcoin é superior ao dinheiro tradicional",
      youtubeId: "mAaE4PPSMls"
    },
    {
      id: "5",
      title: "04 - Como Bitcoin funciona parte I",
      description: "Entenda o funcionamento técnico do Bitcoin - Parte 1",
      youtubeId: "j23TW7gnX2Y"
    },
    {
      id: "6",
      title: "05 - Como Bitcoin funciona parte II",
      description: "Entenda o funcionamento técnico do Bitcoin - Parte 2",
      youtubeId: "oHKTpPsJBDY"
    },
    {
      id: "7",
      title: "06 - Por que Bitcoin deve continuar valorizando",
      description: "Análise sobre a valorização do Bitcoin",
      youtubeId: "RIMKaC3xiQU"
    },
    {
      id: "8",
      title: "07 - Como ter Bitcoin",
      description: "Aprenda como adquirir seus primeiros bitcoins",
      youtubeId: "VC1oAtXppcY"
    },
    {
      id: "9",
      title: "08 - Rebatendo mentiras (FUDs) sobre Bitcoin",
      description: "Desmistificando os mitos e medos sobre Bitcoin",
      youtubeId: "TSGHnKX1bTs"
    },
    {
      id: "10",
      title: "09 - Qual a melhor forma de guardar Bitcoin e o que são carteiras",
      description: "Aprenda sobre carteiras e como guardar seus bitcoins com segurança",
      youtubeId: "cUTJOPAI0Wg"
    },
    {
      id: "11",
      title: "10 - Como sacar da exchange e ter soberania com seu Bitcoin",
      description: "Tutorial sobre como retirar bitcoins de exchanges",
      youtubeId: "_4HYY-17250"
    }
  ]

  const [selectedVideo, setSelectedVideo] = useState(videos[0])

  const getYouTubeEmbedUrl = (youtubeId: string) => {
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&showinfo=0&controls=1&fs=1&disablekb=1&cc_load_policy=0&iv_load_policy=3&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Video Player */}
      <div className="lg:col-span-3">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Play className="h-5 w-5 text-orange-500" />
              {selectedVideo.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
            
            {/* YouTube Video Embed */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.youtubeId)}
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                  title={selectedVideo.title}
                  loading="lazy"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Video List */}
      <div className="lg:col-span-1">
        <Card className="bg-gray-900 border-gray-800 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <List className="h-5 w-5 text-orange-500" />
              Lista de Vídeos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedVideo.id === video.id
                    ? 'bg-orange-500/20 border border-orange-500/50'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium text-sm ${
                    selectedVideo.id === video.id ? 'text-orange-400' : 'text-white'
                  }`}>
                    {video.title}
                  </h4>
                </div>
                <span className="text-xs text-gray-400 line-clamp-2">
                  {video.description}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}