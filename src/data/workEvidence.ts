export type WorkCategoryId =
  | 'all'
  | 'financial'
  | 'software'
  | 'websites'
  | 'automation'
  | 'integrations';

export interface WorkCategory {
  id: WorkCategoryId;
  label: string;
}

export interface TechnicalDemonstrationItem {
  id: string;
  tag: string;
  title: string;
  summary: string;
  problem: string;
  engineeringApproach: string[];
  category: Exclude<WorkCategoryId, 'all'>;
  categories: Exclude<WorkCategoryId, 'all'>[];
  primaryRoute: string;
  primaryCtaLabel: string;
  hasSyntheticLedgerTable?: boolean;
}

export interface TechnicalNoteReference {
  id: string;
  number: string;
  title: string;
  summary: string;
  targetRoute: string;
  category: Exclude<WorkCategoryId, 'all'>;
  categories: Exclude<WorkCategoryId, 'all'>[];
}

export const WORK_CATEGORIES: WorkCategory[] = [
  { id: 'all', label: 'All Work' },
  { id: 'financial', label: 'Financial Systems' },
  { id: 'software', label: 'Business Software' },
  { id: 'websites', label: 'Websites' },
  { id: 'automation', label: 'Automation' },
  { id: 'integrations', label: 'Integrations' },
];

export const TECHNICAL_DEMONSTRATIONS: TechnicalDemonstrationItem[] = [
  {
    id: 'momo-reconciliation',
    tag: 'FINANCIAL SYSTEMS / LEDGER CORE',
    title: 'Mobile-Money Reconciliation Architecture',
    summary:
      'A deterministic rule engine for comparing incoming payment collections against authoritative financial obligations.',
    problem:
      'Payment records arrive through multiple mobile-money gateways (MTN MoMo, Airtel Money) and bank exports with different references, delayed timestamps, and occasional duplicate webhooks. Manual spreadsheet reconciliation causes delayed receipting, unallocated deposits, and revenue leakage.',
    engineeringApproach: [
      'Arbitrary-precision Decimal & integer minor-unit math (eliminating float rounding errors)',
      'Strict deterministic matching rules (R1 exact match, R2 partial allocations)',
      'Duplicate-event detection and conflicting identifier flags',
      'Refunds (R7) and reversals (R8) isolated from automated matching',
      'Explicit human approval queue for proposed matches',
    ],
    category: 'financial',
    categories: ['financial', 'automation', 'integrations'],
    primaryRoute: 'ops-suite',
    primaryCtaLabel: 'Launch Live Interactive Reconciliation Workspace',
    hasSyntheticLedgerTable: true,
  },
  {
    id: 'efris-webhook-resilience',
    tag: 'EAST AFRICA INTEGRATIONS / TAX & WEBHOOKS',
    title: 'URA EFRIS Fiscalization & Idempotent Payment Webhooks',
    summary:
      'Signed offline-tolerant fiscal receipting and distributed idempotency guards built for intermittent Ugandan and regional cellular networks.',
    problem:
      'Retail POS counters, SACCO portals, and merchant backends lose fiscal sync or double-credit customer balances when URA EFRIS endpoints time out or carrier gateways retry identical webhook callbacks.',
    engineeringApproach: [
      'HMAC signature verification rejecting tampered or replayed callbacks fail-closed',
      'Persistent idempotency locks keyed by gateway transaction ID and provider corridor',
      'Offline store-and-forward queue syncing signed invoices automatically when uplink recovers',
      'Deterministic retry windows with dead-letter visibility and manual replay controls',
    ],
    category: 'integrations',
    categories: ['integrations', 'financial', 'automation', 'software'],
    primaryRoute: 'services/finance-integrations',
    primaryCtaLabel: 'Open EFRIS & Webhook Simulation Lab',
  },
  {
    id: 'rescue-static-architecture',
    tag: 'SYSTEM RESCUE & EDGE WEBSITES / DELIVERY',
    title: 'Static-First Edge Architecture & Legacy Codebase Rescue',
    summary:
      'Zero-bloat static pre-rendering engineered for East African 3G/4G cellular latency alongside deterministic triage for stalled software systems.',
    problem:
      'Organizations inherit heavy single-page bundles that stall on mid-range mobile phones in Kampala or Nairobi, or unstable codebases lacking tests, documentation, and clear deployment runbooks.',
    engineeringApproach: [
      'Static-first pre-rendering eliminating runtime hydration overhead on 3G/4G cellular connections',
      '8-point deterministic rescue diagnostic scoring P0, P1, and P2 remediation priorities',
      'Clean boundary separation decoupling core business rules from UI and framework glue',
      'Full client repository and operational runbook ownership with zero vendor lock-in',
    ],
    category: 'websites',
    categories: ['websites', 'software'],
    primaryRoute: 'rescue',
    primaryCtaLabel: 'Run 8-Point Rescue Readiness Diagnostic',
  },
];

export const TECHNICAL_NOTE_REFS: TechnicalNoteReference[] = [
  {
    id: 'deterministic-calc',
    number: 'NOTE 01',
    title: 'Deterministic Calculations',
    summary:
      'Why floating-point arithmetic causes cumulative ledger drift, and why pure integer minor units are necessary for finance.',
    targetRoute: 'insights#deterministic-calc',
    category: 'financial',
    categories: ['financial', 'software'],
  },
  {
    id: 'idempotency-momo',
    number: 'NOTE 02',
    title: 'Idempotency in Mobile Money',
    summary:
      'Handling webhook retries, network jitter, and distributed locks to prevent double credits in cellular environments.',
    targetRoute: 'insights#idempotency-momo',
    category: 'integrations',
    categories: ['financial', 'integrations', 'automation'],
  },
  {
    id: 'rescue-stalled-project',
    number: 'NOTE 03',
    title: 'Software Rescue Triage',
    summary:
      'How to audit, isolate risks, and stabilize an abandoned or unstable codebase without defaulting to an expensive total rewrite.',
    targetRoute: 'insights#rescue-stalled-project',
    category: 'software',
    categories: ['software', 'websites', 'automation'],
  },
];

export function filterWorkEvidence(category: WorkCategoryId): {
  demonstrations: TechnicalDemonstrationItem[];
  notes: TechnicalNoteReference[];
  categoryLabel: string;
} {
  const activeCategory = WORK_CATEGORIES.find((c) => c.id === category) || WORK_CATEGORIES[0];

  if (category === 'all') {
    return {
      demonstrations: TECHNICAL_DEMONSTRATIONS,
      notes: TECHNICAL_NOTE_REFS,
      categoryLabel: activeCategory.label,
    };
  }

  return {
    demonstrations: TECHNICAL_DEMONSTRATIONS.filter((item) => item.categories.includes(category)),
    notes: TECHNICAL_NOTE_REFS.filter((note) => note.categories.includes(category)),
    categoryLabel: activeCategory.label,
  };
}
