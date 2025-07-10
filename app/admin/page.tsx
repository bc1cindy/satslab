'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { useRequireAuth } from '@/app/components/auth/AuthProvider'
import { analyticsService } from '@/app/lib/supabase/analytics-service'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, Trophy, Wallet, Activity, TrendingUp, Calendar, BarChart3, Zap, Target, MapPin } from 'lucide-react'

interface PlatformStats {
  total_users: number
  active_users_24h: number
  active_users_7d: number
  total_sessions: number
  avg_session_duration: number
  total_modules_completed: number
  total_badges_earned: number
  total_wallets_created: number
}

interface RealtimeAnalytics {
  active_users: number
  active_sessions: number
  daily_active_users: number
  weekly_active_users: number
  avg_session_duration: number
}

interface ModuleAnalytics {
  module_id: number
  unique_users: number
  module_starts: number
  module_completions: number
  task_completions: number
  badges_earned: number
  completion_rate: number
}

interface RecentActivity {
  id: string
  user_id: string
  event_type: string
  event_data: any
  module_id: number | null
  timestamp: string
}

interface GeolocationStats {
  country: string
  count: number
  percentage: number
}

export default function AdminDashboard() {
  const { isLoading } = useRequireAuth()
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [realtimeData, setRealtimeData] = useState<RealtimeAnalytics | null>(null)
  const [moduleStats, setModuleStats] = useState<ModuleAnalytics[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [geolocationStats, setGeolocationStats] = useState<GeolocationStats[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchAllData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      // Clear state if force refresh
      if (forceRefresh) {
        setPlatformStats(null)
        setModuleStats([])
        setRealtimeData(null)
        setRecentActivity([])
        setGeolocationStats([])
      }
      
      // Use our new analytics endpoint that calculates everything correctly
      // Add cache-busting timestamp to ensure fresh data
      const analyticsResponse = await fetch(`/api/admin/analytics-data?t=${Date.now()}&force=true`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        
        if (analyticsData.success) {
          // Set platform stats from our endpoint
          setPlatformStats(analyticsData.platformStats)
          
          // Set module stats from our endpoint  
          console.log('Module Analytics from API:', analyticsData.moduleAnalytics)
          setModuleStats(analyticsData.moduleAnalytics)
          
          // Set geolocation stats from our endpoint
          setGeolocationStats(analyticsData.geolocationStats || [])
          
          // Set realtime data from platform stats
          setRealtimeData({
            active_users: analyticsData.platformStats.active_users_24h,
            active_sessions: analyticsData.platformStats.active_sessions,
            daily_active_users: analyticsData.platformStats.active_users_24h,
            weekly_active_users: analyticsData.platformStats.active_users_7d,
            avg_session_duration: analyticsData.platformStats.avg_session_duration
          })
        } else {
          throw new Error('Analytics API returned error')
        }
      } else {
        throw new Error('Failed to fetch analytics data')
      }

      // Still fetch activity data directly from Supabase
      const supabase = createClient()

      // Fetch recent activity with fallback
      const { data: activityData, error: activityError } = await supabase
        .from('user_events')
        .select('id, user_id, event_type, event_data, module_id, timestamp')
        .order('timestamp', { ascending: false })
        .limit(50)

      if (activityError) {
        console.warn('Activity data error:', activityError)
        setRecentActivity([])
      } else {
        setRecentActivity(activityData || [])
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching admin data:', error)
      // Set fallback data even on error
      setPlatformStats({
        total_users: 0,
        active_users_24h: 0,
        active_users_7d: 0,
        total_sessions: 0,
        avg_session_duration: 0,
        total_modules_completed: 0,
        total_badges_earned: 0,
        total_wallets_created: 0
      })
      setRealtimeData({
        active_users: 0,
        active_sessions: 0,
        daily_active_users: 0,
        weekly_active_users: 0,
        avg_session_duration: 0
      })
      setModuleStats([])
      setRecentActivity([])
      setGeolocationStats([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'module_complete': return '📚'
      case 'badge_earned': return '🏆'
      case 'wallet_created': return '💳'
      case 'task_complete': return '✅'
      case 'page_view': return '👁️'
      default: return '📊'
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'module_complete': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'badge_earned': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'wallet_created': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'task_complete': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando dados administrativos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar ao Dashboard</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Última atualização</p>
                <p className="text-sm font-mono">{formatTimestamp(lastUpdated.toISOString())}</p>
              </div>
              <Button onClick={() => fetchAllData(true)} size="sm" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">
            🔧 Admin Dashboard
          </h1>
          <p className="text-gray-300">
            Monitore o desempenho da plataforma e atividade dos usuários em tempo real.
          </p>
        </div>

        {/* Platform Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Users className="h-4 w-4 text-blue-500 mr-2" />
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {platformStats?.total_users || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Activity className="h-4 w-4 text-green-500 mr-2" />
                Ativos 24h
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {realtimeData?.daily_active_users || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-purple-500 mr-2" />
                Sessão Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {formatDuration(platformStats?.avg_session_duration || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-orange-500 mr-2" />
                Sessões Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {platformStats?.total_sessions || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                Badges Conquistados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {platformStats?.total_badges_earned || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Gamificação ativa
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Wallet className="h-4 w-4 text-green-500 mr-2" />
                Carteiras Criadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {platformStats?.total_wallets_created || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Hands-on experience
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                Módulos Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {platformStats?.total_modules_completed || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Aprendizado concluído
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module Analytics */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 text-orange-500 mr-2" />
                Performance por Módulo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moduleStats.length > 0 ? (
                <div className="space-y-4">
                  {moduleStats.map((module) => (
                    <div key={module.module_id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Módulo {module.module_id}</h3>
                        <Badge variant="outline" className="text-orange-400 border-orange-500/20">
                          {module.completion_rate.toFixed(1)}% conclusão
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Usuários únicos</p>
                          <p className="font-medium">{module.unique_users}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Conclusões</p>
                          <p className="font-medium">{module.module_completions}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tarefas</p>
                          <p className="font-medium">{module.task_completions}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Badges</p>
                          <p className="font-medium">{module.badges_earned}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum dado de módulo ainda</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Os dados aparecerão quando os usuários começarem a usar a plataforma
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 text-blue-500 mr-2" />
                Atividade em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                      <span className="text-lg">{getEventIcon(activity.event_type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getEventColor(activity.event_type)}>
                            {activity.event_type.replace('_', ' ')}
                          </Badge>
                          {activity.module_id && (
                            <Badge variant="outline" className="text-gray-400 border-gray-600">
                              Módulo {activity.module_id}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.user_id.slice(0, 8)}... • {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma atividade recente</p>
                  <p className="text-xs text-gray-600 mt-1">
                    A atividade dos usuários aparecerá aqui em tempo real
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Geolocation Stats */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 text-green-500 mr-2" />
                Distribuição Geográfica
              </CardTitle>
            </CardHeader>
            <CardContent>
              {geolocationStats.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {geolocationStats.map((stat) => (
                    <div key={stat.country} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">🌍</span>
                        <div>
                          <p className="font-medium text-white">{stat.country}</p>
                          <p className="text-xs text-gray-400">{stat.count} usuários</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-400">{stat.percentage.toFixed(1)}%</p>
                        <div className="w-20 h-1 bg-gray-700 rounded-full mt-1">
                          <div 
                            className="h-1 bg-green-500 rounded-full" 
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum dado de localização</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Dados de geolocalização aparecerão quando usuários acessarem
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real-time Status */}
        <Card className="bg-gray-900 border-gray-800 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 text-green-500 mr-2" />
              Status da Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {realtimeData?.active_users || 0}
                </div>
                <p className="text-sm text-gray-400">Usuários Ativos</p>
                <div className="h-1 bg-gray-700 rounded-full mt-2">
                  <div className="h-1 bg-green-500 rounded-full w-3/4"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {realtimeData?.active_sessions || 0}
                </div>
                <p className="text-sm text-gray-400">Sessões Ativas</p>
                <div className="h-1 bg-gray-700 rounded-full mt-2">
                  <div className="h-1 bg-blue-500 rounded-full w-1/2"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {realtimeData?.weekly_active_users || 0}
                </div>
                <p className="text-sm text-gray-400">Ativos (7 dias)</p>
                <div className="h-1 bg-gray-700 rounded-full mt-2">
                  <div className="h-1 bg-purple-500 rounded-full w-2/3"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {formatDuration(realtimeData?.avg_session_duration || 0)}
                </div>
                <p className="text-sm text-gray-400">Tempo Médio</p>
                <div className="h-1 bg-gray-700 rounded-full mt-2">
                  <div className="h-1 bg-orange-500 rounded-full w-5/6"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Sistema funcionando normalmente</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400">Online</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>SatsLab Analytics Dashboard • Atualização automática a cada 30 segundos</p>
          <p className="mt-1">Monitoramento em tempo real de {platformStats?.total_users || 0} usuários ativos</p>
          <p className="mt-1 text-xs">Geolocalização: {geolocationStats.length > 0 ? `${geolocationStats.reduce((sum, stat) => sum + stat.count, 0)} localizações` : 'Aguardando dados'}</p>
        </div>
      </main>
    </div>
  )
}