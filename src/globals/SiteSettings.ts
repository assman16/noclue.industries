import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../payload/access'
import { TAGS, revalidateGlobal } from '../payload/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'System' },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(TAGS.settings)] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact',
          fields: [
            { name: 'contactEmail', type: 'email', required: true, admin: { description: 'Public contact address shown on the site.' } },
            { name: 'phone', type: 'text', admin: { description: 'International format, e.g. +421 915 565 511' } },
            {
              name: 'notifyEmails',
              type: 'text',
              admin: {
                description:
                  'Where new inquiries are emailed (comma separated). Falls back to INQUIRY_NOTIFY_TO in the environment, then the contact email.',
              },
            },
            { name: 'responseTime', type: 'text', localized: true, admin: { description: 'Only state a response time you can keep, e.g. “within two working days”.' } },
            {
              name: 'links',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Operator',
          description: 'Legal operator details, shown in the footer and on the legal page.',
          fields: [
            { name: 'operatorName', type: 'text', required: true },
            { name: 'operatorAddress', type: 'textarea', required: true },
            {
              type: 'row',
              fields: [
                { name: 'companyId', label: 'IČO (company ID)', type: 'text' },
                { name: 'taxId', label: 'DIČ (tax ID)', type: 'text' },
                { name: 'vatId', label: 'IČ DPH (VAT ID)', type: 'text', admin: { description: 'Only if VAT-registered.' } },
              ],
            },
            { name: 'registry', type: 'textarea', admin: { description: 'Commercial register entry.' } },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'siteTitle', type: 'text', required: true, defaultValue: 'NoClue Industries' },
            { name: 'titleTemplate', type: 'text', defaultValue: '%s — NoClue Industries', admin: { description: '%s is replaced with the page title.' } },
            { name: 'description', type: 'textarea', localized: true, maxLength: 170 },
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
