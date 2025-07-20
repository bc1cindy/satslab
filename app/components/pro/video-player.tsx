'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, Maximize, SkipBack, SkipForward } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  onProgress?: (seconds: number) => void
  onComplete?: () => void
  initialTime?: number
}

export function VideoPlayer({
  videoUrl,
  title,
  onProgress,
  onComplete,
  initialTime = 0
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (initialTime > 0) {
        video.currentTime = initialTime
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      
      // Report progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0) {
        onProgress?.(Math.floor(video.currentTime))
      }
      
      // Check if video is complete (95% watched)
      if (video.currentTime / video.duration > 0.95 && !video.paused) {
        onComplete?.()
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [initialTime, onProgress, onComplete])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    
    const time = parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    
    const vol = parseFloat(e.target.value)
    video.volume = vol
    setVolume(vol)
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration))
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    clearTimeout(controlsTimeout.current)
    
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onClick={togglePlay}
      />
      
      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Title */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
        
        {/* Center Play Button */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition"
          >
            <Play className="w-12 h-12 text-white" fill="white" />
          </button>
        )}
        
        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
            <span className="text-white text-sm">{formatTime(duration)}</span>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlay}
                className="p-2 hover:bg-white/20 rounded transition"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" fill="white" />
                )}
              </button>
              
              <button
                onClick={() => skip(-10)}
                className="p-2 hover:bg-white/20 rounded transition"
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={() => skip(10)}
                className="p-2 hover:bg-white/20 rounded transition"
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-white" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded transition"
            >
              <Maximize className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}