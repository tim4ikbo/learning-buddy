import { db } from '.'
import { migrate } from 'drizzle-orm/libsql/migrator'

async function reset() {
  console.log('Dropping all tables...')
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

  for (const table of tables) {
    try {
      await db.run(`DROP TABLE IF EXISTS ${table}`)
      console.log(`Dropped table ${table}`)
    } catch (error) {
      console.error(`Error dropping table ${table}:`, error)
    }
  }

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: 'src/db/migrations' })
  
  console.log('Database reset complete')
}

reset().catch(console.error)
