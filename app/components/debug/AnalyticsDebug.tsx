'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { useAuth, getUserIdentifier } from '@/app/components/auth/AuthProvider'
import { useAnalytics } from '@/app/hooks/useAnalytics'
import { analyticsService } from '@/app/lib/supabase/analytics-service'

export default function AnalyticsDebug() {
  const { session } = useAuth()
  const { trackEvent } = useAnalytics()
  const [realtimeData, setRealtimeData] = useState<any>(null)
  const [userAnalytics, setUserAnalytics] = useState<any>(null)

  const fetchAnalytics = async () => {
    try {
      const userIdentifier = getUserIdentifier(session)
      const [realtime, userStats] = await Promise.all([
        analyticsService.getRealtimeAnalytics(),
        userIdentifier ? analyticsService.getUserAnalytics(userIdentifier) : null
      ])
      
      setRealtimeData(realtime)
      setUserAnalytics(userStats)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [session])

  const testEvents = [
    { type: 'page_view', label: 'Page View' },
    { type: 'module_start', label: 'Module Start', moduleId: 1 },
    { type: 'task_complete', label: 'Task Complete', moduleId: 1 },
    { type: 'badge_earned', label: 'Badge Earned', moduleId: 1 },
    { type: 'wallet_created', label: 'Wallet Created' }
  ]

  const handleTestEvent = async (eventType: any, moduleId?: number) => {
    await trackEvent(eventType, { test: true, timestamp: new Date().toISOString() }, moduleId)
    setTimeout(fetchAnalytics, 1000) // Refresh after 1 second
  }

  const userIdentifier = getUserIdentifier(session)
  if (!userIdentifier) {
    return (
      <Card className="bg-red-500/10 border-red-500/20">
        <CardContent className="p-4">
          <p className="text-red-400">Login necessário para testar analytics</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-green-400">🧪 Analytics Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">User ID: {userIdentifier}</p>
            <Button onClick={fetchAnalytics} size="sm" variant="outline">
              Refresh Analytics
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {testEvents.map((event, index) => (
              <Button
                key={index}
                onClick={() => handleTestEvent(event.type, event.moduleId)}
                size="sm"
                variant="outline"
              >
                Test {event.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Realtime Analytics */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-blue-400">📊 Realtime Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {realtimeData ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Users:</span>
                  <Badge variant="outline">{realtimeData.active_users || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Active:</span>
                  <Badge variant="outline">{realtimeData.daily_active_users || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weekly Active:</span>
                  <Badge variant="outline">{realtimeData.weekly_active_users || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Session:</span>
                  <Badge variant="outline">{Math.round(realtimeData.avg_session_duration || 0)}s</Badge>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No realtime data available</p>
            )}
          </CardContent>
        </Card>

        {/* User Analytics */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-purple-400">👤 Your Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {userAnalytics ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Time:</span>
                  <Badge variant="outline">{userAnalytics.total_time_spent_seconds || 0}s</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sessions:</span>
                  <Badge variant="outline">{userAnalytics.total_sessions || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Modules:</span>
                  <Badge variant="outline">{userAnalytics.modules_completed || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tasks:</span>
                  <Badge variant="outline">{userAnalytics.tasks_completed || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Badges:</span>
                  <Badge variant="outline">{userAnalytics.badges_earned || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wallets:</span>
                  <Badge variant="outline">{userAnalytics.wallets_created || 0}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No user analytics yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}