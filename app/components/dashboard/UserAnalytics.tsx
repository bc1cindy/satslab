'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Progress } from '@/app/components/ui/progress'
import { Badge } from '@/app/components/ui/badge'
import { 
  Clock, 
  Trophy, 
  Target, 
  Wallet, 
  Activity, 
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react'
import { useAuth, getUserIdentifier } from '@/app/components/auth/AuthProvider'
import { analyticsService, AnalyticsSummary } from '@/app/lib/supabase/analytics-service'

export default function UserAnalytics() {
  const { session } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userIdentifier = getUserIdentifier(session)
    if (!userIdentifier) return

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = await analyticsService.getUserAnalytics(userIdentifier)
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [session])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics && !loading) {
    return (
      <Card className="bg-gray-900 border-gray-800 mb-8">
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            Nenhum dado de atividade ainda
          </h3>
          <p className="text-gray-500">
            Comece a explorar os módulos para ver suas estatísticas aparecerem aqui!
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getProgressPercentage = () => {
    if (!analytics) return 0
    // 7 módulos total
    return Math.round((analytics.modules_completed / 7) * 100)
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <TrendingUp className="h-6 w-6 mr-2 text-blue-500" />
        Suas Estatísticas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Tempo Total */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tempo Total</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatTime(analytics?.total_time_spent_seconds || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Módulos Completados */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Módulos</p>
                <p className="text-2xl font-bold text-green-400">
                  {analytics?.modules_completed || 0}/7
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Badges Conquistados */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Badges</p>
                <p className="text-2xl font-bold text-purple-400">
                  {analytics?.badges_earned || 0}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Carteiras Criadas */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Carteiras</p>
                <p className="text-2xl font-bold text-orange-400">
                  {analytics?.wallets_created || 0}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progresso Geral */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-500" />
              Progresso do Curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Módulos Concluídos</span>
                <span className="text-sm font-semibold">{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-3" />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {analytics?.tasks_completed || 0}
                  </div>
                  <div className="text-xs text-gray-400">Tarefas Concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {analytics?.total_sessions || 0}
                  </div>
                  <div className="text-xs text-gray-400">Sessões de Estudo</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Última Atividade</span>
                <Badge variant="outline" className="text-xs">
                  {analytics?.last_active_at ? formatDate(analytics.last_active_at) : 'Nunca'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Primeira Visita</span>
                <Badge variant="outline" className="text-xs">
                  {analytics?.first_seen_at ? formatDate(analytics.first_seen_at) : 'Hoje'}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Tempo Médio por Sessão</span>
                <Badge variant="outline" className="text-xs">
                  {analytics?.total_sessions ? 
                    formatTime(Math.round(analytics.total_time_spent_seconds / analytics.total_sessions)) : 
                    '0m'
                  }
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dicas de Gamificação */}
      {analytics && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 mt-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Eye className="h-5 w-5 text-blue-400 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-400 mb-1">Dica de Progresso</h3>
                <p className="text-sm text-blue-300">
                  {analytics.modules_completed === 0 
                    ? "Comece com o Módulo 1 para começar sua jornada Bitcoin!" 
                    : analytics.modules_completed < 7 
                    ? `Faltam apenas ${7 - analytics.modules_completed} módulos para completar o curso!`
                    : "Parabéns! Você completou todo o curso SatsLab! 🎉"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}