import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '../payload/access'
import { DISCIPLINES, seoField, slugField } from '../payload/fields'
import { TAGS, revalidateCollection, revalidateCollectionDelete } from '../payload/revalidate'

export const PROJECT_STATUS = [
  { label: 'Concept', value: 'concept' },
  { label: 'In design', value: 'design' },
  { label: 'Prototype', value: 'prototype' },
  { label: 'Fabricated', value: 'fabricated' },
  { label: 'In testing', value: 'testing' },
  { label: 'In production', value: 'production' },
  { label: 'Internal R&D', value: 'internal' },
] as const

/**
 * Archive references are site-owned identifiers (NCI-A-0001, NCI-A-0002, …).
 * They are catalogue numbers for this website — never product part numbers.
 */
const assignReference: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== 'create' || data.reference) return data
  const latest = await req.payload.find({
    collection: 'projects',
    sort: '-reference',
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
    where: { reference: { like: 'NCI-A-' } },
  })
  const last = latest.docs[0]?.reference as string | undefined
  const next = last ? parseInt(last.replace(/\D/g, ''), 10) + 1 : 1
  data.reference = `NCI-A-${String(next).padStart(4, '0')}`
  return data
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Archive entry', plural: 'Engineering archive' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['reference', 'title', 'status', 'featured', '_status'],
    description:
      'Real engineering work only. Every technical detail published here should be verifiable from design files or the finished hardware.',
    preview: (doc) => (doc?.slug ? `/archive/${doc.slug}` : null),
  },
  defaultSort: 'order',
  versions: { drafts: true, maxPerDoc: 25 },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeChange: [assignReference],
    afterChange: [revalidateCollection(TAGS.projects)],
    afterDelete: [revalidateCollectionDelete(TAGS.projects)],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            { name: 'subtitle', type: 'text', localized: true, admin: { description: 'Short descriptive line, e.g. “Field interface board”.' } },
            { name: 'summary', type: 'textarea', required: true, localized: true, maxLength: 360 },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Primary visual. A render, CAD capture or photograph — any of them works.' },
            },
            {
              name: 'gallery',
              type: 'array',
              admin: { description: 'One to six images. The layout adapts to however many you add.' },
              maxRows: 8,
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                { name: 'caption', type: 'text', localized: true },
              ],
            },
          ],
        },
        {
          label: 'Engineering',
          fields: [
            { name: 'challenge', type: 'richText', localized: true, admin: { description: 'The problem or brief, in plain language.' } },
            {
              name: 'work',
              label: 'Work performed',
              type: 'array',
              fields: [
                { name: 'item', type: 'text', required: true, localized: true },
                { name: 'discipline', type: 'select', options: [...DISCIPLINES] },
              ],
            },
            {
              name: 'components',
              label: 'Key components',
              type: 'array',
              admin: { description: 'Part numbers as they appear in the design files.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'part', type: 'text', required: true, admin: { width: '45%' } },
                    { name: 'role', type: 'text', localized: true, admin: { width: '55%' } },
                  ],
                },
              ],
            },
            {
              name: 'facts',
              label: 'Verified technical details',
              type: 'array',
              admin: { description: 'Label / value pairs, e.g. “Board outline” → “170 × 150 mm”.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, localized: true, admin: { width: '40%' } },
                    { name: 'value', type: 'text', required: true, localized: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
            { name: 'notes', type: 'richText', localized: true, admin: { description: 'Optional longer write-up.' } },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField('title'),
    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Site archive number. Assigned automatically (NCI-A-0001…).',
      },
    },
    {
      name: 'status',
      type: 'select',
      enumName: 'enum_projects_dev_status', // avoid clashing with the drafts `_status` enum
      required: true,
      defaultValue: 'design',
      options: [...PROJECT_STATUS],
      admin: { position: 'sidebar', description: 'Development status — only what is actually true.' },
    },
    { name: 'statusNote', type: 'text', localized: true, admin: { position: 'sidebar', description: 'Optional, e.g. “Revision 3.0”.' } },
    {
      name: 'disciplines',
      type: 'select',
      hasMany: true,
      options: [...DISCIPLINES],
      admin: { position: 'sidebar' },
    },
    { name: 'year', type: 'number', admin: { position: 'sidebar' } },
    { name: 'client', type: 'text', admin: { position: 'sidebar', description: 'Only fill in with the client’s permission.' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show on the homepage.' } },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
