import Link from 'next/link';
import type { Project } from '@/data/projects';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
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
  );
}
