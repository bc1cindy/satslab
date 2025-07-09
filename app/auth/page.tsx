'use client'

import { useState } from 'react'
import { LoginForm } from '@/app/components/auth/LoginForm'
import { IPLoginForm } from '@/app/components/auth/IPLoginForm'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'
import { Key, Wifi } from 'lucide-react'

export default function AuthPage() {
  const [loginMode, setLoginMode] = useState<'ip' | 'bitcoin'>('ip')

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
              SatsLab
            </h1>
          </Link>
          <p className="text-gray-300 mt-2">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Login Mode Selector */}
        <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
          <Button
            variant={loginMode === 'ip' ? 'default' : 'ghost'}
            onClick={() => setLoginMode('ip')}
            className={`flex-1 flex items-center gap-2 ${
              loginMode === 'ip' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wifi className="w-4 h-4" />
            Acesso por IP
          </Button>
          <Button
            variant={loginMode === 'bitcoin' ? 'default' : 'ghost'}
            onClick={() => setLoginMode('bitcoin')}
            className={`flex-1 flex items-center gap-2 ${
              loginMode === 'bitcoin' 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            Chave Bitcoin
          </Button>
        </div>

        {/* Render appropriate form */}
        {loginMode === 'ip' ? <IPLoginForm /> : <LoginForm />}

        <div className="text-center mt-6">
          <Link 
            href="/modules/1" 
            className="text-orange-400 hover:text-orange-300 text-sm"
          >
            ← Voltar para Módulo 1
          </Link>
        </div>
      </div>
    </main>
  )
}