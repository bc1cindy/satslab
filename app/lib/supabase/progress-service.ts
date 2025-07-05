import { supabase } from './client'

export interface ModuleProgress {
  user_id: string
  module_id: number
  completed_questions: number[]
  completed_tasks: number[]
  hints_used: number[]
  time_spent: number
  attempts: number
  completed_at?: string
  badge_earned: boolean
}

export interface Badge {
  id: string
  user_id: string
  module_id: number
  badge_name: string
  badge_type: 'virtual' | 'ordinal'
  earned_at: string
  metadata?: any
}

class ProgressService {
  async saveModuleProgress(progress: ModuleProgress): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('module_progress')
        .upsert(progress, {
          onConflict: 'user_id,module_id'
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error saving progress:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async getModuleProgress(userId: string, moduleId: number): Promise<ModuleProgress | null> {
    try {
      const { data, error } = await supabase
        .from('module_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Error fetching progress:', error)
      return null
    }
  }

  async getUserProgress(userId: string): Promise<ModuleProgress[]> {
    try {
      const { data, error } = await supabase
        .from('module_progress')
        .select('*')
        .eq('user_id', userId)
        .order('module_id')

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching user progress:', error)
      return []
    }
  }

  async awardBadge(badge: Omit<Badge, 'id' | 'earned_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const badgeData = {
        ...badge,
        earned_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('badges')
        .insert(badgeData)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error awarding badge:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching badges:', error)
      return []
    }
  }

  async checkBadgeEarned(userId: string, moduleId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('id')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking badge:', error)
      return false
    }
  }

  // Analytics and stats
  async getModuleStats(moduleId: number): Promise<{
    totalUsers: number
    completionRate: number
    averageTime: number
    averageAttempts: number
  }> {
    try {
      const { data, error } = await supabase
        .from('module_progress')
        .select('time_spent, attempts, completed_at')
        .eq('module_id', moduleId)

      if (error) throw error

      const totalUsers = data.length
      const completedUsers = data.filter(p => p.completed_at).length
      const completionRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0
      
      const averageTime = data.length > 0 
        ? data.reduce((sum, p) => sum + p.time_spent, 0) / data.length 
        : 0
      
      const averageAttempts = data.length > 0 
        ? data.reduce((sum, p) => sum + p.attempts, 0) / data.length 
        : 0

      return {
        totalUsers,
        completionRate,
        averageTime,
        averageAttempts
      }
    } catch (error) {
      console.error('Error fetching module stats:', error)
      return {
        totalUsers: 0,
        completionRate: 0,
        averageTime: 0,
        averageAttempts: 0
      }
    }
  }
}

export const progressService = new ProgressService()