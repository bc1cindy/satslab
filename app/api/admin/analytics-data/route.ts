import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Get module analytics data correctly
    const moduleAnalytics = []
    
    for (let moduleId = 1; moduleId <= 7; moduleId++) {
      // Get unique users who interacted with this module
      const { data: uniqueUsers, error: uniqueUsersError } = await supabase
        .from('user_events')
        .select('user_id')
        .eq('module_id', moduleId)
        .like('user_id', 'session_%')
      
      // Get module completions
      const { data: completions, error: completionsError } = await supabase
        .from('user_events')
        .select('*')
        .eq('module_id', moduleId)
        .eq('event_type', 'module_complete')
        .like('user_id', 'session_%')
      
      // Get module starts
      const { data: starts, error: startsError } = await supabase
        .from('user_events')
        .select('*')
        .eq('module_id', moduleId)
        .eq('event_type', 'module_start')
        .like('user_id', 'session_%')
      
      // Get task completions
      const { data: tasks, error: tasksError } = await supabase
        .from('user_events')
        .select('*')
        .eq('module_id', moduleId)
        .eq('event_type', 'task_complete')
        .like('user_id', 'session_%')
      
      // Get badges earned
      const { data: badges, error: badgesError } = await supabase
        .from('user_events')
        .select('*')
        .eq('module_id', moduleId)
        .eq('event_type', 'badge_earned')
        .like('user_id', 'session_%')
      
      if (uniqueUsersError || completionsError || startsError || tasksError || badgesError) {
        console.error('Error fetching module data:', {
          uniqueUsersError,
          completionsError,
          startsError,
          tasksError,
          badgesError
        })
      }
      
      const uniqueUserCount = new Set(uniqueUsers?.map(u => u.user_id) || []).size
      const completionCount = completions?.length || 0
      const startCount = starts?.length || 0
      const taskCount = tasks?.length || 0
      const badgeCount = badges?.length || 0
      
      // Calculate completion rate correctly: completions / unique users * 100
      const completionRate = uniqueUserCount > 0 
        ? (completionCount / uniqueUserCount) * 100 
        : 0
      
      moduleAnalytics.push({
        module_id: moduleId,
        unique_users: uniqueUserCount,
        module_starts: startCount,
        module_completions: completionCount,
        task_completions: taskCount,
        badges_earned: badgeCount,
        completion_rate: Math.round(completionRate * 10) / 10 // Round to 1 decimal
      })
    }
    
    // Get platform stats
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .like('user_id', 'session_%')
    
    const { data: walletEvents, error: walletError } = await supabase
      .from('user_events')
      .select('*')
      .eq('event_type', 'wallet_created')
    
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
    const avgSessionDuration = sessions?.length > 0
      ? sessions.reduce((sum, s) => sum + (s.total_duration_seconds || 0), 0) / sessions.length
      : 0
    
    const activeSessions = sessions?.filter(s => !s.session_end)?.length || 0
    
    return NextResponse.json({
      success: true,
      moduleAnalytics,
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
  } catch (error) {
    console.error('Analytics data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}