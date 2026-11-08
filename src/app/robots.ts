import type { MetadataRoute } from 'next'

import { SITE } from '@/content/defaults'

// Read SITE_INDEXABLE at runtime (not at build time), so staging can opt out without a rebuild.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  const production = process.env.SITE_INDEXABLE !== 'false'
  return {
    rules: production ? [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }] : [{ userAgent: '*', disallow: '/' }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
