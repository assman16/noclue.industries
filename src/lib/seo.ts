import type { Metadata } from 'next'

import { SITE } from '@/content/defaults'
import type { Media } from '@/payload-types'

import { getSettings } from './data'

type SeoInput = {
  title?: string | null
  description?: string | null
  path: string
  image?: Media | number | string | null
  noindex?: boolean | null
  type?: 'website' | 'article'
}

const DEFAULT_OG = '/og/noclue-industries-og.jpg'

export function mediaUrl(m: Media | number | string | null | undefined, size?: 'thumb' | 'card' | 'plate' | 'wide'): string | null {
  if (!m || typeof m !== 'object') return typeof m === 'string' ? m : null
  const sized = size ? m.sizes?.[size]?.url : null
  return sized || m.url || null
}

export async function buildMetadata({ title, description, path, image, noindex, type = 'website' }: SeoInput): Promise<Metadata> {
  const settings = await getSettings()
  const desc = description || settings.description
  const url = `${SITE.url}${path === '/' ? '' : path}`
  const og = mediaUrl(image as Media, 'wide') || mediaUrl(settings.ogImage as Media, 'wide') || DEFAULT_OG
  const fullTitle = title ? settings.titleTemplate.replace('%s', title) : `${settings.siteTitle} — Electronics, firmware & mechanical engineering`

  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      url,
      siteName: settings.siteTitle,
      title: fullTitle,
      description: desc,
      locale: 'en_GB',
      images: [{ url: og, width: 1200, height: 630, alt: 'NoClue Industries' }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description: desc, images: [og] },
  }
}
