import { migrate } from 'drizzle-orm/libsql/migrator'
import { db } from '.'

// Main migration script for applying schema changes using drizzle-orm
async function main() {
  try {
    // Run migrations from the specified migrations folder
    await migrate(db, {
      migrationsFolder: 'src/db/migrations'
    })
    console.log('Migration completed successfully')
  } catch (error) {
    // Log errors and exit with failure code if migration fails
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main() 