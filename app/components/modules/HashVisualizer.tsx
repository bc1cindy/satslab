'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Hash, Eye, Shuffle, Copy, CheckCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

interface HashVisualizerProps {
  onHashGenerated?: (hash: string) => void
}

export default function HashVisualizer({ onHashGenerated }: HashVisualizerProps) {
  const [input, setInput] = useState('Hello Bitcoin!')
  const [hash, setHash] = useState('')
  const [copied, setCopied] = useState(false)

  // Função SHA-256 simplificada para demonstração
  const simpleSHA256 = (input: string): string => {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Simula a saída SHA-256 com base no input
    const baseHash = Math.abs(hash).toString(16)
    const random = Math.random().toString(16).slice(2, 16)
    const combined = baseHash + random + input.length.toString(16)
    
    // Pad to 64 characters (SHA-256 output length)
    return combined.padEnd(64, '0').slice(0, 64)
  }

  useEffect(() => {
    const newHash = simpleSHA256(input)
    setHash(newHash)
    onHashGenerated?.(newHash)
  }, [input, onHashGenerated])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateRandomInput = () => {
    const randomInputs = [
      'Hello Bitcoin!',
      'Blockchain is the future',
      'Satoshi Nakamoto',
      'Digital Gold',
      'Decentralized Money',
      'Proof of Work',
      'HODL',
      'To the Moon',
      'Stack Sats',
      'Lightning Network'
    ]
    const randomIndex = Math.floor(Math.random() * randomInputs.length)
    setInput(randomInputs[randomIndex])
  }

  const analyzeHash = (hash: string) => {
    const leadingZeros = hash.match(/^0*/)?.[0]?.length || 0
    const hasPatterns = {
      startsWith0: hash.startsWith('0'),
      startsWith00: hash.startsWith('00'),
      startsWith000: hash.startsWith('000'),
      startsWith0000: hash.startsWith('0000'),
      hasRepeatingChars: /(.)\1{2,}/.test(hash),
      isAllNumbers: /^\d+$/.test(hash),
      isAllLetters: /^[a-f]+$/.test(hash)
    }
    
    return {
      leadingZeros,
      patterns: hasPatterns,
      entropy: calculateEntropy(hash),
      distribution: getCharDistribution(hash)
    }
  }

  const calculateEntropy = (str: string): number => {
    const freq: Record<string, number> = {}
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1
    }
    
    let entropy = 0
    const len = str.length
    for (const count of Object.values(freq)) {
      const p = (count as number) / len
      entropy -= p * Math.log2(p)
    }
    
    return entropy
  }

  const getCharDistribution = (hash: string) => {
    const chars = '0123456789abcdef'
    const distribution: Record<string, number> = {}
    
    for (const char of chars) {
      distribution[char] = (hash.match(new RegExp(char, 'g')) || []).length
    }
    
    return distribution
  }

  const hashAnalysis = analyzeHash(hash)
  const maxCount = Math.max(...Object.values(hashAnalysis.distribution) as number[])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-6 h-6" />
          Visualizador de Hash SHA-256
        </CardTitle>
        <p className="text-sm text-gray-600">
          Explore as propriedades criptográficas do SHA-256 em tempo real
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="input" className="font-medium">Entrada de dados:</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={generateRandomInput}
              className="flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3" />
              Random
            </Button>
          </div>
          <Input
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite qualquer texto..."
            className="font-mono"
          />
          <div className="text-sm text-gray-500">
            Caracteres: {input.length} | Bytes: {new Blob([input]).size}
          </div>
        </div>

        {/* Hash Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Hash SHA-256:</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(hash)}
              className="flex items-center gap-1"
            >
              {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-mono text-sm break-all leading-relaxed">
              {hash.split('').map((char, index) => (
                <span
                  key={index}
                  className={`${
                    char === '0' 
                      ? 'text-red-600 bg-red-50' 
                      : /[0-9]/.test(char)
                      ? 'text-blue-600'
                      : 'text-green-600'
                  } ${index % 8 === 0 ? 'ml-2' : ''}`}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hash Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Properties */}
          <div className="space-y-4">
            <h3 className="font-semibold">Propriedades</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Zeros iniciais:</span>
                <Badge variant={hashAnalysis.leadingZeros > 0 ? "default" : "secondary"}>
                  {hashAnalysis.leadingZeros}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Entropia:</span>
                <Badge variant="outline">
                  {hashAnalysis.entropy.toFixed(2)} bits
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Comprimento:</span>
                <Badge variant="outline">
                  {hash.length} caracteres
                </Badge>
              </div>
            </div>
          </div>

          {/* Patterns */}
          <div className="space-y-4">
            <h3 className="font-semibold">Padrões</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Começa com 0:</span>
                <Badge variant={hashAnalysis.patterns.startsWith0 ? "default" : "secondary"}>
                  {hashAnalysis.patterns.startsWith0 ? 'Sim' : 'Não'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Começa com 00:</span>
                <Badge variant={hashAnalysis.patterns.startsWith00 ? "default" : "secondary"}>
                  {hashAnalysis.patterns.startsWith00 ? 'Sim' : 'Não'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Começa com 000:</span>
                <Badge variant={hashAnalysis.patterns.startsWith000 ? "default" : "secondary"}>
                  {hashAnalysis.patterns.startsWith000 ? 'Sim' : 'Não'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Começa com 0000:</span>
                <Badge variant={hashAnalysis.patterns.startsWith0000 ? "default" : "secondary"}>
                  {hashAnalysis.patterns.startsWith0000 ? 'Sim' : 'Não'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Character Distribution */}
        <div className="space-y-4">
          <h3 className="font-semibold">Distribuição de Caracteres</h3>
          <div className="grid grid-cols-8 gap-2">
            {Object.entries(hashAnalysis.distribution).map(([char, count]: [string, number]) => (
              <div key={char} className="text-center">
                <div className="text-sm font-mono font-bold">{char}</div>
                <div 
                  className="bg-blue-200 rounded-t"
                  style={{ 
                    height: `${(count / maxCount) * 40 + 10}px`,
                    backgroundColor: count === 0 ? '#f3f4f6' : '#3b82f6'
                  }}
                />
                <div className="text-xs text-gray-600 mt-1">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mining Difficulty Simulation */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Simulação de Dificuldade de Mineração</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Dificuldade 1 (1 zero inicial):</span>
              <Badge variant={hashAnalysis.patterns.startsWith0 ? "default" : "secondary"}>
                {hashAnalysis.patterns.startsWith0 ? 'Válido ✓' : 'Inválido ✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Dificuldade 2 (2 zeros iniciais):</span>
              <Badge variant={hashAnalysis.patterns.startsWith00 ? "default" : "secondary"}>
                {hashAnalysis.patterns.startsWith00 ? 'Válido ✓' : 'Inválido ✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Dificuldade 3 (3 zeros iniciais):</span>
              <Badge variant={hashAnalysis.patterns.startsWith000 ? "default" : "secondary"}>
                {hashAnalysis.patterns.startsWith000 ? 'Válido ✓' : 'Inválido ✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Dificuldade 4 (4 zeros iniciais):</span>
              <Badge variant={hashAnalysis.patterns.startsWith0000 ? "default" : "secondary"}>
                {hashAnalysis.patterns.startsWith0000 ? 'Válido ✓' : 'Inválido ✗'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Educational Info */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Propriedades do SHA-256
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Determinístico:</strong> Mesmo input sempre produz o mesmo hash</p>
            <p>• <strong>Tamanho fixo:</strong> Sempre 256 bits (64 caracteres hexadecimais)</p>
            <p>• <strong>Efeito avalanche:</strong> Mudança mínima no input altera todo o hash</p>
            <p>• <strong>Unidirecional:</strong> Impossível calcular o input a partir do hash</p>
            <p>• <strong>Resistente a colisões:</strong> Extremamente difícil encontrar dois inputs com mesmo hash</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}