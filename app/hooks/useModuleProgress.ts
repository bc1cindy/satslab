'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth, getUserIdentifier } from '@/app/components/auth/AuthProvider'
import { useSession } from '@/app/lib/session/session-provider'
import { updateModuleProgress, awardBadge, getUserProgress } from '@/app/lib/supabase/queries'
import { analyticsService } from '@/app/lib/supabase/analytics-service'
import { Badge } from '@/app/types'
import { securityLogger, SecurityEventType } from '@/app/lib/security/security-logger'

interface ModuleProgressState {
  questionsCompleted: boolean
  questionsScore: number
  tasksCompleted: boolean
  tasksScore: number
  badgeEarned: boolean
  completed: boolean
}

export function useModuleProgress(moduleId: number, moduleBadge?: Omit<Badge, 'id' | 'earnedAt'>) {
  const { session } = useAuth()
  const { sessionId } = useSession()
  const [progress, setProgress] = useState<ModuleProgressState>({
    questionsCompleted: false,
    questionsScore: 0,
    tasksCompleted: false,
    tasksScore: 0,
    badgeEarned: false,
    completed: false
  })
  const [progressLoaded, setProgressLoaded] = useState(false)

  // Load saved progress on mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (!session?.user.id) {
        setProgressLoaded(true)
        return
      }

      try {
        const savedProgress = await getUserProgress(session.user.id)
        const moduleProgress = savedProgress.find(p => p.moduleId === moduleId)
        
        if (moduleProgress) {
          // Use metadata if available (more accurate), otherwise fallback to estimation
          const metadata = (moduleProgress as any).metadata
          let questionsScore = 0
          let tasksScore = 0
          let questionsCompleted = false
          let tasksCompleted = false
          
          if (metadata && typeof metadata === 'object') {
            // Use stored metadata (accurate)
            questionsScore = metadata.questionsScore || 0
            tasksScore = metadata.tasksScore || 0
            questionsCompleted = metadata.questionsCompleted || false
            tasksCompleted = metadata.tasksCompleted || false
          } else {
            // Fallback to estimation from legacy data
            const totalScore = moduleProgress.score || 0
            const completedTasksCount = moduleProgress.completedTasks.length || 0
            questionsScore = moduleProgress.completed ? Math.ceil(totalScore / 2) : 0
            tasksScore = completedTasksCount
            questionsCompleted = moduleProgress.completed || totalScore > 0
            tasksCompleted = completedTasksCount > 0
          }
          
          setProgress(prev => ({
            ...prev,
            questionsCompleted,
            questionsScore,
            tasksCompleted,
            tasksScore,
            badgeEarned: moduleProgress.completed,
            completed: moduleProgress.completed
          }))
        }
      } catch (error) {
        securityLogger.warn(SecurityEventType.SYSTEM_ERROR, 'Failed to load user progress', {
          error: error instanceof Error ? error.message : 'Unknown error',
          moduleId
        })
      } finally {
        setProgressLoaded(true)
      }
    }

    loadSavedProgress()
  }, [session?.user.id, moduleId])


  // Save progress to database
  const saveProgress = useCallback(async (progressData?: ModuleProgressState) => {
    if (!session?.user.id) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Not logged in, skipping progress save')
      }
      return false
    }

    const dataToSave = progressData || progress
    
    try {
      // Save module progress with more detailed data
      const success = await updateModuleProgress(session.user.id, moduleId, {
        completed: dataToSave.completed,
        score: dataToSave.questionsScore + dataToSave.tasksScore,
        completedTasks: dataToSave.tasksCompleted ? Array.from({length: dataToSave.tasksScore}, (_, i) => i + 1) : [],
        currentTask: dataToSave.tasksScore,
        // Store individual scores in a JSON field if available
        metadata: {
          questionsScore: dataToSave.questionsScore,
          tasksScore: dataToSave.tasksScore,
          questionsCompleted: dataToSave.questionsCompleted,
          tasksCompleted: dataToSave.tasksCompleted
        }
      })

      if (!success) {
        securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to save progress to database', { moduleId })
        return false
      }

      // Award badge if earned
      if (dataToSave.badgeEarned && moduleBadge && dataToSave.completed) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Awarding badge:', moduleBadge)
        }
        const badgeSuccess = await awardBadge(session.user.id, moduleBadge)
        if (process.env.NODE_ENV === 'development') {
          console.log('Badge awarded:', badgeSuccess)
        }
        if (badgeSuccess) {
          securityLogger.info(SecurityEventType.ACCESS_GRANTED, 'User badge awarded', { moduleId, badgeType: moduleBadge.type })
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Progress saved successfully:', dataToSave)
      }
      return true
    } catch (error) {
      securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Error saving user progress', {
        error: error instanceof Error ? error.message : 'Unknown error',
        moduleId
      })
      return false
    }
  }, [session?.user.id, moduleId, moduleBadge, progress])

  // Handle questions completion
  const handleQuestionsComplete = useCallback(async (score: number, total: number) => {
    setProgress(currentProgress => {
      const newProgress = {
        ...currentProgress,
        questionsCompleted: true,
        questionsScore: score
      }
      
      // Track analytics using sessionId
      if (sessionId) {
        // Track each question answer if we have the data
        for (let i = 0; i < total; i++) {
          analyticsService.trackEvent(
            sessionId,
            'question_answer',
            { 
              moduleId, 
              questionId: i + 1, 
              correct: i < score,
              score: score,
              total: total
            },
            moduleId
          )
        }
      }
      
      // Save partial progress
      saveProgress(newProgress)
      
      return newProgress
    })
  }, [saveProgress, sessionId, moduleId])

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
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Tasks completed - Progress update:', {
          allTasksCompleted,
          questionsCompleted: currentProgress.questionsCompleted,
          badgeEarned: newProgress.badgeEarned,
          completed: newProgress.completed
        })
      }
      
      // Track analytics using sessionId
      if (sessionId) {
        // Track task completion
        analyticsService.trackEvent(
          sessionId,
          'task_complete',
          { 
            moduleId, 
            tasksCompleted: completedTasks,
            totalTasks: totalTasks,
            allCompleted: allTasksCompleted
          },
          moduleId
        )
        
        // Track module completion if all done
        if (newProgress.completed) {
          analyticsService.trackEvent(
            sessionId,
            'module_complete',
            { 
              moduleId,
              finalScore: newProgress.questionsScore + newProgress.tasksScore,
              completedAt: new Date().toISOString()
            },
            moduleId
          )
        }
        
        // Track badge earned
        if (newProgress.badgeEarned && moduleBadge) {
          analyticsService.trackEvent(
            sessionId,
            'badge_earned',
            { 
              moduleId,
              badgeName: moduleBadge.name,
              badgeType: moduleBadge.type,
              earnedAt: new Date().toISOString()
            },
            moduleId
          )
        }
      }
      
      // Save progress asynchronously
      saveProgress(newProgress)
      
      return newProgress
    })
  }, [saveProgress, sessionId, moduleId, moduleBadge])

  return {
    progress,
    handleQuestionsComplete,
    handleTasksComplete,
    saveProgress,
    isAuthenticated: !!session,
    progressLoaded
  }
}