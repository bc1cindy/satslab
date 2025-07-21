'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user?.email) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/verify')
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      } catch (error) {
        console.error('Admin check failed:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [session, status])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h1>
          <p className="text-gray-400 mb-4">Você precisa estar logado para acessar esta página.</p>
          <Link href="/" className="text-orange-500 hover:text-orange-400">
            Voltar ao Site
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-400 mb-4">
            Apenas administradores podem acessar esta página.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Usuário atual: {session.user?.email || 'N/A'}
          </p>
          <Link href="/" className="text-orange-500 hover:text-orange-400">
            Voltar ao Site
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">
            🔧 Admin Dashboard
          </h1>
          <p className="text-gray-300">
            Bem-vindo, {session.user?.email || 'Admin'}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Acesso Administrativo Confirmado</h2>
            <p className="text-gray-400 mb-6">
              Você tem acesso total ao painel administrativo.
            </p>
            
            <div className="space-y-4">
              <Link 
                href="/admin/verify" 
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                Verificar Analytics
              </Link>
              
              <Link 
                href="/" 
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                Voltar ao Site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}