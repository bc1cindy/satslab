'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Bitcoin, Check, Clock, Zap, Shield, Users, Star, ChevronLeft, ChevronRight, Video, Lock, HeadphonesIcon } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Header } from '@/app/components/layout/Header'

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'bitcoin' | 'pix' | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { data: session, status } = useSession()

  const priceBRL = 749 // R$ 749,00 (preço fixo)
  
  const modules = [
    {
      id: 1,
      title: "Arquitetura do Sistema Bitcoin",
      description: "Entenda como o Bitcoin funciona, sua estrutura descentralizada e os princípios que garantem sua segurança e inovação."
    },
    {
      id: 2,
      title: "Blockchain e Redes de Teste",
      description: "Explore o que é a blockchain, como ela registra transações e o papel das redes de teste no desenvolvimento de aplicações Bitcoin."
    },
    {
      id: 3,
      title: "Implementações BTC e Como Rodar um Nó",
      description: "Aprenda a configurar e gerenciar um nó Bitcoin, entendendo as principais implementações do protocolo Bitcoin."
    },
    {
      id: 4,
      title: "Chaves, Endereços e Scripts",
      description: "Descubra como funcionam as chaves públicas e privadas, endereços Bitcoin e scripts que garantem transações seguras."
    },
    {
      id: 5,
      title: "Gerenciamento de Carteiras e Segurança em Auto custódia",
      description: "Domine as melhores práticas para criar, gerenciar e proteger suas carteiras Bitcoin, evitando riscos comuns."
    },
    {
      id: 6,
      title: "Mineração e Consenso",
      description: "Conheça o processo de mineração de Bitcoin, o algoritmo de consenso Proof-of-Work, sua importância para a rede e como minerar."
    },
    {
      id: 7,
      title: "Assinaturas Digitais",
      description: "Saiba como as assinaturas digitais garantem a autenticidade e integridade das transações no Bitcoin."
    },
    {
      id: 8,
      title: "Transações Avançadas, Taxas e Lightning Network",
      description: "Aprenda sobre transações avançadas, como calcular taxas e utilizar a Lightning Network para transações rápidas e baratas."
    },
    {
      id: 9,
      title: "Scripting e Contratos Inteligentes",
      description: "Explore o potencial do scripting Bitcoin e como criar contratos inteligentes para aplicações avançadas."
    },
    {
      id: 10,
      title: "Como Comprar ou Vender Bitcoin",
      description: "Entenda o processo de comprar e vender Bitcoin de forma segura, escolhendo as melhores plataformas e estratégias."
    },
    {
      id: 11,
      title: "Gerenciamento de Risco",
      description: "Aprenda a identificar e gerenciar riscos associados ao investimento e uso de Bitcoin."
    },
    {
      id: 12,
      title: "Fidúcia",
      description: "Compreenda a diferença entre precisar ou não confiar em intermediários."
    },
    {
      id: 13,
      title: "Bitcoin Open-Source e Inteligência Artificial",
      description: "Contribuindo com Bitcoin open-source com inteligência artificial para te apoiar no aprendizado."
    },
    {
      id: 14,
      title: "Como crio imagens de clones com IA?",
      description: "Aula Bônus: Como criar imagens de clones usando IA."
    }
  ]

  const modulesPerSlide = 4
  const totalSlides = Math.ceil(modules.length / modulesPerSlide)
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      nextSlide()
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide()
    }
  }

  const handleCheckout = async () => {
    if (!paymentMethod) return
    
    // Check if user is logged in for Bitcoin payment
    if (paymentMethod === 'bitcoin' && status !== 'authenticated') {
      alert('Por favor, faça login para continuar com o pagamento em Bitcoin')
      signIn('google')
      return
    }
    
    setLoading(true)
    try {
      let endpoint = ''
      
      if (paymentMethod === 'pix') {
        // Redirect to Discord for PIX payment support
        window.open('https://discord.gg/68gGQEP6P4', '_blank')
        setLoading(false)
        return
      } else if (paymentMethod === 'bitcoin') {
        // Usar a API interna do BTCPay
        endpoint = '/api/btcpay/create-invoice'
      } else {
        endpoint = `/api/payments/${paymentMethod}/create`
      }
      
      // Aplicar desconto de 3% para Bitcoin
      const finalAmount = paymentMethod === 'bitcoin' ? priceBRL * 0.97 : priceBRL
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: session?.user?.email || 'guest@satslab.org', 
          amount: finalAmount,
          originalAmount: priceBRL,
          currency: 'BRL',
          discount: paymentMethod === 'bitcoin' ? 3 : 0
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (paymentMethod === 'bitcoin' && data.checkoutUrl) {
          // Redirect to BTCPay checkout
          window.location.href = data.checkoutUrl
        } else {
          setPaymentInfo(data)
        }
      } else {
        alert(data.error || 'Erro ao processar pagamento')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Checkout error:', error)
      }
      alert('Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  if (paymentInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Pagamento Processando</CardTitle>
              <CardDescription>
                {paymentMethod === 'bitcoin' ? 'Você será redirecionado para o BTCPay' : 'Escaneie o QR Code ou copie o código PIX'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {paymentMethod === 'bitcoin' ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Endereço Bitcoin:</p>
                    <code className="text-xs break-all">{paymentInfo.address}</code>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Valor em BTC:</p>
                    <code className="text-lg font-mono">{paymentInfo.btcAmount} BTC</code>
                  </div>
                  {paymentInfo.qrCode && (
                    <img src={paymentInfo.qrCode} alt="Bitcoin QR Code" className="mx-auto" />
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentInfo.qrCode && (
                    <div className="flex justify-center">
                      <img src={paymentInfo.qrCode} alt="PIX QR Code" className="max-w-xs" />
                    </div>
                  )}
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">PIX Copia e Cola:</p>
                    <code className="text-xs break-all">{paymentInfo.pixCode}</code>
                  </div>
                  
                  {paymentInfo.isMock && (
                    <Card className="border-orange-500/30 bg-orange-500/30 backdrop-blur-sm">
                      <CardContent className="pt-6">
                        <p className="text-sm text-white mb-3">{paymentInfo.instructions}</p>
                        <Button
                          onClick={async () => {
                            const response = await fetch('/api/payments/depix/mock', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ depositId: paymentInfo.depositId })
                            })
                            const result = await response.json()
                            if (result.success) {
                              alert('✅ Acesso Pro ativado com sucesso! Você pode agora acessar as aulas.')
                              window.location.href = '/aulas'
                            } else {
                              alert('Erro ao ativar acesso: ' + result.error)
                            }
                          }}
                          className="w-full"
                          variant="outline"
                        >
                          🧪 Simular Pagamento (Teste)
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="justify-center border-t">
              <div className="flex items-center text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                <p className="text-sm">Aguardando confirmação do pagamento...</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-500/20 text-orange-500 border-orange-500/30" variant="outline">
            🎓 Garanta Seu Acesso
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bitcoin: Domine a <span className="text-orange-500">Criptomoeda do Futuro</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubra tudo sobre Bitcoin com SatsLab Pro. Dos fundamentos do sistema, ao desenvolvimento open-source com inteligência artificial para te apoiar no aprendizado. Aprenda com método prático e acessível.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Product Card */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl h-full flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent"></div>
            <CardHeader className="relative z-10 text-center pb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 mx-auto">
                <Bitcoin className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <div className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                  {paymentMethod === 'bitcoin' ? (
                    <>
                      <div className="text-2xl line-through opacity-60">R$ {priceBRL},00</div>
                      <div>R$ {(priceBRL * 0.97).toFixed(0)}<span className="text-3xl">,00</span></div>
                    </>
                  ) : (
                    <>R$ {priceBRL}<span className="text-3xl">,00</span></>
                  )}
                </div>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-1">
                  Acesso de 1 ano
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">SatsLab Pro</h1>
            </CardHeader>

            <CardContent className="relative z-10 space-y-6 flex-grow">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Benefícios incluídos:
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Video, text: "14 aulas em vídeos" },
                    { icon: Users, text: "Comunidade exclusiva no Discord" },
                    { icon: HeadphonesIcon, text: "Suporte na comunidade" },
                    { icon: Zap, text: "Acesso por 1 ano completo" },
                    { icon: Star, text: "Atualizações e novos conteúdos incluídos" },
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 text-white/90">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm md:text-base">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Card */}
          <Card className="border border-gray-800 shadow-2xl bg-gray-900 rounded-2xl h-full flex flex-col">
            <CardHeader className="pb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Finalizar Compra</h2>
              <p className="text-gray-400 text-sm md:text-base">Escolha seu método de pagamento e comece agora</p>
            </CardHeader>

            <CardContent className="space-y-6 flex-grow">
              {/* Login Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Acesso ao curso</h3>
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-700 hover:bg-gray-800 transition-all duration-200 bg-gray-800 text-white hover:border-gray-600"
                  onClick={() => signIn('google')}
                  disabled={status === 'loading'}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-red-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <span className="font-medium">
                      {status === 'loading' ? 'Carregando...' : 
                       status === 'authenticated' ? `Logado: ${session?.user?.name}` : 
                       'Continuar com Google'}
                    </span>
                  </div>
                </Button>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Método de pagamento</h3>

                {/* Bitcoin Option */}
                <div className="relative">
                  <input 
                    type="radio" 
                    id="bitcoin" 
                    name="payment" 
                    className="peer sr-only" 
                    checked={paymentMethod === 'bitcoin'}
                    onChange={() => setPaymentMethod('bitcoin')}
                  />
                  <label
                    htmlFor="bitcoin"
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-700 cursor-pointer transition-all duration-200 peer-checked:border-orange-500 peer-checked:bg-orange-500/10 hover:border-orange-400 bg-gray-800"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <Bitcoin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white flex items-center gap-2">
                        Bitcoin
                        <Badge className="bg-green-600 text-white text-xs">3% OFF</Badge>
                      </div>
                      <div className="text-sm text-gray-400">Lightning + On-chain</div>
                    </div>
                    <Zap className="w-5 h-5 text-orange-500" />
                  </label>
                </div>

                {/* PIX Option */}
                <div className="relative">
                  <input 
                    type="radio" 
                    id="pix" 
                    name="payment" 
                    className="peer sr-only"
                    checked={paymentMethod === 'pix'}
                    onChange={() => setPaymentMethod('pix')}
                  />
                  <label
                    htmlFor="pix"
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-700 cursor-pointer transition-all duration-200 peer-checked:border-orange-500 peer-checked:bg-orange-500/10 hover:border-orange-400 bg-gray-800"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                        <span className="text-green-600 font-bold text-xs">PIX</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">PIX (DePix)</div>
                      <div className="text-sm text-gray-400">Abrir ticket no Discord</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Login Warning for Bitcoin */}
              {paymentMethod === 'bitcoin' && status !== 'authenticated' && (
                <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-3">
                  <p className="text-yellow-500 text-sm text-center">
                    ⚠️ Login necessário para pagamento com Bitcoin
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <Button 
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleCheckout}
                disabled={!paymentMethod || loading}
              >
                {loading ? 'Processando...' : 
                 paymentMethod === 'bitcoin' && status !== 'authenticated' ? 'Faça Login para Continuar' :
                 'Finalizar Compra'}
              </Button>

              {/* Security Info */}
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Suporte dedicado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Modules Preview */}
        <div id="conteudo-curso" className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Conteúdo do Curso</h2>
            <p className="text-gray-400">Veja todos os módulos que você terá acesso</p>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-12">
            {/* Carousel Container */}
            <div 
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                      {modules.slice(slideIndex * modulesPerSlide, (slideIndex + 1) * modulesPerSlide).map((module) => (
                        <Card key={module.id} className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-colors">
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              <div className="text-orange-500 font-bold text-xl">{module.id}.</div>
                              <div className="flex-1">
                                <CardTitle className="text-lg leading-tight text-white">{module.title}</CardTitle>
                                <CardDescription className="text-gray-400 mt-2">
                                  {module.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 py-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Pagamento Seguro</p>
              <p className="text-xs text-gray-400">Bitcoin ou PIX (DePix)</p>
            </div>
            <div>
              <Clock className="w-8 h-8 text-slate-900 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Acesso Imediato</p>
              <p className="text-xs text-gray-400">Após confirmação</p>
            </div>
            <div>
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Comunidade Ativa</p>
              <p className="text-xs text-gray-400">Discord exclusivo</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}