'use client'

import { Bitcoin, Zap, ChevronRight, Play, BookOpen, MessageCircle, ChevronLeft } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/app/components/ui/card'
import { useState } from 'react'

interface SatsLabEmbedProps {
  baseUrl?: string // URL base para redirecionamentos (ex: https://satslabpro.com)
  showFullContent?: boolean // Mostrar conteúdo completo ou resumido
}

export function SatsLabEmbed({ 
  baseUrl = '', 
  showFullContent = true 
}: SatsLabEmbedProps) {
  const checkoutUrl = baseUrl ? `${baseUrl}/checkout` : '/checkout'
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const courseModules = [
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
    }
  ]

  const modulesPerSlide = 4
  const totalSlides = Math.ceil(courseModules.length / modulesPerSlide)
  
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

  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Bitcoin: Domine a <span className="text-orange-500">Criptomoeda do Futuro</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Descubra o sistema Bitcoin de forma profunda com o SatsLab Pro, projetado para iniciantes, 
              avançados e entusiastas que desejam entender a tecnologia, segurança e oportunidades do BTC.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a href={checkoutUrl} target={baseUrl ? "_blank" : "_self"} rel="noopener noreferrer">
                <Button size="lg" className="text-lg px-8 py-6 bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20">
                  Começar Agora - R$ 749,00
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href={`${baseUrl}/login`} target={baseUrl ? "_blank" : "_self"} rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                  Login
                </Button>
              </a>
            </div>

          </div>
        </div>
      </section>

      {showFullContent && (
        <>
          {/* O que Você Vai Aprender */}
          <section className="py-16 bg-gray-900/50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">O que Você Vai Aprender?</h2>
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
                          {courseModules.slice(slideIndex * modulesPerSlide, (slideIndex + 1) * modulesPerSlide).map((module) => (
                            <Card key={module.id} className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-colors">
                              <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                  <div className="text-orange-500 font-bold text-xl">{module.id}.</div>
                                  <div className="flex-1">
                                    <CardTitle className="text-lg leading-tight text-white">{module.title}</CardTitle>
                                    <p className="text-sm text-gray-400 mt-2">{module.description}</p>
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

              <div className="text-center mt-12">
                <a href={checkoutUrl} target={baseUrl ? "_blank" : "_self"} rel="noopener noreferrer">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                    <Play className="w-5 h-5 mr-2" />
                    Começar Agora - R$ 749,00
                  </Button>
                </a>
                <p className="text-gray-400 text-sm mt-4">Pix (DePix) ou BTC</p>
              </div>
            </div>
          </section>

          {/* Por que Escolher o SatsLab Pro? */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Por que Escolher o SatsLab Pro?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                <div className="text-center">
                  <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bitcoin className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Conteúdo abrangente</h3>
                  <p className="text-gray-400">Dos fundamentos da blockchain à integração com inteligência artificial.</p>
                </div>

                <div className="text-center">
                  <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Prático e acessível</h3>
                  <p className="text-gray-400">Ideal para iniciantes e avançados, com foco em aplicação prática.</p>
                </div>

                <div className="text-center">
                  <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Atualizado e relevante</h3>
                  <p className="text-gray-400">Inclui tópicos como Lightning Network, segurança e gestão de riscos.</p>
                </div>

                <div className="text-center">
                  <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Comunidade Ativa</h3>
                  <p className="text-gray-400">Discord exclusivo</p>
                </div>
              </div>

            </div>
          </section>

          {/* Call to Action Final */}
          <section className="py-16 bg-gradient-to-r from-orange-500/20 to-yellow-500/20">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-white mb-4">Descubra a Soberania Individual</h2>
                <p className="text-xl text-gray-300 mb-8">
                  Aprenda como Bitcoin oferece liberdade financeira real, controle total sobre seus ativos e oportunidades
                </p>
                <a href={checkoutUrl} target={baseUrl ? "_blank" : "_self"} rel="noopener noreferrer">
                  <Button size="lg" className="text-xl px-12 py-6 bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25">
                    Começar Agora - R$ 749,00
                    <ChevronRight className="ml-2 h-6 w-6" />
                  </Button>
                </a>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}