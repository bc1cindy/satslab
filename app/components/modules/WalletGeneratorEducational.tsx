'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Input } from '@/app/components/ui/input'
import { Copy, RefreshCw, AlertTriangle, Check, Eye, EyeOff, Wallet, Key, Shield } from 'lucide-react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { createWallet } from '@/app/lib/supabase/queries'
import { useAnalytics } from '@/app/hooks/useAnalytics'
import { usePathname } from 'next/navigation'

// Mock para ambiente educacional - gera endereços válidos para demonstração
const generateMockWallet = () => {
  // Lista de palavras BIP39 comuns para demonstração
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
  ]
  
  // Gera 12 palavras aleatórias
  const mnemonic = Array(12)
    .fill(0)
    .map(() => words[Math.floor(Math.random() * words.length)])
    .join(' ')
  
  // Lista de endereços Signet válidos para demonstração educacional
  const validSignetAddresses = [
    'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
    'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7',
    'tb1q7842azeg85vwqtpwamcpysvjvmyeqj4sygrc2z',
    'tb1qnk5er5j30n6dqz7qv8s7sgthvzp6f7vgc8t8l4',
    'tb1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej',
    'tb1qm8tfegppm8ea8hxq8q4s4z5j3dn4ufqn6p45mk',
    'tb1qg9ejcauz36pukgjnt7hrrpht3vqe3hcq5jx7n7',
    'tb1qe4pdpvgchs2wnsxpq9m5j7vr2f6m8h2yeda4e7'
  ]
  
  // Seleciona um endereço aleatório da lista
  const address = validSignetAddresses[Math.floor(Math.random() * validSignetAddresses.length)]
  
  return {
    mnemonic,
    address,
    privateKey: 'Private key hidden for security' // Não mostramos chave privada no modo educacional
  }
}

interface WalletData {
  mnemonic: string
  address: string
  privateKey: string
}

