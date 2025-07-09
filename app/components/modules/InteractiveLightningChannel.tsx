'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Progress } from '@/app/components/ui/progress'
import { 
  Zap, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  DollarSign,
  Clock,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface ChannelState {
  capacity: number
  aliceBalance: number
  bobBalance: number
  status: 'closed' | 'opening' | 'active' | 'closing'
  feeRate: number
  transactions: ChannelTransaction[]
}

interface ChannelTransaction {
  id: string
  from: 'alice' | 'bob'
  to: 'alice' | 'bob'
  amount: number
  description: string
  timestamp: number
  status: 'pending' | 'completed' | 'failed'
}

interface InteractiveLightningChannelProps {
  onChannelStateChange?: (state: ChannelState) => void
  onTransactionCompleted?: (transaction: ChannelTransaction) => void
}

export default function InteractiveLightningChannel({
  onChannelStateChange,
  onTransactionCompleted
}: InteractiveLightningChannelProps) {
  const [channelState, setChannelState] = useState<ChannelState>({
    capacity: 0,
    aliceBalance: 0,
    bobBalance: 0,
    status: 'closed',
    feeRate: 0.001,
    transactions: []
  })

  const [isSimulating, setIsSimulating] = useState(false)
  const [newCapacity, setNewCapacity] = useState(100000)
  const [aliceContribution, setAliceContribution] = useState(50000)
  const [transactionAmount, setTransactionAmount] = useState(1000)
  const [transactionFrom, setTransactionFrom] = useState<'alice' | 'bob'>('alice')
  const [transactionDescription, setTransactionDescription] = useState('')
  const [simulationSpeed, setSimulationSpeed] = useState(1000)

  // Update parent component when state changes
  useEffect(() => {
    onChannelStateChange?.(channelState)
  }, [channelState, onChannelStateChange])

  // Open channel
  const openChannel = async () => {
    if (aliceContribution > newCapacity) {
      alert('Contribuição de Alice não pode ser maior que a capacidade total')
      return
    }

    setChannelState(prev => ({
      ...prev,
      status: 'opening'
    }))

    // Simulate opening process
    await new Promise(resolve => setTimeout(resolve, simulationSpeed))

    setChannelState(prev => ({
      ...prev,
      capacity: newCapacity,
      aliceBalance: aliceContribution,
      bobBalance: newCapacity - aliceContribution,
      status: 'active',
      transactions: []
    }))
  }

  // Close channel
  const closeChannel = async () => {
    setChannelState(prev => ({
      ...prev,
      status: 'closing'
    }))

    await new Promise(resolve => setTimeout(resolve, simulationSpeed))

    setChannelState(prev => ({
      ...prev,
      status: 'closed',
      capacity: 0,
      aliceBalance: 0,
      bobBalance: 0
    }))
  }

  // Process transaction
  const processTransaction = async () => {
    if (channelState.status !== 'active') {
      alert('Canal deve estar ativo para processar transações')
      return
    }

    const fromBalance = transactionFrom === 'alice' ? channelState.aliceBalance : channelState.bobBalance
    
    if (transactionAmount > fromBalance) {
      alert(`${transactionFrom === 'alice' ? 'Alice' : 'Bob'} não tem saldo suficiente`)
      return
    }

    const transaction: ChannelTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      from: transactionFrom,
      to: transactionFrom === 'alice' ? 'bob' : 'alice',
      amount: transactionAmount,
      description: transactionDescription || `Pagamento de ${transactionAmount} sats`,
      timestamp: Date.now(),
      status: 'pending'
    }

    setChannelState(prev => ({
      ...prev,
      transactions: [...prev.transactions, transaction]
    }))

    setIsSimulating(true)
    
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, simulationSpeed / 2))

    // Update balances
    setChannelState(prev => ({
      ...prev,
      aliceBalance: transactionFrom === 'alice' 
        ? prev.aliceBalance - transactionAmount
        : prev.aliceBalance + transactionAmount,
      bobBalance: transactionFrom === 'alice'
        ? prev.bobBalance + transactionAmount
        : prev.bobBalance - transactionAmount,
      transactions: prev.transactions.map(t => 
        t.id === transaction.id ? { ...t, status: 'completed' } : t
      )
    }))

    onTransactionCompleted?.(transaction)
    setIsSimulating(false)
    setTransactionAmount(1000)
    setTransactionDescription('')
  }

  // Reset simulation
  const resetSimulation = () => {
    setChannelState({
      capacity: 0,
      aliceBalance: 0,
      bobBalance: 0,
      status: 'closed',
      feeRate: 0.001,
      transactions: []
    })
    setIsSimulating(false)
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + ' sats'
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'text-gray-500'
      case 'opening': case 'closing': return 'text-yellow-500'
      case 'active': return 'text-green-500'
      case 'pending': return 'text-blue-500'
      case 'completed': return 'text-green-500'
      case 'failed': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'closed': return <AlertTriangle className="w-4 h-4" />
      case 'opening': case 'closing': return <Clock className="w-4 h-4" />
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Channel Status */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <span className="text-white">Simulador de Canal Lightning</span>
            </div>
            <Badge variant="outline" className={`${getStatusColor(channelState.status)} border-current`}>
              {getStatusIcon(channelState.status)}
              {channelState.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Channel Visualization */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm text-gray-400">Alice</div>
                <div className="text-lg font-bold text-blue-400">
                  {formatAmount(channelState.aliceBalance)}
                </div>
              </div>

              <div className="flex-1 mx-6">
                <div className="relative">
                  <div className="h-8 bg-gray-700 rounded-full overflow-hidden">
                    {channelState.capacity > 0 && (
                      <>
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${(channelState.aliceBalance / channelState.capacity) * 100}%` }}
                        />
                        <div 
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ width: `${(channelState.bobBalance / channelState.capacity) * 100}%` }}
                        />
                      </>
                    )}
                  </div>
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="text-sm text-gray-400">Capacidade Total</div>
                    <div className="text-lg font-bold text-white">
                      {formatAmount(channelState.capacity)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm text-gray-400">Bob</div>
                <div className="text-lg font-bold text-green-400">
                  {formatAmount(channelState.bobBalance)}
                </div>
              </div>
            </div>

            {/* Channel Controls */}
            <div className="flex justify-center gap-4 mt-6">
              {channelState.status === 'closed' && (
                <Button
                  onClick={openChannel}
                  disabled={isSimulating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Abrir Canal
                </Button>
              )}
              
              {channelState.status === 'active' && (
                <Button
                  onClick={closeChannel}
                  disabled={isSimulating}
                  variant="destructive"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Fechar Canal
                </Button>
              )}
              
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Setup */}
      {channelState.status === 'closed' && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">⚙️ Configuração do Canal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity" className="text-gray-300">Capacidade Total (sats)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="aliceContribution" className="text-gray-300">Contribuição de Alice (sats)</Label>
                <Input
                  id="aliceContribution"
                  type="number"
                  value={aliceContribution}
                  onChange={(e) => setAliceContribution(Number(e.target.value))}
                  max={newCapacity}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Distribuição de Fundos</Label>
              <div className="mt-2 space-y-2">
                <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md">
                  <input
                    type="range"
                    min="0"
                    max={newCapacity}
                    step="1000"
                    value={aliceContribution}
                    onChange={(e) => setAliceContribution(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(aliceContribution / newCapacity) * 100}%, #374151 ${(aliceContribution / newCapacity) * 100}%, #374151 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Alice: {formatAmount(aliceContribution)}</span>
                  <span>Bob: {formatAmount(newCapacity - aliceContribution)}</span>
                </div>
              </div>
            </div>

            <Alert className="bg-blue-900/20 border-blue-500/30">
              <Info className="w-4 h-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong>Dica:</strong> Em canais Lightning reais, ambas as partes contribuem com fundos. 
                Alice contribui com {formatAmount(aliceContribution)} e Bob com {formatAmount(newCapacity - aliceContribution)}.
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-yellow-900/20 border border-yellow-500/30">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300">
                <strong>Taxa de Fechamento:</strong> Fechar um canal requer uma transação on-chain. 
                A taxa estimada é baseada na capacidade do canal (aprox. 0.1% = {Math.floor(newCapacity * 0.001)} sats).
                Para a tarefa, use esta taxa estimada.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Transaction Interface */}
      {channelState.status === 'active' && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">💸 Realizar Transação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="from" className="text-gray-300">De</Label>
                <select
                  id="from"
                  value={transactionFrom}
                  onChange={(e) => setTransactionFrom(e.target.value as 'alice' | 'bob')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                >
                  <option value="alice">Alice</option>
                  <option value="bob">Bob</option>
                </select>
              </div>
              <div>
                <Label htmlFor="amount" className="text-gray-300">Valor (sats)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(Number(e.target.value))}
                  max={transactionFrom === 'alice' ? channelState.aliceBalance : channelState.bobBalance}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-300">Descrição</Label>
                <Input
                  id="description"
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                  placeholder="Pagamento de teste"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={processTransaction}
                disabled={isSimulating || transactionAmount <= 0}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isSimulating ? 'Processando...' : 'Enviar Pagamento'}
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Saldo disponível:</span>
                <span className="font-bold">
                  {formatAmount(transactionFrom === 'alice' ? channelState.aliceBalance : channelState.bobBalance)}
                </span>
              </div>
            </div>

            <Alert className="bg-green-900/20 border-green-500/30">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-green-300">
                <strong>Vantagem:</strong> Transações dentro do canal são instantâneas e sem taxas de mineração!
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-orange-900/20 border border-orange-500/30">
              <DollarSign className="w-4 h-4 text-orange-400" />
              <AlertDescription className="text-orange-300">
                <strong>Taxa de Fechamento Estimada:</strong> {Math.floor(channelState.capacity * 0.001)} satoshis
                <br />
                <small>Esta taxa é necessária para fechar o canal e fazer a transação on-chain de volta ao Bitcoin.</small>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {channelState.transactions.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">📋 Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {channelState.transactions.map(transaction => (
                <div key={transaction.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                      </span>
                      <span className="font-medium text-white">
                        {transaction.from === 'alice' ? 'Alice' : 'Bob'} 
                        <ArrowRight className="w-4 h-4 inline mx-2" />
                        {transaction.to === 'alice' ? 'Alice' : 'Bob'}
                      </span>
                      <span className="text-yellow-400 font-bold">
                        {formatAmount(transaction.amount)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {formatTime(transaction.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{transaction.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Info */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">🎓 Como Funcionam os Canais Lightning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">Vantagens</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>✅ Transações instantâneas</li>
                  <li>✅ Sem taxas de mineração</li>
                  <li>✅ Capacidade ilimitada de transações</li>
                  <li>✅ Privacidade melhorada</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-2">Limitações</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>⚠️ Requer fundos bloqueados</li>
                  <li>⚠️ Ambas as partes devem estar online</li>
                  <li>⚠️ Capacidade limitada do canal</li>
                  <li>⚠️ Fechamento requer transação on-chain</li>
                </ul>
              </div>
            </div>

            <Alert className="bg-blue-900/20 border-blue-500/30">
              <Zap className="w-4 h-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong>Conceito Chave:</strong> Canais Lightning permitem múltiplas transações off-chain 
                usando apenas duas transações on-chain (abertura e fechamento). Isso resolve o problema 
                de escalabilidade do Bitcoin.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}