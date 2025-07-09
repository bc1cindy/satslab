'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Progress } from '@/app/components/ui/progress'
import { 
  Zap, 
  Wallet, 
  QrCode, 
  Copy, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  DollarSign, 
  Route,
  AlertTriangle,
  Plus,
  Minus,
  Users,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Download
} from 'lucide-react'

interface LightningChannel {
  id: string
  nodeId: string
  nodeName: string
  capacity: number
  localBalance: number
  remoteBalance: number
  status: 'opening' | 'active' | 'closing' | 'closed'
  feeRate: number
}

interface LightningPayment {
  id: string
  type: 'send' | 'receive'
  amount: number
  description: string
  status: 'pending' | 'routing' | 'completed' | 'failed'
  timestamp: number
  fee: number
  preimage?: string
  invoice?: string
  route?: RouteHop[]
}

interface RouteHop {
  nodeId: string
  nodeName: string
  fee: number
  delay: number
}

interface WalletState {
  balance: number
  channels: LightningChannel[]
  payments: LightningPayment[]
  nodeId: string
  nodeAlias: string
  isOnline: boolean
  syncedToChain: boolean
}

interface IntegratedLightningWalletProps {
  onPaymentCompleted?: (payment: LightningPayment) => void
  onChannelOpened?: (channel: LightningChannel) => void
  onAddressGenerated?: (address: string) => void
}

