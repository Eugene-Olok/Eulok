/**
 * EULOK Deterministic Webhook Signature & Idempotency Sandbox Engine
 * Demonstrates fail-closed authentication, atomic replay deduping, and offline queue buffering
 * for Mobile Money (MTN/Airtel) and URA EFRIS payment adapters.
 */

export type WebhookScenarioId =
  | 'valid_momo_settlement'
  | 'duplicate_webhook_retry'
  | 'tampered_signature'
  | 'efris_upstream_timeout';

export interface WebhookScenarioSpec {
  id: WebhookScenarioId;
  label: string;
  provider: string;
  eventId: string;
  idempotencyKey: string;
  signatureHeader: string;
  expectedSignature: string;
  upstreamAvailable: boolean;
  amountUgx: number;
  invoiceRef: string;
}

export interface WebhookSimulationResult {
  httpStatus: 200 | 202 | 401;
  statusLabel: string;
  decision: 'LEDGER_CREDITED' | 'IDEMPOTENT_NOOP' | 'REJECTED_FAIL_CLOSED' | 'BUFFERED_RETRY_QUEUE';
  signatureVerified: boolean;
  isDuplicateReplay: boolean;
  ledgerWritesDelta: 0 | 1;
  explanation: string;
  auditTrace: string[];
}

export const WEBHOOK_SCENARIOS: Record<WebhookScenarioId, WebhookScenarioSpec> = {
  valid_momo_settlement: {
    id: 'valid_momo_settlement',
    label: '1. Valid MTN MoMo Settlement',
    provider: 'MTN MoMo Collections API',
    eventId: 'evt_mtn_90421a',
    idempotencyKey: 'idem_sha256_9b4f18e2a1',
    signatureHeader: 'sig_hmac_8c219a7e4f110b3a',
    expectedSignature: 'sig_hmac_8c219a7e4f110b3a',
    upstreamAvailable: true,
    amountUgx: 450000,
    invoiceRef: 'INV-2026-0412',
  },
  duplicate_webhook_retry: {
    id: 'duplicate_webhook_retry',
    label: '2. Duplicate Retry (Carrier 3s Timeout)',
    provider: 'Airtel Money OpenAPI',
    eventId: 'evt_airtel_77210c',
    idempotencyKey: 'idem_sha256_4d01e9a87c',
    signatureHeader: 'sig_hmac_5f901b22d84a91c0',
    expectedSignature: 'sig_hmac_5f901b22d84a91c0',
    upstreamAvailable: true,
    amountUgx: 300000,
    invoiceRef: 'INV-2026-0389',
  },
  tampered_signature: {
    id: 'tampered_signature',
    label: '3. Tampered Payload / Spoofed HMAC',
    provider: 'Unverified External Origin',
    eventId: 'evt_spoof_00019f',
    idempotencyKey: 'idem_sha256_ff10023a00',
    signatureHeader: 'sig_hmac_0000deadbeef0000',
    expectedSignature: 'sig_hmac_7a4e1190c2b3d815',
    upstreamAvailable: true,
    amountUgx: 9500000,
    invoiceRef: 'INV-2026-0412',
  },
  efris_upstream_timeout: {
    id: 'efris_upstream_timeout',
    label: '4. URA EFRIS Upstream Timeout (Offline Buffer)',
    provider: 'URA EFRIS Fiscalization Gateway',
    eventId: 'evt_efris_55129d',
    idempotencyKey: 'idem_sha256_66b21a09ee',
    signatureHeader: 'sig_hmac_3e91a044f72c18d2',
    expectedSignature: 'sig_hmac_3e91a044f72c18d2',
    upstreamAvailable: false,
    amountUgx: 1280000,
    invoiceRef: 'INV-2026-0419',
  },
};

