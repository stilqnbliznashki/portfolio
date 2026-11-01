import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getFeaturedProjects } from '@/data/projects';

const focusAreas = [
  'Software engineering',
  'Full-stack development',
  'Systems programming',
  'Infrastructure and self-hosting',
];

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects();

  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">Developer · Builder · Engineer</p>
          <h1>Building useful software for real people and real systems.</h1>
          <p className="lede">
            I’m a software developer focused on reliable web platforms, developer tools, and self-hosted systems.
            I design practical products that are maintainable, measurable, and built to last.
          </p>
          <div className="cta-row">
            <Link href="/projects" className="button primary">Explore projects</Link>
            <Link href="/about" className="button secondary">About me</Link>
          </div>
          <div className="social-links">
            <a href="https://github.com/stilqnbliznashki" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Profile summary">
          <div className="panel-card">
            <p className="meta-label">Currently focused on</p>
            <ul>
              {focusAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-header">
          <p className="eyebrow">Featured work</p>
          <h2>Selected projects</h2>
        </div>
        <div className="project-grid">
          {featuredProjects.map((project) => (
            <article key={project.slug} className="project-card">
              <div className="project-meta">
                <span>{project.category}</span>
                <span>{project.status}</span>
              </div>
              <h3>{project.name}</h3>
              <p>{project.shortSummary}</p>
              <ul className="tag-list">
                {project.technologies.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <Link href={`/projects/${project.slug}`} className="inline-link">
                View project →
              </Link>
            </article>
          ))}
        </div>
        <div className="section-footer-link">
          <Link href="/projects">View all projects</Link>
        </div>
      </section>

      <section className="container section focus-section">
        <div className="section-header">
          <p className="eyebrow">Technical focus</p>
          <h2>Core strengths</h2>
        </div>
        <div className="focus-grid">
          {focusAreas.map((area) => (
            <div className="focus-item" key={area}>{area}</div>
          ))}
        </div>
      </section>

      <section className="container section about-preview">
        <div>
          <p className="eyebrow">About</p>
          <h2>I build systems with clarity and intent.</h2>
        </div>
        <p>
          I enjoy turning ambiguous problems into systems that are easy to reason about, easy to maintain, and valuable in the long run.
        </p>
        <Link href="/about" className="inline-link">Read more about me →</Link>
      </section>

      <section className="container section contact-panel">
        <p className="eyebrow">Contact</p>
        <h2>Let’s build something useful.</h2>
        <div className="contact-actions">
          <Link href="/contact" className="button secondary">Ways to reach me</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
