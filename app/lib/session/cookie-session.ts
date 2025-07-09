import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export interface SessionData {
  sessionId: string
  createdAt: number
  lastActivity: number
  isAnonymous: boolean
}

export class CookieSessionManager {
  static readonly COOKIE_NAME = 'satslab_session'
  static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days
  
  /**
   * Get or create a session for the current request
   */
  static async getOrCreateSession(): Promise<SessionData> {
    const cookieStore = cookies()
    const existingCookie = cookieStore.get(this.COOKIE_NAME)
    
    if (existingCookie) {
      try {
        const sessionData = JSON.parse(existingCookie.value) as SessionData
        // Update last activity
        sessionData.lastActivity = Date.now()
        return sessionData
      } catch {
        // Invalid cookie, create new one
      }
    }
    
    // Create new session
    const newSession: SessionData = {
      sessionId: this.generateSessionId(),
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isAnonymous: true
    }
    
    return newSession
  }
  
  /**
   * Set session cookie in response
   */
  static setSessionCookie(response: NextResponse, sessionData: SessionData): void {
    response.cookies.set({
      name: this.COOKIE_NAME,
      value: JSON.stringify(sessionData),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.SESSION_DURATION / 1000, // Convert to seconds
      path: '/'
    })
  }
  
  /**
   * Get session from request
   */
  static getSessionFromRequest(request: NextRequest): SessionData | null {
    const cookie = request.cookies.get(this.COOKIE_NAME)
    
    if (!cookie) return null
    
    try {
      return JSON.parse(cookie.value) as SessionData
    } catch {
      return null
    }
  }
  
  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }
  
  /**
   * Clear session cookie
   */
  static clearSession(response: NextResponse): void {
    response.cookies.delete(this.COOKIE_NAME)
  }
  
  /**
   * Check if session is expired
   */
  static isSessionExpired(session: SessionData): boolean {
    const expirationTime = session.createdAt + this.SESSION_DURATION
    return Date.now() > expirationTime
  }
}