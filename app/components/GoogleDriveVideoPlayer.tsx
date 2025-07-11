'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Play, CheckCircle } from 'lucide-react'

interface GoogleDriveVideoPlayerProps {
  title: string
  description: string
  duration: string
  videoId: string
  onComplete?: () => void
  isCompleted?: boolean
}

export function GoogleDriveVideoPlayer({ 
  title, 
  description, 
  duration, 
  videoId,
  onComplete, 
  isCompleted = false 
}: GoogleDriveVideoPlayerProps) {
  
  // Convert Google Drive file ID to embeddable URL
  const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`

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
            {isCompleted && (
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
        
        {/* Google Drive Video Embed */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              allow="autoplay"
              className="rounded-lg"
              title={title}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}