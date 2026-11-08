import type { Access, FieldAccess, PayloadRequest } from 'payload'

type Role = 'admin' | 'editor'

const roleOf = (req: PayloadRequest): Role | null => {
  const user = req.user as { roles?: Role[] } | null
  if (!user) return null
  return user.roles?.includes('admin') ? 'admin' : 'editor'
}

export const isAdmin: Access = ({ req }) => roleOf(req) === 'admin'
export const isStaff: Access = ({ req }) => Boolean(req.user)
export const anyone: Access = () => true
export const nobody: Access = () => false

export const isAdminField: FieldAccess = ({ req }) => roleOf(req) === 'admin'

/** Public visitors see published documents only; staff see drafts too. */
export const publishedOrStaff: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
