import { db } from '.'
import { migrate } from 'drizzle-orm/libsql/migrator'

// Main script to reset the database: drops all tables and re-applies migrations
async function reset() {
  console.log('Dropping all tables...')
  // List of tables to drop (order can matter for foreign key constraints)
  const tables = [
    'accounts',
    'sessions',
    'users',
    'verification_tokens',
    'pools',
    'pool_members',
    'canvases',
    'files'
  ]

  // Attempt to drop each table, logging errors if any occur
  for (const table of tables) {
    try {
      await db.run(`DROP TABLE IF EXISTS ${table}`)
      console.log(`Dropped table ${table}`)
    } catch (error) {
      console.error(`Error dropping table ${table}:`, error)
    }
  }

  // Run all pending migrations to recreate schema
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: 'src/db/migrations' })
  
  console.log('Database reset complete')
}

// Invoke the reset script and catch any unhandled errors
reset().catch(console.error)
