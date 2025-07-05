'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Badge } from '@/app/components/ui/badge'
import { OrdinalsService, BadgeNFT, OrdinalUTXO } from '@/app/lib/bitcoin/ordinals-service'
import { SIGNET_NETWORK } from '@/app/lib/bitcoin/crypto'
import { useToast } from '@/app/hooks/use-toast'

interface OrdinalsCreatorProps {
  userPublicKey?: string
  onOrdinalCreated?: (inscriptionId: string) => void
}

export default function OrdinalsCreator({ userPublicKey, onOrdinalCreated }: OrdinalsCreatorProps) {
  const [jsonContent, setJsonContent] = useState('')
  const [contentType, setContentType] = useState('application/json')
  const [privateKey, setPrivateKey] = useState('')
  const [utxoInput, setUtxoInput] = useState('')
  const [feeRate, setFeeRate] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState(0)
  const [lastInscriptionId, setLastInscriptionId] = useState('')
  const [previewData, setPreviewData] = useState<any>(null)
  
  const { toast } = useToast()
  const ordinalsService = new OrdinalsService(SIGNET_NETWORK)

  // Calcula taxa estimada quando o conteúdo muda
  const calculateEstimatedFee = useCallback(() => {
    if (jsonContent) {
      const fee = ordinalsService.estimateInscriptionFee(jsonContent, feeRate)
      setEstimatedFee(fee)
    }
  }, [jsonContent, feeRate, ordinalsService])

  React.useEffect(() => {
    calculateEstimatedFee()
  }, [calculateEstimatedFee])

  // Atualiza preview quando JSON muda
  const updatePreview = useCallback(() => {
    try {
      if (jsonContent) {
        const parsed = JSON.parse(jsonContent)
        setPreviewData(parsed)
      }
    } catch {
      setPreviewData(null)
    }
  }, [jsonContent])

  React.useEffect(() => {
    updatePreview()
  }, [updatePreview])

  const generateBadgeJSON = (badgeType: string) => {
    if (!userPublicKey) {
      toast({
        title: "Erro",
        description: "Chave pública do usuário não disponível",
        variant: "destructive",
      })
      return
    }

    const badgeData = {
      badge: badgeType,
      user_id: userPublicKey,
      timestamp: Date.now(),
      network: "signet"
    }

    setJsonContent(JSON.stringify(badgeData, null, 2))
    setContentType('application/json')
  }

  const parseUTXOs = (utxoString: string): OrdinalUTXO[] => {
    try {
      const lines = utxoString.trim().split('\n')
      const utxos: OrdinalUTXO[] = []
      
      for (const line of lines) {
        const parts = line.split(':')
        if (parts.length >= 3) {
          const [txid, vout, value, address] = parts
          utxos.push({
            txid: txid.trim(),
            vout: parseInt(vout.trim()),
            value: parseInt(value.trim()),
            address: address?.trim() || '',
          })
        }
      }
      
      return utxos
    } catch (error) {
      throw new Error('Formato inválido de UTXO. Use: txid:vout:value:address')
    }
  }

  const handleCreateOrdinal = async () => {
    if (!jsonContent || !privateKey) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Parse UTXOs
      const utxos = utxoInput ? parseUTXOs(utxoInput) : []
      
      // Para demonstração, criamos UTXOs mock se não fornecidos
      if (utxos.length === 0) {
        utxos.push({
          txid: '0'.repeat(64),
          vout: 0,
          value: 100000, // 0.001 BTC
          address: '',
        })
      }

      const inscription = await ordinalsService.createOrdinalInscription(
        jsonContent,
        contentType,
        privateKey,
        utxos,
        feeRate
      )

      setLastInscriptionId(inscription.inscriptionId)
      
      toast({
        title: "Ordinal Criado!",
        description: `Inscription ID: ${inscription.inscriptionId}`,
      })

      if (onOrdinalCreated) {
        onOrdinalCreated(inscription.inscriptionId)
      }

    } catch (error) {
      toast({
        title: "Erro ao criar Ordinal",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleMintBadge = async (badgeType: string) => {
    if (!userPublicKey || !privateKey) {
      toast({
        title: "Erro",
        description: "Chave pública e privada são necessárias para mintar badge",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const badgeData: BadgeNFT = {
        badge: badgeType,
        user_id: userPublicKey,
        timestamp: Date.now(),
        network: "signet"
      }

      // UTXOs mock para demonstração
      const utxos: OrdinalUTXO[] = [{
        txid: '0'.repeat(64),
        vout: 0,
        value: 100000,
        address: '',
      }]

      const inscription = await ordinalsService.mintBadgeNFT(
        badgeData,
        privateKey,
        utxos,
        feeRate
      )

      setLastInscriptionId(inscription.inscriptionId)
      
      toast({
        title: "Badge NFT Mintado!",
        description: `Badge "${badgeType}" criado com sucesso`,
      })

      if (onOrdinalCreated) {
        onOrdinalCreated(inscription.inscriptionId)
      }

    } catch (error) {
      toast({
        title: "Erro ao mintar badge",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ordinals Creator</CardTitle>
          <CardDescription>
            Crie Ordinals (NFTs) inscrevendo dados em satoshis individuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="custom" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="custom">Custom</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-content">Conteúdo JSON</Label>
                <textarea
                  id="json-content"
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  placeholder='{"message": "Hello, Bitcoin!"}'
                  className="w-full h-32 p-2 border rounded-md font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-type">Tipo de Conteúdo</Label>
                <Input
                  id="content-type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  placeholder="application/json"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="private-key">Chave Privada (WIF)</Label>
                <Input
                  id="private-key"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="L1234..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utxo-input">UTXOs (Opcional)</Label>
                <textarea
                  id="utxo-input"
                  value={utxoInput}
                  onChange={(e) => setUtxoInput(e.target.value)}
                  placeholder="txid:vout:value:address"
                  className="w-full h-20 p-2 border rounded-md font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Um UTXO por linha. Formato: txid:vout:value:address
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee-rate">Taxa (sats/vB)</Label>
                <Input
                  id="fee-rate"
                  type="number"
                  value={feeRate}
                  onChange={(e) => setFeeRate(Number(e.target.value))}
                  min="1"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Taxa estimada: {estimatedFee} sats
                </div>
                <Button onClick={handleCreateOrdinal} disabled={isCreating}>
                  {isCreating ? 'Criando...' : 'Criar Ordinal'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="badges" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="badge-private-key">Chave Privada (WIF)</Label>
                <Input
                  id="badge-private-key"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="L1234..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => generateBadgeJSON("Pioneiro Taproot")}
                  variant="outline"
                >
                  Gerar JSON: Pioneiro Taproot
                </Button>
                <Button
                  onClick={() => handleMintBadge("Pioneiro Taproot")}
                  disabled={isCreating || !privateKey}
                >
                  {isCreating ? 'Mintando...' : 'Mintar Badge'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => generateBadgeJSON("Mestre Multisig")}
                  variant="outline"
                >
                  Gerar JSON: Mestre Multisig
                </Button>
                <Button
                  onClick={() => handleMintBadge("Mestre Multisig")}
                  disabled={isCreating || !privateKey}
                >
                  {isCreating ? 'Mintando...' : 'Mintar Badge'}
                </Button>
              </div>

              {userPublicKey && (
                <Alert>
                  <AlertDescription>
                    Usando chave pública: {userPublicKey.substring(0, 20)}...
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Preview do Conteúdo</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                    {previewData ? (
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(previewData, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-gray-500">Nenhum conteúdo válido para preview</p>
                    )}
                  </div>
                </div>

                {previewData?.badge && (
                  <div>
                    <Label>Badge NFT Preview</Label>
                    <div className="mt-2 p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {previewData.badge.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{previewData.badge}</h3>
                          <p className="text-sm text-gray-600">
                            User: {previewData.user_id?.substring(0, 10)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            Network: {previewData.network}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Tamanho do Conteúdo</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded">
                      {jsonContent.length} bytes
                    </div>
                  </div>
                  <div>
                    <Label>Taxa Estimada</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded">
                      {estimatedFee} sats
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {lastInscriptionId && (
            <Alert className="mt-4">
              <AlertDescription>
                <strong>Último Ordinal criado:</strong>
                <br />
                <code className="text-sm">{lastInscriptionId}</code>
                <br />
                <a
                  href={`https://mempool.space/signet/tx/${lastInscriptionId.split(':')[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Ver no Explorer
                </a>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}