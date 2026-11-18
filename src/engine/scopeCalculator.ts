/**
 * EULOK Technical Architecture & Scoping Workbench Core
 * Deterministic estimation of complexity, milestone-derived timelines,
 * logarithmic technical risk scoring, Uganda & East Africa deployment rules,
 * failure-mode mitigation matrices, architecture topology, and acceptance gates.
 *
 * Commercial pricing is intentionally excluded and finalized directly during
 * engineering consultation following technical discovery.
 */

export type DeploymentContextId = 'uganda_domestic' | 'eac_cross_border';

export interface DeploymentContextSpec {
  id: DeploymentContextId;
  label: string;
  shortLabel: string;
  complexityMultiplier: number;
  riskWeight: number;
  operationalProfile: string;
  networkConstraint: string;
}

export const DEPLOYMENT_CONTEXTS: Record<DeploymentContextId, DeploymentContextSpec> = {
  uganda_domestic: {
    id: 'uganda_domestic',
    label: 'Uganda Domestic Operations',
    shortLabel: 'Uganda Domestic',
    complexityMultiplier: 1.0,
    riskWeight: 0.0,
    operationalProfile:
      'Single-jurisdiction Kampala & upcountry deployment aligned with MTN/Airtel Uganda rails, URA EFRIS fiscalization, and Uganda DPPA 2019.',
    networkConstraint:
      'Optimized for regional 3G/4G cellular jitter with pre-rendered <50KB intake surfaces and offline buffering.',
  },
  eac_cross_border: {
    id: 'eac_cross_border',
    label: 'East Africa Cross-Border (EAC)',
    shortLabel: 'EAC Cross-Border',
    complexityMultiplier: 1.18,
    riskWeight: 0.75,
    operationalProfile:
      'Multi-corridor architecture spanning Uganda, Kenya, Tanzania, and Rwanda with isolated currency ledgers (UGX/KES/TZS/RWF) and regional tax rules.',
    networkConstraint:
      'Handles asynchronous cross-border clearing windows, corridor-isolated settlement queues, and split regulatory reporting.',
  },
};

export interface ArchetypeSpec {
  id: ScopingInputs['archetypeId'];
  name: string;
  baseWeeks: number;
  baseRiskLoad: number;
  desc: string;
  coreGuarantee: string;
}

export interface IntegrationRail {
  id: string;
  name: string;
  complexityWeeks: number;
  riskWeight: number;
  notes: string;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  complexityWeeks: number;
  riskWeight: number;
  standard: string;
}

export interface ScopingInputs {
  archetypeId: 'reconciliation' | 'efris' | 'custom_portal' | 'rescue' | 'website';
  selectedRails: string[];
  complianceRequirements: string[];
  throughputTier: 'standard' | 'high' | 'mission_critical';
  deploymentContextId?: DeploymentContextId;
  clientName?: string;
}

export interface MilestonePhase {
  stageNumber: number;
  stageName: string;
  weeks: number;
  effortSharePct: number;
  rawProportionalWeeks: number;
  floorApplied: boolean;
  floorNote?: string;
  deliverables: string[];
  exitGate: string;
}

export interface FailureModeSpec {
  id: string;
  surface: string;
  failureMode: string;
  triggerCondition: string;
  deterministicMitigation: string;
  severity: 'P0' | 'P1' | 'P2';
}

export interface TopologyLayer {
  layerId: string;
  title: string;
  responsibility: string;
  pattern: string;
}

export interface AcceptanceGateSpec {
  code: string;
  gate: string;
  verificationMethod: string;
}

export interface ScopingResult {
  archetypeName: string;
  coreGuarantee: string;
  milestoneTotalWeeks: number;
  estimatedWeeksMin: number;
  estimatedWeeksMax: number;
  contingencyWeeks: number;
  rawRiskLoad: number;
  riskScore: number; // 1 to 10 (logarithmically scaled)
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  deploymentContextId: DeploymentContextId;
  deploymentContextLabel: string;
  deploymentContextProfile: string;
  throughputLabel: string;
  architectureTopology: TopologyLayer[];
  failureModes: FailureModeSpec[];
  acceptanceGates: AcceptanceGateSpec[];
  milestonePhases: MilestonePhase[];
  architecturalControls: string[];
  consultationNote: string;
  memorandumMarkdown: string;
  verificationHash: string;
}

