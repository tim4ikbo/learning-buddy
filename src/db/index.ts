import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Ensure this code only runs on the server side (never in the browser)
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side')
}

// Validate required Turso database environment variables
if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is not defined')
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN is not defined')
}

// Create a Turso database client using credentials from environment
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Initialize drizzle ORM with the Turso client and schema
export const db = drizzle(client, { schema })

// Debug function to check database connection and user table existence
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

// Check database connection on startup (optional, for development)
checkDatabase() 