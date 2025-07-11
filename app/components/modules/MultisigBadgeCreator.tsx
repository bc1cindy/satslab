'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { CheckCircle, Circle, Users, Award } from 'lucide-react'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')

  // Translations
  const t = {
    multisigBadgeCreator: isEnglish ? 'Multisig Badge Creator' : 'Criador de Badge Multisig',
    createFinalBadge: isEnglish ? 'Create your final badge using multisig signature' : 'Crie seu badge final usando assinatura multisig',
    selectTwoKeys: isEnglish ? 'Select 2 Keys for Signing' : 'Selecione 2 Chaves para Assinatura',
    chooseKeys: isEnglish ? 'Choose which 2 keys will sign the badge transaction:' : 'Escolha quais 2 chaves vão assinar a transação do badge:',
    key: isEnglish ? 'Key' : 'Chave',
    createBadge: isEnglish ? 'Create Badge' : 'Criar Badge',
    selectExactlyTwoKeys: isEnglish ? 'Select exactly 2 keys' : 'Selecione exatamente 2 chaves',
    badgeCreationProcess: isEnglish ? 'Badge Creation Process' : 'Processo de Criação do Badge',
    creatingTransaction: isEnglish ? 'Creating multisig transaction...' : 'Criando transação multisig...',
    signingWithKey: isEnglish ? 'Signing with key {0}...' : 'Assinando com chave {0}...',
    broadcastingTransaction: isEnglish ? 'Broadcasting transaction...' : 'Transmitindo transação...',
    mintingBadge: isEnglish ? 'Minting badge...' : 'Mintando badge...',
    badgeCreatedSuccessfully: isEnglish ? 'Badge Created Successfully!' : 'Badge Criado com Sucesso!',
    finalBadgeId: isEnglish ? 'Final Badge ID' : 'ID do Badge Final',
    viewOnExplorer: isEnglish ? 'View on Explorer' : 'Ver no Explorer',
    whatYouAchieved: isEnglish ? 'What you achieved:' : 'O que você conquistou:',
    createdMultisigWallet: isEnglish ? 'Created a 2-of-3 multisig wallet' : 'Criou uma carteira multisig 2-de-3',
    signedCollaboratively: isEnglish ? 'Signed a transaction collaboratively' : 'Assinou uma transação colaborativamente',
    mintedSecureBadge: isEnglish ? 'Minted a secure badge using multiple signatures' : 'Mintou um badge seguro usando múltiplas assinaturas',
    masteredAdvancedSecurity: isEnglish ? 'Mastered advanced Bitcoin security!' : 'Dominou segurança avançada do Bitcoin!',
    noWalletSelected: isEnglish ? 'No multisig wallet available. Please create one first.' : 'Nenhuma carteira multisig disponível. Crie uma primeiro.',
    insufficientKeys: isEnglish ? 'Insufficient keys available for multisig operation.' : 'Chaves insuficientes disponíveis para operação multisig.'
  }

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

      // Simula broadcast e criação da inscrição
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const inscriptionId = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
      
      setBadgeId(inscriptionId)
      
      if (onBadgeCreated) {
        onBadgeCreated(inscriptionId)
      }
    } catch (error) {
      console.error(isEnglish ? 'Error creating multisig badge:' : 'Erro ao criar badge multisig:', error)
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
            {isEnglish ? 'Multisig Wallet Required' : 'Carteira Multisig Necessária'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              {t.noWalletSelected}
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
            {t.badgeCreatedSuccessfully}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-green-400 mb-2">🏆 {isEnglish ? 'Badge "Multisig Master" Minted!' : 'Badge "Mestre Multisig" Mintado!'}</h3>
            <p className="text-green-300 text-sm">
              {isEnglish ? 'Your NFT badge was successfully created using multisig signatures.' : 'Seu badge NFT foi criado com sucesso usando assinaturas multisig.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-900 p-3 rounded">
              <p className="text-sm text-gray-400">{t.finalBadgeId}:</p>
              <code className="text-sm break-all block mt-1">{badgeId}</code>
            </div>

            <div className="bg-gray-900 p-3 rounded">
              <p className="text-sm text-gray-400">{isEnglish ? 'Multisig Wallet' : 'Carteira Multisig'}:</p>
              <code className="text-xs break-all block mt-1">{multisigWallet.address}</code>
            </div>

            <div className="bg-gray-900 p-3 rounded">
              <p className="text-sm text-gray-400">{isEnglish ? 'Keys Used' : 'Chaves Usadas'}:</p>
              <div className="text-xs mt-1">
                {selectedKeys.map((keyIndex, i) => (
                  <div key={i} className="font-mono">
                    {t.key} {keyIndex + 1}: {multisigKeys[keyIndex].publicKey.substring(0, 20)}...
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
              {t.viewOnExplorer}
            </Button>
            <Button
              onClick={resetProcess}
              className="flex-1 bg-purple-500 hover:bg-purple-600"
            >
              {isEnglish ? 'Create New Badge' : 'Criar Novo Badge'}
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
          {t.multisigBadgeCreator}
        </CardTitle>
        <CardDescription>
          {t.createFinalBadge}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações da Carteira Multisig */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-purple-400 mb-2">📝 {isEnglish ? 'Multisig Wallet Data' : 'Dados da Carteira Multisig'}</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">{isEnglish ? 'Address' : 'Endereço'}:</span>
              <code className="block text-xs sm:text-sm font-mono mt-1 bg-gray-800 p-2 rounded break-all word-break-all overflow-wrap-anywhere">
                {multisigWallet.address}
              </code>
            </div>
            <div>
              <span className="text-gray-400">{isEnglish ? 'Configuration' : 'Configuração'}:</span>
              <Badge className="ml-2 bg-purple-500/20 text-purple-400">
                {multisigWallet.m}-{isEnglish ? 'of' : 'de'}-{multisigWallet.n}
              </Badge>
            </div>
            <div>
              <span className="text-gray-400">{isEnglish ? 'Type' : 'Tipo'}:</span>
              <Badge className="ml-2 bg-blue-500/20 text-blue-400">
                {multisigWallet.type?.toUpperCase() || 'P2WSH'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Seleção de Chaves */}
        <div className="space-y-4">
          <h3 className="font-semibold">{t.selectTwoKeys}</h3>
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
                      <div className="font-medium">{t.key} {index + 1}</div>
                      <div className="text-xs text-gray-400 font-mono">
                        {key.publicKey.substring(0, 30)}...
                      </div>
                    </div>
                  </div>
                  {selectedKeys.includes(index) && (
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {isEnglish ? 'Selected' : 'Selecionada'}
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
                    <span>{t.creatingTransaction}</span>
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
                          <span>{t.signingWithKey.replace('{0}', (selectedKeys[i] + 1).toString())}</span>
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
            {isCreating ? (isEnglish ? 'Creating Multisig Badge...' : 'Criando Badge Multisig...') : 
             selectedKeys.length === 2 ? (isEnglish ? 'Create "Multisig Master" Badge' : 'Criar Badge "Mestre Multisig"') : 
             (isEnglish ? `Select 2 keys (${selectedKeys.length}/2)` : `Selecione 2 chaves (${selectedKeys.length}/2)`)}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            {isEnglish 
              ? `The badge will be created using the ${selectedKeys.length} selected keys to sign the multisig transaction`
              : `O badge será criado usando as ${selectedKeys.length} chaves selecionadas para assinar a transação multisig`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}