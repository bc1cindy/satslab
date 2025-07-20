'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProAccess?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requireProAccess = false, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, loading, checkProAccess } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      if (!loading) {
        if (!user) {
          // Usuário não está logado
          const currentPath = window.location.pathname
          router.push(`${redirectTo}?next=${encodeURIComponent(currentPath)}`)
          return
        }

        if (requireProAccess) {
          const hasProAccess = await checkProAccess()
          if (!hasProAccess) {
            // Usuário logado mas sem acesso Pro
            router.push(`/checkout?email=${encodeURIComponent(user.email || '')}`)
            return
          }
        }
      }
    }

    checkAccess()
  }, [user, loading, router, requireProAccess, redirectTo, checkProAccess])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Verificando acesso...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Redirecionamento em andamento
  }

  // Nota: O check de Pro access agora é feito de forma assíncrona no useEffect

  return <>{children}</>
}