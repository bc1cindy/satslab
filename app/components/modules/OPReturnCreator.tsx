'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Separator } from '@/app/components/ui/separator'
import { 
  FileText, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Hash,
  Clock,
  Archive,
  Globe
} from 'lucide-react'
import { Transaction } from '@/app/types'

interface OPReturnCreatorProps {
  walletAddress?: string
  onTransactionCreated?: (transaction: Transaction) => void
}

/**
 * Componente para criar transações OP_RETURN
 * Permite gravar dados permanentemente na blockchain
 */
export default function OPReturnCreator({ 
  walletAddress, 
  onTransactionCreated 
}: OPReturnCreatorProps) {
  const [message, setMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null)
  const [feeRate, setFeeRate] = useState(5)

  // Templates comuns para OP_RETURN
  const messageTemplates = [
    { id: 'love', label: 'Eu amo Bitcoin', message: 'Eu amo Bitcoin' },
    { id: 'timestamp', label: 'Timestamp', message: `Timestamp: ${new Date().toISOString()}` },
    { id: 'hello', label: 'Olá Mundo', message: 'Olá, mundo Bitcoin!' },
    { id: 'custom', label: 'Personalizada', message: '' }
  ]

  const maxBytes = 80
  const messageBytes = new TextEncoder().encode(message).length
  const remainingBytes = maxBytes - messageBytes

  // Calcula custo da transação OP_RETURN
  const estimatedSize = 250 // vB (um pouco maior que transação normal)
  const estimatedFee = (estimatedSize * feeRate) / 100000000

  const handleTemplateSelect = (template: typeof messageTemplates[0]) => {
    setSelectedTemplate(template.id)
    if (template.id !== 'custom') {
      setMessage(template.message)
    }
  }

  const validateMessage = () => {
    if (!message.trim()) return 'Mensagem é obrigatória'
    if (messageBytes > maxBytes) return `Mensagem muito longa (${messageBytes}/${maxBytes} bytes)`
    return null
  }

  const createOPReturnTransaction = async () => {
    const error = validateMessage()
    if (error) {
      alert(error)
      return
    }

    setIsCreating(true)
    
    // Simula criação da transação
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock transaction data
    const mockTransaction: Transaction = {
      txId: `${Math.random().toString(16).substr(2, 8)}${'c'.repeat(56)}`,
      amount: 0, // OP_RETURN não transfere valor
      fee: estimatedFee,
      inputs: [{
        txId: `${Math.random().toString(16).substr(2, 8)}${'d'.repeat(56)}`,
        outputIndex: 0,
        scriptSig: 'mock_script_sig',
        sequence: 0xffffffff
      }],
      outputs: [
        {
          value: 0,
          scriptPubKey: `OP_RETURN ${Buffer.from(message, 'utf8').toString('hex')}`,
          address: undefined
        }
      ],
      confirmations: 0
    }
    
    setCreatedTransaction(mockTransaction)
    onTransactionCreated?.(mockTransaction)
    setIsCreating(false)
  }

  return (
    <div className="space-y-6">
      {/* Educação sobre OP_RETURN */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Info className="h-5 w-5" />
            O que é OP_RETURN?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">
                Armazenamento Permanente
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                OP_RETURN permite gravar até 80 bytes de dados diretamente na blockchain Bitcoin, 
                criando um registro permanente e imutável.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">
                Casos de Uso
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Timestamps e certificados</li>
                <li>• Mensagens comemorativas</li>
                <li>• Provas de existência</li>
                <li>• Metadados de aplicações</li>
              </ul>
            </div>
          </div>
          
          <Alert className="border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-800/20">
            <Archive className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Importante:</strong> Dados em OP_RETURN são "unspendable" - não podem ser gastos, 
              mas ficam para sempre na blockchain.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Seletor de Template */}
      <Card>
        <CardHeader>
          <CardTitle>Escolha um Template</CardTitle>
          <CardDescription>
            Selecione uma mensagem predefinida ou crie uma personalizada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {messageTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{template.label}</div>
                {template.message && (
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {template.message}
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor de Mensagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sua Mensagem
          </CardTitle>
          <CardDescription>
            Digite a mensagem que será gravada permanentemente na blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Mensagem</Label>
              <Badge variant={remainingBytes >= 0 ? "default" : "destructive"}>
                {messageBytes}/{maxBytes} bytes
              </Badge>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="min-h-20"
            />
            <p className="text-xs text-muted-foreground">
              {remainingBytes >= 0 
                ? `${remainingBytes} bytes restantes` 
                : `${Math.abs(remainingBytes)} bytes excedidos`
              }
            </p>
          </div>

          {/* Preview em Hexadecimal */}
          {message && (
            <div className="space-y-2">
              <Label>Preview (Hexadecimal)</Label>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <code className="text-xs font-mono break-all">
                  {Buffer.from(message, 'utf8').toString('hex')}
                </code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração de Taxa */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da Taxa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Taxa (sat/vB)</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={feeRate}
                onChange={(e) => setFeeRate(Number(e.target.value))}
                min="1"
                max="100"
                className="w-24"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeeRate(2)}
                >
                  Baixa (2)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeeRate(5)}
                >
                  Média (5)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeeRate(10)}
                >
                  Alta (10)
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <Label className="text-sm text-muted-foreground">Tamanho Estimado</Label>
              <p className="font-medium">{estimatedSize} vB</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Taxa Total</Label>
              <p className="font-medium">{estimatedFee.toFixed(8)} sBTC</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo e Criação */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Transação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Valor transferido:</span>
              <span>0 sBTC (apenas dados)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxa de mineração:</span>
              <span>{estimatedFee.toFixed(8)} sBTC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Dados armazenados:</span>
              <span>{messageBytes} bytes</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Custo total:</span>
              <span>{estimatedFee.toFixed(8)} sBTC</span>
            </div>
          </div>

          <Button
            onClick={createOPReturnTransaction}
            disabled={isCreating || !!validateMessage()}
            className="w-full"
          >
            {isCreating ? 'Criando...' : 'Criar Transação OP_RETURN'}
          </Button>

          {validateMessage() && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {validateMessage()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Transação Criada */}
      {createdTransaction && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Transação OP_RETURN Criada!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ID da Transação</Label>
              <div className="p-2 bg-white dark:bg-gray-800 rounded font-mono text-sm break-all border">
                {createdTransaction.txId}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Mensagem Gravada</Label>
              <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                <p className="text-sm">{message}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Dados Hexadecimais</Label>
              <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                <code className="text-xs font-mono break-all">
                  {Buffer.from(message, 'utf8').toString('hex')}
                </code>
              </div>
            </div>
            
            <Alert className="border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-800/20">
              <Globe className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Parabéns!</strong> Sua mensagem agora faz parte permanente da blockchain Bitcoin. 
                Ela pode ser vista por qualquer pessoa, para sempre.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}