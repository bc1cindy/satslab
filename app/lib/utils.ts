import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a date string to Brazilian locale
 * @param dateString - The date string to format
 * @param fallback - Fallback text if date is invalid (default: 'Data não disponível')
 * @returns Formatted date string or fallback
 */
export function formatDateBR(dateString: string | null | undefined, fallback: string = 'Data não disponível'): string {
  if (!dateString) return fallback
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return fallback
    return date.toLocaleDateString('pt-BR')
  } catch {
    return fallback
  }
}

/**
 * Calculates days remaining until expiration
 * @param expirationDate - The expiration date string
 * @returns Number of days remaining or null if invalid
 */
export function calculateDaysRemaining(expirationDate: string | null | undefined): number | null {
  if (!expirationDate) return null
  
  try {
    const expDate = new Date(expirationDate)
    if (isNaN(expDate.getTime())) return null
    
    const now = new Date()
    const diffTime = expDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  } catch {
    return null
  }
}