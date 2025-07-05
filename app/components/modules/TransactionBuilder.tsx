'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Separator } from '@/app/components/ui/separator'
import { 
  Send, 
  Calculator, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  TrendingUp
} from 'lucide-react'
import { Transaction } from '@/app/types'

interface TransactionBuilderProps {
  walletAddress?: string
  walletBalance?: number
  onTransactionSent?: (transaction: Transaction) => void
}

/**
 * Componente para construir e enviar transações Bitcoin
 * Inclui seleção de taxas e educação sobre confirmações
 */
export default function TransactionBuilder({ 
  walletAddress, 
  walletBalance = 0.01, 
  onTransactionSent 
}: TransactionBuilderProps) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedFee, setSelectedFee] = useState<'low' | 'medium' | 'high'>('medium')
  const [isSending, setIsSending] = useState(false)
  const [transactionSent, setTransactionSent] = useState<Transaction | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Configurações de taxa (sat/vB)
  const feeRates = {
    low: { rate: 2, label: 'Baixa', time: '30-60 min', icon: Clock },
    medium: { rate: 5, label: 'Média', time: '10-30 min', icon: TrendingUp },
    high: { rate: 10, label: 'Alta', time: '1-10 min', icon: Zap }
  }

  // Calcula a taxa estimada (assumindo ~200 vB para transação P2WPKH)
  const estimatedSize = 200 // vB
  const calculateFee = (rate: number) => {
    const feeInSats = estimatedSize * rate
    return feeInSats / 100000000 // Convert to sBTC
  }

  const selectedFeeRate = feeRates[selectedFee]
  const estimatedFee = calculateFee(selectedFeeRate.rate)
  const totalAmount = parseFloat(amount || '0') + estimatedFee

  const validateTransaction = () => {
    if (!recipient.trim()) return 'Endereço de destino é obrigatório'
    if (!recipient.startsWith('tb1')) return 'Endereço deve ser Signet (tb1...)'
    if (!amount || parseFloat(amount) <= 0) return 'Valor deve ser maior que zero'
    if (totalAmount > walletBalance) return 'Saldo insuficiente'
    return null
  }

  const sendTransaction = async () => {
    const error = validateTransaction()
    if (error) {
      alert(error)
      return
    }

    setIsSending(true)
    
    // Simula envio da transação
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock transaction data
    const mockTransaction: Transaction = {
      txId: `${Math.random().toString(16).substr(2, 8)}${'a'.repeat(56)}`,
      amount: parseFloat(amount),
      fee: estimatedFee,
      inputs: [{
        txId: `${Math.random().toString(16).substr(2, 8)}${'b'.repeat(56)}`,
        outputIndex: 0,
        scriptSig: 'mock_script_sig',
        sequence: 0xffffffff
      }],
      outputs: [{
        value: parseFloat(amount),
        scriptPubKey: 'mock_script_pub_key',
        address: recipient
      }],
      confirmations: 0
    }
    
    setTransactionSent(mockTransaction)
    onTransactionSent?.(mockTransaction)
    setIsSending(false)
  }

  return (
    <div className="space-y-6">
      {/* Informações da Carteira */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Construtor de Transações
          </CardTitle>
          <CardDescription>
            Envie sBTC na rede Signet com controle total sobre as taxas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm text-muted-foreground">Seu Endereço</Label>
              <p className="font-mono text-sm break-all">
                {walletAddress || 'tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Saldo Disponível</Label>
              <p className="font-medium">{walletBalance} sBTC</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Construtor de Transação */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Transação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Endereço de Destino */}
          <div className="space-y-2">
            <Label>Endereço de Destino</Label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Deve ser um endereço Signet (começando com 'tb1')
            </p>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label>Valor (sBTC)</Label>
            <Input
              type="number"
              step="0.00001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.005"
            />
          </div>

          {/* Seleção de Taxa */}
          <div className="space-y-3">
            <Label>Nível de Taxa</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(feeRates).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedFee(key as 'low' | 'medium' | 'high')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedFee === key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`h-4 w-4 ${
                        selectedFee === key ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <div className="text-center">
                        <div className="font-medium text-sm">{config.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {config.rate} sat/vB
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {config.time}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Resumo da Transação */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Valor a enviar:</span>
              <span>{amount || '0'} sBTC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxa estimada:</span>
              <span>{estimatedFee.toFixed(8)} sBTC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tamanho estimado:</span>
              <span>{estimatedSize} vB</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{totalAmount.toFixed(8)} sBTC</span>
            </div>
          </div>

          {/* Educação sobre Taxas */}
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Calculator className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Como funciona:</strong> Taxa = Tamanho × Rate (sat/vB). 
              Exemplo: 200 vB × 5 sat/vB = 1.000 satoshis = 0.00001 sBTC
            </AlertDescription>
          </Alert>

          {/* Botão de Envio */}
          <Button
            onClick={sendTransaction}
            disabled={isSending || !!validateTransaction()}
            className="w-full"
          >
            {isSending ? 'Enviando...' : 'Enviar Transação'}
          </Button>

          {/* Erro de Validação */}
          {validateTransaction() && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {validateTransaction()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Transação Enviada */}
      {transactionSent && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Transação Enviada!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ID da Transação</Label>
              <div className="p-2 bg-white dark:bg-gray-800 rounded font-mono text-sm break-all border">
                {transactionSent.txId}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Valor Enviado</Label>
                <p className="font-medium">{transactionSent.amount} sBTC</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Taxa Paga</Label>
                <p className="font-medium">{transactionSent.fee.toFixed(8)} sBTC</p>
              </div>
            </div>
            
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Agora você pode acompanhar sua transação no mempool.space/signet usando o ID acima.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}