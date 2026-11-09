/**
 * EULOK Technical Scoping & Architecture Configurator Core
 * Deterministic estimation of complexity, delivery timeline, risk scores, and architectural controls.
 */

export interface SystemOption {
  id: string;
  name: string;
  baseWeeks: number;
  riskFactor: number;
  description: string;
}

export interface IntegrationRail {
  id: string;
  name: string;
  complexityWeeks: number;
  notes: string;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  complexityWeeks: number;
  standard: string;
}

export interface ScopingInputs {
  archetypeId: 'reconciliation' | 'efris' | 'custom_portal' | 'rescue' | 'website';
  selectedRails: string[];
  complianceRequirements: string[];
  throughputTier: 'standard' | 'high' | 'mission_critical';
  clientName?: string;
}

export interface ScopingResult {
  archetypeName: string;
  estimatedWeeksMin: number;
  estimatedWeeksMax: number;
  riskScore: number; // 1 to 10
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  suggestedTier: string;
  milestonePhases: Array<{
    stageNumber: number;
    stageName: string;
    weeks: number;
    deliverables: string[];
    exitGate: string;
  }>;
  architecturalControls: string[];
  memorandumMarkdown: string;
  verificationHash: string;
}

export const ARCHETYPES: Record<string, { name: string; baseWeeks: number; baseRisk: number; desc: string }> = {
  reconciliation: {
    name: 'Deterministic Financial Reconciliation Engine',
    baseWeeks: 3,
    baseRisk: 5,
    desc: 'High-throughput matching of mobile money, bank statements, and internal invoices with zero floating point drift.',
  },
  efris: {
    name: 'URA EFRIS Fiscalization Gateway',
    baseWeeks: 2.5,
    baseRisk: 4,
    desc: 'Automated electronic invoice signing, fiscal QR code generation, and direct tax authority synchronization.',
  },
  custom_portal: {
    name: 'Custom Workflow & Operating Portal',
    baseWeeks: 3,
    baseRisk: 3,
    desc: 'Secure internal portals replacing error-prone spreadsheets with auditable role-based records.',
  },
  rescue: {
    name: 'Codebase Rescue & Modernization',
    baseWeeks: 2,
    baseRisk: 6,
    desc: 'Stabilizing broken production systems, adding missing test harnesses, and eliminating architectural debt.',
  },
  website: {
    name: 'Performance-First Engineering Presence',
    baseWeeks: 1.5,
    baseRisk: 2,
    desc: 'Sub-second mobile-first web presence pre-rendered with Astro, zero JS tax, and WCAG 2.2 AA accessibility.',
  },
};

export const INTEGRATION_RAILS: Record<string, IntegrationRail> = {
  mtn_momo: {
    id: 'mtn_momo',
    name: 'MTN Mobile Money (Uganda / Regional)',
    complexityWeeks: 0.8,
    notes: 'Webhook idempotency, token rotation, and callback reconciliation.',
  },
  airtel_money: {
    id: 'airtel_money',
    name: 'Airtel Money OpenAPI',
    complexityWeeks: 0.8,
    notes: 'Direct merchant collection and disbursement APIs with dual-check matching.',
  },
  commercial_banks: {
    id: 'commercial_banks',
    name: 'Commercial Bank Host-to-Host (MT940/CAMT.053)',
    complexityWeeks: 1.2,
    notes: 'SFTP/API statement parsing with decimal format normalization.',
  },
  ura_efris: {
    id: 'ura_efris',
    name: 'URA EFRIS REST/SOAP API',
    complexityWeeks: 1.5,
    notes: 'Asymmetric cryptographic signing, device certificates, and offline invoice buffering.',
  },
  accounting_webhooks: {
    id: 'accounting_webhooks',
    name: 'ERP / Accounting Connectors (QuickBooks/Xero)',
    complexityWeeks: 0.6,
    notes: 'Two-way ledger journal syncing with idempotent retry queues.',
  },
};

