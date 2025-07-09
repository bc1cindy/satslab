'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { BitcoinAuth } from '@/app/lib/auth/bitcoin-auth'
import { generateKeyPair, SIGNET_NETWORK } from '@/app/lib/bitcoin/bitcoin-crypto'
import { Copy, Check, Eye, EyeOff } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({}: LoginFormProps) {
  const [privateKey, setPrivateKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedKey, setGeneratedKey] = useState<{ private: string, public: string } | null>(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const session = await BitcoinAuth.authenticate(privateKey)
      if (session) {
        // Força um reload do AuthProvider
        window.location.href = '/modules'
      } else {
        setError('Falha na autenticação')
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError('Erro na autenticação')
    } finally {
      setIsLoading(false)
    }
  }

  const generateDemoKey = () => {
    const keyPair = generateKeyPair(SIGNET_NETWORK)
    setPrivateKey(keyPair.privateKey)
    setGeneratedKey({
      private: keyPair.privateKey,
      public: keyPair.publicKey
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="privateKey" className="block text-sm font-medium text-white mb-2">
            Chave Privada
          </label>
          <div className="relative">
            <textarea
              id="privateKey"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Cole sua chave privada Bitcoin aqui..."
              className="w-full px-3 py-2 pr-10 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none placeholder-gray-400"
              rows={3}
              required
              style={{ 
                filter: showPrivateKey ? 'none' : 'blur(1px)',
                fontFamily: showPrivateKey ? 'monospace' : 'monospace'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
            >
              {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {generatedKey && (
          <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-300">🔑 Chaves Geradas</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(generatedKey.private)}
                className="text-blue-300 hover:text-blue-200 p-1"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-blue-400 font-medium">Chave Pública:</span>
                <div className="font-mono text-xs text-blue-200 break-all bg-blue-900/50 p-2 rounded mt-1">
                  {generatedKey.public}
                </div>
              </div>
              <div className="text-yellow-300 text-xs">
                ⚠️ Salve sua chave privada para recuperar o acesso!
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !privateKey.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-700 text-center">
        <p className="text-sm text-gray-400 mb-3">
          Não tem uma chave?
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={generateDemoKey}
          className="w-full border-gray-600 text-gray-300"
        >
          Gerar Chave Demo
        </Button>
      </div>

      {generatedKey && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="bg-gray-800 p-3 rounded text-xs space-y-2">
            <div className="text-gray-300 font-medium">💡 Como funciona:</div>
            <ul className="text-gray-400 space-y-1">
              <li>• Sua chave privada gera uma chave pública única</li>
              <li>• A chave pública é seu identificador no SatsLab</li>
              <li>• Guarde a chave privada para manter o acesso</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}