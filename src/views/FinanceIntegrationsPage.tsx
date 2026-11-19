import { navigateTo, openIntakeModal, type IntakePrefillContext } from '../utils/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import {
  Send,
  RotateCcw,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Copy,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import {
  WEBHOOK_SCENARIOS,
  simulateWebhookDelivery,
  type WebhookScenarioId,
  type WebhookSimulationResult,
} from '../engine/webhookSandbox';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const LazyFinancePerformanceDashboard = React.lazy(() =>
  import('../components/FinancePerformanceDashboard').then((mod) => ({
    default: mod.FinancePerformanceDashboard,
  }))
);

interface FinanceIntegrationsPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: (serviceOrContext?: string | IntakePrefillContext) => void;
}

const REFERENCE_HANDLER_SNIPPET = `import crypto from 'node:crypto';

export async function handlePaymentWebhook(req, ledgerDb) {
  const signature = req.headers['x-provider-signature'] ?? '';
  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SIGNING_SECRET!)
    .update(req.rawBody)
    .digest('hex');

  // 1. Fail-closed constant-time signature gate
  const sigBuf = Buffer.from(String(signature));
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { status: 401, body: 'Unauthorized: invalid HMAC signature' };
  }

  // 2. Atomic idempotency claim (unique constraint on provider event hash)
  const inserted = await ledgerDb.claimIdempotencyKey(req.body.idempotencyKey);
  if (!inserted) {
    return { status: 200, body: 'Already processed (idempotent no-op)' };
  }

  // 3. Buffer cleanly if upstream tax/EFRIS endpoint times out
  return ledgerDb.commitMinorUnitsTransaction(req.body);
}`;

const INITIAL_PRE_COMMITTED_KEYS = [WEBHOOK_SCENARIOS.duplicate_webhook_retry.idempotencyKey];

