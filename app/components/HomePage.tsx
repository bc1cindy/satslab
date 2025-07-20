'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import DonationButton from '@/app/components/donation/DonationButton'
import { LanguageSelector } from '@/app/components/i18n/LanguageSelector'
import { useLanguage } from '@/app/components/i18n/LanguageProvider'
import { RealVideoPlayer } from '@/app/components/RealVideoPlayer'
import YouTubeVideos from '@/app/components/YouTubeVideos'
import { SatsLabProSection } from '@/app/components/pro/SatsLabProSection'
import { 
  BookOpen, Shield, Send, Pickaxe, Zap, Layers, Users, 
  ChevronRight, Bitcoin, Trophy, ChevronLeft, Play,
  Target, Gamepad2, Award, LogIn, LogOut, Crown
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

export default function HomePage() {
  const { t, language } = useLanguage()
  const isEnglish = language === 'en'
  const { data: session, status } = useSession()
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  
  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  // Course modules data
  const courseModules = [
    {
      id: 1,
      title: isEnglish ? "Bitcoin System Architecture" : "Arquitetura do Sistema Bitcoin",
      description: isEnglish 
        ? "Understand how Bitcoin works, its decentralized structure and the principles that ensure its security and innovation."
        : "Entenda como o Bitcoin funciona, sua estrutura descentralizada e os princípios que garantem sua segurança e inovação."
    },
    {
      id: 2,
      title: isEnglish ? "Blockchain and Test Networks" : "Blockchain e Redes de Teste",
      description: isEnglish
        ? "Explore what blockchain is, how it records transactions and the role of test networks in Bitcoin application development."
        : "Explore o que é a blockchain, como ela registra transações e o papel das redes de teste no desenvolvimento de aplicações Bitcoin."
    },
    {
      id: 3,
      title: isEnglish ? "BTC Implementations and Running a Node" : "Implementações BTC e Como Rodar um Nó",
      description: isEnglish
        ? "Learn to configure and manage a Bitcoin node, understanding the main implementations of the Bitcoin protocol."
        : "Aprenda a configurar e gerenciar um nó Bitcoin, entendendo as principais implementações do protocolo Bitcoin."
    },
    {
      id: 4,
      title: isEnglish ? "Keys, Addresses and Scripts" : "Chaves, Endereços e Scripts",
      description: isEnglish
        ? "Discover how public and private keys, Bitcoin addresses and scripts that ensure secure transactions work."
        : "Descubra como funcionam as chaves públicas e privadas, endereços Bitcoin e scripts que garantem transações seguras."
    },
    {
      id: 5,
      title: isEnglish ? "Wallet Management and Self-Custody Security" : "Gerenciamento de Carteiras e Segurança em Auto Custódia",
      description: isEnglish
        ? "Master best practices for creating, managing and protecting your Bitcoin wallets, avoiding common risks."
        : "Domine as melhores práticas para criar, gerenciar e proteger suas carteiras Bitcoin, evitando riscos comuns."
    },
    {
      id: 6,
      title: isEnglish ? "Mining and Consensus" : "Mineração e Consenso",
      description: isEnglish
        ? "Learn about the Bitcoin mining process, the Proof-of-Work consensus algorithm, its importance to the network and how to mine."
        : "Conheça o processo de mineração de Bitcoin, o algoritmo de consenso Proof-of-Work, sua importância para a rede e como minerar."
    },
    {
      id: 7,
      title: isEnglish ? "Digital Signatures" : "Assinaturas Digitais",
      description: isEnglish
        ? "Learn how digital signatures ensure the authenticity and integrity of Bitcoin transactions."
        : "Saiba como as assinaturas digitais garantem a autenticidade e integridade das transações no Bitcoin."
    },
    {
      id: 8,
      title: isEnglish ? "Advanced Transactions, Fees and Lightning Network" : "Transações Avançadas, Taxas e Lightning Network",
      description: isEnglish
        ? "Learn about advanced transactions, how to calculate fees and use the Lightning Network for fast and cheap transactions."
        : "Aprenda sobre transações avançadas, como calcular taxas e utilizar a Lightning Network para transações rápidas e baratas."
    },
    {
      id: 9,
      title: isEnglish ? "Scripting and Smart Contracts" : "Scripting e Contratos Inteligentes",
      description: isEnglish
        ? "Explore the potential of Bitcoin scripting and how to create smart contracts for advanced applications."
        : "Explore o potencial do scripting Bitcoin e como criar contratos inteligentes para aplicações avançadas."
    },
    {
      id: 10,
      title: isEnglish ? "How to Buy or Sell Bitcoin" : "Como Comprar ou Vender Bitcoin",
      description: isEnglish
        ? "Understand the process of buying and selling Bitcoin safely, choosing the best platforms and strategies."
        : "Entenda o processo de comprar e vender Bitcoin de forma segura, escolhendo as melhores plataformas e estratégias."
    },
    {
      id: 11,
      title: isEnglish ? "Risk Management" : "Gerenciamento de Risco",
      description: isEnglish
        ? "Learn to identify and manage risks associated with Bitcoin investment and use."
        : "Aprenda a identificar e gerenciar riscos associados ao investimento e uso de Bitcoin."
    },
    {
      id: 12,
      title: isEnglish ? "Trust and Fiduciary" : "Fiducia",
      description: isEnglish
        ? "Understand the difference between needing or not trusting intermediaries. The fundamental Bitcoin principle: Don't Trust, Verify."
        : "Compreenda a diferença entre precisar ou não confiar em intermediários. O princípio fundamental do Bitcoin: Don't Trust, Verify."
    },
    {
      id: 13,
      title: isEnglish ? "Bitcoin Open-Source and Artificial Intelligence" : "Bitcoin Open-Source e Inteligência Artificial",
      description: isEnglish
        ? "Contributing to Bitcoin open-source with artificial intelligence to support your learning. Explore the frontiers of innovation."
        : "Contribuindo com Bitcoin open-source com inteligência artificial para te apoiar no aprendizado. Explore as fronteiras da inovação."
    },
    {
      id: 14,
      title: isEnglish ? "How do I create clone images with AI?" : "Como crio imagens de clones com IA?",
      description: isEnglish
        ? "How to create clone images using AI. Learn to use modern artificial intelligence tools to generate realistic images."
        : "Como criar imagens de clones usando IA. Aprenda a usar ferramentas modernas de inteligência artificial para gerar imagens realistas."
    }
  ]

  // Carousel configuration
  const modulesPerSlide = 4
  const totalSlides = Math.ceil(courseModules.length / modulesPerSlide)
  
  // Carousel navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }
  
  // Touch handlers
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
  
  
  // Module data with translations
  const modules = [
    {
      id: 1,
      title: t('homepage.modules.1.title'),
      description: t('homepage.modules.1.description'),
      icon: BookOpen,
      difficulty: isEnglish ? "Beginner" : "Iniciante",
      badge: t('badges.badgeNames.1'),
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: t('homepage.modules.2.title'),
      description: t('homepage.modules.2.description'),
      icon: Shield,
      difficulty: isEnglish ? "Beginner" : "Iniciante",
      badge: t('badges.badgeNames.2'),
      color: "bg-green-500"
    },
    {
      id: 3,
      title: t('homepage.modules.3.title'),
      description: t('homepage.modules.3.description'),
      icon: Send,
      difficulty: isEnglish ? "Intermediate" : "Intermediário",
      badge: t('badges.badgeNames.3'),
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: t('homepage.modules.4.title'),
      description: t('homepage.modules.4.description'),
      icon: Pickaxe,
      difficulty: isEnglish ? "Intermediate" : "Intermediário",
      badge: t('badges.badgeNames.4'),
      color: "bg-orange-500"
    },
    {
      id: 5,
      title: t('homepage.modules.5.title'),
      description: t('homepage.modules.5.description'),
      icon: Zap,
      difficulty: isEnglish ? "Intermediate" : "Intermediário",
      badge: t('badges.badgeNames.5'),
      color: "bg-yellow-500"
    },
    {
      id: 6,
      title: t('homepage.modules.6.title'),
      description: t('homepage.modules.6.description'),
      icon: Layers,
      difficulty: isEnglish ? "Advanced" : "Avançado",
      badge: t('badges.badgeNames.6'),
      color: "bg-indigo-500"
    },
    {
      id: 7,
      title: t('homepage.modules.7.title'),
      description: t('homepage.modules.7.description'),
      icon: Users,
      difficulty: isEnglish ? "Advanced" : "Avançado",
      badge: t('badges.badgeNames.7'),
      color: "bg-red-500"
    }
  ]
  
  const moduleBasePath = isEnglish ? '/en/modules/' : '/modules/'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bitcoin className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-white">SatsLab</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <LanguageSelector />
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:text-orange-500 text-xs md:text-sm"
                onClick={() => document.getElementById('modulos-gratuitos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {isEnglish ? 'Free Modules' : 'Módulos Gratuitos'}
              </Button>
              {!isEnglish && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white hover:text-orange-500 text-xs md:text-sm"
                  onClick={() => document.getElementById('bitcoin-4-all')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Bitcoin 4 All
                </Button>
              )}
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:text-orange-500 text-xs md:text-sm"
                onClick={() => document.getElementById('comprar-vender-btc')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {isEnglish ? 'Buy/Sell BTC' : 'Comprar/Vender BTC'}
              </Button>
              {status === 'authenticated' && (
                <Link href="/pro">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white text-xs md:text-sm"
                  >
                    <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Pro
                  </Button>
                </Link>
              )}
              
              {status === 'authenticated' ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs md:text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  {isEnglish ? 'Logout' : 'Sair'}
                </Button>
              ) : (
                <Link href="/auth">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-xs md:text-sm"
                  >
                    <LogIn className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Login
                  </Button>
                </Link>
              )}
              <Button 
                size="sm" 
                className="bg-orange-500 hover:bg-orange-600 text-xs md:text-sm"
                onClick={() => document.getElementById(isEnglish ? 'modulos-gratuitos' : 'satslab-pro')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('homepage.hero.startCourse')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('homepage.hero.title')}
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('homepage.hero.description')}
          </p>

          <Link href={`${moduleBasePath}1`}>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-4">
              {t('homepage.hero.startJourney')}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Modules Grid */}
        <section id="modulos-gratuitos" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {isEnglish ? 'SatsLab Free Modules' : 'Módulos Gratuitos SatsLab'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Link key={module.id} href={`${moduleBasePath}${module.id}`}>
                <Card className="border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-all h-full cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`${module.color} p-3 rounded-lg`}>
                        <module.icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className="border-gray-700">
                        {module.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-white group-hover:text-orange-400 transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {isEnglish ? 'Badge' : 'Badge'}:
                        </span>
                        <span className="text-orange-400 flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {module.badge}
                        </span>
                      </div>
                      <Progress value={0} className="h-2 bg-gray-800" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Donation Section - Full Width */}
      <section className={`text-center py-16 ${isEnglish ? 'bg-black' : 'bg-gradient-to-b from-orange-900/20 to-orange-950/20'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              {isEnglish ? 'Support SatsLab' : 'Apoie o SatsLab'}
            </h2>
            <p className="text-gray-400 mb-8">
              {isEnglish 
                ? 'Help keep SatsLab running and contribute to the development of more educational content about Bitcoin'
                : 'Ajude a manter o SatsLab funcionando e contribua para o desenvolvimento de mais conteúdo educacional sobre Bitcoin'
              }
            </p>
          </div>
          <DonationButton storeId="ChfbUhF85cr8ngfnkLAMMHHkfidTa8y2fsSrrnqwjCPN" />
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Portuguese Video Lessons Section */}
        {!isEnglish && (
          <section id="bitcoin-4-all" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Bitcoin 4 All Classes
              </h2>
            </div>
            
            <RealVideoPlayer />
          </section>
        )}
      </main>

      {/* Partners Section - Full Width */}
      <section id="comprar-vender-btc" className="text-center bg-gradient-to-b from-orange-900/20 to-orange-950/20 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {isEnglish ? 'Buy Bitcoin KYC-Free' : 'Compre Bitcoin sem KYC'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <a 
              href="https://spiketospike.com/?referral=CINDY" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 hover:scale-105 transition-transform"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white shadow-lg">
                <Image 
                  src="/images/partners/SpiketoSpike.jpg"
                  alt="Spike to Spike Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-lg">Spike to Spike</div>
                <div className="text-sm text-orange-400 font-semibold">
                  {isEnglish ? '20% discount on fee with this link' : (
                    <>
                      20% de desconto na taxa<br className="sm:hidden" />
                      <span className="hidden sm:inline"> </span>com esse link
                    </>
                  )}
                </div>
              </div>
            </a>
            
            <a 
              href="https://mooze.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 hover:scale-105 transition-transform"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white shadow-lg">
                <Image 
                  src="/images/partners/Mooze.jpg"
                  alt="Mooze Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-lg">Mooze</div>
                <div className="text-sm text-orange-400 font-semibold">
                  {isEnglish ? '15% discount on fee with code: Cindy' : (
                    <>
                      15% de desconto na taxa<br className="sm:hidden" />
                      <span className="hidden sm:inline"> </span>com o cupom: Cindy
                    </>
                  )}
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* YouTube Creator Section */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-gray-400 text-center mb-8 text-sm">
              {isEnglish 
                ? 'Created by Cindy'
                : 'Criado por Cindy'
              }
            </p>
          </div>
          
          {/* YouTube Videos Grid */}
          <YouTubeVideos />
          
          {/* Social Media Links */}
          <div className="mt-12 flex justify-center gap-6">
            <a 
              href="https://x.com/bc1cindy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-all transform hover:scale-110"
              aria-label="X (Twitter)"
            >
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.instagram.com/cindyvicentino" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-all transform hover:scale-110"
              aria-label="Instagram"
            >
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.tiktok.com/@cindyvicentino" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-all transform hover:scale-110"
              aria-label="TikTok"
            >
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
            
            <a 
              href="https://github.com/bc1cindy/satslab" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-all transform hover:scale-110"
              aria-label="GitHub"
            >
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            
            <a 
              href="https://discord.gg/68gGQEP6P4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-all transform hover:scale-110"
              aria-label="Discord"
            >
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
              </svg>
            </a>
          </div>
          
          {/* YouTube Subscribe Button - Smaller and Discrete */}
          <div className="mt-6 flex justify-center">
            <a 
              href="https://www.youtube.com/@CindyBTC" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-all text-sm"
            >
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              <span className="text-white font-medium">
                {isEnglish ? 'Subscribe' : 'Inscrever-se'}
              </span>
            </a>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
      </main>

      {/* Features Section - Full Width */}
      <section className="bg-gradient-to-b from-orange-900/20 to-orange-950/20 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('homepage.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('homepage.features.practical.title')}
              </h3>
              <p className="text-gray-400">
                {t('homepage.features.practical.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('homepage.features.badges.title')}
              </h3>
              <p className="text-gray-400">
                {t('homepage.features.badges.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('homepage.features.gradual.title')}
              </h3>
              <p className="text-gray-400">
                {t('homepage.features.gradual.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SatsLab Pro Section - Only for Portuguese */}
      {!isEnglish && (
        <div id="satslab-pro">
          <SatsLabProSection />
        </div>
      )}

      {/* Course Content Section - Only for Portuguese */}
      {!isEnglish && (
        <section id="conteudo-curso" className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              {isEnglish ? 'Course Content' : 'Conteúdo do Curso'}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {isEnglish 
                ? 'See all modules you will have access to'
                : 'Veja todos os módulos que você terá acesso'
              }
            </p>
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
            <a href="/checkout" className="inline-block">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                <Play className="w-5 h-5 mr-2" />
                {isEnglish ? 'Get Access Now - $249' : 'Garantir Acesso Agora - R$ 749,00'}
              </Button>
            </a>
            <p className="text-gray-400 text-sm mt-4">
              {isEnglish ? 'Bitcoin or PIX payment' : 'Pagamento via Bitcoin ou PIX (DePix)'}
            </p>
          </div>
        </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Bitcoin className="h-8 w-8 text-orange-500 mr-3" />
            <h3 className="text-2xl font-bold">SatsLab</h3>
          </div>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            {isEnglish 
              ? 'A project to democratize Bitcoin education through hands-on experience and structured modules.'
              : 'Um projeto para democratizar a educação sobre Bitcoin através de experiência prática e módulos estruturados.'
            }
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <span>© 2024 SatsLab</span>
            <span>•</span>
            <span>
              {isEnglish ? 'Built with' : 'Construído com'} ⚡ Lightning
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}