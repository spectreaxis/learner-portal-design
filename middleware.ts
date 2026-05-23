export { default } from 'next-auth/middleware';

// Protect all routes except login, register, and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api (API routes)
     * - /login (login page)
     * - /register (register page)
     * - /_next (Next.js internals)
     * - /static (static files)
     * - /*.* (files with extensions like .png, .jpg, etc.)
     */
    '/((?!api|login|register|_next|static|.*\\..*).*)',
  ],
};
