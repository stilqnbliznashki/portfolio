import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectCard } from '@/components/ProjectCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getProjectBySlug, listProjects, getRelatedProjects } from '@/data/projects';

export async function generateStaticParams() {
  const projects = await listProjects({ published: true, sort: 'featured' });
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: 'Project not found',
    };
  }

  return {
    title: project.name,
    description: project.shortSummary,
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = getRelatedProjects(project.slug, 2);

  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="container project-detail-header section">
        <div className="project-overview">
          <p className="eyebrow">{project.category}</p>
          <h1>{project.name}</h1>
          <p className="lede">{project.shortSummary}</p>
          <div className="tag-list">
            {project.technologies.map((tech) => (
              <span key={tech} className="tag">
                {tech}
              </span>
            ))}
          </div>
          <div className="detail-links">
            {project.links.map((link) => (
              <a key={link.label} href={link.href} className="button secondary" target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <aside className="project-meta-block">
          <div>
            <span className="meta-label">Status</span>
            <p>{project.status}</p>
          </div>
          <div>
            <span className="meta-label">Period</span>
            <p>{project.period}</p>
          </div>
          <div>
            <span className="meta-label">Focus</span>
            <p>{project.category}</p>
          </div>
        </aside>
      </section>

      <section className="container detail-grid section">
        <div className="content-column">
          <div className="detail-section">
            <h2>Overview</h2>
            {project.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="detail-section">
            <h2>Problem</h2>
            <ul className="detail-list">
              {project.problem.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h2>Key features</h2>
            <ul className="detail-list">
              {project.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="content-column">
          <div className="detail-section">
            <h2>Stack</h2>
            <ul className="detail-list compact">
              {project.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h2>Architecture</h2>
            <ul className="detail-list">
              {project.architecture.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h2>Challenges</h2>
            <ul className="detail-list">
              {project.challenges.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container detail-grid section">
        <div className="content-column">
          <div className="detail-section">
            <h2>Lessons learned</h2>
            <ul className="detail-list">
              {project.lessons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="content-column">
          <div className="detail-section">
            <h2>Current limitations and next steps</h2>
            <ul className="detail-list">
              {project.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ul className="detail-list">
              {project.future.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-header project-nav">
          <Link href="/projects" className="button secondary">← Back to projects</Link>
        </div>
        {relatedProjects.length > 0 && (
          <>
            <div className="section-header">
              <p className="eyebrow">Related work</p>
              <h2>Similar projects</h2>
            </div>
            <div className="project-grid">
              {relatedProjects.map((item) => (
                <ProjectCard key={item.slug} project={item} />
              ))}
            </div>
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
