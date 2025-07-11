'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Badge } from '@/app/components/ui/badge'
import { Separator } from '@/app/components/ui/separator'
import { MultisigService, MultisigWallet, MultisigKey, MultisigTransaction } from '@/app/lib/bitcoin/multisig-service'
import { SIGNET_NETWORK } from '@/app/lib/bitcoin/bitcoin-crypto'
import { useToast } from '@/app/hooks/use-toast'
import { usePathname } from 'next/navigation'

interface MultisigCreatorProps {
  onWalletCreated?: (address: string) => void
  onWalletObjectCreated?: (wallet: MultisigWallet) => void
  onTransactionSigned?: (txId: string) => void
  onKeysGenerated?: (keys: MultisigKey[]) => void
}

export default function MultisigCreator({ onWalletCreated, onWalletObjectCreated, onTransactionSigned, onKeysGenerated }: MultisigCreatorProps) {
  const [multisigKeys, setMultisigKeys] = useState<MultisigKey[]>([])
  const [multisigWallet, setMultisigWallet] = useState<MultisigWallet | null>(null)
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')

  // Translations
  const t = {
    keysGenerated: isEnglish ? 'Keys Generated!' : 'Chaves Geradas!',
    keysGeneratedDesc: isEnglish ? '{0} private keys generated successfully' : '{0} chaves privadas geradas com sucesso',
    error: isEnglish ? 'Error' : 'Erro',
    errorGeneratingKeys: isEnglish ? 'Error generating keys' : 'Erro ao gerar chaves',
    walletCreated: isEnglish ? 'Wallet Created!' : 'Carteira Criada!',
    multisigWalletCreated: isEnglish ? 'Multisig wallet {0} created successfully' : 'Carteira multisig {0} criada com sucesso',
    errorCreatingWallet: isEnglish ? 'Error creating wallet' : 'Erro ao criar carteira',
    unknownError: isEnglish ? 'Unknown error' : 'Erro desconhecido',
    multisigTransactionCreated: isEnglish ? 'Multisig Transaction Created!' : 'Transação Multisig Criada!',
    requiresSignatures: isEnglish ? 'Requires {0} signatures out of {1} possible' : 'Requer {0} assinaturas de {1} possíveis',
    errorCreatingTransaction: isEnglish ? 'Error creating transaction' : 'Erro ao criar transação',
    transactionSigned: isEnglish ? 'Transaction Signed!' : 'Transação Assinada!',
    signatureAdded: isEnglish ? 'Signature {0} of {1} added' : 'Assinatura {0} de {1} adicionada',
    errorSigningTransaction: isEnglish ? 'Error signing transaction' : 'Erro ao assinar transação',
    transactionOrKeyNotAvailable: isEnglish ? 'Transaction or key not available' : 'Transação ou chave não disponível',
    fillRequiredFields: isEnglish ? 'Fill in all required fields' : 'Preencha todos os campos obrigatórios',
    multisigWallet: isEnglish ? 'Multisig Wallet' : 'Carteira Multisig',
    multisigWalletDescription: isEnglish ? 'Create multisig wallets that require multiple signatures for transactions' : 'Crie carteiras multisig que requerem múltiplas assinaturas para transações',
    setup: isEnglish ? 'Setup' : 'Setup',
    keys: isEnglish ? 'Keys' : 'Chaves',
    transaction: isEnglish ? 'Transaction' : 'Transação',
    advanced: isEnglish ? 'Advanced' : 'Avançado',
    requiredSignatures: isEnglish ? 'Required Signatures' : 'Assinaturas Necessárias',
    totalKeys: isEnglish ? 'Total Keys' : 'Total de Chaves',
    walletType: isEnglish ? 'Wallet Type' : 'Tipo de Carteira',
    generateKeys: isEnglish ? 'Generate {0} Private Keys' : 'Gerar {0} Chaves Privadas',
    createWallet: isEnglish ? 'Create {0}-of-{1} Wallet' : 'Criar Carteira {0}-de-{1}',
    multisigAddress: isEnglish ? 'Multisig Address' : 'Endereço Multisig',
    type: isEnglish ? 'Type' : 'Tipo',
    configuration: isEnglish ? 'Configuration' : 'Configuração',
    privateKeysGenerated: isEnglish ? 'Private Keys Generated' : 'Chaves Privadas Geradas',
    noKeysGenerated: isEnglish ? 'No keys generated. Go to "Setup" tab to generate keys.' : 'Nenhuma chave gerada. Vá para a aba "Setup" para gerar chaves.',
    publicKey: isEnglish ? 'Public Key' : 'Chave Pública',
    privateKey: isEnglish ? 'Private Key (WIF)' : 'Chave Privada (WIF)',
    select: isEnglish ? 'Select' : 'Selecionar',
    createMultisigFirst: isEnglish ? 'Create a multisig wallet first in the "Setup" tab' : 'Crie uma carteira multisig primeiro na aba "Setup"',
    recipientAddress: isEnglish ? 'Recipient Address' : 'Endereço Destinatário',
    amount: isEnglish ? 'Amount (sats)' : 'Valor (sats)',
    feeRate: isEnglish ? 'Fee Rate (sats/vB)' : 'Taxa (sats/vB)',
    estimatedFee: isEnglish ? 'Estimated fee' : 'Taxa estimada',
    creating: isEnglish ? 'Creating...' : 'Criando...',
    createTransaction: isEnglish ? 'Create Transaction' : 'Criar Transação',
    multisigTransactionCreated2: isEnglish ? 'Multisig Transaction Created' : 'Transação Multisig Criada',
    signatures: isEnglish ? 'Signatures' : 'Assinaturas',
    status: isEnglish ? 'Status' : 'Status',
    complete: isEnglish ? 'Complete' : 'Completa',
    pending: isEnglish ? 'Pending' : 'Pendente',
    fee: isEnglish ? 'Fee' : 'Taxa',
    txId: isEnglish ? 'TX ID' : 'TX ID',
    signingProcess: isEnglish ? 'Signing Process' : 'Processo de Assinatura',
    createTransactionFirst: isEnglish ? 'Create a multisig transaction first in the "Transaction" tab' : 'Crie uma transação multisig primeiro na aba "Transação"',
    signatureProgress: isEnglish ? 'Signature Progress' : 'Progresso das Assinaturas',
    signWithKeys: isEnglish ? 'Sign with Available Keys' : 'Assinar com Chaves Disponíveis',
    signed: isEnglish ? 'Signed' : 'Assinada',
    sign: isEnglish ? 'Sign' : 'Assinar',
    transactionComplete: isEnglish ? 'Transaction Complete!' : 'Transação Completa!',
    viewOnExplorer: isEnglish ? 'View on Explorer' : 'Ver no Explorer',
    multisigUseCases: isEnglish ? 'Multisig Use Cases' : 'Casos de Uso Multisig',
    corporateSecurity: isEnglish ? 'Corporate Security' : 'Segurança Corporativa',
    corporateSecurityDesc: isEnglish ? 'Companies use multisig to protect funds, requiring approval from multiple executives for transactions.' : 'Empresas usam multisig para proteger fundos, exigindo aprovação de múltiplos executivos para transações.',
    personalCustody: isEnglish ? 'Personal Custody' : 'Custódia Pessoal',
    personalCustodyDesc: isEnglish ? 'Individuals distribute keys across devices or locations to avoid single points of failure.' : 'Indivíduos distribuem chaves entre dispositivos ou locais para evitar ponto único de falha.',
    escrowServices: isEnglish ? 'Escrow Services' : 'Escrow Services',
    escrowServicesDesc: isEnglish ? 'Commercial transactions with neutral third party, releasing funds only with agreement from parties.' : 'Transações comerciais com terceiro neutro, liberando fundos apenas com acordo das partes.',
    inheritance: isEnglish ? 'Inheritance' : 'Inheritance',
    inheritanceDesc: isEnglish ? 'Digital inheritance where family members can access funds in specific situations.' : 'Herança digital onde familiares podem acessar fundos em situações específicas.'
  }
  const [m, setM] = useState(2)
  const [n, setN] = useState(3)
  const [walletType, setWalletType] = useState<'p2sh' | 'p2wsh' | 'p2tr'>('p2wsh')
  const [currentTransaction, setCurrentTransaction] = useState<MultisigTransaction | null>(null)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState(0)
  const [feeRate, setFeeRate] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [signingKeyIndex, setSigningKeyIndex] = useState(0)
  
  const { toast } = useToast()
  const multisigService = new MultisigService(SIGNET_NETWORK)

  const generateMultisigKeys = useCallback(() => {
    try {
      const keys = multisigService.generateMultisigKeys(n)
      setMultisigKeys(keys)
      
      toast({
        title: t.keysGenerated,
        description: t.keysGeneratedDesc.replace('{0}', n.toString()),
      })
      
      if (onKeysGenerated) {
        onKeysGenerated(keys)
      }
    } catch (error) {
      toast({
        title: t.errorGeneratingKeys,
        description: error instanceof Error ? error.message : t.unknownError,
        variant: "destructive",
      })
    }
  }, [n, multisigService, toast])

  const createMultisigWallet = useCallback(() => {
    if (multisigKeys.length !== n) {
      toast({
        title: t.error,
        description: isEnglish ? `Need ${n} keys to create ${m}-of-${n} wallet` : `Necessário ${n} chaves para criar carteira ${m}-de-${n}`,
        variant: "destructive",
      })
      return
    }

    try {
      const publicKeys = multisigKeys.map(key => key.publicKey)
      const wallet = multisigService.createMultisigWallet(publicKeys, m, n, walletType)
      setMultisigWallet(wallet)
      
      toast({
        title: t.walletCreated,
        description: `${isEnglish ? 'Address' : 'Endereço'}: ${wallet.address}`,
      })

      if (onWalletCreated) {
        onWalletCreated(wallet.address)
      }
      
      if (onWalletObjectCreated) {
        onWalletObjectCreated(wallet)
      }
    } catch (error) {
      toast({
        title: t.errorCreatingWallet,
        description: error instanceof Error ? error.message : t.unknownError,
        variant: "destructive",
      })
    }
  }, [multisigKeys, m, n, walletType, multisigService, toast, onWalletCreated])

  const createMultisigTransaction = useCallback(async () => {
    if (!multisigWallet || !recipientAddress || amount <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Para demonstração, criamos UTXOs mock
      const utxos = [{
        txid: '0'.repeat(64),
        vout: 0,
        value: amount + 10000, // valor + taxa
        redeemScript: multisigWallet.redeemScript,
      }]

      const outputs = [{
        address: recipientAddress,
        value: amount,
      }]

      const transaction = multisigService.createMultisigTransaction(
        multisigWallet,
        utxos,
        outputs,
        feeRate
      )

      setCurrentTransaction(transaction)
      
      toast({
        title: t.multisigTransactionCreated,
        description: t.requiresSignatures.replace('{0}', multisigWallet.m.toString()).replace('{1}', multisigWallet.n.toString()),
      })

    } catch (error) {
      toast({
        title: t.errorCreatingTransaction,
        description: error instanceof Error ? error.message : t.unknownError,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }, [multisigWallet, recipientAddress, amount, feeRate, multisigService, toast])

  const signTransaction = useCallback((keyIndex: number) => {
    if (!currentTransaction || !multisigKeys[keyIndex]) {
      toast({
        title: t.error,
        description: t.transactionOrKeyNotAvailable,
        variant: "destructive",
      })
      return
    }

    try {
      const privateKey = multisigKeys[keyIndex].wif
      const signedTransaction = multisigService.signMultisigTransaction(
        currentTransaction,
        privateKey,
        0 // primeiro input
      )

      setCurrentTransaction(signedTransaction)
      
      toast({
        title: t.transactionSigned,
        description: t.signatureAdded.replace('{0}', signedTransaction.signatures.size.toString()).replace('{1}', signedTransaction.requiredSignatures.toString()),
      })

      if (signedTransaction.isComplete && onTransactionSigned) {
        onTransactionSigned(signedTransaction.txId)
      }

    } catch (error) {
      toast({
        title: t.errorSigningTransaction,
        description: error instanceof Error ? error.message : t.unknownError,
        variant: "destructive",
      })
    }
  }, [currentTransaction, multisigKeys, multisigService, toast, onTransactionSigned])

  const estimateMultisigFee = useCallback(() => {
    return multisigService.estimateMultisigFee(1, 1, m, n, walletType, feeRate)
  }, [m, n, walletType, feeRate, multisigService])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.multisigWallet}</CardTitle>
          <CardDescription>
            {t.multisigWalletDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="setup" className="text-xs sm:text-sm">{t.setup}</TabsTrigger>
              <TabsTrigger value="keys" className="text-xs sm:text-sm">{t.keys}</TabsTrigger>
              <TabsTrigger value="transaction" className="text-xs sm:text-sm">{t.transaction}</TabsTrigger>
              <TabsTrigger value="signing" className="text-xs sm:text-sm">{isEnglish ? 'Signing' : 'Assinatura'}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="m-value" className="text-xs sm:text-sm font-medium">
                    M ({isEnglish ? 'Req.' : 'Nec.'})
                  </Label>
                  <Input
                    id="m-value"
                    type="number"
                    value={m}
                    onChange={(e) => setM(Number(e.target.value))}
                    min="1"
                    max="15"
                    className="text-center h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-value" className="text-xs sm:text-sm font-medium">
                    N ({isEnglish ? 'Total' : 'Total'})
                  </Label>
                  <Input
                    id="n-value"
                    type="number"
                    value={n}
                    onChange={(e) => setN(Number(e.target.value))}
                    min="1"
                    max="15"
                    className="text-center h-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">{t.walletType}</Label>
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  <Button
                    variant={walletType === 'p2sh' ? 'default' : 'outline'}
                    onClick={() => setWalletType('p2sh')}
                    className="text-xs h-12 sm:h-10 px-1 sm:px-3 flex flex-col justify-center"
                  >
                    <div className="font-semibold">P2SH</div>
                    <div className="text-[10px] sm:text-xs opacity-75 leading-tight">(Legacy)</div>
                  </Button>
                  <Button
                    variant={walletType === 'p2wsh' ? 'default' : 'outline'}
                    onClick={() => setWalletType('p2wsh')}
                    className="text-xs h-12 sm:h-10 px-1 sm:px-3 flex flex-col justify-center"
                  >
                    <div className="font-semibold">P2WSH</div>
                    <div className="text-[10px] sm:text-xs opacity-75 leading-tight">(SegWit)</div>
                  </Button>
                  <Button
                    variant={walletType === 'p2tr' ? 'default' : 'outline'}
                    onClick={() => setWalletType('p2tr')}
                    className="text-xs h-12 sm:h-10 px-1 sm:px-3 flex flex-col justify-center"
                  >
                    <div className="font-semibold">P2TR</div>
                    <div className="text-[10px] sm:text-xs opacity-75 leading-tight">(Taproot)</div>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={generateMultisigKeys} 
                  className="w-full h-11 text-sm"
                >
                  {t.generateKeys.replace('{0}', n.toString())}
                </Button>
                <Button 
                  onClick={createMultisigWallet} 
                  disabled={multisigKeys.length !== n}
                  className="w-full h-11 text-sm"
                >
                  {t.createWallet.replace('{0}', m.toString()).replace('{1}', n.toString())}
                </Button>
              </div>

              {multisigWallet && (
                <Alert className="bg-green-500/10 border-green-500/20">
                  <AlertDescription>
                    <div className="space-y-3">
                      <div>
                        <strong className="text-green-400">{t.multisigAddress}:</strong>
                        <code className="block text-xs sm:text-sm break-all bg-gray-800 p-2 rounded mt-1 font-mono">
                          {multisigWallet.address}
                        </code>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <strong className="text-green-400">{t.type}:</strong>
                          <Badge className="ml-2 bg-blue-500/20 text-blue-400">
                            {multisigWallet.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <strong className="text-green-400">{t.configuration}:</strong>
                          <Badge className="ml-2 bg-purple-500/20 text-purple-400">
                            {multisigWallet.m}-{isEnglish ? 'of' : 'de'}-{multisigWallet.n}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="keys" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">{t.privateKeysGenerated}</h3>
                
                {multisigKeys.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      {t.noKeysGenerated}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {multisigKeys.map((key, index) => (
                      <Card key={index} className="p-3 sm:p-4">
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <Badge variant="secondary" className="self-start">{t.key} {index + 1}</Badge>
                            <Button
                              size="sm"
                              onClick={() => setSigningKeyIndex(index)}
                              variant={signingKeyIndex === index ? 'default' : 'outline'}
                              className="text-xs sm:text-sm"
                            >
                              {t.select}
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs font-medium text-gray-400">{t.publicKey}:</Label>
                              <code className="text-xs break-all block bg-gray-800 p-2 rounded mt-1 font-mono">
                                {key.publicKey}
                              </code>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-400">{t.privateKey}:</Label>
                              <code className="text-xs break-all block bg-gray-800 p-2 rounded mt-1 font-mono">
                                {key.wif}
                              </code>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="transaction" className="space-y-4">
              {!multisigWallet && (
                <Alert>
                  <AlertDescription>
                    {t.createMultisigFirst}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-multisig" className="text-sm font-medium">{t.recipientAddress}</Label>
                  <Input
                    id="recipient-multisig"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="tb1q... ou bc1q..."
                    disabled={!multisigWallet}
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount-multisig" className="text-sm font-medium">{t.amount}</Label>
                    <Input
                      id="amount-multisig"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="100000"
                      min="546"
                      disabled={!multisigWallet}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fee-rate-multisig" className="text-sm font-medium">{t.feeRate}</Label>
                    <Input
                      id="fee-rate-multisig"
                      type="number"
                      value={feeRate}
                      onChange={(e) => setFeeRate(Number(e.target.value))}
                      min="1"
                      disabled={!multisigWallet}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="text-sm text-gray-400">
                    {t.estimatedFee}: <span className="font-mono font-semibold">{estimateMultisigFee()} sats</span>
                  </div>
                  <Button 
                    onClick={createMultisigTransaction} 
                    disabled={isCreating || !multisigWallet}
                    className="w-full sm:w-auto"
                  >
                    {isCreating ? t.creating : t.createTransaction}
                  </Button>
                </div>
              </div>

              {currentTransaction && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div>
                        <strong>{t.multisigTransactionCreated2}</strong>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <strong className="text-gray-300">{t.signatures}:</strong> 
                          <span className="ml-1 font-mono">{currentTransaction.signatures.size}/{currentTransaction.requiredSignatures}</span>
                        </div>
                        <div>
                          <strong className="text-gray-300">{t.status}:</strong> 
                          <Badge className={`ml-1 ${currentTransaction.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {currentTransaction.isComplete ? t.complete : t.pending}
                          </Badge>
                        </div>
                        <div>
                          <strong className="text-gray-300">{t.fee}:</strong> 
                          <span className="ml-1 font-mono">{currentTransaction.fee} sats</span>
                        </div>
                        <div className="sm:col-span-2">
                          <strong className="text-gray-300">{t.txId}:</strong>
                          <code className="block text-xs font-mono bg-gray-800 p-1 rounded mt-1 break-all">
                            {currentTransaction.txId || t.pending}
                          </code>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="signing" className="space-y-4">
              {!currentTransaction && (
                <Alert>
                  <AlertDescription>
                    {t.createTransactionFirst}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">{t.signingProcess}</h3>
                
                {currentTransaction && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">{t.signatureProgress}</Label>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${(currentTransaction.signatures.size / currentTransaction.requiredSignatures) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-mono font-semibold">
                            {currentTransaction.signatures.size}/{currentTransaction.requiredSignatures}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">{t.status}</Label>
                        <div className="mt-2">
                          <Badge className={currentTransaction.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                            {currentTransaction.isComplete ? t.complete : t.pending}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>{t.signWithKeys}</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {multisigKeys.map((key, index) => (
                          <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-gray-700 rounded-lg gap-2">
                            <div className="flex items-center space-x-2 min-w-0">
                              <Badge variant="outline" className="shrink-0">{t.key} {index + 1}</Badge>
                              <code className="text-xs font-mono truncate">
                                {key.publicKey.substring(0, 16)}...
                              </code>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => signTransaction(index)}
                              disabled={currentTransaction.signatures.has(index) || currentTransaction.isComplete}
                              className={`shrink-0 text-xs ${
                                currentTransaction.signatures.has(index) 
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                  : ''
                              }`}
                            >
                              {currentTransaction.signatures.has(index) ? t.signed : t.sign}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {currentTransaction.isComplete && (
                      <Alert>
                        <AlertDescription>
                          <div className="space-y-2">
                            <div>
                              <strong className="text-green-400">{t.transactionComplete}</strong>
                            </div>
                            <div>
                              <strong className="text-gray-300">{t.txId}:</strong>
                              <code className="block text-xs font-mono bg-gray-800 p-2 rounded mt-1 break-all">
                                {currentTransaction.txId}
                              </code>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://mempool.space/signet/tx/${currentTransaction.txId}`, '_blank')}
                              className="w-full sm:w-auto border-blue-500 text-blue-400 hover:bg-blue-500/10"
                            >
                              {t.viewOnExplorer}
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.multisigUseCases}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-blue-400 flex items-center">
                <span className="mr-2">🏢</span>
                {t.corporateSecurity}
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t.corporateSecurityDesc}
              </p>
            </div>
            <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-green-400 flex items-center">
                <span className="mr-2">🔐</span>
                {t.personalCustody}
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t.personalCustodyDesc}
              </p>
            </div>
            <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-purple-400 flex items-center">
                <span className="mr-2">🤝</span>
                {t.escrowServices}
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t.escrowServicesDesc}
              </p>
            </div>
            <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-orange-400 flex items-center">
                <span className="mr-2">👨‍👩‍👧‍👦</span>
                {t.inheritance}
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t.inheritanceDesc}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}