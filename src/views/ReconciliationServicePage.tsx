import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';
import { EditorialVisual } from '../components/EditorialVisual';

interface ReconciliationServicePageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const ReconciliationServicePage: React.FC<ReconciliationServicePageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
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
            <span aria-current="page">Reconciliation</span>
          </nav>

          <div className="split-feature-grid" style={{ gap: 'clamp(28px, 4vw, 48px)' }}>
            <div>
              <span className="eyebrow">East African Financial Operations · Traceability</span>
              <h1 style={{ fontSize: 'clamp(2.3rem, 5vw, 4rem)', marginBottom: '20px' }}>
                Know which records match—and which do not.
              </h1>
              <p className="lead" style={{ maxWidth: '60ch', marginBottom: '24px' }}>
                Automate MTN MoMo, Airtel Money, and bank settlement reconciliation with exact integer precision, visible exception queues, and auditable proof behind every resolution.
              </p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => onNavigate('ops-suite')}
              >
                Launch Interactive Reconciliation Engine →
              </button>
            </div>

            <EditorialVisual
              webpSrc="/images/rails-topology.webp"
              fallbackSrc="/images/rails-topology.jpg"
              alt="Clean interconnected financial conduits representing automated ledger reconciliation"
              aspectRatio="4/3"
              priority
              kicker="LEDGER CORE · R1–R8"
              caption="Multi-rail MTN, Airtel, and bank statement matching with isolated refunds and audit hashes."
            />
          </div>
        </div>
      </section>

      {/* The Problem & Capabilities */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div className="governance-grid">
            <div>
              <span className="eyebrow">The Problem</span>
              <h2>Manual matching is hard to audit and breaks at scale.</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '16px' }}>
                Mobile-money statements, bank exports, school or SACCO fee ledgers, and invoices describe identical funds using mismatched references or delayed clearing dates.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                Spreadsheet VLOOKUPs silently miss partial allocations, double-credit retried callbacks, or blur refunds into incoming revenue. Rules are calibrated against representative client exports before go-live.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <span className="card-number">EXPLAINABLE MATCHING</span>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '12px' }}>Deterministic Engine Capabilities</h3>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
                <li>Ingest and normalize CSV, Excel, and carrier webhook payment feeds.</li>
                <li>Match payments by reference, minor-unit integer amount, and clearing window.</li>
                <li>Isolate duplicate webhook retries, overpayments, refunds, and reversals.</li>
                <li>Route ambiguous deposits directly to an accountable finance review queue.</li>
                <li>Record operator approval rationale and export signed audit summaries.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Typical Deliverables */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '680px', marginBottom: '32px' }}>
            <span className="eyebrow">Typical Deliverables</span>
            <h2>What a reconciliation engagement delivers</h2>
          </div>
          <div className="grid-3">
            <article className="card">
              <span className="card-number">01 / SPECIFICATION</span>
              <h3 style={{ fontSize: '1.22rem', marginBottom: '10px' }}>Source &amp; Rule Map</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Inventory of carrier and bank formats, field normalization rules, and explicit matching precedence.
              </p>
            </article>
            <article className="card">
              <span className="card-number">02 / PIPELINE</span>
              <h3 style={{ fontSize: '1.22rem', marginBottom: '10px' }}>Reconciliation Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Repeatable batch or real-time ledger imports backed by exact decimal math and an exception desk.
              </p>
            </article>
            <article className="card">
              <span className="card-number">03 / AUDIT</span>
              <h3 style={{ fontSize: '1.22rem', marginBottom: '10px' }}>Audit Evidence &amp; Reports</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Traceable transaction IDs, daily settlement summaries, and recorded human approval trails.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Controls & Next Step */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div className="governance-grid">
            <div className="card" style={{ padding: '26px' }}>
              <span className="eyebrow">Financial Controls</span>
              <h2 style={{ fontSize: '1.5rem' }}>Financial correctness is the boundary.</h2>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
                <li>Raw carrier and bank records stay immutable; adjustments append auditable corrections.</li>
                <li>Matches run strictly on deterministic, agreed rules—never unverified guesses.</li>
                <li>Ambiguous entries remain escalated rather than auto-closed for cleaner dashboards.</li>
                <li>Restricted ledger access enforces strict role separation and explicit tolerances.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: '26px', borderColor: 'var(--line-strong)', alignSelf: 'start' }}>
              <span className="eyebrow">Next Step</span>
              <h2 style={{ fontSize: '1.5rem' }}>Start with a representative sample.</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '22px' }}>
                Share your payment rails, file exports, and where discrepancies occur today. We define clear matching rules and a testable engineering scope.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={onOpenIntakeModal}
                >
                  Discuss reconciliation <span aria-hidden="true">↗</span>
                </button>
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={() => onNavigate('services/finance-integrations')}
                >
                  Related: finance integrations →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
