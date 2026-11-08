import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { homeDefaults, servicesDefaults, settingsDefaults } from '@/content/defaults'
import type { Home, Page, Project, Service, SiteSetting } from '@/payload-types'
import { TAGS } from '@/payload/revalidate'

export const payload = () => getPayload({ config })

const REVALIDATE = 3600 // safety net; content edits revalidate immediately via tags

function logFailure(scope: string, error: unknown) {
  console.error(`[data] ${scope} failed:`, error instanceof Error ? error.message : error)
}

/** Merge CMS values over defaults; empty strings/arrays fall back. */
function withDefaults<T extends Record<string, unknown>>(
  defaults: T,
  value: Partial<Record<keyof T, unknown>> | null | undefined,
): T {
  const out: Record<string, unknown> = { ...defaults }
  if (!value) return out as T
  for (const key of Object.keys(defaults)) {
    const v = value[key as keyof T]
    if (v === null || v === undefined) continue
    if (typeof v === 'string' && v.trim() === '') continue
    if (Array.isArray(v) && v.length === 0) continue
    out[key] = v
  }
  return out as T
}

// ---------------------------------------------------------------- globals

export type SiteSettings = typeof settingsDefaults & Pick<SiteSetting, 'notifyEmails' | 'ogImage'>

export const getSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const p = await payload()
      const doc = await p.findGlobal({ slug: 'site-settings', depth: 1 })
      return {
        ...withDefaults(settingsDefaults, doc as never),
        notifyEmails: doc.notifyEmails,
        ogImage: doc.ogImage,
      }
    } catch (e) {
      logFailure('settings', e)
      return { ...settingsDefaults, notifyEmails: null, ogImage: null }
    }
  },
  ['settings'],
  { tags: [TAGS.settings], revalidate: REVALIDATE },
)

export type HomeContent = Omit<typeof homeDefaults, 'heroLines'> & { heroLines: string[] }

export const getHome = unstable_cache(
  async (): Promise<HomeContent> => {
    try {
      const p = await payload()
      const doc = (await p.findGlobal({ slug: 'home', depth: 0 })) as Home
      const merged = withDefaults(homeDefaults, {
        ...doc,
        heroLines: doc.heroLines?.map((l) => l.line).filter(Boolean),
      } as never)
      return merged as HomeContent
    } catch (e) {
      logFailure('home', e)
      return homeDefaults
    }
  },
  ['home'],
  { tags: [TAGS.home], revalidate: REVALIDATE },
)

// ---------------------------------------------------------------- services

export type ServiceView = {
  code: string
  title: string
  slug: string
  headline: string
  summary: string
  capabilities: { label: string; delivery?: string | null }[]
  deliverables: string[]
}

export const getServices = unstable_cache(
  async (): Promise<ServiceView[]> => {
    try {
      const p = await payload()
      const res = await p.find({ collection: 'services', sort: 'order', limit: 20, depth: 0 })
      if (res.docs.length === 0) throw new Error('no services in CMS')
      return res.docs.map((s: Service) => ({
        code: s.code,
        title: s.title,
        slug: s.slug,
        headline: s.headline || '',
        summary: s.summary,
        capabilities: (s.capabilities || []).map((c) => ({ label: c.label, delivery: c.delivery })),
        deliverables: (s.deliverables || []).map((d) => d.label),
      }))
    } catch (e) {
      logFailure('services', e)
      return servicesDefaults.map((s) => ({ ...s, deliverables: s.deliverables }))
    }
  },
  ['services'],
  { tags: [TAGS.services], revalidate: REVALIDATE },
)

// ---------------------------------------------------------------- projects

const publishedOnly = { _status: { equals: 'published' as const } }

export const getProjects = unstable_cache(
  async (): Promise<Project[]> => {
    try {
      const p = await payload()
      const res = await p.find({
        collection: 'projects',
        where: publishedOnly,
        sort: 'order',
        limit: 100,
        depth: 1,
      })
      return res.docs
    } catch (e) {
      logFailure('projects', e)
      return []
    }
  },
  ['projects'],
  { tags: [TAGS.projects], revalidate: REVALIDATE },
)

async function fetchProject(slug: string): Promise<Project | null> {
  try {
    const p = await payload()
    const res = await p.find({
      collection: 'projects',
      where: { and: [{ slug: { equals: slug } }, publishedOnly] },
      limit: 1,
      depth: 1,
    })
    return res.docs[0] ?? null
  } catch (e) {
    logFailure(`project ${slug}`, e)
    return null
  }
}

const cachedProject = unstable_cache(fetchProject, ['project'], {
  tags: [TAGS.projects],
  revalidate: REVALIDATE,
})

/** Cached lookup; a cached miss is re-checked so new/renamed entries never stay 404. */
export const getProject = async (slug: string) => (await cachedProject(slug)) ?? fetchProject(slug)

// ---------------------------------------------------------------- pages

async function fetchPage(slug: string): Promise<Page | null> {
  try {
    const p = await payload()
    const res = await p.find({
      collection: 'pages',
      where: { and: [{ slug: { equals: slug } }, publishedOnly] },
      limit: 1,
      depth: 1,
    })
    return res.docs[0] ?? null
  } catch (e) {
    logFailure(`page ${slug}`, e)
    return null
  }
}

const cachedPage = unstable_cache(fetchPage, ['page'], {
  tags: [TAGS.pages],
  revalidate: REVALIDATE,
})

export const getPage = async (slug: string) => (await cachedPage(slug)) ?? fetchPage(slug)

export const getPageSlugs = unstable_cache(
  async (): Promise<{ slug: string; updatedAt: string }[]> => {
    try {
      const p = await payload()
      const res = await p.find({
        collection: 'pages',
        where: publishedOnly,
        limit: 100,
        depth: 0,
        select: { slug: true, updatedAt: true },
      })
      return res.docs.map((d) => ({ slug: d.slug as string, updatedAt: d.updatedAt as string }))
    } catch (e) {
      logFailure('page slugs', e)
      return []
    }
  },
  ['page-slugs'],
  { tags: [TAGS.pages], revalidate: REVALIDATE },
)
