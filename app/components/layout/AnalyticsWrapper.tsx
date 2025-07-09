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
    // Track page view for all users (authenticated or not)
    if (typeof window !== 'undefined') {
      trackPageView(pathname)
    }
  }, [pathname, trackPageView])

  return <>{children}</>
}