import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'out');
const customDomain = process.env.PAGES_CUSTOM_DOMAIN?.trim();
const defaultBasePath = process.env.GITHUB_ACTIONS === 'true' && !customDomain ? '/portfolio' : '';
const basePath = normalizeBasePath(process.env.PAGES_BASE_PATH ?? defaultBasePath);
const projectsPath = path.join(root, 'src/data/projects.snapshot.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

if (!Array.isArray(projects) || projects.length === 0) {
  throw new Error('The published project snapshot is empty or invalid.');
}

const projectSlugs = new Set(projects.map((project) => project.slug));

for (const project of projects) {
  if (!project.published || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
    throw new Error(`Invalid or unpublished project in snapshot: ${project.slug}`);
  }
  for (const link of project.links) {
    if (link.href.startsWith('./')) {
      const targetSlug = link.href.slice(2);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(targetSlug) || !projectSlugs.has(targetSlug)) {
        throw new Error(`Invalid internal project link in snapshot: ${link.href}`);
      }
      continue;
    }

    const url = new URL(link.href);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error(`Project links must use HTTP or HTTPS: ${link.href}`);
    }
  }
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.copyFileSync(path.join(root, 'static/styles.css'), path.join(output, 'styles.css'));
fs.copyFileSync(path.join(root, 'static/site.js'), path.join(output, 'site.js'));
fs.copyFileSync(path.join(root, 'public/resume.pdf'), path.join(output, 'resume.pdf'));
fs.copyFileSync(path.join(root, 'public/robots.txt'), path.join(output, 'robots.txt'));
fs.writeFileSync(path.join(output, '404.html'), renderNotFound());

writePage('', 'Portfolio', 'Developer portfolio and project archive.', renderHome());
writePage('about', 'About', 'A brief overview of my background, interests, and way of building software.', renderAbout());
writePage('contact', 'Contact', 'Reach out to discuss software, systems, product work, or collaboration opportunities.', renderContact());
writePage('projects', 'Projects', 'A curated collection of software and systems projects.', renderProjects(projects));

for (const project of projects) {
  writePage(`projects/${project.slug}`, project.name, project.shortSummary, renderProject(project, projects));
}

if (customDomain) {
  if (!/^[a-z0-9.-]+$/i.test(customDomain)) {
    throw new Error('PAGES_CUSTOM_DOMAIN must contain only a hostname.');
  }
  fs.writeFileSync(path.join(output, 'CNAME'), `${customDomain}\n`);
}

console.log(`Built ${projects.length} project pages into ${output}.`);

