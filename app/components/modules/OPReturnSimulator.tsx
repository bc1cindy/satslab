'use client'

import React, { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Textarea } from '@/app/components/ui/textarea'
import { 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Check,
  Zap,
  TrendingUp,
  TrendingDown,
  FileText,
  Hash,
  Lock,
  Info
} from 'lucide-react'
import { usePathname } from 'next/navigation'

interface OPReturnSimulatorProps {
  onTransactionSent?: (txid: string) => void
}

interface FeeLevel {
  level: 'high' | 'medium' | 'low'
  label: string
  satPerVB: number
  estimatedTime: string
  color: string
  icon: React.ReactNode
}

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

export default function OPReturnSimulator({ onTransactionSent }: OPReturnSimulatorProps) {
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')
  const feeOptions = getFeeOptions(isEnglish)
  
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'confirming' | 'complete'>('input')
  const [message, setMessage] = useState('')
  const [selectedFee, setSelectedFee] = useState<FeeLevel>(feeOptions[1]) // Default to medium
  const [walletAddress, setWalletAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [copied, setCopied] = useState(false)
  const [hasStoredWallet, setHasStoredWallet] = useState(false)
  const [hexData, setHexData] = useState('')

  // Translations
  const t = {
    title: isEnglish ? 'OP_RETURN Transaction Builder' : 'Construtor de Transação OP_RETURN',
    whatIsOpReturn: isEnglish ? '💡 What is OP_RETURN?' : '💡 O que é OP_RETURN?',
    opReturnDesc: isEnglish ? 'It is a special opcode that allows recording up to 80 bytes of data permanently on the Bitcoin blockchain. The data becomes immutable and public forever!' : 'É um opcode especial que permite gravar até 80 bytes de dados permanentemente na blockchain Bitcoin. Os dados ficam imutáveis e públicos para sempre!',
    messageLabel: isEnglish ? 'Message to record on blockchain:' : 'Mensagem para gravar na blockchain:',
    messagePlaceholder: isEnglish ? 'Type your message here (e.g., I love Bitcoin)' : 'Digite sua mensagem aqui (ex: Eu amo Bitcoin)',
    maxBytes: isEnglish ? 'Maximum: 80 bytes' : 'Máximo: 80 bytes',
    hexData: isEnglish ? 'Hexadecimal Data:' : 'Dados em Hexadecimal:',
    walletLabel: isEnglish ? 'Your Wallet Address:' : 'Seu Endereço de Carteira:',
    walletPlaceholder: isEnglish ? 'Paste your Signet wallet address (tb1...)' : 'Cole o endereço da sua carteira Signet (tb1...)',
    addressRecovered: isEnglish ? '✓ Address recovered from Module 2 wallet' : '✓ Endereço recuperado da carteira do Módulo 2',
    addressNotice: isEnglish ? 'Use the wallet address you created in Module 2' : 'Use o endereço da carteira que você criou no Módulo 2',
    feeLevel: isEnglish ? 'Fee Level:' : 'Nível de Taxa:',
    reviewTransaction: isEnglish ? 'Review Transaction' : 'Revisar Transação',
    attention: isEnglish ? 'Attention:' : 'Atenção:',
    permanentData: isEnglish ? 'Once recorded on the blockchain, this data will be permanent and public forever. Make sure it does not contain sensitive information!' : 'Uma vez gravados na blockchain, estes dados serão permanentes e públicos para sempre. Certifique-se de que não contêm informações sensíveis!',
    transactionSummary: isEnglish ? '📄 OP_RETURN Transaction Summary:' : '📄 Resumo da Transação OP_RETURN:',
    transactionType: isEnglish ? 'Transaction Type:' : 'Tipo de Transação:',
    opReturnType: isEnglish ? 'OP_RETURN (Blockchain Data)' : 'OP_RETURN (Dados na Blockchain)',
    message: isEnglish ? 'Message:' : 'Mensagem:',
    hexDataLabel: isEnglish ? 'Hex Data:' : 'Dados em Hex:',
    hexFormat: isEnglish ? 'Format: OP_RETURN (6a) + size + data' : 'Formato: OP_RETURN (6a) + tamanho + dados',
    yourAddress: isEnglish ? 'Your Address:' : 'Seu Endereço:',
    selectedFee: isEnglish ? 'Selected Fee:' : 'Taxa Selecionada:',
    estimatedCost: isEnglish ? 'Estimated Cost:' : 'Custo Estimado:',
    networkFeeOnly: isEnglish ? '~0.00015 sBTC (network fee only)' : '~0.00015 sBTC (apenas taxa de rede)',
    note: isEnglish ? 'Note:' : 'Nota:',
    noteText: isEnglish ? 'OP_RETURN transactions do not transfer value, they only record data. The only cost is the network fee for miners.' : 'Transações OP_RETURN não transferem valor, apenas gravam dados. O único custo é a taxa de rede para os mineradores.',
    back: isEnglish ? 'Back' : 'Voltar',
    sendTransaction: isEnglish ? 'Send Transaction' : 'Enviar Transação',
    recordingOnBlockchain: isEnglish ? 'Recording on Blockchain...' : 'Gravando na Blockchain...',
    recordingDesc: isEnglish ? 'Your message is being permanently recorded on the Signet blockchain.' : 'Sua mensagem está sendo gravada permanentemente na blockchain Signet.',
    estimatedTime: isEnglish ? 'Estimated time:' : 'Tempo estimado:',
    messageRecorded: isEnglish ? 'Message Recorded!' : 'Mensagem Gravada!',
    messageRecordedDesc: isEnglish ? 'Your message has been permanently recorded on the blockchain.' : 'Sua mensagem foi gravada permanentemente na blockchain.',
    receipt: isEnglish ? '📄 Transaction Receipt' : '📄 Comprovante da Transação',
    type: isEnglish ? 'Type:' : 'Tipo:',
    permanentData: isEnglish ? 'OP_RETURN - Permanent Data' : 'OP_RETURN - Dados Permanentes',
    recordedMessage: isEnglish ? 'Recorded Message:' : 'Mensagem Gravada:',
    usedFee: isEnglish ? 'Used Fee:' : 'Taxa Utilizada:',
    transactionId: isEnglish ? 'Transaction ID (TXID):' : 'ID da Transação (TXID):',
    copied: isEnglish ? 'Copied!' : 'Copiado!',
    copyTxid: isEnglish ? 'Copy TXID' : 'Copiar TXID',
    success: isEnglish ? 'Success!' : 'Sucesso!',
    successDesc: isEnglish ? 'The TXID has been automatically filled in the task field. Your message is now part of Bitcoin history!' : 'O TXID foi automaticamente preenchido no campo da tarefa. Sua mensagem agora faz parte da história do Bitcoin!',
    curiosity: isEnglish ? '🔍 Fun Fact:' : '🔍 Curiosidade:',
    curiosityText: isEnglish ? `Your message "${message}" is now recorded forever on the blockchain. Anyone in the world can verify and read this message through the TXID!` : `Sua mensagem "${message}" agora está gravada para sempre na blockchain. Qualquer pessoa no mundo pode verificar e ler essa mensagem através do TXID!`,
    createNewMessage: isEnglish ? 'Create New Message' : 'Criar Nova Mensagem',
    fillRequiredFields: isEnglish ? 'Please fill in the message and wallet address' : 'Por favor, preencha a mensagem e o endereço da carteira'
  }

  // Busca o endereço salvo quando o componente monta
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAddress = localStorage.getItem('satslab_user_address')
      if (savedAddress) {
        setWalletAddress(savedAddress)
        setHasStoredWallet(true)
      }
    }
  }, [])

  const stringToHex = (str: string): string => {
    return Array.from(str)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  }

  const generateTxid = (): string => {
    return Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')
  }

  const handleMessageInput = (value: string) => {
    // Limita a 80 bytes (OP_RETURN limit)
    const encoder = new TextEncoder()
    const bytes = encoder.encode(value)
    if (bytes.length <= 80) {
      setMessage(value)
      setHexData(stringToHex(value))
    }
  }

  const handlePreview = () => {
    if (!message.trim() || !walletAddress.trim()) {
      alert(t.fillRequiredFields)
      return
    }
    setCurrentStep('preview')
  }

  const handleSendTransaction = async () => {
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
    setCurrentStep('input')
    setMessage('')
    setHexData('')
    setTransactionId('')
    setCopied(false)
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <MessageSquare className="h-6 w-6 mr-3 text-orange-500" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              <strong>{t.whatIsOpReturn}</strong> {t.opReturnDesc}
            </p>
          </div>

          {/* Step 1: Message Input */}
          {currentStep === 'input' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t.messageLabel}
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => handleMessageInput(e.target.value)}
                  placeholder={t.messagePlaceholder}
                  className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  maxLength={80}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{t.maxBytes}</span>
                  <span>{new TextEncoder().encode(message).length}/80 bytes</span>
                </div>
              </div>

              {message && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">{t.hexData}</h4>
                  <p className="font-mono text-xs text-green-400 break-all">{hexData}</p>
                </div>
              )}

              {/* Your Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t.walletLabel}
                </label>
                <div className="relative">
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder={t.walletPlaceholder}
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
                    {t.addressRecovered}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    {t.addressNotice}
                  </p>
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
              </div>

              <Button
                onClick={handlePreview}
                disabled={!message.trim() || !walletAddress.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {t.reviewTransaction}
                <FileText className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Preview */}
          {currentStep === 'preview' && (
            <div className="space-y-6">
              <Alert className="bg-yellow-500/10 border-yellow-500/20">
                <Lock className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-400">
                  <strong>{t.attention}</strong> {t.permanentData}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-white mb-3">{t.transactionSummary}</h4>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-400">{t.transactionType}</span>
                    <p className="font-medium text-white">{t.opReturnType}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">{t.message}</span>
                    <p className="font-medium text-white bg-gray-700 p-2 rounded mt-1">
                      "{message}"
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">{t.hexDataLabel}</span>
                    <p className="font-mono text-xs text-green-400 break-all bg-gray-700 p-2 rounded mt-1">
                      6a{hexData.length.toString(16).padStart(2, '0')}{hexData}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.hexFormat}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">{t.yourAddress}</span>
                    <p className="font-mono text-xs text-white break-all">{walletAddress}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">{t.selectedFee}</span>
                    <Badge className={`${selectedFee.color} bg-transparent border mt-1`}>
                      {selectedFee.label} ({selectedFee.satPerVB} sat/vB) - {selectedFee.estimatedTime}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">{t.estimatedCost}</span>
                    <p className="text-white">{t.networkFeeOnly}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-blue-400 mr-2 mt-0.5" />
                  <p className="text-blue-300 text-sm">
                    <strong>{t.note}</strong> {t.noteText}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setCurrentStep('input')}
                  variant="outline"
                  className="border-gray-600"
                >
                  {t.back}
                </Button>
                <Button
                  onClick={handleSendTransaction}
                  disabled={isProcessing}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {t.sendTransaction}
                  <Hash className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {currentStep === 'confirming' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-blue-500 animate-pulse mr-3" />
                <h3 className="text-lg font-semibold text-white">{t.recordingOnBlockchain}</h3>
              </div>
              <p className="text-gray-400">
                {t.recordingDesc}
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  ⏱️ {t.estimatedTime} {selectedFee.estimatedTime}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 'complete' && (
            <div className="space-y-6">
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  <strong>{t.messageRecorded}</strong> {t.messageRecordedDesc}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-white">{t.receipt}</h4>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-400">{t.type}</span>
                    <p className="font-medium text-white">{t.permanentData}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">{t.recordedMessage}</span>
                    <p className="font-medium text-white bg-gray-700 p-2 rounded mt-1">
                      "{message}"
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-400">{t.usedFee}</span>
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
                          {t.copyTxid}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <p className="text-orange-300 text-sm">
                  🎯 <strong>{t.success}</strong> {t.successDesc}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">{t.curiosity}</h4>
                <p className="text-sm text-gray-300">
                  {t.curiosityText}
                </p>
              </div>

              <Button
                onClick={resetSimulator}
                variant="outline"
                className="w-full border-gray-600"
              >
                {t.createNewMessage}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}