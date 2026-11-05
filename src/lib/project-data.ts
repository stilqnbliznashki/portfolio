import { getDatabase } from './db';
import { seedProjects } from './project-seed';

export type ProjectStatus = 'In Progress' | 'Completed' | 'Exploration' | 'Archived';

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  id: number;
  slug: string;
  name: string;
  shortSummary: string;
  description: string;
  category: string;
  status: ProjectStatus;
  period: string;
  featured: boolean;
  technologies: string[];
  links: ProjectLink[];
  overview: string[];
  problem: string[];
  features: string[];
  stack: string[];
  architecture: string[];
  challenges: string[];
  lessons: string[];
  limitations: string[];
  future: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProjectFilters = {
  category?: string;
  technology?: string;
  status?: string;
  search?: string;
  featured?: boolean;
  published?: boolean;
  sort?: 'featured' | 'newest' | 'oldest' | 'title';
  limit?: number;
  relatedSlug?: string;
};

type ProjectRow = {
  id: number;
  slug: string;
  title: string;
  short_summary: string;
  description: string;
  category: string;
  status: string;
  featured: number;
  published: number;
  start_date: string | null;
  end_date: string | null;
  last_updated: string | null;
  cover_image: string | null;
  repo_url: string | null;
  demo_url: string | null;
  docs_url: string | null;
  links_json: string | null;
  overview_json: string | null;
  problem_json: string | null;
  features_json: string | null;
  stack_json: string | null;
  architecture_json: string | null;
  challenges_json: string | null;
  lessons_json: string | null;
  limitations_json: string | null;
  future_json: string | null;
  created_at: string;
  updated_at: string;
};

