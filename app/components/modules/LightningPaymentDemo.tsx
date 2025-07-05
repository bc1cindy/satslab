'use client'

import React, { useState, useEffect } from 'react'
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
  QrCode, 
  Copy, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  DollarSign, 
  Route,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'

interface Payment {
  id: string
  amount: number
  description: string
  status: 'pending' | 'routing' | 'completed' | 'failed'
  timestamp: number
  fee: number
  preimage?: string
  route?: RouteHop[]
}

interface RouteHop {
  nodeId: string
  nodeName: string
  fee: number
  delay: number
}

interface LightningPaymentDemoProps {
  onPaymentCompleted?: (payment: Payment) => void
  onInvoiceGenerated?: (invoice: string) => void
}

export default function LightningPaymentDemo({ 
  onPaymentCompleted, 
  onInvoiceGenerated 
}: LightningPaymentDemoProps) {
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('receive')
  const [payments, setPayments] = useState<Payment[]>([])
  const [currentInvoice, setCurrentInvoice] = useState<string>('')
  const [invoiceAmount, setInvoiceAmount] = useState<string>('1000')
  const [invoiceDescription, setInvoiceDescription] = useState<string>('')
  const [paymentInvoice, setPaymentInvoice] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [copied, setCopied] = useState(false)

  // Simulated Lightning nodes for routing
  const lightningNodes = [
    { id: 'node1', name: 'ACINQ', fee: 1 },
    { id: 'node2', name: 'LND Node', fee: 2 },
    { id: 'node3', name: 'Eclair', fee: 1 },
    { id: 'node4', name: 'C-Lightning', fee: 3 },
    { id: 'node5', name: 'Breez', fee: 2 }
  ]

  // Generate mock Lightning invoice
  const generateInvoice = async () => {
    if (!invoiceAmount || isNaN(Number(invoiceAmount))) {
      alert('Digite um valor válido')
      return
    }

    setIsGenerating(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const amount = Number(invoiceAmount)
    const mockInvoice = `lnbc${amount}u1p${Math.random().toString(36).substr(2, 9)}x${Math.random().toString(36).substr(2, 50)}`
    
    setCurrentInvoice(mockInvoice)
    setIsGenerating(false)
    onInvoiceGenerated?.(mockInvoice)
  }

  // Simulate payment processing
  const processPayment = async (invoice: string) => {
    const amount = extractAmountFromInvoice(invoice)
    if (!amount) {
      alert('Invoice inválido')
      return
    }

    setIsPaying(true)
    
    const payment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      description: `Pagamento Lightning de ${amount} sats`,
      status: 'pending',
      timestamp: Date.now(),
      fee: 0,
      route: []
    }

    setPayments(prev => [payment, ...prev])

    // Simulate route finding
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const route = generateRoute(amount)
    const totalFee = route.reduce((sum, hop) => sum + hop.fee, 0)
    
    updatePayment(payment.id, {
      status: 'routing',
      route,
      fee: totalFee
    })

    // Simulate payment routing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate success/failure (95% success rate)
    const success = Math.random() > 0.05
    
    updatePayment(payment.id, {
      status: success ? 'completed' : 'failed',
      preimage: success ? Math.random().toString(36).substr(2, 16) : undefined
    })

    if (success) {
      onPaymentCompleted?.(payment)
    }
    
    setIsPaying(false)
  }

  const extractAmountFromInvoice = (invoice: string): number | null => {
    // Simplified invoice parsing - in reality would use proper Lightning library
    const match = invoice.match(/lnbc(\d+)u/)
    return match ? parseInt(match[1]) : null
  }

  const generateRoute = (amount: number): RouteHop[] => {
    const numHops = Math.floor(Math.random() * 3) + 2 // 2-4 hops
    const route: RouteHop[] = []
    
    for (let i = 0; i < numHops; i++) {
      const node = lightningNodes[Math.floor(Math.random() * lightningNodes.length)]
      route.push({
        nodeId: node.id,
        nodeName: node.name,
        fee: Math.floor(amount * 0.001) + node.fee, // Base fee + percentage
        delay: Math.floor(Math.random() * 100) + 50 // Random delay
      })
    }
    
    return route
  }

  const updatePayment = (paymentId: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId ? { ...payment, ...updates } : payment
    ))
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

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600'
      case 'routing': return 'text-blue-600'
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'routing': return <Route className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Demonstração Lightning Network
          </CardTitle>
          <p className="text-sm text-gray-600">
            Simule pagamentos Lightning instantâneos
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'send' | 'receive')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="receive">Receber</TabsTrigger>
              <TabsTrigger value="send">Enviar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="receive" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor (satoshis)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      placeholder="1000"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Input
                      id="description"
                      value={invoiceDescription}
                      onChange={(e) => setInvoiceDescription(e.target.value)}
                      placeholder="Pagamento de teste"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={generateInvoice}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Gerando...' : 'Gerar Invoice'}
                </Button>
                
                {currentInvoice && (
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Invoice Lightning</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(currentInvoice)}
                        >
                          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copiado!' : 'Copiar'}
                        </Button>
                      </div>
                      <div className="font-mono text-sm break-all bg-white p-2 rounded border">
                        {currentInvoice}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <QrCode className="w-4 h-4" />
                      <span>QR Code seria exibido aqui em uma implementação real</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="send" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invoice">Invoice Lightning</Label>
                  <Input
                    id="invoice"
                    value={paymentInvoice}
                    onChange={(e) => setPaymentInvoice(e.target.value)}
                    placeholder="lnbc1000u1p..."
                  />
                </div>
                
                <Button 
                  onClick={() => processPayment(paymentInvoice)}
                  disabled={isPaying || !paymentInvoice}
                  className="w-full"
                >
                  {isPaying ? 'Processando...' : 'Pagar Invoice'}
                </Button>
                
                {/* Test Invoice Generator */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Invoice de Teste</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Use este invoice para testar um pagamento de 1000 satoshis:
                  </p>
                  <div className="bg-white p-2 rounded border font-mono text-sm break-all">
                    lnbc1000u1p3test123456789abcdefghijklmnopqrstuvwxyz
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPaymentInvoice('lnbc1000u1p3test123456789abcdefghijklmnopqrstuvwxyz')}
                    className="mt-2"
                  >
                    Usar Invoice de Teste
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                      </span>
                      <span className="font-medium">{formatAmount(payment.amount)}</span>
                      <Badge variant="outline" className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-600">{formatTime(payment.timestamp)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{payment.description}</p>
                  
                  {payment.route && payment.route.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Rota:</div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Você</span>
                        {payment.route.map((hop, index) => (
                          <React.Fragment key={index}>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {hop.nodeName}
                            </span>
                          </React.Fragment>
                        ))}
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Destino</span>
                      </div>
                    </div>
                  )}
                  
                  {payment.fee > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Taxa: {payment.fee} sats
                      </span>
                    </div>
                  )}
                  
                  {payment.preimage && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Preimage:</span>
                      <div className="font-mono text-xs bg-gray-50 p-1 rounded mt-1">
                        {payment.preimage}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lightning Network Info */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre Lightning Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Vantagens</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Pagamentos instantâneos</li>
                  <li>• Taxas muito baixas</li>
                  <li>• Escalabilidade</li>
                  <li>• Privacidade melhorada</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Casos de Uso</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Micropagamentos</li>
                  <li>• Pagamentos recorrentes</li>
                  <li>• Streaming de pagamentos</li>
                  <li>• Comercio eletrônico</li>
                </ul>
              </div>
            </div>
            
            <Alert>
              <Zap className="w-4 h-4" />
              <AlertDescription>
                <strong>Importante:</strong> Esta é uma demonstração educacional. Para usar Lightning Network com Bitcoin real, 
                utilize carteiras oficiais como Phoenix, Breez, ou Wallet of Satoshi.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.open('https://lightning.network/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Documentação Oficial
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://starbackr.me', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Faucet Signet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}