import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Get Turso database credentials from environment
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN

// Ensure required environment variables are set
if (!TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL environment variable is not set')
}

if (!TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN environment variable is not set')
}

// Create a database client using Turso credentials
const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
})

// Main function to drop all relevant tables from the database
async function main() {
  try {
    // Drop existing tables if they exist (order matters for foreign keys)
    await client.execute('DROP TABLE IF EXISTS account;')
    await client.execute('DROP TABLE IF EXISTS session;')
    await client.execute('DROP TABLE IF EXISTS verificationToken;')
    await client.execute('DROP TABLE IF EXISTS pool_member;')
    await client.execute('DROP TABLE IF EXISTS canvas;')
    await client.execute('DROP TABLE IF EXISTS file;')
    await client.execute('DROP TABLE IF EXISTS pool;')
    await client.execute('DROP TABLE IF EXISTS user;')
    
    console.log('Successfully dropped all tables')
  } catch (error) {
    console.error('Error dropping tables:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main() 