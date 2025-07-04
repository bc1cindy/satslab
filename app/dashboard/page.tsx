'use client'

import { useRequireAuth } from '@/app/components/auth/AuthProvider'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  const { session, isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // useRequireAuth will redirect
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-orange-600 mb-2">
                SatsLab Dashboard
              </h1>
              <p className="text-gray-600">
                Bem-vindo de volta! Continue sua jornada Bitcoin.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Chave Pública:</p>
              <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                {session.user.publicKey.slice(0, 20)}...
              </p>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">📚 Progresso Geral</h3>
            <div className="text-3xl font-bold text-orange-600 mb-2">0/7</div>
            <p className="text-gray-600">Módulos Completados</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">🏆 Badges</h3>
            <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
            <p className="text-gray-600">Badges Conquistados</p>
            <Link href="/badges" className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-2 inline-block">
              Ver todos →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">⚡ Carteiras</h3>
            <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
            <p className="text-gray-600">Carteiras Criadas</p>
            <Link href="/wallets" className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-2 inline-block">
              Gerenciar →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">🎓 Módulos Disponíveis</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 1, title: "Introdução ao Bitcoin", desc: "Conceitos básicos e Signet", available: true, completed: false },
              { id: 2, title: "Segurança e Carteiras", desc: "Chaves privadas e carteiras", available: true, completed: false },
              { id: 3, title: "Transações na Signet", desc: "Enviar Bitcoin e taxas", available: true, completed: false },
              { id: 4, title: "Mineração no Bitcoin", desc: "Prova de trabalho", available: true, completed: false },
              { id: 5, title: "Lightning Network", desc: "Pagamentos instantâneos", available: true, completed: false },
              { id: 6, title: "Taproot e Ordinals", desc: "Tecnologias avançadas", available: true, completed: false },
              { id: 7, title: "Multisig e HD Wallets", desc: "Carteiras avançadas", available: true, completed: false },
            ].map((module) => (
              <div 
                key={module.id} 
                className={`p-4 rounded-lg border-2 ${
                  module.completed 
                    ? 'border-green-200 bg-green-50' 
                    : module.available 
                      ? 'border-orange-200 bg-orange-50 hover:border-orange-300' 
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{module.title}</h3>
                  {module.completed && <span className="text-green-600">✓</span>}
                </div>
                <p className="text-sm text-gray-600 mb-3">{module.desc}</p>
                <Link href={`/modules/${module.id}`}>
                  <Button 
                    size="sm" 
                    variant={module.completed ? "outline" : "default"}
                    className="w-full"
                    disabled={!module.available}
                  >
                    {module.completed ? 'Revisar' : 'Iniciar'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium">
            ← Voltar para Home
          </Link>
        </div>
      </div>
    </main>
  )
}