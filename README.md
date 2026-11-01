# Portfolio with SQLite persistence

This portfolio now uses SQLite as the persistent source of truth for project content. The application reads project data from a database file stored outside the repository so rebuilds and redeployments do not clobber the data.

## Architecture

- Application: `/srv/portfolio/`
- Database directory: `/srv/data/portfolio/`
- Database file: `/srv/data/portfolio/portfolio.db`
- Backup directory: `/srv/backups/portfolio/`

The database path is configured with the `DATABASE_PATH` environment variable. A safe local fallback is used during development when the variable is not set: `~/.portfolio/portfolio.db`.

## Required environment

Copy `.env.example` to `.env` and set the desired absolute paths:

```
cp .env.example .env
```

Example values:

```
DATABASE_PATH=/srv/data/portfolio/portfolio.db
PORTFOLIO_BACKUP_DIR=/srv/backups/portfolio
```

Do not commit `.env` or any production database files to Git. SQLite sidecar files (`*.db-wal`, `*.db-shm`), backup files, and local database snapshots are ignored by `.gitignore`.

## Database schema

The database includes:

- `projects`: persisted portfolio items and project detail content.
- `technologies`: technology tags.
- `project_technologies`: many-to-many relationship matching between projects and technologies.

Project narrative fields are stored as validated JSON arrays so the current detail-page structure remains stable while keeping a normalized many-to-many metadata model for tags.

## Initialization and migrations

Create the database directory and initialize the schema:

```
mkdir -p /srv/data/portfolio /srv/backups/portfolio
chown -R portfolio:portfolio /srv/data/portfolio /srv/backups/portfolio
chmod 750 /srv/data/portfolio /srv/backups/portfolio
DATABASE_PATH=/srv/data/portfolio/portfolio.db PORTFOLIO_BACKUP_DIR=/srv/backups/portfolio npm run db:init
```

The database initializer is idempotent. Existing projects are not duplicated when the program is run again. It uses the project seed and import logic from the current portfolio content, then ensures that the database remains the authoritative source of project data.

## Import and content workflow

The current portfolio project records are imported from the existing project catalog into SQLite. The app reads from the database instead of the old static array for listing, filtering, featured projects, and detail pages.

To reimport from the project seed after a reset, run:

```
DATABASE_PATH=/srv/data/portfolio/portfolio.db npm run db:init
```

The import process does not overwrite existing project data during normal startup. It only inserts missing records when the database is empty or when a migration creates the initial seed set.

## Backup and restore

Create a SQLite backup:

```
DATABASE_PATH=/srv/data/portfolio/portfolio.db PORTFOLIO_BACKUP_DIR=/srv/backups/portfolio npm run db:backup
```

Restore a backup:

```
DATABASE_PATH=/srv/data/portfolio/portfolio.db PORTFOLIO_BACKUP_DIR=/srv/backups/portfolio node ./scripts/restore-db.mjs --force /srv/backups/portfolio/portfolio-2024-xx-xx.db
```

The restore script requires an explicit `--force` flag or `FORCE_RESTORE=true` to prevent accidental overwrites.

To validate the database after restoration, run:

```
sqlite3 /srv/data/portfolio/portfolio.db 'PRAGMA integrity_check;'
```

## Ubuntu deployment notes

1. Create the application, data, and backup directories.
2. Assign ownership to the service account used by the Next.js app.
3. Apply least-privilege permissions.
4. Set the `DATABASE_PATH` and `PORTFOLIO_BACKUP_DIR` environment variables in the service definition.
5. Run `npm install` and `npm run db:init`.
6. Run `npm run build` and restart the service.
7. Verify the project listing and detail pages and confirm the database path remains outside the public web root.

The app should not expose the SQLite file through any HTTP endpoint or static hosting directory.

## Troubleshooting

- If the database path is invalid, the app throws a clear configuration error instead of creating a new database in a surprising location.
- If the directory is missing or not writable, initialize it with the documented setup commands before starting the app.
- If the database is locked, wait for the write to complete or verify that a backup or restore is not running.
- If a project is not showing up, confirm that it was created with `published = 1` and that the slug matches the route.

## Known limitations

- SQLite is a local file-based database intended for a single host. It is appropriate for this self-hosted portfolio but not a replacement for a multi-host database service.
- The project content is read from SQLite for the public portfolio pages, but write operations are intentionally limited to trusted server-side code.
