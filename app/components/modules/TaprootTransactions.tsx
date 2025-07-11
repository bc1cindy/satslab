'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Badge } from '@/app/components/ui/badge'
import { Separator } from '@/app/components/ui/separator'
import { TaprootService, TaprootAddress, TaprootTransaction } from '@/app/lib/bitcoin/taproot-service'
import { SIGNET_NETWORK } from '@/app/lib/bitcoin/bitcoin-crypto'
import { useToast } from '@/app/hooks/use-toast'

interface TaprootTransactionsProps {
  onTransactionCreated?: (txId: string) => void
}

export default function TaprootTransactions({ onTransactionCreated }: TaprootTransactionsProps) {
  const [taprootAddress, setTaprootAddress] = useState<TaprootAddress | null>(null)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState(0)
  const [feeRate, setFeeRate] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<TaprootTransaction | null>(null)
  const [privateKeyInput, setPrivateKeyInput] = useState('')
  const [addressComparison, setAddressComparison] = useState<{legacy: string, segwit: string, taproot: string} | null>(null)
  
  const { toast } = useToast()
  const taprootService = useMemo(() => new TaprootService(SIGNET_NETWORK), [])

  const generateTaprootAddress = useCallback(() => {
    try {
      const address = taprootService.createTaprootAddress()
      setTaprootAddress(address)
      
      // Gera comparação com outros tipos de endereço
      const comparison = {
        taproot: address.address,
        legacy: 'N/A (não implementado)',
        segwit: 'N/A (não implementado)',
      }
      setAddressComparison(comparison)
      
      toast({
        title: "Endereço Taproot Gerado!",
        description: `Endereço: ${address.address}`,
      })
    } catch (error) {
      toast({
        title: "Erro ao gerar endereço",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }, [taprootService, toast])

  const importFromPrivateKey = useCallback(() => {
    if (!privateKeyInput) {
      toast({
        title: "Erro",
        description: "Insira uma chave privada válida",
        variant: "destructive",
      })
      return
    }

    try {
      const address = taprootService.createTaprootAddress(privateKeyInput)
      setTaprootAddress(address)
      
      toast({
        title: "Endereço Importado!",
        description: `Endereço: ${address.address}`,
      })
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: error instanceof Error ? error.message : "Chave privada inválida",
        variant: "destructive",
      })
    }
  }, [privateKeyInput, taprootService, toast])

  const createTaprootTransaction = async () => {
    if (!taprootAddress || !recipientAddress || amount <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Para demonstração, criamos inputs mock
      const inputs = [{
        txid: '0'.repeat(64),
        vout: 0,
        value: amount + 1000, // valor + taxa
        address: taprootAddress.address,
        privateKey: taprootAddress.privateKey,
      }]

      const outputs = [{
        address: recipientAddress,
        value: amount,
      }]

      const transaction = await taprootService.createTaprootTransaction(
        inputs,
        outputs,
        feeRate
      )

      setLastTransaction(transaction)
      
      toast({
        title: "Transação Taproot Criada!",
        description: `TX ID: ${transaction.txId}`,
      })

      if (onTransactionCreated) {
        onTransactionCreated(transaction.txId)
      }

    } catch (error) {
      toast({
        title: "Erro ao criar transação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const estimateFee = useCallback(() => {
    return taprootService.estimateTaprootFee(1, 1, feeRate)
  }, [feeRate, taprootService])

  const validateAddress = useCallback((address: string) => {
    return taprootService.isTaprootAddress(address)
  }, [taprootService])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transações Taproot</CardTitle>
          <CardDescription>
            Crie transações usando o protocolo Taproot para maior privacidade e eficiência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="address" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="address">Endereços</TabsTrigger>
              <TabsTrigger value="transaction">Transação</TabsTrigger>
              <TabsTrigger value="comparison">Comparação</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="address" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={generateTaprootAddress} className="flex-1">
                    Gerar Endereço Taproot
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="private-key-input">Importar de Chave Privada (Hex)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="private-key-input"
                      type="password"
                      value={privateKeyInput}
                      onChange={(e) => setPrivateKeyInput(e.target.value)}
                      placeholder="Chave privada em hex..."
                      className="flex-1"
                    />
                    <Button onClick={importFromPrivateKey}>
                      Importar
                    </Button>
                  </div>
                </div>

                {taprootAddress && (
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-2">
                        <div>
                          <strong>Endereço Taproot:</strong>
                          <br />
                          <code className="text-sm break-all">{taprootAddress.address}</code>
                        </div>
                        <div>
                          <strong>Chave Pública:</strong>
                          <br />
                          <code className="text-sm break-all">{taprootAddress.publicKey}</code>
                        </div>
                        <div>
                          <strong>Chave Interna:</strong>
                          <br />
                          <code className="text-sm break-all">{taprootAddress.internalKey}</code>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="transaction" className="space-y-4">
              {!taprootAddress && (
                <Alert>
                  <AlertDescription>
                    Gere ou importe um endereço Taproot primeiro na aba "Endereços"
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Endereço Destinatário</Label>
                  <Input
                    id="recipient"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="tb1p... ou bc1p..."
                    disabled={!taprootAddress}
                  />
                  {recipientAddress && (
                    <div className="text-sm">
                      {validateAddress(recipientAddress) ? (
                        <Badge variant="default">Endereço Taproot válido</Badge>
                      ) : (
                        <Badge variant="destructive">Não é um endereço Taproot</Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (sats)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="100000"
                    min="546"
                    disabled={!taprootAddress}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee-rate-tx">Taxa (sats/vB)</Label>
                  <Input
                    id="fee-rate-tx"
                    type="number"
                    value={feeRate}
                    onChange={(e) => setFeeRate(Number(e.target.value))}
                    min="1"
                    disabled={!taprootAddress}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Taxa estimada: {estimateFee()} sats
                  </div>
                  <Button 
                    onClick={createTaprootTransaction} 
                    disabled={isCreating || !taprootAddress}
                  >
                    {isCreating ? 'Criando...' : 'Criar Transação'}
                  </Button>
                </div>
              </div>

              {lastTransaction && (
                <Alert className="mt-4">
                  <AlertDescription>
                    <div className="space-y-2">
                      <div>
                        <strong>Transação Criada:</strong>
                        <br />
                        <code className="text-sm">{lastTransaction.txId}</code>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Tamanho:</strong> {lastTransaction.size} bytes
                        </div>
                        <div>
                          <strong>vSize:</strong> {lastTransaction.vsize} vbytes
                        </div>
                        <div>
                          <strong>Taxa:</strong> {lastTransaction.fee} sats
                        </div>
                        <div>
                          <strong>Taxa/vB:</strong> {(lastTransaction.fee / lastTransaction.vsize).toFixed(2)} sats/vB
                        </div>
                      </div>
                      <a
                        href={`https://mempool.space/signet/tx/${lastTransaction.txId}`}
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
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Comparação de Tipos de Transação</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Legacy (P2PKH)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• Tamanho: ~250 bytes</li>
                        <li>• Taxa: Alta</li>
                        <li>• Privacidade: Baixa</li>
                        <li>• Prefixo: 1...</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">SegWit (P2WPKH)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• Tamanho: ~140 vbytes</li>
                        <li>• Taxa: Média</li>
                        <li>• Privacidade: Média</li>
                        <li>• Prefixo: bc1q...</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-600">Taproot (P2TR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• Tamanho: ~57 vbytes</li>
                        <li>• Taxa: Baixa</li>
                        <li>• Privacidade: Alta</li>
                        <li>• Prefixo: bc1p...</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Vantagens do Taproot:</h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• Assinaturas Schnorr mais eficientes</li>
                    <li>• Transações complexas parecem transações simples</li>
                    <li>• Melhor privacidade para contratos inteligentes</li>
                    <li>• Taxas menores para transações multisig</li>
                    <li>• Habilita Inscrições e outros protocolos</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="info" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Sobre o Taproot</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">O que é Taproot?</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Taproot é uma atualização do protocolo Bitcoin que melhora privacidade, 
                      eficiência e funcionalidade. Foi ativado em novembro de 2021 e introduz 
                      assinaturas Schnorr e scripts mais flexíveis.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Assinaturas Schnorr</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Permitem agregação de assinaturas, tornando transações multisig menores 
                      e mais privadas. Também habilitam funcionalidades como threshold signatures.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">MAST (Merkelized Abstract Syntax Tree)</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Permite contratos inteligentes complexos onde apenas a condição executada 
                      é revelada, melhorando privacidade e eficiência.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Inscrições e Inscriptions</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Taproot habilita protocolos como Inscrições, que permitem criar NFTs 
                      nativos do Bitcoin inscrevendo dados diretamente em satoshis.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-800">Calculadora de Economia</h4>
                  <div className="mt-2 text-sm text-orange-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Transação 2-de-3 Legacy:</strong>
                        <br />~350 bytes × {feeRate} sats/vB = {350 * feeRate} sats
                      </div>
                      <div>
                        <strong>Transação 2-de-3 Taproot:</strong>
                        <br />~57 vbytes × {feeRate} sats/vB = {57 * feeRate} sats
                      </div>
                    </div>
                    <div className="mt-2 font-medium">
                      Economia: {((350 * feeRate) - (57 * feeRate))} sats 
                      ({(((350 - 57) / 350) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}