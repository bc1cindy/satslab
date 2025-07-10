import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createServerClient()
    
    // WARNING: This will delete ALL analytics data
    // Only use if you want a fresh start
    
    // 1. Delete all user_events with session_ user_ids (keep any real user data)
    const { error: eventsError } = await supabase
      .from('user_events')
      .delete()
      .like('user_id', 'session_%')
    
    // 2. Delete all user_sessions with session_ user_ids
    const { error: sessionsError } = await supabase
      .from('user_sessions')
      .delete()
      .like('user_id', 'session_%')
    
    // 3. Delete analytics summary for session users
    const { error: summaryError } = await supabase
      .from('user_analytics_summary')
      .delete()
      .like('user_id', 'session_%')
    
    return NextResponse.json({
      success: true,
      message: 'Analytics data reset completed',
      note: 'All session-based analytics data has been cleared. Fresh tracking will begin now.',
      errors: {
        events: eventsError?.message,
        sessions: sessionsError?.message,
        summary: summaryError?.message
      }
    })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset analytics data' },
      { status: 500 }
    )
  }
}