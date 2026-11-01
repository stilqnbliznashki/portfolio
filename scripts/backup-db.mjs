import 'dotenv/config';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';

const databasePath = process.env.DATABASE_PATH?.trim() || path.join(os.homedir(), '.portfolio', 'portfolio.db');
const backupDir = process.env.PORTFOLIO_BACKUP_DIR?.trim() || path.join('/srv', 'backups', 'portfolio');

if (!fs.existsSync(databasePath)) {
  throw new Error(`Database does not exist at ${databasePath}. Run the migration first.`);
}

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true, mode: 0o750 });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `portfolio-${timestamp}.db`);
const sourceDb = new Database(databasePath, { readonly: true, fileMustExist: true, timeout: 5000 });

try {
  sourceDb.backup(backupPath);
  console.log(`Database backup created at ${backupPath}`);
} finally {
  sourceDb.close();
}
