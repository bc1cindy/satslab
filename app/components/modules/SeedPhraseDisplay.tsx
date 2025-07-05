'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { RefreshCw, Check, AlertTriangle, Eye, EyeOff, Copy } from 'lucide-react'

interface SeedPhraseDisplayProps {
  onSeedConfirmed?: (seed: string) => void
  onFirstWordConfirmed?: (word: string) => void
}

/**
 * Componente para exibir e confirmar seed phrases
 * Inclui geração, exibição segura e validação educacional
 */
export default function SeedPhraseDisplay({ 
  onSeedConfirmed, 
  onFirstWordConfirmed 
}: SeedPhraseDisplayProps) {
  const [seedPhrase, setSeedPhrase] = useState<string>('')
  const [showSeed, setShowSeed] = useState(false)
  const [confirmationWords, setConfirmationWords] = useState<number[]>([])
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({})
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [firstWord, setFirstWord] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  // Lista de palavras BIP39 para demonstração
  const bip39Words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'age',
    'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm'
  ]

  const generateSeedPhrase = async () => {
    setIsGenerating(true)
    
    // Simula geração
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Gera 12 palavras aleatórias da lista BIP39
    const words = []
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * bip39Words.length)
      words.push(bip39Words[randomIndex])
    }
    
    const newSeed = words.join(' ')
    setSeedPhrase(newSeed)
    
    // Seleciona 3 palavras aleatórias para confirmação
    const randomPositions: number[] = []
    while (randomPositions.length < 3) {
      const pos = Math.floor(Math.random() * 12)
      if (!randomPositions.includes(pos)) {
        randomPositions.push(pos)
      }
    }
    
    setConfirmationWords(randomPositions.sort((a, b) => a - b))
    setUserAnswers({})
    setIsConfirmed(false)
    setFirstWord('')
    setIsGenerating(false)
  }

  const handleWordChange = (position: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [position]: value.toLowerCase().trim()
    }))
  }

  const validateConfirmation = () => {
    const seedWords = seedPhrase.split(' ')
    const isValid = confirmationWords.every(pos => 
      userAnswers[pos] === seedWords[pos]
    )
    
    if (isValid) {
      setIsConfirmed(true)
      onSeedConfirmed?.(seedPhrase)
    }
    
    return isValid
  }

  const handleFirstWordSubmit = () => {
    const firstSeedWord = seedPhrase.split(' ')[0]
    if (firstWord.toLowerCase().trim() === firstSeedWord) {
      onFirstWordConfirmed?.(firstWord)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(seedPhrase)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const seedWords = seedPhrase.split(' ')

  return (
    <div className="space-y-6">
      {/* Alertas de Segurança */}
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <strong>NUNCA compartilhe sua seed phrase!</strong> Quem tiver acesso a ela pode roubar todos os seus bitcoins.
        </AlertDescription>
      </Alert>

      {/* Gerador de Seed Phrase */}
      <Card>
        <CardHeader>
          <CardTitle>Gerador de Seed Phrase</CardTitle>
          <CardDescription>
            Crie uma frase-semente segura de 12 palavras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateSeedPhrase}
            disabled={isGenerating}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Gerando...' : 'Gerar Nova Seed Phrase'}
          </Button>
        </CardContent>
      </Card>

      {/* Exibição da Seed Phrase */}
      {seedPhrase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sua Seed Phrase</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSeed(!showSeed)}
                >
                  {showSeed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copiado!' : ''}
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Anote essas 12 palavras em ordem exata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {seedWords.map((word, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <Badge variant="secondary" className="font-mono">
                    {showSeed ? word : '••••••'}
                  </Badge>
                </div>
              ))}
            </div>
            
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Dica:</strong> Anote em papel, nunca em arquivo digital. Guarde em local seguro!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Confirmação da Seed Phrase */}
      {seedPhrase && !isConfirmed && (
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Seed Phrase</CardTitle>
            <CardDescription>
              Digite as palavras solicitadas para confirmar que anotou corretamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {confirmationWords.map(position => (
              <div key={position} className="space-y-2">
                <Label>Palavra #{position + 1}</Label>
                <Input
                  value={userAnswers[position] || ''}
                  onChange={(e) => handleWordChange(position, e.target.value)}
                  placeholder={`Digite a palavra ${position + 1}`}
                  className="font-mono"
                />
              </div>
            ))}
            
            <Button 
              onClick={validateConfirmation}
              className="w-full"
              disabled={confirmationWords.some(pos => !userAnswers[pos])}
            >
              Confirmar Seed Phrase
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Seed Phrase Confirmada */}
      {isConfirmed && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Seed Phrase Confirmada!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700 dark:text-green-300">
                Excelente! Você confirmou que anotou sua seed phrase corretamente.
              </p>
              
              <div className="space-y-2">
                <Label>Para finalizar, digite a primeira palavra:</Label>
                <div className="flex gap-2">
                  <Input
                    value={firstWord}
                    onChange={(e) => setFirstWord(e.target.value)}
                    placeholder="Digite a primeira palavra da sua seed phrase"
                    className="font-mono"
                  />
                  <Button onClick={handleFirstWordSubmit}>
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educação sobre Segurança */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-200">
            Boas Práticas de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700 dark:text-amber-300">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Nunca digite sua seed phrase em sites ou aplicativos</li>
            <li>Nunca tire foto ou salve em arquivo digital</li>
            <li>Use papel e caneta para anotar</li>
            <li>Guarde em local seguro, protegido de fogo e água</li>
            <li>Considere fazer múltiplas cópias em locais diferentes</li>
            <li>Nunca compartilhe com ninguém, nem família</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}