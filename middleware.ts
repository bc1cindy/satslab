import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { securityMiddleware } from './app/lib/security/security-middleware'

export async function middleware(request: NextRequest) {
  // Get client IP address
  const ip = request.ip || 
             request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             request.headers.get('cf-connecting-ip') ||
             '127.0.0.1'

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  
  // Add IP to headers for use in the app
  requestHeaders.set('x-user-ip', ip)
  
  // Add user agent for analytics
  const userAgent = request.headers.get('user-agent') || 'unknown'
  requestHeaders.set('x-user-agent', userAgent)

  // Add country info if available (Vercel provides this)
  const country = request.headers.get('x-vercel-ip-country')
  if (country) {
    requestHeaders.set('x-user-country', country)
  }

  // Add city info if available
  const city = request.headers.get('x-vercel-ip-city')
  if (city) {
    requestHeaders.set('x-user-city', city)
  }

  // Apply enterprise security middleware
  const securityResponse = await securityMiddleware.handleRequest(request)
  if (securityResponse) {
    // Security middleware blocked the request
    return securityResponse
  }

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })

  // Add security headers to the response
  return securityMiddleware.addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}