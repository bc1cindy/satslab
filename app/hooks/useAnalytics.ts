import { useEffect, useRef } from 'react'
import { useSession } from '@/app/lib/session/session-provider'
import { analyticsService, EventType } from '@/app/lib/supabase/analytics-service'

export function useAnalytics() {
  const { sessionId: cookieSessionId, isLoading } = useSession()
  const sessionIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const lastActivityRef = useRef<number>(Date.now())

  useEffect(() => {
    // Wait for session to be initialized
    if (isLoading || !cookieSessionId) return
    
    const userId = cookieSessionId // Use cookie session ID as user identifier
    let sessionId: string | null = null

    // Get client IP for geolocation
    const getClientIP = async (): Promise<string> => {
      try {
        const response = await fetch('/api/client-ip')
        if (response.ok) {
          const data = await response.json()
          return data.ip || '127.0.0.1'
        }
      } catch (error) {
        console.error('Failed to get client IP:', error)
      }
      return '127.0.0.1'
    }

    // Start session
    const startSession = async () => {
      try {
        const ipAddress = await getClientIP()
        sessionId = await analyticsService.startSession(userId, ipAddress)
        sessionIdRef.current = sessionId
        startTimeRef.current = Date.now()
        lastActivityRef.current = Date.now()
      } catch (error) {
        console.error('Failed to start analytics session:', error)
      }
    }

    // End session
    const endSession = async () => {
      if (sessionId) {
        try {
          await analyticsService.endSession(sessionId, userId)
          sessionIdRef.current = null
        } catch (error) {
          console.error('Failed to end analytics session:', error)
        }
      }
    }

    // Track page activity
    const trackActivity = () => {
      lastActivityRef.current = Date.now()
    }

    // Track visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized
        if (sessionId) {
          analyticsService.trackEvent(userId, 'page_view', { 
            action: 'blur',
            page: window.location.pathname,
            duration: Date.now() - lastActivityRef.current
          })
        }
      } else {
        // User came back
        lastActivityRef.current = Date.now()
        if (sessionId) {
          analyticsService.trackEvent(userId, 'page_view', { 
            action: 'focus',
            page: window.location.pathname
          })
        }
      }
    }

    // Track beforeunload
    const handleBeforeUnload = () => {
      if (sessionId) {
        // Use sendBeacon for reliable tracking on page unload
        const eventData = {
          event_type: 'session_end',
          session_id: sessionId,
          duration: Date.now() - startTimeRef.current
        }
        
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' })
          navigator.sendBeacon('/api/analytics', blob)
        } else {
          // Fallback: try to call endSession synchronously
          endSession()
        }
      }
    }

    // Setup event listeners
    const setupListeners = () => {
      document.addEventListener('click', trackActivity)
      document.addEventListener('keydown', trackActivity)
      document.addEventListener('scroll', trackActivity)
      document.addEventListener('mousemove', trackActivity)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    // Cleanup function
    const cleanup = () => {
      document.removeEventListener('click', trackActivity)
      document.removeEventListener('keydown', trackActivity)
      document.removeEventListener('scroll', trackActivity)
      document.removeEventListener('mousemove', trackActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }

    // Heartbeat to update session duration every 30 seconds
    const startHeartbeat = () => {
      return setInterval(() => {
        if (sessionId) {
          const currentDuration = Date.now() - startTimeRef.current
          fetch('/api/session/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sessionId,
              duration: currentDuration
            })
          }).catch(error => {
            console.error('Heartbeat failed:', error)
          })
        }
      }, 30000) // Every 30 seconds
    }

    // Initialize
    startSession()
    setupListeners()
    const heartbeatInterval = startHeartbeat()

    // Cleanup on unmount
    return () => {
      cleanup()
      clearInterval(heartbeatInterval)
      endSession()
    }
  }, [cookieSessionId, isLoading])

  // Helper functions for tracking specific events
  const trackEvent = async (eventType: EventType, eventData?: any, moduleId?: number) => {
    if (!cookieSessionId) return

    try {
      await analyticsService.trackEvent(
        cookieSessionId,
        eventType,
        eventData,
        moduleId
      )
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  const trackPageView = async (page: string) => {
    if (!cookieSessionId) return

    try {
      await analyticsService.trackEvent(
        cookieSessionId,
        'page_view',
        { page, timestamp: new Date().toISOString() }
      )
      
      if (sessionIdRef.current) {
        await analyticsService.updatePageVisited(sessionIdRef.current, page)
      }
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }

  const trackModuleStart = async (moduleId: number) => {
    await trackEvent('module_start', { moduleId }, moduleId)
  }

  const trackModuleComplete = async (moduleId: number, score: number, timeSpent: number) => {
    await trackEvent('module_complete', { 
      moduleId, 
      score, 
      timeSpent,
      completedAt: new Date().toISOString()
    }, moduleId)
  }

  const trackTaskComplete = async (moduleId: number, taskId: number, attempts: number) => {
    await trackEvent('task_complete', { 
      moduleId, 
      taskId, 
      attempts,
      completedAt: new Date().toISOString()
    }, moduleId)
  }

  const trackQuestionAnswer = async (
    moduleId: number, 
    questionId: number, 
    correct: boolean, 
    timeSpent: number
  ) => {
    await trackEvent('question_answer', { 
      moduleId, 
      questionId, 
      correct, 
      timeSpent,
      answeredAt: new Date().toISOString()
    }, moduleId)
  }

  const trackBadgeEarned = async (moduleId: number, badgeName: string, badgeType: string) => {
    await trackEvent('badge_earned', { 
      moduleId, 
      badgeName, 
      badgeType,
      earnedAt: new Date().toISOString()
    }, moduleId)
  }

  const trackWalletCreated = async (walletType: string, network: string) => {
    await trackEvent('wallet_created', { 
      walletType, 
      network,
      createdAt: new Date().toISOString()
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackModuleStart,
    trackModuleComplete,
    trackTaskComplete,
    trackQuestionAnswer,
    trackBadgeEarned,
    trackWalletCreated,
    getCurrentSessionId: () => sessionIdRef.current
  }
}

// Hook para usar analytics em componentes específicos
export function usePageAnalytics(page: string) {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView(page)
  }, [page, trackPageView])
}

// Hook para tracking de módulos
export function useModuleAnalytics(moduleId: number) {
  const { trackModuleStart } = useAnalytics()
  const hasTracked = useRef(false)

  useEffect(() => {
    // Only track once per module load
    if (!hasTracked.current) {
      const track = async () => {
        try {
          await trackModuleStart(moduleId)
          hasTracked.current = true
        } catch (error) {
          console.error('Failed to track module start:', error)
          // Still mark as tracked to prevent infinite retries
          hasTracked.current = true
        }
      }
      track()
    }
  }, [moduleId]) // Remove trackModuleStart from dependencies to avoid re-tracking

  return useAnalytics()
}