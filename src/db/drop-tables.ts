import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

dotenv.config()

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN

if (!TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL environment variable is not set')
}

if (!TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN environment variable is not set')
}

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
})

async function main() {
  try {
    // Drop existing tables
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