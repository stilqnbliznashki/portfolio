import type { Metadata } from 'next';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'About',
  description: 'A brief overview of my background, interests, and way of building software.',
};

const strengths = [
  'Designing software that is readable and maintainable from the start',
  'Working across product, systems, and infrastructure constraints',
  'Shipping pragmatic tools that solve real operational and product problems',
  'Balancing speed with reliability and long-term clarity',
];

const timeline = [
  { period: 'Now', title: 'Practical systems and product work', body: 'I spend most of my time building useful software, refining workflows, and improving how systems are operated.' },
  { period: 'Recent', title: 'Self-hosting and platform tooling', body: 'I explore home infrastructure and developer operations with an emphasis on maintainability over complexity.' },
  { period: 'Earlier', title: 'Product, tooling, and experimentation', body: 'My work has long combined product thinking with engineering discipline, especially around APIs, interfaces, and operating systems.' },
];

export default function AboutPage() {
  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="container page-intro section narrow">
        <p className="eyebrow">About</p>
        <h1>Developer, systems thinker, and builder.</h1>
        <p className="lede">
          I work at the intersection of software design, systems thinking, and practical delivery. I care about building tools that are useful, maintainable, and easy to trust.
        </p>
      </section>

      <section className="container section split-panel">
        <div>
          <h2>What I value</h2>
        </div>
        <div>
          <ul className="check-list">
            {strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container section">
        <div className="section-header">
          <p className="eyebrow">Approach</p>
          <h2>How I build</h2>
        </div>
        <div className="timeline-grid">
          {timeline.map((entry) => (
            <article key={entry.title} className="timeline-item">
              <span className="period">{entry.period}</span>
              <h3>{entry.title}</h3>
              <p>{entry.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section about-cta">
        <h2>Interested in working together?</h2>
        <a href="mailto:hello@example.com" className="button primary">hello@example.com</a>
      </section>

      <SiteFooter />
    </main>
  );
}
