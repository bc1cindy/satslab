'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Zap, Bitcoin, Heart } from 'lucide-react'

interface DonationButtonProps {
  storeId: string
  className?: string
}

export default function DonationButton({ storeId, className = '' }: DonationButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'lightning' | 'onchain'>('lightning')

  const presetAmounts = [1000, 5000, 10000, 50000, 100000]

  const createInvoice = async () => {
    if (!amount || parseInt(amount) <= 0) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/btcpay/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          amount: parseInt(amount),
          currency: 'SATS',
          paymentMethod
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar invoice')
      }

      const data = await response.json()
      // Abrir BTCPay diretamente
      window.open(data.checkoutUrl, '_blank')
      // Fechar modal
      setIsOpen(false)
      setAmount('')
      setError(null)
    } catch (error) {
      console.error('Erro ao criar invoice:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const formatSats = (sats: number) => {
    return new Intl.NumberFormat('pt-BR').format(sats)
  }

  if (!isOpen) {
    return (
      <div className={`text-center ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
        >
          <Heart className="h-5 w-5" />
          Apoiar SatsLab
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-800">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
          <Bitcoin className="h-6 w-6 text-orange-500" />
          Doar Sats
        </CardTitle>
        <CardDescription className="text-gray-400">
          Apoie o desenvolvimento do SatsLab
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            <Button
              variant={paymentMethod === 'lightning' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('lightning')}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Lightning
            </Button>
            <Button
              variant={paymentMethod === 'onchain' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('onchain')}
              className="flex items-center gap-2"
            >
              <Bitcoin className="h-4 w-4" />
              On-chain
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">
              Quantidade (sats)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Digite a quantidade de sats"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Valores sugeridos</Label>
            <div className="flex flex-wrap gap-2">
              {presetAmounts.map((preset) => (
                <Badge
                  key={preset}
                  variant="outline"
                  className="cursor-pointer hover:bg-orange-500 hover:text-white border-orange-500 text-orange-500"
                  onClick={() => setAmount(preset.toString())}
                >
                  {formatSats(preset)} sats
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={createInvoice}
            disabled={!amount || loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {loading ? 'Abrindo BTCPay...' : 'Doar Agora'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}