export const ARCHETYPES: Record<ScopingInputs['archetypeId'], ArchetypeSpec> = {
  reconciliation: {
    id: 'reconciliation',
    name: 'Deterministic Financial Reconciliation Engine',
    baseWeeks: 4.5,
    baseRiskLoad: 1.1,
    desc: 'High-throughput matching of mobile money, bank statements, and internal invoices with zero floating-point drift.',
    coreGuarantee: 'Zero-sum integer minor-unit ledger matching with deterministic 8-rule state transitions.',
  },
  efris: {
    id: 'efris',
    name: 'URA EFRIS Fiscalization Gateway',
    baseWeeks: 3.5,
    baseRiskLoad: 1.3,
    desc: 'Automated electronic invoice signing, fiscal QR code generation, and direct tax authority synchronization.',
    coreGuarantee: 'Fail-closed invoice dispatch with local signed buffering across upstream tax API brownouts.',
  },
  custom_portal: {
    id: 'custom_portal',
    name: 'Custom Workflow & Operating Portal',
    baseWeeks: 4.0,
    baseRiskLoad: 1.0,
    desc: 'Secure internal portals replacing error-prone spreadsheets with auditable role-based records.',
    coreGuarantee: 'Explicit role-based permission boundaries and immutable state-change audit logs.',
  },
  rescue: {
    id: 'rescue',
    name: 'Codebase Rescue & Modernization',
    baseWeeks: 3.5,
    baseRiskLoad: 2.2,
    desc: 'Stabilizing broken production systems, adding missing test harnesses, and eliminating architectural debt.',
    coreGuarantee: 'Isolated reproduction harness and characterization test suite before structural refactoring.',
  },
  website: {
    id: 'website',
    name: 'Performance-First Engineering Presence',
    baseWeeks: 2.0,
    baseRiskLoad: 0.4,
    desc: 'Sub-second mobile-first web presence pre-rendered for East African cellular grids with WCAG 2.2 AA accessibility.',
    coreGuarantee: 'Pre-rendered edge-cached HTML under strict payload budgets for 3G/4G resilience.',
  },
};

export const INTEGRATION_RAILS: Record<string, IntegrationRail> = {
  mtn_momo: {
    id: 'mtn_momo',
    name: 'MTN Mobile Money (Uganda & EAC)',
    complexityWeeks: 1.0,
    riskWeight: 0.65,
    notes: 'Webhook idempotency, token rotation, sandbox KYB UAT, and callback reconciliation.',
  },
  airtel_money: {
    id: 'airtel_money',
    name: 'Airtel Money OpenAPI',
    complexityWeeks: 1.0,
    riskWeight: 0.65,
    notes: 'Direct merchant collection and disbursement APIs with dual-check matching.',
  },
  commercial_banks: {
    id: 'commercial_banks',
    name: 'Commercial Bank Host-to-Host (MT940/CAMT.053)',
    complexityWeeks: 1.5,
    riskWeight: 1.25,
    notes: 'SFTP/API statement parsing, IP allowlisting, and decimal format normalization.',
  },
  ura_efris: {
    id: 'ura_efris',
    name: 'URA EFRIS REST/SOAP API',
    complexityWeeks: 1.5,
    riskWeight: 1.05,
    notes: 'Asymmetric cryptographic signing, taxpayer device certificates, and offline invoice buffering.',
  },
  accounting_webhooks: {
    id: 'accounting_webhooks',
    name: 'ERP / Accounting Connectors (QuickBooks/Xero)',
    complexityWeeks: 0.8,
    riskWeight: 0.45,
    notes: 'Two-way ledger journal syncing with chart-of-accounts mapping and idempotent retry queues.',
  },
};

export const COMPLIANCE_ITEMS: Record<string, ComplianceRequirement> = {
  dppa_2019: {
    id: 'dppa_2019',
    name: 'Uganda DPPA 2019 Section 24 Data Sovereignty',
    complexityWeeks: 0.5,
    riskWeight: 0.35,
    standard: 'Statutory consent, 180-day retention policies, and data export endpoints.',
  },
  audit_ledger: {
    id: 'audit_ledger',
    name: 'Cryptographic Immutable Audit Trails',
    complexityWeeks: 0.8,
    riskWeight: 0.45,
    standard: 'SHA-256 hash chaining of every state mutation with immutable history.',
  },
  double_entry: {
    id: 'double_entry',
    name: 'Mathematical Double-Entry Balancing',
    complexityWeeks: 1.0,
    riskWeight: 0.65,
    standard: 'Strict zero-sum debits/credits verification before committing ledger writes.',
  },
};

