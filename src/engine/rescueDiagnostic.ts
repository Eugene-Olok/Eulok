/**
 * EULOK Deterministic Software Rescue Diagnostic & Triage Engine
 * Evaluates existing production/stalled codebases across 8 concrete failure dimensions
 * and synthesizes P0/P1/P2 stabilization priorities with zero vague scoring.
 */

export interface DiagnosticCheck {
  id: string;
  label: string;
  question: string;
  priorityIfFailing: 'P0' | 'P1' | 'P2';
  riskWeight: number;
  failureImpact: string;
  remediationAction: string;
}

export interface RescueDiagnosticResult {
  failingChecks: DiagnosticCheck[];
  passingChecks: DiagnosticCheck[];
  p0Count: number;
  p1Count: number;
  p2Count: number;
  readinessPosture: 'STABILIZE_IMMEDIATELY' | 'CONTAINMENT_REQUIRED' | 'TARGETED_HARDENING' | 'HEALTHY_BASELINE';
  postureLabel: string;
  recommendedEngagement: string;
  estimatedDiagnosticWindow: string;
  remediationPlan: Array<{
    priority: 'P0' | 'P1' | 'P2';
    area: string;
    action: string;
  }>;
  triageSummaryMarkdown: string;
}

export const RESCUE_DIAGNOSTIC_CHECKS: DiagnosticCheck[] = [
  {
    id: 'secrets_isolated',
    label: 'Secrets & Credential Isolation',
    question: 'Are all API keys, DB credentials, and signing secrets outside Git history and rotated?',
    priorityIfFailing: 'P0',
    riskWeight: 3,
    failureImpact: 'Exposed keys allow unauthorized database reads, spoofed webhooks, and financial leakage.',
    remediationAction: 'Revoke exposed tokens immediately, scrub Git history, and enforce fail-closed env validation.',
  },
  {
    id: 'backups_verified',
    label: 'Restore-Tested Database Backups',
    question: 'Are automated encrypted database backups configured and restore-tested within 30 days?',
    priorityIfFailing: 'P0',
    riskWeight: 3,
    failureImpact: 'Unverified backups behave like zero backups during accidental drops or corrupted migrations.',
    remediationAction: 'Provision point-in-time recovery snapshots and execute an isolated staging restore verification.',
  },
  {
    id: 'idempotent_payments',
    label: 'Webhook & Payment Idempotency',
    question: 'Do payment callbacks and async jobs enforce unique idempotency keys against retries?',
    priorityIfFailing: 'P0',
    riskWeight: 3,
    failureImpact: 'Mobile money aggregator retries cause duplicate ledger credits and silent balance corruption.',
    remediationAction: 'Enforce atomic SHA-256 event fingerprinting and unique database ledger constraints.',
  },
  {
    id: 'reproducible_tests',
    label: 'Automated Regression Test Harness',
    question: 'Do critical money-moving and auth flows have automated tests that run cleanly in CI?',
    priorityIfFailing: 'P1',
    riskWeight: 2,
    failureImpact: 'Every bug fix risks silently breaking unrelated core production workflows.',
    remediationAction: 'Record golden-path & edge-case tests around critical state transitions before refactoring.',
  },
  {
    id: 'fail_closed_boundaries',
    label: 'Fail-Closed External Boundaries',
    question: 'When third-party APIs (telco, bank, tax authority) time out, does the system halt cleanly rather than corrupt state?',
    priorityIfFailing: 'P1',
    riskWeight: 2,
    failureImpact: 'Timeout cascades mark failed disbursements as settled or strand user sessions mid-write.',
    remediationAction: 'Introduce explicit state machines with bounded retries, dead-letter queues, and human escalation.',
  },
  {
    id: 'repeatable_deploy',
    label: 'Repeatable Deploy & Rollback',
    question: 'Can the app be deployed and rolled back cleanly via scripted pipelines without manual SSH edits?',
    priorityIfFailing: 'P1',
    riskWeight: 2,
    failureImpact: 'Live server hotfixes create undocumented drift and multi-hour outages when releases fail.',
    remediationAction: 'Freeze ad-hoc server changes, codify reproducible build/deploy scripts, and document rollback.',
  },
  {
    id: 'observability_logs',
    label: 'Structured Exception Visibility',
    question: 'Are unhandled exceptions, webhook rejects, and slow queries captured in actionable audit logs?',
    priorityIfFailing: 'P2',
    riskWeight: 1,
    failureImpact: 'Failures decay silently until customers report missing funds or broken screens days later.',
    remediationAction: 'Add structured correlation IDs, exception queues, and redaction-safe diagnostic logging.',
  },
  {
    id: 'architecture_ownership',
    label: 'Documentation & Sovereign Handover',
    question: 'Does your internal team hold admin access to Git repos, domain DNS, cloud accounts, and runbooks?',
    priorityIfFailing: 'P2',
    riskWeight: 1,
    failureImpact: 'Former contractor lock-in prevents security patching or team transitions.',
    remediationAction: 'Consolidate repository, DNS, and cloud root billing ownership directly under client accounts.',
  },
];