/** Constant-time string comparison simulation matching production HMAC verification semantics */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function simulateWebhookDelivery(
  scenario: WebhookScenarioSpec,
  processedKeys: ReadonlySet<string>
): WebhookSimulationResult {
  const signatureVerified = constantTimeEqual(scenario.signatureHeader, scenario.expectedSignature);

  // Step 1: Fail-closed cryptographic verification
  if (!signatureVerified) {
    return {
      httpStatus: 401,
      statusLabel: '401 Unauthorized (Fail-Closed Reject)',
      decision: 'REJECTED_FAIL_CLOSED',
      signatureVerified: false,
      isDuplicateReplay: false,
      ledgerWritesDelta: 0,
      explanation: 'HMAC-SHA256 signature mismatch. Request rejected before touching database or idempotency store.',
      auditTrace: [
        `[GATE 1 · SIGNATURE] Constant-time HMAC comparison FAILED for ${scenario.eventId}`,
        `[SECURITY] Origin blocked with HTTP 401; security alert counter incremented`,
        `[LEDGER] 0 records mutated — fail-closed boundary preserved`,
      ],
    };
  }

  // Step 2: Atomic idempotency check
  const isDuplicateReplay = processedKeys.has(scenario.idempotencyKey);
  if (isDuplicateReplay) {
    return {
      httpStatus: 200,
      statusLabel: '200 OK (Idempotent No-Op)',
      decision: 'IDEMPOTENT_NOOP',
      signatureVerified: true,
      isDuplicateReplay: true,
      ledgerWritesDelta: 0,
      explanation:
        'Duplicate carrier retry detected via SHA-256 idempotency key. Returns 200 OK to prevent webhook suspension while guaranteeing zero double-crediting.',
      auditTrace: [
        `[GATE 1 · SIGNATURE] HMAC-SHA256 verified`,
        `[GATE 2 · IDEMPOTENCY] Key ${scenario.idempotencyKey} already committed`,
        `[LEDGER] Skipped duplicate credit for ${scenario.amountUgx.toLocaleString('en-US')} UGX on ${scenario.invoiceRef}`,
        `[RESPONSE] Returned HTTP 200 OK so carrier stops retrying`,
      ],
    };
  }

  // Step 3: Upstream / Tax Authority availability check (EFRIS buffering)
  if (!scenario.upstreamAvailable) {
    return {
      httpStatus: 202,
      statusLabel: '202 Accepted (Offline Retry Queue)',
      decision: 'BUFFERED_RETRY_QUEUE',
      signatureVerified: true,
      isDuplicateReplay: false,
      ledgerWritesDelta: 0,
      explanation:
        'Upstream tax authority / EFRIS endpoint timed out. Signed payload persisted to durable dead-letter replay queue with exponential backoff; invoice remains marked Pending Fiscal Sign-off.',
      auditTrace: [
        `[GATE 1 · SIGNATURE] HMAC-SHA256 verified`,
        `[GATE 2 · IDEMPOTENCY] Key ${scenario.idempotencyKey} reserved in PENDING state`,
        `[GATE 3 · UPSTREAM] Upstream timeout detected — queued for bounded exponential retry`,
        `[LEDGER] Invoice NOT prematurely marked fiscalized (fail-closed state)`,
      ],
    };
  }

  // Step 4: Deterministic minor-unit ledger commit
  return {
    httpStatus: 200,
    statusLabel: '200 OK (Committed Once)',
    decision: 'LEDGER_CREDITED',
    signatureVerified: true,
    isDuplicateReplay: false,
    ledgerWritesDelta: 1,
    explanation: `Valid event verified, idempotency lock acquired, and ${scenario.amountUgx.toLocaleString('en-US')} UGX committed atomically against ${scenario.invoiceRef}.`,
    auditTrace: [
      `[GATE 1 · SIGNATURE] HMAC-SHA256 verified`,
      `[GATE 2 · IDEMPOTENCY] Acquired unique key lock ${scenario.idempotencyKey}`,
      `[LEDGER] Committed +1 integer-cent entry (${scenario.amountUgx.toLocaleString('en-US')} UGX -> ${scenario.invoiceRef})`,
      `[RESPONSE] Returned HTTP 200 OK with deterministic receipt hash`,
    ],
  };
}