export const COMPLIANCE_ITEMS: Record<string, ComplianceRequirement> = {
  dppa_2019: {
    id: 'dppa_2019',
    name: 'Uganda DPPA 2019 Section 24 Data Sovereignty',
    complexityWeeks: 0.5,
    standard: 'Statutory consent, 180-day retention policies, and data export endpoints.',
  },
  audit_ledger: {
    id: 'audit_ledger',
    name: 'Cryptographic Immutable Audit Trails',
    complexityWeeks: 0.8,
    standard: 'SHA-256 hash chaining of every state mutation with immutable history.',
  },
  double_entry: {
    id: 'double_entry',
    name: 'Mathematical Double-Entry Balancing',
    complexityWeeks: 0.7,
    standard: 'Strict zero-sum debits/credits verification before committing ledger writes.',
  },
};

export function simpleHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `EULOK-SPEC-${hex}`;
}

export function calculateScope(inputs: ScopingInputs): ScopingResult {
  const archetype = ARCHETYPES[inputs.archetypeId] || ARCHETYPES.custom_portal;
  let totalWeeks = archetype.baseWeeks;
  let riskScore = archetype.baseRisk;

  // Add rails complexity
  for (const railId of inputs.selectedRails) {
    if (INTEGRATION_RAILS[railId]) {
      totalWeeks += INTEGRATION_RAILS[railId].complexityWeeks;
      riskScore += 0.6;
    }
  }

  // Add compliance complexity
  for (const compId of inputs.complianceRequirements) {
    if (COMPLIANCE_ITEMS[compId]) {
      totalWeeks += COMPLIANCE_ITEMS[compId].complexityWeeks;
      riskScore += 0.4;
    }
  }

  // Throughput tier adjustments
  if (inputs.throughputTier === 'high') {
    totalWeeks *= 1.15;
    riskScore += 1.0;
  } else if (inputs.throughputTier === 'mission_critical') {
    totalWeeks *= 1.3;
    riskScore += 2.0;
  }

  riskScore = Math.min(10, Math.max(1, Math.round(riskScore)));
  const riskLevel =
    riskScore <= 3 ? 'LOW' : riskScore <= 6 ? 'MODERATE' : riskScore <= 8 ? 'HIGH' : 'CRITICAL';

  const estimatedWeeksMin = Math.max(1, Math.round(totalWeeks * 0.85));
  const estimatedWeeksMax = Math.max(estimatedWeeksMin + 1, Math.round(totalWeeks * 1.25));

  // Determine pricing tier indication
  let suggestedTier = '$1,500 – $3,500';
  if (estimatedWeeksMax <= 2) {
    suggestedTier = '$800 – $1,800';
  } else if (estimatedWeeksMax >= 7) {
    suggestedTier = '$6,500 – $15,000+';
  } else if (estimatedWeeksMax >= 4) {
    suggestedTier = '$3,500 – $6,500';
  }

  // 6-stage milestone breakdown
  const w1 = Math.max(0.5, +(totalWeeks * 0.15).toFixed(1));
  const w2 = Math.max(0.5, +(totalWeeks * 0.15).toFixed(1));
  const w3 = Math.max(0.5, +(totalWeeks * 0.20).toFixed(1));
  const w4 = Math.max(1.0, +(totalWeeks * 0.35).toFixed(1));
  const w5 = Math.max(0.5, +(totalWeeks * 0.10).toFixed(1));
  const w6 = Math.max(0.5, +(totalWeeks * 0.05).toFixed(1));

  const milestonePhases = [
    {
      stageNumber: 1,
      stageName: 'Stage 01: Discover & Baseline Diagnostic',
      weeks: w1,
      deliverables: ['Existing API & data schema audit', 'Operational bottleneck mapping', 'Exclusions contract'],
      exitGate: 'Written problem statement signed by both parties.',
    },
    {
      stageNumber: 2,
      stageName: 'Stage 02: Deterministic Specification',
      weeks: w2,
      deliverables: ['Interface contracts (OpenAPI/JSON)', 'Idempotency & state-machine schemas', 'Fixed pricing & acceptance criteria'],
      exitGate: 'Acceptance checklist agreed with 0 unverified assumptions.',
    },
    {
      stageNumber: 3,
      stageName: 'Stage 03: Architectural Prototype & Core Rules',
      weeks: w3,
      deliverables: ['Decimal precision arithmetic core', 'Sandbox payment simulator', 'Automated test harness'],
      exitGate: '100% test pass on golden reconciliation test vectors.',
    },
    {
      stageNumber: 4,
      stageName: 'Stage 04: Production Implementation & Integration',
      weeks: w4,
      deliverables: ['Working integration adapters (MTN/Airtel/EFRIS)', 'Fail-closed state persistence', 'Security credential isolation'],
      exitGate: '51-point release verification gate executed and passed.',
    },
    {
      stageNumber: 5,
      stageName: 'Stage 05: Staging Verification & Cutover',
      weeks: w5,
      deliverables: ['Side-by-side transaction parallel run', 'Disaster recovery & rollback runbook', 'DNS/SSL edge configuration'],
      exitGate: 'Production smoke tests confirmed with zero data divergence.',
    },
    {
      stageNumber: 6,
      stageName: 'Stage 06: Full Handover & Sovereign Ownership',
      weeks: w6,
      deliverables: ['100% source code repository transfer', 'Infrastructure credentials handover', 'Operating documentation'],
      exitGate: 'Client retains sovereign operational autonomy.',
    },
  ];

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
    architecturalControls.push('Multi-region standby queues with automated transaction replay logging.');
  }

  const rawSeed = `${inputs.archetypeId}-${inputs.selectedRails.sort().join(',')}-${inputs.complianceRequirements.sort().join(',')}-${totalWeeks}`;
  const verificationHash = simpleHash(rawSeed);

  const clientHeader = inputs.clientName ? `Prepared for: ${inputs.clientName}` : 'Technical Scope Memorandum';

  const memorandumMarkdown = `# EULOK Architecture & Scoping Memorandum
${clientHeader}
Reference Hash: ${verificationHash}
Date: ${new Date().toISOString().split('T')[0]}

## 1. System Archetype
**${archetype.name}**
${archetype.desc}

## 2. Integrated Rails & Boundaries
${inputs.selectedRails.length > 0
  ? inputs.selectedRails.map((r) => `- **${INTEGRATION_RAILS[r]?.name}**: ${INTEGRATION_RAILS[r]?.notes}`).join('\n')
  : '- Standard decoupled internal architecture (no external rail dependencies).'}

## 3. Compliance & Governance Posture
${inputs.complianceRequirements.length > 0
  ? inputs.complianceRequirements.map((c) => `- **${COMPLIANCE_ITEMS[c]?.name}**: ${COMPLIANCE_ITEMS[c]?.standard}`).join('\n')
  : '- Baseline security and confidential data isolation standards.'}

## 4. Delivery Estimation & Risk Scoring
- **Estimated Engineering Duration:** ${estimatedWeeksMin} to ${estimatedWeeksMax} calendar weeks
- **Technical Risk Assessment:** ${riskScore} / 10 (${riskLevel})
- **Indicative Milestone Budget:** ${suggestedTier} (Formal quote issued after Stage 02)

## 5. Architectural Quality Controls
${architecturalControls.map((ctrl) => `- ${ctrl}`).join('\n')}

## 6. Milestone Delivery Sequence
${milestonePhases
  .map(
    (p) => `### ${p.stageName} (${p.weeks} wks)
Deliverables: ${p.deliverables.join(', ')}
Exit Gate: ${p.exitGate}`
  )
  .join('\n\n')}

---
*Governed by EULOK Delivery Commitments: "Models propose. Deterministic systems decide."*
`;

  return {
    archetypeName: archetype.name,
    estimatedWeeksMin,
    estimatedWeeksMax,
    riskScore,
    riskLevel,
    suggestedTier,
    milestonePhases,
    architecturalControls,
    memorandumMarkdown,
    verificationHash,
  };
}
