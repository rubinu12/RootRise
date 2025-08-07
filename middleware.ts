import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * This middleware function acts as a central security guard for your application.
 * It runs before a request is completed for the paths specified in the `config` matcher.
 */
export function middleware(request: NextRequest) {
  // 1. Get the path the user is trying to access.
  const path = request.nextUrl.pathname;

  // 2. Get the user's authentication token from their cookies.
  const token = request.cookies.get('token')?.value || '';

  // 3. If the user is trying to access the login/signup page but is already logged in,
  //    redirect them to the dashboard.
  if (path === '/join' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  // 4. If the user is trying to access a protected page (like dashboard or quiz)
  //    but they do not have a token, redirect them to the login page.
  if ((path.startsWith('/dashboard') || path.startsWith('/quiz')) && !token) {
    return NextResponse.redirect(new URL('/join', request.nextUrl));
  }

  // 5. If none of the above conditions are met, allow the request to proceed.
  return NextResponse.next();
}

/**
 * This config ensures the middleware runs only on the specified pages.
 * The homepage ('/') and API routes are now completely ignored by the middleware,
 * which solves the issue of being redirected from the homepage.
 */
export const config = {
  matcher: ['/dashboard/:path*', '/quiz/:path*', '/join'],
};
