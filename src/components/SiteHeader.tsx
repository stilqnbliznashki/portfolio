import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="topbar container">
      <Link href="/" className="brand" aria-label="Home">
        JD
      </Link>
      <nav aria-label="Primary navigation" className="nav">
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <a href="/resume.pdf" className="button secondary" target="_blank" rel="noreferrer">
        Resume
      </a>
    </header>
  );
}
