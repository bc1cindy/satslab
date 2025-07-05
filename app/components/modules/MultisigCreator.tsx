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
import { SIGNET_NETWORK } from '@/app/lib/bitcoin/crypto'
import { useToast } from '@/app/hooks/use-toast'

interface MultisigCreatorProps {
  onWalletCreated?: (address: string) => void
  onTransactionSigned?: (txId: string) => void
}

export default function MultisigCreator({ onWalletCreated, onTransactionSigned }: MultisigCreatorProps) {
  const [multisigKeys, setMultisigKeys] = useState<MultisigKey[]>([])
  const [multisigWallet, setMultisigWallet] = useState<MultisigWallet | null>(null)
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
        title: "Chaves Geradas!",
        description: `${n} chaves privadas geradas com sucesso`,
      })
    } catch (error) {
      toast({
        title: "Erro ao gerar chaves",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }, [n, multisigService, toast])

  const createMultisigWallet = useCallback(() => {
    if (multisigKeys.length !== n) {
      toast({
        title: "Erro",
        description: `Necessário ${n} chaves para criar carteira ${m}-de-${n}`,
        variant: "destructive",
      })
      return
    }

    try {
      const publicKeys = multisigKeys.map(key => key.publicKey)
      const wallet = multisigService.createMultisigWallet(publicKeys, m, n, walletType)
      setMultisigWallet(wallet)
      
      toast({
        title: "Carteira Multisig Criada!",
        description: `Endereço: ${wallet.address}`,
      })

      if (onWalletCreated) {
        onWalletCreated(wallet.address)
      }
    } catch (error) {
      toast({
        title: "Erro ao criar carteira",
        description: error instanceof Error ? error.message : "Erro desconhecido",
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
        title: "Transação Multisig Criada!",
        description: `Requer ${multisigWallet.m} assinaturas de ${multisigWallet.n} possíveis`,
      })

    } catch (error) {
      toast({
        title: "Erro ao criar transação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }, [multisigWallet, recipientAddress, amount, feeRate, multisigService, toast])

  const signTransaction = useCallback((keyIndex: number) => {
    if (!currentTransaction || !multisigKeys[keyIndex]) {
      toast({
        title: "Erro",
        description: "Transação ou chave não disponível",
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
        title: "Transação Assinada!",
        description: `Assinatura ${signedTransaction.signatures.size} de ${signedTransaction.requiredSignatures} adicionada`,
      })

      if (signedTransaction.isComplete && onTransactionSigned) {
        onTransactionSigned(signedTransaction.txId)
      }

    } catch (error) {
      toast({
        title: "Erro ao assinar transação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
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
          <CardTitle>Carteira Multisig</CardTitle>
          <CardDescription>
            Crie carteiras multisig que requerem múltiplas assinaturas para transações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="keys">Chaves</TabsTrigger>
              <TabsTrigger value="transaction">Transação</TabsTrigger>
              <TabsTrigger value="signing">Assinatura</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="m-value">M (Assinaturas Necessárias)</Label>
                  <Input
                    id="m-value"
                    type="number"
                    value={m}
                    onChange={(e) => setM(Number(e.target.value))}
                    min="1"
                    max="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-value">N (Total de Chaves)</Label>
                  <Input
                    id="n-value"
                    type="number"
                    value={n}
                    onChange={(e) => setN(Number(e.target.value))}
                    min="1"
                    max="15"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Carteira</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={walletType === 'p2sh' ? 'default' : 'outline'}
                    onClick={() => setWalletType('p2sh')}
                  >
                    P2SH (Legacy)
                  </Button>
                  <Button
                    variant={walletType === 'p2wsh' ? 'default' : 'outline'}
                    onClick={() => setWalletType('p2wsh')}
                  >
                    P2WSH (SegWit)
                  </Button>
                  <Button
                    variant={walletType === 'p2tr' ? 'default' : 'outline'}
                    onClick={() => setWalletType('p2tr')}
                  >
                    P2TR (Taproot)
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Button onClick={generateMultisigKeys} className="w-full">
                  Gerar {n} Chaves Privadas
                </Button>
                <Button 
                  onClick={createMultisigWallet} 
                  disabled={multisigKeys.length !== n}
                  className="w-full"
                >
                  Criar Carteira {m}-de-{n}
                </Button>
              </div>

              {multisigWallet && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div>
                        <strong>Endereço Multisig:</strong>
                        <br />
                        <code className="text-sm break-all">{multisigWallet.address}</code>
                      </div>
                      <div>
                        <strong>Tipo:</strong> {multisigWallet.type.toUpperCase()}
                      </div>
                      <div>
                        <strong>Configuração:</strong> {multisigWallet.m}-de-{multisigWallet.n}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="keys" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Chaves Privadas Geradas</h3>
                
                {multisigKeys.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Nenhuma chave gerada. Vá para a aba "Setup" para gerar chaves.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {multisigKeys.map((key, index) => (
                      <Card key={index} className="p-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary">Chave {index + 1}</Badge>
                            <Button
                              size="sm"
                              onClick={() => setSigningKeyIndex(index)}
                              variant={signingKeyIndex === index ? 'default' : 'outline'}
                            >
                              Selecionar
                            </Button>
                          </div>
                          <div>
                            <Label className="text-xs">Chave Pública:</Label>
                            <code className="text-xs break-all block bg-gray-50 p-1 rounded">
                              {key.publicKey}
                            </code>
                          </div>
                          <div>
                            <Label className="text-xs">Chave Privada (WIF):</Label>
                            <code className="text-xs break-all block bg-gray-50 p-1 rounded">
                              {key.wif}
                            </code>
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
                    Crie uma carteira multisig primeiro na aba "Setup"
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-multisig">Endereço Destinatário</Label>
                  <Input
                    id="recipient-multisig"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="tb1q... ou bc1q..."
                    disabled={!multisigWallet}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount-multisig">Valor (sats)</Label>
                  <Input
                    id="amount-multisig"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="100000"
                    min="546"
                    disabled={!multisigWallet}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee-rate-multisig">Taxa (sats/vB)</Label>
                  <Input
                    id="fee-rate-multisig"
                    type="number"
                    value={feeRate}
                    onChange={(e) => setFeeRate(Number(e.target.value))}
                    min="1"
                    disabled={!multisigWallet}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Taxa estimada: {estimateMultisigFee()} sats
                  </div>
                  <Button 
                    onClick={createMultisigTransaction} 
                    disabled={isCreating || !multisigWallet}
                  >
                    {isCreating ? 'Criando...' : 'Criar Transação'}
                  </Button>
                </div>
              </div>

              {currentTransaction && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div>
                        <strong>Transação Multisig Criada</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Assinaturas:</strong> {currentTransaction.signatures.size}/{currentTransaction.requiredSignatures}
                        </div>
                        <div>
                          <strong>Status:</strong> {currentTransaction.isComplete ? 'Completa' : 'Pendente'}
                        </div>
                        <div>
                          <strong>Taxa:</strong> {currentTransaction.fee} sats
                        </div>
                        <div>
                          <strong>TX ID:</strong> {currentTransaction.txId || 'Pendente'}
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
                    Crie uma transação multisig primeiro na aba "Transação"
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Processo de Assinatura</h3>
                
                {currentTransaction && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Progresso das Assinaturas</Label>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${(currentTransaction.signatures.size / currentTransaction.requiredSignatures) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm">
                            {currentTransaction.signatures.size}/{currentTransaction.requiredSignatures}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="mt-2">
                          <Badge variant={currentTransaction.isComplete ? 'default' : 'secondary'}>
                            {currentTransaction.isComplete ? 'Completa' : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Assinar com Chaves Disponíveis</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {multisigKeys.map((key, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">Chave {index + 1}</Badge>
                              <code className="text-xs">
                                {key.publicKey.substring(0, 20)}...
                              </code>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => signTransaction(index)}
                              disabled={currentTransaction.signatures.has(index) || currentTransaction.isComplete}
                            >
                              {currentTransaction.signatures.has(index) ? 'Assinada' : 'Assinar'}
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
                              <strong>Transação Completa!</strong>
                            </div>
                            <div>
                              <strong>TX ID:</strong>
                              <br />
                              <code className="text-sm">{currentTransaction.txId}</code>
                            </div>
                            <a
                              href={`https://mempool.space/signet/tx/${currentTransaction.txId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Ver no Explorer
                            </a>
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
          <CardTitle>Casos de Uso Multisig</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Segurança Corporativa</h4>
              <p className="text-sm text-gray-600">
                Empresas usam multisig para proteger fundos, exigindo aprovação de múltiplos executivos para transações.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Custódia Pessoal</h4>
              <p className="text-sm text-gray-600">
                Indivíduos distribuem chaves entre dispositivos ou locais para evitar ponto único de falha.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Escrow Services</h4>
              <p className="text-sm text-gray-600">
                Transações comerciais com terceiro neutro, liberando fundos apenas com acordo das partes.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Inheritance</h4>
              <p className="text-sm text-gray-600">
                Herança digital onde familiares podem acessar fundos em situações específicas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}