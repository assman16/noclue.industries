import path from 'path'
import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../payload/access'
import { TAGS, revalidateCollection } from '../payload/revalidate'

const webp = { format: 'webp' as const, options: { quality: 80 } }

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'kind', 'updatedAt'],
    description: 'Images used across the site. Mark each asset honestly: render, photo, CAD capture or drawing.',
  },
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    afterChange: [revalidateCollection(TAGS.projects)],
  },
  upload: {
    staticDir: path.resolve(process.env.MEDIA_DIR || 'media'),
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml'],
    focalPoint: true,
    crop: true,
    imageSizes: [
      { name: 'thumb', width: 480, formatOptions: webp },
      { name: 'card', width: 960, formatOptions: webp },
      { name: 'plate', width: 1600, formatOptions: webp },
      { name: 'wide', width: 2400, formatOptions: webp, withoutEnlargement: true },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Describe what is visible, for screen readers and search engines.' },
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'render',
      options: [
        { label: 'Render (from real CAD / ECAD data)', value: 'render' },
        { label: 'Photograph', value: 'photo' },
        { label: 'CAD / ECAD capture', value: 'cad' },
        { label: 'Technical drawing', value: 'drawing' },
        { label: 'Diagram', value: 'diagram' },
      ],
      admin: { description: 'Shown as a small label next to the image so visitors know what they are looking at.' },
    },
    { name: 'caption', type: 'text', localized: true },
  ],
}
