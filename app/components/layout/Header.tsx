'use client'

import { useAuth, getUserIdentifier } from '@/app/components/auth/AuthProvider'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Header() {
  const { session, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-orange-600">SatsLab</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/modules" 
              className="text-gray-600 hover:text-orange-600 font-medium"
            >
              Módulos
            </Link>
            {session && (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-orange-600 font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/badges" 
                  className="text-gray-600 hover:text-orange-600 font-medium"
                >
                  Badges
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-gray-500">Logado como:</p>
                  <p className="text-xs font-mono text-gray-700">
                    {getUserIdentifier(session)?.slice(0, 12)}...
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}