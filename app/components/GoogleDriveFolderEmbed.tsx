'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Play, ExternalLink } from 'lucide-react'

interface GoogleDriveFolderEmbedProps {
  folderId: string
  title?: string
  description?: string
}

export function GoogleDriveFolderEmbed({ 
  folderId, 
  title = "Vídeo Aulas em Português",
  description = "Acesse os vídeos diretamente do Google Drive"
}: GoogleDriveFolderEmbedProps) {
  
  // Convert folder URL to embeddable format
  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`
  const directUrl = `https://drive.google.com/drive/folders/${folderId}`

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-orange-500" />
            {title}
          </div>
          <a 
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir no Drive
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300">{description}</p>
        
        {/* Google Drive Folder Embed */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div style={{ height: "600px" }}>
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              className="rounded-lg"
              title="Google Drive Video Folder"
              allow="autoplay; encrypted-media"
            />
          </div>
        </div>
        
        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/50">
          <p className="text-blue-200 text-sm">
            💡 <strong>Como assistir:</strong> Clique em qualquer vídeo na lista acima para reproduzi-lo diretamente. 
            Se preferir, use o botão "Abrir no Drive" para ver em tela cheia.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}