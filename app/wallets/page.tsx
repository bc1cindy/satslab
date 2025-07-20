'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/app/components/auth/AuthProvider'
import { createClient } from '@/app/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Wallet, Copy, ExternalLink, Plus, Calendar, Coins, RefreshCw } from 'lucide-react'
import { formatDateBR } from '@/app/lib/utils'

interface WalletData {
  id: string
  address: string
  public_key: string
  network: string
  balance: number
  created_at: string
  updated_at: string
}

export default function WalletsPage() {
  const { session, isLoading } = useRequireAuth()
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [walletsLoading, setWalletsLoading] = useState(true)
  const [copied, setCopied] = useState<string>('')

  useEffect(() => {
    const loadWallets = async () => {
      if (session?.user.id) {
        try {
          setWalletsLoading(true)
          const supabase = createClient()
          const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })

          if (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error loading wallets:', error)
            }
          } else {
            setWallets(data || [])
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error loading wallets:', error)
          }
        } finally {
          setWalletsLoading(false)
        }
      }
    }

    if (session?.user.id) {
      loadWallets()
    }
  }, [session?.user.id])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to copy:', err)
      }
    }
  }

  const formatAddress = (address: string) => {
    if (address.length <= 16) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const refreshBalance = async (walletId: string) => {
    // Simulated balance refresh - in a real app this would call the mempool API
    if (process.env.NODE_ENV === 'development') {
      console.log('Refreshing balance for wallet:', walletId)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // useRequireAuth will redirect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar para Dashboard</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-green-500" />
              <span className="text-lg font-semibold">Minhas Carteiras</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-500 mb-2">
            💼 Gerenciador de Carteiras
          </h1>
          <p className="text-gray-300 mb-6">
            Carteiras Bitcoin criadas durante seu aprendizado na rede Signet
          </p>
          <div className="inline-flex items-center space-x-4 bg-gray-900 rounded-lg px-6 py-3 border border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {walletsLoading ? '...' : wallets.length}
              </div>
              <div className="text-sm text-gray-400">Carteiras Criadas</div>
            </div>
            <div className="w-px h-8 bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">Signet</div>
              <div className="text-sm text-gray-400">Rede de Teste</div>
            </div>
          </div>
        </div>

        {/* Create Wallet CTA */}
        <div className="mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Criar Nova Carteira
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Aprenda sobre carteiras Bitcoin criando uma nova no Módulo 2
                  </p>
                </div>
                <Link href="/modules/2">
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Carteira
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallets List */}
        {walletsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando carteiras...</p>
          </div>
        ) : wallets.length > 0 ? (
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Wallet className="h-5 w-5 text-green-500 mr-2" />
                      Carteira Signet
                    </CardTitle>
                    <Badge variant="outline" className="border-green-500/50 text-green-400">
                      {wallet.network.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Endereço:</label>
                    <div className="flex items-center space-x-2 bg-gray-800 rounded px-3 py-2">
                      <code className="text-sm font-mono text-gray-300 flex-1">
                        {formatAddress(wallet.address)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(wallet.address, `address-${wallet.id}`)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copied === `address-${wallet.id}` ? '✓' : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-gray-400 hover:text-white"
                      >
                        <a
                          href={`https://mempool.space/signet/address/${wallet.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Saldo:</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-orange-400">
                          {(wallet.balance / 100000000).toFixed(8)} sBTC
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => refreshBalance(wallet.id)}
                          className="text-gray-400 hover:text-white"
                          title="Atualizar saldo"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Criada em {formatDateBR(wallet.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2 border-t border-gray-800">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400"
                    >
                      <a
                        href={`https://signetfaucet.com/`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        Obter sBTC (Faucet)
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 border-gray-700 text-gray-300 hover:border-orange-500 hover:text-orange-400"
                    >
                      <Link href="/modules/3">
                        Fazer Transação
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <Wallet className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Nenhuma carteira criada ainda
            </h3>
            <p className="text-gray-500 mb-6">
              Complete o Módulo 2 para criar sua primeira carteira Bitcoin!
            </p>
            <Link href="/modules/2">
              <Button className="bg-green-500 hover:bg-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Carteira
              </Button>
            </Link>
          </div>
        )}

        {/* Educational Info */}
        <div className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Wallet className="h-5 w-5 text-green-500 mr-2" />
            Sobre as Carteiras Signet
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">🔒 Segurança</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Estas são carteiras educacionais na rede Signet</li>
                <li>• sBTC não possui valor econômico real</li>
                <li>• Use apenas para aprendizado e testes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">🌐 Funcionalidades</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Receba sBTC gratuito via faucets</li>
                <li>• Pratique transações sem risco</li>
                <li>• Explore a blockchain Bitcoin com segurança</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}