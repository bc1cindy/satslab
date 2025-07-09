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
import { HDWalletService, HDWallet, DerivedAddress, DerivationPath } from '@/app/lib/bitcoin/hd-wallet-service'
import { SIGNET_NETWORK } from '@/app/lib/bitcoin/bitcoin-crypto'
import { useToast } from '@/app/hooks/use-toast'

interface HDWalletManagerProps {
  onWalletCreated?: (wallet: HDWallet) => void
  onAddressGenerated?: (address: string) => void
}

export default function HDWalletManager({ onWalletCreated, onAddressGenerated }: HDWalletManagerProps) {
  const [hdWallet, setHdWallet] = useState<HDWallet | null>(null)
  const [mnemonicInput, setMnemonicInput] = useState('')
  const [derivedAddresses, setDerivedAddresses] = useState<DerivedAddress[]>([])
  const [customPath, setCustomPath] = useState("m/44'/1'/0'/0/0")
  const [addressCount, setAddressCount] = useState(5)
  const [addressType, setAddressType] = useState<'p2wpkh' | 'p2sh' | 'p2tr'>('p2wpkh')
  const [showPrivateKeys, setShowPrivateKeys] = useState(false)
  const [exportedXPub, setExportedXPub] = useState('')
  const [walletInfo, setWalletInfo] = useState<{fingerprint: string, publicKey: string, chainCode: string, depth: number, index: number} | null>(null)
  
  const { toast } = useToast()
  const hdWalletService = useMemo(() => new HDWalletService(SIGNET_NETWORK), [])

  const generateHDWallet = useCallback(() => {
    try {
      const wallet = hdWalletService.generateHDWallet()
      setHdWallet(wallet)
      setMnemonicInput(wallet.mnemonic)
      
      const info = hdWalletService.getWalletInfo(wallet)
      setWalletInfo(info)
      
      toast({
        title: "Carteira HD Gerada!",
        description: "Nova carteira hierárquica criada com sucesso",
      })

      if (onWalletCreated) {
        onWalletCreated(wallet)
      }
    } catch (error) {
      toast({
        title: "Erro ao gerar carteira",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }, [hdWalletService, toast, onWalletCreated])

  const restoreHDWallet = useCallback(() => {
    if (!mnemonicInput.trim()) {
      toast({
        title: "Erro",
        description: "Insira um mnemônico válido",
        variant: "destructive",
      })
      return
    }

    try {
      const wallet = hdWalletService.restoreHDWallet(mnemonicInput.trim())
      setHdWallet(wallet)
      
      const info = hdWalletService.getWalletInfo(wallet)
      setWalletInfo(info)
      
      toast({
        title: "Carteira HD Restaurada!",
        description: "Carteira recuperada com sucesso",
      })

      if (onWalletCreated) {
        onWalletCreated(wallet)
      }
    } catch (error) {
      toast({
        title: "Erro ao restaurar carteira",
        description: error instanceof Error ? error.message : "Mnemônico inválido",
        variant: "destructive",
      })
    }
  }, [mnemonicInput, hdWalletService, toast, onWalletCreated])

  const deriveCustomAddress = useCallback(() => {
    if (!hdWallet) {
      toast({
        title: "Erro",
        description: "Crie uma carteira HD primeiro",
        variant: "destructive",
      })
      return
    }

    try {
      const address = hdWalletService.deriveAddress(hdWallet.masterKey, customPath, addressType)
      setDerivedAddresses([address])
      
      toast({
        title: "Endereço Derivado!",
        description: `Endereço: ${address.address}`,
      })

      if (onAddressGenerated) {
        onAddressGenerated(address.address)
      }
    } catch (error) {
      toast({
        title: "Erro ao derivar endereço",
        description: error instanceof Error ? error.message : "Path inválido",
        variant: "destructive",
      })
    }
  }, [hdWallet, customPath, addressType, hdWalletService, toast, onAddressGenerated])

  const generateReceiveAddresses = useCallback(() => {
    if (!hdWallet) {
      toast({
        title: "Erro",
        description: "Crie uma carteira HD primeiro",
        variant: "destructive",
      })
      return
    }

    try {
      const addresses = hdWalletService.generateReceiveAddresses(
        hdWallet.masterKey,
        addressCount,
        0,
        addressType
      )
      setDerivedAddresses(addresses)
      
      toast({
        title: "Endereços Gerados!",
        description: `${addresses.length} endereços de recebimento criados`,
      })
    } catch (error) {
      toast({
        title: "Erro ao gerar endereços",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }, [hdWallet, addressCount, addressType, hdWalletService, toast])

  const generateBIP84Addresses = useCallback(() => {
    if (!hdWallet) {
      toast({
        title: "Erro",
        description: "Crie uma carteira HD primeiro",
        variant: "destructive",
      })
      return
    }

    try {
      const addresses = hdWalletService.generateBIP84Addresses(
        hdWallet.masterKey,
        addressCount
      )
      setDerivedAddresses(addresses)
      
      toast({
        title: "Endereços BIP84 Gerados!",
        description: `${addresses.length} endereços Native SegWit criados`,
      })
    } catch (error) {
      toast({
        title: "Erro ao gerar endereços BIP84",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }, [hdWallet, addressCount, hdWalletService, toast])

  const generateBIP86Addresses = useCallback(() => {
    if (!hdWallet) {
      toast({
        title: "Erro",
        description: "Crie uma carteira HD primeiro",
        variant: "destructive",
      })
      return
    }

    try {
      const addresses = hdWalletService.generateBIP86Addresses(
        hdWallet.masterKey,
        addressCount
      )
      setDerivedAddresses(addresses)
      
      toast({
        title: "Endereços BIP86 Gerados!",
        description: `${addresses.length} endereços Taproot criados`,
      })
    } catch (error) {
      toast({
        title: "Erro ao gerar endereços BIP86",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }, [hdWallet, addressCount, hdWalletService, toast])

  const exportXPub = useCallback(() => {
    if (!hdWallet) {
      toast({
        title: "Erro",
        description: "Crie uma carteira HD primeiro",
        variant: "destructive",
      })
      return
    }

    try {
      const xpub = hdWalletService.exportExtendedPublicKey(hdWallet.masterKey)
      setExportedXPub(xpub)
      
      toast({
        title: "XPub Exportado!",
        description: "Chave pública estendida copiada",
      })
    } catch (error) {
      toast({
        title: "Erro ao exportar XPub",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }, [hdWallet, hdWalletService, toast])

  const parseCustomPath = useCallback((path: string): DerivationPath | null => {
    try {
      return hdWalletService.parseDerivationPath(path)
    } catch {
      return null
    }
  }, [hdWalletService])

  const customPathInfo = parseCustomPath(customPath)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>HD Wallet Manager</CardTitle>
          <CardDescription>
            Gerencie carteiras hierárquicas determinísticas com derivação BIP32/BIP44
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="wallet">Carteira</TabsTrigger>
              <TabsTrigger value="derive">Derivar</TabsTrigger>
              <TabsTrigger value="addresses">Endereços</TabsTrigger>
              <TabsTrigger value="standards">Padrões</TabsTrigger>
              <TabsTrigger value="export">Exportar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wallet" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={generateHDWallet} className="flex-1">
                    Gerar Nova Carteira HD
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="mnemonic-input">Mnemônico (12 palavras)</Label>
                  <textarea
                    id="mnemonic-input"
                    value={mnemonicInput}
                    onChange={(e) => setMnemonicInput(e.target.value)}
                    placeholder="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
                    className="w-full h-20 p-2 border rounded-md text-sm"
                  />
                  <Button onClick={restoreHDWallet} className="w-full">
                    Restaurar Carteira
                  </Button>
                </div>

                {hdWallet && (
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-2">
                        <div>
                          <strong>Carteira HD Ativa</strong>
                        </div>
                        <div>
                          <strong>Mnemônico:</strong>
                          <br />
                          <code className="text-sm">{hdWallet.mnemonic}</code>
                        </div>
                        <div>
                          <strong>Fingerprint:</strong> {hdWallet.fingerprint}
                        </div>
                        {walletInfo && (
                          <div>
                            <strong>Chave Pública Master:</strong>
                            <br />
                            <code className="text-xs break-all">{walletInfo.publicKey}</code>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="derive" className="space-y-4">
              {!hdWallet && (
                <Alert>
                  <AlertDescription>
                    Crie ou restaure uma carteira HD primeiro na aba "Carteira"
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-path">Path de Derivação Custom</Label>
                  <Input
                    id="custom-path"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="m/44'/1'/0'/0/0"
                    disabled={!hdWallet}
                  />
                  {customPathInfo && (
                    <div className="text-sm text-gray-600">
                      Purpose: {customPathInfo.purpose}, Coin: {customPathInfo.coinType}, 
                      Account: {customPathInfo.account}, Change: {customPathInfo.change}, 
                      Index: {customPathInfo.addressIndex}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Endereço</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={addressType === 'p2wpkh' ? 'default' : 'outline'}
                      onClick={() => setAddressType('p2wpkh')}
                    >
                      P2WPKH
                    </Button>
                    <Button
                      variant={addressType === 'p2sh' ? 'default' : 'outline'}
                      onClick={() => setAddressType('p2sh')}
                    >
                      P2SH
                    </Button>
                    <Button
                      variant={addressType === 'p2tr' ? 'default' : 'outline'}
                      onClick={() => setAddressType('p2tr')}
                    >
                      P2TR
                    </Button>
                  </div>
                </div>

                <Button onClick={deriveCustomAddress} disabled={!hdWallet} className="w-full">
                  Derivar Endereço
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="addresses" className="space-y-4">
              {!hdWallet && (
                <Alert>
                  <AlertDescription>
                    Crie ou restaure uma carteira HD primeiro na aba "Carteira"
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address-count">Quantidade de Endereços</Label>
                  <Input
                    id="address-count"
                    type="number"
                    value={addressCount}
                    onChange={(e) => setAddressCount(Number(e.target.value))}
                    min="1"
                    max="20"
                    disabled={!hdWallet}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={generateReceiveAddresses} disabled={!hdWallet}>
                    Gerar Endereços de Recebimento
                  </Button>
                  <Button onClick={generateBIP84Addresses} disabled={!hdWallet}>
                    Gerar BIP84 (Native SegWit)
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-private-keys"
                    checked={showPrivateKeys}
                    onChange={(e) => setShowPrivateKeys(e.target.checked)}
                  />
                  <Label htmlFor="show-private-keys">Mostrar Chaves Privadas</Label>
                </div>

                {derivedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Endereços Derivados</h4>
                    {derivedAddresses.map((addr, index) => (
                      <Card key={index} className="p-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary">Índice {addr.index}</Badge>
                            <Badge variant="outline">{addr.path}</Badge>
                          </div>
                          <div>
                            <Label className="text-xs">Endereço:</Label>
                            <code className="text-sm break-all block bg-gray-50 p-2 rounded">
                              {addr.address}
                            </code>
                          </div>
                          <div>
                            <Label className="text-xs">Chave Pública:</Label>
                            <code className="text-xs break-all block bg-gray-50 p-1 rounded">
                              {addr.publicKey}
                            </code>
                          </div>
                          {showPrivateKeys && (
                            <div>
                              <Label className="text-xs">Chave Privada (WIF):</Label>
                              <code className="text-xs break-all block bg-red-50 p-1 rounded border border-red-200">
                                {addr.privateKey}
                              </code>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="standards" className="space-y-4">
              {!hdWallet && (
                <Alert>
                  <AlertDescription>
                    Crie ou restaure uma carteira HD primeiro na aba "Carteira"
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Padrões de Derivação</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">BIP44 (m/44'/1'/0'/0/x)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">
                        Padrão multi-moeda para carteiras HD
                      </p>
                      <Button onClick={generateReceiveAddresses} disabled={!hdWallet}>
                        Gerar Endereços BIP44
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">BIP84 (m/84'/1'/0'/0/x)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">
                        Native SegWit (P2WPKH) - Endereços bc1q...
                      </p>
                      <Button onClick={generateBIP84Addresses} disabled={!hdWallet}>
                        Gerar Endereços BIP84
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">BIP86 (m/86'/1'/0'/0/x)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">
                        Taproot (P2TR) - Endereços bc1p...
                      </p>
                      <Button onClick={generateBIP86Addresses} disabled={!hdWallet}>
                        Gerar Endereços BIP86
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800">Árvore de Derivação</h4>
                  <div className="mt-2 text-sm text-blue-700 font-mono">
                    <div>m (master)</div>
                    <div>├── 44' (purpose)</div>
                    <div>│   ├── 1' (coin type - testnet)</div>
                    <div>│   │   ├── 0' (account)</div>
                    <div>│   │   │   ├── 0 (external/receive)</div>
                    <div>│   │   │   │   ├── 0 (first address)</div>
                    <div>│   │   │   │   ├── 1 (second address)</div>
                    <div>│   │   │   │   └── ...</div>
                    <div>│   │   │   └── 1 (internal/change)</div>
                    <div>│   │   │       └── ...</div>
                    <div>│   │   └── ...</div>
                    <div>│   └── ...</div>
                    <div>└── ...</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="space-y-4">
              {!hdWallet && (
                <Alert>
                  <AlertDescription>
                    Crie ou restaure uma carteira HD primeiro na aba "Carteira"
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Exportar Chaves Estendidas</h3>
                
                <div className="space-y-2">
                  <Button onClick={exportXPub} disabled={!hdWallet}>
                    Exportar XPub (Chave Pública Estendida)
                  </Button>
                  <p className="text-xs text-gray-500">
                    XPub permite gerar endereços sem expor chaves privadas
                  </p>
                </div>

                {exportedXPub && (
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-2">
                        <strong>XPub Exportado:</strong>
                        <textarea
                          value={exportedXPub}
                          readOnly
                          className="w-full h-20 p-2 border rounded-md text-xs font-mono"
                        />
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800">⚠️ Aviso de Segurança</h4>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    <li>• Mantenha seu mnemônico seguro - ele dá acesso total à carteira</li>
                    <li>• XPub revela histórico de transações - use com cuidado</li>
                    <li>• Nunca compartilhe chaves privadas</li>
                    <li>• Faça backup do mnemônico em local seguro</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}