import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../payload/access'
import { slugField } from '../payload/fields'
import { TAGS, revalidateCollection, revalidateCollectionDelete } from '../payload/revalidate'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Discipline', plural: 'Disciplines' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'order', 'updatedAt'],
    description: 'Engineering disciplines shown on the homepage and the Capabilities page.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    afterChange: [revalidateCollection(TAGS.services)],
    afterDelete: [revalidateCollectionDelete(TAGS.services)],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'code', type: 'text', required: true, maxLength: 4, admin: { width: '20%', description: 'Short index code, e.g. EL' } },
        { name: 'title', type: 'text', required: true, localized: true, admin: { width: '60%' } },
        { name: 'order', type: 'number', required: true, defaultValue: 10, admin: { width: '20%' } },
      ],
    },
    slugField('title'),
    { name: 'headline', type: 'text', localized: true, admin: { description: 'One-line statement shown under the discipline name.' } },
    { name: 'summary', type: 'textarea', required: true, localized: true },
    {
      name: 'capabilities',
      type: 'array',
      labels: { singular: 'Capability', plural: 'Capabilities' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true, admin: { width: '70%' } },
            {
              name: 'delivery',
              type: 'select',
              admin: {
                width: '30%',
                description: 'Only set when confirmed. Empty = no label shown.',
              },
              options: [
                { label: 'In-house', value: 'in-house' },
                { label: 'With manufacturing partners', value: 'partner' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'deliverables',
      type: 'array',
      labels: { singular: 'Deliverable', plural: 'Deliverables' },
      admin: { description: 'What a customer actually receives (files, documents, hardware).' },
      fields: [{ name: 'label', type: 'text', required: true, localized: true }],
    },
  ],
}
