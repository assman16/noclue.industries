import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Cache tags used by the frontend data layer (src/lib/data.ts).
 * Content edits in the admin invalidate the matching tag, so pages update
 * immediately without a rebuild.
 */
export const TAGS = {
  projects: 'projects',
  services: 'services',
  pages: 'pages',
  settings: 'global-settings',
  home: 'global-home',
} as const

async function revalidate(tag: string) {
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag(tag, 'max')
  } catch {
    // Outside a Next.js request (e.g. `payload run scripts/seed.ts`) there is no cache to clear.
  }
}

export const revalidateCollection =
  (tag: string): CollectionAfterChangeHook =>
  async ({ doc, req }) => {
    if (!req.context?.skipRevalidate) await revalidate(tag)
    return doc
  }

export const revalidateCollectionDelete =
  (tag: string): CollectionAfterDeleteHook =>
  async ({ doc, req }) => {
    if (!req.context?.skipRevalidate) await revalidate(tag)
    return doc
  }

export const revalidateGlobal =
  (tag: string): GlobalAfterChangeHook =>
  async ({ doc, req }) => {
    if (!req.context?.skipRevalidate) await revalidate(tag)
    return doc
  }
