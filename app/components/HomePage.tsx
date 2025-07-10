'use client'

import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import DonationButton from '@/app/components/donation/DonationButton'
import { LanguageSelector } from '@/app/components/i18n/LanguageSelector'
import { useLanguage } from '@/app/components/i18n/LanguageProvider'
import { RealVideoPlayer } from '@/app/components/RealVideoPlayer'
import { 
  BookOpen, Shield, Send, Pickaxe, Zap, Layers, Users, 
  ChevronRight, Bitcoin, Trophy,
  Target, Gamepad2, Award
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

        {/* Donation Section */}
        <section className="mb-16 mt-16 text-center border-t border-gray-800 pt-16">
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
        </section>

        {/* Features Section */}
        <section className="mb-16">
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
        </section>
      </main>

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