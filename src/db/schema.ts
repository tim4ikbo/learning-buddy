import { sqliteTable, text, integer, primaryKey, real } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('user', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp' }),
  image: text('image'),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions)
}))

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
})

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessions = sqliteTable('session', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: text('sessionToken').notNull().unique(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const verificationTokens = sqliteTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (vt) => ({
  pk: primaryKey({ columns: [vt.identifier, vt.token] })
}))

export const pools = sqliteTable('pool', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  creatorId: text('creator_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
})

export const poolMembers = sqliteTable('pool_member', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  poolId: text('pool_id').references(() => pools.id),
  userId: text('user_id').references(() => users.id),
  role: text('role'), // 'admin' | 'member'
  joinedAt: integer('joined_at', { mode: 'timestamp' })
})

export const canvases = sqliteTable('canvas', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  poolId: text('pool_id').references(() => pools.id),
  creatorId: text('creator_id').references(() => users.id),
  content: text('content'), // JSON string of canvas data
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
})

export const files = sqliteTable('file', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  url: text('url').notNull(),
  size: integer('size').notNull(),
  type: text('type').notNull(),
  poolId: text('pool_id').references(() => pools.id),
  uploaderId: text('uploader_id').references(() => users.id),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' })
})
