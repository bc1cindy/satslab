'use client'

import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { ArrowLeft, Construction } from 'lucide-react'
import { LanguageSelector } from '@/app/components/i18n/LanguageSelector'

export default function ComingSoon({ moduleId }: { moduleId: number }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/en" className="flex items-center gap-2 text-gray-300 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Modules</span>
            </Link>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto border-gray-800 bg-gray-900/50">
          <CardHeader className="text-center">
            <Construction className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-3xl text-white">Module {moduleId} - Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-6">
              The English version of Module {moduleId} is currently being translated. 
              Please check back soon or switch to Portuguese to access the content now.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/en">
                <Button variant="outline">
                  Back to Modules
                </Button>
              </Link>
              <Link href={`/modules/${moduleId}`}>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  View in Portuguese
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}