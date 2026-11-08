import type { MetadataRoute } from 'next'

import { SITE } from '@/content/defaults'
import { getPageSlugs, getProjects } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, pages] = await Promise.all([getProjects(), getPageSlugs()])
  const now = new Date()
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE.url}/capabilities`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE.url}/archive`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${SITE.url}/credits`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    ...projects
      .filter((p) => !p.seo?.noindex)
      .map((p) => ({ url: `${SITE.url}/archive/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: 'yearly' as const, priority: 0.7 })),
    ...pages.map((p) => ({ url: `${SITE.url}/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: 'yearly' as const, priority: 0.3 })),
  ]
}
