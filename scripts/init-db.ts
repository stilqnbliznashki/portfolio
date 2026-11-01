import 'dotenv/config';
import { closeDatabase, ensureDatabaseDirectory, getDatabase, resolveDatabasePath } from '../src/lib/db';
import { ensureSeedData } from '../src/lib/project-data';

const databasePath = resolveDatabasePath();
ensureDatabaseDirectory(databasePath);
const database = getDatabase();

try {
  ensureSeedData();
  const row = database.prepare('SELECT COUNT(*) as total FROM projects').get() as { total: number };
  console.log(`Database initialized at ${databasePath}`);
  console.log(`Projects imported: ${row.total}`);
} finally {
  closeDatabase();
}
