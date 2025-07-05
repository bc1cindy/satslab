'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Separator } from '@/app/components/ui/separator'
import { OrdinalsService, BadgeNFT, OrdinalUTXO } from '@/app/lib/bitcoin/ordinals-service'
import { SIGNET_NETWORK } from '@/app/lib/bitcoin/crypto'
import { useToast } from '@/app/hooks/use-toast'

interface BadgeNFTCreatorProps {
  userPublicKey?: string
  onBadgeCreated?: (badgeId: string, badgeData: BadgeNFT) => void
}

interface BadgeTemplate {
  id: string
  name: string
  description: string
  color: string
  icon: string
  requirements: string[]
  rarity: 'common' | 'rare' | 'legendary'
}

const BADGE_TEMPLATES: BadgeTemplate[] = [
  {
    id: 'pioneiro-taproot',
    name: 'Pioneiro Taproot',
    description: 'Dominou o protocolo Taproot e criou transações avançadas',
    color: 'from-orange-400 to-orange-600',
    icon: '🚀',
    requirements: ['Criar endereço Taproot', 'Executar transação Taproot'],
    rarity: 'rare'
  },
  {
    id: 'mestre-multisig',
    name: 'Mestre Multisig',
    description: 'Especialista em carteiras multisig e segurança avançada',
    color: 'from-blue-400 to-blue-600',
    icon: '🔐',
    requirements: ['Criar carteira 2-de-3', 'Assinar transação multisig'],
    rarity: 'legendary'
  },
  {
    id: 'explorador-ordinals',
    name: 'Explorador Ordinals',
    description: 'Pioneiro na criação de NFTs nativos do Bitcoin',
    color: 'from-purple-400 to-purple-600',
    icon: '🎨',
    requirements: ['Criar Ordinal', 'Verificar propriedade'],
    rarity: 'rare'
  },
  {
    id: 'arquiteto-hd',
    name: 'Arquiteto HD',
    description: 'Mestre em carteiras hierárquicas e derivação de chaves',
    color: 'from-green-400 to-green-600',
    icon: '🏗️',
    requirements: ['Criar carteira HD', 'Derivar 5+ endereços'],
    rarity: 'common'
  }
]

