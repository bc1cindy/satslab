'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { AlertCircle, Loader2, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'
// import { VideoComments } from './VideoComments'

interface VideoPlayerProps {
  videoId: string | null
  title: string
  description: string
  onError?: (error: string) => void
}

export function VideoPlayer({ videoId, title, description, onError }: VideoPlayerProps) {
  // Função para limpar títulos problemáticos
  function cleanTitle(title: string): string {
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  useEffect(() => {
    if (videoId) {
      loadVideoUrl(videoId)
      // Reset video states
      setCurrentTime(0)
      setDuration(0)
      setProgress(0)
      setIsPlaying(false)
    }
  }, [videoId])

  async function loadVideoUrl(filename: string) {
    setLoading(true)
    setError(null)
    setVideoUrl(null)
    setDebugInfo([])
    
    try {
      // Detect if mobile
      const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const debugMessages: string[] = []
      
      if (isMobile) {
        debugMessages.push(`📱 Mobile detected: ${navigator.userAgent.substring(0, 50)}...`)
        debugMessages.push(`Platform: ${navigator.platform}`)
        debugMessages.push(`Screen: ${window.screen.width}x${window.screen.height}`)
      }

      // Carregar vídeo do endpoint local
      debugMessages.push('🔄 Fetching video URL from API...')
      const response = await fetch(`/api/videos/secure/?file=${encodeURIComponent(filename)}`)
      const data = await response.json()
      
      debugMessages.push(`📡 API Response: ${response.status} ${response.statusText}`)
      
      if (response.ok && data.url) {
        debugMessages.push(`✅ URL received: ${data.url.substring(0, 100)}...`)
        
        // For mobile, test the URL directly
        if (isMobile) {
          debugMessages.push('🧪 Testing video URL accessibility...')
          try {
            const testResponse = await fetch(data.url, {
              method: 'HEAD',
              mode: 'no-cors'
            })
            debugMessages.push(`📊 URL test: ${testResponse.type} (no-cors mode)`)
          } catch (testError) {
            debugMessages.push(`❌ URL test failed: ${testError}`)
          }
        }
        
        // For iOS, add a small delay before setting URL
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          debugMessages.push('⏱️ iOS detected, adding delay for video loading...')
          setTimeout(() => {
            setVideoUrl(data.url)
          }, 100)
        } else {
          setVideoUrl(data.url)
        }
        setDebugInfo(debugMessages)
      } else {
        const errorMsg = data.error || 'Erro ao carregar vídeo'
        debugMessages.push(`❌ API Error: ${errorMsg}`)
        debugMessages.push(`Details: ${JSON.stringify(data)}`)
        setDebugInfo(debugMessages)
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (error) {
      const errorMsg = 'Erro ao gerar URL do vídeo'
      setDebugInfo(prev => [...prev, `💥 Exception: ${error}`])
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const togglePlayPause = async () => {
    if (videoElement) {
      try {
        if (isPlaying) {
          videoElement.pause()
          setIsPlaying(false)
        } else {
          await videoElement.play()
          setIsPlaying(true)
        }
      } catch (error) {
        console.error('Error playing video:', error)
        // Try to handle autoplay restrictions on mobile
        if (error instanceof Error && error.name === 'NotAllowedError') {
          setError('Clique no botão play para iniciar o vídeo')
        }
      }
    }
  }

  const toggleMute = () => {
    if (videoElement) {
      videoElement.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoElement.requestFullscreen()
      }
    }
  }

  const restartVideo = () => {
    if (videoElement) {
      videoElement.currentTime = 0
      videoElement.play()
      setIsPlaying(true)
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimeUpdate = () => {
    if (videoElement && videoElement.duration) {
      setCurrentTime(videoElement.currentTime)
      if (!isNaN(videoElement.duration)) {
        setDuration(videoElement.duration)
        setProgress((videoElement.currentTime / videoElement.duration) * 100)
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (videoElement && !isNaN(videoElement.duration)) {
      setDuration(videoElement.duration)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (videoElement && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      const newTime = percentage * duration
      videoElement.currentTime = newTime
      setCurrentTime(newTime)
      setProgress(percentage * 100)
    }
  }

  if (!videoId) {
    return (
      <Card className="aspect-video bg-gray-900 border-gray-800">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Selecione um vídeo para assistir</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Player */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-0">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative touch-manipulation transform-gpu will-change-transform">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="text-white ml-2">Carregando vídeo...</span>
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white max-w-lg mx-auto p-4">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                  <p className="mb-4">{error}</p>
                  {debugInfo.length > 0 && /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                    <div className="mb-4 text-left text-xs bg-gray-800 p-3 rounded">
                      <p className="font-bold mb-2">Debug Info (Mobile):</p>
                      {debugInfo.map((info, idx) => (
                        <p key={idx} className="mb-1">{info}</p>
                      ))}
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => videoId && loadVideoUrl(videoId)}
                    className="bg-transparent border-white text-white hover:bg-white hover:text-black"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            )}
            
            {videoUrl && !loading && !error && (
              <>
                <video
                  ref={setVideoElement}
                  src={videoUrl}
                  className="w-full h-full cursor-pointer"
                  controlsList="nodownload noremoteplayback"
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={togglePlayPause}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onDurationChange={handleLoadedMetadata}
                  onLoadedData={handleLoadedMetadata}
                  onError={(e) => {
                    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                    const target = e.currentTarget as HTMLVideoElement
                    const errorDetails = {
                      code: target.error?.code,
                      message: target.error?.message,
                      networkState: target.networkState,
                      readyState: target.readyState,
                      src: target.src?.substring(0, 100) + '...',
                      currentSrc: target.currentSrc?.substring(0, 100) + '...'
                    }
                    
                    console.error('Video error:', errorDetails)
                    
                    if (isMobile) {
                      setDebugInfo(prev => [
                        ...prev,
                        '🚨 Video Element Error:',
                        `Error Code: ${errorDetails.code}`,
                        `Network State: ${errorDetails.networkState}`,
                        `Ready State: ${errorDetails.readyState}`,
                        `Video URL: ${errorDetails.src}`
                      ])
                    }
                    
                    // More specific error messages based on error code
                    let errorMsg = 'Erro ao carregar vídeo.'
                    if (target.error?.code === 4) {
                      errorMsg = 'Formato de vídeo não suportado ou problema de CORS.'
                    } else if (target.error?.code === 3) {
                      errorMsg = 'Erro ao decodificar vídeo.'
                    } else if (target.error?.code === 2) {
                      errorMsg = 'Erro de rede ao carregar vídeo.'
                    }
                    
                    setError(errorMsg)
                  }}
                  playsInline
                  webkit-playsinline="true"
                  preload="metadata"
                  x-webkit-airplay="allow"
                  autoPlay={false}
                  muted={false}
                  {...(/iPhone|iPad|iPod/i.test(navigator.userAgent) && {
                    crossOrigin: "use-credentials",
                    'x-webkit-airplay': 'allow',
                    'webkit-playsinline': '',
                  } as any)}
                  style={{ objectFit: 'contain' }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
                
                {/* Custom Controls Overlay */}
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 space-y-2">
                  {/* Progress Bar */}
                  <div 
                    className="relative h-3 bg-gray-700 rounded-full cursor-pointer group py-1"
                    onClick={handleProgressClick}
                  >
                    <div className="absolute inset-0 flex items-center">
                      <div className="relative h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-orange-500 transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div 
                        className="absolute h-4 w-4 bg-white rounded-full shadow-lg transition-all duration-100"
                        style={{ left: `calc(${progress}% - 8px)` }}
                      />
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between bg-black/70 backdrop-blur-sm rounded-lg p-1 md:p-2">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/20 h-8 w-8 md:h-9 md:w-9"
                      >
                        {isPlaying ? <Pause className="w-3 h-3 md:w-4 md:h-4" /> : <Play className="w-3 h-3 md:w-4 md:h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={restartVideo}
                        className="text-white hover:bg-white/20 h-8 w-8 md:h-9 md:w-9 hidden sm:flex"
                      >
                        <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      
                      {/* Time Display */}
                      <span className="text-white text-xs md:text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20 h-8 w-8 md:h-9 md:w-9"
                      >
                        {isMuted ? <VolumeX className="w-3 h-3 md:w-4 md:h-4" /> : <Volume2 className="w-3 h-3 md:w-4 md:h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleFullscreen}
                        className="text-white hover:bg-white/20 h-8 w-8 md:h-9 md:w-9"
                      >
                        <Maximize className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Info */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2 text-white">{cleanTitle(title)}</h2>
          <p className="text-gray-300">{description}</p>
        </CardContent>
      </Card>

      {/* Comentários */}
      {/* {videoId && <VideoComments videoId={videoId} />} */}
    </div>
  )
}