const STAGE_DEFINITIONS = [
  {
    stageNumber: 1,
    stageName: 'Stage 01: Discover & Baseline Diagnostic',
    weight: 0.14,
    minFloor: 0.5,
    deliverables: ['Existing API & data schema audit', 'Operational bottleneck mapping', 'Scope boundaries & exclusions'],
    exitGate: 'Written problem statement and system boundary signed by both parties.',
  },
  {
    stageNumber: 2,
    stageName: 'Stage 02: Deterministic Specification',
    weight: 0.14,
    minFloor: 0.5,
    deliverables: ['Interface contracts (OpenAPI/JSON)', 'Idempotency & state-machine schemas', 'Architectural boundary & acceptance criteria'],
    exitGate: 'Acceptance checklist agreed with 0 unverified assumptions.',
  },
  {
    stageNumber: 3,
    stageName: 'Stage 03: Architectural Prototype & Core Rules',
    weight: 0.20,
    minFloor: 0.5,
    deliverables: ['Integer minor-unit arithmetic core', 'Sandbox payment simulator', 'Automated invariant test harness'],
    exitGate: '100% test pass on golden reconciliation and fault-injection vectors.',
  },
  {
    stageNumber: 4,
    stageName: 'Stage 04: Production Implementation & Integration',
    weight: 0.34,
    minFloor: 1.0,
    deliverables: ['Working integration adapters (MTN/Airtel/EFRIS)', 'Fail-closed state persistence', 'Credential & key isolation'],
    exitGate: 'Deterministic release verification gates executed and passed.',
  },
  {
    stageNumber: 5,
    stageName: 'Stage 05: Staging Verification & Cutover',
    weight: 0.12,
    minFloor: 0.5,
    deliverables: ['Side-by-side transaction parallel run', 'Disaster recovery & rollback runbook', 'DNS/SSL edge configuration'],
    exitGate: 'Production smoke tests confirmed with zero data divergence.',
  },
  {
    stageNumber: 6,
    stageName: 'Stage 06: Full Handover & Sovereign Ownership',
    weight: 0.06,
    minFloor: 0.5,
    deliverables: ['100% source code repository transfer', 'Infrastructure credentials handover', 'Operator runbooks & training'],
    exitGate: 'Client retains sovereign operational autonomy.',
  },
] as const;

export function simpleHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `EULOK-SPEC-${hex}`;
}

/**
 * Logarithmic technical risk scoring:
 * Maps raw additive complexity load onto a 1–10 scale via 1 + k * ln(1 + load)
 * so single-rail baseline builds stay LOW/MODERATE without saturating prematurely,
 * while multi-rail + compliance + mission-critical loads scale into HIGH/CRITICAL.
 */
export function computeLogarithmicRiskScore(rawRiskLoad: number): number {
  const boundedLoad = Math.max(0, rawRiskLoad);
  const logScaled = 1 + 3.15 * Math.log1p(boundedLoad);
  return Math.min(10, Math.max(1, Math.round(logScaled)));
}