function normalizeBasePath(value) {
  const base = value.trim().replace(/^\/+|\/+$/g, '');
  if (base && !/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/i.test(base)) {
    throw new Error('PAGES_BASE_PATH must be a URL path without a leading or trailing slash.');
  }
  return base ? `/${base}` : '';
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function href(route) {
  const cleanRoute = route.replace(/^\/+|\/+$/g, '');
  if (!cleanRoute) return `${basePath}/`;
  const suffix = cleanRoute && /\.[a-z0-9]+$/i.test(cleanRoute) ? '' : '/';
  return `${basePath}/${cleanRoute}${suffix}`;
}

function header() {
  return `<header class="topbar container">
    <a href="${href('')}" class="brand" aria-label="Home">SB</a>
    <nav aria-label="Primary navigation" class="nav">
      <a href="${href('')}">Home</a><a href="${href('projects')}">Projects</a>
      <a href="${href('about')}">About</a><a href="${href('contact')}">Contact</a>
    </nav>
    <a href="${href('resume.pdf')}" class="button secondary" target="_blank" rel="noreferrer">Resume</a>
  </header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container footer-inner">
    <a href="${href('')}" class="brand small" aria-label="Home">SB</a>
    <nav aria-label="Footer navigation" class="footer-nav">
      <a href="${href('projects')}">Projects</a><a href="${href('about')}">About</a><a href="${href('contact')}">Contact</a>
    </nav>
    <a href="https://github.com/stilqnbliznashki" target="_blank" rel="noreferrer">GitHub</a>
    <p>© ${new Date().getFullYear()} Stilqn Bliznashki</p>
  </div></footer>`;
}

function layout(title, description, body, route = '') {
  const domain = customDomain || 'stilqnbliznashki.github.io';
  const canonical = `https://${domain}${href(route)}`;
  return `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)} | Portfolio</title>
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="${href('styles.css')}">
  <script defer src="${href('site.js')}"></script>
</head><body><main class="page-shell">${header()}${body}${footer()}</main></body></html>`;
}

function projectCard(project) {
  const searchable = [
    project.name,
    project.shortSummary,
    project.description,
    project.category,
    project.technologies.join(' '),
  ].join(' ').toLowerCase();
  return `<article class="project-card" data-project-card data-category="${escapeHtml(project.category)}"
    data-status="${escapeHtml(project.status)}" data-technologies="${escapeHtml(project.technologies.join('|'))}"
    data-search="${escapeHtml(searchable)}">
    <div class="project-meta"><span>${escapeHtml(project.category)}</span><span>${escapeHtml(project.status)}</span></div>
    <h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.shortSummary)}</p>
    <ul class="tag-list">${project.technologies.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>
    <a href="${href(`projects/${project.slug}`)}" class="inline-link">View project →</a>
  </article>`;
}

function renderHome() {
  const featured = projects.filter((project) => project.featured).slice(0, 3);
  const focus = ['Software engineering', 'Full-stack development', 'Systems programming', 'Infrastructure and self-hosting'];
  return `<section class="hero container"><div class="hero-copy">
    <p class="eyebrow">Developer · Builder · Engineer</p>
    <h1>Building useful software for real people and real systems.</h1>
    <p class="lede">I’m a software developer focused on reliable web platforms, developer tools, and self-hosted systems. I design practical products that are maintainable, measurable, and built to last.</p>
    <div class="cta-row"><a href="${href('projects')}" class="button primary">Explore projects</a><a href="${href('about')}" class="button secondary">About me</a></div>
    <div class="social-links"><a href="https://github.com/stilqnbliznashki" target="_blank" rel="noreferrer">GitHub</a></div>
  </div><div class="hero-panel" aria-label="Profile summary"><div class="panel-card">
    <p class="meta-label">Currently focused on</p><ul>${focus.map((item) => `<li>${item}</li>`).join('')}</ul>
  </div></div></section>
  <section class="container section"><div class="section-header"><p class="eyebrow">Featured work</p><h2>Selected projects</h2></div>
    <div class="project-grid">${featured.map(projectCard).join('')}</div>
    <div class="section-footer-link"><a href="${href('projects')}">View all projects</a></div>
  </section>
  <section class="container section focus-section"><div class="section-header"><p class="eyebrow">Technical focus</p><h2>Core strengths</h2></div>
    <div class="focus-grid">${focus.map((item) => `<div class="focus-item">${item}</div>`).join('')}</div>
  </section>
  <section class="container section about-preview"><div><p class="eyebrow">About</p><h2>I build systems with clarity and intent.</h2></div>
    <p>I enjoy turning ambiguous problems into systems that are easy to reason about, easy to maintain, and valuable in the long run.</p>
    <a href="${href('about')}" class="inline-link">Read more about me →</a>
  </section>
  <section class="container section contact-panel"><p class="eyebrow">Contact</p><h2>Let’s build something useful.</h2>
    <div class="contact-actions"><a href="${href('contact')}" class="button secondary">Ways to reach me</a></div>
  </section>`;
}

function renderAbout() {
  const strengths = [
    'Designing software that is readable and maintainable from the start',
    'Working across product, systems, and infrastructure constraints',
    'Shipping pragmatic tools that solve real operational and product problems',
    'Balancing speed with reliability and long-term clarity',
  ];
  const timeline = [
    ['Now', 'Practical systems and product work', 'I spend most of my time building useful software, refining workflows, and improving how systems are operated.'],
    ['Recent', 'Self-hosting and platform tooling', 'I explore home infrastructure and developer operations with an emphasis on maintainability over complexity.'],
    ['Earlier', 'Product, tooling, and experimentation', 'My work has long combined product thinking with engineering discipline, especially around APIs, interfaces, and operating systems.'],
  ];
  return `<section class="container page-intro section narrow"><p class="eyebrow">About</p><h1>Developer, systems thinker, and builder.</h1>
    <p class="lede">I work at the intersection of software design, systems thinking, and practical delivery. I care about building tools that are useful, maintainable, and easy to trust.</p></section>
  <section class="container section split-panel"><div><h2>What I value</h2></div><div><ul class="check-list">${strengths.map((item) => `<li>${item}</li>`).join('')}</ul></div></section>
  <section class="container section"><div class="section-header"><p class="eyebrow">Approach</p><h2>How I build</h2></div>
    <div class="timeline-grid">${timeline.map(([period, title, body]) => `<article class="timeline-item"><span class="period">${period}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div>
  </section><section class="container section about-cta"><h2>Interested in working together?</h2></section>
  <section class="container section about-cta"><a href="${href('contact')}" class="button primary">Get in touch</a></section>`;
}

function renderContact() {
  return `<section class="container section contact-layout"><div class="contact-copy">
    <p class="eyebrow">Contact</p><h1>Let’s talk about systems, products, and useful software.</h1>
    <p class="lede">If you are building something thoughtful, want to collaborate, or are looking for a developer who cares about the long-term quality of the work, I’d love to hear from you.</p>
    <a href="${href('projects')}" class="button secondary">Browse projects</a>
  </div><div class="contact-options"><div class="contact-details">
    <article class="contact-card"><p class="meta-label">Email</p><a href="mailto:hello@example.com" class="contact-value">hello@example.com</a></article>
    <article class="contact-card"><p class="meta-label">Location</p><p class="contact-value">Sofia, Bulgaria</p></article>
  </div><section class="contact-card social-card" aria-labelledby="social-heading"><h2 class="meta-label" id="social-heading">Social</h2>
    <div class="social-links"><a class="social-link" href="https://github.com/stilqnbliznashki" aria-label="GitHub" title="GitHub" target="_blank" rel="noreferrer">GitHub</a>
    <a class="social-link" href="https://www.linkedin.com/" aria-label="LinkedIn" title="LinkedIn" target="_blank" rel="noreferrer">LinkedIn</a></div>
  </section></div></section>`;
}

function renderProjects(items) {
  const categories = [...new Set(items.map((item) => item.category))].sort();
  const statuses = [...new Set(items.map((item) => item.status))].sort();
  const technologies = [...new Set(items.flatMap((item) => item.technologies))].sort();
  const buttons = (title, values, key) => `<div class="filter-stack"><span class="filter-label">${title}</span><div class="chip-list">
    ${['All', ...values].map((value) => `<button type="button" class="chip${value === 'All' ? ' active' : ''}" data-filter="${key}" data-value="${escapeHtml(value)}" aria-pressed="${value === 'All'}">${escapeHtml(value)}</button>`).join('')}
  </div></div>`;
  return `<section class="container page-intro section narrow"><p class="eyebrow">Projects</p><h1>Builds, experiments, and systems I’ve worked on.</h1>
    <p class="lede">A curated collection of projects focused on practical software, developer tooling, self-hosted systems, and thoughtful product work.</p></section>
  <section class="container section filters-panel"><form data-project-search class="filter-row">
    <label class="field"><span>Search</span><input type="search" name="search" placeholder="Search projects" autocomplete="off"></label>
    <button type="submit" class="button primary">Search</button><button type="button" class="button secondary" data-clear-filters>Clear filters</button>
  </form><div class="filter-group">${buttons('Category', categories, 'category')}${buttons('Status', statuses, 'status')}${buttons('Technology', technologies, 'technology')}</div>
  <div class="results-bar"><p>Showing <strong data-result-count>${items.length}</strong> of <strong>${items.length}</strong> projects</p></div></section>
  <section class="container section"><div class="project-grid">${items.map(projectCard).join('')}</div>
    <div class="empty-state" data-empty-state hidden><h2>No projects match the current filters.</h2><p>Try different keywords, reset the filters, or broaden the technology selection.</p>
    <button type="button" class="button primary" data-clear-filters>Clear all filters</button></div></section>`;
}

function renderProject(project, allProjects) {
  const related = allProjects.filter((item) => item.slug !== project.slug).slice(0, 2);
  const detailList = (title, values, compact = false) => `<div class="detail-section"><h2>${title}</h2><ul class="detail-list${compact ? ' compact' : ''}">${values.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul></div>`;
  const links = project.links.map((link) => {
    if (link.href.startsWith('./')) {
      return `<a href="${href(`projects/${link.href.slice(2)}`)}" class="button secondary">${escapeHtml(link.label)}</a>`;
    }
    return `<a href="${escapeHtml(link.href)}" class="button secondary" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`;
  }).join('');
  return `<section class="container project-detail-header section"><div class="project-overview">
    <p class="eyebrow">${escapeHtml(project.category)}</p><h1>${escapeHtml(project.name)}</h1><p class="lede">${escapeHtml(project.shortSummary)}</p>
    <div class="tag-list">${project.technologies.map((technology) => `<span class="tag">${escapeHtml(technology)}</span>`).join('')}</div><div class="detail-links">${links}</div>
  </div><aside class="project-meta-block"><div><span class="meta-label">Status</span><p>${escapeHtml(project.status)}</p></div>
    <div><span class="meta-label">Period</span><p>${escapeHtml(project.period)}</p></div><div><span class="meta-label">Focus</span><p>${escapeHtml(project.category)}</p></div>
  </aside></section>
  <section class="container detail-grid section"><div class="content-column">
    <div class="detail-section"><h2>Overview</h2>${project.overview.map((text) => `<p>${escapeHtml(text)}</p>`).join('')}</div>
    ${detailList('Problem', project.problem)}${detailList('Key features', project.features)}
  </div><div class="content-column">${detailList('Stack', project.stack, true)}${detailList('Architecture', project.architecture)}${detailList('Challenges', project.challenges)}</div></section>
  <section class="container detail-grid section"><div class="content-column">${detailList('Lessons learned', project.lessons)}</div>
    <div class="content-column"><div class="detail-section"><h2>Current limitations and next steps</h2>
      <ul class="detail-list">${[...project.limitations, ...project.future].map((text) => `<li>${escapeHtml(text)}</li>`).join('')}</ul></div></div>
  </section><section class="container section"><div class="section-header project-nav"><a href="${href('projects')}" class="button secondary">← Back to projects</a></div>
    ${related.length ? `<div class="section-header"><p class="eyebrow">Related work</p><h2>Similar projects</h2></div><div class="project-grid">${related.map(projectCard).join('')}</div>` : ''}
  </section>`;
}

function renderNotFound() {
  return layout('Page not found', 'The requested page could not be found.', `<section class="container page-intro section narrow"><p class="eyebrow">404</p><h1>Page not found.</h1><p class="lede">The page may have moved or the address may be incorrect.</p><a href="${href('')}" class="button primary">Return home</a></section>`, '404.html');
}

function writePage(route, title, description, body) {
  const file = path.join(output, route, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const html = layout(title, description, body, route);
  fs.writeFileSync(file, html);
}
