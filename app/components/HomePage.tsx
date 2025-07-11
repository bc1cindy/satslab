'use client'

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
import { 
  BookOpen, Shield, Send, Pickaxe, Zap, Layers, Users, 
  ChevronRight, Bitcoin, Trophy,
  Target, Gamepad2, Award, Youtube
} from 'lucide-react'

export default function HomePage() {
  const { t, language } = useLanguage()
  const isEnglish = language === 'en'
  
  
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
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link href={`${moduleBasePath}1`}>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                  {t('homepage.hero.startCourse')}
                </Button>
              </Link>
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
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {isEnglish ? 'Course Modules' : 'Módulos do Curso'}
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
      <section className="text-center bg-gradient-to-b from-orange-900/20 to-orange-950/20 py-16">
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
          <section className="mb-16">
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
      <section className="text-center bg-gradient-to-b from-orange-900/20 to-orange-950/20 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {isEnglish ? 'Buy Bitcoin KYC-Free' : 'Compre Bitcoin sem KYC'}
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            {isEnglish 
              ? 'Support SatsLab by using our affiliate links to buy Bitcoin without KYC requirements'
              : 'Apoie o SatsLab usando nossos links de afiliado para comprar Bitcoin sem exigências de KYC'
            }
          </p>
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
                  {isEnglish ? '20% discount on fee' : '20% de desconto na taxa'}
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
                  {isEnglish ? '15% discount on fee - code: Cindy' : '15% de desconto na taxa - cupom: Cindy'}
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
            <h2 className="text-2xl font-bold mb-4 text-white">
              {isEnglish ? 'Meet SatsLab Creator' : 'Conheça a Criadora do SatsLab'}
            </h2>
            <p className="text-gray-300 mb-6">
              {isEnglish 
                ? 'SatsLab was built by Cindy'
                : 'O SatsLab foi construído por Cindy'
              }
            </p>
            <div className="mb-8">
              <a 
                href="https://www.youtube.com/@CindyBTC" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                <span className="font-bold text-white text-lg">
                  {isEnglish ? 'Subscribe to my channel' : 'Inscreva-se no meu canal'}
                </span>
              </a>
            </div>
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