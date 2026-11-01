import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Database from 'better-sqlite3';

import { closeDatabase, ensureDatabaseDirectory, getDatabase, resolveDatabasePath } from '../src/lib/db';
import {
  ensureSeedData,
  findProjectBySlug,
  getCategories,
  getFeaturedProjects,
  getProjectBySlug,
  getRelatedProjects,
  getStatuses,
  getTechnologies,
  listProjects,
} from '../src/lib/project-data';

function withDatabasePath(filePath: string, callback: () => void): void {
  const originalPath = process.env.DATABASE_PATH;
  process.env.DATABASE_PATH = filePath;
  closeDatabase();

  try {
    callback();
  } finally {
    closeDatabase();

    if (originalPath === undefined) {
      delete process.env.DATABASE_PATH;
      return;
    }

    process.env.DATABASE_PATH = originalPath;
  }
}

test('initializes a configured SQLite database and seeds the project catalog', () => {
  const databaseDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-db-'));
  const databasePath = path.join(databaseDirectory, 'portfolio.db');

  withDatabasePath(databasePath, () => {
    ensureDatabaseDirectory(databasePath);
    const database = getDatabase();
    ensureSeedData();

    const projectCount = database.prepare('SELECT COUNT(*) as total FROM projects').get() as { total: number };
    const project = findProjectBySlug('nitro-tunnel');

    assert.equal(projectCount.total > 0, true);
    assert.ok(project);
    assert.equal(project?.name, 'Nitro Tunnel');
  });
});

test('throws for invalid configured database paths', () => {
  const originalPath = process.env.DATABASE_PATH;
  process.env.DATABASE_PATH = 'not/absolute/path.db';

  try {
    assert.throws(() => resolveDatabasePath());
  } finally {
    closeDatabase();

    if (originalPath === undefined) {
      delete process.env.DATABASE_PATH;
      return;
    }

    process.env.DATABASE_PATH = originalPath;
  }
});

test('supports search, filtering, sorting, and technology-based project queries', () => {
  const databaseDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-filter-'));
  const databasePath = path.join(databaseDirectory, 'portfolio.db');

  withDatabasePath(databasePath, () => {
    ensureSeedData();

    const filteredProjects = listProjects({
      category: 'Developer Tools',
      status: 'Completed',
      technology: 'Go',
      search: 'secure',
      published: true,
      sort: 'featured',
    });

    const categories = getCategories();
    const statuses = getStatuses();
    const technologies = getTechnologies();
    const featuredProjects = getFeaturedProjects();

    assert.ok(filteredProjects.some((project) => project.slug === 'nitro-tunnel'));
    assert.ok(categories.includes('Developer Tools'));
    assert.ok(statuses.includes('Completed'));
    assert.ok(technologies.includes('Go'));
    assert.ok(featuredProjects.some((project) => project.slug === 'home-lab-ops'));
  });
});

test('retrieves a project by slug and finds related work', () => {
  const databaseDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-related-'));
  const databasePath = path.join(databaseDirectory, 'portfolio.db');

  withDatabasePath(databasePath, () => {
    ensureSeedData();

    const project = getProjectBySlug('home-lab-ops');
    const relatedProjects = getRelatedProjects('home-lab-ops', 2);

    assert.ok(project);
    assert.ok(project?.category === 'Infrastructure and Self-Hosting');
    assert.ok(relatedProjects.length >= 1);
  });
});

test('creates a backup and restores a copy without losing project data', () => {
  const databaseDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-backup-'));
  const backupDirectory = path.join(databaseDirectory, 'backups');
  const databasePath = path.join(databaseDirectory, 'portfolio.db');

  fs.mkdirSync(backupDirectory, { recursive: true, mode: 0o750 });

  withDatabasePath(databasePath, () => {
    ensureSeedData();

    execFileSync('node', ['./scripts/backup-db.mjs'], {
      cwd: path.resolve(__dirname, '..'),
      env: {
        ...process.env,
        DATABASE_PATH: databasePath,
        PORTFOLIO_BACKUP_DIR: backupDirectory,
      },
      stdio: 'pipe',
    });

    const backupFiles = fs.readdirSync(backupDirectory).filter((entry) => entry.endsWith('.db'));
    assert.ok(backupFiles.length > 0);

    execFileSync('node', ['./scripts/restore-db.mjs', '--force', path.join(backupDirectory, backupFiles[0])], {
      cwd: path.resolve(__dirname, '..'),
      env: {
        ...process.env,
        DATABASE_PATH: databasePath,
        PORTFOLIO_BACKUP_DIR: backupDirectory,
        FORCE_RESTORE: 'true',
      },
      stdio: 'pipe',
    });

    const restoredDatabase = new Database(databasePath, { readonly: true, fileMustExist: true });
    const row = restoredDatabase.prepare('SELECT COUNT(*) as total FROM projects').get() as { total: number };
    restoredDatabase.close();

    assert.ok(row.total > 0);
  });
});
