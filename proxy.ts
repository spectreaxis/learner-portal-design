import middleware from 'next-auth/middleware';

/**
 * Next.js 16 Proxy configuration
 * Replaces the deprecated middleware.ts convention
 */
export const proxy = middleware;

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
