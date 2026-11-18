import 'dotenv/config';
import {
  assertDatabaseConnection,
  closePool,
  databaseTarget,
  runMigrations,
} from '../db.js';

async function main() {
  try {
    await assertDatabaseConnection();
    // eslint-disable-next-line no-console
    console.log(
      `Connected to PostgreSQL at ${databaseTarget.host}:${databaseTarget.port}/${databaseTarget.database} (user: ${databaseTarget.user})`
    );
    await runMigrations();
    // eslint-disable-next-line no-console
    console.log('Schema and seed data applied successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

void main();
