'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { 
  ArrowRight, 
  Zap, 
  Lock, 
  Unlock, 
  Clock,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface ChannelState {
  id: string
  aliceBalance: number
  bobBalance: number
  capacity: number
  status: 'opening' | 'open' | 'closing' | 'closed'
  commitmentTx: string
  updates: number
}

interface PaymentRoute {
  from: string
  to: string
  amount: number
  fee: number
  hops: string[]
}

interface LightningChannelDiagramProps {
  onChannelStateChange?: (state: ChannelState) => void
  onPaymentRouted?: (route: PaymentRoute) => void
}

export default function LightningChannelDiagram({ 
  onChannelStateChange
}: LightningChannelDiagramProps) {
  const [activeTab, setActiveTab] = useState('channel')
  const [isAnimating, setIsAnimating] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('1000')
  const [paymentDirection, setPaymentDirection] = useState<'alice-to-bob' | 'bob-to-alice'>('alice-to-bob')
  
  const [channel, setChannel] = useState<ChannelState>({
    id: 'ch_001',
    aliceBalance: 50000,
    bobBalance: 50000,
    capacity: 100000,
    status: 'open',
    commitmentTx: 'tx_abc123',
    updates: 0
  })

  const [networkNodes] = useState([
    { id: 'alice', name: 'Alice', x: 100, y: 200, balance: 80000 },
    { id: 'bob', name: 'Bob', x: 300, y: 200, balance: 70000 },
    { id: 'charlie', name: 'Charlie', x: 500, y: 200, balance: 60000 },
    { id: 'david', name: 'David', x: 200, y: 100, balance: 90000 },
    { id: 'eve', name: 'Eve', x: 400, y: 100, balance: 50000 }
  ])

  const [networkChannels] = useState([
    { from: 'alice', to: 'bob', capacity: 100000, balance: [50000, 50000] },
    { from: 'bob', to: 'charlie', capacity: 80000, balance: [40000, 40000] },
    { from: 'alice', to: 'david', capacity: 120000, balance: [60000, 60000] },
    { from: 'david', to: 'eve', capacity: 90000, balance: [45000, 45000] },
    { from: 'eve', to: 'charlie', capacity: 70000, balance: [35000, 35000] }
  ])

  const [paymentHistory, setPaymentHistory] = useState<Array<{
    id: string
    from: string
    to: string
    amount: number
    timestamp: number
    status: 'success' | 'failed'
  }>>([])

  const makePayment = () => {
    const amount = parseInt(paymentAmount)
    if (isNaN(amount) || amount <= 0) return

    setIsAnimating(true)
    
    if (paymentDirection === 'alice-to-bob') {
      if (channel.aliceBalance >= amount) {
        setTimeout(() => {
          setChannel(prev => ({
            ...prev,
            aliceBalance: prev.aliceBalance - amount,
            bobBalance: prev.bobBalance + amount,
            updates: prev.updates + 1
          }))
          setPaymentHistory(prev => [...prev, {
            id: `pay_${Date.now()}`,
            from: 'Alice',
            to: 'Bob',
            amount,
            timestamp: Date.now(),
            status: 'success'
          }])
          setIsAnimating(false)
        }, 1500)
      } else {
        setTimeout(() => {
          setPaymentHistory(prev => [...prev, {
            id: `pay_${Date.now()}`,
            from: 'Alice',
            to: 'Bob',
            amount,
            timestamp: Date.now(),
            status: 'failed'
          }])
          setIsAnimating(false)
        }, 1500)
      }
    } else {
      if (channel.bobBalance >= amount) {
        setTimeout(() => {
          setChannel(prev => ({
            ...prev,
            bobBalance: prev.bobBalance - amount,
            aliceBalance: prev.aliceBalance + amount,
            updates: prev.updates + 1
          }))
          setPaymentHistory(prev => [...prev, {
            id: `pay_${Date.now()}`,
            from: 'Bob',
            to: 'Alice',
            amount,
            timestamp: Date.now(),
            status: 'success'
          }])
          setIsAnimating(false)
        }, 1500)
      } else {
        setTimeout(() => {
          setPaymentHistory(prev => [...prev, {
            id: `pay_${Date.now()}`,
            from: 'Bob',
            to: 'Alice',
            amount,
            timestamp: Date.now(),
            status: 'failed'
          }])
          setIsAnimating(false)
        }, 1500)
      }
    }
  }

  const resetChannel = () => {
    setChannel({
      id: 'ch_001',
      aliceBalance: 50000,
      bobBalance: 50000,
      capacity: 100000,
      status: 'open',
      commitmentTx: 'tx_abc123',
      updates: 0
    })
    setPaymentHistory([])
  }

  const openChannel = () => {
    setChannel(prev => ({ ...prev, status: 'opening' }))
    setTimeout(() => {
      setChannel(prev => ({ ...prev, status: 'open' }))
    }, 2000)
  }

  const closeChannel = () => {
    setChannel(prev => ({ ...prev, status: 'closing' }))
    setTimeout(() => {
      setChannel(prev => ({ ...prev, status: 'closed' }))
    }, 3000)
  }

  const getStatusColor = (status: ChannelState['status']) => {
    switch (status) {
      case 'opening': return 'bg-yellow-100 text-yellow-800'
      case 'open': return 'bg-green-100 text-green-800'
      case 'closing': return 'bg-orange-100 text-orange-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: ChannelState['status']) => {
    switch (status) {
      case 'opening': return <Clock className="w-4 h-4" />
      case 'open': return <Unlock className="w-4 h-4" />
      case 'closing': return <Clock className="w-4 h-4" />
      case 'closed': return <Lock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  useEffect(() => {
    onChannelStateChange?.(channel)
  }, [channel, onChannelStateChange])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Diagrama de Canais Lightning
        </CardTitle>
        <p className="text-sm text-gray-600">
          Visualize como funcionam os canais Lightning e roteamento de pagamentos
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="channel">Canal Simples</TabsTrigger>
            <TabsTrigger value="routing">Roteamento</TabsTrigger>
            <TabsTrigger value="states">Estados do Canal</TabsTrigger>
          </TabsList>

          <TabsContent value="channel" className="space-y-6">
            {/* Channel Diagram */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Canal Lightning</h3>
                <Badge className={getStatusColor(channel.status)}>
                  {getStatusIcon(channel.status)}
                  {channel.status.charAt(0).toUpperCase() + channel.status.slice(1)}
                </Badge>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between relative">
                  {/* Alice */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      A
                    </div>
                    <div className="mt-2 text-sm font-medium">Alice</div>
                    <div className="text-xs text-gray-600">{channel.aliceBalance.toLocaleString()} sats</div>
                  </div>

                  {/* Channel Bar */}
                  <div className="flex-1 mx-8">
                    <div className="relative">
                      <div className="h-8 bg-gray-300 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${(channel.aliceBalance / channel.capacity) * 100}%` }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {channel.capacity.toLocaleString()} sats
                      </div>
                      
                      {/* Payment Animation */}
                      {isAnimating && (
                        <div className={`absolute top-0 h-8 w-4 bg-yellow-400 rounded-full animate-pulse ${
                          paymentDirection === 'alice-to-bob' ? 'animate-bounce' : 'animate-bounce'
                        }`} 
                        style={{ 
                          left: paymentDirection === 'alice-to-bob' ? '10%' : '90%',
                          transition: 'left 1.5s ease-in-out',
                          transform: paymentDirection === 'alice-to-bob' ? 'translateX(400%)' : 'translateX(-400%)'
                        }}>
                          <div className="w-full h-full flex items-center justify-center">
                            <Zap className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between mt-2 text-xs">
                      <span>Alice: {((channel.aliceBalance / channel.capacity) * 100).toFixed(1)}%</span>
                      <span>Bob: {((channel.bobBalance / channel.capacity) * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Bob */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      B
                    </div>
                    <div className="mt-2 text-sm font-medium">Bob</div>
                    <div className="text-xs text-gray-600">{channel.bobBalance.toLocaleString()} sats</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold">Fazer Pagamento</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Quantidade (satoshis)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="1000"
                    disabled={isAnimating || channel.status !== 'open'}
                  />
                </div>
                <div>
                  <Label htmlFor="direction">Direção</Label>
                  <select 
                    id="direction"
                    value={paymentDirection}
                    onChange={(e) => setPaymentDirection(e.target.value as 'alice-to-bob' | 'bob-to-alice')}
                    disabled={isAnimating || channel.status !== 'open'}
                    className="w-full p-2 border rounded"
                  >
                    <option value="alice-to-bob">Alice → Bob</option>
                    <option value="bob-to-alice">Bob → Alice</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={makePayment}
                  disabled={isAnimating || channel.status !== 'open'}
                  className="flex items-center gap-2"
                >
                  {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isAnimating ? 'Processando...' : 'Enviar Pagamento'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetChannel}
                  disabled={isAnimating}
                >
                  <RotateCcw className="w-4 h-4" />
                  Resetar
                </Button>
              </div>
            </div>

            {/* Payment History */}
            {paymentHistory.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Histórico de Pagamentos</h3>
                <div className="space-y-2">
                  {paymentHistory.slice(-5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant={payment.status === 'success' ? 'default' : 'destructive'}>
                          {payment.status === 'success' ? '✓' : '✗'}
                        </Badge>
                        <span className="text-sm">
                          {payment.from} → {payment.to}
                        </span>
                      </div>
                      <div className="text-sm">
                        {payment.amount.toLocaleString()} sats
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="routing" className="space-y-6">
            {/* Network Diagram */}
            <div className="space-y-4">
              <h3 className="font-semibold">Rede Lightning</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <svg viewBox="0 0 600 300" className="w-full h-64">
                  {/* Channels */}
                  {networkChannels.map((channel, index) => {
                    const fromNode = networkNodes.find(n => n.id === channel.from)
                    const toNode = networkNodes.find(n => n.id === channel.to)
                    if (!fromNode || !toNode) return null
                    
                    return (
                      <g key={index}>
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2 - 5}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#6b7280"
                        >
                          {(channel.capacity / 1000).toFixed(0)}k
                        </text>
                      </g>
                    )
                  })}
                  
                  {/* Nodes */}
                  {networkNodes.map((node) => (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="25"
                        fill={node.id === 'alice' ? '#3b82f6' : node.id === 'bob' ? '#10b981' : '#8b5cf6'}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        fontSize="12"
                        fill="white"
                        fontWeight="bold"
                      >
                        {node.name[0]}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + 40}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#374151"
                      >
                        {node.name}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Route Examples */}
            <div className="space-y-4">
              <h3 className="font-semibold">Exemplos de Roteamento</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Rota Direta</h4>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="bg-blue-100 px-2 py-1 rounded">Alice</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="bg-blue-100 px-2 py-1 rounded">Bob</span>
                    <span className="ml-2">Taxa: 1 sat</span>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Rota com 2 Hops</h4>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <span className="bg-green-100 px-2 py-1 rounded">Alice</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="bg-green-100 px-2 py-1 rounded">David</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="bg-green-100 px-2 py-1 rounded">Eve</span>
                    <span className="ml-2">Taxa: 3 sats</span>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Rota com 3 Hops</h4>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <span className="bg-purple-100 px-2 py-1 rounded">Alice</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="bg-purple-100 px-2 py-1 rounded">Bob</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="bg-purple-100 px-2 py-1 rounded">Charlie</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="bg-purple-100 px-2 py-1 rounded">Eve</span>
                    <span className="ml-2">Taxa: 5 sats</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="states" className="space-y-6">
            {/* Channel States */}
            <div className="space-y-4">
              <h3 className="font-semibold">Estados do Canal</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Abrindo
                  </h4>
                  <div className="text-sm text-yellow-700">
                    <div>• Transação de financiamento é criada</div>
                    <div>• Aguardando confirmações na blockchain</div>
                    <div>• Normalmente leva 3-6 confirmações</div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <Unlock className="w-4 h-4" />
                    Aberto
                  </h4>
                  <div className="text-sm text-green-700">
                    <div>• Canal está ativo e funcionando</div>
                    <div>• Pagamentos podem ser enviados e recebidos</div>
                    <div>• Balances são atualizados off-chain</div>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Fechando
                  </h4>
                  <div className="text-sm text-orange-700">
                    <div>• Transação de fechamento é transmitida</div>
                    <div>• Aguardando confirmações na blockchain</div>
                    <div>• Fundos ficam bloqueados temporariamente</div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Fechado
                  </h4>
                  <div className="text-sm text-red-700">
                    <div>• Canal está permanentemente fechado</div>
                    <div>• Fundos são devolvidos on-chain</div>
                    <div>• Balances finais são liquidados</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Management */}
            <div className="space-y-4">
              <h3 className="font-semibold">Gerenciamento do Canal</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Status Atual:</span>
                  <Badge className={getStatusColor(channel.status)}>
                    {getStatusIcon(channel.status)}
                    {channel.status.charAt(0).toUpperCase() + channel.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ID do Canal:</span>
                    <span className="font-mono">{channel.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacidade:</span>
                    <span>{channel.capacity.toLocaleString()} sats</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Atualizações:</span>
                    <span>{channel.updates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commitment TX:</span>
                    <span className="font-mono">{channel.commitmentTx}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  {channel.status === 'closed' && (
                    <Button onClick={openChannel} size="sm">
                      Abrir Canal
                    </Button>
                  )}
                  {channel.status === 'open' && (
                    <Button onClick={closeChannel} size="sm" variant="destructive">
                      Fechar Canal
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}