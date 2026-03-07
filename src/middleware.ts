import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/api/config'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/recordings', '/contacts', '/team', '/reports', '/alerts', '/settings']

// Routes that should redirect authenticated users away
const AUTH_ROUTES = ['/login']

/**
 * Check if the request path matches any of the given prefixes.
 */
function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

/**
 * Add production security headers to every response.
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  // Prevent MIME-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Disable legacy XSS auditor (defence-in-depth)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  // HSTS — only effective over HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  // Restrict browser feature access
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
  const isAuthenticated = Boolean(sessionCookie?.value)

  // Auth guard: redirect unauthenticated users to /login
  if (matchesPrefix(pathname, PROTECTED_PREFIXES) && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    addSecurityHeaders(response)
    return response
  }

  // Auth guard: redirect already-authenticated users away from /login
  if (matchesPrefix(pathname, AUTH_ROUTES) && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    const destination = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/dashboard'
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = destination
    dashboardUrl.search = ''
    const response = NextResponse.redirect(dashboardUrl)
    addSecurityHeaders(response)
    return response
  }

  // Pass through all other requests with security headers applied
  const response = NextResponse.next()
  addSecurityHeaders(response)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     * - API routes (handled by backend)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
}
