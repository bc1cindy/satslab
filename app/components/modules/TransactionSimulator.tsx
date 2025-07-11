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
import { usePathname } from 'next/navigation'

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

const getMockProducts = (isEnglish: boolean): Product[] => [
  {
    id: '1',
    name: isEnglish ? 'Premium Coffee ☕' : 'Café Premium ☕',
    description: isEnglish ? 'Freshly roasted specialty coffee' : 'Café especial torrado na hora',
    price: 0.005,
    image: '☕'
  },
  {
    id: '2', 
    name: isEnglish ? 'Bitcoin eBook 📖' : 'eBook Bitcoin 📖',
    description: isEnglish ? 'Complete guide about Bitcoin' : 'Guia completo sobre Bitcoin',
    price: 0.0025,
    image: '📖'
  },
  {
    id: '3',
    name: isEnglish ? 'Bitcoin Sticker 🏷️' : 'Adesivo Bitcoin 🏷️',
    description: isEnglish ? 'Laptop sticker' : 'Adesivo para notebook',
    price: 0.001,
    image: '🏷️'
  }
]

const getFeeOptions = (isEnglish: boolean): FeeLevel[] => [
  {
    level: 'low',
    label: isEnglish ? 'Low' : 'Baixa',
    satPerVB: 2,
    estimatedTime: isEnglish ? '~2 hours' : '~2 horas',
    color: 'text-blue-400',
    icon: <TrendingDown className="h-4 w-4" />
  },
  {
    level: 'medium',
    label: isEnglish ? 'Medium' : 'Média',
    satPerVB: 5,
    estimatedTime: isEnglish ? '~30 minutes' : '~30 minutos',
    color: 'text-yellow-400',
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    level: 'high',
    label: isEnglish ? 'High' : 'Alta',
    satPerVB: 10,
    estimatedTime: isEnglish ? '~10 minutes' : '~10 minutos',
    color: 'text-orange-400',
    icon: <Zap className="h-4 w-4" />
  }
]

