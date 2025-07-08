'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Copy, Check, Wallet, ArrowRight, ExternalLink, Clock, CheckCircle } from 'lucide-react'

interface FaucetTransaction {
  txid: string
  address: string
  amount: number
  timestamp: number
  status: 'pending' | 'confirmed'
}

interface SignetFaucetProps {
  onTransactionGenerated?: (txid: string) => void
}

export default function SignetFaucet({ onTransactionGenerated }: SignetFaucetProps = {}) {
  const [address, setAddress] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)
  const [transaction, setTransaction] = useState<FaucetTransaction | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Simula transações já processadas (para demonstração)
  const [processedTransactions] = useState<FaucetTransaction[]>([
    {
      txid: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
      address: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
      amount: 0.01,
      timestamp: Date.now() - 1800000, // 30 min ago
      status: 'confirmed'
    }
  ])

  const validateAddress = (addr: string): boolean => {
    const cleanAddr = addr.trim()
    
    // Validação básica para endereços Signet
    if (!cleanAddr.startsWith('tb1') && !cleanAddr.startsWith('2') && 
        !cleanAddr.startsWith('m') && !cleanAddr.startsWith('n')) {
      return false
    }
    
    // Validação de comprimento para bech32 (tb1)
    if (cleanAddr.startsWith('tb1')) {
      return cleanAddr.length >= 42 && cleanAddr.length <= 90
    }
    
    return true
  }

  const generateTxid = (): string => {
    return Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')
  }

  const handleRequest = async () => {
    setError('')
    
    if (!address.trim()) {
      setError('Por favor, insira um endereço válido')
      return
    }
    
    if (!validateAddress(address)) {
      setError('Endereço inválido. Use um endereço Signet válido (tb1, 2, m, ou n)')
      return
    }
    
    // Verifica se já existe uma transação recente para este endereço
    const recentTx = processedTransactions.find(
      tx => tx.address === address && Date.now() - tx.timestamp < 3600000 // 1 hour
    )
    
    if (recentTx) {
      setError('Este endereço já recebeu sBTC recentemente. Aguarde 1 hora para solicitar novamente.')
      return
    }
    
    setIsRequesting(true)
    
    // Simula delay do processamento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newTransaction: FaucetTransaction = {
      txid: generateTxid(),
      address: address.trim(),
      amount: 0.01, // 0.01 sBTC padrão
      timestamp: Date.now(),
      status: 'pending'
    }
    
    setTransaction(newTransaction)
    setIsRequesting(false)
    
    // Chama o callback para notificar o TaskSystem
    if (onTransactionGenerated) {
      onTransactionGenerated(newTransaction.txid)
    }
    
    // Simula confirmação após 30 segundos
    setTimeout(() => {
      setTransaction(prev => prev ? { ...prev, status: 'confirmed' } : null)
    }, 30000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }


  return (
    <div className="space-y-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Wallet className="h-6 w-6 mr-3 text-orange-500" />
            Faucet Signet Educacional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              💡 <strong>Faucet Educacional:</strong> Receba 0.01 sBTC gratuito para aprender sobre Bitcoin na rede Signet.
              Esta é uma simulação educativa que gera transações realistas para fins de aprendizado.
            </p>
          </div>

          {!transaction ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Endereço Signet
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Cole sua chave pública aqui"
                  className="bg-gray-800 border-gray-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleRequest()
                    }
                  }}
                />
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleRequest}
                disabled={isRequesting || !address.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isRequesting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Solicitar 0.01 sBTC
                  </>
                )}
              </Button>

              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="font-medium text-white mb-2">📋 Regras do Faucet:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Máximo 0.01 sBTC por endereço a cada hora</li>
                  <li>Apenas endereços Signet válidos</li>
                  <li>Transações levam alguns segundos para aparecer</li>
                  <li>Confirmação leva cerca de 30 segundos</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  <strong>Sucesso!</strong> Transação criada. Os sBTC serão creditados em breve.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-white">📄 Detalhes da Transação</h4>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-400">Status:</span>
                    <div className="flex items-center mt-1">
                      {transaction.status === 'pending' ? (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-yellow-400">Pendente</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-green-400">Confirmada</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">Valor:</span>
                    <p className="font-mono text-orange-400">{transaction.amount} sBTC</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">Hash da Transação (TXID):</span>
                    <div className="bg-gray-700 rounded p-2 mt-1">
                      <p className="font-mono text-xs break-all text-white">{transaction.txid}</p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(transaction.txid)}
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar TXID
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setTransaction(null)
                    setAddress('')
                    setError('')
                  }}
                  variant="outline"
                  className="border-gray-600"
                >
                  Nova Solicitação
                </Button>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <p className="text-orange-300 text-sm">
                  🎯 <strong>Sucesso!</strong> O TXID foi automaticamente preenchido no campo da tarefa. 
                  {onTransactionGenerated ? 'Agora você pode validar a transação!' : 'Use este TXID na tarefa seguinte para verificar sua transação!'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}