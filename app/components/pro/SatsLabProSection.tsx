import { Bitcoin, BookOpen, Trophy, Users, Zap, CheckCircle, ChevronRight, Brain } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

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
              Aprenda tudo sobre Bitcoin com o SatsLab Pro, ideal para iniciantes, 
              avançados e entusiastas que buscam dominar a tecnologia, segurança e oportunidades do BTC.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center lg:items-start">
            {/* Mobile - SatsLab Pro Logo (appears first on mobile) */}
            <div className="lg:hidden flex justify-center items-center order-first">
              <div className="relative w-64 h-64">
                <Image
                  src="/images/SatsLabProLogo/SatsLabProLogo.png"
                  alt="SatsLab Pro"
                  fill
                  className="object-contain filter drop-shadow-lg"
                />
              </div>
            </div>
            {/* Left side - Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-4 rounded-lg">
                  <BookOpen className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">14 Aulas Exclusivas</h4>
                  <p className="text-sm text-gray-300">
                    Curso completo com teoria e prática sobre Bitcoin e Lightning Network.
                  </p>
                </div>
              </div>


              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-4 rounded-lg">
                  <Trophy className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Conteúdo Aprofundado</h4>
                  <p className="text-sm text-gray-300">
                    Dos fundamentos aos tópicos avançados, incluindo Lightning Network e tecnologias emergentes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-4 rounded-lg">
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Comunidade no Discord</h4>
                  <p className="text-sm text-gray-300">
                    Participe, troque ideias e tire dúvidas com outros entusiastas.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-4 rounded-lg">
                  <Brain className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Bitcoin Open-Source e IA</h4>
                  <p className="text-sm text-gray-300">
                    Contribua com projetos open-source e aprenda com suporte de inteligência artificial.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-4 rounded-lg">
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Acesso Anual</h4>
                  <p className="text-sm text-gray-300">
                    1 ano de acesso total, incluindo atualizações futuras.
                  </p>
                </div>
              </div>
            </div>

            {/* Center - SatsLab Pro Logo (desktop only) */}
            <div className="hidden lg:flex justify-center items-center lg:items-start lg:pt-8">
              <div className="relative w-96 h-96 md:w-[432px] md:h-[432px] lg:w-[480px] lg:h-[480px]">
                <Image
                  src="/images/SatsLabProLogo/SatsLabProLogo.png"
                  alt="SatsLab Pro"
                  fill
                  className="object-contain filter drop-shadow-lg"
                />
              </div>
            </div>

            {/* Right side - Pricing Card */}
            <div>
              <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/30 border-2">
                <CardHeader className="text-center pb-4">
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-block mb-4">
                    SatsLab Pro - Oferta Limitada
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-4xl font-bold text-orange-500">R$ 749,00</span>
                    <div className="text-left">
                      <div className="text-sm text-gray-300">(pagamento único)</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-300">14 aulas exclusivas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-300">Entenda o sistema Bitcoin</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-300">Comunidade Discord e suporte</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3" asChild>
                      <Link href="/checkout">
                        Garantir Acesso PRO
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <p className="text-center text-sm text-gray-400">Pagamento via Bitcoin ou PIX (DePix)</p>
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