import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthTokenFromRequest } from '@/lib/auth-utils'
import { decodeJwt } from '@/lib/jwt'

// Paths that require authentication
const protectedPaths = ['/agent']

// Paths that should redirect authenticated users away (auth pages)
const authPaths = ['/auth/signin', '/auth/register', '/auth/verify-otp', '/auth/set-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = getAuthTokenFromRequest(request)
  const isValidToken = token && decodeJwt(token)
  
  // Check if user is trying to access auth pages while already authenticated
  if (authPaths.some(path => pathname.startsWith(path))) {
    if (isValidToken) {
      // User is authenticated but trying to access auth pages, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // Check if user is trying to access protected paths without authentication
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!isValidToken) {
      // User is not authenticated but trying to access protected pages, redirect to signin
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}