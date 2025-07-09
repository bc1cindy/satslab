'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { IPAuth } from '@/app/lib/auth/ip-auth'
import { Wifi, Check } from 'lucide-react'

interface IPLoginFormProps {
  onSuccess?: () => void
}

export function IPLoginForm({ onSuccess }: IPLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userIP, setUserIP] = useState<string>('')

  // Auto-login when component mounts
  useEffect(() => {
    handleAutoLogin()
  }, [])

  const handleAutoLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Get IP first for display
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        setUserIP(data.ip)
      } catch {
        setUserIP('127.0.0.1')
      }

      const session = await IPAuth.authenticateByIP()
      if (session) {
        setSuccess(true)
        setTimeout(() => {
          window.location.href = '/modules'
        }, 1500)
      } else {
        setError('Falha na autenticação por IP')
      }
    } catch (err) {
      console.error('IP Authentication error:', err)
      setError('Erro na autenticação automática')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualLogin = () => {
    handleAutoLogin()
  }

  if (success) {
    return (
      <div className="bg-green-900/30 border border-green-500/50 p-6 rounded-lg text-center">
        <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-green-300 mb-2">
          Autenticado com sucesso!
        </h3>
        <p className="text-green-200 text-sm mb-4">
          Identificado pelo IP: {userIP}
        </p>
        <p className="text-green-200 text-sm">
          Redirecionando para o dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
      <div className="text-center mb-6">
        <Wifi className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Acesso Automático por IP
        </h3>
        <p className="text-gray-400 text-sm">
          Seu progresso será salvo usando seu endereço IP
        </p>
        {userIP && (
          <p className="text-blue-300 text-sm mt-2">
            Seu IP: {userIP}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm mb-4">
          {error}
        </div>
      )}

      <Button
        onClick={handleManualLogin}
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600"
      >
        {isLoading ? 'Conectando...' : 'Entrar com IP'}
      </Button>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="bg-gray-800 p-3 rounded text-xs space-y-2">
          <div className="text-gray-300 font-medium">💡 Como funciona:</div>
          <ul className="text-gray-400 space-y-1">
            <li>• Seu progresso é vinculado ao seu endereço IP</li>
            <li>• Não precisamos de chaves ou senhas</li>
            <li>• Funciona automaticamente em qualquer dispositivo na sua rede</li>
            <li>• Dados são salvos de forma segura no Supabase</li>
          </ul>
        </div>
      </div>
    </div>
  )
}