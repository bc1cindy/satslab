'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { CheckCircle, XCircle, RefreshCw, Activity } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

export default function VerifyAnalytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-analytics')
      const result = await response.json()
      setData(result)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Verificando sistema de analytics...</p>
        </div>
      </div>
    )
  }

  const isWorking = data?.success && 
                   data?.tests?.recentSessions?.hasData && 
                   data?.tests?.sessionValidation?.usingCookieSystem

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🔍 Verificação do Sistema de Analytics</h1>
          <Button onClick={fetchData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Status Geral */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {isWorking ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <span className="text-green-400">Sistema Funcionando Corretamente</span>
                </>
              ) : (
                <>
                  <XCircle className="h-8 w-8 text-red-500" />
                  <span className="text-red-400">Problemas Detectados</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Última verificação: {lastRefresh.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        {/* Testes Detalhados */}
        {data?.tests && (
          <div className="grid gap-6">
            {/* Sessões */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">📊 Sessões Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de sessões:</span>
                    <Badge variant={data.tests.recentSessions.hasData ? "default" : "destructive"}>
                      {data.tests.recentSessions.count}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Usando sistema de cookies:</span>
                    <Badge variant={data.tests.sessionValidation.usingCookieSystem ? "default" : "destructive"}>
                      {data.tests.sessionValidation.usingCookieSystem ? "SIM" : "NÃO"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>SessionIDs válidos:</span>
                    <span className="text-gray-400">
                      {data.tests.sessionValidation.validSessionIds} / {data.tests.sessionValidation.totalSessions}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eventos */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">🎯 Eventos Trackados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de eventos:</span>
                    <Badge variant={data.tests.recentEvents.hasData ? "default" : "destructive"}>
                      {data.tests.recentEvents.count}
                    </Badge>
                  </div>
                  {data.tests.recentEvents.eventTypes.length > 0 && (
                    <div>
                      <p className="mb-2">Tipos de eventos:</p>
                      <div className="flex flex-wrap gap-2">
                        {data.tests.recentEvents.eventTypes.map((type: string) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Geolocalização */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">🌍 Geolocalização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sessões com geolocalização:</span>
                    <Badge variant={parseInt(data.tests.geolocation.percentage) > 0 ? "default" : "destructive"}>
                      {data.tests.geolocation.percentage}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total com geo:</span>
                    <span className="text-gray-400">
                      {data.tests.geolocation.sessionsWithGeo} sessões
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Última Atividade */}
            {data.recentActivity && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">⏱️ Última Atividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recentActivity.lastSession && (
                      <div>
                        <p className="font-medium mb-1">Última sessão:</p>
                        <code className="text-xs bg-gray-800 p-2 rounded block overflow-x-auto">
                          ID: {data.recentActivity.lastSession.id || 'N/A'}<br />
                          IP: {data.recentActivity.lastSession.ip_address || 'N/A'}<br />
                          Criada: {new Date(data.recentActivity.lastSession.created_at || data.recentActivity.lastSession.session_start).toLocaleString('pt-BR')}
                        </code>
                      </div>
                    )}
                    {data.recentActivity.lastEvent && (
                      <div>
                        <p className="font-medium mb-1">Último evento:</p>
                        <code className="text-xs bg-gray-800 p-2 rounded block overflow-x-auto">
                          Tipo: {data.recentActivity.lastEvent.event_type}<br />
                          User: {data.recentActivity.lastEvent.user_id}<br />
                          Criado: {new Date(data.recentActivity.lastEvent.created_at || data.recentActivity.lastEvent.timestamp).toLocaleString('pt-BR')}
                        </code>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Instruções */}
        <Card className="bg-gray-900 border-gray-800 mt-6">
          <CardHeader>
            <CardTitle className="text-lg">📝 Como Verificar</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
              <li>Abra o site em uma aba anônima/incógnita</li>
              <li>Aceite os cookies quando o banner aparecer</li>
              <li>Navegue por algumas páginas (módulos, home, etc)</li>
              <li>Volte aqui e clique em "Atualizar"</li>
              <li>Verifique se o número de sessões e eventos aumentou</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}