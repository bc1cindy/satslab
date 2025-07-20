import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Bitcoin, User, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"

// Placeholder hook - this would need to be implemented
const useAuth = () => {
  return {
    signOut: async () => {
      console.log('Sign out placeholder')
    }
  }
}

interface ProHeaderProps {
  user?: {
    email: string
    isProActive: boolean
  }
}

export function ProHeader({ user }: ProHeaderProps) {
  const { signOut } = useAuth()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
  }

  // Check if we're on the Pro page
  const isProPage = pathname === '/pro'
  const isPro = user?.isProActive || isProPage

  // Debug log (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Header debug:', { hasUser: !!user, isProPage, isPro })
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Bitcoin className="h-8 w-8 text-orange-500" />
            <span className="text-orange-500 font-bold text-xl">
              SatsLab<span className="text-orange-600">Pro</span>
            </span>
          </Link>

          {/* Navigation - Hide completely for Pro users */}
          {!isPro && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/aulas" 
                className="text-gray-300 hover:text-orange-500 transition-colors"
              >
                Aulas
              </Link>
              <Link 
                href="/checkout" 
                className="text-gray-300 hover:text-orange-500 transition-colors"
              >
                Assinar Pro
              </Link>
              <Link 
                href="https://satslab.org" 
                target="_blank"
                className="text-gray-300 hover:text-orange-500 transition-colors"
              >
                Site Principal
              </Link>
            </nav>
          )}

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {isPro ? (
              // Pro user - only show logout button
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="text-gray-400 hover:text-gray-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            ) : user ? (
              // Regular user - show full user info
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{user.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // No user - show login/signup
              <div className="flex items-center space-x-3">
                <Link href="/auth">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/checkout">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Assinar Pro
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}