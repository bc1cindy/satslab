'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/app/hooks/useAnalytics'
import { usePathname } from 'next/navigation'

interface AnalyticsWrapperProps {
  children: React.ReactNode
}

export default function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  const { trackPageView } = useAnalytics()
  const pathname = usePathname()

  useEffect(() => {
    // Track page view for all users
    if (typeof window !== 'undefined') {
      trackPageView(pathname)
    }
  }, [pathname, trackPageView])

  return <>{children}</>
}

export { AnalyticsWrapper }