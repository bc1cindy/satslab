'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')

  // Translations
  const t = {
    title: isEnglish ? 'Interactive Lightning Channel' : 'Canal Lightning Interativo',
    description: isEnglish ? 'Learn how Lightning channels work in practice' : 'Aprenda como funcionam os canais Lightning na prática',
    closed: isEnglish ? 'Closed' : 'Fechado',
    opening: isEnglish ? 'Opening' : 'Abrindo',
    active: isEnglish ? 'Active' : 'Ativo',
    closing: isEnglish ? 'Closing' : 'Fechando',
    openChannel: isEnglish ? 'Open Channel' : 'Abrir Canal',
    reset: isEnglish ? 'Reset' : 'Resetar',
    alice: isEnglish ? 'Alice' : 'Alice',
    bob: isEnglish ? 'Bob' : 'Bob',
    capacity: isEnglish ? 'Capacity' : 'Capacidade',
    balance: isEnglish ? 'Balance' : 'Saldo',
    sendPayment: isEnglish ? 'Send Payment' : 'Enviar Pagamento',
    amount: isEnglish ? 'Amount (sats)' : 'Valor (sats)',
    send: isEnglish ? 'Send' : 'Enviar',
    closeChannel: isEnglish ? 'Close Channel' : 'Fechar Canal',
    closingFee: isEnglish ? 'Closing Fee' : 'Taxa de Fechamento',
    transactions: isEnglish ? 'Transactions' : 'Transações',
    noTransactions: isEnglish ? 'No transactions yet' : 'Nenhuma transação ainda',
    from: isEnglish ? 'From' : 'De',
    to: isEnglish ? 'Para' : 'Para',
    pending: isEnglish ? 'Pending' : 'Pendente',
    completed: isEnglish ? 'Completed' : 'Concluído',
    failed: isEnglish ? 'Failed' : 'Falhou',
    channelInfo: isEnglish ? 'Channel Information' : 'Informações do Canal',
    howChannelsWork: isEnglish ? 'How Lightning Channels Work' : 'Como Funcionam os Canais Lightning',
    channelExplanation: isEnglish ? 'Lightning channels allow instant payments between participants without broadcasting every transaction to the blockchain.' : 'Os canais Lightning permitem pagamentos instantâneos entre participantes sem transmitir cada transação para a blockchain.',
    onlyClosingFee: isEnglish ? 'Only the channel closing is recorded on-chain, requiring a transaction fee.' : 'Apenas o fechamento do canal é gravado na blockchain, exigindo uma taxa de transação.',
    // Additional translations
    totalCapacity: isEnglish ? 'Total Capacity' : 'Capacidade Total',
    channelSetup: isEnglish ? 'Channel Setup' : 'Configuração do Canal',
    aliceContribution: isEnglish ? 'Alice Contribution (sats)' : 'Contribuição de Alice (sats)',
    fundDistribution: isEnglish ? 'Fund Distribution' : 'Distribuição de Fundos',
    performTransaction: isEnglish ? 'Perform Transaction' : 'Realizar Transação',
    transactionDescription: isEnglish ? 'Description' : 'Descrição',
    testPayment: isEnglish ? 'Test payment' : 'Pagamento de teste',
    processing: isEnglish ? 'Processing...' : 'Processando...',
    availableBalance: isEnglish ? 'Available balance' : 'Saldo disponível',
    transactionHistory: isEnglish ? 'Transaction History' : 'Histórico de Transações',
    advantages: isEnglish ? 'Advantages' : 'Vantagens',
    limitations: isEnglish ? 'Limitations' : 'Limitações',
    instantTransactions: isEnglish ? '✅ Instant transactions' : '✅ Transações instantâneas',
    noMiningFees: isEnglish ? '✅ No mining fees' : '✅ Sem taxas de mineração',
    unlimitedCapacity: isEnglish ? '✅ Unlimited transaction capacity' : '✅ Capacidade ilimitada de transações',
    improvedPrivacy: isEnglish ? '✅ Improved privacy' : '✅ Privacidade melhorada',
    requiresLockedFunds: isEnglish ? '⚠️ Requires locked funds' : '⚠️ Requer fundos bloqueados',
    bothPartiesOnline: isEnglish ? '⚠️ Both parties must be online' : '⚠️ Ambas as partes devem estar online',
    limitedChannelCapacity: isEnglish ? '⚠️ Limited channel capacity' : '⚠️ Capacidade limitada do canal',
    onchainClosing: isEnglish ? '⚠️ Closing requires on-chain transaction' : '⚠️ Fechamento requer transação on-chain',
    keyConceptTitle: isEnglish ? 'Key Concept:' : 'Conceito Chave:',
    keyConceptText: isEnglish ? 'Lightning channels allow multiple off-chain transactions using only two on-chain transactions (opening and closing). This solves Bitcoin\'s scalability problem.' : 'Canais Lightning permitem múltiplas transações off-chain usando apenas duas transações on-chain (abertura e fechamento). Isso resolve o problema de escalabilidade do Bitcoin.',
    tipTitle: isEnglish ? 'Tip:' : 'Dica:',
    tipText: isEnglish ? 'In real Lightning channels, both parties contribute funds. Alice contributes' : 'Em canais Lightning reais, ambas as partes contribuem com fundos. Alice contribui com',
    andBob: isEnglish ? 'and Bob with' : 'e Bob com',
    advantageTitle: isEnglish ? 'Advantage:' : 'Vantagem:',
    advantageText: isEnglish ? 'Transactions within the channel are instant and without mining fees!' : 'Transações dentro do canal são instantâneas e sem taxas de mineração!',
    estimatedClosingFee: isEnglish ? 'Estimated Closing Fee:' : 'Taxa de Fechamento Estimada:',
    closingFeeNote: isEnglish ? 'This fee is necessary to close the channel and make the on-chain transaction back to Bitcoin.' : 'Esta taxa é necessária para fechar o canal e fazer a transação on-chain de volta ao Bitcoin.',
    // Alert messages
    aliceContributionTooHigh: isEnglish ? 'Alice\'s contribution cannot be greater than total capacity' : 'Contribuição de Alice não pode ser maior que a capacidade total',
    channelMustBeActive: isEnglish ? 'Channel must be active to process transactions' : 'Canal deve estar ativo para processar transações',
    insufficientBalance: isEnglish ? 'does not have sufficient balance' : 'não tem saldo suficiente',
    paymentOf: isEnglish ? 'Payment of' : 'Pagamento de',
    sats: isEnglish ? 'sats' : 'sats'
  }

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
      alert(t.aliceContributionTooHigh)
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
      alert(t.channelMustBeActive)
      return
    }

    const fromBalance = transactionFrom === 'alice' ? channelState.aliceBalance : channelState.bobBalance
    
    if (transactionAmount > fromBalance) {
      alert(`${transactionFrom === 'alice' ? t.alice : t.bob} ${t.insufficientBalance}`)
      return
    }

    const transaction: ChannelTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      from: transactionFrom,
      to: transactionFrom === 'alice' ? 'bob' : 'alice',
      amount: transactionAmount,
      description: transactionDescription || `${t.paymentOf} ${transactionAmount} ${t.sats}`,
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
              <span className="text-white">{t.title}</span>
            </div>
            <Badge variant="outline" className={`${getStatusColor(channelState.status)} border-current`}>
              {getStatusIcon(channelState.status)}
              {t[channelState.status as keyof typeof t] || channelState.status}
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
                <div className="text-sm text-gray-400">{t.alice}</div>
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
                    <div className="text-sm text-gray-400">{t.totalCapacity}</div>
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
                <div className="text-sm text-gray-400">{t.bob}</div>
                <div className="text-lg font-bold text-green-400">
                  {formatAmount(channelState.bobBalance)}
                </div>
              </div>
            </div>

            {/* Channel Controls */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-6">
              {channelState.status === 'closed' && (
                <Button
                  onClick={openChannel}
                  disabled={isSimulating}
                  className="bg-green-600 hover:bg-green-700 text-sm sm:text-base px-3 sm:px-4 py-2"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t.openChannel}
                </Button>
              )}
              
              {channelState.status === 'active' && (
                <Button
                  onClick={closeChannel}
                  disabled={isSimulating}
                  variant="destructive"
                  className="text-sm sm:text-base px-3 sm:px-4 py-2"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  {t.closeChannel}
                </Button>
              )}
              
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-gray-600 text-gray-300 text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t.reset}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Setup */}
      {channelState.status === 'closed' && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">⚙️ {t.channelSetup}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity" className="text-gray-300">{t.totalCapacity} (sats)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="aliceContribution" className="text-gray-300">{t.aliceContribution}</Label>
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
              <Label className="text-gray-300">{t.fundDistribution}</Label>
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
                  <span>{t.alice}: {formatAmount(aliceContribution)}</span>
                  <span>{t.bob}: {formatAmount(newCapacity - aliceContribution)}</span>
                </div>
              </div>
            </div>

            <Alert className="bg-blue-900/20 border-blue-500/30">
              <Info className="w-4 h-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong>{t.tipTitle}</strong> {t.tipText} {formatAmount(aliceContribution)} {t.andBob} {formatAmount(newCapacity - aliceContribution)}.
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-yellow-900/20 border border-yellow-500/30">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300">
                <strong>{t.closingFee}:</strong> {t.onlyClosingFee} 
                {isEnglish ? 'The estimated fee is based on channel capacity (approx. 0.1% =' : 'A taxa estimada é baseada na capacidade do canal (aprox. 0.1% ='} {Math.floor(newCapacity * 0.001)} sats).
                {isEnglish ? 'For the task, use this estimated fee.' : 'Para a tarefa, use esta taxa estimada.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Transaction Interface */}
      {channelState.status === 'active' && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">💸 {t.performTransaction}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="from" className="text-gray-300">{t.from}</Label>
                <select
                  id="from"
                  value={transactionFrom}
                  onChange={(e) => setTransactionFrom(e.target.value as 'alice' | 'bob')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                >
                  <option value="alice">{t.alice}</option>
                  <option value="bob">{t.bob}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="amount" className="text-gray-300">{t.amount}</Label>
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
                <Label htmlFor="description" className="text-gray-300">{t.transactionDescription}</Label>
                <Input
                  id="description"
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                  placeholder={t.testPayment}
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
                {isSimulating ? t.processing : t.sendPayment}
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{t.availableBalance}:</span>
                <span className="font-bold">
                  {formatAmount(transactionFrom === 'alice' ? channelState.aliceBalance : channelState.bobBalance)}
                </span>
              </div>
            </div>

            <Alert className="bg-green-900/20 border-green-500/30">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-green-300">
                <strong>{t.advantageTitle}</strong> {t.advantageText}
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-orange-900/20 border border-orange-500/30">
              <DollarSign className="w-4 h-4 text-orange-400" />
              <AlertDescription className="text-orange-300">
                <strong>{t.estimatedClosingFee}</strong> {Math.floor(channelState.capacity * 0.001)} satoshis
                <br />
                <small>{t.closingFeeNote}</small>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {channelState.transactions.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">📋 {t.transactionHistory}</CardTitle>
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
                        {transaction.from === 'alice' ? t.alice : t.bob} 
                        <ArrowRight className="w-4 h-4 inline mx-2" />
                        {transaction.to === 'alice' ? t.alice : t.bob}
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
          <CardTitle className="text-white">🎓 {t.howChannelsWork}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">{t.advantages}</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>{t.instantTransactions}</li>
                  <li>{t.noMiningFees}</li>
                  <li>{t.unlimitedCapacity}</li>
                  <li>{t.improvedPrivacy}</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-2">{t.limitations}</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>{t.requiresLockedFunds}</li>
                  <li>{t.bothPartiesOnline}</li>
                  <li>{t.limitedChannelCapacity}</li>
                  <li>{t.onchainClosing}</li>
                </ul>
              </div>
            </div>

            <Alert className="bg-blue-900/20 border-blue-500/30">
              <Zap className="w-4 h-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong>{t.keyConceptTitle}</strong> {t.keyConceptText}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}