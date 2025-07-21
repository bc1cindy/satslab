'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ProUser {
  email: string
  has_pro_access: boolean
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

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [proUsersData, setProUsersData] = useState<ProUsersData | null>(null)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [addingUser, setAddingUser] = useState(false)
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)

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
      console.error('Failed to fetch Pro users list:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics-data')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.platformStats) {
          setPlatformStats(data.platformStats)
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      // Set fallback data
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
        await fetchProUsers()
        alert('Usuário Pro adicionado com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to add Pro user:', error)
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
        await fetchProUsers()
        alert('Acesso Pro removido com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to remove Pro user:', error)
      alert('Erro ao remover usuário')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

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
        
        // If admin, fetch all data
        if (data.isAdmin) {
          await Promise.all([
            fetchProUsers(),
            fetchAnalytics()
          ])
        }
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">
            🔧 Admin Dashboard
          </h1>
          <p className="text-gray-300">
            Bem-vindo, {session.user?.email || 'Admin'}
          </p>
        </div>

        {/* Platform Statistics */}
        {platformStats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">📊 Estatísticas da Plataforma</h2>
            
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{platformStats.total_users}</div>
                  <div className="text-sm text-gray-400">👥 Total Usuários</div>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{platformStats.active_users_24h}</div>
                  <div className="text-sm text-gray-400">⚡ Ativos 24h</div>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{formatDuration(platformStats.avg_session_duration)}</div>
                  <div className="text-sm text-gray-400">⏱️ Sessão Média</div>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{platformStats.total_sessions}</div>
                  <div className="text-sm text-gray-400">📈 Total Sessões</div>
                </div>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{platformStats.total_badges_earned}</div>
                  <div className="text-sm text-gray-400">🏆 Badges Conquistados</div>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{platformStats.total_wallets_created}</div>
                  <div className="text-sm text-gray-400">💳 Carteiras Criadas</div>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{platformStats.total_modules_completed}</div>
                  <div className="text-sm text-gray-400">📚 Módulos Completados</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pro Users Management */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">👑 Gerenciamento de Usuários Pro</h2>
          
          {/* Add User Form */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Adicionar Usuário Pro</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                onKeyDown={(e) => e.key === 'Enter' && addProUser()}
              />
              <button 
                onClick={addProUser}
                disabled={!newUserEmail || addingUser}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                {addingUser ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>

          {/* Pro Users Stats */}
          {proUsersData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{proUsersData.total}</div>
                <div className="text-sm text-gray-400">Total Pro</div>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{proUsersData.active}</div>
                <div className="text-sm text-gray-400">Ativos</div>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{proUsersData.expired}</div>
                <div className="text-sm text-gray-400">Expirados</div>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">{proUsersData.expiring_soon}</div>
                <div className="text-sm text-gray-400">Expirando</div>
              </div>
            </div>
          )}

          {/* Users List */}
          {proUsersData && proUsersData.users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3">Email</th>
                    <th className="text-left py-2 px-3">Expira em</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {proUsersData.users.map((user) => (
                    <tr key={user.email} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-2 px-3 font-medium">{user.email}</td>
                      <td className="py-2 px-3">{formatDate(user.pro_expires_at)}</td>
                      <td className="py-2 px-3">
                        {user.is_expired ? (
                          <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs">
                            Expirado ({Math.abs(user.days_remaining)} dias)
                          </span>
                        ) : user.expires_soon ? (
                          <span className="px-2 py-1 bg-orange-900 text-orange-300 rounded text-xs">
                            {user.days_remaining} dias restantes
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">
                            {user.days_remaining} dias restantes
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => removeProUser(user.email)}
                          className="text-red-400 hover:text-red-300 text-xs underline"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum usuário Pro encontrado</p>
              <p className="text-xs text-gray-600 mt-1">
                Usuários Pro aparecerão aqui quando adicionados
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/verify" 
            className="block bg-orange-600 hover:bg-orange-700 text-white text-center py-3 px-4 rounded-md transition-colors"
          >
            📊 Verificar Analytics
          </Link>
          
          <Link 
            href="/" 
            className="block bg-gray-700 hover:bg-gray-600 text-white text-center py-3 px-4 rounded-md transition-colors"
          >
            🏠 Voltar ao Site
          </Link>
        </div>
      </div>
    </div>
  )
}