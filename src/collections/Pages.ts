import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '../payload/access'
import { seoField, slugField } from '../payload/fields'
import { TAGS, revalidateCollection, revalidateCollectionDelete } from '../payload/revalidate'

/**
 * Simple text pages: privacy notice, legal / operator information and any
 * future long-form page. Rendered at /<slug> by src/app/(frontend)/[slug]/page.tsx.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    preview: (doc) => (doc?.slug ? `/${doc.slug}` : null),
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    afterChange: [revalidateCollection(TAGS.pages)],
    afterDelete: [revalidateCollectionDelete(TAGS.pages)],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'effectiveDate', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    { name: 'content', type: 'richText', required: true, localized: true },
    slugField('title'),
    seoField,
  ],
}