function parseJsonArray<T>(jsonValue: string | null | undefined): T[] {
  if (!jsonValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(jsonValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toProject(row: ProjectRow, technologies: string[]): Project {
  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    shortSummary: row.short_summary,
    description: row.description,
    category: row.category,
    status: row.status as ProjectStatus,
    period: [row.start_date, row.end_date].filter(Boolean).join(' — ') || 'Unspecified',
    featured: Boolean(row.featured),
    technologies,
    links: parseJsonArray<ProjectLink>(row.links_json),
    overview: parseJsonArray<string>(row.overview_json),
    problem: parseJsonArray<string>(row.problem_json),
    features: parseJsonArray<string>(row.features_json),
    stack: parseJsonArray<string>(row.stack_json),
    architecture: parseJsonArray<string>(row.architecture_json),
    challenges: parseJsonArray<string>(row.challenges_json),
    lessons: parseJsonArray<string>(row.lessons_json),
    limitations: parseJsonArray<string>(row.limitations_json),
    future: parseJsonArray<string>(row.future_json),
    published: Boolean(row.published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildTechnologyFilterClause(technology: string | undefined, params: unknown[]): string {
  if (!technology) {
    return '';
  }

  params.push(technology);
  return `EXISTS (
    SELECT 1
    FROM project_technologies pt
    JOIN technologies t ON t.id = pt.technology_id
    WHERE pt.project_id = p.id
    AND t.name = ?
  )`;
}

function normalizeSearchTerm(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

function isValidProjectStatus(status: string): status is ProjectStatus {
  return ['In Progress', 'Completed', 'Exploration', 'Archived'].includes(status);
}

export function ensureSeedData(): void {
  const database = getDatabase();
  const row = database.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number } | undefined;
  if ((row?.count ?? 0) > 0) {
    return;
  }

  const insertProject = database.prepare(`
    INSERT INTO projects (
      slug,
      title,
      short_summary,
      description,
      category,
      status,
      featured,
      published,
      start_date,
      end_date,
      last_updated,
      cover_image,
      repo_url,
      demo_url,
      docs_url,
      links_json,
      overview_json,
      problem_json,
      features_json,
      stack_json,
      architecture_json,
      challenges_json,
      lessons_json,
      limitations_json,
      future_json,
      created_at,
      updated_at
    ) VALUES (
      @slug,
      @title,
      @shortSummary,
      @description,
      @category,
      @status,
      @featured,
      1,
      @startDate,
      @endDate,
      @lastUpdated,
      @coverImage,
      @repoUrl,
      @demoUrl,
      @docsUrl,
      @linksJson,
      @overviewJson,
      @problemJson,
      @featuresJson,
      @stackJson,
      @architectureJson,
      @challengesJson,
      @lessonsJson,
      @limitationsJson,
      @futureJson,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      short_summary = excluded.short_summary,
      description = excluded.description,
      category = excluded.category,
      status = excluded.status,
      featured = excluded.featured,
      published = excluded.published,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      last_updated = excluded.last_updated,
      cover_image = excluded.cover_image,
      repo_url = excluded.repo_url,
      demo_url = excluded.demo_url,
      docs_url = excluded.docs_url,
      links_json = excluded.links_json,
      overview_json = excluded.overview_json,
      problem_json = excluded.problem_json,
      features_json = excluded.features_json,
      stack_json = excluded.stack_json,
      architecture_json = excluded.architecture_json,
      challenges_json = excluded.challenges_json,
      lessons_json = excluded.lessons_json,
      limitations_json = excluded.limitations_json,
      future_json = excluded.future_json,
      updated_at = CURRENT_TIMESTAMP
  `);

  const insertTechnology = database.prepare('INSERT OR IGNORE INTO technologies (name) VALUES (?)');
  const assignTechnology = database.prepare('INSERT OR IGNORE INTO project_technologies (project_id, technology_id) VALUES (?, ?)');

  const transaction = database.transaction(() => {
    for (const project of seedProjects) {
      const result = insertProject.run({
        slug: project.slug,
        title: project.name,
        shortSummary: project.shortSummary,
        description: project.description,
        category: project.category,
        status: project.status,
        featured: project.featured ? 1 : 0,
        startDate: project.period?.split(' — ')[0] ?? null,
        endDate: project.period?.split(' — ')[1] ?? null,
        lastUpdated: null,
        coverImage: null,
        repoUrl: project.links.find((link) => link.label.toLowerCase() === 'repository')?.href ?? null,
        demoUrl: project.links.find((link) => link.label.toLowerCase() === 'demo')?.href ?? null,
        docsUrl: project.links.find((link) => link.label.toLowerCase() === 'docs' || link.label.toLowerCase() === 'runbook' || link.label.toLowerCase() === 'notes')?.href ?? null,
        linksJson: JSON.stringify(project.links),
        overviewJson: JSON.stringify(project.overview),
        problemJson: JSON.stringify(project.problem),
        featuresJson: JSON.stringify(project.features),
        stackJson: JSON.stringify(project.stack),
        architectureJson: JSON.stringify(project.architecture),
        challengesJson: JSON.stringify(project.challenges),
        lessonsJson: JSON.stringify(project.lessons),
        limitationsJson: JSON.stringify(project.limitations),
        futureJson: JSON.stringify(project.future),
      });

      const projectRecord = database
        .prepare('SELECT id FROM projects WHERE slug = ?')
        .get(project.slug) as { id: number } | undefined;

      if (!projectRecord) {
        continue;
      }

      for (const technologyName of project.technologies) {
        insertTechnology.run(technologyName);
        const technology = database
          .prepare('SELECT id FROM technologies WHERE name = ?')
          .get(technologyName) as { id: number } | undefined;

        if (technology) {
          assignTechnology.run(projectRecord.id, technology.id);
        }
      }
    }
  });

  transaction();
}

export function listProjects(filters: ProjectFilters = {}): Project[] {
  ensureSeedData();
  const db = getDatabase();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.published !== undefined) {
    conditions.push('p.published = ?');
    params.push(filters.published ? 1 : 0);
  } else {
    conditions.push('p.published = 1');
  }

  if (filters.featured !== undefined) {
    conditions.push('p.featured = ?');
    params.push(filters.featured ? 1 : 0);
  }

  if (filters.category) {
    conditions.push('p.category = ?');
    params.push(filters.category);
  }

  if (filters.status) {
    conditions.push('p.status = ?');
    params.push(filters.status);
  }

  const technologyClause = buildTechnologyFilterClause(filters.technology, params);
  if (technologyClause) {
    conditions.push(technologyClause);
  }

  if (filters.relatedSlug) {
    conditions.push('p.slug != ?');
    params.push(filters.relatedSlug);
  }

  const searchTerm = normalizeSearchTerm(filters.search);
  if (searchTerm) {
    conditions.push(`LOWER(COALESCE(p.title, '') || ' ' || COALESCE(p.short_summary, '') || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.category, '')) LIKE ?`);
    params.push(`%${searchTerm}%`);
  }

  const baseQuery = `
    SELECT p.*
    FROM projects p
    WHERE ${conditions.join(' AND ')}
  `;

  const orderBy = (() => {
    switch (filters.sort) {
      case 'newest':
        return 'ORDER BY p.created_at DESC, p.title ASC';
      case 'oldest':
        return 'ORDER BY p.created_at ASC, p.title ASC';
      case 'title':
        return 'ORDER BY p.title ASC';
      default:
        return 'ORDER BY p.featured DESC, p.created_at DESC, p.title ASC';
    }
  })();

  const query = `${baseQuery} ${orderBy}`;
  const rows = db.prepare(query).all(...params) as ProjectRow[];
  const projectIds = rows.map((row) => row.id);

  const technologiesByProject = new Map<number, string[]>();
  if (projectIds.length > 0) {
    const technologyRows = db
      .prepare(`
        SELECT pt.project_id, t.name
        FROM project_technologies pt
        JOIN technologies t ON t.id = pt.technology_id
        WHERE pt.project_id IN (${projectIds.map(() => '?').join(', ')})
        ORDER BY t.name ASC
      `)
      .all(...projectIds) as Array<{ project_id: number; name: string }>;

    for (const row of technologyRows) {
      const current = technologiesByProject.get(row.project_id) ?? [];
      current.push(row.name);
      technologiesByProject.set(row.project_id, current);
    }
  }

  const projects = rows.map((row) => toProject(row, technologiesByProject.get(row.id) ?? []));

  if (filters.limit && filters.limit > 0) {
    return projects.slice(0, filters.limit);
  }

  return projects;
}

export function getFeaturedProjects(): Project[] {
  return listProjects({ featured: true, published: true, sort: 'featured', limit: 3 });
}

export function getProjectBySlug(slug: string, includeUnpublished = false): Project | null {
  ensureSeedData();
  const db = getDatabase();
  const rows = db
    .prepare(
      `
        SELECT p.*
        FROM projects p
        WHERE p.slug = ?
        ${includeUnpublished ? '' : 'AND p.published = 1'}
      `,
    )
    .all(slug) as ProjectRow[];

  if (rows.length === 0) {
    return null;
  }

  const projectRow = rows[0];
  const technologyRows = db
    .prepare(
      `
        SELECT t.name
        FROM project_technologies pt
        JOIN technologies t ON t.id = pt.technology_id
        WHERE pt.project_id = ?
        ORDER BY t.name ASC
      `,
    )
    .all(projectRow.id) as Array<{ name: string }>;

  return toProject(projectRow, technologyRows.map((row) => row.name));
}

export function getCategories(): string[] {
  ensureSeedData();
  const db = getDatabase();
  const rows = db
    .prepare('SELECT DISTINCT category FROM projects WHERE published = 1 ORDER BY category ASC')
    .all() as Array<{ category: string }>;
  return rows.map((row) => row.category);
}

export function getStatuses(): string[] {
  ensureSeedData();
  const db = getDatabase();
  const rows = db
    .prepare('SELECT DISTINCT status FROM projects WHERE published = 1 ORDER BY status ASC')
    .all() as Array<{ status: string }>;
  return rows.map((row) => row.status).filter(isValidProjectStatus);
}

export function getTechnologies(): string[] {
  ensureSeedData();
  const db = getDatabase();
  const rows = db
    .prepare(`
      SELECT DISTINCT t.name
      FROM technologies t
      JOIN project_technologies pt ON pt.technology_id = t.id
      JOIN projects p ON p.id = pt.project_id
      WHERE p.published = 1
      ORDER BY t.name ASC
    `)
    .all() as Array<{ name: string }>;

  return rows.map((row) => row.name);
}

export function getRelatedProjects(slug: string, limit = 2): Project[] {
  const project = getProjectBySlug(slug, false);
  if (!project) {
    return [];
  }

  return listProjects({
    relatedSlug: slug,
    published: true,
    limit,
    sort: 'featured',
  }).filter((candidate) => {
    if (candidate.slug === slug) {
      return false;
    }

    const sameCategory = candidate.category === project.category;
    const sharedTechnology = project.technologies.some((technology) => candidate.technologies.includes(technology));
    return sameCategory || sharedTechnology;
  });
}

export function findProjectBySlug(slug: string): Project | null {
  return getProjectBySlug(slug, false);
}
