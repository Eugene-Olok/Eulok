/**
 * EULOK Technical Scoping & Architecture Configurator Core
 * Deterministic estimation of complexity, milestone-derived timelines,
 * logarithmic technical risk scoring, region/economy-adjusted pricing,
 * multi-currency indicative budgets, and architectural controls.
 */

export type CurrencyCode = 'UGX' | 'USD' | 'KES' | 'EUR' | 'GBP';
export type EconomicRegionCode = 'uganda' | 'east_africa' | 'uk' | 'europe' | 'usa';

export interface CurrencySpec {
  code: CurrencyCode;
  label: string;
  symbol: string;
  ratePerUsd: number;
  roundTo: number;
}

export interface EconomicRegionSpec {
  id: EconomicRegionCode;
  label: string;
  shortLabel: string;
  defaultCurrency: CurrencyCode;
  economicMultiplier: number; // Relative to Uganda (1.0x) local engineering economy
  marketContext: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencySpec> = {
  UGX: {
    code: 'UGX',
    label: 'UGX · Uganda Shilling',
    symbol: 'UGX',
    ratePerUsd: 3700,
    roundTo: 100000,
  },
  USD: {
    code: 'USD',
    label: 'USD · US Dollar',
    symbol: '$',
    ratePerUsd: 1,
    roundTo: 100,
  },
  KES: {
    code: 'KES',
    label: 'KES · Kenyan Shilling',
    symbol: 'KES',
    ratePerUsd: 130,
    roundTo: 5000,
  },
  EUR: {
    code: 'EUR',
    label: 'EUR · Euro',
    symbol: '€',
    ratePerUsd: 0.92,
    roundTo: 100,
  },
  GBP: {
    code: 'GBP',
    label: 'GBP · British Pound',
    symbol: '£',
    ratePerUsd: 0.79,
    roundTo: 100,
  },
};

export const ECONOMIC_REGIONS: Record<EconomicRegionCode, EconomicRegionSpec> = {
  uganda: {
    id: 'uganda',
    label: 'Uganda (Kampala / Local Economy)',
    shortLabel: 'Uganda',
    defaultCurrency: 'UGX',
    economicMultiplier: 1.0,
    marketContext: 'Calibrated to Ugandan local enterprise & SME engineering economics (1.0× baseline).',
  },
  east_africa: {
    id: 'east_africa',
    label: 'East Africa (Kenya / Regional EAC)',
    shortLabel: 'East Africa',
    defaultCurrency: 'KES',
    economicMultiplier: 1.35,
    marketContext: 'Calibrated to Nairobi & EAC regional cross-border commercial market rates (1.35× index).',
  },
  uk: {
    id: 'uk',
    label: 'United Kingdom',
    shortLabel: 'UK',
    defaultCurrency: 'GBP',
    economicMultiplier: 2.4,
    marketContext: 'Calibrated to UK remote senior delivery & regulatory assurance economics (2.4× index).',
  },
  europe: {
    id: 'europe',
    label: 'European Union (EEA)',
    shortLabel: 'EU / EEA',
    defaultCurrency: 'EUR',
    economicMultiplier: 2.55,
    marketContext: 'Calibrated to EU commercial engineering & GDPR/PSD2 compliance economics (2.55× index).',
  },
  usa: {
    id: 'usa',
    label: 'United States / North America',
    shortLabel: 'USA',
    defaultCurrency: 'USD',
    economicMultiplier: 3.1,
    marketContext: 'Calibrated to US commercial engineering market economics & SLA liability coverage (3.1× index).',
  },
};

export interface ArchetypeSpec {
  id: ScopingInputs['archetypeId'];
  name: string;
  baseWeeks: number;
  baseRiskLoad: number;
  baseWeeklyRateUsd: number; // Uganda (1.0x) baseline weekly engineering rate in USD equivalent
  desc: string;
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
  regionId?: EconomicRegionCode;
  currency?: CurrencyCode;
  clientName?: string;
}

export interface MilestonePhase {
  stageNumber: number;
  stageName: string;
  weeks: number;
  rawProportionalWeeks: number;
  floorApplied: boolean;
  floorNote?: string;
  deliverables: string[];
  exitGate: string;
}

export interface ScopingResult {
  archetypeName: string;
  milestoneTotalWeeks: number;
  estimatedWeeksMin: number;
  estimatedWeeksMax: number;
  contingencyWeeks: number;
  rawRiskLoad: number;
  riskScore: number; // 1 to 10 (logarithmically scaled)
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  regionId: EconomicRegionCode;
  regionLabel: string;
  economicMultiplier: number;
  currency: CurrencyCode;
  budgetMin: number;
  budgetMax: number;
  budgetMinUsd: number;
  budgetMaxUsd: number;
  suggestedTier: string;
  referenceEquivalent: string;
  pricingBasisNote: string;
  milestonePhases: MilestonePhase[];
  architecturalControls: string[];
  memorandumMarkdown: string;
  verificationHash: string;
}

export const ARCHETYPES: Record<ScopingInputs['archetypeId'], ArchetypeSpec> = {
  reconciliation: {
    id: 'reconciliation',
    name: 'Deterministic Financial Reconciliation Engine',
    baseWeeks: 4.5,
    baseRiskLoad: 1.1,
    baseWeeklyRateUsd: 900,
    desc: 'High-throughput matching of mobile money, bank statements, and internal invoices with zero floating point drift.',
  },
  efris: {
    id: 'efris',
    name: 'URA EFRIS Fiscalization Gateway',
    baseWeeks: 3.5,
    baseRiskLoad: 1.3,
    baseWeeklyRateUsd: 780,
    desc: 'Automated electronic invoice signing, fiscal QR code generation, and direct tax authority synchronization.',
  },
  custom_portal: {
    id: 'custom_portal',
    name: 'Custom Workflow & Operating Portal',
    baseWeeks: 4.0,
    baseRiskLoad: 1.0,
    baseWeeklyRateUsd: 680,
    desc: 'Secure internal portals replacing error-prone spreadsheets with auditable role-based records.',
  },
  rescue: {
    id: 'rescue',
    name: 'Codebase Rescue & Modernization',
    baseWeeks: 3.5,
    baseRiskLoad: 2.2,
    baseWeeklyRateUsd: 880,
    desc: 'Stabilizing broken production systems, adding missing test harnesses, and eliminating architectural debt.',
  },
  website: {
    id: 'website',
    name: 'Performance-First Engineering Presence',
    baseWeeks: 2.0,
    baseRiskLoad: 0.4,
    baseWeeklyRateUsd: 520,
    desc: 'Sub-second mobile-first web presence pre-rendered with Astro, zero JS tax, and WCAG 2.2 AA accessibility.',
  },
};

export const INTEGRATION_RAILS: Record<string, IntegrationRail> = {
  mtn_momo: {
    id: 'mtn_momo',
    name: 'MTN Mobile Money (Uganda / Regional)',
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
    deliverables: ['Existing API & data schema audit', 'Operational bottleneck mapping', 'Exclusions contract'],
    exitGate: 'Written problem statement signed by both parties.',
  },
  {
    stageNumber: 2,
    stageName: 'Stage 02: Deterministic Specification',
    weight: 0.14,
    minFloor: 0.5,
    deliverables: ['Interface contracts (OpenAPI/JSON)', 'Idempotency & state-machine schemas', 'Fixed pricing & acceptance criteria'],
    exitGate: 'Acceptance checklist agreed with 0 unverified assumptions.',
  },
  {
    stageNumber: 3,
    stageName: 'Stage 03: Architectural Prototype & Core Rules',
    weight: 0.20,
    minFloor: 0.5,
    deliverables: ['Decimal precision arithmetic core', 'Sandbox payment simulator', 'Automated test harness'],
    exitGate: '100% test pass on golden reconciliation test vectors.',
  },
  {
    stageNumber: 4,
    stageName: 'Stage 04: Production Implementation & Integration',
    weight: 0.34,
    minFloor: 1.0,
    deliverables: ['Working integration adapters (MTN/Airtel/EFRIS)', 'Fail-closed state persistence', 'Security credential isolation'],
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
    deliverables: ['100% source code repository transfer', 'Infrastructure credentials handover', 'Operating documentation'],
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

export function roundToIncrement(value: number, increment: number): number {
  if (increment <= 0) return Math.round(value);
  return Math.max(increment, Math.round(value / increment) * increment);
}

export function formatCurrencyAmount(amount: number, currency: CurrencyCode): string {
  const spec = CURRENCIES[currency] || CURRENCIES.UGX;
  const formattedNumber = amount.toLocaleString('en-US');
  if (spec.code === 'USD' || spec.code === 'EUR' || spec.code === 'GBP') {
    return `${spec.symbol}${formattedNumber}`;
  }
  return `${spec.symbol} ${formattedNumber}`;
}

export function formatCurrencyRange(minAmount: number, maxAmount: number, currency: CurrencyCode): string {
  return `${formatCurrencyAmount(minAmount, currency)} – ${formatCurrencyAmount(maxAmount, currency)}`;
}

/**
 * Logarithmic technical risk scoring:
 * Maps raw additive complexity load onto a 1–10 scale via 1 + k * ln(1 + load)
 * so single-rail baseline builds stay LOW/MODERATE without saturating prematurely,
 * while true multi-rail + compliance + mission-critical loads scale into HIGH/CRITICAL.
 */
export function computeLogarithmicRiskScore(rawRiskLoad: number): number {
  const boundedLoad = Math.max(0, rawRiskLoad);
  const logScaled = 1 + 3.15 * Math.log1p(boundedLoad);
  return Math.min(10, Math.max(1, Math.round(logScaled)));
}

export function calculateScope(inputs: ScopingInputs): ScopingResult {
  const archetype = ARCHETYPES[inputs.archetypeId] || ARCHETYPES.custom_portal;
  const regionId: EconomicRegionCode =
    inputs.regionId && ECONOMIC_REGIONS[inputs.regionId] ? inputs.regionId : 'uganda';
  const regionSpec = ECONOMIC_REGIONS[regionId];
  const currency: CurrencyCode =
    inputs.currency && CURRENCIES[inputs.currency] ? inputs.currency : regionSpec.defaultCurrency;
  const currencySpec = CURRENCIES[currency];

  let stageEffortDriverWeeks = archetype.baseWeeks;
  let rawRiskLoad = archetype.baseRiskLoad;

  // Add rails complexity & integration dependency load
  const sortedRails = [...inputs.selectedRails].sort();
  for (const railId of sortedRails) {
    const rail = INTEGRATION_RAILS[railId];
    if (rail) {
      stageEffortDriverWeeks += rail.complexityWeeks;
      rawRiskLoad += rail.riskWeight;
    }
  }

  // Add compliance engineering effort & verification load
  const sortedCompliance = [...inputs.complianceRequirements].sort();
  for (const compId of sortedCompliance) {
    const comp = COMPLIANCE_ITEMS[compId];
    if (comp) {
      stageEffortDriverWeeks += comp.complexityWeeks;
      rawRiskLoad += comp.riskWeight;
    }
  }

  // Throughput tier adjustments
  if (inputs.throughputTier === 'high') {
    stageEffortDriverWeeks *= 1.15;
    rawRiskLoad += 2.4;
  } else if (inputs.throughputTier === 'mission_critical') {
    stageEffortDriverWeeks *= 1.32;
    rawRiskLoad += 6.5;
  }

  const roundedRawLoad = +rawRiskLoad.toFixed(2);
  const riskScore = computeLogarithmicRiskScore(roundedRawLoad);
  const riskLevel: ScopingResult['riskLevel'] =
    riskScore <= 3 ? 'LOW' : riskScore <= 6 ? 'MODERATE' : riskScore <= 8 ? 'HIGH' : 'CRITICAL';

  // 1. Compute 6-stage milestone breakdown in 0.5-week increments with explicit governance floors
  const milestonePhases: MilestonePhase[] = STAGE_DEFINITIONS.map((stage) => {
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

  // 2. Derive headline timeline DIRECTLY from the sum of milestone weeks (no independent headline estimate)
  const milestoneTotalWeeks = +milestonePhases.reduce((sum, phase) => sum + phase.weeks, 0).toFixed(1);
  const estimatedWeeksMin = milestoneTotalWeeks;

  // Contingency buffer is applied purely as a UAT/sandbox range atop milestoneTotalWeeks
  const bufferRatio = riskScore >= 7 ? 0.25 : riskScore >= 4 ? 0.20 : 0.15;
  const bufferedMax = Math.ceil(milestoneTotalWeeks * (1 + bufferRatio) * 2) / 2;
  const estimatedWeeksMax = Math.max(estimatedWeeksMin + 0.5, bufferedMax);
  const contingencyWeeks = +(estimatedWeeksMax - estimatedWeeksMin).toFixed(1);

  // 3. Economy/Region + Risk + Archetype-aware pricing
  // Base rate starts from Uganda (1.0x) weekly rate and scales by target client economy multiplier
  const regionalWeeklyRateUsd = archetype.baseWeeklyRateUsd * regionSpec.economicMultiplier;
  const riskPriceMultiplier = +(1 + Math.max(0, riskScore - 2) * 0.06).toFixed(2);
  const baseUsdCost = milestoneTotalWeeks * regionalWeeklyRateUsd * riskPriceMultiplier;
  const maxSpread = 1.2 + (riskScore >= 7 ? 0.08 : 0);

  const budgetMinUsd = roundToIncrement(baseUsdCost * 0.9, CURRENCIES.USD.roundTo);
  const budgetMaxUsd = Math.max(
    budgetMinUsd + 200,
    roundToIncrement(baseUsdCost * maxSpread, CURRENCIES.USD.roundTo)
  );

  const budgetMin = roundToIncrement(budgetMinUsd * currencySpec.ratePerUsd, currencySpec.roundTo);
  const budgetMax = Math.max(
    budgetMin + currencySpec.roundTo,
    roundToIncrement(budgetMaxUsd * currencySpec.ratePerUsd, currencySpec.roundTo)
  );

  const suggestedTier = formatCurrencyRange(budgetMin, budgetMax, currency);
  const referenceEquivalent =
    currency === 'USD'
      ? `≈ ${formatCurrencyRange(
          roundToIncrement(budgetMinUsd * CURRENCIES.UGX.ratePerUsd, CURRENCIES.UGX.roundTo),
          roundToIncrement(budgetMaxUsd * CURRENCIES.UGX.ratePerUsd, CURRENCIES.UGX.roundTo),
          'UGX'
        )} UGX FX equivalent`
      : `≈ ${formatCurrencyRange(budgetMinUsd, budgetMaxUsd, 'USD')} USD planning equivalent`;

  const pricingBasisNote = `${regionSpec.label} (${regionSpec.economicMultiplier}× economic index) · ${archetype.name} complexity, ${milestoneTotalWeeks}-week milestone sum, and ${riskScore}/10 (${riskLevel}) logarithmic risk multiplier (×${riskPriceMultiplier}).`;

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

  const rawSeed = `${inputs.archetypeId}-${sortedRails.join(',')}-${sortedCompliance.join(',')}-${inputs.throughputTier}-${milestoneTotalWeeks}-${regionId}-${currency}`;
  const verificationHash = simpleHash(rawSeed);

  const clientHeader = inputs.clientName ? `Prepared for: ${inputs.clientName}` : 'Technical Scope Memorandum';

  const memorandumMarkdown = `# EULOK Architecture & Scoping Memorandum
${clientHeader}
Target Economy: ${regionSpec.label} (${regionSpec.economicMultiplier}× PPP Index)
Reference Hash: ${verificationHash}
Date: ${new Date().toISOString().split('T')[0]}

## 1. System Archetype
**${archetype.name}**
${archetype.desc}

## 2. Integrated Rails & Boundaries
${sortedRails.length > 0
  ? sortedRails.map((r) => `- **${INTEGRATION_RAILS[r]?.name}**: ${INTEGRATION_RAILS[r]?.notes}`).join('\n')
  : '- Standard decoupled internal architecture (no external rail dependencies).'}

## 3. Compliance & Governance Posture
${sortedCompliance.length > 0
  ? sortedCompliance.map((c) => `- **${COMPLIANCE_ITEMS[c]?.name}**: ${COMPLIANCE_ITEMS[c]?.standard}`).join('\n')
  : '- Baseline security and confidential data isolation standards.'}

## 4. Delivery Estimation, Logarithmic Risk & Regional Budget (${currency})
- **Baseline Milestone Sum (6 Stages):** ${estimatedWeeksMin} calendar weeks (derived directly from sum of stage milestones below)
- **External Sandbox / UAT Contingency:** +${contingencyWeeks} ${contingencyWeeks === 1 ? 'week' : 'weeks'} (Total range: ${estimatedWeeksMin}–${estimatedWeeksMax} weeks)
- **Technical Risk Assessment (Logarithmic Scale):** ${riskScore} / 10 (${riskLevel}) [load: ${roundedRawLoad}]
- **Target Region & Market Economy:** ${regionSpec.label} — ${regionSpec.marketContext}
- **Planning Investment Bracket (${currency}):** ${suggestedTier} (${referenceEquivalent})
- **Sizing Basis:** ${pricingBasisNote} Formal contractual fee is fixed upon Stage 02 sign-off.

## 5. Architectural Quality Controls
${architecturalControls.map((ctrl) => `- ${ctrl}`).join('\n')}

## 6. Milestone Delivery Sequence
${milestonePhases
  .map(
    (p) => `### ${p.stageName} (${p.weeks} ${p.weeks === 1 ? 'wk' : 'wks'})${p.floorNote ? ` — *${p.floorNote}*` : ''}
Deliverables: ${p.deliverables.join(', ')}
Exit Gate: ${p.exitGate}`
  )
  .join('\n\n')}

---
*Governed by EULOK Delivery Commitments: "Models propose. Deterministic systems decide."*
`;

  return {
    archetypeName: archetype.name,
    milestoneTotalWeeks,
    estimatedWeeksMin,
    estimatedWeeksMax,
    contingencyWeeks,
    rawRiskLoad: roundedRawLoad,
    riskScore,
    riskLevel,
    regionId,
    regionLabel: regionSpec.label,
    economicMultiplier: regionSpec.economicMultiplier,
    currency,
    budgetMin,
    budgetMax,
    budgetMinUsd,
    budgetMaxUsd,
    suggestedTier,
    referenceEquivalent,
    pricingBasisNote,
    milestonePhases,
    architecturalControls,
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
  if (inputs.regionId) params.set('region', inputs.regionId);
  if (inputs.currency) params.set('cur', inputs.currency);
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

  const region = params.get('region');
  if (region && region in ECONOMIC_REGIONS) {
    parsed.regionId = region as EconomicRegionCode;
  }

  const cur = params.get('cur');
  if (cur && cur in CURRENCIES) {
    parsed.currency = cur as CurrencyCode;
  }

  const client = params.get('client');
  if (client) {
    parsed.clientName = client.slice(0, 120);
  }

  return parsed;
}

