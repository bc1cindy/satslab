'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProAccess?: boolean
  redirectTo?: string
}

export function NextAuthProtectedRoute({ 
  children, 
  requireProAccess = false, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isCheckingPro, setIsCheckingPro] = useState(false)
  const [hasProAccess, setHasProAccess] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      // Wait for session to load
      if (status === 'loading') return

      // Check if user is authenticated
      if (status === 'unauthenticated' || !session) {
        const currentPath = window.location.pathname
        router.push(`${redirectTo}?next=${encodeURIComponent(currentPath)}`)
        return
      }

      // Check Pro access if required
      if (requireProAccess && session.user?.email) {
        setIsCheckingPro(true)
        try {
          // Check Pro access via API
          const response = await fetch('/api/user/check-pro-access')
          const data = await response.json()
          
          setHasProAccess(data.hasProAccess)
          
          if (!data.hasProAccess) {
            router.push(`/checkout?email=${encodeURIComponent(session.user.email)}`)
          }
        } catch (error) {
          console.error('Error checking Pro access:', error)
          setHasProAccess(false)
          router.push('/checkout')
        } finally {
          setIsCheckingPro(false)
        }
      }
    }

    checkAccess()
  }, [session, status, router, requireProAccess, redirectTo])

  // Show loading state
  if (status === 'loading' || (requireProAccess && isCheckingPro)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">
                  {status === 'loading' ? 'Carregando...' : 'Verificando acesso Pro...'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // User is not authenticated
  if (status === 'unauthenticated' || !session) {
    return null
  }

  // User doesn't have Pro access when required
  if (requireProAccess && hasProAccess === false) {
    return null
  }

  // User has access
  return <>{children}</>
}