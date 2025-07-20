'use client'

import { useState } from 'react'
import { Bitcoin, Smartphone, Check, Clock, Zap, Shield, Users, Award, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'

interface CheckoutEmbedProps {
  baseUrl?: string // URL base para redirecionamentos
  showFullContent?: boolean // Mostrar conteúdo completo ou resumido
}

export function CheckoutEmbed({ 
  baseUrl = '', 
  showFullContent = true 
}: CheckoutEmbedProps) {
  const [paymentMethod, setPaymentMethod] = useState<'bitcoin' | 'pix' | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const priceBRL = 749

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
      description: "Como criar imagens de clones usando IA."
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
    
    setLoading(true)
    try {
      let endpoint = ''
      
      if (paymentMethod === 'pix') {
        endpoint = `${baseUrl}/api/payments/depix/mock`
      } else if (paymentMethod === 'bitcoin') {
        endpoint = `${baseUrl}/api/payments/btcpay/create`
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'google-user@temp.com', amount: priceBRL })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (paymentMethod === 'bitcoin' && data.checkoutUrl) {
          window.open(data.checkoutUrl, '_blank')
        } else {
          setPaymentInfo(data)
        }
      } else {
        alert(data.error || 'Erro ao processar pagamento')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    if (baseUrl) {
      window.open(`${baseUrl}/auth/google`, '_blank')
    } else {
      alert('Login com Google em breve!')
    }
  }

  if (paymentInfo) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-white">Pagamento Processando</CardTitle>
              <CardDescription className="text-gray-400">
                {paymentMethod === 'bitcoin' ? 'Você será redirecionado para o BTCPay' : 'Escaneie o QR Code ou copie o código PIX'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {paymentMethod === 'bitcoin' ? (
                <div className="space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Endereço Bitcoin:</p>
                    <code className="text-xs break-all text-white">{paymentInfo.address}</code>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Valor em BTC:</p>
                    <code className="text-lg font-mono text-white">{paymentInfo.btcAmount} BTC</code>
                  </div>
                  {paymentInfo.qrCode && (
                    <div className="flex justify-center">
                      <img src={paymentInfo.qrCode} alt="Bitcoin QR Code" className="max-w-xs" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentInfo.qrCode && (
                    <div className="flex justify-center">
                      <img src={paymentInfo.qrCode} alt="PIX QR Code" className="max-w-xs" />
                    </div>
                  )}
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">PIX Copia e Cola:</p>
                    <code className="text-xs break-all text-white">{paymentInfo.pixCode}</code>
                  </div>
                  
                  {paymentInfo.isMock && (
                    <Card className="border-blue-500/50 bg-blue-500/10">
                      <CardContent className="pt-6">
                        <p className="text-sm text-blue-300 mb-3">{paymentInfo.instructions}</p>
                        <Button
                          onClick={async () => {
                            alert('✅ Acesso Pro ativado com sucesso!')
                            if (baseUrl) {
                              window.open(`${baseUrl}/pro`, '_blank')
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
            
            <CardFooter className="justify-center border-t border-gray-800">
              <div className="flex items-center text-gray-400">
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
    <div className="min-h-screen bg-black text-white">
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
              Descubra tudo sobre Bitcoin com nosso curso completo. Dos fundamentos da blockchain 
              à integração com inteligência artificial, aprenda com método prático e acessível.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pricing Card */}
            <Card className="border-orange-500/20 bg-gray-900">
              <CardHeader className="text-center">
                <div className="mb-4">
                  <div className="text-5xl font-bold text-orange-500 mb-2">R$ {priceBRL},00</div>
                  <Badge variant="secondary" className="text-sm">
                    Acesso de 1 ano
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-white">SatsLab Pro</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="border-t border-gray-800 pt-6">
                    <h3 className="font-semibold text-white mb-6 flex items-center text-lg">
                      <Award className="w-6 h-6 mr-3 text-orange-500" />
                      Benefícios incluídos:
                    </h3>
                    <ul className="space-y-4 text-base">
                      <li className="flex items-start">
                        <Star className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">14 aulas em vídeos</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">Comunidade exclusiva no Discord</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">Suporte na comunidade</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">Acesso por 1 ano completo</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">Atualizações e novos conteúdos incluídos</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Form */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Finalizar Compra</CardTitle>
                <CardDescription className="text-gray-400">
                  Escolha seu método de pagamento e comece agora
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Google Login */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">
                    Acesso ao curso
                  </label>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 justify-start border-gray-700 hover:bg-gray-800"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-white">Continuar com Google</span>
                  </Button>
                </div>
                
                {/* Payment Methods */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">
                    Método de pagamento
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant={paymentMethod === 'bitcoin' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('bitcoin')}
                      className="h-auto p-4 justify-start border-gray-700 hover:bg-gray-800"
                    >
                      <div className="flex items-center space-x-3">
                        <Bitcoin className="w-6 h-6 text-orange-500" />
                        <div className="text-left">
                          <p className="font-medium text-white">Bitcoin</p>
                          <p className="text-xs opacity-70 text-gray-400">Lightning + On-chain</p>
                        </div>
                        <Zap className="w-4 h-4 ml-auto text-orange-500" />
                      </div>
                    </Button>
                    
                    <Button
                      variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('pix')}
                      className="h-auto p-4 justify-start border-gray-700 hover:bg-gray-800"
                    >
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-6 h-6 text-orange-500" />
                        <div className="text-left">
                          <p className="font-medium text-white">PIX (DePix)</p>
                          <p className="text-xs opacity-70 text-gray-400">Instantâneo</p>
                        </div>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Teste
                        </Badge>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex-col space-y-4">
                <Button
                  onClick={handleCheckout}
                  disabled={!paymentMethod || loading}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="lg"
                >
                  {loading ? 'Processando...' : 'Finalizar Compra'}
                </Button>
                
                <div className="text-center text-xs py-2 px-4 rounded-lg" style={{ backgroundColor: '#f97316', color: 'white' }}>
                  🔒 Pagamento seguro • 💬 Suporte dedicado
                </div>
              </CardFooter>
            </Card>
          </div>

          {showFullContent && (
            <>
              {/* Course Modules Preview */}
              <div className="mt-16">
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
                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}