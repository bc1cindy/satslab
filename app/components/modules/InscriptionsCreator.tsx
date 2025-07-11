'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Badge } from '@/app/components/ui/badge'
import { OrdinalsService, BadgeNFT, OrdinalUTXO } from '@/app/lib/bitcoin/ordinals-service'
import { SIGNET_NETWORK } from '@/app/lib/bitcoin/bitcoin-crypto'
import { useToast } from '@/app/hooks/use-toast'
import { usePathname } from 'next/navigation'

interface InscriptionsCreatorProps {
  userPublicKey?: string
  onInscriptionCreated?: (inscriptionId: string) => void
}

export default function InscriptionsCreator({ userPublicKey, onInscriptionCreated }: InscriptionsCreatorProps) {
  const [jsonContent, setJsonContent] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [generatedAddress, setGeneratedAddress] = useState('')
  const [feeRate, setFeeRate] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState(0)
  const [lastInscriptionId, setLastInscriptionId] = useState('')
  const [previewData, setPreviewData] = useState<{json: object, image: string, badge?: string, user_id?: string, network?: string} | null>(null)
  
  const { toast } = useToast()
  const ordinalsService = useMemo(() => new OrdinalsService(SIGNET_NETWORK), [])
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')

  // Translations
  const t = {
    title: isEnglish ? 'Inscriptions Creator' : 'Criador de Inscrições',
    description: isEnglish 
      ? 'Create Inscriptions (NFTs) by inscribing data on individual satoshis'
      : 'Crie Inscrições (NFTs) inscrevendo dados em satoshis individuais',
    taprootAddressGenerated: isEnglish ? 'Taproot address generated' : 'Endereço Taproot gerado',
    newAddress: isEnglish ? 'New address' : 'Novo endereço',
    errorGeneratingAddress: isEnglish ? 'Error generating address' : 'Erro ao gerar endereço',
    unknownError: isEnglish ? 'Unknown error' : 'Erro desconhecido',
    jsonContent: isEnglish ? 'JSON Content' : 'Conteúdo JSON',
    privateKeyWIF: isEnglish ? 'Private Key (WIF)' : 'Chave Privada (WIF)',
    generate: isEnglish ? 'Generate' : 'Gerar',
    addressGenerated: isEnglish ? 'Address generated' : 'Endereço gerado',
    feeRate: isEnglish ? 'Fee Rate (sats/vB)' : 'Taxa (sats/vB)',
    estimatedFee: isEnglish ? 'Estimated fee' : 'Taxa estimada',
    createInscription: isEnglish ? 'Create Inscription' : 'Criar Inscrição',
    creating: isEnglish ? 'Creating...' : 'Criando...',
    error: isEnglish ? 'Error' : 'Erro',
    fillJsonContent: isEnglish ? 'Fill in JSON content' : 'Preencha o conteúdo JSON',
    generateOrEnterPrivateKey: isEnglish ? 'Generate or enter a private key' : 'Gere ou insira uma chave privada',
    inscriptionCreated: isEnglish ? 'Inscription Created!' : 'Inscrição Criada!',
    inscriptionId: isEnglish ? 'Inscription ID' : 'ID da Inscrição',
    errorCreatingInscription: isEnglish ? 'Error creating inscription' : 'Erro ao criar inscrição',
    publicAndPrivateKeysRequired: isEnglish 
      ? 'Public and private keys are required to mint badge'
      : 'Chave pública e privada são necessárias para mintar badge',
    badgeNFTMinted: isEnglish ? 'Badge NFT Minted!' : 'Badge NFT Mintado!',
    badgeCreatedSuccessfully: isEnglish ? 'Badge "{0}" created successfully' : 'Badge "{0}" criado com sucesso',
    errorMintingBadge: isEnglish ? 'Error minting badge' : 'Erro ao mintar badge',
    generateJsonTaprootPioneer: isEnglish ? 'Generate JSON: Taproot Pioneer' : 'Gerar JSON: Pioneiro Taproot',
    mintBadge: isEnglish ? 'Mint Badge' : 'Mintar Badge',
    minting: isEnglish ? 'Minting...' : 'Mintando...',
    generateJsonMultisigMaster: isEnglish ? 'Generate JSON: Multisig Master' : 'Gerar JSON: Mestre Multisig',
    usingPublicKey: isEnglish ? 'Using public key' : 'Usando chave pública',
    contentPreview: isEnglish ? 'Content Preview' : 'Preview do Conteúdo',
    noValidContentForPreview: isEnglish ? 'No valid content for preview' : 'Nenhum conteúdo válido para preview',
    badgeNFTPreview: isEnglish ? 'Badge NFT Preview' : 'Badge NFT Preview',
    user: isEnglish ? 'User' : 'User',
    network: isEnglish ? 'Network' : 'Network',
    contentSize: isEnglish ? 'Content Size' : 'Tamanho do Conteúdo',
    lastInscriptionCreated: isEnglish ? 'Last inscription created' : 'Última inscrição criada',
    viewInExplorer: isEnglish ? 'View in Explorer' : 'Ver no Explorer'
  }

  // Gera nova chave privada e endereço Taproot
  const generateTaprootAddress = useCallback(async () => {
    try {
      const { TaprootService } = await import('@/app/lib/bitcoin/taproot-service')
      const taprootService = new TaprootService(SIGNET_NETWORK)
      
      const result = await taprootService.createTaprootAddress()
      setPrivateKey(result.privateKey)
      setGeneratedAddress(result.address)
      
      toast({
        title: t.taprootAddressGenerated,
        description: `${t.newAddress}: ${result.address}`,
      })
    } catch (error) {
      toast({
        title: t.errorGeneratingAddress,
        description: error instanceof Error ? error.message : t.unknownError,
        variant: "destructive",
      })
    }
  }, [toast, t])

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
        title: t.error,
        description: t.publicAndPrivateKeysRequired,
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

  const handleCreateInscription = async () => {
    if (!jsonContent) {
      toast({
        title: t.error,
        description: t.fillJsonContent,
        variant: "destructive",
      })
      return
    }

    if (!privateKey) {
      toast({
        title: t.error,
        description: t.generateOrEnterPrivateKey,
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Simular criação de inscrição para fins educacionais
      const inscriptionId = 'i' + Math.random().toString(36).substr(2, 9)
      
      // Simular delay da inscrição
      await new Promise(resolve => setTimeout(resolve, 2000))

      setLastInscriptionId(inscriptionId)
      
      toast({
        title: t.inscriptionCreated,
        description: `${t.inscriptionId}: ${inscriptionId}`,
      })

      if (onInscriptionCreated) {
        onInscriptionCreated(inscriptionId)
      }

    } catch (error) {
      toast({
        title: t.errorCreatingInscription,
        description: error instanceof Error ? error.message : t.unknownError,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleMintBadge = async (badgeType: string) => {
    if (!userPublicKey || !privateKey) {
      toast({
        title: t.error,
        description: t.publicAndPrivateKeysRequired,
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
        title: t.badgeNFTMinted,
        description: t.badgeCreatedSuccessfully.replace('{0}', badgeType),
      })

      if (onInscriptionCreated) {
        onInscriptionCreated(inscription.inscriptionId)
      }

    } catch (error) {
      toast({
        title: t.errorMintingBadge,
        description: error instanceof Error ? error.message : t.unknownError,
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
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>
            {t.description}
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
                <Label htmlFor="json-content">{t.jsonContent}</Label>
                <textarea
                  id="json-content"
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  placeholder='{"message": "Hello, Bitcoin!"}'
                  className="w-full h-32 p-2 border rounded-md font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="private-key">{t.privateKeyWIF}</Label>
                <div className="flex gap-2">
                  <Input
                    id="private-key"
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="L1234..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={generateTaprootAddress} 
                    variant="outline"
                    type="button"
                  >
                    {t.generate}
                  </Button>
                </div>
                {generatedAddress && (
                  <p className="text-xs text-green-600">
                    {t.addressGenerated}: {generatedAddress}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee-rate">{t.feeRate}</Label>
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
                  {t.estimatedFee}: {estimatedFee} sats
                </div>
                <Button onClick={handleCreateInscription} disabled={isCreating}>
                  {isCreating ? t.creating : t.createInscription}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="badges" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="badge-private-key">{t.privateKeyWIF}</Label>
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
                  onClick={() => generateBadgeJSON(isEnglish ? "Taproot Pioneer" : "Pioneiro Taproot")}
                  variant="outline"
                >
                  {t.generateJsonTaprootPioneer}
                </Button>
                <Button
                  onClick={() => handleMintBadge(isEnglish ? "Taproot Pioneer" : "Pioneiro Taproot")}
                  disabled={isCreating || !privateKey}
                >
                  {isCreating ? t.minting : t.mintBadge}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => generateBadgeJSON(isEnglish ? "Multisig Master" : "Mestre Multisig")}
                  variant="outline"
                >
                  {t.generateJsonMultisigMaster}
                </Button>
                <Button
                  onClick={() => handleMintBadge(isEnglish ? "Multisig Master" : "Mestre Multisig")}
                  disabled={isCreating || !privateKey}
                >
                  {isCreating ? t.minting : t.mintBadge}
                </Button>
              </div>

              {userPublicKey && (
                <Alert>
                  <AlertDescription>
                    {t.usingPublicKey}: {userPublicKey.substring(0, 20)}...
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>{t.contentPreview}</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                    {previewData ? (
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(previewData, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-gray-500">{t.noValidContentForPreview}</p>
                    )}
                  </div>
                </div>

                {previewData?.badge && (
                  <div>
                    <Label>{t.badgeNFTPreview}</Label>
                    <div className="mt-2 p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {previewData.badge.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{previewData.badge}</h3>
                          <p className="text-sm text-gray-600">
                            {t.user}: {previewData.user_id?.substring(0, 10)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            {t.network}: {previewData.network}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>{t.contentSize}</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded">
                      {jsonContent.length} bytes
                    </div>
                  </div>
                  <div>
                    <Label>{t.estimatedFee}</Label>
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
                <strong>{t.lastInscriptionCreated}:</strong>
                <br />
                <code className="text-sm">{lastInscriptionId}</code>
                <br />
                <a
                  href={`https://mempool.space/signet/tx/${lastInscriptionId.split(':')[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {t.viewInExplorer}
                </a>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}