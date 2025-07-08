'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { ExternalLink, Hash, Zap } from 'lucide-react'

interface TaprootTransactionCreatorProps {
  onTransactionCreated: (hash: string, address: string) => void
}

export default function TaprootTransactionCreator({ onTransactionCreated }: TaprootTransactionCreatorProps) {
  const [step, setStep] = useState<'address' | 'transaction' | 'broadcast'>('address')
  const [taprootAddress, setTaprootAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionHex, setTransactionHex] = useState('')
  const [transactionHash, setTransactionHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const generateTaprootAddress = () => {
    // Simula geração de endereço Taproot (tb1p para testnet/signet)
    const randomBytes = Array.from({ length: 62 }, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('')
    const address = `tb1p${randomBytes}`
    setTaprootAddress(address)
  }

  const createTaprootTransaction = async () => {
    if (!taprootAddress || !amount) return

    setIsLoading(true)

    try {
      // Simula criação de transação Taproot
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Gera hex de transação mock
      const txHex = `020000000001${Array.from({ length: 200 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`
      
      setTransactionHex(txHex)
      setStep('transaction')
    } catch (error) {
      console.error('Erro ao criar transação:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const broadcastTransaction = async () => {
    if (!transactionHex) return

    setIsLoading(true)

    try {
      // Simula broadcast da transação
      await new Promise(resolve => setTimeout(resolve, 1500))

      const txHash = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
      
      setTransactionHash(txHash)
      setStep('broadcast')
      
      onTransactionCreated(txHash, taprootAddress)
    } catch (error) {
      console.error('Erro ao transmitir transação:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Passo 1: Gerar Endereço Taproot */}
      {step === 'address' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hash className="h-5 w-5 text-orange-500 mr-2" />
              Gerar Endereço Taproot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-orange-400 mb-2">🔐 O que é Taproot?</h3>
              <p className="text-orange-300 text-sm">
                Taproot é uma atualização do Bitcoin que permite transações mais eficientes 
                e privadas usando assinaturas Schnorr. Endereços Taproot começam com "bc1p" na mainnet 
                ou "tb1p" na testnet/signet.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Endereço Taproot</Label>
              {taprootAddress ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-orange-500/20 text-orange-400">
                      P2TR (Taproot)
                    </Badge>
                    <Badge variant="outline">Signet</Badge>
                  </div>
                  <div className="bg-gray-900 p-3 rounded border">
                    <code className="text-sm break-all">{taprootAddress}</code>
                  </div>
                  <Button 
                    onClick={() => setStep('transaction')}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    Usar Este Endereço
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={generateTaprootAddress}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Gerar Endereço Taproot
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passo 2: Criar Transação */}
      {step === 'transaction' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 text-blue-500 mr-2" />
              Criar Transação Taproot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-900 p-3 rounded">
              <Label className="text-sm text-gray-400">Endereço Destino:</Label>
              <code className="text-xs break-all block mt-1">{taprootAddress}</code>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (sBTC)</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.001"
                type="number"
                step="0.001"
                className="bg-gray-900 border-gray-600"
              />
              <p className="text-xs text-gray-500">
                Valor em sBTC (Signet Bitcoin). Mínimo: 0.001 sBTC
              </p>
            </div>

            {transactionHex ? (
              <div className="space-y-3">
                <Alert>
                  <AlertDescription>
                    <strong>Transação Criada!</strong> Hex da transação gerado com sucesso.
                  </AlertDescription>
                </Alert>
                
                <div className="bg-gray-900 p-3 rounded">
                  <Label className="text-sm text-gray-400">Transaction Hex:</Label>
                  <textarea
                    value={transactionHex}
                    readOnly
                    className="w-full h-20 bg-transparent text-xs font-mono mt-1 resize-none"
                  />
                </div>

                <Button 
                  onClick={broadcastTransaction}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  {isLoading ? 'Transmitindo...' : 'Transmitir Transação'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  onClick={createTaprootTransaction}
                  disabled={isLoading || !amount}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {isLoading ? 'Criando...' : 'Criar Transação'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setStep('address')}
                  className="w-full border-gray-600"
                >
                  Voltar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Passo 3: Transação Transmitida */}
      {step === 'broadcast' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-green-400">
              <Zap className="h-5 w-5 mr-2" />
              Transação Transmitida com Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-green-400 mb-2">✅ Transação Confirmada</h3>
              <p className="text-green-300 text-sm">
                Sua transação Taproot foi transmitida para a rede Signet e será confirmada em breve.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-900 p-3 rounded">
                <Label className="text-sm text-gray-400">Transaction Hash:</Label>
                <code className="text-sm break-all block mt-1">{transactionHash}</code>
              </div>

              <div className="bg-gray-900 p-3 rounded">
                <Label className="text-sm text-gray-400">Endereço Taproot:</Label>
                <code className="text-xs break-all block mt-1">{taprootAddress}</code>
              </div>

              <div className="bg-gray-900 p-3 rounded">
                <Label className="text-sm text-gray-400">Valor:</Label>
                <span className="text-sm block mt-1">{amount} sBTC</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open(`https://mempool.space/signet/tx/${transactionHash}`, '_blank')}
                className="flex-1 border-gray-600"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver no Explorer
              </Button>
              <Button
                onClick={() => {
                  setStep('address')
                  setTaprootAddress('')
                  setAmount('')
                  setTransactionHex('')
                  setTransactionHash('')
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Nova Transação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre Taproot */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Vantagens do Taproot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-400">🔒 Privacidade</h4>
              <p className="text-sm text-gray-300">
                Transações complexas parecem transações simples, melhorando a privacidade
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-400">⚡ Eficiência</h4>
              <p className="text-sm text-gray-300">
                Assinaturas Schnorr reduzem o tamanho das transações multisig
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-400">🛠️ Flexibilidade</h4>
              <p className="text-sm text-gray-300">
                Permite contratos inteligentes mais sofisticados com MAST
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-400">🔗 Compatibilidade</h4>
              <p className="text-sm text-gray-300">
                Backward compatible - funciona com software Bitcoin existente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}