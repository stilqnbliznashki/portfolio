import 'dotenv/config';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';

const databasePath = process.env.DATABASE_PATH?.trim() || path.join(os.homedir(), '.portfolio', 'portfolio.db');
const backupDir = process.env.PORTFOLIO_BACKUP_DIR?.trim() || path.join('/srv', 'backups', 'portfolio');
const force = process.argv.includes('--force') || process.env.FORCE_RESTORE === 'true';

if (!force) {
  throw new Error('Refusing to overwrite the production database without --force or FORCE_RESTORE=true.');
}

const backupPath = process.argv[2] || getMostRecentBackup(backupDir);
if (!backupPath) {
  throw new Error(`No backup file found in ${backupDir}.`);
}

if (!fs.existsSync(backupPath)) {
  throw new Error(`Backup file not found: ${backupPath}`);
}

if (!fs.existsSync(databasePath)) {
  throw new Error(`Target database does not exist at ${databasePath}. Create it first with the initialization workflow.`);
}

const backupFile = path.resolve(backupPath);
fs.copyFileSync(backupFile, databasePath);

const restoredDatabase = new Database(databasePath, { readonly: true, fileMustExist: true, timeout: 5000 });
const integrityCheck = restoredDatabase.prepare('PRAGMA integrity_check;').get();
restoredDatabase.close();

if (integrityCheck?.integrity_check !== 'ok') {
  throw new Error('Database restore failed integrity validation.');
}

console.log(`Database restored from ${backupFile} to ${databasePath}`);

function getMostRecentBackup(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return null;
  }

  const entries = fs.readdirSync(directoryPath)
    .filter((entry) => entry.endsWith('.db'))
    .sort((left, right) => {
      return fs.statSync(path.join(directoryPath, right)).mtimeMs - fs.statSync(path.join(directoryPath, left)).mtimeMs;
    });

  return entries.length > 0 ? path.join(directoryPath, entries[0]) : null;
}
