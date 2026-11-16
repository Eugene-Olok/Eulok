import { navigateTo, openIntakeModal, type IntakePrefillContext } from '../utils/navigation';
import React, { useState } from 'react';
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
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={() => onNavigate('home')}>Home</button>
        <span className="separator">/</span>
        <button type="button" onClick={() => onNavigate('services')}>Services</button>
        <span className="separator">/</span>
        <span aria-current="page">Finance integrations</span>
      </nav>

      <header className="page-header">
        <p className="eyebrow">Integration · Payments · Business systems</p>
        <h1>Make your systems agree on what happened.</h1>
        <p className="lead">
          Connect payment, invoicing, accounting and operational tools without treating one successful API response as proof that the whole business process completed.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
          <button
            type="button"
            className="button button-primary button-small"
            onClick={() =>
              openIntakeModal({
                need: 'Connect payments or business tools',
                systemType: 'Mobile Money (MTN/Airtel) & URA EFRIS integration',
              })
            }
          >
            Discuss an integration ↗
          </button>
          <a href="#webhook-sandbox" className="button button-quiet button-small">
            Test Webhook Idempotency Sandbox ↓
          </a>
        </div>
      </header>

      {/* Interactive Webhook Signature & Idempotency Sandbox */}
      <section className="content-section" id="webhook-sandbox">
        <p className="eyebrow">Interactive Engineering Sandbox · Fail-Closed Boundaries</p>
        <h2>Webhook Signature &amp; Idempotency Replay Simulator</h2>
        <p style={{ maxWidth: '68ch' }}>
          Mobile-money gateways resend identical webhooks when carrier networks time out. Test how our payment adapters verify HMAC-SHA256 signatures, deduplicate retries atomically, and buffer EFRIS timeouts without corrupting your ledger.
        </p>

        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--line-strong)', padding: 'clamp(18px, 3vw, 28px)', marginTop: '20px' }}>
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
            <div style={{ padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--line)', borderRadius: '10px' }}>
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
                <div style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--line)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>LEDGER COMMITS</span>
                  <strong data-testid="sandbox-ledger-count" style={{ fontSize: '1.35rem', color: 'var(--status-pass-text)', fontVariantNumeric: 'tabular-nums' }}>
                    {ledgerCount}
                  </strong>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--line)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>RETRY QUEUED</span>
                  <strong style={{ fontSize: '1.35rem', color: 'var(--status-warn-text)', fontVariantNumeric: 'tabular-nums' }}>
                    {queuedCount}
                  </strong>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--line)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>401 REJECTED</span>
                  <strong style={{ fontSize: '1.35rem', color: 'var(--status-fail-text)', fontVariantNumeric: 'tabular-nums' }}>
                    {rejectedCount}
                  </strong>
                </div>
              </div>

              <div
                style={{ padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--line)', borderRadius: '10px', minHeight: '170px' }}
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
                        <div key={i} style={{ padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
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
      </section>

      <section className="content-section">
        <p className="eyebrow">Problems we address</p>
        <h2>Reduce manual hand-offs without hiding failure.</h2>
        <p>
          When teams re-enter transactions in multiple systems, status drifts and exceptions become hard to explain. We design integrations around explicit states, traceable events and recovery paths when dependencies fail.
        </p>
        <ul>
          <li>Payment collection and transaction-status checks where provider access and onboarding permit.</li>
          <li>API and webhook integrations with appropriate authorization and verification.</li>
          <li>CRM, invoicing, accounting and operational data synchronization.</li>
          <li>Duplicate prevention, bounded retries and idempotent processing where supported.</li>
          <li>Exception queues, reconciliation reports and audit-friendly references.</li>
        </ul>
      </section>

      <section className="content-section">
        <p className="eyebrow">Uganda context</p>
        <h2>EFRIS and mobile-money workflows</h2>
        <p>
          We can assess an integration path for an existing invoicing or accounting system and relevant URA EFRIS interfaces. Feasibility depends on current URA requirements, client authorization, available interfaces and onboarding. EULOK does not claim URA accreditation or provide tax advice.
        </p>
        <p>
          Mobile-money integration depends on the specific provider product, live-access approval, commercial terms and technical documentation. A sandbox result is not represented as proof of production readiness.
        </p>
      </section>

      <section className="content-section" id="workflow-automation">
        <p className="eyebrow">Related service</p>
        <h2>Workflow automation with control points</h2>
        <p>
          Routine work can be automated around an integration: route a follow-up, notify the responsible person, update a CRM record, prepare a report or hand off a document. Decisions with financial, legal or operational consequences retain explicit human approval unless a separately approved control model says otherwise.
        </p>
        <ul>
          <li>Defined trigger and preconditions.</li>
          <li>Duplicate-safe actions and bounded retry behavior.</li>
          <li>Visible success, failure and exception states.</li>
          <li>Human review and documented manual recovery.</li>
        </ul>
      </section>

      <section className="content-section">
        <p className="eyebrow">Typical deliverables</p>
        <h2>What an engagement can produce</h2>
        <div className="card-grid">
          <article className="card">
            <h3>Integration design</h3>
            <p>System map, event/state model, permissions, dependencies and failure modes.</p>
          </article>
          <article className="card">
            <h3>Tested adapters</h3>
            <p>Provider-specific code with contract tests and sandbox evidence where available.</p>
          </article>
          <article className="card">
            <h3>Operational visibility</h3>
            <p>Traceable identifiers, exception reporting and a defined recovery procedure.</p>
          </article>
        </div>
        <p style={{ marginTop: '16px' }}>
          Exact deliverables and acceptance criteria are agreed in writing before implementation.
        </p>
      </section>

      <section className="content-section">
        <p className="eyebrow">Boundaries</p>
        <h2>What must be established first</h2>
        <ul>
          <li>Client owns or is authorised to access every system and account in scope.</li>
          <li>Provider documentation, credentials, sandbox/live access and onboarding are confirmed.</li>
          <li>Data sensitivity, retention, permissions and audit requirements are documented.</li>
          <li>Financial records are not silently overwritten; correction and reconciliation paths are agreed.</li>
          <li>Production readiness is assessed separately from a demo or sandbox call.</li>
        </ul>
      </section>

      <section className="content-section">
        <p className="eyebrow">Next step</p>
        <h2>Map the systems before choosing the integration.</h2>
        <p>
          Describe the systems involved, where information is re-entered and what happens when a transaction fails or arrives twice.
        </p>
        <p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => onOpenIntakeModal({ need: 'Connect payments or business tools' })}
          >
            Discuss an integration <span aria-hidden="true">↗</span>
          </button>
        </p>
        <p>
          <button
            type="button"
            className="text-link"
            onClick={() => onNavigate('services/reconciliation')}
          >
            Related: payment reconciliation →
          </button>
        </p>
      </section>
    </>
  );
};
