'use client'

import { useRequireAuth, getUserIdentifier } from '@/app/components/auth/AuthProvider'
import { Button } from '@/app/components/ui/button'
import { Progress } from '@/app/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Trophy, Wallet, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getUserProgress, getUserBadges } from '@/app/lib/supabase/queries'
import { ModuleProgress, Badge as BadgeType } from '@/app/types'
import { createClient } from '@/app/lib/supabase/client'
import UserAnalytics from '@/app/components/dashboard/UserAnalytics'
import AnalyticsDebug from '@/app/components/debug/AnalyticsDebug'

export default function DashboardPage() {
  const { session, isLoading } = useRequireAuth()
  const [copied, setCopied] = useState(false)
  const [userProgress, setUserProgress] = useState<ModuleProgress[]>([])
  const [userBadges, setUserBadges] = useState<BadgeType[]>([])
  const [userWallets, setUserWallets] = useState<number>(0)
  const [progressLoading, setProgressLoading] = useState(true)

  // Load user progress and badges
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user.id) {
        try {
          setProgressLoading(true)
          const [progress, badges] = await Promise.all([
            getUserProgress(session.user.id),
            getUserBadges(session.user.id)
          ])
          
          setUserProgress(progress)
          setUserBadges(badges)
          
          // Load wallet count
          const supabase = createClient()
          const { data: wallets } = await supabase
            .from('wallets')
            .select('id')
            .eq('user_id', session.user.id)
          setUserWallets(wallets?.length || 0)
        } catch (error) {
          console.error('Error loading user data:', error)
        } finally {
          setProgressLoading(false)
        }
      }
    }

    if (session?.user.id) {
      loadUserData()
    }
  }, [session?.user.id])

  const copyPublicKey = async () => {
    const userIdentifier = getUserIdentifier(session)
    if (userIdentifier) {
      try {
        await navigator.clipboard.writeText(userIdentifier)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // useRequireAuth will redirect
  }

  const modules = [
    { id: 1, title: "Introdução ao Bitcoin", desc: "Conceitos básicos e exploração da Signet", icon: "📚", available: true, color: "blue" },
    { id: 2, title: "Segurança e Carteiras", desc: "Chaves privadas e criação de carteiras", icon: "🔐", available: true, color: "green" },
    { id: 3, title: "Transações na Signet", desc: "Envio de Bitcoin e cálculo de taxas", icon: "💸", available: true, color: "purple" },
    { id: 4, title: "Mineração no Bitcoin", desc: "Proof-of-work e simulações", icon: "⛏️", available: true, color: "orange" },
    { id: 5, title: "Lightning Network", desc: "Pagamentos instantâneos e canais", icon: "⚡", available: true, color: "yellow" },
    { id: 6, title: "Taproot e Ordinals", desc: "Tecnologias avançadas do Bitcoin", icon: "🎨", available: true, color: "pink" },
    { id: 7, title: "Carteiras Multisig", desc: "Carteiras multi-assinatura", icon: "🔒", available: true, color: "indigo" },
  ].map(module => {
    const progress = userProgress.find(p => p.moduleId === module.id)
    return {
      ...module,
      completed: progress?.completed || false,
      score: progress?.score || 0
    }
  })

  const completedModules = modules.filter(m => m.completed).length
  const progressPercentage = (completedModules / modules.length) * 100

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar para Home</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Chave Pública</p>
                <div className="flex items-center space-x-2">
                  <code className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-300">
                    {getUserIdentifier(session)?.slice(0, 20)}...
                  </code>
                  <button
                    onClick={copyPublicKey}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Copiar chave pública"
                  >
                    {copied ? (
                      <span className="text-green-400 text-xs">✓</span>
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">
            SatsLab Dashboard
          </h1>
          <p className="text-gray-300">
            Bem-vindo de volta! Continue sua jornada Bitcoin.
          </p>
        </div>

        {/* User Analytics */}
        <UserAnalytics />

        {/* Analytics Debug Panel */}
        <div className="mb-8">
          <AnalyticsDebug />
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                Progresso Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {progressLoading ? '...' : `${completedModules}/7`}
              </div>
              <p className="text-gray-400 text-sm mb-3">Módulos Completados</p>
              <Progress value={progressLoading ? 0 : progressPercentage} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {progressLoading ? '...' : userBadges.length}
              </div>
              <p className="text-gray-400 text-sm mb-3">Badges Conquistados</p>
              <Link href="/badges" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                Ver todos →
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Wallet className="h-5 w-5 text-green-500 mr-2" />
                Carteiras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">{progressLoading ? '...' : userWallets}</div>
              <p className="text-gray-400 text-sm mb-3">Carteiras Criadas</p>
              <Link href="/wallets" className="text-green-400 hover:text-green-300 text-sm font-medium">
                Gerenciar →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Modules Section */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <BookOpen className="h-6 w-6 text-orange-500 mr-3" />
              Módulos Disponíveis
            </CardTitle>
            <p className="text-gray-400">
              Complete os módulos para aprender Bitcoin e ganhar badges
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => (
                <Card 
                  key={module.id} 
                  className={`bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors ${
                    module.completed ? 'border-green-500/50' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{module.icon}</span>
                        <Badge variant="outline" className="text-xs">
                          Módulo {module.id}
                        </Badge>
                      </div>
                      {module.completed && (
                        <span className="text-green-400 text-xl">✓</span>
                      )}
                    </div>
                    <CardTitle className="text-lg text-white">
                      {module.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-400 mb-4">
                      {module.desc}
                    </p>
                    <Link href={`/modules/${module.id}`}>
                      <Button 
                        className={`w-full ${
                          module.completed 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                        disabled={!module.available}
                      >
                        {module.completed ? 'Revisar' : 'Iniciar'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="inline-flex space-x-4 text-sm">
            <Link href="/modules/1" className="text-orange-400 hover:text-orange-300 font-medium">
              Começar pelo Módulo 1
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/badges" className="text-gray-400 hover:text-white">
              Ver Badges
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/wallets" className="text-gray-400 hover:text-white">
              Gerenciar Carteiras
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/admin" className="text-red-400 hover:text-red-300 font-medium">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}