export default function TransactionSimulator({ onTransactionSent }: TransactionSimulatorProps) {
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')
  const feeOptions = getFeeOptions(isEnglish)
  const mockProducts = getMockProducts(isEnglish)
  
  const [currentStep, setCurrentStep] = useState<'shop' | 'checkout' | 'payment' | 'confirming' | 'complete'>('shop')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedFee, setSelectedFee] = useState<FeeLevel>(feeOptions[1]) // Default to medium
  const [walletAddress, setWalletAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [copied, setCopied] = useState(false)
  const [hasStoredWallet, setHasStoredWallet] = useState(false)

  // Translations
  const t = {
    title: isEnglish ? 'Bitcoin Purchase Simulator' : 'Simulador de Compra Bitcoin',
    selectProduct: isEnglish ? 'Select a product to buy with Bitcoin:' : 'Escolha um produto para comprar com Bitcoin:',
    select: isEnglish ? 'Select' : 'Selecionar',
    shoppingCart: isEnglish ? '🛒 Shopping Cart' : '🛒 Carrinho de Compras',
    total: isEnglish ? 'Total:' : 'Total:',
    back: isEnglish ? 'Back' : 'Voltar',
    payWithBitcoin: isEnglish ? 'Pay with Bitcoin' : 'Pagar com Bitcoin',
    paymentConfig: isEnglish ? '💳 Payment Configuration' : '💳 Configurar Pagamento',
    destinationAddress: isEnglish ? 'Destination Address:' : 'Endereço de Destino:',
    storeAddress: isEnglish ? 'Store address (provided automatically)' : 'Endereço da loja (fornecido automaticamente)',
    yourWalletAddress: isEnglish ? 'Your Wallet Address (source of funds):' : 'Seu Endereço de Carteira (origem dos fundos):',
    walletPlaceholder: isEnglish ? 'Paste your Signet wallet address (tb1...)' : 'Cole o endereço da sua carteira Signet (tb1...)',
    addressRecovered: isEnglish ? '✓ Address recovered from wallet you created in Module 2' : '✓ Endereço recuperado da carteira que você criou no Módulo 2',
    noWalletFound: isEnglish ? 'We did not find a saved wallet. Use the address of the wallet you created in Module 2.' : 'Não encontramos uma carteira salva. Use o endereço da carteira que você criou no Módulo 2.',
    createWallet: isEnglish ? 'Create Wallet' : 'Criar Carteira',
    transactionFees: isEnglish ? 'Transaction Fees:' : 'Taxas de Transação:',
    confirmPayment: isEnglish ? 'Confirm Payment' : 'Confirmar Pagamento',
    processing: isEnglish ? 'Processing Transaction...' : 'Processando Transação...',
    processingDesc: isEnglish ? 'Your transaction is being processed on the Signet network.' : 'Sua transação está sendo processada na rede Signet.',
    success: isEnglish ? '🎉 Transaction Successful!' : '🎉 Transação Realizada com Sucesso!',
    successDesc: isEnglish ? 'Your Bitcoin transaction was completed successfully!' : 'Sua transação Bitcoin foi concluída com sucesso!',
    transactionId: isEnglish ? 'Transaction ID:' : 'ID da Transação:',
    copied: isEnglish ? 'Copied!' : 'Copiado!',
    copy: isEnglish ? 'Copy' : 'Copiar',
    newTransaction: isEnglish ? 'New Transaction' : 'Nova Transação',
    enterWallet: isEnglish ? 'Please enter your wallet address' : 'Por favor, insira o endereço da sua carteira',
    confirmationTime: isEnglish ? 'Estimated confirmation time:' : 'Tempo estimado de confirmação:',
    summary: isEnglish ? 'Transaction Summary:' : 'Resumo da Transação:',
    educationalSimulation: isEnglish ? '💡 Educational Simulation: This is a simulated purchasing experience for you to practice sending Bitcoin transactions with different fee levels.' : '💡 Simulação Educativa: Esta é uma experiência de compra simulada para você praticar envio de transações Bitcoin com diferentes níveis de taxa.',
    chooseProduct: isEnglish ? '🛍️ Choose a product:' : '🛍️ Escolha um produto:',
    feeLevel: isEnglish ? 'Fee Level (affects confirmation speed):' : 'Nível de Taxa (afeta velocidade de confirmação):',
    feeTip: isEnglish ? '💡 Tip: During high demand periods, low fees may take much longer' : '💡 Dica: Em períodos de alta demanda, taxas baixas podem demorar muito mais',
    product: isEnglish ? 'Product:' : 'Produto:',
    amount: isEnglish ? 'Amount:' : 'Valor:',
    estimatedFee: isEnglish ? 'Estimated fee:' : 'Taxa estimada:',
    totalApprox: isEnglish ? 'Approximate total:' : 'Total aproximado:',
    sendTransaction: isEnglish ? 'Send Transaction' : 'Enviar Transação'
  }

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
      alert(t.enterWallet)
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
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              {t.educationalSimulation}
            </p>
          </div>

          {/* Step 1: Product Selection */}
          {currentStep === 'shop' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">{t.chooseProduct}</h3>
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
                        {t.select}
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
              <h3 className="text-lg font-semibold text-white mb-4">{t.shoppingCart}</h3>
              
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
                <span className="text-white font-medium">{t.total}</span>
                <span className="text-xl font-bold text-orange-400">{selectedProduct.price} sBTC</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setCurrentStep('shop')}
                  variant="outline"
                  className="border-gray-600"
                >
                  {t.back}
                </Button>
                <Button
                  onClick={handleCheckout}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {t.payWithBitcoin}
                  <CreditCard className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Configuration */}
          {currentStep === 'payment' && selectedProduct && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t.paymentConfig}</h3>
              
              {/* Destination Address */}
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                <h4 className="font-medium text-white mb-2">{t.destinationAddress}</h4>
                <div className="font-mono text-xs sm:text-sm text-gray-300 bg-gray-700 p-2 rounded break-all overflow-wrap-anywhere">
                  tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx
                </div>
                <p className="text-xs text-gray-500 mt-1">{t.storeAddress}</p>
              </div>

              {/* Your Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t.yourWalletAddress}
                </label>
                <div className="relative">
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder={t.walletPlaceholder}
                    className="bg-gray-800 border-gray-700 text-white pr-10 text-xs sm:text-sm font-mono break-all"
                  />
                  {hasStoredWallet && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {hasStoredWallet ? (
                  <p className="text-xs text-green-400 mt-1">
                    {t.addressRecovered}
                  </p>
                ) : (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      {t.noWalletFound}
                    </p>
                    <Button
                      onClick={() => window.open(isEnglish ? '/en/modules/2' : '/modules/2', '_blank')}
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 text-xs sm:text-sm whitespace-normal text-center py-2"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {t.createWallet}
                    </Button>
                  </div>
                )}
              </div>

              {/* Fee Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  {t.feeLevel}
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
                  {t.feeTip}
                </p>
              </div>

              {/* Transaction Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">{t.summary}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t.product}</span>
                    <span className="text-white">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t.amount}</span>
                    <span className="text-white">{selectedProduct.price} sBTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t.estimatedFee}</span>
                    <span className="text-white">~0.0001 sBTC ({selectedFee.satPerVB} sat/vB)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t.confirmationTime}</span>
                    <span className={selectedFee.color}>{selectedFee.estimatedTime}</span>
                  </div>
                  <hr className="border-gray-700" />
                  <div className="flex justify-between font-medium">
                    <span className="text-white">{t.totalApprox}</span>
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
                  {t.back}
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={!walletAddress.trim() || isProcessing}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {t.sendTransaction}
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
                <h3 className="text-lg font-semibold text-white">{t.processing}</h3>
              </div>
              <p className="text-gray-400">
                {t.processingDesc}
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  ⏱️ {t.confirmationTime} {selectedFee.estimatedTime}
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
                  <strong>{t.success}</strong> {t.successDesc}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-white">📄 {isEnglish ? 'Transaction Receipt' : 'Comprovante da Transação'}</h4>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-400">{t.product}</span>
                    <p className="font-medium text-white">{selectedProduct?.name}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">{isEnglish ? 'Amount Sent:' : 'Valor Enviado:'}</span>
                    <p className="font-mono text-orange-400">{selectedProduct?.price} sBTC</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">{isEnglish ? 'Fee Level:' : 'Nível de Taxa:'}</span>
                    <Badge className={`${selectedFee.color} bg-transparent border`}>
                      {selectedFee.label} ({selectedFee.satPerVB} sat/vB)
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">{t.transactionId}</span>
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
                          {t.copied}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          {isEnglish ? 'Copy TXID' : 'Copiar TXID'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <p className="text-orange-300 text-sm">
                  🎯 <strong>{isEnglish ? 'Success!' : 'Sucesso!'}</strong> {isEnglish ? 'The TXID has been automatically filled in the task field. Now you can validate the transaction!' : 'O TXID foi automaticamente preenchido no campo da tarefa. Agora você pode validar a transação!'}
                </p>
              </div>

              <Button
                onClick={resetSimulator}
                variant="outline"
                className="w-full border-gray-600"
              >
                {t.newTransaction}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}