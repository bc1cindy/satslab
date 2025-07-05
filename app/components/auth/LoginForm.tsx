'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { BitcoinAuth } from '@/app/lib/auth/bitcoin-auth'
import { generateKeyPair, SIGNET_NETWORK } from '@/app/lib/bitcoin/crypto-mock'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [privateKey, setPrivateKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const session = await BitcoinAuth.authenticate(privateKey)
      if (session) {
        onSuccess?.()
        router.push('/dashboard')
      } else {
        setError('Falha na autenticação. Verifique sua chave privada.')
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError('Erro durante a autenticação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateDemoKey = () => {
    const keyPair = generateKeyPair(SIGNET_NETWORK)
    setPrivateKey(keyPair.privateKey)
    setShowDemo(true)
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Login com Chave Privada
        </h2>
        <p className="text-gray-300">
          Use sua chave privada Bitcoin para acessar o SatsLab
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="privateKey" className="block text-sm font-medium text-white mb-2">
            Chave Privada (WIF Format)
          </label>
          <textarea
            id="privateKey"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Ex: L1aW4aubDFB7yfras2S1mN3bqg9nwySY8nkoLmJz5i5K..."
            className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none placeholder-gray-400"
            rows={3}
            required
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {showDemo && (
          <div className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-300 px-4 py-3 rounded text-sm">
            <strong>⚠️ Chave Demo Gerada!</strong><br />
            Esta é uma chave de demonstração. Salve-a com segurança se quiser manter seu progresso.
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !privateKey.trim()}
          className="w-full"
        >
          {isLoading ? 'Autenticando...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-300 mb-4">
            Não tem uma chave privada?
          </p>
          <Button
            variant="outline"
            onClick={generateDemoKey}
            className="w-full"
          >
            🎲 Gerar Chave Demo
          </Button>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-400 space-y-2">
        <div className="bg-blue-900/30 p-3 rounded">
          <h4 className="font-semibold text-blue-300 mb-1">🔐 Sobre Segurança:</h4>
          <ul className="text-blue-300 space-y-1">
            <li>• Sua chave privada nunca sai do seu dispositivo</li>
            <li>• Usamos apenas a chave pública para identificação</li>
            <li>• Recomendamos usar chaves dedicadas ao SatsLab</li>
            <li>• Esta é a rede Signet (Bitcoin de teste)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}