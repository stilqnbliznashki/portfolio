# Portfolio

The public portfolio is plain HTML, CSS, and JavaScript. GitHub Pages serves the static files generated in `out/`; visitors do not need JavaScript for page navigation, and the project filters work locally in the browser.

## GitHub Pages deployment

The GitHub Actions workflow at `.github/workflows/deploy.yml` builds the static site and deploys `out/` to GitHub Pages. It uses `/portfolio/` as the base path for the repository project site. The build emits standalone pages for Home, About, Contact, the project catalog, and every published project, so direct links and refreshes work without server-side routing.

To use a custom domain:

1. Configure the domain in the repository's Pages settings.
2. Add the repository Actions variable `PAGES_CUSTOM_DOMAIN` with the hostname only (no scheme or path).
3. Configure the domain's DNS for GitHub Pages.

The build then uses the domain root and writes a `CNAME` file into the deployment artifact. Select **GitHub Actions** as the Pages build and deployment source.

## Project data

`src/data/projects.snapshot.json` is the published project snapshot. The build consumes it locally to generate static pages and browser-side project filtering; the deployed site does not connect to SQLite or any backend. Database edits appear publicly only after refreshing and reviewing the snapshot and deploying the update.

On a trusted host with the private database configured:

```
npm ci
cp .env.example .env
# Set DATABASE_PATH in .env to the private SQLite database path.
npm run snapshot:projects
```

Review and commit the updated snapshot. The GitHub Pages workflow does not install dependencies, read `.env`, or require database access.

## Optional SQLite maintenance

SQLite and the database maintenance scripts are not part of the public website runtime. Keep the SQLite database and backups outside the web root, restrict filesystem permissions, and do not expose the database file over a network.

Initialize the database:

```
DATABASE_PATH=/path/to/private/portfolio.db npm run db:init
```

Back up the database:

```
DATABASE_PATH=/path/to/private/portfolio.db PORTFOLIO_BACKUP_DIR=/path/to/private/backups npm run db:backup
```

Restore requires an explicit `--force` flag:

```
DATABASE_PATH=/path/to/private/portfolio.db PORTFOLIO_BACKUP_DIR=/path/to/private/backups node ./scripts/restore-db.mjs --force /path/to/private/backups/portfolio-backup.db
```

`.env`, SQLite files, backups, sidecars, and private-key files are excluded by `.gitignore`. `.env.example` contains placeholders only.

## Local checks

```
npm run lint
npm run build
```

The build output is `out/`. Preview a repository-site build locally with:

```
PAGES_BASE_PATH=/portfolio npm run build
```

Then serve `out/` with any static-file server and open it under `/portfolio/`.

## Deployment and backend limitations

GitHub Pages is static hosting; it does not run Next.js, API routes, server actions, database connections, or authentication services. Project pages use the checked-in snapshot, not live backend data.

There is no backend API in this repository. If a live-data feature is added later, it needs a separately hosted HTTPS API with appropriate authentication and authorization, input validation, strict CORS allowlisting, rate limiting, and generic error responses. The SQLite database must remain private and accessible only to the backend service.
