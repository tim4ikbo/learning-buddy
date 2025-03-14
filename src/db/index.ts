import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Ensure we're on the server side
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side')
}

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is not defined')
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN is not defined')
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })

// Debug function to check database connection
export async function checkDatabase() {
  try {
    console.log('Checking database connection...')
    const result = await db.query.users.findMany()
    console.log('Database connection successful, user table exists:', result)
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Check database connection on startup
checkDatabase() 