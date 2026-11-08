import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isStaff } from '../payload/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'roles'],
    group: 'System',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8 h sessions
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  access: {
    // The first user can always be created through /admin (Payload's create-first-user flow).
    create: isAdmin,
    read: isStaff,
    update: ({ req, id }) => Boolean(req.user && ((req.user as { roles?: string[] }).roles?.includes('admin') || req.user.id === id)),
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // The very first account becomes an administrator.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          if (totalDocs === 0) data.roles = ['admin']
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['editor'],
      required: true,
      saveToJWT: true,
      access: { update: isAdminField, create: isAdminField },
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: { description: 'Editors manage content and inquiries. Administrators also manage users and settings.' },
    },
  ],
}
