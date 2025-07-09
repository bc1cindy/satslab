'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { CheckCircle, Circle, Users, Award } from 'lucide-react'

interface MultisigBadgeCreatorProps {
  multisigWallet?: any
  multisigKeys?: any[]
  onBadgeCreated?: (badgeId: string) => void
}

export default function MultisigBadgeCreator({ multisigWallet, multisigKeys, onBadgeCreated }: MultisigBadgeCreatorProps) {
  const [selectedKeys, setSelectedKeys] = useState<number[]>([])
  const [currentSignature, setCurrentSignature] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [transactionCreated, setTransactionCreated] = useState(false)
  const [badgeId, setBadgeId] = useState('')

  const handleKeySelection = (keyIndex: number) => {
    if (selectedKeys.includes(keyIndex)) {
      setSelectedKeys(selectedKeys.filter(i => i !== keyIndex))
    } else if (selectedKeys.length < 2) {
      setSelectedKeys([...selectedKeys, keyIndex])
    }
  }

  const createMultisigBadge = async () => {
    if (!multisigWallet || selectedKeys.length !== 2) return

    setIsCreating(true)
    setTransactionCreated(false)

    try {
      // Simula criação de transação multisig
      await new Promise(resolve => setTimeout(resolve, 2000))
      setTransactionCreated(true)
      setCurrentSignature(0)

      // Simula processo de assinatura
      for (let i = 0; i < 2; i++) {
        setCurrentSignature(i)
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      // Simula broadcast e criação do ordinal
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const ordinalId = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
      
      setBadgeId(ordinalId)
      
      if (onBadgeCreated) {
        onBadgeCreated(ordinalId)
      }
    } catch (error) {
      console.error('Erro ao criar badge multisig:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const resetProcess = () => {
    setSelectedKeys([])
    setCurrentSignature(0)
    setTransactionCreated(false)
    setBadgeId('')
  }

  if (!multisigWallet || !multisigKeys) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-red-400">
            <Users className="h-5 w-5 mr-2" />
            Carteira Multisig Necessária
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Você precisa criar uma carteira multisig primeiro para mintar o badge NFT usando múltiplas assinaturas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (badgeId) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-green-400">
            <Award className="h-5 w-5 mr-2" />
            Badge Multisig Criado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-green-400 mb-2">🏆 Badge "Mestre Multisig" Mintado!</h3>
            <p className="text-green-300 text-sm">
              Seu badge NFT foi criado com sucesso usando assinaturas multisig.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-900 p-3 rounded">
              <p className="text-sm text-gray-400">Badge ID (Ordinal):</p>
              <code className="text-sm break-all block mt-1">{badgeId}</code>
            </div>

            <div className="bg-gray-900 p-3 rounded">
              <p className="text-sm text-gray-400">Carteira Multisig:</p>
              <code className="text-xs break-all block mt-1">{multisigWallet.address}</code>
            </div>

            <div className="bg-gray-900 p-3 rounded">
              <p className="text-sm text-gray-400">Chaves Usadas:</p>
              <div className="text-xs mt-1">
                {selectedKeys.map((keyIndex, i) => (
                  <div key={i} className="font-mono">
                    Chave {keyIndex + 1}: {multisigKeys[keyIndex].publicKey.substring(0, 20)}...
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => window.open(`https://mempool.space/signet/tx/${badgeId.split(':')[0]}`, '_blank')}
              className="flex-1 border-gray-600"
            >
              Ver no Explorer
            </Button>
            <Button
              onClick={resetProcess}
              className="flex-1 bg-purple-500 hover:bg-purple-600"
            >
              Criar Novo Badge
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 text-purple-500 mr-2" />
          Criador de Badge Multisig
        </CardTitle>
        <CardDescription>
          Minte seu badge NFT "Mestre Multisig" usando assinaturas da carteira multisig
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações da Carteira Multisig */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-purple-400 mb-2">📝 Dados da Carteira Multisig</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Endereço:</span>
              <code className="block text-xs font-mono mt-1">{multisigWallet.address}</code>
            </div>
            <div>
              <span className="text-gray-400">Configuração:</span>
              <Badge className="ml-2 bg-purple-500/20 text-purple-400">
                {multisigWallet.m}-de-{multisigWallet.n}
              </Badge>
            </div>
            <div>
              <span className="text-gray-400">Tipo:</span>
              <Badge className="ml-2 bg-blue-500/20 text-blue-400">
                {multisigWallet.type?.toUpperCase() || 'P2WSH'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Seleção de Chaves */}
        <div className="space-y-4">
          <h3 className="font-semibold">Selecione 2 Chaves para Assinar</h3>
          <div className="space-y-3">
            {multisigKeys.map((key, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedKeys.includes(index)
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
                onClick={() => handleKeySelection(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {selectedKeys.includes(index) ? (
                      <CheckCircle className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <div className="font-medium">Chave {index + 1}</div>
                      <div className="text-xs text-gray-400 font-mono">
                        {key.publicKey.substring(0, 30)}...
                      </div>
                    </div>
                  </div>
                  {selectedKeys.includes(index) && (
                    <Badge className="bg-purple-500/20 text-purple-400">
                      Selecionada
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status da Criação */}
        {isCreating && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Criando transação multisig...</span>
                    {transactionCreated && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  
                  {transactionCreated && (
                    <div className="ml-4 space-y-1">
                      {[0, 1].map((i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            i <= currentSignature ? 'bg-green-500' : 
                            i === currentSignature + 1 ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
                          }`}></div>
                          <span>Assinando com chave {selectedKeys[i] + 1}...</span>
                          {i <= currentSignature && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Botão de Criação */}
        <div className="space-y-2">
          <Button
            onClick={createMultisigBadge}
            disabled={selectedKeys.length !== 2 || isCreating}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            {isCreating ? 'Criando Badge Multisig...' : 
             selectedKeys.length === 2 ? 'Criar Badge "Mestre Multisig"' : 
             `Selecione 2 chaves (${selectedKeys.length}/2)`}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            O badge será criado usando as {selectedKeys.length} chaves selecionadas para assinar a transação multisig
          </p>
        </div>
      </CardContent>
    </Card>
  )
}