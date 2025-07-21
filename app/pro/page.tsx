'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { VideoPlayer } from '@/app/components/VideoPlayer'
import { VideoList } from '@/app/components/VideoList'
import { VideoComments } from '@/app/components/pro/VideoComments'
import { ComplementaryContent } from '@/app/components/pro/ComplementaryContent'
import { Card, CardContent } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Crown, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { formatDateBR } from '@/app/lib/utils'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

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

export default function ProPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<VideoMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [hasProAccess, setHasProAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedVideo, setSelectedVideo] = useState<VideoMapping | null>(null)
  const [userProInfo, setUserProInfo] = useState<{
    pro_expires_at: string
    created_at: string
  } | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth')
      return
    }
    
    // Check Pro access when authenticated
    if (status === 'authenticated') {
      checkProAccess()
    }
  }, [status, router])

  async function checkProAccess() {
    try {
      const response = await fetch('/api/user/check-pro-access')
      const data = await response.json()
      
      if (!data.hasProAccess) {
        // Redirect to checkout if no Pro access
        router.push('/checkout')
        return
      }
      
      setHasProAccess(true)
      
      // Development-only debug log for Pro data
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Dados Pro recebidos:', {
          pro_expires_at: data.pro_expires_at,
          created_at: data.created_at,
          hasProAccess: data.hasProAccess
        })
      }
      
      setUserProInfo({
        pro_expires_at: data.pro_expires_at,
        created_at: data.created_at
      })
      loadVideos()
    } catch (error) {
      securityLogger.logAccessControl(false, 'pro_content', session?.user?.email || undefined)
      router.push('/checkout')
    } finally {
      setCheckingAccess(false)
    }
  }

  async function loadVideos() {
    try {
      console.log('📡 Carregando vídeos...')
      
      // Use apenas o fallback que sabemos que funciona
      const response = await fetch('/api/videos/list-b2')
      const data = await response.json()
      
      if (data.success && data.videos) {
        console.log(`✅ Carregados ${data.videos.length} vídeos`)
        setVideos(data.videos)
        
        // Selecionar primeiro vídeo automaticamente
        if (data.videos.length > 0 && !selectedVideo) {
          setSelectedVideo(data.videos[0])
          console.log('🎯 Vídeo selecionado:', data.videos[0].title)
        }
      } else {
        console.error('❌ Erro ao carregar vídeos:', data.error)
      }
    } catch (error) {
      console.error('❌ Erro na função loadVideos:', error)
      securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to load Pro videos', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }


  const handleVideoSelect = (video: VideoMapping) => {
    setSelectedVideo(video)
  }

  const handleVideoError = (error: string) => {
    securityLogger.warn(SecurityEventType.SYSTEM_ERROR, 'Video playback error', { error })
  }

  if (status === 'loading' || checkingAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Verificando acesso...</div>
      </div>
    )
  }

  if (!hasProAccess) {
    return null // Will redirect to checkout
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="text-orange-500 text-2xl font-bold">₿</div>
            <h1 className="text-xl font-semibold text-orange-500">SatsLab Pro</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white border border-gray-700"
              onClick={() => router.push('/')}
            >
              SatsLab
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-300 border border-purple-500/30"
            >
              <Crown className="w-4 h-4 mr-1" />
              Pro
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-400 hover:text-red-300 border border-red-500/30"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* User Info */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">{session?.user?.name || session?.user?.email}</h2>
          
          {/* Pro Subscription Info */}
          {userProInfo && (
            <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-semibold text-orange-500">SatsLab Pro Ativo</span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Assinatura desde: {formatDateBR(userProInfo.created_at)}</div>
                      <div>Válido até: {formatDateBR(userProInfo.pro_expires_at)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✓ Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            <Card className="bg-gray-900/50 border-gray-800/50 overflow-hidden">
              <CardContent className="p-2">
                <VideoPlayer
                  videoId={selectedVideo?.internal_filename || null}
                  title={selectedVideo?.title || 'Selecione um vídeo'}
                  description={selectedVideo?.description || ''}
                  onError={handleVideoError}
                />
              </CardContent>
            </Card>
            
            {/* Comments */}
            {selectedVideo && (
              <Card className="bg-gray-900/30 border-gray-800/50">
                <CardContent className="p-6">
                  <VideoComments 
                    videoId={selectedVideo.id}
                    videoTitle={selectedVideo.title}
                  />
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Tabs defaultValue="videos" className="w-full">
              <TabsList className="w-full bg-gray-900/50 border border-gray-800/50 h-auto p-1">
                <TabsTrigger
                  value="videos"
                  className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400 text-xs px-1 py-3 min-w-0 whitespace-normal text-center leading-tight"
                >
                  Todos os vídeos
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400 text-xs px-1 py-3 min-w-0 whitespace-normal text-center leading-tight"
                >
                  Conteúdo complementar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="videos" className="mt-6">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-800 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Todos os vídeos</h4>
                    <p className="text-sm text-gray-400 mb-6">Lista completa de vídeos do curso</p>
                    <VideoList
                      videos={videos}
                      selectedVideoId={selectedVideo?.internal_filename || null}
                      onVideoSelect={handleVideoSelect}
                      selectedCategory="all"
                      onCategoryChange={() => {}}
                    />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="content" className="mt-6 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Conteúdo Complementar</h4>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    Recursos adicionais, links úteis e materiais de apoio para aprofundar seus conhecimentos
                  </p>
                </div>
                <ComplementaryContent />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}