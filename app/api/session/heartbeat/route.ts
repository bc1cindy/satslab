import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, duration } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    // Update session duration periodically
    const { error } = await supabase
      .from('user_sessions')
      .update({
        total_duration_seconds: Math.floor(duration / 1000),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
    
    if (error) {
      console.error('Failed to update session duration:', error)
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session heartbeat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}