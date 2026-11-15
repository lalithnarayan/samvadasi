import type { CollectionConfig } from 'payload'
import { admins, adminsField, editors } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', group: 'Team' },
  auth: true,
  access: { read: editors, create: admins, update: ({ req: { user }, id }) => !!user && ((user as any).roles?.includes('admin') || user.id === id), delete: admins },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['editor'],
      required: true,
      saveToJWT: true,
      access: { update: adminsField },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor (adds and edits words)', value: 'editor' },
        { label: 'Reviewer (teacher, approves forms)', value: 'reviewer' },
      ],
    },
  ],
}