function deriveFailureModes(
  inputs: ScopingInputs,
  sortedRails: string[],
  sortedCompliance: string[],
  deploymentContextId: DeploymentContextId
): FailureModeSpec[] {
  const modes: FailureModeSpec[] = [];

  if (inputs.archetypeId === 'reconciliation' || inputs.archetypeId === 'efris') {
    modes.push({
      id: 'fm-float-drift',
      surface: 'Financial Arithmetic Core',
      failureMode: 'Cumulative Binary Floating-Point Drift',
      triggerCondition: 'IEEE 754 float rounding across high-volume UGX/KES partial settlements.',
      deterministicMitigation: 'Enforce strict integer minor-unit (BigInt) arithmetic with zero-sum conservation invariants.',
      severity: 'P0',
    });
  } else if (inputs.archetypeId === 'rescue') {
    modes.push({
      id: 'fm-silent-regression',
      surface: 'Legacy Codebase Boundary',
      failureMode: 'Silent Regression During Hotfix',
      triggerCondition: 'Undocumented coupling or shared mutable state triggered during dependency upgrades.',
      deterministicMitigation: 'Freeze container state, wrap critical endpoints in characterization tests, and isolate mutation paths.',
      severity: 'P0',
    });
  } else if (inputs.archetypeId === 'custom_portal') {
    modes.push({
      id: 'fm-rbac-bypass',
      surface: 'Operator Authorization Layer',
      failureMode: 'Privilege Escalation or Unaudited Mutation',
      triggerCondition: 'Direct endpoint calls bypassing client-side role checks or missing state transition guards.',
      deterministicMitigation: 'Server-enforced RBAC policy gates with fail-closed transition checks and immutable operator attribution.',
      severity: 'P0',
    });
  } else {
    modes.push({
      id: 'fm-3g-hydration',
      surface: 'Edge Delivery & 3G Networks',
      failureMode: 'Bundle Timeout on Metered Cellular Grids',
      triggerCondition: 'Heavy client JS hydration stalling on 3G links across Kampala or upcountry districts.',
      deterministicMitigation: 'Pre-rendered static edge HTML, strict sub-50KB critical payloads, and zero-runtime-overhead CSS.',
      severity: 'P1',
    });
  }

  if (sortedRails.includes('mtn_momo')) {
    modes.push({
      id: 'fm-momo-retry',
      surface: 'MTN Mobile Money Webhook',
      failureMode: 'Duplicate Credit Under Carrier Retry Storm',
      triggerCondition: 'Telecom gateway misses HTTP 200 ACK under cellular packet loss and replays identical payload.',
      deterministicMitigation: 'Atomic SHA-256 idempotency ledger claim (`ON CONFLICT DO NOTHING`) returning safe HTTP 200.',
      severity: 'P0',
    });
  }

  if (sortedRails.includes('airtel_money')) {
    modes.push({
      id: 'fm-airtel-oob',
      surface: 'Airtel Money OpenAPI',
      failureMode: 'Out-of-Order Callback State Corruption',
      triggerCondition: 'Delayed pending notification arriving after terminal settlement confirmation.',
      deterministicMitigation: 'Monotonic finite-state machine rejecting non-forward state transitions with structured audit events.',
      severity: 'P0',
    });
  }

  if (sortedRails.includes('commercial_banks')) {
    modes.push({
      id: 'fm-bank-statement',
      surface: 'Commercial Bank MT940/CAMT.053',
      failureMode: 'Partial Batch Ingestion & Duplicate Statement Window',
      triggerCondition: 'Overlapping end-of-day SFTP exports or truncated XML statement batches.',
      deterministicMitigation: 'Transaction-level fingerprint deduplication paired with opening/closing balance continuity proof.',
      severity: 'P0',
    });
  }

  if (sortedRails.includes('ura_efris')) {
    modes.push({
      id: 'fm-efris-brownout',
      surface: 'URA EFRIS Signing Gateway',
      failureMode: 'Tax Authority Timeout Blocking Checkout/Dispatch',
      triggerCondition: 'Upstream EFRIS SOAP/REST latency spike or device key certificate rotation lapse.',
      deterministicMitigation: 'Signed local offline dispatch queue with bounded backoff plus automated 14-day certificate expiry alerts.',
      severity: 'P0',
    });
  }

  if (sortedRails.includes('accounting_webhooks')) {
    modes.push({
      id: 'fm-erp-skew',
      surface: 'ERP / Accounting Connector',
      failureMode: 'Chart-of-Accounts Posting Mismatch',
      triggerCondition: 'Rate-limited ERP API rejecting multi-line journal entries mid-sync.',
      deterministicMitigation: 'Idempotent journal batching with dead-letter reconciliation queue awaiting operator retry.',
      severity: 'P1',
    });
  }

  if (deploymentContextId === 'eac_cross_border') {
    modes.push({
      id: 'fm-eac-corridor',
      surface: 'EAC Cross-Border Clearing',
      failureMode: 'Multi-Currency Ledger Contamination',
      triggerCondition: 'Mixing UGX/KES/TZS/RWF settlement records without explicit corridor & FX snapshot isolation.',
      deterministicMitigation: 'Strict per-currency ledger partitioning with immutable settlement FX rate timestamping.',
      severity: 'P0',
    });
  }

  if (inputs.throughputTier === 'high' || inputs.throughputTier === 'mission_critical') {
    modes.push({
      id: 'fm-backpressure',
      surface: 'Queue & Worker Pool',
      failureMode: 'Unbounded Queue Backpressure During Peak Batch',
      triggerCondition: 'Month-end tuition or SACCO collection spikes saturating synchronous DB connections.',
      deterministicMitigation: 'Bounded connection pooling, persistent queue admission control, and fail-closed backpressure shedding.',
      severity: 'P1',
    });
  }

  if (sortedCompliance.includes('dppa_2019')) {
    modes.push({
      id: 'fm-dppa-retention',
      surface: 'Privacy & DPPA 2019 Store',
      failureMode: 'Over-Retained PII Across Audit Logs',
      triggerCondition: 'Unbounded intake payloads retaining raw personal telephone/email metadata past statutory limits.',
      deterministicMitigation: 'Pseudonymized ledger references with automated 180-day statutory retention purge schedules.',
      severity: 'P2',
    });
  }

  return modes;
}

