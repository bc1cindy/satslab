import { Bitcoin, BookOpen, Trophy, Users, Zap, CheckCircle, ChevronRight, Brain } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import Link from 'next/link'

export function SatsLabProSection() {
  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Bitcoin: Domine a <span className="text-orange-500">Criptomoeda do Futuro</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubra o sistema Bitcoin de forma profunda com o SatsLab Pro, projetado para iniciantes, 
              avançados e entusiastas que desejam entender tecnologia, segurança e oportunidades do BTC.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">14 Aulas Exclusivas</h4>
                  <p className="text-gray-300">
                    Curso completo sobre Bitcoin e Lightning Network com conteúdo prático e teórico
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Trophy className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Conteúdo Aprofundado</h4>
                  <p className="text-gray-300">
                    Desde conceitos básicos até tópicos avançados como Lightning Network e tecnologias emergentes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Comunidade Discord</h4>
                  <p className="text-gray-300">
                    Acesso à nossa comunidade no Discord para trocar ideias e tirar dúvidas
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Bitcoin Open-Source e Inteligência Artificial</h4>
                  <p className="text-gray-300">
                    Contribua com Bitcoin open-source com inteligência artificial para te apoiar no aprendizado
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Acesso Anual</h4>
                  <p className="text-gray-300">
                    Acesso completo por 1 ano a todo o conteúdo, incluindo futuras atualizações
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Pricing Card */}
            <div className="lg:pl-8">
              <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/30 border-2">
                <CardHeader className="text-center pb-4">
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-block mb-4">
                    🔥 OFERTA LIMITADA
                  </div>
                  <CardTitle className="text-3xl font-bold text-white mb-2">SatsLab PRO</CardTitle>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-4xl font-bold text-orange-500">R$ 749,00</span>
                    <div className="text-left">
                      <div className="text-sm text-gray-300">pagamento único</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-300">Acesso de 1 ano a todos os conteúdos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-300">14 aulas exclusivas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-300">Conteúdo sobre o sistema Bitcoin</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-300">Acesso à comunidade Discord</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-300">Suporte para tirar dúvidas</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3" asChild>
                      <Link href="/checkout">
                        Garantir Acesso PRO
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <p className="text-center text-sm text-gray-400">💳 Pagamento via Bitcoin ou PIX (DePix)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}