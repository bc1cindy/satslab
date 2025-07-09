import { createClient } from './client'
import { User, ModuleProgress, Badge } from '@/app/types'

export async function getUserByPublicKey(publicKey: string): Promise<User | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('public_key', publicKey)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No user found - this is normal for new users
        return null
      }
      console.error('Error fetching user:', error)
      return null
    }
    
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
  } catch (error) {
    console.error('Database connection error:', error)
    return null
  }
}


export async function createUser(publicKey: string, ipAddress?: string): Promise<User | null> {
  try {
    const supabase = createClient()
    
    const userData: any = { public_key: publicKey }
    if (ipAddress) {
      userData.ip_address = ipAddress
      userData.last_login_ip = ipAddress
      userData.last_login_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      return null
    }
    
    return {
      id: data.id,
      publicKey: data.public_key,
      progress: [],
      badges: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  } catch (error) {
    console.error('Database connection error:', error)
    return null
  }
}

export async function getUserProgress(userId: string): Promise<ModuleProgress[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('module_progress')
      .select('*')
      .eq('user_id', userId)
      .order('module_id')
    
    if (error) {
      console.error('Error loading user progress:', error)
      return []
    }
    
    return data?.map(item => ({
      moduleId: item.module_id,
      completed: item.completed,
      currentTask: item.current_task,
      completedTasks: item.completed_tasks || [],
      score: item.score || 0,
      completedAt: item.completed_at
    })) || []
  } catch (error) {
    console.error('Database connection error:', error)
    return []
  }
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
      completed: progress.completed || false,
      current_task: progress.currentTask || 0,
      completed_tasks: progress.completedTasks || [],
      score: progress.score || 0,
      completed_at: progress.completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
  
  if (error) {
    console.error('Error updating module progress:', error)
  }
  
  return !error
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
    
    if (error) {
      console.error('Error loading user badges:', error)
      return []
    }
    
    return data?.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      moduleId: item.module_id,
      type: item.type,
      imageUrl: item.image_url,
      ordinalId: item.ordinal_id,
      earnedAt: item.earned_at
    })) || []
  } catch (error) {
    console.error('Database connection error:', error)
    return []
  }
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

// IP-based authentication functions
export async function getUserByIP(ipAddress: string): Promise<{ id: string; ipAddress: string } | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('id, ip_address')
      .eq('ip_address', ipAddress)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching user by IP:', error)
      return null
    }
    
    return {
      id: data.id,
      ipAddress: data.ip_address
    }
  } catch (error) {
    console.error('Database connection error:', error)
    return null
  }
}

export async function createUserByIP(ipAddress: string): Promise<{ id: string; ipAddress: string } | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        public_key: `ip_${ipAddress}_${Date.now()}`, // Unique public_key for IP users
        ip_address: ipAddress,
        last_login_ip: ipAddress,
        last_login_at: new Date().toISOString()
      }])
      .select('id, ip_address')
      .single()
    
    if (error) {
      console.error('Error creating user by IP:', error)
      return null
    }
    
    return {
      id: data.id,
      ipAddress: data.ip_address
    }
  } catch (error) {
    console.error('Database connection error:', error)
    return null
  }
}