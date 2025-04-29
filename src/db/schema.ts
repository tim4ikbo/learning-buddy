import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
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

// Define relation between sessions and users (each session belongs to a user)
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId], // Foreign key in sessions
    references: [users.id],    // References users.id
  }),
}))

// Table for verification tokens (used for email/password resets, etc.)
export const verificationTokens = sqliteTable('verificationToken', {
  identifier: text('identifier').notNull(), // Unique identifier (e.g., email)
  token: text('token').notNull(),           // The verification token
  expires: integer('expires', { mode: 'timestamp' }).notNull(), // Expiry timestamp
}, (vt) => ({
  pk: primaryKey({ columns: [vt.identifier, vt.token] }) // Composite primary key
}))

// Table for study pools (collaborative groups)
export const pools = sqliteTable('pool', {
  id: text('id').primaryKey().$defaultFn(() => createId()), // Unique pool ID
  name: text('name').notNull(),                             // Pool name
  creatorId: text('creator_id').references(() => users.id), // User who created the pool
  createdAt: integer('created_at', { mode: 'timestamp' })   // Creation timestamp
})

// Table for members of each pool
export const poolMembers = sqliteTable('pool_member', {
  id: text('id').primaryKey().$defaultFn(() => createId()), // Unique membership ID
  poolId: text('pool_id').references(() => pools.id),       // Reference to pool
  userId: text('user_id').references(() => users.id),       // Reference to user
  role: text('role'), // 'admin' | 'member'                 // Member role in pool
  joinedAt: integer('joined_at', { mode: 'timestamp' })     // When the user joined
})

// Table for canvases (collaborative drawing boards) within a pool
export const canvases = sqliteTable('canvas', {
  id: text('id').primaryKey().$defaultFn(() => createId()), // Unique canvas ID
  name: text('name').notNull(),                             // Canvas name
  poolId: text('pool_id').references(() => pools.id),       // Reference to pool
  creatorId: text('creator_id').references(() => users.id), // User who created the canvas
  content: text('content'), // JSON string of canvas data    // Canvas state/content
  createdAt: integer('created_at', { mode: 'timestamp' }),  // Creation timestamp
  updatedAt: integer('updated_at', { mode: 'timestamp' })   // Last update timestamp
})

// Table for files uploaded to a pool
export const files = sqliteTable('file', {
  id: text('id').primaryKey().$defaultFn(() => createId()), // Unique file ID
  name: text('name').notNull(),                             // File name
  url: text('url').notNull(),                               // File storage URL
  size: integer('size').notNull(),                          // File size (bytes)
  type: text('type').notNull(),                             // MIME type
  poolId: text('pool_id').references(() => pools.id),       // Reference to pool
  uploaderId: text('uploader_id').references(() => users.id), // User who uploaded
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }) // Upload timestamp
})
