'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Copy, RefreshCw, AlertTriangle, Check } from 'lucide-react'
import * as bip39 from 'bip39'
import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import { BIP32Factory } from 'bip32'

// Initialize BIP32
const bip32 = BIP32Factory(ecc)

// Signet network configuration
const signet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}

interface WalletData {
  mnemonic: string
  address: string
  privateKey: string
}

export default function WalletGeneratorSimple() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [copied, setCopied] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateWallet = async () => {
    setIsGenerating(true)
    
    try {
      // Generate mnemonic (12 words)
      const mnemonic = bip39.generateMnemonic(128)
      
      // Generate seed from mnemonic
      const seed = await bip39.mnemonicToSeed(mnemonic)
      
      // Create HD wallet
      const root = bip32.fromSeed(seed, signet)
      
      // Derive first address (m/84'/1'/0'/0/0 for Signet)
      const path = "m/84'/1'/0'/0/0"
      const child = root.derivePath(path)
      
      // Generate P2WPKH address (native segwit)
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(child.publicKey),
        network: signet,
      })
      
      if (!address) throw new Error('Failed to generate address')
      
      setWallet({
        mnemonic,
        address,
        privateKey: child.toWIF()
      })
      
      // Salva o endereço no localStorage para usar em outros módulos
      if (typeof window !== 'undefined') {
        localStorage.setItem('satslab_user_address', address)
        localStorage.setItem('satslab_wallet_created', Date.now().toString())
      }
    } catch (error) {
      console.error('Error generating wallet:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="space-y-4">
      {!wallet ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-center">Gerador de Carteira Signet</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-6">
              Clique no botão abaixo para gerar uma nova carteira Bitcoin para a rede Signet.
            </p>
            <Button
              onClick={generateWallet}
              disabled={isGenerating}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Nova Carteira'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Warning */}
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">
              <strong>IMPORTANTE:</strong> Salve sua seed phrase em um local seguro! 
              Esta é a única forma de recuperar sua carteira.
            </AlertDescription>
          </Alert>

          {/* Seed Phrase */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Seed Phrase (12 palavras)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm break-all">
                {wallet.mnemonic}
              </div>
              <Button
                onClick={() => copyToClipboard(wallet.mnemonic, 'seed')}
                variant="ghost"
                size="sm"
                className="mt-2"
              >
                {copied === 'seed' ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Seed Phrase
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Endereço Signet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm break-all">
                {wallet.address}
              </div>
              <Button
                onClick={() => copyToClipboard(wallet.address, 'address')}
                variant="ghost"
                size="sm"
                className="mt-2"
              >
                {copied === 'address' ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Endereço
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Use este endereço para receber sBTC do faucet
              </p>
            </CardContent>
          </Card>

          {/* Generate New */}
          <div className="text-center">
            <Button
              onClick={generateWallet}
              variant="outline"
              className="border-gray-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Gerar Nova Carteira
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}