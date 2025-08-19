// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * This middleware function runs before a request is completed for the paths
 * specified in the `config` matcher.
 *
 * With Firebase client-side auth, the main redirection logic is handled by
 * the AuthContext and ProtectedRoute components. This middleware serves as a
 * first line of defense, but we will enhance it later with session validation.
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // For now, we will allow the request to proceed.
  // The client-side AuthProvider will check the user's authentication
  // state and redirect them if necessary.
  
  // We can add server-side session validation here later.

  return NextResponse.next();
}

/**
 * This config ensures the middleware runs only on the specified pages.
 */
export const config = {
  matcher: ['/dashboard/:path*', '/quiz/:path*', '/join'],
};