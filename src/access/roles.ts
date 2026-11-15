import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor' | 'reviewer'

const hasRole = (user: unknown, roles: Role[]) =>
  !!user && Array.isArray((user as { roles?: Role[] }).roles) && (user as { roles: Role[] }).roles.some((r) => roles.includes(r))

export const anyone: Access = () => true
export const editors: Access = ({ req: { user } }) => hasRole(user, ['admin', 'editor', 'reviewer'])
export const admins: Access = ({ req: { user } }) => hasRole(user, ['admin'])
/** Only reviewers (teachers) and admins may approve content. */
export const reviewersField: FieldAccess = ({ req: { user } }) => hasRole(user, ['admin', 'reviewer'])
export const adminsField: FieldAccess = ({ req: { user } }) => hasRole(user, ['admin'])