export default function IntegratedLightningWallet({
  onPaymentCompleted,
  onChannelOpened,
  onAddressGenerated
}: IntegratedLightningWalletProps) {
  const [walletState, setWalletState] = useState<WalletState>({
    balance: 0,
    channels: [],
    payments: [],
    nodeId: '03' + Math.random().toString(16).substr(2, 62),
    nodeAlias: 'SatsLab-Node-' + Math.random().toString(36).substr(2, 6),
    isOnline: true,
    syncedToChain: true
  })

  const [activeTab, setActiveTab] = useState<'wallet' | 'channels' | 'payments'>('wallet')
  const [sendAmount, setSendAmount] = useState('')
  const [sendInvoice, setSendInvoice] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [receiveDescription, setReceiveDescription] = useState('')
  const [currentInvoice, setCurrentInvoice] = useState('')
  const [showBalance, setShowBalance] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Simulated Lightning nodes for channels
  const availableNodes = [
    { id: 'node1', name: 'ACINQ', capacity: 1000000, fee: 0.001 },
    { id: 'node2', name: 'Blockstream', capacity: 2000000, fee: 0.002 },
    { id: 'node3', name: 'Lightning Labs', capacity: 1500000, fee: 0.0015 },
    { id: 'node4', name: 'Breez', capacity: 500000, fee: 0.001 },
    { id: 'node5', name: 'Phoenix', capacity: 800000, fee: 0.0012 }
  ]

  // Initialize wallet with demo funds
  useEffect(() => {
    const timer = setTimeout(() => {
      setWalletState(prev => ({
        ...prev,
        balance: 50000, // Start with 50k sats
        channels: [
          {
            id: 'channel-1',
            nodeId: 'node1',
            nodeName: 'ACINQ',
            capacity: 100000,
            localBalance: 30000,
            remoteBalance: 70000,
            status: 'active',
            feeRate: 0.001
          }
        ]
      }))
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Generate Lightning address
  const generateAddress = useCallback(() => {
    const address = walletState.nodeId + '@' + 'satslab.education:9735'
    onAddressGenerated?.(address)
    return address
  }, [walletState.nodeId, onAddressGenerated])

  // Generate Lightning invoice
  const generateInvoice = async () => {
    if (!receiveAmount || isNaN(Number(receiveAmount))) {
      alert('Digite um valor válido')
      return
    }

    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const amount = Number(receiveAmount)
    const invoice = `lnbc${amount}u1p${Math.random().toString(36).substr(2, 9)}x${Math.random().toString(36).substr(2, 50)}`
    
    setCurrentInvoice(invoice)
    setIsProcessing(false)
    
    // Simulate receiving payment after 3 seconds
    setTimeout(() => {
      simulateIncomingPayment(amount, receiveDescription, invoice)
    }, 3000)
  }

  // Simulate incoming payment
  const simulateIncomingPayment = (amount: number, description: string, invoice: string) => {
    const payment: LightningPayment = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'receive',
      amount,
      description: description || 'Pagamento recebido',
      status: 'completed',
      timestamp: Date.now(),
      fee: 0,
      invoice,
      preimage: Math.random().toString(16).substr(2, 32).padStart(32, '0')
    }

    setWalletState(prev => ({
      ...prev,
      balance: prev.balance + amount,
      payments: [payment, ...prev.payments]
    }))

    onPaymentCompleted?.(payment)
    setCurrentInvoice('')
    setReceiveAmount('')
    setReceiveDescription('')
  }

  // Process outgoing payment
  const processPayment = async () => {
    if (!sendInvoice || !sendAmount) {
      alert('Digite um invoice e valor válidos')
      return
    }

    const amount = Number(sendAmount)
    if (amount > walletState.balance) {
      alert('Saldo insuficiente')
      return
    }

    // Accept any invoice format for the integrated wallet
    if (sendInvoice.trim().length < 10) {
      alert('Invoice muito curto')
      return
    }

    setIsProcessing(true)

    const payment: LightningPayment = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'send',
      amount,
      description: `Pagamento Lightning de ${amount} sats`,
      status: 'pending',
      timestamp: Date.now(),
      fee: 0,
      invoice: sendInvoice,
      route: []
    }

    setWalletState(prev => ({
      ...prev,
      payments: [payment, ...prev.payments]
    }))

    // Simulate route finding
    await new Promise(resolve => setTimeout(resolve, 1000))
    const route = generateRoute(amount)
    const fee = Math.max(1, Math.floor(amount * 0.001))

    updatePayment(payment.id, {
      status: 'routing',
      route,
      fee
    })

    // Simulate payment completion
    await new Promise(resolve => setTimeout(resolve, 2000))
    const success = Math.random() > 0.05 // 95% success rate

    if (success) {
      const preimage = Math.random().toString(16).substr(2, 32).padStart(32, '0')
      
      updatePayment(payment.id, {
        status: 'completed',
        preimage
      })

      setWalletState(prev => ({
        ...prev,
        balance: prev.balance - amount - fee
      }))

      // Success - no popup needed, hash is shown in UI

      onPaymentCompleted?.(payment)
    } else {
      updatePayment(payment.id, {
        status: 'failed'
      })
    }

    setIsProcessing(false)
    setSendAmount('')
    setSendInvoice('')
  }

  // Generate payment route
  const generateRoute = (amount: number): RouteHop[] => {
    const numHops = Math.floor(Math.random() * 3) + 2
    const route: RouteHop[] = []
    
    for (let i = 0; i < numHops; i++) {
      const node = availableNodes[Math.floor(Math.random() * availableNodes.length)]
      route.push({
        nodeId: node.id,
        nodeName: node.name,
        fee: Math.floor(amount * node.fee),
        delay: Math.floor(Math.random() * 100) + 50
      })
    }
    
    return route
  }

  // Update payment status
  const updatePayment = (paymentId: string, updates: Partial<LightningPayment>) => {
    setWalletState(prev => ({
      ...prev,
      payments: prev.payments.map(payment => 
        payment.id === paymentId ? { ...payment, ...updates } : payment
      )
    }))
  }

  // Open new channel
  const openChannel = async (nodeId: string, capacity: number) => {
    if (capacity > walletState.balance) {
      alert('Saldo insuficiente para abrir canal')
      return
    }

    const node = availableNodes.find(n => n.id === nodeId)
    if (!node) return

    const channel: LightningChannel = {
      id: 'channel-' + Math.random().toString(36).substr(2, 9),
      nodeId,
      nodeName: node.name,
      capacity,
      localBalance: capacity,
      remoteBalance: 0,
      status: 'opening',
      feeRate: node.fee
    }

    setWalletState(prev => ({
      ...prev,
      channels: [...prev.channels, channel],
      balance: prev.balance - capacity
    }))

    // Simulate channel opening
    setTimeout(() => {
      setWalletState(prev => ({
        ...prev,
        channels: prev.channels.map(c => 
          c.id === channel.id ? { ...c, status: 'active' } : c
        )
      }))
      onChannelOpened?.(channel)
    }, 3000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + ' sats'
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': case 'opening': return 'text-yellow-500'
      case 'routing': return 'text-blue-500'
      case 'completed': case 'active': return 'text-green-500'
      case 'failed': case 'closed': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': case 'opening': return <Clock className="w-4 h-4" />
      case 'routing': return <Route className="w-4 h-4" />
      case 'completed': case 'active': return <CheckCircle className="w-4 h-4" />
      case 'failed': case 'closed': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Wallet Status */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <span className="text-white">Carteira Lightning Integrada</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={walletState.isOnline ? 'default' : 'destructive'}>
                {walletState.isOnline ? 'Online' : 'Offline'}
              </Badge>
              <Badge variant={walletState.syncedToChain ? 'default' : 'secondary'}>
                {walletState.syncedToChain ? 'Sincronizado' : 'Sincronizando'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Saldo Disponível</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {showBalance ? formatAmount(walletState.balance) : '••••••'}
            </div>
          </div>

          {/* Node Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Node Alias</span>
                <span className="text-sm text-white">{walletState.nodeAlias}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Canais Ativos</span>
                <span className="text-sm text-white">
                  {walletState.channels.filter(c => c.status === 'active').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Capacidade Total</span>
                <span className="text-sm text-white">
                  {formatAmount(walletState.channels.reduce((sum, c) => sum + c.capacity, 0))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wallet">Carteira</TabsTrigger>
              <TabsTrigger value="channels">Canais</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            </TabsList>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Send */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Enviar
                    </CardTitle>
                    <p className="text-sm text-gray-400">
                      Cole um invoice Lightning para enviar pagamentos
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="sendAmount" className="text-gray-300">Valor (sats)</Label>
                      <Input
                        id="sendAmount"
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="1000"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sendInvoice" className="text-gray-300">Invoice Lightning</Label>
                      <Input
                        id="sendInvoice"
                        value={sendInvoice}
                        onChange={(e) => setSendInvoice(e.target.value)}
                        placeholder="lnbc1000u1p..."
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button 
                      onClick={processPayment}
                      disabled={isProcessing || !sendAmount || !sendInvoice}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing ? 'Enviando...' : 'Enviar Pagamento'}
                    </Button>
                    
                    {/* Last Payment Hash Display */}
                    {walletState.payments.length > 0 && walletState.payments[0].type === 'send' && walletState.payments[0].status === 'completed' && walletState.payments[0].preimage && (
                      <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-400">✅ Último Pagamento</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(walletState.payments[0].preimage!)}
                            className="h-6 px-2 text-xs border-green-500/30"
                          >
                            {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copiar Hash
                          </Button>
                        </div>
                        <div className="font-mono text-xs bg-gray-700 p-2 rounded break-all text-green-400">
                          {walletState.payments[0].preimage}
                        </div>
                        <div className="text-xs text-green-300 mt-1">
                          💡 Use este hash para validar a tarefa
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Receive */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Receber
                    </CardTitle>
                    <p className="text-sm text-gray-400">
                      Gere um invoice Lightning para receber pagamentos
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="receiveAmount" className="text-gray-300">Valor (sats)</Label>
                      <Input
                        id="receiveAmount"
                        type="number"
                        value={receiveAmount}
                        onChange={(e) => setReceiveAmount(e.target.value)}
                        placeholder="1000"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiveDescription" className="text-gray-300">Descrição</Label>
                      <Input
                        id="receiveDescription"
                        value={receiveDescription}
                        onChange={(e) => setReceiveDescription(e.target.value)}
                        placeholder="Pagamento de teste"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button 
                      onClick={generateInvoice}
                      disabled={isProcessing || !receiveAmount}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? 'Gerando...' : 'Gerar Invoice'}
                    </Button>
                    
                    {!currentInvoice && (
                      <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
                        <p className="text-sm text-blue-300">
                          💡 <strong>Primeiro passo:</strong> Gere um invoice com o valor desejado. 
                          Após 3 segundos, um pagamento será simulado automaticamente.
                        </p>
                      </div>
                    )}

                    {currentInvoice && (
                      <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Invoice Gerado</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(currentInvoice)}
                          >
                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="font-mono text-xs text-gray-300 break-all bg-gray-600 p-2 rounded">
                          {currentInvoice}
                        </div>
                        <div className="text-xs text-gray-400">
                          ⏱️ Aguardando pagamento... (simulação: 3s)
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Channels Tab */}
            <TabsContent value="channels" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Canais Lightning</h3>
                <Button
                  onClick={() => openChannel('node2', 50000)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Abrir Canal
                </Button>
              </div>

              <div className="space-y-3">
                {walletState.channels.map(channel => (
                  <Card key={channel.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{channel.nodeName}</span>
                          <Badge variant="outline" className={`${getStatusColor(channel.status)} border-current`}>
                            {getStatusIcon(channel.status)}
                            {channel.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatAmount(channel.capacity)}
                        </span>
                      </div>

                      {channel.status === 'active' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Saldo Local: {formatAmount(channel.localBalance)}</span>
                            <span>Saldo Remoto: {formatAmount(channel.remoteBalance)}</span>
                          </div>
                          <Progress 
                            value={(channel.localBalance / channel.capacity) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-gray-400">
                            Taxa: {(channel.feeRate * 100).toFixed(3)}%
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Histórico de Pagamentos</h3>
              
              <div className="space-y-3">
                {walletState.payments.map(payment => (
                  <Card key={payment.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                          </span>
                          <span className="font-medium text-white">
                            {payment.type === 'send' ? '↗️' : '↙️'} {formatAmount(payment.amount)}
                          </span>
                          <Badge variant="outline" className={`${getStatusColor(payment.status)} border-current`}>
                            {payment.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-400">{formatTime(payment.timestamp)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-2">{payment.description}</p>
                      
                      {payment.route && payment.route.length > 0 && (
                        <div className="text-xs text-gray-400">
                          Rota: {payment.route.map(hop => hop.nodeName).join(' → ')}
                        </div>
                      )}
                      
                      <div className="space-y-1 mt-2">
                        {payment.fee > 0 && (
                          <div className="text-xs text-gray-400">
                            Taxa: {payment.fee} sats
                          </div>
                        )}
                        {payment.preimage && (
                          <div className="text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Hash/Preimage:</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(payment.preimage!)}
                                className="h-6 px-2 text-xs"
                              >
                                {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                            <div className="font-mono text-xs bg-gray-700 p-1 rounded mt-1 break-all text-green-400">
                              {payment.preimage}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Educational Info */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">💡 Sobre Esta Carteira</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-900/20 border-blue-500/30">
            <Zap className="w-4 h-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              Esta é uma carteira Lightning simulada para fins educacionais. Ela demonstra:
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Gerenciamento de canais Lightning</li>
                <li>Pagamentos instantâneos</li>
                <li>Geração de invoices</li>
                <li>Roteamento através da rede</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert className="bg-green-900/20 border-green-500/30">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <AlertDescription className="text-green-300">
              <strong>Para uso real:</strong> Experimente a <strong>Phoenix Wallet</strong> - uma carteira Lightning fácil de usar que gerencia canais automaticamente. Disponível para iOS e Android.
              <div className="mt-2 text-sm">
                🔗 <a href="https://phoenix.acinq.co/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-200">
                  phoenix.acinq.co
                </a>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}