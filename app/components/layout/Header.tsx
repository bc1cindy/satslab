'use client'

import Link from 'next/link'
import { Bitcoin, LogIn, LogOut, Crown, Menu } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  // Check if we're in Pro area
  const isProArea = pathname?.startsWith('/pro')

  return (
    <header className="bg-slate-900 shadow-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Bitcoin className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-orange-500">
              SatsLab{isProArea ? '' : ' Pro'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => document.getElementById('conteudo-curso')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-300 hover:text-orange-500 font-medium"
            >
              Módulos
            </button>
            
            {status === 'authenticated' && !isProArea && (
              <Link href="/pro">
                <Button size="sm" variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  Pro
                </Button>
              </Link>
            )}
            
            {status === 'authenticated' ? (
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            ) : (
              <Link href="/auth">
                <Button size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6 text-gray-300" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
            <nav className="flex flex-col gap-4 pt-4">
              <button 
                onClick={() => {
                  document.getElementById('conteudo-curso')?.scrollIntoView({ behavior: 'smooth' })
                  setMobileMenuOpen(false)
                }}
                className="text-gray-300 hover:text-orange-500 font-medium text-left"
              >
                Módulos
              </button>
              
              {status === 'authenticated' && !isProArea && (
                <Link href="/pro" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white w-full justify-start">
                    <Crown className="w-4 h-4 mr-2" />
                    Pro
                  </Button>
                </Link>
              )}
              
              {status === 'authenticated' ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white w-full justify-start"
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              ) : (
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white w-full justify-start">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}