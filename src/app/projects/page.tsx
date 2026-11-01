import Link from 'next/link';
import { ProjectCard } from '@/components/ProjectCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getCategories, getStatuses, getTechnologies, listProjects } from '@/data/projects';

function buildQueryString(currentParams: Record<string, string | string[] | undefined>, key: string, value: string): string {
  const next = new URLSearchParams();

  Object.entries(currentParams).forEach(([paramKey, paramValue]) => {
    if (!paramValue) {
      return;
    }

    if (Array.isArray(paramValue)) {
      paramValue.forEach((entry) => next.append(paramKey, entry));
      return;
    }

    next.set(paramKey, paramValue);
  });

  if (!value || value === 'All') {
    next.delete(key);
  } else {
    next.set(key, value);
  }

  const query = next.toString();
  return query ? `?${query}` : '/projects';
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const category = typeof searchParams?.category === 'string' ? searchParams.category : 'All';
  const status = typeof searchParams?.status === 'string' ? searchParams.status : 'All';
  const technology = typeof searchParams?.technology === 'string' ? searchParams.technology : 'All';
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';

  const allProjects = await listProjects({ published: true, sort: 'featured' });
  const filteredProjects = await listProjects({
    published: true,
    category: category !== 'All' ? category : undefined,
    status: status !== 'All' ? status : undefined,
    technology: technology !== 'All' ? technology : undefined,
    search,
    sort: 'featured',
  });

  const categories = await getCategories();
  const statuses = await getStatuses();
  const technologies = await getTechnologies();

  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="container page-intro section narrow">
        <p className="eyebrow">Projects</p>
        <h1>Builds, experiments, and systems I’ve worked on.</h1>
        <p className="lede">
          A curated collection of projects focused on practical software, developer tooling, self-hosted systems, and thoughtful product work.
        </p>
      </section>

      <section className="container section filters-panel">
        <form method="get" action="/projects" className="filter-row">
          <label className="field">
            <span>Search</span>
            <input type="search" name="search" defaultValue={search} placeholder="Search projects" />
          </label>
          <Link href="/projects" className="button secondary">
            Clear filters
          </Link>
        </form>

        <div className="filter-group">
          <div className="filter-stack">
            <span className="filter-label">Category</span>
            <div className="chip-list">
              {['All', ...categories].map((item) => (
                <Link
                  key={item}
                  href={buildQueryString({ category, status, technology, search }, 'category', item)}
                  className={category === item ? 'chip active' : 'chip'}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="filter-stack">
            <span className="filter-label">Status</span>
            <div className="chip-list">
              {['All', ...statuses].map((item) => (
                <Link
                  key={item}
                  href={buildQueryString({ category, status, technology, search }, 'status', item)}
                  className={status === item ? 'chip active' : 'chip'}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="filter-stack">
            <span className="filter-label">Technology</span>
            <div className="chip-list">
              {['All', ...technologies].map((item) => (
                <Link
                  key={item}
                  href={buildQueryString({ category, status, technology, search }, 'technology', item)}
                  className={technology === item ? 'chip active' : 'chip'}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="results-bar">
          <p>
            Showing <strong>{filteredProjects.length}</strong> of <strong>{allProjects.length}</strong> projects
          </p>
          <div className="active-filters">
            {category !== 'All' && <span>{category}</span>}
            {status !== 'All' && <span>{status}</span>}
            {technology !== 'All' && <span>{technology}</span>}
            {search && <span>{search}</span>}
          </div>
        </div>
      </section>

      <section className="container section">
        {filteredProjects.length ? (
          <div className="project-grid">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No projects match the current filters.</h2>
            <p>Try different keywords, reset the filters, or broaden the technology selection.</p>
            <Link href="/projects" className="button primary">
              Clear all filters
            </Link>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
