import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/app/lib/supabase/analytics-service'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Handle session end event sent via sendBeacon
    if (data.event_type === 'session_end' && data.session_id) {
      // Extract userId from session_id (format: session_timestamp_random)
      // For cookie-based sessions, the session_id IS the user_id
      const userId = data.session_id
      
      // Call endSession to update duration
      await analyticsService.endSession(data.session_id, userId)
      
      // Also track the session_end event with duration
      if (data.duration) {
        await analyticsService.trackEvent(
          userId,
          'session_end',
          { 
            session_id: data.session_id,
            duration_seconds: Math.floor(data.duration / 1000)
          }
        )
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    )
  }
}