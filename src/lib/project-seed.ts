export type ProjectStatus = 'In Progress' | 'Completed' | 'Exploration' | 'Archived';

export type ProjectSeed = {
  slug: string;
  name: string;
  shortSummary: string;
  description: string;
  category: string;
  status: ProjectStatus;
  period: string;
  featured: boolean;
  technologies: string[];
  links: Array<{ label: string; href: string }>;
  overview: string[];
  problem: string[];
  features: string[];
  stack: string[];
  architecture: string[];
  challenges: string[];
  lessons: string[];
  limitations: string[];
  future: string[];
};

export const seedProjects: ProjectSeed[] = [
  {
    slug: 'nitro-tunnel',
    name: 'Nitro Tunnel',
    shortSummary: 'A compact tunneling utility for secure local service access and debugging.',
    description:
      'Nitro Tunnel is a small utility for forwarding local services through tunnels, designed for quick iteration on dev environments and self-hosted apps.',
    category: 'Developer Tools',
    status: 'Completed',
    period: '2024 — Present',
    featured: true,
    technologies: ['Go', 'TLS', 'Linux', 'CLI'],
    links: [
      { label: 'Repository', href: 'https://github.com/example/nitro-tunnel' },
      { label: 'Docs', href: 'https://example.com/docs/nitro-tunnel' },
    ],
    overview: [
      'The project was born out of a recurring problem: exposing local services for testing or demonstration without compromising security or adding a lot of operational friction.',
      'Nitro Tunnel focuses on a minimal, robust command-line experience and a clear mental model for port forwarding and secure access.',
    ],
    problem: [
      'Developers often need to share a local app with teammates or external clients, but typical tooling either requires a lot of configuration or adds unnecessary complexity.',
      'The goal was to provide a simple, reliable tool that works well on Linux hosts and lives comfortably in a self-hosted workflow.',
    ],
    features: [
      'Single-command local port forwarding with optional custom hostnames',
      'Transport-layer security with TLS configuration and certificate support',
      'Environment-based configuration and simple runtime logging',
      'Lightweight profiles for local development and staging workflows',
    ],
    stack: ['Go', 'net/http', 'OpenSSL', 'Linux systemd'],
    architecture: [
      'The tool is structured around a small runtime loop that manages tunnel sessions, health checks, and connection lifecycle management.',
      'Configuration is intentionally plain and predictable, with runtime state kept lean so it remains easy to debug when the environment changes.',
    ],
    challenges: [
      'Balancing simplicity with security and resilience required careful decisions around connection teardown and identity handling.',
      'Testing edge cases around interrupted sessions and TLS negotiation was essential to keep the tool dependable in real deployment scenarios.',
    ],
    lessons: [
      'CLI tools most often succeed when they make the “happy path” obvious and the failure modes explicit.',
      'Even small projects benefit from clear process boundaries and a few well-placed abstractions.',
    ],
    limitations: [
      'The project is still intentionally narrow in scope; it does not yet try to replace dedicated enterprise networking stacks.',
      'Observability features are deliberately limited to keep the tool fast and easy to run in a developer environment.',
    ],
    future: [
      'Add richer metrics for tunnel health and throughput analysis',
      'Support a more flexible configuration model for multiple tunnel profiles',
    ],
  },
  {
    slug: 'home-lab-ops',
    name: 'Home Lab Ops',
    shortSummary: 'A set of operational dashboards and scripts for self-hosting services at home.',
    description:
      'Home Lab Ops bundles monitoring, maintenance scripts, and deployment notes into a practical self-hosting toolkit for services I regularly run and maintain.',
    category: 'Infrastructure and Self-Hosting',
    status: 'In Progress',
    period: '2023 — Present',
    featured: true,
    technologies: ['Docker', 'Nginx', 'Bash', 'Linux'],
    links: [
      { label: 'Repository', href: 'https://github.com/example/home-lab-ops' },
      { label: 'Runbook', href: 'https://example.com/runbooks/home-lab' },
    ],
    overview: [
      'This project is a practical approach to running a self-hosted stack without relying on fragile “just works” scripts or opaque infrastructure.',
      'It is designed around repeatability: each service should be easy to rebuild, upgrade, or observe without guessing at the current state.',
    ],
    problem: [
      'Running a handful of services on a home server quickly turns into a maintenance puzzle without logs, backups, and a clear deployment process.',
      'I wanted an environment where traffic, backups, and upgrades were predictable enough to be sustainable over time.',
    ],
    features: [
      'Docker service inventory and launch scripts for core applications',
      'Backups and restore notes for data-heavy services',
      'Nginx reverse proxy configuration for routing and TLS termination',
      'Operational reminders and maintenance checklist for recurring issues',
    ],
    stack: ['Docker Compose', 'Nginx', 'Bash', 'Uptime Kuma'],
    architecture: [
      'The system is organized around a small home server with managed service groups, public proxying, and transparent monitoring.',
      'Separation between data services, proxies, and tooling makes it easier to reason about outages and perform upgrades with minimal surprise.',
    ],
    challenges: [
      'Resilience is a tradeoff in a home environment, so the project emphasizes observability and reproducibility over maximum automation.',
      'Moving from ad hoc configuration to a calmer operational model required a lot of small workflow improvements.',
    ],
    lessons: [
      'System design in small infrastructure contexts is often about reducing hidden dependencies more than adding features.',
      'A good runbook adds value as soon as the environment needs to be recovered under stress.',
    ],
    limitations: [
      'It is a personal setup and not a turnkey SaaS platform.',
      'Some automation is intentionally conservative due to the complexity of self-managed services.',
    ],
    future: [
      'Add deployment playbooks for more services',
      'Expand monitoring and alerting for disk, network, and uptime drift',
    ],
  },
  {
    slug: 'signal-board',
    name: 'Signal Board',
    shortSummary: 'An internal dashboard for monitoring queues, health, and operational events.',
    description:
      'Signal Board is a dashboard concept for observing service health, queue activity, and operational signals in one place.',
    category: 'Full-Stack Applications',
    status: 'Completed',
    period: '2022 — 2023',
    featured: false,
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
    links: [
      { label: 'Repository', href: 'https://github.com/example/signal-board' },
      { label: 'Demo', href: 'https://example.com/demo/signal-board' },
    ],
    overview: [
      'The project emerged from the need to observe a growing set of asynchronous platform events without constantly checking multiple consoles and dashboards.',
      'Signal Board tries to present operational data in a form that is useful to both engineers and product owners.',
    ],
    problem: [
      'Operational visibility often becomes fragmented because each subsystem has its own logs, metrics, and queue insights.',
      'I wanted a single place for key context, especially when troubleshooting user-facing issues or rollout regressions.',
    ],
    features: [
      'Queue health and throughput summaries',
      'Service event timeline and alert grouping',
      'Simple role-based access for internal use',
      'Configurable filters for environment and service group',
    ],
    stack: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
    architecture: [
      'The frontend aggregates status information from a small API layer and a message backlog, while the backend keeps the dataset readable and queryable.',
      'Caching and batched reads make the dashboard responsive even when event volume is uneven.',
    ],
    challenges: [
      'Designing a useful hierarchy of signals without overwhelming the user was the biggest challenge.',
      'I had to be disciplined about which information belonged in the dashboard and which belonged in logs or dedicated monitoring tools.',
    ],
    lessons: [
      'Operational software becomes valuable when it answers the next question without requiring a full investigation.',
      'Small UI patterns like grouping and filtering dramatically improve how people make decisions under time pressure.',
    ],
    limitations: [
      'The dashboard was intentionally tuned for internal workflows and does not try to be a generic enterprise APM suite.',
      'The data model is still intentionally simple.',
    ],
    future: [
      'Expand into trend analysis and service-level summaries',
      'Add richer alerting logic for anomalous traffic patterns',
    ],
  },
  {
    slug: 'synth-circuit',
    name: 'Synth Circuit',
    shortSummary: 'A small embedded project for programmable sensor inputs and physical interfaces.',
    description:
      'Synth Circuit explores hardware-driven interaction design with a lightweight control loop and a simple interface for experimentation.',
    category: 'Embedded and Electronics',
    status: 'Exploration',
    period: '2021 — 2022',
    featured: false,
    technologies: ['C++', 'Arduino', 'Sensors', 'Electronics'],
    links: [
      { label: 'Repository', href: 'https://github.com/example/synth-circuit' },
      { label: 'Notes', href: 'https://example.com/notes/synth-circuit' },
    ],
    overview: [
      'This project blends software and hardware concerns in a way that helps me reason about interfaces, timing, and system composition.',
      'It is a play area for physical interaction patterns, minimal control loops, and sensor-driven behavior.',
    ],
    problem: [
      'Many experiments in electronics are either too expensive or too high-friction to iterate quickly on meaningful interaction ideas.',
      'The goal was to keep the project small enough to debug but structured enough to be reusable for future prototypes.',
    ],
    features: [
      'Input channels with sensor calibration and filtering',
      'Simple control logic for interaction states',
      'Debug output and serial monitoring for validation',
      'Modular hardware layout for iterative experimentation',
    ],
    stack: ['C++', 'Arduino', 'Sensors', 'PCB prototyping'],
    architecture: [
      'The system uses a small loop where sensor input, configuration state, and output actuation remain loosely coupled enough to evolve without reworking the entire design.',
      'The software is intentionally simple so the hardware constraints remain visible and understandable.',
    ],
    challenges: [
      'Noise, timing drift, and calibration issues made the implementation more subtle than expected.',
      'Small physical variations affected behaviour enough that software assumptions had to be revisited frequently.',
    ],
    lessons: [
      'Embedded systems often succeed when the interfaces are explicit and the debugging path is short.',
      'Sensor and actuator design is as much about constraints as it is about ideas.',
    ],
    limitations: [
      'The project remains a prototype and not a full production-ready product.',
      'It is still best used as a learning and prototyping platform rather than a deployment target.',
    ],
    future: [
      'Explore richer calibration tooling',
      'Transition from breadboard prototypes to more stable enclosure design',
    ],
  },
  {
    slug: 'atlas-cache',
    name: 'Atlas Cache',
    shortSummary: 'A low-level caching and retrieval prototype for metadata-heavy workloads.',
    description:
      'Atlas Cache is a prototype for managing cache layers and retrieval policies in a compact, predictable system design.',
    category: 'Systems Programming',
    status: 'Archived',
    period: '2020 — 2021',
    featured: false,
    technologies: ['Rust', 'Systems', 'Data Structures', 'Benchmarking'],
    links: [{ label: 'Repository', href: 'https://github.com/example/atlas-cache' }],
    overview: [
      'This project was a deliberate exercise in low-level systems thinking: how to keep data retrieval fast without making the code complex or unpredictable.',
      'It focuses on the tradeoffs between access patterns, cache invalidation, and predictable performance.',
    ],
    problem: [
      'Caches are easy to add in a naive way but harder to make reliable under pressure, especially when object lifetimes and invalidation rules shift.',
      'I wanted to understand the costs and constraints of a small but realistic caching layer in code.',
    ],
    features: [
      'Composable caching policies',
      'Transparent invalidation hooks and metadata tracking',
      'Benchmark harness for workload comparisons',
      'Performance-oriented data representation decisions',
    ],
    stack: ['Rust', 'Criterion', 'Hash maps', 'Benchmarking'],
    architecture: [
      'The design keeps the cache logic independent from retrieval code, which makes it easier to evaluate policies and compare tradeoffs in isolation.',
      'This approach also made it easier to see how safety and performance constraints interact in a low-level implementation.',
    ],
    challenges: [
      'The hardest part was not writing the cache itself, but designing a small enough set of invariants to reason about under stress.',
      'Performance measurement surfaced a lot of assumptions about what “fast” meant in practice.',
    ],
    lessons: [
      'Systems work is often about disciplined constraints rather than cleverness.',
      'It is far easier to optimize a small well-understood component than a broad and fuzzy abstraction.',
    ],
    limitations: [
      'The project was intentionally exploratory and does not represent a production-ready service layer.',
      'It remains useful as a reference for design tradeoffs and system thinking more than as a consumer-facing product.',
    ],
    future: [
      'Revisit the design with stronger concurrency models',
      'Explore more realistic eviction and persistence policies',
    ],
  },
];
