'use client'

import { useAuth } from '@/app/components/auth/AuthProvider'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const modules = [
  { id: 1, title: "Introdução ao Bitcoin", icon: "📚", requiresLogin: false },
  { id: 2, title: "Segurança e Carteiras", icon: "🔐", requiresLogin: true },
  { id: 3, title: "Transações na Signet", icon: "💸", requiresLogin: true },
  { id: 4, title: "Mineração no Bitcoin", icon: "⛏️", requiresLogin: true },
  { id: 5, title: "Lightning Network", icon: "⚡", requiresLogin: true },
  { id: 6, title: "Taproot e Ordinals", icon: "🎨", requiresLogin: true },
  { id: 7, title: "Carteiras Multisig", icon: "🔧", requiresLogin: true },
]

export function Sidebar() {
  const { session } = useAuth()
  const pathname = usePathname()

  return (
    <aside className="w-80 bg-gray-900 border-r border-gray-800 p-6 overflow-y-auto">
      <div className="space-y-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">🎓 Módulos SatsLab</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {modules.map((module) => {
              const isActive = pathname === `/modules/${module.id}`
              const canAccess = !module.requiresLogin || session?.isAuthenticated
              
              return (
                <div
                  key={module.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    isActive 
                      ? 'border-orange-500 bg-orange-900/50' 
                      : canAccess 
                        ? 'border-gray-700 hover:border-orange-500 hover:bg-orange-900/30' 
                        : 'border-gray-800 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{module.icon}</span>
                      <div>
                        <h4 className={`font-medium text-sm ${canAccess ? 'text-white' : 'text-gray-400'}`}>
                          {module.title}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Módulo {module.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {module.requiresLogin && (
                        <Badge variant="outline" className="text-xs">
                          Login
                        </Badge>
                      )}
                      {canAccess ? (
                        <Link href={`/modules/${module.id}`}>
                          <Button size="sm" variant={isActive ? "default" : "outline"}>
                            {isActive ? 'Atual' : 'Abrir'}
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/auth">
                          <Button size="sm" variant="outline">
                            Login
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {session && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">🏆 Seu Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Módulos Completados</span>
                    <span className="text-gray-300">0/7</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-orange-900/30 p-2 rounded">
                    <div className="text-lg font-bold text-orange-400">0</div>
                    <div className="text-xs text-gray-400">Badges</div>
                  </div>
                  <div className="bg-orange-900/30 p-2 rounded">
                    <div className="text-lg font-bold text-orange-400">0</div>
                    <div className="text-xs text-gray-400">Pontos</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">🚀 Início Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/modules/1">
              <Button variant="outline" className="w-full justify-start" size="sm">
                📚 Começar Módulo 1
              </Button>
            </Link>
            {!session && (
              <Link href="/auth">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  🔐 Fazer Login
                </Button>
              </Link>
            )}
            {session && (
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  📊 Ver Dashboard
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}