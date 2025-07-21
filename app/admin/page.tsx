'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { useSession } from 'next-auth/react'
import { formatDateBR } from '@/app/lib/utils'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, Trophy, Wallet, Activity, TrendingUp, Calendar, BarChart3, Zap, Target, MapPin, Languages, Crown, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

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

interface ProUser {
  email: string
  is_pro: boolean
  pro_expires_at: string
  created_at: string
  updated_at: string
  days_remaining: number
  is_expired: boolean
  expires_soon: boolean
}

interface ProUsersData {
  users: ProUser[]
  total: number
  active: number
  expired: number
  expiring_soon: number
}

// Translation object
const translations = {
  pt: {
    // Header
    backToDashboard: "Voltar ao Dashboard",
    lastUpdate: "Última atualização",
    refresh: "Atualizar",
    
    // Title
    adminDashboard: "Admin Dashboard",
    subtitle: "Monitore o desempenho da plataforma e atividade dos usuários em tempo real.",
    
    // Loading
    loading: "Carregando dados administrativos...",
    
    // Stats Cards
    totalUsers: "Total de Usuários",
    active24h: "Ativos 24h",
    avgSession: "Sessão Média",
    totalSessions: "Sessões Totais",
    badgesEarned: "Badges Conquistados",
    gamificationActive: "Gamificação ativa",
    walletsCreated: "Carteiras Criadas",
    handsOnExperience: "Hands-on experience",
    modulesCompleted: "Módulos Completados",
    learningCompleted: "Aprendizado concluído",
    
    // Module Analytics
    modulePerformance: "Performance por Módulo",
    completion: "conclusão",
    uniqueUsers: "Usuários únicos",
    completions: "Conclusões",
    tasks: "Tarefas",
    badges: "Badges",
    noModuleData: "Nenhum dado de módulo ainda",
    moduleDataWillAppear: "Os dados aparecerão quando os usuários começarem a usar a plataforma",
    
    // Recent Activity
    realtimeActivity: "Atividade em Tempo Real",
    module: "Módulo",
    noRecentActivity: "Nenhuma atividade recente",
    activityWillAppear: "A atividade dos usuários aparecerá aqui em tempo real",
    
    // Geolocation
    geographicDistribution: "Distribuição Geográfica",
    users: "usuários",
    noLocationData: "Nenhum dado de localização",
    geoDataWillAppear: "Dados de geolocalização aparecerão quando usuários acessarem",
    
    // Platform Status
    platformStatus: "Status da Plataforma",
    activeUsers: "Usuários Ativos",
    activeSessions: "Sessões Ativas",
    active7Days: "Ativos (7 dias)",
    avgTime: "Tempo Médio",
    systemWorking: "Sistema funcionando normalmente",
    online: "Online",
    
    // Footer
    analyticsFooter: "SatsLab Analytics Dashboard • Atualização automática a cada 30 segundos",
    realtimeMonitoring: "Monitoramento em tempo real de",
    activeUsersText: "usuários ativos",
    geolocation: "Geolocalização:",
    locations: "localizações",
    awaitingData: "Aguardando dados",

    // Pro Users Management
    proUsersManagement: "Gerenciamento de Usuários Pro",
    addProUser: "Adicionar Usuário Pro",
    emailPlaceholder: "email@exemplo.com",
    addUser: "Adicionar",
    totalProUsers: "Total Pro",
    activeProUsers: "Ativos",
    expiredProUsers: "Expirados", 
    expiringSoon: "Expirando em breve",
    email: "Email",
    expiresAt: "Expira em",
    status: "Status",
    actions: "Ações",
    active: "Ativo",
    expired: "Expirado",
    expiringSoonStatus: "Expira em breve",
    removeAccess: "Remover Acesso",
    daysRemaining: "dias restantes",
    dayRemaining: "dia restante",
    expiredDays: "expirado há",
    days: "dias",
    noProUsers: "Nenhum usuário Pro",
    proUsersWillAppear: "Usuários Pro aparecerão aqui quando adicionados"
  },
  en: {
    // Header
    backToDashboard: "Back to Dashboard",
    lastUpdate: "Last updated",
    refresh: "Refresh",
    
    // Title
    adminDashboard: "Admin Dashboard",
    subtitle: "Monitor platform performance and user activity in real time.",
    
    // Loading
    loading: "Loading administrative data...",
    
    // Stats Cards
    totalUsers: "Total Users",
    active24h: "Active 24h",
    avgSession: "Avg Session",
    totalSessions: "Total Sessions",
    badgesEarned: "Badges Earned",
    gamificationActive: "Active gamification",
    walletsCreated: "Wallets Created",
    handsOnExperience: "Hands-on experience",
    modulesCompleted: "Modules Completed",
    learningCompleted: "Learning completed",
    
    // Module Analytics
    modulePerformance: "Performance by Module",
    completion: "completion",
    uniqueUsers: "Unique users",
    completions: "Completions",
    tasks: "Tasks",
    badges: "Badges",
    noModuleData: "No module data yet",
    moduleDataWillAppear: "Data will appear when users start using the platform",
    
    // Recent Activity
    realtimeActivity: "Real-time Activity",
    module: "Module",
    noRecentActivity: "No recent activity",
    activityWillAppear: "User activity will appear here in real time",
    
    // Geolocation
    geographicDistribution: "Geographic Distribution",
    users: "users",
    noLocationData: "No location data",
    geoDataWillAppear: "Geolocation data will appear when users access",
    
    // Platform Status
    platformStatus: "Platform Status",
    activeUsers: "Active Users",
    activeSessions: "Active Sessions",
    active7Days: "Active (7 days)",
    avgTime: "Avg Time",
    systemWorking: "System working normally",
    online: "Online",
    
    // Footer
    analyticsFooter: "SatsLab Analytics Dashboard • Auto-refresh every 30 seconds",
    realtimeMonitoring: "Real-time monitoring of",
    activeUsersText: "active users",
    geolocation: "Geolocation:",
    locations: "locations",
    awaitingData: "Awaiting data",

    // Pro Users Management
    proUsersManagement: "Pro Users Management",
    addProUser: "Add Pro User",
    emailPlaceholder: "email@example.com",
    addUser: "Add User",
    totalProUsers: "Total Pro",
    activeProUsers: "Active",
    expiredProUsers: "Expired",
    expiringSoon: "Expiring Soon",
    email: "Email",
    expiresAt: "Expires At",
    status: "Status",
    actions: "Actions",
    active: "Active",
    expired: "Expired",
    expiringSoonStatus: "Expiring Soon",
    removeAccess: "Remove Access",
    daysRemaining: "days remaining",
    dayRemaining: "day remaining",
    expiredDays: "expired",
    days: "days ago",
    noProUsers: "No Pro users",
    proUsersWillAppear: "Pro users will appear here when added"
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [realtimeData, setRealtimeData] = useState<RealtimeAnalytics | null>(null)
  const [moduleStats, setModuleStats] = useState<ModuleAnalytics[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [geolocationStats, setGeolocationStats] = useState<GeolocationStats[]>([])
  const [proUsersData, setProUsersData] = useState<ProUsersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [language, setLanguage] = useState<'pt' | 'en'>('pt')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [addingUser, setAddingUser] = useState(false)

  // Helper function to get translations
  const t = (key: keyof typeof translations.pt) => translations[language][key]

  const fetchProUsers = async () => {
    try {
      const response = await fetch('/api/admin/pro-users')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProUsersData(data)
        }
      }
    } catch (error) {
      securityLogger.warn(SecurityEventType.SYSTEM_ERROR, 'Failed to fetch Pro users list', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const addProUser = async () => {
    if (!newUserEmail || addingUser) return
    
    setAddingUser(true)
    try {
      const response = await fetch('/api/admin/pro-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserEmail })
      })
      
      if (response.ok) {
        setNewUserEmail('')
        await fetchProUsers() // Refresh list
        alert('Usuário Pro adicionado com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to add Pro user', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      alert('Erro ao adicionar usuário')
    } finally {
      setAddingUser(false)
    }
  }

  const removeProUser = async (email: string) => {
    if (!confirm(`Remover acesso Pro de ${email}?`)) return
    
    try {
      const response = await fetch('/api/admin/pro-users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        await fetchProUsers() // Refresh list
        alert('Acesso Pro removido com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to remove Pro user', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      alert('Erro ao remover usuário')
    }
  }

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
      const timestamp = Date.now()
      if (process.env.NODE_ENV === 'development') {
        console.log(`Fetching analytics data at ${new Date(timestamp).toISOString()}...`)
      }
      
      const analyticsResponse = await fetch(`/api/admin/analytics-data?t=${timestamp}&force=true`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        
        if (analyticsData.success) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Analytics data received:', {
              totalSessions: analyticsData.platformStats.total_sessions,
              totalUsers: analyticsData.platformStats.total_users,
              timestamp: new Date().toISOString()
            })
          }
          
          // Set platform stats from our endpoint
          setPlatformStats(analyticsData.platformStats)
          
          // Set module stats from our endpoint  
          if (process.env.NODE_ENV === 'development') {
            console.log('Module Analytics from API:', analyticsData.moduleAnalytics)
          }
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
        securityLogger.warn(SecurityEventType.SYSTEM_ERROR, 'Activity data fetch failed', {
          error: activityError instanceof Error ? activityError.message : 'Unknown error'
        })
        setRecentActivity([])
      } else {
        setRecentActivity(activityData || [])
      }

      // Fetch Pro users data
      await fetchProUsers()

      setLastUpdated(new Date())
    } catch (error) {
      securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Admin dashboard data fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
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
    fetchAllData(true) // Force refresh on mount
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auto-refreshing admin data...')
      }
      fetchAllData(true)
    }, 30000) // 30 seconds for real-time updates
    
    // Also refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Tab became visible, refreshing data...')
        }
        fetchAllData(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
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
          <p className="text-white">{t('loading')}</p>
        </div>
      </div>
    )
  }

  // Check if user is authenticated and is admin
  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h1>
          <p className="text-gray-400 mb-4">Você precisa estar logado para acessar esta página.</p>
          <Link href="/auth" className="text-orange-500 hover:text-orange-400">
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  // Check if user is admin via server endpoint
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch('/api/admin/verify')
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      } catch (error) {
        console.error('Error checking admin access:', error)
        setIsAdmin(false)
      }
    }
    
    if (session) {
      checkAdminAccess()
    }
  }, [session])
  
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Verificando acesso admin...</p>
        </div>
      </div>
    )
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-400 mb-4">Apenas administradores podem acessar esta página.</p>
          <Link href="/" className="text-orange-500 hover:text-orange-400">
            Voltar ao Site
          </Link>
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
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar ao Site</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">{t('lastUpdate')}</p>
                <p className="text-sm font-mono">{formatTimestamp(lastUpdated.toISOString())}</p>
              </div>
              <Button 
                onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
                size="sm" 
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700"
              >
                <Languages className="h-4 w-4 mr-2" />
                {language === 'pt' ? 'EN' : 'PT'}
              </Button>
              <Button 
                onClick={() => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Manual refresh triggered')
                  }
                  // Clear all state first
                  setPlatformStats(null)
                  setModuleStats([])
                  setRealtimeData(null)
                  setRecentActivity([])
                  setGeolocationStats([])
                  // Force reload
                  setTimeout(() => fetchAllData(true), 100)
                }} 
                size="sm" 
                variant="outline"
              >
                <Activity className="h-4 w-4 mr-2" />
                {t('refresh')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">
            🔧 {t('adminDashboard')}
          </h1>
          <p className="text-gray-300">
            {t('subtitle')}
          </p>
        </div>

        {/* Platform Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Users className="h-4 w-4 text-blue-500 mr-2" />
                {t('totalUsers')}
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
                {t('active24h')}
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
                {t('avgSession')}
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
                {t('totalSessions')}
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
                {t('badgesEarned')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {platformStats?.total_badges_earned || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {t('gamificationActive')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Wallet className="h-4 w-4 text-green-500 mr-2" />
                {t('walletsCreated')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {platformStats?.total_wallets_created || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {t('handsOnExperience')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                {t('modulesCompleted')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {platformStats?.total_modules_completed || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {t('learningCompleted')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pro Users Management */}
        <div className="mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                {t('proUsersManagement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add User Form */}
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">{t('addProUser')}</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onKeyDown={(e) => e.key === 'Enter' && addProUser()}
                  />
                  <Button 
                    onClick={addProUser}
                    disabled={!newUserEmail || addingUser}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {addingUser ? '...' : t('addUser')}
                  </Button>
                </div>
              </div>

              {/* Pro Users Stats */}
              {proUsersData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{proUsersData.total}</div>
                    <div className="text-sm text-gray-400">{t('totalProUsers')}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{proUsersData.active}</div>
                    <div className="text-sm text-gray-400">{t('activeProUsers')}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{proUsersData.expired}</div>
                    <div className="text-sm text-gray-400">{t('expiredProUsers')}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">{proUsersData.expiring_soon}</div>
                    <div className="text-sm text-gray-400">{t('expiringSoon')}</div>
                  </div>
                </div>
              )}

              {/* Users List */}
              {proUsersData && proUsersData.users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 px-3">{t('email')}</th>
                        <th className="text-left py-2 px-3">{t('expiresAt')}</th>
                        <th className="text-left py-2 px-3">{t('status')}</th>
                        <th className="text-left py-2 px-3">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proUsersData.users.map((user) => (
                        <tr key={user.email} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-2 px-3 font-medium">{user.email}</td>
                          <td className="py-2 px-3">
                            {formatDateBR(user.pro_expires_at)}
                          </td>
                          <td className="py-2 px-3">
                            {user.is_expired ? (
                              <Badge variant="outline" className="text-red-400 border-red-500/20">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {t('expired')} ({Math.abs(user.days_remaining)} {t('days')})
                              </Badge>
                            ) : user.expires_soon ? (
                              <Badge variant="outline" className="text-orange-400 border-orange-500/20">
                                <Clock className="h-3 w-3 mr-1" />
                                {user.days_remaining === 1 ? 
                                  `${user.days_remaining} ${t('dayRemaining')}` : 
                                  `${user.days_remaining} ${t('daysRemaining')}`
                                }
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-400 border-green-500/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {user.days_remaining === 1 ? 
                                  `${user.days_remaining} ${t('dayRemaining')}` : 
                                  `${user.days_remaining} ${t('daysRemaining')}`
                                }
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <Button
                              onClick={() => removeProUser(user.email)}
                              size="sm"
                              variant="outline"
                              className="text-red-400 border-red-500/20 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              {t('removeAccess')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">{t('noProUsers')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('proUsersWillAppear')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module Analytics */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 text-orange-500 mr-2" />
                {t('modulePerformance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moduleStats.length > 0 ? (
                <div className="space-y-4">
                  {moduleStats.map((module) => (
                    <div key={module.module_id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{t('module')} {module.module_id}</h3>
                        <Badge variant="outline" className="text-orange-400 border-orange-500/20">
                          {module.completion_rate.toFixed(1)}% {t('completion')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">{t('uniqueUsers')}</p>
                          <p className="font-medium">{module.unique_users}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('completions')}</p>
                          <p className="font-medium">{module.module_completions}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('tasks')}</p>
                          <p className="font-medium">{module.task_completions}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('badges')}</p>
                          <p className="font-medium">{module.badges_earned}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">{t('noModuleData')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('moduleDataWillAppear')}
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
                {t('realtimeActivity')}
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
                              {t('module')} {activity.module_id}
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
                  <p className="text-gray-500">{t('noRecentActivity')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('activityWillAppear')}
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
                {t('geographicDistribution')}
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
                          <p className="text-xs text-gray-400">{stat.count} {t('users')}</p>
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
                  <p className="text-gray-500">{t('noLocationData')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('geoDataWillAppear')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>


        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>{t('analyticsFooter')}</p>
          <p className="mt-1">{t('realtimeMonitoring')} {platformStats?.total_users || 0} {t('activeUsersText')}</p>
          <p className="mt-1 text-xs">{t('geolocation')} {geolocationStats.length > 0 ? `${geolocationStats.reduce((sum, stat) => sum + stat.count, 0)} ${t('locations')}` : t('awaitingData')}</p>
          {geolocationStats.length > 0 && platformStats && (
            <p className="mt-1 text-xs text-yellow-400">
              {platformStats.total_users - geolocationStats.reduce((sum, stat) => sum + stat.count, 0)} usuários sem dados geográficos
            </p>
          )}
        </div>
      </main>
    </div>
  )
}