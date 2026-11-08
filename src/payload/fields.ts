import type { Field, FieldHook } from 'payload'

export const slugify = (v: string) =>
  v
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.length > 0) return slugify(value)
    const source = data?.[fallback] ?? originalDoc?.[fallback]
    return typeof source === 'string' ? slugify(source) : value
  }

export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'URL segment. Generated from the title when left empty.',
  },
  hooks: { beforeValidate: [formatSlug(from)] },
})

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: {
    description: 'Optional overrides. Empty fields fall back to the title, summary and site defaults.',
  },
  fields: [
    { name: 'title', type: 'text', localized: true, maxLength: 70 },
    { name: 'description', type: 'textarea', localized: true, maxLength: 170 },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Open Graph image, 1200 × 630 recommended.' } },
    { name: 'noindex', type: 'checkbox', defaultValue: false, label: 'Hide from search engines' },
  ],
}

export const DISCIPLINES = [
  { label: 'Electronics & PCB', value: 'electronics' },
  { label: 'Firmware & embedded', value: 'firmware' },
  { label: 'Mechanical & CAD', value: 'mechanical' },
  { label: 'Prototyping', value: 'prototyping' },
] as const

export type Discipline = (typeof DISCIPLINES)[number]['value']
