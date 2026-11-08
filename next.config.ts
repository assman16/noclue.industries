import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const immutable = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (no Vercel features used).
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  images: {
    // CMS media is served pre-sized (WebP) by Payload; static renders ship as AVIF/WebP.
    unoptimized: true,
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Versioned folders: bump v1 → v2 when re-rendering.
      { source: '/renders/:path*', headers: immutable },
      { source: '/sequences/:path*', headers: immutable },
      { source: '/fonts/:path*', headers: immutable },
      { source: '/brand/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
