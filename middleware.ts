import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'
import { checkRateLimit, rateLimitResponse } from './lib/rateLimit'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limit uploads and sensitive endpoints
  if (pathname.startsWith('/api/upload') || pathname.startsWith('/api/auth/register')) {
    const rate = checkRateLimit(request, 'upload')
    if (!rate.allowed) return rateLimitResponse(rate.retryAfter || 60)
  }

  if (pathname.startsWith('/api/')) {
    const rate = checkRateLimit(request, 'general')
    if (!rate.allowed) return rateLimitResponse(rate.retryAfter || 30)
  }

  // Protected routes
  const protectedPaths = ['/dashboard', '/admin', '/api/admin']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected) {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const payload = verifyToken(token)
    if (!payload) {
      const url = new URL('/login', request.url)
      return NextResponse.redirect(url)
    }

    // Admin only
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Attach user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-role', payload.role)
    requestHeaders.set('x-user-email', payload.email)

    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|public).*)'],
}
