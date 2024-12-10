import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  // Get the pathname from the request
  const path = request.nextUrl.pathname;

  // Check if the path is public (login, signup)
  const isPublicPath = ['/login', '/signup'].includes(path);
  
  // Check if it's the root path
  const isRootPath = path === '/';

  // Get the token from the session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect logic
  if (!token) {
    // If no token and trying to access protected route, redirect to home
    if (!isPublicPath && !isRootPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    // If authenticated
    if (isPublicPath) {
      // If trying to access login/signup, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (isRootPath) {
      // If authenticated and on home page, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Continue with the request and pass the pathname
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which paths the middleware should run on
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
};