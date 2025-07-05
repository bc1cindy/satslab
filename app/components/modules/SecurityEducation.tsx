'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { 
  Shield, 
  Key, 
  Eye, 
  AlertTriangle, 
  Lock, 
  UserCheck, 
  CheckCircle, 
  XCircle,
  Info
} from 'lucide-react'

interface SecurityEducationProps {
  showLoginComparison?: boolean
  showBestPractices?: boolean
  showThreatModel?: boolean
}

/**
 * Componente educacional sobre segurança Bitcoin
 * Inclui comparações com sistema de login e boas práticas
 */
export default function SecurityEducation({ 
  showLoginComparison = true,
  showBestPractices = true,
  showThreatModel = false
}: SecurityEducationProps) {
  return (
    <div className="space-y-6">
      {/* Comparação com Sistema de Login */}
      {showLoginComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Como Funciona o Login no SatsLab
            </CardTitle>
            <CardDescription>
              Entenda como sua chave privada de login funciona
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">Sistema Tradicional</h4>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Email + senha</li>
                  <li>• Dados no servidor</li>
                  <li>• Pode ser resetado</li>
                  <li>• Empresa controla acesso</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium">Sistema Bitcoin</h4>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Chave privada única</li>
                  <li>• Você controla tudo</li>
                  <li>• Não pode ser resetado</li>
                  <li>• Sem dependência de terceiros</li>
                </ul>
              </div>
            </div>
            
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Sua chave privada de login funciona como uma "impressão digital digital" - 
                ela prova que você é você, sem precisar confiar em nenhuma empresa.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Alertas de Segurança */}
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Críticos de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  NUNCA compartilhe sua chave privada ou seed phrase
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Qualquer pessoa com acesso pode roubar todos os seus bitcoins
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  NUNCA digite em sites suspeitos
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Sites falsos podem capturar suas informações
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  NUNCA tire fotos ou screenshots
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Imagens podem vazar ou ser hackeadas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boas Práticas */}
      {showBestPractices && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Boas Práticas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  Armazenamento Seguro
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Anote em papel com caneta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Guarde em cofre ou local seguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Faça múltiplas cópias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Proteja de fogo e água</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  Verificação e Controle
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Teste o backup regularmente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Use carteiras confiáveis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Verifique endereços com cuidado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Comece com pequenas quantias</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analogias Educativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Analogias para Entender
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                Chave Privada
              </Badge>
              <p className="text-sm text-muted-foreground">
                Como a <strong>chave do seu cofre</strong> - quem tiver essa chave pode abrir e pegar tudo que está dentro.
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                Endereço Público
              </Badge>
              <p className="text-sm text-muted-foreground">
                Como o <strong>número da sua conta bancária</strong> - você pode compartilhar para receber dinheiro.
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                Seed Phrase
              </Badge>
              <p className="text-sm text-muted-foreground">
                Como a <strong>chave-mestra do prédio</strong> - uma única chave que abre todas as portas (endereços).
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                Blockchain
              </Badge>
              <p className="text-sm text-muted-foreground">
                Como um <strong>livro de registros público</strong> - todos podem ver, mas ninguém pode alterar o passado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modelo de Ameaças (Opcional) */}
      {showThreatModel && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Principais Ameaças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">
                    Phishing e Sites Falsos
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Sempre verifique URLs e use bookmarks para sites importantes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">
                    Malware e Keyloggers
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Mantenha sistema atualizado e use antivírus confiável
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">
                    Engenharia Social
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Ninguém legítimo pedirá suas chaves privadas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}