export default function WalletGeneratorEducational() {
  const { session } = useAuth()
  const { trackWalletCreated } = useAnalytics()
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')
  
  const [currentStep, setCurrentStep] = useState<'intro' | 'generate' | 'backup' | 'verify' | 'complete'>('intro')
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [copied, setCopied] = useState<string>('')
  const [showSeed, setShowSeed] = useState(true)
  const [userConfirmed, setUserConfirmed] = useState(false)
  const [verificationWord, setVerificationWord] = useState('')
  const [verificationError, setVerificationError] = useState(false)

  // Translations
  const t = {
    title: isEnglish ? 'Educational Wallet Generator' : 'Gerador de Carteira Educacional',
    description: isEnglish 
      ? 'Let\'s create a Bitcoin wallet for the Signet network safely and educationally.'
      : 'Vamos criar uma carteira Bitcoin para a rede Signet de forma segura e educativa.',
    learningTitle: isEnglish ? '📚 You will learn:' : '📚 Você vai aprender:',
    learningItems: isEnglish ? [
      'How a seed phrase is generated',
      'The importance of secure backup',
      'How a Bitcoin address is derived'
    ] : [
      'Como é gerada uma seed phrase (frase-semente)',
      'A importância de fazer backup seguro',
      'Como um endereço Bitcoin é derivado'
    ],
    startButton: isEnglish ? 'Start Wallet Generation' : 'Iniciar Geração de Carteira',
    seedPhraseTitle: isEnglish ? 'Step 1: Your Seed Phrase' : 'Passo 1: Sua Seed Phrase (Frase-Semente)',
    warningTitle: isEnglish ? 'EXTREMELY IMPORTANT:' : 'EXTREMAMENTE IMPORTANTE:',
    warningText: isEnglish 
      ? 'This seed phrase is your wallet\'s master key. Never share it with anyone and keep it in a safe place!'
      : 'Esta seed phrase é a chave mestra da sua carteira. Nunca compartilhe com ninguém e guarde em local seguro!',
    showSeedPhrase: isEnglish ? 'Show Seed Phrase' : 'Mostrar Seed Phrase',
    hideSeedPhrase: isEnglish ? 'Hide' : 'Ocultar',
    showButton: isEnglish ? 'Show' : 'Mostrar',
    copyButton: isEnglish ? 'Copy' : 'Copiar',
    copiedButton: isEnglish ? 'Copied!' : 'Copiado!',
    tipText: isEnglish 
      ? '💡 Tip: Write down these 12 words on paper, in the correct order. Never take a photo or save in a digital file!'
      : '💡 Dica: Anote estas 12 palavras em papel, na ordem correta. Nunca tire foto ou salve em arquivo digital!',
    confirmBackup: isEnglish ? 'I have safely backed up my seed phrase' : 'Fiz backup seguro da minha seed phrase',
    verificationTitle: isEnglish ? 'Step 2: Verification' : 'Passo 2: Verificação',
    verificationText: isEnglish 
      ? 'To ensure you wrote down the seed phrase correctly, please enter the first word:'
      : 'Para garantir que anotou a seed phrase corretamente, digite a primeira palavra:',
    firstWordPlaceholder: isEnglish ? 'Enter the first word' : 'Digite a primeira palavra',
    verifyButton: isEnglish ? 'Verify' : 'Verificar',
    verificationError: isEnglish ? 'Incorrect word. Please try again.' : 'Palavra incorreta. Tente novamente.',
    completeTitle: isEnglish ? 'Step 3: Your Bitcoin Address' : 'Passo 3: Seu Endereço Bitcoin',
    addressTitle: isEnglish ? '🎯 Your Signet Address:' : '🎯 Seu Endereço Signet:',
    addressDescription: isEnglish 
      ? 'This address was generated from your seed phrase. Use it to receive sBTC on the Signet network.'
      : 'Este endereço foi gerado a partir da sua seed phrase. Use-o para receber sBTC na rede Signet.',
    generateNew: isEnglish ? 'Generate New Wallet' : 'Gerar Nova Carteira',
    congratulations: isEnglish ? '🎉 Congratulations!' : '🎉 Parabéns!',
    successMessage: isEnglish 
      ? 'You have successfully created your first Bitcoin wallet! Your address is ready to receive sBTC.'
      : 'Você criou com sucesso sua primeira carteira Bitcoin! Seu endereço está pronto para receber sBTC.',
    backupStep: isEnglish ? 'Excellent! Now let\'s verify that you wrote it down correctly.' : 'Excelente! Agora vamos verificar se você anotou corretamente.',
    securityQuestion: isEnglish ? 'For security, please answer:' : 'Por segurança, responda:',
    firstWordQuestion: isEnglish ? 'What is the first word of your seed phrase?' : 'Qual é a primeira palavra da sua seed phrase?',
    firstWordHint: isEnglish ? '(This confirms you have access to the backup)' : '(Isso confirma que você tem acesso ao backup)',
    firstWordPlaceholder: isEnglish ? 'Enter the first word...' : 'Digite a primeira palavra...',
    incorrectWord: isEnglish ? '❌ Incorrect word. Check your notes.' : '❌ Palavra incorreta. Verifique suas anotações.',
    confirmCheckbox: isEnglish ? 'I confirm that I have written down all 12 words in order and stored them in a safe place' : 'Confirmo que anotei todas as 12 palavras em ordem e guardei em local seguro',
    verifyAndContinue: isEnglish ? 'Verify and Continue' : 'Verificar e Continuar',
    enterFirstWord: isEnglish ? 'Enter the first word to continue' : 'Digite a primeira palavra para continuar',
    walletCreatedSuccess: isEnglish ? '🎉 Step 3: Wallet Created Successfully!' : '🎉 Passo 3: Carteira Criada com Sucesso!',
    congratsMessage: isEnglish ? 'Congratulations! You have created your Bitcoin wallet safely. Now you have an address to receive sBTC!' : 'Parabéns! Você criou sua carteira Bitcoin de forma segura. Agora você tem um endereço para receber sBTC!',
    copyAddress: isEnglish ? 'Copy Address' : 'Copiar Endereço',
    learnedTitle: isEnglish ? '📖 What you learned:' : '📖 O que você aprendeu:',
    learnedItems: isEnglish ? [
      'The seed phrase generates all wallet keys',
      'The address is mathematically derived from the seed',
      'Signet addresses start with "tb1"',
      'You can have infinite addresses with the same seed'
    ] : [
      'A seed phrase gera todas as chaves da carteira',
      'O endereço é derivado matematicamente da seed',
      'Endereços Signet começam com "tb1"',
      'Você pode ter infinitos endereços com a mesma seed'
    ],
    useAddressMessage: isEnglish ? 'Now use this address to receive sBTC from the faucet!' : 'Agora use este endereço para receber sBTC do faucet!'
  }

  const generateWallet = async () => {
    const newWallet = generateMockWallet()
    setWallet(newWallet)
    setCurrentStep('generate')
    
    // Salva o endereço no localStorage para usar em outros módulos
    if (typeof window !== 'undefined') {
      localStorage.setItem('satslab_user_address', newWallet.address)
      localStorage.setItem('satslab_wallet_created', Date.now().toString())
    }
    
    // Salva a carteira no banco se o usuário estiver logado
    if (session?.user.id) {
      try {
        await createWallet(
          session.user.id,
          newWallet.address,
          newWallet.address, // Using address as public key for educational purposes
          'signet'
        )
        console.log('Wallet saved to database')
      } catch (error) {
        console.error('Error saving wallet:', error)
      }
    }
    
    // Track wallet creation in analytics
    try {
      await trackWalletCreated('educational', 'signet')
    } catch (error) {
      console.warn('Failed to track wallet creation:', error)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleBackupConfirm = () => {
    setCurrentStep('verify')
  }

  const handleVerifyComplete = () => {
    if (!wallet) return
    
    const firstWord = wallet.mnemonic.split(' ')[0]
    if (verificationWord.toLowerCase().trim() === firstWord.toLowerCase()) {
      setVerificationError(false)
      setCurrentStep('complete')
    } else {
      setVerificationError(true)
    }
  }

  return (
    <div className="space-y-4">
      {/* Step: Introduction */}
      {currentStep === 'intro' && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center">
              <Wallet className="h-6 w-6 mr-2 text-orange-500" />
              {t.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-400 mb-4">
                {t.description}
              </p>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-left mb-4">
                <h4 className="font-semibold text-orange-400 mb-2">{t.learningTitle}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-orange-300">
                  {t.learningItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={generateWallet}
                className="bg-orange-500 hover:bg-orange-600"
                size="lg"
              >
                <Key className="h-5 w-5 mr-2" />
                {t.startButton}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Generate & Show Seed */}
      {currentStep === 'generate' && wallet && (
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-500" />
                {t.seedPhraseTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  <strong>{t.warningTitle}</strong> {t.warningText}
                </AlertDescription>
              </Alert>

              <div className="relative">
                <div className={`bg-gray-800 rounded-lg p-3 sm:p-6 ${!showSeed ? 'filter blur-lg select-none' : ''}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {wallet.mnemonic.split(' ').map((word, index) => (
                      <div key={index} className="bg-gray-700 rounded px-2 sm:px-3 py-2 text-center min-w-0">
                        <span className="text-xs text-gray-400">{index + 1}.</span>
                        <span className="ml-1 font-mono text-xs sm:text-sm break-words overflow-wrap-anywhere whitespace-normal">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {!showSeed && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      onClick={() => setShowSeed(true)}
                      variant="outline"
                      className="bg-gray-900"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t.showSeedPhrase}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  onClick={() => setShowSeed(!showSeed)}
                  variant="ghost"
                  size="sm"
                >
                  {showSeed ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      {t.hideSeedPhrase}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      {t.showButton}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => copyToClipboard(wallet.mnemonic, 'seed')}
                  variant="ghost"
                  size="sm"
                >
                  {copied === 'seed' ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      {t.copiedButton}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {t.copyButton}
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  {t.tipText}
                </p>
              </div>

              <Button
                onClick={handleBackupConfirm}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {t.confirmBackup}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Verify Backup */}
      {currentStep === 'verify' && wallet && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">
              ✅ {t.verificationTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              {t.backupStep}
            </p>
            
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm mb-2">{t.securityQuestion}</p>
                <p className="font-medium">{t.firstWordQuestion}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t.firstWordHint}
                </p>
              </div>
              
              <Input
                value={verificationWord}
                onChange={(e) => {
                  setVerificationWord(e.target.value)
                  setVerificationError(false)
                }}
                placeholder={t.firstWordPlaceholder}
                className="bg-gray-700 border-gray-600 text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userConfirmed) {
                    handleVerifyComplete()
                  }
                }}
              />
              
              {verificationError && (
                <p className="text-sm text-red-400">
                  {t.incorrectWord}
                </p>
              )}
            </div>

            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={userConfirmed}
                onChange={(e) => setUserConfirmed(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600 mt-1"
              />
              <span className="text-sm">
                {t.confirmCheckbox}
              </span>
            </label>

            <Button
              onClick={handleVerifyComplete}
              disabled={!userConfirmed || !verificationWord.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
            >
              {t.verifyAndContinue}
            </Button>
            
            {!verificationWord.trim() && userConfirmed && (
              <p className="text-xs text-center text-gray-500">
                {t.enterFirstWord}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step: Complete - Show Address */}
      {currentStep === 'complete' && wallet && (
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-green-400">
                {t.walletCreatedSuccess}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 text-sm">
                  {t.congratsMessage}
                </p>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-medium text-white mb-2">{t.addressTitle}</h4>
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
                      {t.copiedButton}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {t.copyAddress}
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-400 mb-2">{t.learnedTitle}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-300">
                  {t.learnedItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-3">
                  {t.useAddressMessage}
                </p>
                <Button
                  onClick={() => {
                    setCurrentStep('intro')
                    setWallet(null)
                    setUserConfirmed(false)
                    setVerificationWord('')
                    setVerificationError(false)
                  }}
                  variant="outline"
                  className="border-gray-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.generateNew}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}