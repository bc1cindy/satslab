import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // 1. Get all user_events for detailed analysis
    const { data: allEvents, error: eventsError } = await supabase
      .from('user_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)
    
    // 2. Get user_sessions for analysis
    const { data: allSessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    // 3. Analyze events by type and module
    const eventsByType = {}
    const eventsByModule = {}
    const userIds = new Set()
    
    allEvents?.forEach(event => {
      // Count by event type
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1
      
      // Count by module
      if (event.module_id) {
        if (!eventsByModule[event.module_id]) {
          eventsByModule[event.module_id] = {}
        }
        eventsByModule[event.module_id][event.event_type] = 
          (eventsByModule[event.module_id][event.event_type] || 0) + 1
      }
      
      // Collect user IDs
      userIds.add(event.user_id)
    })
    
    // 4. Check for suspicious patterns
    const suspiciousPatterns = []
    
    // Check for too many events from same user
    const userEventCounts = {}
    allEvents?.forEach(event => {
      userEventCounts[event.user_id] = (userEventCounts[event.user_id] || 0) + 1
    })
    
    Object.entries(userEventCounts).forEach(([userId, count]) => {
      if (count > 20) {
        suspiciousPatterns.push(`User ${userId.slice(0,10)}... has ${count} events (suspicious)`)
      }
    })
    
    // 5. Check session vs user count consistency
    const sessionUserIds = new Set(allSessions?.map(s => s.user_id) || [])
    const eventUserIds = new Set(allEvents?.map(e => e.user_id) || [])
    
    // 6. Recent events analysis (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const recentEvents = allEvents?.filter(e => e.timestamp >= oneHourAgo) || []
    
    return NextResponse.json({
      summary: {
        totalEvents: allEvents?.length || 0,
        totalSessions: allSessions?.length || 0,
        uniqueUserIdsInEvents: eventUserIds.size,
        uniqueUserIdsInSessions: sessionUserIds.size,
        recentEventsLastHour: recentEvents.length
      },
      eventsByType,
      eventsByModule,
      suspiciousPatterns,
      recentEvents: recentEvents.slice(0, 10),
      sampleEvents: allEvents?.slice(0, 10) || [],
      sampleSessions: allSessions?.slice(0, 5) || [],
      analysis: {
        hasModuleStartEvents: !!eventsByType['module_start'],
        hasModuleCompleteEvents: !!eventsByType['module_complete'],
        moduleStartCount: eventsByType['module_start'] || 0,
        moduleCompleteCount: eventsByType['module_complete'] || 0,
        walletCreatedCount: eventsByType['wallet_created'] || 0
      }
    })
  } catch (error) {
    console.error('Audit error:', error)
    return NextResponse.json(
      { error: 'Failed to audit data' },
      { status: 500 }
    )
  }
}