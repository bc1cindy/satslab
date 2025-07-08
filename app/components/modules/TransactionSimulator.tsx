'use client'

import React, { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { 
  ShoppingCart, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Copy,
  Check
} from 'lucide-react'

interface TransactionSimulatorProps {
  onTransactionSent?: (txid: string) => void
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
}

interface FeeLevel {
  level: 'high' | 'medium' | 'low'
  label: string
  satPerVB: number
  estimatedTime: string
  color: string
  icon: React.ReactNode
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Café Premium ☕',
    description: 'Café especial torrado na hora',
    price: 0.005,
    image: '☕'
  },
  {
    id: '2', 
    name: 'eBook Bitcoin 📖',
    description: 'Guia completo sobre Bitcoin',
    price: 0.0025,
    image: '📖'
  },
  {
    id: '3',
    name: 'Adesivo Bitcoin 🏷️',
    description: 'Adesivo para notebook',
    price: 0.001,
    image: '🏷️'
  }
]

const feeOptions: FeeLevel[] = [
  {
    level: 'low',
    label: 'Baixa',
    satPerVB: 2,
    estimatedTime: '~2 horas',
    color: 'text-blue-400',
    icon: <TrendingDown className="h-4 w-4" />
  },
  {
    level: 'medium',
    label: 'Média',
    satPerVB: 5,
    estimatedTime: '~30 minutos',
    color: 'text-yellow-400',
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    level: 'high',
    label: 'Alta',
    satPerVB: 10,
    estimatedTime: '~10 minutos',
    color: 'text-orange-400',
    icon: <Zap className="h-4 w-4" />
  }
]

