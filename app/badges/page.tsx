'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/app/components/auth/AuthProvider'
import { getUserBadges } from '@/app/lib/supabase/queries'
import { Badge as BadgeType } from '@/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Trophy, Calendar, Award, Sparkles } from 'lucide-react'
import { formatDateBR } from '@/app/lib/utils'

export default function BadgesPage() {
  const { session, isLoading } = useRequireAuth()
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [badgesLoading, setBadgesLoading] = useState(true)

  useEffect(() => {
    const loadBadges = async () => {
      if (session?.user.id) {
        try {
          setBadgesLoading(true)
          const userBadges = await getUserBadges(session.user.id)
          setBadges(userBadges)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error loading badges:', error)
          }
        } finally {
          setBadgesLoading(false)
        }
      }
    }

    if (session?.user.id) {
      loadBadges()
    }
  }, [session?.user.id])

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

  const allPossibleBadges = [
    { id: 1, name: "Explorador Iniciante", description: "Completou a introdução ao Bitcoin", moduleId: 1, icon: "📚", color: "blue" },
    { id: 2, name: "Guardião da Chave", description: "Aprendeu sobre segurança e carteiras", moduleId: 2, icon: "🔐", color: "green" },
    { id: 3, name: "Mensageiro da Blockchain", description: "Dominou transações na Signet", moduleId: 3, icon: "💸", color: "purple" },
    { id: 4, name: "Minerador Aprendiz", description: "Compreendeu a mineração Bitcoin", moduleId: 4, icon: "⛏️", color: "orange" },
    { id: 5, name: "Raio Rápido", description: "Explorou a Lightning Network", moduleId: 5, icon: "⚡", color: "yellow" },
    { id: 6, name: "Pioneiro Taproot", description: "Descobriu Taproot e Inscrições", moduleId: 6, icon: "🎨", color: "pink" },
    { id: 7, name: "Mestre Multisig", description: "Dominou carteiras multi-assinatura", moduleId: 7, icon: "🔒", color: "indigo" },
  ]

  const earnedBadgeIds = badges.map(b => b.moduleId)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar para Dashboard</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="text-lg font-semibold">Meus Badges</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-500 mb-2">
            🏆 Coleção de Badges
          </h1>
          <p className="text-gray-300 mb-6">
            Badges conquistados ao completar módulos e dominar conceitos Bitcoin
          </p>
          <div className="inline-flex items-center space-x-4 bg-gray-900 rounded-lg px-6 py-3 border border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {badgesLoading ? '...' : badges.length}
              </div>
              <div className="text-sm text-gray-400">Conquistados</div>
            </div>
            <div className="w-px h-8 bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {allPossibleBadges.length}
              </div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPossibleBadges.map((badge) => {
            const isEarned = earnedBadgeIds.includes(badge.moduleId)
            const earnedBadge = badges.find(b => b.moduleId === badge.moduleId)
            
            return (
              <Card 
                key={badge.id}
                className={`relative transition-all duration-300 ${
                  isEarned 
                    ? 'bg-gray-900 border-yellow-500/50 shadow-lg shadow-yellow-500/10' 
                    : 'bg-gray-900/50 border-gray-800 opacity-60'
                }`}
              >
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                      isEarned ? 'bg-yellow-500/20' : 'bg-gray-800'
                    }`}>
                      {badge.icon}
                    </div>
                    {isEarned && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-black" />
                      </div>
                    )}
                  </div>
                  <CardTitle className={`text-lg ${isEarned ? 'text-white' : 'text-gray-500'}`}>
                    {badge.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className={`text-sm ${isEarned ? 'text-gray-300' : 'text-gray-600'}`}>
                    {badge.description}
                  </p>
                  
                  <Badge 
                    variant="outline" 
                    className={`${
                      isEarned 
                        ? 'border-yellow-500/50 text-yellow-400' 
                        : 'border-gray-700 text-gray-600'
                    }`}
                  >
                    Módulo {badge.moduleId}
                  </Badge>

                  {isEarned && earnedBadge && (
                    <div className="pt-2 border-t border-gray-800">
                      <div className="flex items-center justify-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        Conquistado em {formatDateBR(earnedBadge.earnedAt)}
                      </div>
                    </div>
                  )}

                  {!isEarned && (
                    <Link href={`/modules/${badge.moduleId}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-400"
                      >
                        Conquistar Badge
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {!badgesLoading && badges.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <Award className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Nenhum badge conquistado ainda
            </h3>
            <p className="text-gray-500 mb-6">
              Complete módulos para ganhar seus primeiros badges!
            </p>
            <Link href="/modules/1">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Começar pelo Módulo 1
              </Button>
            </Link>
          </div>
        )}

        {/* Call to Action */}
        {badges.length > 0 && badges.length < allPossibleBadges.length && (
          <div className="mt-12 text-center bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-2">
              Continue sua jornada!
            </h3>
            <p className="text-gray-400 mb-4">
              Você tem {badges.length} de {allPossibleBadges.length} badges. Continue aprendendo para completar sua coleção!
            </p>
            <Link href="/dashboard">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Voltar aos Módulos
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}