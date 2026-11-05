import fs from 'node:fs';
import path from 'node:path';
import { closeDatabase, getDatabase, resolveDatabasePath } from '../src/lib/db';
import { listProjects } from '../src/lib/project-data';

if (!fs.existsSync(resolveDatabasePath())) {
  throw new Error('The configured SQLite database file does not exist.');
}

try {
  const database = getDatabase();
  const publishedCount = database
    .prepare('SELECT COUNT(*) AS count FROM projects WHERE published = 1')
    .get() as { count: number };

  if (publishedCount.count === 0) {
    throw new Error('No published projects are available to export.');
  }

  const projects = listProjects({ published: true, sort: 'featured' });
  const snapshotPath = path.resolve('src/data/projects.snapshot.json');

  fs.writeFileSync(snapshotPath, `${JSON.stringify(projects, null, 2)}\n`);
  console.log(`Exported ${projects.length} published projects to ${snapshotPath}.`);
} finally {
  closeDatabase();
}
