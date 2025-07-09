import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/client'

// GET /api/admin/analytics - Get comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Fetch platform stats
    const { data: platformStats, error: platformError } = await supabase
      .rpc('get_platform_stats')
    
    if (platformError) {
      console.error('Platform stats error:', platformError)
      return NextResponse.json({ error: 'Failed to fetch platform stats' }, { status: 500 })
    }

    // Fetch realtime analytics
    const { data: realtimeData, error: realtimeError } = await supabase
      .from('realtime_analytics')
      .select('*')
      .limit(1)
      .single()
    
    if (realtimeError) {
      console.error('Realtime analytics error:', realtimeError)
    }

    // Fetch module analytics
    const { data: moduleData, error: moduleError } = await supabase
      .from('module_analytics')
      .select('*')
      .order('module_id')
    
    if (moduleError) {
      console.error('Module analytics error:', moduleError)
    }

    // Fetch recent activity
    const { data: activityData, error: activityError } = await supabase
      .from('user_events')
      .select('id, user_id, event_type, event_data, module_id, timestamp')
      .order('timestamp', { ascending: false })
      .limit(100)
    
    if (activityError) {
      console.error('Activity data error:', activityError)
    }

    // Fetch user growth data (last 30 days)
    const { data: growthData, error: growthError } = await supabase
      .from('user_analytics_summary')
      .select('first_seen_at')
      .gte('first_seen_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('first_seen_at')
    
    if (growthError) {
      console.error('Growth data error:', growthError)
    }

    // Process growth data by day
    const growthByDay = growthData?.reduce((acc: any, user) => {
      const date = new Date(user.first_seen_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      platformStats: platformStats?.[0] || null,
      realtimeData: realtimeData || null,
      moduleStats: moduleData || [],
      recentActivity: activityData || [],
      userGrowth: growthByDay,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/analytics/export - Export analytics data
export async function POST(request: NextRequest) {
  try {
    const { format, dateRange } = await request.json()
    const supabase = createClient()

    let startDate = new Date()
    let endDate = new Date()

    // Parse date range
    switch (dateRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }

    // Fetch detailed data for export
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .gte('session_start', startDate.toISOString())
      .lte('session_start', endDate.toISOString())
      .order('session_start', { ascending: false })

    const { data: events, error: eventsError } = await supabase
      .from('user_events')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false })

    if (sessionsError || eventsError) {
      throw new Error('Failed to fetch export data')
    }

    if (format === 'csv') {
      // Generate CSV data
      const csvData = {
        sessions: sessions || [],
        events: events || []
      }
      
      return NextResponse.json({
        data: csvData,
        filename: `satslab_analytics_${dateRange}_${Date.now()}.csv`,
        format: 'csv'
      })
    }

    // Default JSON export
    return NextResponse.json({
      data: {
        sessions: sessions || [],
        events: events || [],
        dateRange: { start: startDate.toISOString(), end: endDate.toISOString() }
      },
      filename: `satslab_analytics_${dateRange}_${Date.now()}.json`,
      format: 'json'
    })

  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}