function buildTopology(
  inputs: ScopingInputs,
  sortedRails: string[],
  deploymentContextId: DeploymentContextId
): TopologyLayer[] {
  const railLabel =
    sortedRails.length > 0
      ? sortedRails.map((r) => INTEGRATION_RAILS[r]?.name.split(' ')[0] || r).join(' · ')
      : 'Internal Client Portal';

  return [
    {
      layerId: '01 · EDGE',
      title: 'Static Edge & Intake Surface',
      responsibility:
        deploymentContextId === 'eac_cross_border'
          ? 'Region-resilient pre-rendered delivery across Kampala, Nairobi, Kigali, and Dar es Salaam.'
          : 'Zero-bloat static HTML/CSS delivery across Kampala & upcountry 3G/4G networks.',
      pattern: 'Cloudflare Pages CDN + strict CSP headers + WCAG 2.2 AA',
    },
    {
      layerId: '02 · INGESTION',
      title: `Signature & Idempotency Boundary (${railLabel})`,
      responsibility:
        'Validates HMAC signatures, normalizes carrier/tax payloads, and drops duplicate retries before execution.',
      pattern: 'SHA-256 atomic claim + schema validation + fail-closed HTTP gates',
    },
    {
      layerId: '03 · CORE',
      title: 'Deterministic Execution Core',
      responsibility:
        'Executes pure integer minor-unit math, rule prioritization, and explicit state-machine transitions.',
      pattern: 'Pure TypeScript / SQL transaction boundaries · Explicit operator approval',
    },
    {
      layerId: '04 · AUDIT',
      title: 'Exception Queue & Immutable Ledger',
      responsibility:
        'Routes ambiguous transactions to human operators and seals every committed mutation with audit hashes.',
      pattern:
        inputs.throughputTier === 'mission_critical'
          ? 'Append-only hash chain + standby replay log + operator sign-off'
          : 'Append-only audit trail + structured JSON/Markdown evidence export',
    },
  ];
}

function buildAcceptanceGates(
  inputs: ScopingInputs,
  sortedRails: string[],
  sortedCompliance: string[]
): AcceptanceGateSpec[] {
  const gates: AcceptanceGateSpec[] = [
    {
      code: 'GATE-01',
      gate: 'Zero-Defect Type & Deterministic Core Invariants',
      verificationMethod: '100% pass across automated unit, boundary, and golden-vector property tests (`npm run lint && npm test`).',
    },
    {
      code: 'GATE-02',
      gate: 'Fail-Closed Security & Zero Secrets Leak',
      verificationMethod: 'Strict secret isolation check, CORS/CSP verification, and authenticated endpoint authorization proof.',
    },
    {
      code: 'GATE-03',
      gate: 'Low-Bandwidth & WCAG 2.2 AA Accessibility',
      verificationMethod: 'Headless browser layout, 390px mobile overflow audit, keyboard navigation, and payload budget check.',
    },
  ];

  if (sortedRails.length > 0) {
    gates.push({
      code: 'GATE-04',
      gate: 'Webhook Idempotency & Fault-Injection Replay',
      verificationMethod: `Simulated duplicate retry storms, malformed payloads, and upstream timeout brownouts across ${sortedRails.length} connected rail(s).`,
    });
  }

  if (sortedCompliance.includes('double_entry') || inputs.archetypeId === 'reconciliation') {
    gates.push({
      code: 'GATE-05',
      gate: 'Zero-Sum Ledger Conservation Proof',
      verificationMethod: 'Automated side-by-side parallel run asserting zero minor-unit divergence before production cutover.',
    });
  }

  return gates;
}

