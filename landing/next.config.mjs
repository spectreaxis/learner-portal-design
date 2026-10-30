import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // This app lives inside the portal repo; pin the root so Turbopack doesn't pick the parent workspace.
  turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  // The learner portal used to live on the root domain. Issued certificates link to
  // cogniwiseai.com/verify/..., so those and old app bookmarks must reach the portal.
  // Keep in step with portalUrl in lib/site.ts.
  async redirects() {
    const portal = 'https://learn.cogniwiseai.com'
    return ['/verify/:path*', '/certificate/:path*', '/learn/:path*', '/settings/:path*', '/login', '/register'].map(
      (source) => ({ source, destination: `${portal}${source}`, permanent: true }),
    )
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
