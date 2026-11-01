import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <Link href="/" className="brand small" aria-label="Home">
            JD
          </Link>
        </div>
        <nav aria-label="Footer navigation" className="footer-nav">
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <a href="https://github.com" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <p>© {new Date().getFullYear()} Jordan Doe</p>
      </div>
    </footer>
  );
}
