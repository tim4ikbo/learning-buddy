import { migrate } from 'drizzle-orm/libsql/migrator'
import { db } from '.'

async function main() {
  try {
    await migrate(db, {
      migrationsFolder: 'src/db/migrations'
    })
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main() 