export function evaluateRescueReadiness(passingCheckIds: string[]): RescueDiagnosticResult {
  const passSet = new Set(passingCheckIds);
  const passingChecks = RESCUE_DIAGNOSTIC_CHECKS.filter((c) => passSet.has(c.id));
  const failingChecks = RESCUE_DIAGNOSTIC_CHECKS.filter((c) => !passSet.has(c.id));

  const p0Fails = failingChecks.filter((c) => c.priorityIfFailing === 'P0');
  const p1Fails = failingChecks.filter((c) => c.priorityIfFailing === 'P1');
  const p2Fails = failingChecks.filter((c) => c.priorityIfFailing === 'P2');

  let readinessPosture: RescueDiagnosticResult['readinessPosture'] = 'HEALTHY_BASELINE';
  let postureLabel = 'Healthy Operational Baseline';
  let recommendedEngagement = 'Targeted Performance / Architecture Review';
  let estimatedDiagnosticWindow = '3–5 engineering days';

  if (p0Fails.length >= 2 || failingChecks.length >= 6) {
    readinessPosture = 'STABILIZE_IMMEDIATELY';
    postureLabel = 'P0 Emergency Stabilization Required';
    recommendedEngagement = 'Fixed-Scope P0 Containment & 2-Week Rescue Diagnostic';
    estimatedDiagnosticWindow = '5–10 engineering days (immediate security/data containment first)';
  } else if (p0Fails.length === 1 || p1Fails.length >= 2) {
    readinessPosture = 'CONTAINMENT_REQUIRED';
    postureLabel = 'Active Production Fragility Detected';
    recommendedEngagement = '1–2 Week Structured Codebase Audit & Test Harness Sprint';
    estimatedDiagnosticWindow = '5–7 engineering days';
  } else if (failingChecks.length >= 1) {
    readinessPosture = 'TARGETED_HARDENING';
    postureLabel = 'Targeted Reliability Hardening Recommended';
    recommendedEngagement = 'Bounded Refactoring & Release Gate Hardening';
    estimatedDiagnosticWindow = '3–5 engineering days';
  }

  // Sort P0 -> P1 -> P2 cleanly
  const priorityOrder = { P0: 0, P1: 1, P2: 2 };
  const remediationPlan = [...failingChecks]
    .sort((a, b) => priorityOrder[a.priorityIfFailing] - priorityOrder[b.priorityIfFailing])
    .map((item) => ({
      priority: item.priorityIfFailing,
      area: item.label,
      action: item.remediationAction,
    }));

  const triageSummaryMarkdown = `# EULOK Software Rescue Triage Report
Posture: ${postureLabel}
Passing Controls: ${passingChecks.length} / ${RESCUE_DIAGNOSTIC_CHECKS.length}
Priority Breakdown: ${p0Fails.length} P0 · ${p1Fails.length} P1 · ${p2Fails.length} P2
Recommended Next Step: ${recommendedEngagement} (${estimatedDiagnosticWindow})

## Prioritized Remediation Queue
${remediationPlan.length > 0
  ? remediationPlan.map((r) => `- **[${r.priority}] ${r.area}**: ${r.action}`).join('\n')
  : '- All 8 baseline readiness checks verified. Proceed to targeted optimization or feature roadmap.'}
`;

  return {
    failingChecks,
    passingChecks,
    p0Count: p0Fails.length,
    p1Count: p1Fails.length,
    p2Count: p2Fails.length,
    readinessPosture,
    postureLabel,
    recommendedEngagement,
    estimatedDiagnosticWindow,
    remediationPlan,
    triageSummaryMarkdown,
  };
}