export function calculateScope(inputs: ScopingInputs): ScopingResult {
  const archetype = ARCHETYPES[inputs.archetypeId] || ARCHETYPES.custom_portal;
  const deploymentContextId: DeploymentContextId =
    inputs.deploymentContextId && DEPLOYMENT_CONTEXTS[inputs.deploymentContextId]
      ? inputs.deploymentContextId
      : 'uganda_domestic';
  const contextSpec = DEPLOYMENT_CONTEXTS[deploymentContextId];

  let stageEffortDriverWeeks = archetype.baseWeeks * contextSpec.complexityMultiplier;
  let rawRiskLoad = archetype.baseRiskLoad + contextSpec.riskWeight;

  const sortedRails = [...inputs.selectedRails].sort();
  for (const railId of sortedRails) {
    const rail = INTEGRATION_RAILS[railId];
    if (rail) {
      stageEffortDriverWeeks += rail.complexityWeeks;
      rawRiskLoad += rail.riskWeight;
    }
  }

  const sortedCompliance = [...inputs.complianceRequirements].sort();
  for (const compId of sortedCompliance) {
    const comp = COMPLIANCE_ITEMS[compId];
    if (comp) {
      stageEffortDriverWeeks += comp.complexityWeeks;
      rawRiskLoad += comp.riskWeight;
    }
  }

  if (inputs.throughputTier === 'high') {
    stageEffortDriverWeeks *= 1.15;
    rawRiskLoad += 2.4;
  } else if (inputs.throughputTier === 'mission_critical') {
    stageEffortDriverWeeks *= 1.32;
    rawRiskLoad += 6.5;
  }

  const throughputLabel =
    inputs.throughputTier === 'mission_critical'
      ? 'Critical (100k+ tx/day)'
      : inputs.throughputTier === 'high'
      ? 'High (10k–100k tx/day)'
      : 'Standard (< 10k tx/day)';

  const roundedRawLoad = +rawRiskLoad.toFixed(2);
  const riskScore = computeLogarithmicRiskScore(roundedRawLoad);
  const riskLevel: ScopingResult['riskLevel'] =
    riskScore <= 3 ? 'LOW' : riskScore <= 6 ? 'MODERATE' : riskScore <= 8 ? 'HIGH' : 'CRITICAL';

  // 1. Compute 6-stage milestone breakdown in 0.5-week increments with explicit governance floors
  const rawPhases = STAGE_DEFINITIONS.map((stage) => {
    const rawProportionalWeeks = +(stageEffortDriverWeeks * stage.weight).toFixed(2);
    const roundedHalf = Math.round(rawProportionalWeeks * 2) / 2;
    const weeks = Math.max(stage.minFloor, roundedHalf);
    const floorApplied = weeks > roundedHalf;
    return {
      stageNumber: stage.stageNumber,
      stageName: stage.stageName,
      weeks,
      rawProportionalWeeks,
      floorApplied,
      floorNote: floorApplied
        ? `Includes ${stage.minFloor} wk minimum engineering & quality-gate floor`
        : undefined,
      deliverables: [...stage.deliverables],
      exitGate: stage.exitGate,
    };
  });

  // 2. Derive headline timeline DIRECTLY from the sum of milestone weeks
  const milestoneTotalWeeks = +rawPhases.reduce((sum, phase) => sum + phase.weeks, 0).toFixed(1);
  const estimatedWeeksMin = milestoneTotalWeeks;

  // Compute exact integer effortSharePct summing to 100
  const unroundedShares = rawPhases.map((p) => (p.weeks / milestoneTotalWeeks) * 100);
  const baseShares = unroundedShares.map((s) => Math.floor(s));
  let remainderPct = 100 - baseShares.reduce((a, b) => a + b, 0);
  const rankedRemainder = unroundedShares
    .map((s, idx) => ({ idx, frac: s - Math.floor(s) }))
    .sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < rankedRemainder.length && remainderPct > 0; i++) {
    baseShares[rankedRemainder[i].idx] += 1;
    remainderPct -= 1;
  }

  const milestonePhases: MilestonePhase[] = rawPhases.map((p, idx) => ({
    ...p,
    effortSharePct: baseShares[idx],
  }));

  // Contingency buffer applied purely for external UAT/KYB sandbox approvals atop milestoneTotalWeeks
  const bufferRatio = riskScore >= 7 ? 0.25 : riskScore >= 4 ? 0.20 : 0.15;
  const bufferedMax = Math.ceil(milestoneTotalWeeks * (1 + bufferRatio) * 2) / 2;
  const estimatedWeeksMax = Math.max(estimatedWeeksMin + 0.5, bufferedMax);
  const contingencyWeeks = +(estimatedWeeksMax - estimatedWeeksMin).toFixed(1);

  const architecturalControls: string[] = [
    'Decimal-only math: Zero floating-point rounding errors across currency transactions.',
    'Idempotency keys: Webhook retries are deduped via unique cryptographic payload fingerprints.',
    'Fail-closed boundary: If third-party APIs drop, transactions freeze safely without capital loss.',
    'Uganda DPPA 2019 compliance: Section 24 statutory rights and auditable data retention limits.',
    'Static edge caching: Informational and intake boundaries isolated from processing node failures.',
  ];

  if (inputs.complianceRequirements.includes('audit_ledger')) {
    architecturalControls.push('Cryptographic SHA-256 hash chaining on all immutable state transitions.');
  }
  if (inputs.throughputTier === 'mission_critical') {
    architecturalControls.push('Multi-zone standby queues with automated transaction replay logging.');
  }
  if (deploymentContextId === 'eac_cross_border') {
    architecturalControls.push('Corridor-isolated FX ledgers separating UGX, KES, TZS, and RWF settlement rules.');
  }

  const failureModes = deriveFailureModes(inputs, sortedRails, sortedCompliance, deploymentContextId);
  const architectureTopology = buildTopology(inputs, sortedRails, deploymentContextId);
  const acceptanceGates = buildAcceptanceGates(inputs, sortedRails, sortedCompliance);

  const consultationNote =
    'Commercial pricing, milestone payment schedule, and SLA retainer terms are tailored directly during engineering consultation following Stage 01 technical review.';

  const rawSeed = `${inputs.archetypeId}-${sortedRails.join(',')}-${sortedCompliance.join(',')}-${inputs.throughputTier}-${milestoneTotalWeeks}-${deploymentContextId}`;
  const verificationHash = simpleHash(rawSeed);

  const clientHeader = inputs.clientName ? `Prepared for: ${inputs.clientName}` : 'Technical Architecture Specification';

  const memorandumMarkdown = `# EULOK Architecture & Scoping Specification
${clientHeader}
Deployment Scope: ${contextSpec.label}
Reference Hash: ${verificationHash}
Date: ${new Date().toISOString().split('T')[0]}

## 1. System Archetype & Engineering Guarantee
**${archetype.name}**
${archetype.desc}
- **Core Guarantee:** ${archetype.coreGuarantee}
- **Operational Profile:** ${contextSpec.operationalProfile}

## 2. Integrated Rails & Boundaries
${sortedRails.length > 0
  ? sortedRails.map((r) => `- **${INTEGRATION_RAILS[r]?.name}**: ${INTEGRATION_RAILS[r]?.notes}`).join('\n')
  : '- Standard decoupled internal architecture (no external rail dependencies).'}

## 3. Compliance & Governance Posture
${sortedCompliance.length > 0
  ? sortedCompliance.map((c) => `- **${COMPLIANCE_ITEMS[c]?.name}**: ${COMPLIANCE_ITEMS[c]?.standard}`).join('\n')
  : '- Baseline security and confidential data isolation standards.'}

## 4. Delivery Estimation & Logarithmic Risk Profile
- **Baseline Milestone Sum (6 Stages):** ${estimatedWeeksMin} calendar weeks (derived directly from sum of stage milestones below)
- **External KYB / Sandbox Buffer:** +${contingencyWeeks} ${contingencyWeeks === 1 ? 'week' : 'weeks'} (Projected total range: ${estimatedWeeksMin}–${estimatedWeeksMax} weeks)
- **Technical Risk Score (Logarithmic Scale):** ${riskScore} / 10 (${riskLevel}) [load: ${roundedRawLoad}]
- **Throughput Tier:** ${throughputLabel}
- **Commercial Terms:** ${consultationNote}

## 5. Failure Modes & Deterministic Mitigations
${failureModes
  .map((fm) => `- **[${fm.severity}] ${fm.failureMode} (${fm.surface}):** Trigger: ${fm.triggerCondition} Mitigation: ${fm.deterministicMitigation}`)
  .join('\n')}

## 6. Target Architecture Topology
${architectureTopology
  .map((layer) => `- **${layer.layerId} — ${layer.title}:** ${layer.responsibility} (*${layer.pattern}*)`)
  .join('\n')}

## 7. Mandatory Acceptance Verification Gates
${acceptanceGates
  .map((gate) => `- **${gate.code} (${gate.gate}):** ${gate.verificationMethod}`)
  .join('\n')}

## 8. Milestone Delivery Sequence
${milestonePhases
  .map(
    (p) => `### ${p.stageName} (${p.weeks} ${p.weeks === 1 ? 'wk' : 'wks'} · ${p.effortSharePct}% effort)${p.floorNote ? ` — *${p.floorNote}*` : ''}
