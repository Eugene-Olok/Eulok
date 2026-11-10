/**
 * Service Documentation & FAQ Search Index for Contact & Intake
 */

export interface FAQItem {
  id: string;
  category: 'Pricing & Scope' | 'Integrations' | 'Security & Ownership' | 'Rescue & Reliability' | 'Delivery';
  question: string;
  answer: string;
  tags: string[];
  serviceLink?: {
    label: string;
    page: string;
  };
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'scope-pricing',
    category: 'Pricing & Scope',
    question: 'How is project scope and pricing determined?',
    answer: 'We do not bill on open-ended hourly rates without a cap. Every project begins with a deterministic Scope of Work (SOW) defining clear deliverables, dependencies, and exclusions. Payment is structured around verifiable milestones: 40% upon scope agreement, 30% upon passing staging acceptance gates, and 30% upon production deployment and artifact handover.',
    tags: ['pricing', 'cost', 'sow', 'scope', 'milestones', 'rates', 'budget', 'estimate'],
    serviceLink: {
      label: 'Use Scoping Studio',
      page: 'scope-calculator',
    },
  },
  {
    id: 'momo-reconciliation',
    category: 'Integrations',
    question: 'How do you handle Mobile Money (MTN MoMo & Airtel) reconciliation?',
    answer: 'Our reconciliation core executes formal matching rules R1 through R8 with exact integer arithmetic, matching carrier transactions against receivables obligations. It handles duplicate webhook retries, isolates refunds and reversals, and preserves an immutable audit trail without model guessing.',
    tags: ['momo', 'mtn', 'airtel', 'reconciliation', 'mobile money', 'payments', 'idempotency', 'ledger'],
    serviceLink: {
      label: 'Explore Reconciliation Demo',
      page: 'ops-suite',
    },
  },
  {
    id: 'efris-integration',
    category: 'Integrations',
    question: 'Do you support URA EFRIS electronic invoicing integration?',
    answer: 'Yes. We integrate business ERPs, POS software, and internal databases with URA\'s Electronic Fiscal Receipting and Invoicing System (EFRIS) using signed JSON/XML payloads, local cryptographic key validation, and resilient offline queueing to keep retail checkout moving during internet outages.',
    tags: ['efris', 'ura', 'tax', 'invoicing', 'fiscal', 'compliance', 'uganda', 'vat'],
    serviceLink: {
      label: 'View Finance Integrations',
      page: 'services/finance-integrations',
    },
  },
  {
    id: 'code-ownership',
    category: 'Security & Ownership',
    question: 'What is your policy on code ownership and IP handover?',
    answer: 'Clients retain 100% intellectual property ownership of all custom software, database schemas, deployment configurations, and documentation created for their engagement. We hand over the complete Git repository with operational runbooks. We never withhold credentials or trap clients in proprietary lock-in.',
    tags: ['ip', 'ownership', 'code', 'git', 'handover', 'license', 'vendor lock-in', 'credentials'],
    serviceLink: {
      label: 'Read Delivery Standards',
      page: 'standards',
    },
  },
  {
    id: 'software-rescue',
    category: 'Rescue & Reliability',
    question: 'How does Software Rescue work for stalled or broken systems?',
    answer: 'When a previous developer leaves or an existing build is unstable, we do not force an immediate expensive rewrite. We perform systematic triage: isolate failing endpoints, establish automated regression test gates around working critical paths, sanitize database migrations, and modernize the system incrementally.',
    tags: ['rescue', 'broken', 'legacy', 'stalled', 'abandoned', 'triage', 'bugs', 'crashes', 'contractor'],
    serviceLink: {
      label: 'Software Rescue Methodology',
      page: 'rescue',
    },
  },
  {
    id: 'data-confidentiality',
    category: 'Security & Ownership',
    question: 'How is confidential client data protected during scoping and intake?',
    answer: 'We operate strictly within the Uganda Data Protection and Privacy Act 2019 (DPPA) and ISO/IEC 27001 data isolation principles. Confidential client source code and restricted financial data are never ingested into free or unapproved model providers. Passwords and live tokens should never be submitted via initial intake web forms.',
    tags: ['confidentiality', 'privacy', 'security', 'dppa', 'nda', 'pii', 'credentials', 'tokens'],
    serviceLink: {
      label: 'Security & RFC 9116 Policy',
      page: 'security',
    },
  },
  {
    id: 'acceptance-gates',
    category: 'Delivery',
    question: 'What is the EULOK Release Verification Standard?',
    answer: 'Before any system is handed over or declared complete, it must satisfy our deterministic verification framework covering performance budgets (sub-second mobile FCP), full WCAG 2.2 AA accessibility, fail-closed security headers, input sanitization, and automated regression test suites.',
    tags: ['gates', 'verification', 'testing', 'qa', 'acceptance', 'wcag', 'performance', 'lighthouse'],
    serviceLink: {
      label: 'Inspect Release Verification Standard',
      page: 'verification',
    },
  },
  {
    id: 'timelines-cadence',
    category: 'Delivery',
    question: 'What are typical delivery timelines and engineering cadences?',
    answer: 'Standard marketing platforms and web apps typically deliver within 2–4 weeks. Custom operational dashboards and internal portals take 4–8 weeks. Enterprise reconciliation engines and multi-rail payment integrations run 6–10 weeks depending on carrier sandbox readiness and compliance sign-offs.',
    tags: ['timeline', 'duration', 'weeks', 'schedule', 'cadence', 'sprint', 'fast', 'deadlines'],
    serviceLink: {
      label: 'Estimate Timeline in Scoping Studio',
      page: 'scope-calculator',
    },
  },
  {
    id: 'offline-first',
    category: 'Rescue & Reliability',
    question: 'Can you build systems that function under poor or intermittent internet?',
    answer: 'Yes. For field operations, retail stores, and school portals in East Africa, we engineer offline-first architectures using local IndexedDB caching, background service worker synchronization, and optimistic UI updates that seamlessly sync when connectivity resumes.',
    tags: ['offline', 'low bandwidth', 'network', '3g', 'connectivity', 'sync', 'intermittent', 'cache'],
    serviceLink: {
      label: 'Performance Builds Overview',
      page: 'services/performance-builds',
    },
  },
];

export const FAQ_CATEGORIES = [
  'All',
  'Pricing & Scope',
  'Integrations',
  'Security & Ownership',
  'Rescue & Reliability',
  'Delivery',
] as const;

export type FAQCategory = (typeof FAQ_CATEGORIES)[number];

/**
 * Filter FAQs deterministically by search query and category.
 */
export function filterFaqs(query: string, category: string = 'All'): FAQItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return FAQ_ITEMS.filter((item) => {
    // Check category match
    if (category !== 'All' && item.category !== category) {
      return false;
    }

    // If query is empty, return all matching category
    if (!normalizedQuery) {
      return true;
    }

    // Match question, answer, category, or tags
    const questionMatch = item.question.toLowerCase().includes(normalizedQuery);
    const answerMatch = item.answer.toLowerCase().includes(normalizedQuery);
    const categoryMatch = item.category.toLowerCase().includes(normalizedQuery);
    const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    return questionMatch || answerMatch || categoryMatch || tagMatch;
  });
}
