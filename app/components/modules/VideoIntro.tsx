'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle } from 'lucide-react'

interface VideoIntroProps {
  title: string
  description: string
  duration: string
  onComplete: () => void
  isCompleted?: boolean
}

export function VideoIntro({ title, description, duration, onComplete, isCompleted = false }: VideoIntroProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hasWatched, setHasWatched] = useState(isCompleted)

  // For demo purposes, we'll simulate a video player
  // In production, you'd integrate with a real video player or embed
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    
    if (!isPlaying && !hasWatched) {
      // Simulate video progress
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 2
          if (newProgress >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            setHasWatched(true)
            onComplete()
            return 100
          }
          return newProgress
        })
      }, 100) // Update every 100ms for smooth progress
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Play className="h-5 w-5 text-orange-500" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-gray-700 text-gray-300">
              {duration}
            </Badge>
            {hasWatched && (
              <Badge className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Assistido
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300">{description}</p>
        
        {/* Video Player Mockup */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          {/* Video Thumbnail/Placeholder */}
          <div className="aspect-video bg-gradient-to-br from-orange-900 to-black flex items-center justify-center relative">
            {/* Play overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={handlePlayPause}
                  className="rounded-full w-16 h-16 bg-orange-500 hover:bg-orange-600"
                >
                  <Play className="h-8 w-8" />
                </Button>
              </div>
            )}
            
            {/* Video content placeholder */}
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">O que é Bitcoin?</h3>
              <p className="text-gray-300">
                Uma introdução amigável aos conceitos fundamentais
              </p>
            </div>

            {/* Progress bar */}
            {(isPlaying || hasWatched) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <div className="flex-1 bg-gray-600 rounded-full h-1">
                    <div 
                      className="bg-orange-500 h-1 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <span className="text-white text-sm min-w-[3rem]">
                    {Math.floor(progress)}%
                  </span>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMuteToggle}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Topics */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2">📚 Tópicos Abordados</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• O que é uma moeda digital</li>
              <li>• Como funciona a blockchain</li>
              <li>• Diferença entre Bitcoin e bancos</li>
              <li>• Por que o Bitcoin é importante</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2">🎯 Preparação</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Conceitos para as perguntas</li>
              <li>• Terminologia básica</li>
              <li>• Contexto histórico</li>
              <li>• Dicas para as tarefas práticas</li>
            </ul>
          </div>
        </div>

        {hasWatched && (
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/50">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Vídeo Concluído!</span>
            </div>
            <p className="text-green-200 text-sm mt-1">
              Agora você está pronto para começar as perguntas e tarefas práticas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}