import type { CollectionConfig } from 'payload'

import { INQUIRY_BUDGET, INQUIRY_SCOPE, INQUIRY_STAGE, INQUIRY_TIMELINE } from '../content/inquiry-options'
import { isAdmin, isStaff, nobody } from '../payload/access'

/**
 * Project inquiries submitted through the website.
 *
 * Public creation is disabled at the API level: submissions arrive only through
 * the server action in src/app/(frontend)/contact/actions.ts (via src/lib/inquiry), which validates,
 * rate-limits and then writes with the Local API.
 */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    group: 'Leads',
    useAsTitle: 'name',
    defaultColumns: ['name', 'company', 'state', 'notification', 'createdAt'],
    description: 'Project inquiries from the website. Retained for 12 months after last contact unless a project starts.',
  },
  defaultSort: '-createdAt',
  access: {
    create: nobody,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    { name: 'company', type: 'text' },
    { name: 'scope', type: 'select', hasMany: true, options: [...INQUIRY_SCOPE] },
    {
      type: 'row',
      fields: [
        { name: 'stage', type: 'select', options: [...INQUIRY_STAGE], admin: { width: '33%' } },
        { name: 'timeline', type: 'select', options: [...INQUIRY_TIMELINE], admin: { width: '33%' } },
        { name: 'budget', type: 'select', options: [...INQUIRY_BUDGET], admin: { width: '33%' } },
      ],
    },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'state',
      label: 'Status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In review', value: 'review' },
        { label: 'Replied', value: 'replied' },
        { label: 'Project started', value: 'won' },
        { label: 'Closed', value: 'closed' },
        { label: 'Spam', value: 'spam' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'internalNotes', type: 'textarea', admin: { position: 'sidebar' } },
    {
      name: 'notification',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Email sent', value: 'sent' },
        { label: 'Email failed', value: 'failed' },
        { label: 'Email not configured', value: 'not-configured' },
      ],
      admin: { position: 'sidebar', readOnly: true, description: 'Delivery status of the internal notification email.' },
    },
    { name: 'notificationError', type: 'text', admin: { position: 'sidebar', readOnly: true, condition: (d) => d?.notification === 'failed' } },
    {
      name: 'meta',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        { name: 'privacyAcknowledged', type: 'checkbox' },
        { name: 'sourcePath', type: 'text' },
        { name: 'userAgent', type: 'text' },
        { name: 'ipHash', type: 'text', admin: { description: 'Salted SHA-256 of the sender IP, used only for abuse limits.' } },
      ],
    },
  ],
}
