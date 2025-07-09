export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          public_key: string
          ip_address: string | null
          last_login_ip: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          public_key: string
          ip_address?: string | null
          last_login_ip?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          public_key?: string
          ip_address?: string | null
          last_login_ip?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          module_id: number
          completed: boolean
          current_task: number
          completed_tasks: number[]
          score: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: number
          completed?: boolean
          current_task?: number
          completed_tasks?: number[]
          score?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: number
          completed?: boolean
          current_task?: number
          completed_tasks?: number[]
          score?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          module_id: number
          type: 'virtual' | 'ordinal'
          image_url: string | null
          ordinal_id: string | null
          earned_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          module_id: number
          type: 'virtual' | 'ordinal'
          image_url?: string | null
          ordinal_id?: string | null
          earned_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          module_id?: number
          type?: 'virtual' | 'ordinal'
          image_url?: string | null
          ordinal_id?: string | null
          earned_at?: string
          created_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          address: string
          public_key: string
          network: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address: string
          public_key: string
          network: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          address?: string
          public_key?: string
          network?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          tx_id: string
          amount: number
          fee: number
          type: string
          status: string
          block_height: number | null
          confirmations: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tx_id: string
          amount: number
          fee: number
          type: string
          status?: string
          block_height?: number | null
          confirmations?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tx_id?: string
          amount?: number
          fee?: number
          type?: string
          status?: string
          block_height?: number | null
          confirmations?: number
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_start: string
          session_end: string | null
          ip_address: string | null
          user_agent: string | null
          device_info: Json | null
          total_duration_seconds: number
          pages_visited: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_start?: string
          session_end?: string | null
          ip_address?: string | null
          user_agent?: string | null
          device_info?: Json | null
          total_duration_seconds?: number
          pages_visited?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_start?: string
          session_end?: string | null
          ip_address?: string | null
          user_agent?: string | null
          device_info?: Json | null
          total_duration_seconds?: number
          pages_visited?: Json
          created_at?: string
        }
      }
      user_events: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          event_type: string
          event_data: Json | null
          module_id: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          event_type: string
          event_data?: Json | null
          module_id?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          event_type?: string
          event_data?: Json | null
          module_id?: number | null
          timestamp?: string
        }
      }
      user_analytics_summary: {
        Row: {
          user_id: string
          total_time_spent_seconds: number
          last_active_at: string
          total_sessions: number
          modules_completed: number
          tasks_completed: number
          badges_earned: number
          wallets_created: number
          first_seen_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_time_spent_seconds?: number
          last_active_at?: string
          total_sessions?: number
          modules_completed?: number
          tasks_completed?: number
          badges_earned?: number
          wallets_created?: number
          first_seen_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_time_spent_seconds?: number
          last_active_at?: string
          total_sessions?: number
          modules_completed?: number
          tasks_completed?: number
          badges_earned?: number
          wallets_created?: number
          first_seen_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      realtime_analytics: {
        Row: {
          active_users: number
          active_sessions: number
          daily_active_users: number
          weekly_active_users: number
          avg_session_duration: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      badge_type: 'virtual' | 'ordinal'
      event_type: 'page_view' | 'module_start' | 'module_complete' | 'task_start' | 'task_complete' | 'question_answer' | 'badge_earned' | 'wallet_created' | 'session_start' | 'session_end'
    }
  }
}