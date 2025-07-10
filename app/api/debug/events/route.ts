import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Get recent module_start events for module 2
    const { data: recentStarts, error: startsError } = await supabase
      .from('user_events')
      .select('*')
      .eq('module_id', 2)
      .eq('event_type', 'module_start')
      .order('timestamp', { ascending: false })
      .limit(10)
    
    // Get all module_start events for module 2
    const { data: allStarts, error: allStartsError } = await supabase
      .from('user_events')
      .select('user_id')
      .eq('module_id', 2)
      .eq('event_type', 'module_start')
    
    // Get with session filter
    const { data: sessionStarts, error: sessionStartsError } = await supabase
      .from('user_events')
      .select('user_id')
      .eq('module_id', 2)
      .eq('event_type', 'module_start')
      .like('user_id', 'session_%')
    
    return NextResponse.json({
      recentStarts: recentStarts || [],
      allStartsCount: allStarts?.length || 0,
      sessionStartsCount: sessionStarts?.length || 0,
      errors: {
        startsError: startsError?.message,
        allStartsError: allStartsError?.message,
        sessionStartsError: sessionStartsError?.message
      }
    })
  } catch (error) {
    console.error('Debug events error:', error)
    return NextResponse.json(
      { error: 'Failed to debug events' },
      { status: 500 }
    )
  }
}