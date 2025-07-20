'use client'

import Link from 'next/link'
import { Bitcoin, LogIn, LogOut, Crown } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useSession, signOut } from 'next-auth/react'

export function Header() {
  const { data: session, status } = useSession()
  
  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-slate-900 shadow-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Bitcoin className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-orange-500">SatsLab Pro</span>
          </Link>

          <nav className="flex items-center gap-4">
            <button 
              onClick={() => document.getElementById('conteudo-curso')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-300 hover:text-orange-500 font-medium"
            >
              Módulos
            </button>
            
            {status === 'authenticated' && (
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
        </div>
      </div>
    </header>
  )
}