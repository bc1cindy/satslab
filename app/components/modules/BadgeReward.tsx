'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'

interface BadgeRewardProps {
  badge?: {
    name: string
    description: string
    type: 'virtual' | 'ordinal'
    moduleId: number
    imageUrl?: string
  }
  name?: string
  description?: string
  type?: 'virtual' | 'ordinal'
  moduleId?: number
  isEarned?: boolean
  onClaim?: () => void
  isLoading?: boolean
}

export function BadgeReward({ 
  badge,
  name, 
  description, 
  type, 
  moduleId, 
  isEarned = false, 
  onClaim,
  isLoading = false 
}: BadgeRewardProps) {
  // Use badge prop if provided, otherwise use individual props
  const badgeName = badge?.name || name || ''
  const badgeDescription = badge?.description || description || ''
  const badgeType = badge?.type || type || 'virtual'
  const badgeModuleId = badge?.moduleId || moduleId || 0
  return (
    <Card className={`w-full ${isEarned ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            {badgeName}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={badgeType === 'ordinal' ? 'default' : 'secondary'}>
              {badgeType === 'ordinal' ? 'Ordinal NFT' : 'Badge Virtual'}
            </Badge>
            <Badge variant="outline">Módulo {badgeModuleId}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{badgeDescription}</p>
        
        {badgeType === 'ordinal' && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">🎨 Ordinal NFT</h4>
            <p className="text-sm text-purple-800">
              Este badge será mintado como um Ordinal na rede Signet e ficará permanentemente 
              associado à sua chave pública. É um NFT único que comprova sua conquista!
            </p>
          </div>
        )}

        {isEarned ? (
          <div className="bg-green-100 p-4 rounded-lg border border-green-300">
            <div className="flex items-center gap-3">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <h4 className="font-semibold text-green-900">Badge Conquistado!</h4>
                <p className="text-sm text-green-800">
                  Parabéns! Você completou este módulo com sucesso.
                </p>
              </div>
            </div>
          </div>
        ) : onClaim ? (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-yellow-900">Pronto para resgatar!</h4>
                <p className="text-sm text-yellow-800">
                  Complete todas as tarefas para ganhar este badge.
                </p>
              </div>
              <Button 
                onClick={onClaim}
                disabled={isLoading}
                className="ml-4"
              >
                {isLoading ? 'Processando...' : 'Resgatar Badge'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-xl">🔒</span>
              <div>
                <h4 className="font-semibold text-gray-700">Badge Bloqueado</h4>
                <p className="text-sm text-gray-600">
                  Complete todas as tarefas e perguntas para desbloquear.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}