import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { useTranslation } from '@/app/components/i18n/TranslationProvider'

interface ModuleHeaderProps {
  moduleId: number
  title: string
  description: string
  objectives: string[]
  requiresLogin: boolean
  progress?: number
  isAuthenticated?: boolean
}

export function ModuleHeader({ 
  moduleId, 
  title, 
  description, 
  objectives, 
  requiresLogin, 
  progress = 0,
  isAuthenticated = false 
}: ModuleHeaderProps) {
  const { t } = useTranslation()
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <Badge variant="outline">{t('badge.module')} {moduleId}</Badge>
            {requiresLogin && (
              <Badge variant={isAuthenticated ? "success" : "warning"}>
                {isAuthenticated ? `🔓 ${t('module.loggedIn')}` : `🔒 ${t('module.loginRequired')}`}
              </Badge>
            )}
          </div>
          <p className="text-gray-600 text-lg">{description}</p>
        </div>
      </div>

      {isAuthenticated && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{t('module.progress')}</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <h3 className="font-semibold text-orange-900 mb-2">🎯 Objetivos de Aprendizado:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
          {objectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}