Deliverables: ${p.deliverables.join(', ')}
Exit Gate: ${p.exitGate}`
  )
  .join('\n\n')}

---
*Governed by EULOK Delivery Commitments: Explicit specifications, deterministic execution, and sovereign ownership.*
`;

  return {
    archetypeName: archetype.name,
    coreGuarantee: archetype.coreGuarantee,
    milestoneTotalWeeks,
    estimatedWeeksMin,
    estimatedWeeksMax,
    contingencyWeeks,
    rawRiskLoad: roundedRawLoad,
    riskScore,
    riskLevel,
    deploymentContextId,
    deploymentContextLabel: contextSpec.label,
    deploymentContextProfile: contextSpec.operationalProfile,
    throughputLabel,
    architectureTopology,
    failureModes,
    acceptanceGates,
    milestonePhases,
    architecturalControls,
    consultationNote,
    memorandumMarkdown,
    verificationHash,
  };
}

export function encodeScopeToQuery(inputs: ScopingInputs): string {
  const params = new URLSearchParams();
  params.set('arch', inputs.archetypeId);
  if (inputs.selectedRails.length > 0) {
    params.set('rails', [...inputs.selectedRails].sort().join(','));
  } else {
    params.set('rails', 'none');
  }
  if (inputs.complianceRequirements.length > 0) {
    params.set('comp', [...inputs.complianceRequirements].sort().join(','));
  } else {
    params.set('comp', 'none');
  }
  params.set('tier', inputs.throughputTier);
  if (inputs.deploymentContextId) params.set('ctx', inputs.deploymentContextId);
  if (inputs.clientName?.trim()) params.set('client', inputs.clientName.trim());
  return params.toString();
}

