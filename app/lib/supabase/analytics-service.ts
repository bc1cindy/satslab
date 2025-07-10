import { createClient } from './client'
import { Database } from './types'

const supabase = createClient()

export type EventType = Database['public']['Enums']['event_type']

export interface UserSession {
  id?: string
  user_id: string
  session_start?: string
  session_end?: string | null
  ip_address?: string | null
  user_agent?: string | null
  device_info?: any
  total_duration_seconds?: number
  pages_visited?: string[]
  geolocation?: {
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
    timezone?: string
  } | null
}

export interface UserEvent {
  user_id: string
  session_id?: string | null
  event_type: EventType
  event_data?: any
  module_id?: number | null
}

export interface AnalyticsSummary {
  user_id: string
  total_time_spent_seconds: number
  last_active_at: string
  total_sessions: number
  modules_completed: number
  tasks_completed: number
  badges_earned: number
  wallets_created: number
  first_seen_at: string
}

class AnalyticsService {
  private currentSessionId: string | null = null

  // **SESSION MANAGEMENT**
  async startSession(userId: string, ipAddress?: string): Promise<string | null> {
    try {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null
      const deviceInfo = this.getDeviceInfo()
      const geolocation = await this.getGeolocation(ipAddress)

      const sessionData: UserSession = {
        user_id: userId,
        session_start: new Date().toISOString(),
        ip_address: ipAddress || null,
        user_agent: userAgent,
        device_info: deviceInfo,
        geolocation: geolocation,
        total_duration_seconds: 0,
        pages_visited: []
      }

      const { data, error } = await supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) throw error

      this.currentSessionId = data.id
      
      // Track session start event
      await this.trackEvent(userId, 'session_start', { session_id: data.id })
      
      return data.id
    } catch (error) {
      console.error('Error starting session:', error)
      return null
    }
  }

  async endSession(sessionId: string, userId: string): Promise<void> {
    try {
      // Calculate session duration
      const { data: sessionData } = await supabase
        .from('user_sessions')
        .select('session_start')
        .eq('id', sessionId)
        .single()

      if (sessionData) {
        const startTime = new Date(sessionData.session_start).getTime()
        const endTime = new Date().getTime()
        const durationSeconds = Math.floor((endTime - startTime) / 1000)

        await supabase
          .from('user_sessions')
          .update({
            session_end: new Date().toISOString(),
            total_duration_seconds: durationSeconds
          })
          .eq('id', sessionId)

        // Track session end event
        await this.trackEvent(userId, 'session_end', { 
          session_id: sessionId,
          duration_seconds: durationSeconds 
        })

        // Update analytics summary
        await this.updateAnalyticsSummary(userId, {
          total_time_spent_seconds: durationSeconds,
          last_active_at: new Date().toISOString(),
          total_sessions: 1
        })
      }

      if (this.currentSessionId === sessionId) {
        this.currentSessionId = null
      }
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  async updatePageVisited(sessionId: string, page: string): Promise<void> {
    try {
      const { data: session } = await supabase
        .from('user_sessions')
        .select('pages_visited')
        .eq('id', sessionId)
        .single()

      if (session) {
        const currentPages = Array.isArray(session.pages_visited) ? session.pages_visited : []
        const updatedPages = [...currentPages, {
          page,
          timestamp: new Date().toISOString()
        }]

        await supabase
          .from('user_sessions')
          .update({ pages_visited: updatedPages })
          .eq('id', sessionId)
      }
    } catch (error) {
      console.error('Error updating page visited:', error)
    }
  }

  // **EVENT TRACKING**
  async trackEvent(userId: string, eventType: EventType, eventData?: any, moduleId?: number): Promise<void> {
    try {
      const event: UserEvent = {
        user_id: userId,
        session_id: this.currentSessionId,
        event_type: eventType,
        event_data: eventData || null,
        module_id: moduleId || null
      }

      await supabase
        .from('user_events')
        .insert(event)

      // Update relevant analytics summary
      await this.handleEventAnalytics(userId, eventType, eventData)
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  // Ensure module_start event exists before completion
  async ensureModuleStartEvent(userId: string, moduleId: number): Promise<void> {
    try {
      // Check if module_start event already exists
      const { data: existingStart } = await supabase
        .from('user_events')
        .select('id')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .eq('event_type', 'module_start')
        .limit(1)
      
      if (!existingStart || existingStart.length === 0) {
        // Create retroactive module_start event
        await this.trackEvent(userId, 'module_start', { moduleId }, moduleId)
        console.log(`Created retroactive module_start event for user ${userId}, module ${moduleId}`)
      }
    } catch (error) {
      console.error('Error ensuring module start event:', error)
    }
  }

  private async handleEventAnalytics(userId: string, eventType: EventType, eventData?: any): Promise<void> {
    const updates: Partial<AnalyticsSummary> = {
      last_active_at: new Date().toISOString()
    }

    switch (eventType) {
      case 'module_complete':
        updates.modules_completed = 1
        break
      case 'task_complete':
        updates.tasks_completed = 1
        break
      case 'badge_earned':
        updates.badges_earned = 1
        break
      case 'wallet_created':
        updates.wallets_created = 1
        break
    }

    if (Object.keys(updates).length > 1) { // More than just last_active_at
      await this.updateAnalyticsSummary(userId, updates)
    }
  }

  // **ANALYTICS SUMMARY**
  private async updateAnalyticsSummary(userId: string, updates: Partial<AnalyticsSummary>): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('user_analytics_summary')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (existing) {
        // Update existing record by adding to current values
        const updatedData: any = {
          last_active_at: updates.last_active_at || existing.last_active_at,
          updated_at: new Date().toISOString()
        }

        // Add incremental values
        if (updates.total_time_spent_seconds) {
          updatedData.total_time_spent_seconds = existing.total_time_spent_seconds + updates.total_time_spent_seconds
        }
        if (updates.total_sessions) {
          updatedData.total_sessions = existing.total_sessions + updates.total_sessions
        }
        if (updates.modules_completed) {
          updatedData.modules_completed = existing.modules_completed + updates.modules_completed
        }
        if (updates.tasks_completed) {
          updatedData.tasks_completed = existing.tasks_completed + updates.tasks_completed
        }
        if (updates.badges_earned) {
          updatedData.badges_earned = existing.badges_earned + updates.badges_earned
        }
        if (updates.wallets_created) {
          updatedData.wallets_created = existing.wallets_created + updates.wallets_created
        }

        await supabase
          .from('user_analytics_summary')
          .update(updatedData)
          .eq('user_id', userId)
      } else {
        // Create new record
        const newData: AnalyticsSummary = {
          user_id: userId,
          total_time_spent_seconds: updates.total_time_spent_seconds || 0,
          last_active_at: updates.last_active_at || new Date().toISOString(),
          total_sessions: updates.total_sessions || 0,
          modules_completed: updates.modules_completed || 0,
          tasks_completed: updates.tasks_completed || 0,
          badges_earned: updates.badges_earned || 0,
          wallets_created: updates.wallets_created || 0,
          first_seen_at: new Date().toISOString()
        }

        await supabase
          .from('user_analytics_summary')
          .insert(newData)
      }
    } catch (error) {
      console.error('Error updating analytics summary:', error)
    }
  }

  // **REPORTING & DASHBOARD**
  async getUserAnalytics(userId: string): Promise<AnalyticsSummary | null> {
    try {
      const { data, error } = await supabase
        .from('user_analytics_summary')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      return null
    }
  }

  async getRealtimeAnalytics(): Promise<{
    active_users: number
    active_sessions: number
    daily_active_users: number
    weekly_active_users: number
    avg_session_duration: number
  } | null> {
    try {
      const { data, error } = await supabase
        .from('realtime_analytics')
        .select('*')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching realtime analytics:', error)
      return null
    }
  }

  async getAllUsersAnalytics(): Promise<AnalyticsSummary[]> {
    try {
      const { data, error } = await supabase
        .from('user_analytics_summary')
        .select('*')
        .order('last_active_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching all users analytics:', error)
      return []
    }
  }

  async getUserEvents(userId: string, limit: number = 50): Promise<UserEvent[]> {
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user events:', error)
      return []
    }
  }

  // **UTILITIES**
  private getDeviceInfo(): any {
    if (typeof window === 'undefined') return null

    return {
      screen_width: window.screen?.width || null,
      screen_height: window.screen?.height || null,
      viewport_width: window.innerWidth || null,
      viewport_height: window.innerHeight || null,
      language: navigator.language || null,
      platform: navigator.platform || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null
    }
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId
  }

  // **GEOLOCATION TRACKING**
  private async getGeolocation(ipAddress?: string): Promise<{
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
    timezone?: string
  } | null> {
    if (!ipAddress) return null
    
    // Simple IP-based location detection for Brazilian IPs
    // This is a fallback solution since external APIs are rate-limited
    const brazilianIPRanges = [
      '177.', '186.', '187.', '189.', '179.', '201.', '200.', '191.', '170.'
    ]
    
    const isBrazilianIP = brazilianIPRanges.some(range => ipAddress.startsWith(range))
    
    if (isBrazilianIP) {
      // Return Brazilian location for likely Brazilian IPs
      return {
        country: 'Brasil',
        region: 'São Paulo',
        city: 'São Paulo',
        latitude: -23.5505,
        longitude: -46.6333,
        timezone: 'America/Sao_Paulo'
      }
    }
    
    // For non-Brazilian IPs, try to use a free API with fallback
    try {
      // Try free tier API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        
        if (!data.error) {
          return {
            country: data.country_name === 'Brazil' ? 'Brasil' : data.country_name || null,
            region: data.region || null,
            city: data.city || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            timezone: data.timezone || null
          }
        }
      }
    } catch (error) {
      console.warn('Geolocation API failed, using fallback')
    }
    
    // Default fallback to Brazil (since most users are likely Brazilian)
    return {
      country: 'Brasil',
      region: 'São Paulo',
      city: 'São Paulo',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: 'America/Sao_Paulo'
    }
  }

  // **IP ADDRESS DETECTION** (server-side)
  static getClientIP(req: any): string | null {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           null
  }
}

export const analyticsService = new AnalyticsService()