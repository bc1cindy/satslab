'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { updateModuleProgress, awardBadge } from '@/app/lib/supabase/queries'
import { Badge } from '@/app/types'

interface ModuleProgressState {
  timeSpent: number
  questionsCompleted: boolean
  questionsScore: number
  tasksCompleted: boolean
  tasksScore: number
  badgeEarned: boolean
  completed: boolean
}

export function useModuleProgress(moduleId: number, moduleBadge?: Omit<Badge, 'id' | 'earnedAt'>) {
  const { session } = useAuth()
  const [progress, setProgress] = useState<ModuleProgressState>({
    timeSpent: 0,
    questionsCompleted: false,
    questionsScore: 0,
    tasksCompleted: false,
    tasksScore: 0,
    badgeEarned: false,
    completed: false
  })
  const [startTime] = useState(Date.now())

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        timeSpent: Math.floor((Date.now() - startTime) / 1000)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  // Save progress to database
  const saveProgress = useCallback(async (progressData?: ModuleProgressState) => {
    if (!session?.user.id) {
      console.log('Not logged in, skipping progress save')
      return false
    }

    const dataToSave = progressData || progress
    
    try {
      // Save module progress
      const success = await updateModuleProgress(session.user.id, moduleId, {
        completed: dataToSave.completed,
        score: dataToSave.questionsScore + dataToSave.tasksScore,
        completedTasks: dataToSave.completed ? Array.from({length: 10}, (_, i) => i + 1) : [],
        currentTask: dataToSave.tasksScore
      })

      if (!success) {
        console.error('Failed to save progress to database')
        return false
      }

      // Award badge if earned
      if (dataToSave.badgeEarned && moduleBadge && dataToSave.completed) {
        console.log('Awarding badge:', moduleBadge)
        const badgeSuccess = await awardBadge(session.user.id, moduleBadge)
        console.log('Badge awarded:', badgeSuccess)
      }

      console.log('Progress saved successfully:', dataToSave)
      return true
    } catch (error) {
      console.error('Error saving progress:', error)
      return false
    }
  }, [session?.user.id, moduleId, moduleBadge, progress])

  // Handle questions completion
  const handleQuestionsComplete = useCallback(async (score: number, _total: number) => {
    setProgress(currentProgress => {
      const newProgress = {
        ...currentProgress,
        questionsCompleted: true,
        questionsScore: score
      }
      
      // Save partial progress
      saveProgress(newProgress)
      
      return newProgress
    })
  }, [saveProgress])

  // Handle tasks completion
  const handleTasksComplete = useCallback(async (completedTasks: number, totalTasks: number) => {
    const allTasksCompleted = completedTasks === totalTasks
    
    // Get current state to ensure we have the latest questionsCompleted status
    setProgress(currentProgress => {
      const newProgress = {
        ...currentProgress,
        tasksCompleted: true,
        tasksScore: completedTasks,
        badgeEarned: allTasksCompleted && currentProgress.questionsCompleted,
        completed: allTasksCompleted && currentProgress.questionsCompleted
      }
      
      console.log('Tasks completed - Progress update:', {
        allTasksCompleted,
        questionsCompleted: currentProgress.questionsCompleted,
        badgeEarned: newProgress.badgeEarned,
        completed: newProgress.completed
      })
      
      // Save progress asynchronously
      saveProgress(newProgress)
      
      return newProgress
    })
  }, [saveProgress])

  return {
    progress,
    handleQuestionsComplete,
    handleTasksComplete,
    saveProgress,
    isAuthenticated: !!session
  }
}