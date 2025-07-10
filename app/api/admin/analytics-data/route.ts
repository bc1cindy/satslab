import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function GET(request: Request) {
  try {
    console.log('Analytics API called at:', new Date().toISOString())
    
    // Force no-cache headers
    const headers = new Headers({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    })
    
    const supabase = createServerClient()
    
    // Get module analytics data correctly
    const moduleAnalytics = []
    
    for (let moduleId = 1; moduleId <= 7; moduleId++) {
      // Get unique users who started this module - ALL TIME (historical analysis)
      const { data: moduleStartUsers, error: startUsersError } = await supabase
        .from('user_events')
        .select('user_id')
        .eq('module_id', moduleId)
        .eq('event_type', 'module_start')
        .like('user_id', 'session_%')
      
      // Get module completions - ALL TIME (historical analysis)
      const { data: completions, error: completionsError } = await supabase
        .from('user_events')
        .select('user_id')
        .eq('module_id', moduleId)
        .eq('event_type', 'module_complete')
        .like('user_id', 'session_%')
      
      // Get all starts for counting - ALL TIME
      const { data: starts, error: startsError } = await supabase
        .from('user_events')
        .select('*')
        .eq('module_id', moduleId)
        .eq('event_type', 'module_start')
        .like('user_id', 'session_%')
      
      // Get task completions - ALL TIME
      const { data: tasks, error: tasksError } = await supabase
        .from('user_events')
        .select('*')
        .eq('module_id', moduleId)
        .eq('event_type', 'task_complete')
        .like('user_id', 'session_%')
      
      // Get badges earned - ALL TIME
      const { data: badges, error: badgesError } = await supabase
        .from('user_events')
        .select('*')
        .eq('module_id', moduleId)
        .eq('event_type', 'badge_earned')
        .like('user_id', 'session_%')
      
      if (startUsersError || completionsError || startsError || tasksError || badgesError) {
        console.error('Error fetching module data:', {
          startUsersError,
          completionsError,
          startsError,
          tasksError,
          badgesError
        })
      }
      
      // Count unique users who started vs completed
      const uniqueStarterIds = new Set(moduleStartUsers?.map(u => u.user_id) || [])
      const uniqueCompleterIds = new Set(completions?.map(u => u.user_id) || [])
      
      // For total unique users, count anyone who either started OR completed
      const allUniqueUsers = new Set<string>()
      uniqueStarterIds.forEach(id => allUniqueUsers.add(id))
      uniqueCompleterIds.forEach(id => allUniqueUsers.add(id))
      
      const uniqueCompleters = uniqueCompleterIds.size
      const startCount = starts?.length || 0
      const taskCount = tasks?.length || 0
      const badgeCount = badges?.length || 0
      
      // Calculate completion rate: unique completers / total unique users * 100
      // This handles cases where someone completed without a recorded start
      const completionRate = allUniqueUsers.size > 0 
        ? (uniqueCompleters / allUniqueUsers.size) * 100 
        : 0
      
      const moduleData = {
        module_id: moduleId,
        unique_users: allUniqueUsers.size, // Total unique users (started OR completed)
        module_starts: startCount,
        module_completions: uniqueCompleters,
        task_completions: taskCount,
        badges_earned: badgeCount,
        completion_rate: Math.round(completionRate * 10) / 10 // Round to 1 decimal
      }
      
      // Log Module 6 data for debugging
      if (moduleId === 6) {
        console.log('Module 6 data:', moduleData)
      }
      
      moduleAnalytics.push(moduleData)
    }
    
    // Get platform stats
    console.log('Fetching sessions from database...')
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .like('user_id', 'session_%')
    
    console.log(`Database returned ${sessions?.length || 0} sessions`)
    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
    }
    
    const { data: walletEvents, error: walletError } = await supabase
      .from('user_events')
      .select('*')
      .eq('event_type', 'wallet_created')
      .like('user_id', 'session_%')
    
    const { data: moduleCompleteEvents, error: moduleError } = await supabase
      .from('user_events')
      .select('*')
      .eq('event_type', 'module_complete')
    
    const { data: badgeEvents, error: badgeError } = await supabase
      .from('user_events')
      .select('*')
      .eq('event_type', 'badge_earned')
    
    if (sessionsError || walletError || moduleError || badgeError) {
      console.error('Error fetching platform stats:', {
        sessionsError,
        walletError,
        moduleError,
        badgeError
      })
    }
    
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const totalUsers = new Set(sessions?.map(s => s.user_id) || []).size
    const activeUsers24h = new Set(
      sessions?.filter(s => new Date(s.created_at) >= oneDayAgo)
        .map(s => s.user_id) || []
    ).size
    const activeUsers7d = new Set(
      sessions?.filter(s => new Date(s.created_at) >= sevenDaysAgo)
        .map(s => s.user_id) || []
    ).size
    
    const totalSessions = sessions?.length || 0
    console.log(`Total sessions found: ${totalSessions} at ${new Date().toISOString()}`)
    
    // Calculate average session duration only for sessions with valid duration
    const sessionsWithDuration = sessions?.filter(s => 
      s.total_duration_seconds && s.total_duration_seconds > 0
    ) || []
    
    const avgSessionDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + s.total_duration_seconds, 0) / sessionsWithDuration.length
      : 0
    
    // Log for debugging
    console.log('Session duration calculation:', {
      totalSessions: sessions?.length || 0,
      sessionsWithDuration: sessionsWithDuration.length,
      avgDurationSeconds: Math.round(avgSessionDuration),
      avgDurationMinutes: Math.round(avgSessionDuration / 60)
    })
    
    const activeSessions = sessions?.filter(s => !s.session_end)?.length || 0
    
    // Get geolocation stats and normalize country names
    const { data: geoData, error: geoError } = await supabase
      .from('user_sessions')
      .select('geolocation')
      .neq('geolocation', null)
      .like('user_id', 'session_%')
    
    let geolocationStats: Array<{country: string, count: number, percentage: number}> = []
    if (!geoError && geoData) {
      const countryStats = new Map<string, number>()
      const total = geoData.length
      
      geoData.forEach(session => {
        if (session.geolocation?.country) {
          let country = session.geolocation.country
          // Normalize country names - fix Brazil/Brasil duplicates
          if (country === 'Brazil') country = 'Brasil'
          countryStats.set(country, (countryStats.get(country) || 0) + 1)
        }
      })
      
      geolocationStats = Array.from(countryStats.entries())
        .map(([country, count]) => ({
          country,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 countries
    }
    
    // Log wallet events for debugging
    console.log('Wallet events:', {
      total: walletEvents?.length || 0,
      sessionUsers: walletEvents?.filter(e => e.user_id.startsWith('session_')).length || 0
    })
    
    const response = NextResponse.json({
      success: true,
      moduleAnalytics,
      geolocationStats,
      platformStats: {
        total_users: totalUsers,
        active_users_24h: activeUsers24h,
        active_users_7d: activeUsers7d,
        total_sessions: totalSessions,
        active_sessions: activeSessions,
        avg_session_duration: Math.round(avgSessionDuration),
        total_modules_completed: moduleCompleteEvents?.length || 0,
        total_badges_earned: badgeEvents?.length || 0,
        total_wallets_created: walletEvents?.length || 0
      }
    })

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Analytics data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}