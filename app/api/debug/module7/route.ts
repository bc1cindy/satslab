import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Get all module 7 events
    const { data: allModule7Events, error } = await supabase
      .from('user_events')
      .select('*')
      .eq('module_id', 7)
      .order('timestamp', { ascending: false })
    
    // Get module 7 starts
    const { data: starts } = await supabase
      .from('user_events')
      .select('*')
      .eq('module_id', 7)
      .eq('event_type', 'module_start')
    
    // Get module 7 completions
    const { data: completions } = await supabase
      .from('user_events')
      .select('*')
      .eq('module_id', 7)
      .eq('event_type', 'module_complete')
    
    return NextResponse.json({
      allEvents: allModule7Events || [],
      starts: starts || [],
      completions: completions || [],
      totalEvents: allModule7Events?.length || 0,
      startsCount: starts?.length || 0,
      completionsCount: completions?.length || 0
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}