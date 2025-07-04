import { createServerClient } from './server'
import { createClient } from './client'
import { User, ModuleProgress, Badge } from '@/app/types'

export async function getUserByPublicKey(publicKey: string): Promise<User | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('public_key', publicKey)
    .single()
  
  if (error) return null
  
  const progress = await getUserProgress(data.id)
  const badges = await getUserBadges(data.id)
  
  return {
    id: data.id,
    publicKey: data.public_key,
    progress,
    badges,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export async function createUser(publicKey: string): Promise<User | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ public_key: publicKey }])
    .select()
    .single()
  
  if (error) return null
  
  return {
    id: data.id,
    publicKey: data.public_key,
    progress: [],
    badges: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export async function getUserProgress(userId: string): Promise<ModuleProgress[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('module_progress')
    .select('*')
    .eq('user_id', userId)
    .order('module_id')
  
  if (error) return []
  
  return data.map(item => ({
    moduleId: item.module_id,
    completed: item.completed,
    currentTask: item.current_task,
    completedTasks: item.completed_tasks,
    score: item.score,
    completedAt: item.completed_at
  }))
}

export async function updateModuleProgress(
  userId: string,
  moduleId: number,
  progress: Partial<ModuleProgress>
): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('module_progress')
    .upsert({
      user_id: userId,
      module_id: moduleId,
      completed: progress.completed,
      current_task: progress.currentTask,
      completed_tasks: progress.completedTasks,
      score: progress.score,
      completed_at: progress.completed ? new Date().toISOString() : null
    })
  
  return !error
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  
  if (error) return []
  
  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    moduleId: item.module_id,
    type: item.type,
    imageUrl: item.image_url,
    ordinalId: item.ordinal_id,
    earnedAt: item.earned_at
  }))
}

export async function awardBadge(
  userId: string,
  badge: Omit<Badge, 'id' | 'earnedAt'>
): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('badges')
    .insert([{
      user_id: userId,
      name: badge.name,
      description: badge.description,
      module_id: badge.moduleId,
      type: badge.type,
      image_url: badge.imageUrl,
      ordinal_id: badge.ordinalId
    }])
  
  return !error
}

export async function createWallet(
  userId: string,
  address: string,
  publicKey: string,
  network: string = 'signet'
): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('wallets')
    .insert([{
      user_id: userId,
      address,
      public_key: publicKey,
      network
    }])
  
  return !error
}

export async function updateWalletBalance(
  userId: string,
  address: string,
  balance: number
): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('wallets')
    .update({ balance })
    .eq('user_id', userId)
    .eq('address', address)
  
  return !error
}

export async function recordTransaction(
  userId: string,
  txId: string,
  amount: number,
  fee: number,
  type: string
): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      tx_id: txId,
      amount,
      fee,
      type
    }])
  
  return !error
}