'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Copy, Eye, EyeOff, Wallet, Shield, AlertTriangle } from 'lucide-react'
import { BitcoinWallet } from '@/app/types'

interface WalletGeneratorProps {
  onWalletGenerated?: (wallet: BitcoinWallet) => void
  network?: 'signet' | 'testnet' | 'mainnet'
}

/**
 * Componente para gerar carteiras Bitcoin na rede Signet
 * Inclui alertas de segurança e interface educacional
 */
export default function WalletGenerator({ 
  onWalletGenerated, 
  network = 'signet' 
}: WalletGeneratorProps) {
  const [wallet, setWallet] = useState<BitcoinWallet | null>(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Mock para geração de carteira - será substituído pelo WalletService
  const generateWallet = async () => {
    setIsGenerating(true)
    
    // Simula tempo de geração
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock wallet data - será substituído por implementação real
    const mockWallet: BitcoinWallet = {
      address: 'tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      privateKey: 'cVt4o7BGAig1UXywgGSmARhxMdzP5qvQsxKkSsc1XEkw3tDTQFpy',
      publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      network: network
    }
    
    setWallet(mockWallet)
    onWalletGenerated?.(mockWallet)
    setIsGenerating(false)
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alertas de Segurança */}
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <strong>Importante:</strong> Esta é uma carteira de teste (Signet). Nunca use chaves reais em ambientes de aprendizado!
        </AlertDescription>
      </Alert>

      {/* Gerador de Carteira */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Gerador de Carteira {network === 'signet' ? 'Signet' : 'Bitcoin'}
          </CardTitle>
          <CardDescription>
            Crie uma nova carteira Bitcoin para praticar na rede de teste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateWallet}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Gerando...' : 'Gerar Nova Carteira'}
          </Button>
        </CardContent>
      </Card>

      {/* Detalhes da Carteira */}
      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sua Carteira Gerada
            </CardTitle>
            <CardDescription>
              Guarde essas informações em local seguro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Endereço */}
            <div className="space-y-2">
              <Label>Endereço (Compartilhável)</Label>
              <div className="flex gap-2">
                <Input 
                  value={wallet.address} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.address, 'address')}
                >
                  <Copy className="h-4 w-4" />
                  {copied === 'address' ? 'Copiado!' : ''}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Este é seu endereço público - use para receber sBTC
              </p>
            </div>

            {/* Chave Privada */}
            <div className="space-y-2">
              <Label className="text-red-600 dark:text-red-400">
                Chave Privada (NUNCA compartilhe!)
              </Label>
              <div className="flex gap-2">
                <Input 
                  value={showPrivateKey ? wallet.privateKey : '••••••••••••••••••••••••••••••••'}
                  readOnly 
                  className="font-mono text-sm"
                  type={showPrivateKey ? 'text' : 'password'}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                >
                  {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.privateKey, 'privateKey')}
                >
                  <Copy className="h-4 w-4" />
                  {copied === 'privateKey' ? 'Copiado!' : ''}
                </Button>
              </div>
            </div>

            {/* Seed Phrase */}
            <div className="space-y-2">
              <Label className="text-red-600 dark:text-red-400">
                Frase-Semente (Backup - NUNCA compartilhe!)
              </Label>
              <div className="flex gap-2">
                <Input 
                  value={showMnemonic ? wallet.mnemonic : '•••••• •••••• •••••• •••••• •••••• ••••••'}
                  readOnly 
                  className="font-mono text-sm"
                  type={showMnemonic ? 'text' : 'password'}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMnemonic(!showMnemonic)}
                >
                  {showMnemonic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.mnemonic, 'mnemonic')}
                >
                  <Copy className="h-4 w-4" />
                  {copied === 'mnemonic' ? 'Copiado!' : ''}
                </Button>
              </div>
            </div>

            {/* Informações da Rede */}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rede:</span>
                <span className="font-medium capitalize">{wallet.network}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">P2WPKH (Bech32)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Passos */}
      {wallet && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-700 dark:text-green-300">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Copie seu endereço (tb1...)</li>
              <li>Acesse um faucet Signet (ex: https://signet.bc-2.jp/)</li>
              <li>Cole seu endereço no faucet e solicite sBTC</li>
              <li>Aguarde alguns minutos para receber os fundos</li>
              <li>Verifique no mempool.space/signet</li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}