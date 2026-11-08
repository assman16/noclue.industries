import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '../payload/access'
import { TAGS, revalidateGlobal } from '../payload/revalidate'

/**
 * Editable homepage copy. Every field has a code-level fallback
 * (src/content/defaults.ts), so an empty field never breaks the layout.
 */
export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Homepage',
  admin: { group: 'Content' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal(TAGS.home)] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'heroEyebrow', type: 'text', localized: true },
            {
              name: 'heroLines',
              type: 'array',
              localized: true,
              maxRows: 4,
              admin: { description: 'The monumental headline, one short line per row.' },
              fields: [{ name: 'line', type: 'text', required: true }],
            },
            { name: 'heroLede', type: 'textarea', localized: true },
          ],
        },
        {
          label: 'Disciplines',
          fields: [
            { name: 'disciplinesTitle', type: 'text', localized: true },
            { name: 'disciplinesIntro', type: 'textarea', localized: true },
          ],
        },
        {
          label: 'Process',
          fields: [
            { name: 'processTitle', type: 'text', localized: true },
            { name: 'processIntro', type: 'textarea', localized: true },
            {
              name: 'processSteps',
              type: 'array',
              localized: true,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
                { name: 'output', type: 'text', admin: { description: 'What exists at the end of this step.' } },
              ],
            },
          ],
        },
        {
          label: 'Assembly',
          fields: [
            { name: 'assemblyTitle', type: 'text', localized: true },
            { name: 'assemblyBody', type: 'textarea', localized: true },
            {
              name: 'assemblyDisclaimer',
              type: 'text',
              localized: true,
              admin: { description: 'Keep this: the exploded assembly is a demonstration model, not a client product.' },
            },
          ],
        },
        {
          label: 'Why',
          fields: [
            { name: 'whyTitle', type: 'text', localized: true },
            {
              name: 'whyPoints',
              type: 'array',
              localized: true,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'contactTitle', type: 'text', localized: true },
            { name: 'contactIntro', type: 'textarea', localized: true },
          ],
        },
      ],
    },
  ],
}
