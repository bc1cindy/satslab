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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          public_key: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          public_key?: string
          created_at?: string
          updated_at?: string
        }
      }
      module_progress: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      badge_type: 'virtual' | 'ordinal'
    }
  }
}