'use client'

import { useAuth as useAuthContext } from '../contexts/AuthContext'

// Re-export do hook do contexto para facilitar imports
export const useAuth = useAuthContext

export default useAuth