export default function BadgeNFTCreator({ userPublicKey, onBadgeCreated }: BadgeNFTCreatorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<BadgeTemplate | null>(null)
  const [customBadgeName, setCustomBadgeName] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [mintedBadges, setMintedBadges] = useState<Array<{id: string, data: BadgeNFT}>>([])
  const [previewMode, setPreviewMode] = useState<'template' | 'custom'>('template')
  
  const { toast } = useToast()
  const ordinalsService = new OrdinalsService(SIGNET_NETWORK)

  const currentBadgeData = useMemo(() => {
    if (!userPublicKey) return null

    if (previewMode === 'template' && selectedTemplate) {
      return {
        badge: selectedTemplate.name,
        user_id: userPublicKey,
        timestamp: Date.now(),
        network: 'signet',
        description: selectedTemplate.description,
        rarity: selectedTemplate.rarity,
        requirements: selectedTemplate.requirements,
        icon: selectedTemplate.icon,
        color: selectedTemplate.color
      }
    } else if (previewMode === 'custom' && customBadgeName) {
      return {
        badge: customBadgeName,
        user_id: userPublicKey,
        timestamp: Date.now(),
        network: 'signet',
        description: customDescription || 'Badge customizado',
        rarity: 'common' as const,
        requirements: ['Criação customizada'],
        icon: '🏆',
        color: 'from-gray-400 to-gray-600'
      }
    }

    return null
  }, [userPublicKey, previewMode, selectedTemplate, customBadgeName, customDescription])

  const generateBadgeArt = useCallback((badgeData: any) => {
    // Gera arte SVG simples para o badge
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#gradient)" stroke="#92400e" stroke-width="4"/>
        <text x="100" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="white">
          ${badgeData.icon || '🏆'}
        </text>
        <text x="100" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">
          ${badgeData.badge}
        </text>
        <text x="100" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#fed7aa">
          ${badgeData.network.toUpperCase()}
        </text>
      </svg>
    `
    return svg
  }, [])

  const mintBadgeNFT = useCallback(async () => {
    if (!currentBadgeData || !privateKey) {
      toast({
        title: "Erro",
        description: "Selecione um badge e forneça a chave privada",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)

    try {
      // Cria metadata completa do badge
      const completeMetadata = {
        ...currentBadgeData,
        image: generateBadgeArt(currentBadgeData),
        attributes: [
          { trait_type: "Rarity", value: currentBadgeData.rarity },
          { trait_type: "Network", value: currentBadgeData.network },
          { trait_type: "Timestamp", value: currentBadgeData.timestamp },
          { trait_type: "Module", value: selectedTemplate?.id || 'custom' }
        ],
        external_url: "https://satslab.xyz",
        animation_url: null,
        background_color: "000000"
      }

      // Para demonstração, criamos UTXOs mock
      const utxos: OrdinalUTXO[] = [{
        txid: '0'.repeat(64),
        vout: 0,
        value: 100000, // 0.001 BTC
        address: '',
      }]

      const inscription = await ordinalsService.mintBadgeNFT(
        currentBadgeData,
        privateKey,
        utxos,
        1
      )

      const newBadge = {
        id: inscription.inscriptionId,
        data: currentBadgeData
      }

      setMintedBadges(prev => [...prev, newBadge])
      
      toast({
        title: "Badge NFT Mintado!",
        description: `Badge "${currentBadgeData.badge}" criado com sucesso`,
      })

      if (onBadgeCreated) {
        onBadgeCreated(inscription.inscriptionId, currentBadgeData)
      }

    } catch (error) {
      toast({
        title: "Erro ao mintar badge",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }, [currentBadgeData, privateKey, generateBadgeArt, selectedTemplate, ordinalsService, toast, onBadgeCreated])

  const verifyBadgeOwnership = useCallback(async (badgeId: string) => {
    if (!userPublicKey) return false

    try {
      // Em um ambiente real, isso consultaria um indexador de Ordinals
      const isValid = await ordinalsService.verifyOrdinalOwnership(badgeId, userPublicKey)
      
      toast({
        title: isValid ? "Badge Verificado!" : "Verificação Falhou",
        description: isValid ? "Badge é válido e pertence ao usuário" : "Badge não foi encontrado ou não pertence ao usuário",
        variant: isValid ? "default" : "destructive",
      })

      return isValid
    } catch (error) {
      toast({
        title: "Erro na verificação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
      return false
    }
  }, [userPublicKey, ordinalsService, toast])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800'
      case 'rare': return 'bg-blue-100 text-blue-800'
      case 'legendary': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Badge NFT Creator</CardTitle>
          <CardDescription>
            Crie badges NFT como Ordinals para certificar conquistas e habilidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Seleção do Modo */}
            <div className="space-y-2">
              <Label>Modo de Criação</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={previewMode === 'template' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('template')}
                >
                  Templates
                </Button>
                <Button
                  variant={previewMode === 'custom' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('custom')}
                >
                  Customizado
                </Button>
              </div>
            </div>

            <Separator />

            {/* Templates de Badge */}
            {previewMode === 'template' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Templates de Badge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BADGE_TEMPLATES.map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${template.color} flex items-center justify-center text-white text-xl`}>
                            {template.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge className={getRarityColor(template.rarity)}>
                                {template.rarity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            <div className="mt-2">
                              <Label className="text-xs">Requisitos:</Label>
                              <ul className="text-xs text-gray-500 mt-1">
                                {template.requirements.map((req, idx) => (
                                  <li key={idx}>• {req}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Badge Customizado */}
            {previewMode === 'custom' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Badge Customizado</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="custom-name">Nome do Badge</Label>
                    <Input
                      id="custom-name"
                      value={customBadgeName}
                      onChange={(e) => setCustomBadgeName(e.target.value)}
                      placeholder="Meu Badge Especial"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-description">Descrição</Label>
                    <textarea
                      id="custom-description"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Descrição do que este badge representa..."
                      className="w-full h-20 p-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preview do Badge */}
            {currentBadgeData && (
              <div className="space-y-4">
                <h3 className="font-semibold">Preview do Badge</h3>
                <Card className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentBadgeData.color || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white text-2xl`}>
                      {currentBadgeData.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{currentBadgeData.badge}</h4>
                        <Badge className={getRarityColor(currentBadgeData.rarity)}>
                          {currentBadgeData.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{currentBadgeData.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        <div>User ID: {currentBadgeData.user_id.substring(0, 20)}...</div>
                        <div>Network: {currentBadgeData.network.toUpperCase()}</div>
                        <div>Timestamp: {new Date(currentBadgeData.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Configuração de Mint */}
            <div className="space-y-4">
              <h3 className="font-semibold">Configuração de Mint</h3>
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

              {userPublicKey && (
                <Alert>
                  <AlertDescription>
                    <strong>Usuário:</strong> {userPublicKey.substring(0, 20)}...
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={mintBadgeNFT} 
                disabled={isMinting || !currentBadgeData || !privateKey}
                className="w-full"
              >
                {isMinting ? 'Mintando Badge...' : 'Mintar Badge NFT'}
              </Button>
            </div>

            {/* Badges Mintados */}
            {mintedBadges.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Badges Mintados</h3>
                <div className="space-y-3">
                  {mintedBadges.map((badge, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${badge.data.color || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white text-lg`}>
                            {badge.data.icon}
                          </div>
                          <div>
                            <div className="font-medium">{badge.data.badge}</div>
                            <div className="text-sm text-gray-600">
                              ID: {badge.id.substring(0, 20)}...
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyBadgeOwnership(badge.id)}
                          >
                            Verificar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://mempool.space/signet/tx/${badge.id.split(':')[0]}`, '_blank')}
                          >
                            Explorer
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações sobre NFT Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre NFT Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">O que são Badge NFTs?</h4>
              <p className="text-sm text-gray-600">
                Badge NFTs são certificados digitais únicos criados como Ordinals no Bitcoin. 
                Cada badge representa uma conquista ou habilidade específica, provando conhecimento 
                e experiência em diferentes aspectos do protocolo Bitcoin.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">Vantagens dos Ordinals</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Nativos do Bitcoin - sem sidechains ou tokens</li>
                <li>• Imutáveis e permanentes na blockchain</li>
                <li>• Transferíveis como qualquer UTXO</li>
                <li>• Verificáveis por qualquer pessoa</li>
                <li>• Resistentes à censura</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Casos de Uso</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Certificação de conhecimento técnico</li>
                <li>• Proof of attendance em eventos</li>
                <li>• Reconhecimento de conquistas</li>
                <li>• Credenciais profissionais</li>
                <li>• Colecionáveis educacionais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}