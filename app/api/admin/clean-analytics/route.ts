import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createServerClient()
    
    // Clean problematic data while preserving recent valid data
    const now = new Date()
    const cutoffDate = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
    
    // 1. Delete duplicate events (same user, same event, same module, within 1 minute)
    const { data: duplicateEvents } = await supabase
      .from('user_events')
      .select('*')
      .like('user_id', 'session_%')
      .order('timestamp', { ascending: false })
    
    // 2. Delete events from before module_start tracking was implemented
    const { error: oldEventsError } = await supabase
      .from('user_events')
      .delete()
      .like('user_id', 'session_%')
      .lt('timestamp', cutoffDate.toISOString())
    
    // 3. Keep only events from last 2 hours (fresh data)
    const { data: recentEvents } = await supabase
      .from('user_events')
      .select('*')
      .like('user_id', 'session_%')
      .gte('timestamp', cutoffDate.toISOString())
    
    return NextResponse.json({
      success: true,
      message: 'Analytics data cleaned',
      summary: {
        cutoffTime: cutoffDate.toISOString(),
        recentEventsKept: recentEvents?.length || 0,
        oldEventsRemoved: oldEventsError ? 0 : 'removed'
      },
      note: 'Kept only fresh data from last 2 hours. This provides clean baseline.',
      errors: {
        oldEvents: oldEventsError?.message
      }
    })
  } catch (error) {
    console.error('Clean error:', error)
    return NextResponse.json(
      { error: 'Failed to clean analytics data' },
      { status: 500 }
    )
  }
}