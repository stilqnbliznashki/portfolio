import 'dotenv/config';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';

export const DATABASE_PATH_ENV = 'DATABASE_PATH';
export const DEFAULT_DATABASE_PATH = path.join(os.homedir(), '.portfolio', 'portfolio.db');

type DatabaseState = {
  instance: Database.Database;
  path: string;
};

declare global {
  var __portfolioDatabaseState: DatabaseState | undefined;
}

export function resolveDatabasePath(): string {
  const configuredValue = process.env[DATABASE_PATH_ENV]?.trim();
  const resolvedPath = configuredValue || DEFAULT_DATABASE_PATH;

  if (!path.isAbsolute(resolvedPath)) {
    throw new Error(
      `DATABASE_PATH must be an absolute path. Received "${resolvedPath}". Configure it in the environment or .env file before starting the app.`,
    );
  }

  return resolvedPath;
}

export function ensureDatabaseDirectory(targetPath = resolveDatabasePath()): string {
  const directoryPath = path.dirname(targetPath);

  if (!fs.existsSync(directoryPath)) {
    if (targetPath === DEFAULT_DATABASE_PATH) {
      fs.mkdirSync(directoryPath, { recursive: true, mode: 0o750 });
      return directoryPath;
    }

    throw new Error(
      `Database directory does not exist: ${directoryPath}. Create it with the deployment setup or run \"npm run db:init\".`,
    );
  }

  const directoryStats = fs.statSync(directoryPath);
  if (!directoryStats.isDirectory()) {
    throw new Error(`Database path parent is not a directory: ${directoryPath}`);
  }

  try {
    fs.accessSync(directoryPath, fs.constants.R_OK | fs.constants.W_OK);
  } catch {
    throw new Error(`Database directory is not readable or writable: ${directoryPath}`);
  }

  return directoryPath;
}

export function getDatabase(): Database.Database {
  const databasePath = resolveDatabasePath();
  ensureDatabaseDirectory(databasePath);

  const existing = globalThis.__portfolioDatabaseState;
  if (existing && existing.path === databasePath) {
    return existing.instance;
  }

  const sqliteDb = new Database(databasePath, {
    fileMustExist: false,
    timeout: 5000,
  });

  sqliteDb.pragma('foreign_keys = ON');
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('synchronous = NORMAL');
  sqliteDb.pragma('busy_timeout = 5000');

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS technologies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      short_summary TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('In Progress', 'Completed', 'Exploration', 'Archived')),
      featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0, 1)),
      published INTEGER NOT NULL DEFAULT 1 CHECK(published IN (0, 1)),
      start_date TEXT,
      end_date TEXT,
      last_updated TEXT,
      cover_image TEXT,
      repo_url TEXT,
      demo_url TEXT,
      docs_url TEXT,
      links_json TEXT NOT NULL DEFAULT '[]',
      overview_json TEXT NOT NULL DEFAULT '[]',
      problem_json TEXT NOT NULL DEFAULT '[]',
      features_json TEXT NOT NULL DEFAULT '[]',
      stack_json TEXT NOT NULL DEFAULT '[]',
      architecture_json TEXT NOT NULL DEFAULT '[]',
      challenges_json TEXT NOT NULL DEFAULT '[]',
      lessons_json TEXT NOT NULL DEFAULT '[]',
      limitations_json TEXT NOT NULL DEFAULT '[]',
      future_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_technologies (
      project_id INTEGER NOT NULL,
      technology_id INTEGER NOT NULL,
      PRIMARY KEY (project_id, technology_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
    CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
    CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published, featured, category, status);
    CREATE INDEX IF NOT EXISTS idx_project_technologies_project_id ON project_technologies(project_id);
    CREATE INDEX IF NOT EXISTS idx_project_technologies_technology_id ON project_technologies(technology_id);
  `);

  const migrationName = '001_create_portfolio_schema';
  const migrationCheck = sqliteDb.prepare('SELECT 1 FROM schema_migrations WHERE name = ?').get(migrationName);
  if (!migrationCheck) {
    sqliteDb.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(migrationName);
  }

  globalThis.__portfolioDatabaseState = { instance: sqliteDb, path: databasePath };
  return sqliteDb;
}

export function closeDatabase(): void {
  const existing = globalThis.__portfolioDatabaseState;
  if (existing) {
    existing.instance.close();
    globalThis.__portfolioDatabaseState = undefined;
  }
}