export default function TransactionSimulator({ onTransactionSent }: TransactionSimulatorProps) {
  const [currentStep, setCurrentStep] = useState<'shop' | 'checkout' | 'payment' | 'confirming' | 'complete'>('shop')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedFee, setSelectedFee] = useState<FeeLevel>(feeOptions[1]) // Default to medium
  const [walletAddress, setWalletAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [copied, setCopied] = useState(false)
  const [hasStoredWallet, setHasStoredWallet] = useState(false)

  // Busca o endereço salvo do módulo anterior quando o componente monta
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAddress = localStorage.getItem('satslab_user_address')
      if (savedAddress) {
        setWalletAddress(savedAddress)
        setHasStoredWallet(true)
      }
    }
  }, [])

  const generateTxid = (): string => {
    return Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setCurrentStep('checkout')
  }

  const handleCheckout = () => {
    setCurrentStep('payment')
  }

  const handlePayment = async () => {
    if (!walletAddress.trim()) {
      alert('Por favor, insira o endereço da sua carteira')
      return
    }

    setIsProcessing(true)
    setCurrentStep('confirming')
    
    // Simula processamento da transação
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const txid = generateTxid()
    setTransactionId(txid)
    setCurrentStep('complete')
    setIsProcessing(false)
    
    // Notifica o componente pai
    if (onTransactionSent) {
      onTransactionSent(txid)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetSimulator = () => {
    setCurrentStep('shop')
    setSelectedProduct(null)
    setWalletAddress('')
    setTransactionId('')
    setCopied(false)
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ShoppingCart className="h-6 w-6 mr-3 text-orange-500" />
            Simulador de Compra Bitcoin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              💡 <strong>Simulação Educativa:</strong> Esta é uma experiência de compra simulada para você 
              praticar envio de transações Bitcoin com diferentes níveis de taxa.
            </p>
          </div>

          {/* Step 1: Product Selection */}
          {currentStep === 'shop' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">🛍️ Escolha um produto:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockProducts.map((product) => (
                  <Card key={product.id} className="bg-gray-800 border-gray-700 cursor-pointer hover:border-orange-500 transition-colors">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">{product.image}</div>
                      <h4 className="font-medium text-white mb-1">{product.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">{product.description}</p>
                      <div className="text-lg font-bold text-orange-400 mb-3">
                        {product.price} sBTC
                      </div>
                      <Button
                        onClick={() => handleProductSelect(product)}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        size="sm"
                      >
                        Selecionar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Checkout */}
          {currentStep === 'checkout' && selectedProduct && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">🛒 Carrinho de Compras</h3>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{selectedProduct.image}</span>
                    <div>
                      <p className="font-medium text-white">{selectedProduct.name}</p>
                      <p className="text-sm text-gray-400">{selectedProduct.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">{selectedProduct.price} sBTC</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <span className="text-white font-medium">Total:</span>
                <span className="text-xl font-bold text-orange-400">{selectedProduct.price} sBTC</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setCurrentStep('shop')}
                  variant="outline"
                  className="border-gray-600"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleCheckout}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Pagar com Bitcoin
                  <CreditCard className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Configuration */}
          {currentStep === 'payment' && selectedProduct && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">💳 Configurar Pagamento</h3>
              
              {/* Destination Address */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Endereço de Destino:</h4>
                <p className="font-mono text-sm text-gray-300 bg-gray-700 p-2 rounded">
                  tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx
                </p>
                <p className="text-xs text-gray-500 mt-1">Endereço da loja (fornecido automaticamente)</p>
              </div>

              {/* Your Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Seu Endereço de Carteira (origem dos fundos):
                </label>
                <div className="relative">
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Cole o endereço da sua carteira Signet (tb1...)"
                    className="bg-gray-800 border-gray-700 text-white pr-10"
                  />
                  {hasStoredWallet && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {hasStoredWallet ? (
                  <p className="text-xs text-green-400 mt-1">
                    ✓ Endereço recuperado da carteira que você criou no Módulo 2
                  </p>
                ) : (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Não encontramos uma carteira salva. Use o endereço da carteira que você criou no Módulo 2.
                    </p>
                    <Button
                      onClick={() => window.open('/modules/2', '_blank')}
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Voltar ao Módulo 2 para criar carteira
                    </Button>
                  </div>
                )}
              </div>

              {/* Fee Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Nível de Taxa (afeta velocidade de confirmação):
                </label>
                <div className="bg-gray-800 rounded-lg p-1 grid grid-cols-3">
                  {feeOptions.map((fee) => (
                    <button
                      key={fee.level}
                      className={`relative p-4 rounded-md transition-all ${
                        selectedFee.level === fee.level 
                          ? 'bg-gray-700 shadow-lg' 
                          : 'hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedFee(fee)}
                    >
                      <div className="space-y-2">
                        <div className={`flex items-center justify-center ${fee.color}`}>
                          {fee.icon}
                        </div>
                        <div>
                          <p className={`font-bold text-lg ${fee.color}`}>
                            {fee.satPerVB} sat/vB
                          </p>
                          <p className="font-medium text-white text-sm mt-1">
                            {fee.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {fee.estimatedTime}
                          </p>
                        </div>
                      </div>
                      {selectedFee.level === fee.level && (
                        <div className={`absolute inset-x-0 bottom-0 h-1 ${
                          fee.level === 'low' ? 'bg-blue-400' :
                          fee.level === 'medium' ? 'bg-yellow-400' :
                          'bg-orange-400'
                        } rounded-b-md`} />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  💡 Dica: Em períodos de alta demanda, taxas baixas podem demorar muito mais
                </p>
              </div>

              {/* Transaction Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Resumo da Transação:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Produto:</span>
                    <span className="text-white">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor:</span>
                    <span className="text-white">{selectedProduct.price} sBTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taxa estimada:</span>
                    <span className="text-white">~0.0001 sBTC ({selectedFee.satPerVB} sat/vB)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tempo estimado:</span>
                    <span className={selectedFee.color}>{selectedFee.estimatedTime}</span>
                  </div>
                  <hr className="border-gray-700" />
                  <div className="flex justify-between font-medium">
                    <span className="text-white">Total aproximado:</span>
                    <span className="text-orange-400">{(selectedProduct.price + 0.0001).toFixed(4)} sBTC</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setCurrentStep('checkout')}
                  variant="outline"
                  className="border-gray-600"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={!walletAddress.trim() || isProcessing}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Enviar Transação
                  <CreditCard className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Processing */}
          {currentStep === 'confirming' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-500 animate-spin mr-3" />
                <h3 className="text-lg font-semibold text-white">Processando Transação...</h3>
              </div>
              <p className="text-gray-400">
                Sua transação está sendo criada e enviada para a rede Signet.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  ⏱️ Tempo estimado de confirmação: {selectedFee.estimatedTime}
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 'complete' && (
            <div className="space-y-6">
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  <strong>Pagamento Enviado!</strong> Sua transação foi criada com sucesso.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-white">📄 Comprovante da Transação</h4>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-400">Produto:</span>
                    <p className="font-medium text-white">{selectedProduct?.name}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">Valor Enviado:</span>
                    <p className="font-mono text-orange-400">{selectedProduct?.price} sBTC</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">Nível de Taxa:</span>
                    <Badge className={`${selectedFee.color} bg-transparent border`}>
                      {selectedFee.label} ({selectedFee.satPerVB} sat/vB)
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">ID da Transação (TXID):</span>
                    <div className="bg-gray-700 rounded p-2 mt-1">
                      <p className="font-mono text-xs break-all text-white">{transactionId}</p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(transactionId)}
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

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <p className="text-orange-300 text-sm">
                  🎯 <strong>Sucesso!</strong> O TXID foi automaticamente preenchido no campo da tarefa. 
                  Agora você pode validar a transação!
                </p>
              </div>

              <Button
                onClick={resetSimulator}
                variant="outline"
                className="w-full border-gray-600"
              >
                Fazer Nova Compra
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}