export const FinanceIntegrationsPage: React.FC<FinanceIntegrationsPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<WebhookScenarioId>('valid_momo_settlement');
  const [processedKeys, setProcessedKeys] = useState<string[]>(INITIAL_PRE_COMMITTED_KEYS);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  const [ledgerCount, setLedgerCount] = useState<number>(0);
  const [queuedCount, setQueuedCount] = useState<number>(0);
  const [rejectedCount, setRejectedCount] = useState<number>(0);
  const [lastResult, setLastResult] = useState<WebhookSimulationResult | null>(null);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);

  const activeScenario = WEBHOOK_SCENARIOS[selectedScenarioId];

  const handleDispatch = (overrideScenarioId?: WebhookScenarioId) => {
    const targetId = overrideScenarioId || selectedScenarioId;
    const scenario = WEBHOOK_SCENARIOS[targetId];
    const result = simulateWebhookDelivery(scenario, new Set(processedKeys));
    setLastResult(result);

    if (result.decision === 'LEDGER_CREDITED') {
      setProcessedKeys((prev) => (prev.includes(scenario.idempotencyKey) ? prev : [...prev, scenario.idempotencyKey]));
      setLedgerCount((c) => c + result.ledgerWritesDelta);
    } else if (result.decision === 'BUFFERED_RETRY_QUEUE') {
      setQueuedCount((q) => q + 1);
    } else if (result.decision === 'REJECTED_FAIL_CLOSED') {
      setRejectedCount((r) => r + 1);
    }
  };

  const handleResetSandbox = () => {
    setProcessedKeys(INITIAL_PRE_COMMITTED_KEYS);
    setLedgerCount(0);
    setQueuedCount(0);
    setRejectedCount(0);
    setLastResult(null);
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(REFERENCE_HANDLER_SNIPPET);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const statusBadgeClass =
    lastResult?.httpStatus === 200
      ? 'badge-pass'
      : lastResult?.httpStatus === 202
      ? 'badge-warn'
      : 'badge-fail';

  return (
    <>
      {/* Hero */}
      <section className="section-full theme-dark band-hero">
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <button type="button" onClick={() => onNavigate('services')}>Services</button>
            <span className="separator">/</span>
            <span aria-current="page">Finance integrations</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">Integration · Payments · Business systems</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)', marginBottom: '20px', maxWidth: '22ch' }}>
              Make your systems agree on what happened.
            </h1>
            <p className="lead" style={{ maxWidth: '66ch', marginBottom: '24px' }}>
              Connect payment, invoicing, accounting and operational tools without treating one successful API response as proof that the whole business process completed.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button-primary"
                onClick={() =>
                  onOpenIntakeModal({
                    need: 'Connect payments or business tools',
                    systemType: 'Mobile Money (MTN/Airtel) & URA EFRIS integration',
                  })
                }
              >
                Discuss an integration ↗
              </button>
              <a href="#webhook-sandbox" className="button button-quiet">
                Test Webhook Idempotency Sandbox ↓
              </a>
              <a href="#performance-telemetry" className="button button-quiet">
                Throughput &amp; Error Dashboard ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problems We Address */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div className="governance-grid">
            <div>
              <span className="eyebrow">Problems we address</span>
              <h2>Eliminate manual re-entry without hiding failures.</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, margin: 0 }}>
                When operations staff copy transactions between mobile-money portals, accounting software, and POS systems, records fall out of sync. We architect integrations with explicit states, cryptographic signatures, and clean recovery queues.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.08rem', margin: '0 0 12px' }}>Core Integration Safeguards</h3>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
                <li>MTN MoMo &amp; Airtel Money collection and disbursement adapters.</li>
                <li>Signed URA EFRIS fiscalization workflows with offline store-and-forward queuing.</li>
                <li>CRM, invoicing, ERP, and accounting ledger synchronization.</li>
                <li>Distributed idempotency keys preventing duplicate credits on network retries.</li>
                <li>Auditable exception queues and clean manual replay controls.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Webhook Signature & Idempotency Sandbox */}
      <section className="section-full theme-dark band-section" id="webhook-sandbox">
        <div className="container-expansive">
          <div style={{ maxWidth: '72ch' }}>
            <span className="eyebrow">Interactive Engineering Sandbox · Fail-Closed Boundaries</span>
            <h2>Webhook Signature &amp; Idempotency Replay Simulator</h2>
            <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '20px' }}>
              Mobile-money gateways resend identical webhooks when carrier networks time out. Test how our payment adapters verify HMAC-SHA256 signatures, deduplicate retries atomically, and buffer EFRIS timeouts without corrupting your ledger.
            </p>
          </div>

          <div className="card" style={{ borderColor: 'var(--line-strong)', padding: 'clamp(18px, 3vw, 28px)' }}>
            {/* Scenario Selector Buttons */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Select Carrier / Failure Scenario
              </span>
              <div role="group" aria-label="Webhook test scenario" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(Object.values(WEBHOOK_SCENARIOS)).map((scenario) => {
                  const isActive = scenario.id === selectedScenarioId;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      aria-pressed={isActive}
                      className={`button button-small ${isActive ? 'button-primary' : 'button-quiet'}`}
                      onClick={() => setSelectedScenarioId(scenario.id)}
                    >
                      {scenario.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '20px',
                alignItems: 'start',
              }}
            >
              {/* Left: Payload & Cryptographic Gate */}
              <div className="surface-inset" style={{ padding: '16px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>INCOMING REQUEST PAYLOAD</span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {activeScenario.provider}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>event_id:</span> <code>{activeScenario.eventId}</code></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>invoice_ref:</span> <code>{activeScenario.invoiceRef}</code></div>
                  <div style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <span style={{ color: 'var(--text-muted)' }}>amount:</span>{' '}
                    <strong>{activeScenario.amountUgx.toLocaleString('en-US')} UGX</strong>
                  </div>
                  <div style={{ overflowWrap: 'anywhere' }}>
                    <span style={{ color: 'var(--text-muted)' }}>idempotency_key:</span>{' '}
                    <code>{activeScenario.idempotencyKey}</code>
                  </div>
                  <div style={{ overflowWrap: 'anywhere' }}>
                    <span style={{ color: 'var(--text-muted)' }}>x_signature:</span>{' '}
                    <code style={{ color: activeScenario.signatureHeader === activeScenario.expectedSignature ? 'var(--status-pass-text)' : 'var(--status-fail-text)' }}>
                      {activeScenario.signatureHeader}
                    </code>
                  </div>
                  <div style={{ overflowWrap: 'anywhere' }}>
                    <span style={{ color: 'var(--text-muted)' }}>upstream_efris:</span>{' '}
                    <code>{activeScenario.upstreamAvailable ? 'REACHABLE (200ms)' : 'TIMEOUT (>5000ms)'}</code>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    className="button button-primary button-small"
                    onClick={() => handleDispatch()}
                  >
                    <Send size={14} />
                    <span>Dispatch Event</span>
                  </button>
                  <button
                    type="button"
                    className="button button-quiet button-small"
                    onClick={() => handleDispatch(selectedScenarioId)}
                    title="Send the identical event payload again to verify idempotency"
                  >
                    <RefreshCw size={14} />
                    <span>Replay Same Event</span>
                  </button>
                  <button
                    type="button"
                    className="button button-quiet button-small"
                    onClick={handleResetSandbox}
                  >
                    <RotateCcw size={14} />
                    <span>Reset Sandbox State</span>
                  </button>
                </div>
              </div>

              {/* Right: Ledger Counters & Deterministic Trace Output */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                  <div className="surface-inset" style={{ padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>LEDGER COMMITS</span>
                    <strong data-testid="sandbox-ledger-count" style={{ fontSize: '1.35rem', color: 'var(--status-pass-text)', fontVariantNumeric: 'tabular-nums' }}>
                      {ledgerCount}
                    </strong>
                  </div>
                  <div className="surface-inset" style={{ padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>RETRY QUEUED</span>
                    <strong style={{ fontSize: '1.35rem', color: 'var(--status-warn-text)', fontVariantNumeric: 'tabular-nums' }}>
                      {queuedCount}
                    </strong>
                  </div>
                  <div className="surface-inset" style={{ padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>401 REJECTED</span>
                    <strong style={{ fontSize: '1.35rem', color: 'var(--status-fail-text)', fontVariantNumeric: 'tabular-nums' }}>
                      {rejectedCount}
                    </strong>
                  </div>
                </div>

                <div
                  className="surface-inset"
                  style={{ padding: '16px', borderRadius: '10px', minHeight: '170px' }}
                  aria-live="polite"
                >
                  {!lastResult ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '6px' }}>
                        Ready to test adapter boundaries
                      </strong>
                      Select a scenario and click <strong>Dispatch Event</strong>. Try dispatching a valid settlement, then click <strong>Replay Same Event</strong> to confirm ledger commits stay strictly at <code>1</code>.
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span className={`badge ${statusBadgeClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {lastResult.httpStatus === 200 ? (
                            <ShieldCheck size={13} />
                          ) : lastResult.httpStatus === 202 ? (
                            <Clock size={13} />
                          ) : (
                            <ShieldAlert size={13} />
                          )}
                          {lastResult.statusLabel}
                        </span>
                        <span className="mono-tag" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Δ LEDGER: +{lastResult.ledgerWritesDelta}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 12px', fontSize: '0.88rem', color: 'var(--warm-white)', lineHeight: 1.5 }}>
                        {lastResult.explanation}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        {lastResult.auditTrace.map((line, i) => (
                          <div key={i} className="surface-panel" style={{ padding: '4px 8px', borderRadius: '4px' }}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reference Code Drawer */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => setShowCode((prev) => !prev)}
              >
                <Code2 size={14} />
                <span>{showCode ? 'Hide TypeScript Reference Pattern' : 'Inspect TypeScript Adapter Pattern'}</span>
              </button>
              {showCode && (
                <button
                  type="button"
                  className="button button-quiet button-small"
                  onClick={handleCopyCode}
                >
                  {codeCopied ? <CheckCircle2 size={14} color="var(--status-pass-text)" /> : <Copy size={14} />}
                  <span>{codeCopied ? 'Copied Pattern' : 'Copy Snippet'}</span>
                </button>
              )}
            </div>

            {showCode && (
              <pre style={{ marginTop: '12px', marginBottom: 0 }}>
                <code>{REFERENCE_HANDLER_SNIPPET}</code>
              </pre>
            )}
          </div>
        </div>
      </section>

      <ErrorBoundary>
        {hasMounted ? (
          <Suspense
            fallback={
              <section className="section-full theme-navy band-section" id="performance-telemetry">
                <div className="container-expansive">
                  <LoadingSkeleton variant="card" count={2} />
                </div>
              </section>
            }
          >
            <LazyFinancePerformanceDashboard
              sandboxOverlay={{
                ledgerCommits: ledgerCount,
                queuedRetries: queuedCount,
                rejectedSignatures: rejectedCount,
              }}
            />
          </Suspense>
        ) : (
          <section className="section-full theme-navy band-section" id="performance-telemetry">
            <div className="container-expansive">
              <LoadingSkeleton variant="card" count={2} />
            </div>
          </section>
        )}
      </ErrorBoundary>

      {/* Uganda & EAC Context + Workflow Automation */}
      <section className="section-full theme-dark band-section" id="workflow-automation">
        <div className="container-expansive">
          <div className="governance-grid">
            <div className="card" style={{ padding: '26px' }}>
              <span className="eyebrow">Uganda &amp; East Africa Context</span>
              <h2 style={{ fontSize: '1.6rem' }}>URA EFRIS &amp; mobile-money workflows</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '14px', fontSize: '0.94rem' }}>
                We engineer resilient bridges between your POS, ERP, or billing portal and URA EFRIS interfaces, dependent on client authorization and URA onboarding. EULOK provides engineering integration rather than tax advisory.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0, fontSize: '0.92rem' }}>
                Carrier integration timelines follow MTN MoMo, Airtel Money, and commercial bank onboarding approvals, verified in live staging rather than assumed from sandbox calls.
              </p>
            </div>

            <div className="card" style={{ padding: '26px' }}>
              <span className="eyebrow">Controlled Automation</span>
              <h2 style={{ fontSize: '1.6rem' }}>Workflow automation with approval gates</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '14px', fontSize: '0.94rem' }}>
                Routine routing, document preparation, and ledger syncing run automatically while high-stakes disbursements and adjustments halt cleanly for accountable operator sign-off.
              </p>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
                <li>Explicit event triggers and idempotent duplicate guards.</li>
                <li>Bounded backoff retries with dead-letter exception queues.</li>
                <li>Traceable transaction references for end-of-day audit.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Typical Deliverables */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '680px', marginBottom: '28px' }}>
            <span className="eyebrow">Typical deliverables</span>
            <h2>What an integration engagement delivers</h2>
          </div>
          <div className="grid-3">
            <article className="card">
              <span className="card-number">01 / DESIGN</span>
              <h3 style={{ fontSize: '1.22rem', marginBottom: '10px' }}>Integration Design</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                System topology, webhook state diagrams, failure modes, and permission boundaries.
              </p>
            </article>
            <article className="card">
              <span className="card-number">02 / IMPLEMENTATION</span>
              <h3 style={{ fontSize: '1.22rem', marginBottom: '10px' }}>Tested Adapters</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Carrier and fiscal API adapters verified with HMAC signature and replay test suites.
              </p>
            </article>
            <article className="card">
              <span className="card-number">03 / OPERATIONS</span>
              <h3 style={{ fontSize: '1.22rem', marginBottom: '10px' }}>Operational Visibility</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                End-to-end correlation IDs, exception queues, and documented manual replay runbooks.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Boundaries & Next Step */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div className="governance-grid">
            <div className="card" style={{ padding: '26px' }}>
              <span className="eyebrow">Prerequisites</span>
              <h2 style={{ fontSize: '1.5rem' }}>What must be established first</h2>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
                <li>Client holds authorized ownership for every target merchant or bank account.</li>
                <li>Provider onboarding, sandbox credentials, and documentation are confirmed.</li>
                <li>Audit trails, data retention, and exception ownership rules are agreed in writing.</li>
                <li>Production cutover is verified separately from carrier sandbox endpoints.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: '26px', borderColor: 'var(--line-strong)', alignSelf: 'start' }}>
              <span className="eyebrow">Next Step</span>
              <h2 style={{ fontSize: '1.5rem' }}>Map the rails before building the adapter.</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '22px' }}>
                Tell us which systems need to synchronize and what fails when carrier callbacks time out or arrive twice.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => onOpenIntakeModal({ need: 'Connect payments or business tools' })}
                >
                  Discuss an integration <span aria-hidden="true">↗</span>
                </button>
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={() => onNavigate('services/reconciliation')}
                >
                  Related: payment reconciliation →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
