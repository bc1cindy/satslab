'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/app/hooks/useAnalytics'
import { useAuth, getUserIdentifier } from '@/app/components/auth/AuthProvider'
import { usePathname } from 'next/navigation'

interface AnalyticsWrapperProps {
  children: React.ReactNode
}

export default function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  const { session } = useAuth()
  const { trackPageView } = useAnalytics()
  const pathname = usePathname()

  useEffect(() => {
    const userIdentifier = getUserIdentifier(session)
    if (!userIdentifier) return

    // Track page view whenever pathname changes
    if (typeof window !== 'undefined') {
      trackPageView(pathname)
    }
  }, [session, pathname, trackPageView])

  return <>{children}</>
}