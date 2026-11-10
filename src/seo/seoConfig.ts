import type { PageSEOConfig } from './types.ts';

export const SITE_NAME = 'EULOK';
export const SITE_URL = 'https://eulok.com';
export const DEFAULT_OG_IMAGE = 'https://eulok.com/og-image.png';

export const SEO_PAGE_CONFIGS: Record<string, PageSEOConfig> = {
  home: {
    pageId: 'home',
    title: 'EULOK — Independent Software Engineering',
    description:
      'Independent software engineering for Uganda and worldwide. High-performance web apps, payment APIs, software rescue, and deterministic reconciliation.',
    keywords: [
      'software engineering Uganda',
      'deterministic reconciliation',
      'EFRIS integration',
      'mobile money API',
      'performance web development',
      'software rescue',
    ],
    canonicalPath: '/',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'EULOK — Independent Software Engineering Systems',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://eulok.com/#organization',
          name: 'EULOK',
          url: 'https://eulok.com',
          logo: 'https://eulok.com/logo.png',
          description:
            'Independent software engineering studio specializing in deterministic financial reconciliation, EFRIS integrations, and mission-critical web applications.',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Kampala',
            addressCountry: 'UG',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            telephone: '+256-784-000-000',
            availableLanguage: ['English', 'Luganda'],
          },
        },
        {
          '@type': 'WebSite',
          '@id': 'https://eulok.com/#website',
          url: 'https://eulok.com',
          name: 'EULOK',
          publisher: {
            '@id': 'https://eulok.com/#organization',
          },
        },
      ],
    },
  },

  services: {
    pageId: 'services',
    title: 'Services & Architecture — EULOK Systems',
    description:
      'Explore production software engineering services: deterministic reconciliation, financial integrations, performance web systems, and system rescue.',
    keywords: [
      'custom software engineering',
      'deterministic reconciliation service',
      'EFRIS fiscalization Uganda',
      'system modernization',
      'API integration',
    ],
    canonicalPath: '/services',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'EULOK Engineering Services and Architecture',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          serviceType: 'Software Engineering Services',
          provider: {
            '@type': 'Organization',
            name: 'EULOK',
            url: 'https://eulok.com',
          },
          areaServed: 'Worldwide',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Engineering Services',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Deterministic Financial Reconciliation',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Finance & EFRIS Integrations',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Performance Builds & Systems',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Software Rescue & Modernization',
                },
              },
            ],
          },
        },
      ],
    },
  },

  'services/performance-builds': {
    pageId: 'services/performance-builds',
    title: 'Performance Builds & Systems — EULOK',
    description:
      'High-performance web architecture, zero-bloat React builds, and sub-second latency engineering engineered for maximum speed, uptime, and reliability.',
    keywords: [
      'high performance web apps',
      'React optimization',
      'sub-second latency engineering',
      'production grade frontend',
      'Kampala software speed',
    ],
    canonicalPath: '/services/performance-builds',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'High-Performance Web Builds & Systems by EULOK',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'High-Performance Web Systems Engineering',
      provider: {
        '@type': 'Organization',
        name: 'EULOK',
        url: 'https://eulok.com',
      },
      description:
        'Custom web applications engineered with zero runtime bloat, sub-second responses, and guaranteed 99.9% uptime architectures.',
    },
  },

  'services/finance-integrations': {
    pageId: 'services/finance-integrations',
    title: 'Finance & EFRIS Integrations — EULOK',
    description:
      'Production-grade financial integrations: Uganda EFRIS fiscalization, MTN & Airtel Mobile Money, and bank APIs built with zero-loss audit trails.',
    keywords: [
      'URA EFRIS integration',
      'MTN mobile money API Uganda',
      'Airtel money developer API',
      'Uganda banking integrations',
      'fiscal compliance software',
    ],
    canonicalPath: '/services/finance-integrations',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Uganda EFRIS & Mobile Money Integrations by EULOK',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Financial and EFRIS Fiscalization Integrations',
      provider: {
        '@type': 'Organization',
        name: 'EULOK',
        url: 'https://eulok.com',
      },
      description:
        'Direct automated integration into URA EFRIS fiscal systems, telecom mobile money gateways, and commercial bank webhooks.',
    },
  },

  'services/reconciliation': {
    pageId: 'services/reconciliation',
    title: 'Deterministic Reconciliation — EULOK',
    description:
      'Deterministic financial reconciliation engine for automated matching, multi-rail settlement, double-entry ledgers, and zero-loss ledger auditing.',
    keywords: [
      'automated bank reconciliation',
      'deterministic reconciliation engine',
      'mobile money settlement Uganda',
      'audit ledger software',
      'financial operations platform',
    ],
    canonicalPath: '/services/reconciliation',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Deterministic Financial Reconciliation Engine by EULOK',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'EULOK Deterministic Reconciliation Engine',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      description:
        'High-throughput financial matching engine with 8 deterministic rules, automated multi-rail settlement, and verifiable audit logging.',
    },
  },

  rescue: {
    pageId: 'rescue',
    title: 'Software Rescue & Modernization — EULOK',
    description:
      'Stabilize failing codebases, eliminate technical debt, restore missing test suites, and migrate legacy infrastructure to maintainable architectures.',
    keywords: [
      'software rescue Uganda',
      'codebase recovery',
      'legacy migration',
      'eliminate technical debt',
      'fix broken production systems',
    ],
    canonicalPath: '/rescue',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Software Rescue and Codebase Modernization by EULOK',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Production Software Rescue and Turnaround',
      provider: {
        '@type': 'Organization',
        name: 'EULOK',
        url: 'https://eulok.com',
      },
      description:
        'Rapid turnaround and stabilization for stalled, buggy, or legacy production codebases with test-driven guarantees.',
    },
  },

  work: {
    pageId: 'work',
    title: '6-Stage Delivery Model — How EULOK Works',
    description:
      'Explore our deterministic 6-stage engineering lifecycle: from discovery, specifications, and test-first build to automated verification and release.',
    keywords: [
      'engineering process',
      '6 stage delivery model',
      'fixed price software delivery',
      'verifiable development lifecycle',
      'software specifications',
    ],
    canonicalPath: '/work',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'How EULOK Works - 6-Stage Delivery Model',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'EULOK 6-Stage Deterministic Delivery Lifecycle',
      description:
        'Our proven methodology for delivering verifiable, zero-defect software on time and within agreed scope.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Stage 1: Intake & Feasibility Assessment',
          text: 'Deep technical discovery and scope definition.',
        },
        {
          '@type': 'HowToStep',
          name: 'Stage 2: Deterministic Specification',
          text: 'Architectural blueprints, interface contracts, and acceptance tests.',
        },
        {
          '@type': 'HowToStep',
          name: 'Stage 3: Test-First Implementation',
          text: 'Production development governed by automated test harnesses.',
        },
        {
          '@type': 'HowToStep',
          name: 'Stage 4: Automated Verification Gates',
          text: 'Executing the 51-point verification framework across all branches.',
        },
        {
          '@type': 'HowToStep',
          name: 'Stage 5: Client Staging & Proof of Acceptance',
          text: 'Live operational demonstration and contractual sign-off.',
        },
        {
          '@type': 'HowToStep',
          name: 'Stage 6: Production Release & Handoff',
          text: 'Full source code ownership transfer and zero-downtime cutover.',
        },
      ],
    },
  },

  'case-studies': {
    pageId: 'case-studies',
    title: 'Case Studies & Benchmarks — EULOK Systems',
    description:
      'Real-world engineering case studies: high-volume financial reconciliation, mobile money automation, and legacy software turnaround with zero downtime.',
    keywords: [
      'software case studies',
      'reconciliation benchmarks',
      'Uganda tech success stories',
      'fintech integration case study',
      'production systems proof',
    ],
    canonicalPath: '/case-studies',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Production Case Studies and Engineering Proof by EULOK',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'EULOK Engineering Case Studies & Benchmarks',
      description:
        'Verifiable production case studies demonstrating real-world speed, reliability, and accuracy across financial systems.',
    },
  },

  insights: {
    pageId: 'insights',
    title: 'Engineering Notes & RFCs — EULOK Systems',
    description:
      'Technical papers and architectural RFCs on deterministic state machines, high-throughput financial pipelines, and modern distributed system design.',
    keywords: [
      'software engineering blog',
      'architectural RFCs',
      'deterministic state machines',
      'distributed systems Kampala',
      'engineering philosophy',
    ],
    canonicalPath: '/insights',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Engineering Notes and Architectural Papers by EULOK',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'EULOK Engineering Notes & RFCs',
      description:
        'In-depth architectural publications on state machines, reconciliation math, and resilient software design.',
    },
  },

  verification: {
    pageId: 'verification',
    title: 'Release Verification Standard — EULOK Systems',
    description:
      'Deterministic release verification methodology and architectural acceptance criteria ensuring verifiable security, reliability, and zero defects.',
    keywords: [
      'release verification standard',
      'release gates',
      'deterministic testing',
      'zero defect software',
      'FAANG grade software standards',
    ],
    canonicalPath: '/verification',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Deterministic Release Verification Standard by EULOK',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'The EULOK Deterministic Release Verification Standard',
      description:
        'A comprehensive deterministic verification framework for testing, security, accessibility, and operational integrity.',
    },
  },

  about: {
    pageId: 'about',
    title: 'About EULOK — Engineering Position & Values',
    description:
      "Learn about EULOK's founding engineering principles: deterministic systems, uncompromised craft, single-engineer accountability, and client autonomy.",
    keywords: [
      'about EULOK',
      'software engineering studio',
      'founder accountability',
      'deterministic engineering',
      'Ugandan tech leadership',
    ],
    canonicalPath: '/about',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'About EULOK Software Engineering',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About EULOK — Engineering Position & Values',
      description:
        'EULOK is an independent software engineering practice founded on deterministic verification, client autonomy, and uncompromised craft.',
    },
  },

  contact: {
    pageId: 'contact',
    title: 'Direct Project Intake & Inquiries — EULOK',
    description:
      'Initiate project intake with senior engineering leadership. Get fixed-scope estimates, architecture reviews, and production systems guidance today.',
    keywords: [
      'hire software engineer Uganda',
      'project intake form',
      'software architecture consultation',
      'fixed scope software quote',
      'contact EULOK',
    ],
    canonicalPath: '/contact',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Project Intake and Contact EULOK',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Direct Project Intake & Architectural Inquiries',
      description:
        'Get in touch directly with lead engineering for software specifications, financial integrations, and system modernization.',
    },
  },

  standards: {
    pageId: 'standards',
    title: 'Delivery Commitments & SLAs — EULOK Systems',
    description:
      'Our binding engineering covenants: 100% source code ownership, deterministic test suites, strict confidentiality, and transparent fixed-price quotes.',
    keywords: [
      'software engineering standards',
      'delivery SLA',
      'source code ownership',
      'fixed price guarantee',
      'client confidentiality agreement',
    ],
    canonicalPath: '/standards',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'EULOK Delivery Commitments and Engineering Standards',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'EULOK Delivery Commitments & Engineering Standards',
      description:
        'Our public commitments to source code ownership, test-driven delivery, and non-disclosure standards.',
    },
  },

  security: {
    pageId: 'security',
    title: 'Security Policy & RFC 9116 — EULOK Systems',
    description:
      'Read EULOK security architecture, vulnerability disclosure guidelines under RFC 9116, data classification protocols, and strict client data isolation.',
    keywords: [
      'security policy',
      'RFC 9116 security.txt',
      'vulnerability disclosure',
      'client data isolation',
      'zero secrets policy',
    ],
    canonicalPath: '/security',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'EULOK Security Architecture and Vulnerability Disclosure',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'EULOK Security Policy and RFC 9116 Compliance',
      description:
        'Formal security standards, vulnerability reporting instructions, and data classification protocols.',
    },
  },

  privacy: {
    pageId: 'privacy',
    title: 'Privacy Notice & DPPA Compliance — EULOK',
    description:
      'Our comprehensive privacy commitments under the Uganda Data Protection & Privacy Act 2019 and global data privacy standards for all client systems.',
    keywords: [
      'privacy notice Uganda',
      'DPPA 2019 compliance',
      'data protection policy',
      'data sovereignty',
      'cookie policy',
    ],
    canonicalPath: '/privacy',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'EULOK Privacy Notice and Data Protection Compliance',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'EULOK Privacy Notice & DPPA Compliance',
      description:
        'Privacy compliance and data handling disclosures under the Uganda Data Protection and Privacy Act 2019.',
    },
  },

  accessibility: {
    pageId: 'accessibility',
    title: 'Accessibility Statement & WCAG 2.2 — EULOK',
    description:
      'EULOK accessibility charter conforming to WCAG 2.2 AA standards: keyboard navigation, screen reader support, contrast ratios, and reduced motion.',
    keywords: [
      'accessibility statement',
      'WCAG 2.2 AA compliance',
      'accessible web engineering',
      'screen reader friendly',
      'inclusive software design',
    ],
    canonicalPath: '/accessibility',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'EULOK Accessibility Statement and WCAG 2.2 AA Conformance',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'EULOK Accessibility Statement & WCAG 2.2 Conformance',
      description:
        'Commitment to digital accessibility, keyboard-first navigation, and screen reader compatibility.',
    },
  },

  'ops-suite': {
    pageId: 'ops-suite',
    title: 'Financial Ops & Reconciliation Suite — EULOK',
    description:
      'Interactive financial operations console: live ingestion, deterministic rule matching, exception resolution, and cryptographic audit ledger exports.',
    keywords: [
      'reconciliation operations suite',
      'financial ledger console',
      'MTN Airtel reconciliation',
      'settlement clearing tool',
      'rule engine simulator',
    ],
    canonicalPath: '/ops-suite',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'EULOK Interactive Reconciliation and Financial Ops Suite',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'EULOK Ops Suite — Reconciliation Core',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      description:
        'Interactive financial operations console supporting batch ingestion, deterministic 8-rule matching, exception resolution, and verifiable audit ledgers.',
    },
  },

  'scope-calculator': {
    pageId: 'scope-calculator',
    title: 'Scoping Studio & Feasibility — EULOK Systems',
    description:
      'Model custom software architectures, integration rails, and delivery timelines. Calculate risk scores and generate verifiable engineering contracts.',
    keywords: [
      'software scoping calculator',
      'architecture feasibility tool',
      'technical statement of work',
      'fixed scope software pricing',
      'fintech development timeline',
    ],
    canonicalPath: '/scope-calculator',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'EULOK Interactive Scoping Studio & Architecture Configurator',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'EULOK Scoping Studio & Architecture Configurator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      description:
        'Interactive system modeling and risk calculator delivering deterministic delivery estimates and signed SOW documents.',
    },
  },

  status: {
    pageId: 'status',
    title: 'Live System Health & Status — EULOK Platform',
    description:
      'Real-time edge telemetry, client latency measurements, component architecture topologies, and disaster recovery SLA disclosures for the EULOK platform.',
    keywords: [
      'system status',
      'edge telemetry',
      'live uptime EULOK',
      'zero budget production architecture',
      'service health monitor',
    ],
    canonicalPath: '/status',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'EULOK Live System Health & Edge Telemetry Dashboard',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'EULOK Platform Health & Live Edge Telemetry',
      description:
        'Transparent edge telemetry, engine availability, and disaster recovery SLA disclosures.',
    },
  },

  notFound: {
    pageId: 'notFound',
    title: 'Page Not Found (404) — EULOK Software Engineering',
    description:
      'The page you requested does not exist or may have moved. Check the URL, or use the navigation below to find what you were looking for on the EULOK site.',
    keywords: [],
    canonicalPath: '/404',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'EULOK',
    twitterCard: 'summary_large_image',
    // 404s should never be indexed, and must not inherit the homepage's
    // Organization/WebApplication structured data — a search engine that
    // trusted that markup on a page that explicitly says "not found" is
    // exactly the kind of thing that erodes a site's indexing trust.
    robots: 'noindex, nofollow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: '404 — Page Not Found',
    },
  },
};

/**
 * Returns the PageSEOConfig for any given route, falling back to home page metadata if unmatched.
 *
 * Always returns a fresh copy, never a direct reference into SEO_PAGE_CONFIGS.
 * Callers (Layout.astro, specifically) apply `customTitle`/`customDescription`
 * by mutating the returned object's top-level fields — if this returned the
 * shared singleton directly, that mutation would permanently corrupt the
 * module-level config for every subsequent page rendered in the same
 * process. Astro's static build renders every page in one Node process, so
 * this isn't a theoretical leak: it previously meant 404.astro's
 * `customTitle` (pageId="home") overwrote the real homepage's title for the
 * rest of the build, depending on build order.
 */
export function getPageSEO(pageId: string): PageSEOConfig {
  if (SEO_PAGE_CONFIGS[pageId]) {
    return { ...SEO_PAGE_CONFIGS[pageId] };
  }
  // Fallback with custom pageId
  const fallback = SEO_PAGE_CONFIGS.home;
  return {
    ...fallback,
    pageId,
    canonicalPath: `/${pageId.replace(/^\//, '')}`,
  };
}