export function parseScopeFromQuery(search: string): Partial<ScopingInputs> {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const parsed: Partial<ScopingInputs> = {};

  const arch = params.get('arch');
  if (arch && arch in ARCHETYPES) {
    parsed.archetypeId = arch as ScopingInputs['archetypeId'];
  }

  const railsRaw = params.get('rails');
  if (railsRaw !== null) {
    parsed.selectedRails =
      railsRaw === 'none' || railsRaw === ''
        ? []
        : railsRaw
            .split(',')
            .map((r) => r.trim())
            .filter((r) => r in INTEGRATION_RAILS);
  }

  const compRaw = params.get('comp');
  if (compRaw !== null) {
    parsed.complianceRequirements =
      compRaw === 'none' || compRaw === ''
        ? []
        : compRaw
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c in COMPLIANCE_ITEMS);
  }

  const tier = params.get('tier');
  if (tier === 'standard' || tier === 'high' || tier === 'mission_critical') {
    parsed.throughputTier = tier;
  }

  const ctx = params.get('ctx');
  if (ctx && ctx in DEPLOYMENT_CONTEXTS) {
    parsed.deploymentContextId = ctx as DeploymentContextId;
  }

  const client = params.get('client');
  if (client) {
    parsed.clientName = client.slice(0, 120);
  }

  return parsed;
}
