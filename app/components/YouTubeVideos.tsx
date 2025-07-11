'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { getVideosWithoutAPI } from '@/app/lib/youtube'

interface Video {
  id: string
  title: string
  thumbnail: string
  isLive?: boolean
}

export default function YouTubeVideos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true)
        const latestVideos = await getVideosWithoutAPI()
        setVideos(latestVideos.slice(0, 4)) // Show only 4 videos
      } catch (error) {
        console.error('Error loading videos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadVideos()
  }, [])

  return (
    <div className="w-full">
      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-800 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {videos.map((video) => (
          <div
            key={video.id}
            className="relative group cursor-pointer"
            onClick={() => setSelectedVideo(video.id)}
          >
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-900">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
                onError={(e) => {
                  // Fallback for broken images
                  (e.target as HTMLImageElement).src = '/images/placeholder-video.jpg'
                }}
              />
              {video.isLive && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  AO VIVO
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-red-600 rounded-full p-4">
                  <Play className="h-8 w-8 text-white fill-white" />
                </div>
              </div>
            </div>
            <h3 className="mt-3 text-base font-semibold text-white line-clamp-2 group-hover:text-orange-400 transition-colors">
              {video.title}
            </h3>
          </div>
        ))}
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setSelectedVideo(null)}
            >
              Fechar ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}