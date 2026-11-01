import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach out to discuss software, systems, product work, or collaboration opportunities.',
};

const contactDetails = [
  { label: 'Email', value: 'hello@example.com', href: 'mailto:hello@example.com' },
  { label: 'Location', value: 'Sofia, Bulgaria' },
];

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com', icon: 'github' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
];

export default function ContactPage() {
  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="container section contact-layout">
        <div className="contact-copy">
          <p className="eyebrow">Contact</p>
          <h1>Let’s talk about systems, products, and useful software.</h1>
          <p className="lede">
            If you are building something thoughtful, want to collaborate, or are looking for a developer who cares about the long-term quality of the work, I’d love to hear from you.
          </p>
          <Link href="/projects" className="button secondary">Browse projects</Link>
        </div>

        <div className="contact-options" aria-label="Contact channels">
          <div className="contact-details">
            {contactDetails.map((detail) => (
              <article key={detail.label} className="contact-card">
                <p className="meta-label">{detail.label}</p>
                {'href' in detail ? (
                  <a href={detail.href} className="contact-value">{detail.value}</a>
                ) : (
                  <p className="contact-value">{detail.value}</p>
                )}
              </article>
            ))}
          </div>

          <section className="contact-card social-card" aria-labelledby="social-heading">
            <h2 className="meta-label" id="social-heading">Social</h2>
            <div className="social-links" aria-label="Social links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  className="social-link"
                  href={social.href}
                  aria-label={social.label}
                  title={social.label}
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.icon === 'github' ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.71 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.15 3.05-1.15.61 1.54.23 2.68.12 2.96.71.78 1.14 1.78 1.14 3.01 0 4.29-2.61 5.23-5.1 5.51.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.88H4.97V9.35h2.96v9.53ZM6.45 8.05a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12.43 10.83h-2.95v-4.64c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.72H9.64V9.35h2.83v1.3h.04c.39-.75 1.36-1.55 2.8-1.55 2.99 0 3.57 1.97 3.57 4.53v5.25Z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
