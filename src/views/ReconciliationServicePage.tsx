import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';

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

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">Finance operations · Traceability · Exceptions</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)', marginBottom: '20px', maxWidth: '22ch' }}>
              Know which records match—and which do not.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch', marginBottom: 0 }}>
              Make reconciliation repeatable with explicit matching rules, visible exceptions and evidence behind every resolution.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '72ch' }}>
            <span className="eyebrow">The problem</span>
            <h2>Manual matching is hard to audit and harder to scale.</h2>
            <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, margin: 0 }}>
              Payment exports, bank statements, invoices and internal records may describe the same activity using different references or timing. A useful process distinguishes a confirmed match from a likely match, an unmatched item and an unresolved data problem.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Engine */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '72ch' }}>
            <span className="eyebrow">Interactive Engine</span>
            <h2>Try Product 1: The Reconciliation Agent</h2>
            <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '24px' }}>
              We provide a deterministic, zero-LLM reconciliation engine for mobile money payments, bank files, and obligations ledger. It executes rules R1 through R8 with mathematical precision.
            </p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => onNavigate('ops-suite')}
            >
              Launch Interactive Reconciliation Workspace →
            </button>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '72ch' }}>
            <span className="eyebrow">Capabilities</span>
            <h2>Designed for explainable matching</h2>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '18px' }}>
              <li>Import and normalize approved source files or system feeds.</li>
              <li>Apply agreed matching rules using reference, amount, date and validated fields.</li>
              <li>Detect duplicates, missing records, amount differences and timing differences.</li>
              <li>Route ambiguous or unmatched items to a human review queue.</li>
              <li>Record evidence and decisions associated with each exception.</li>
              <li>Produce period summaries and drill-down reports for operational review.</li>
            </ul>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              Rules are agreed against the client&apos;s actual data and risk tolerance. No match-rate guarantee is made before representative data has been assessed.
            </p>
          </div>
        </div>
      </section>

      {/* Typical Deliverables */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '680px', marginBottom: '28px' }}>
            <span className="eyebrow">Typical deliverables</span>
            <h2>What the client receives</h2>
          </div>
          <div className="grid-3">
            <article className="card">
              <span className="card-number">01 / SPECIFICATION</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Source and rule map</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Source inventory, field mapping, matching precedence and known data-quality limits.
              </p>
            </article>
            <article className="card">
              <span className="card-number">02 / PIPELINE</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Reconciliation workflow</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Repeatable imports, matching outcomes and an explicit exception path.
              </p>
            </article>
            <article className="card">
              <span className="card-number">03 / AUDIT</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Evidence and reports</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Traceable references, period summaries and documented review/approval steps.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '72ch' }}>
            <span className="eyebrow">Controls</span>
            <h2>Financial correctness is the boundary</h2>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>
              <li>Source records remain preserved; corrections are recorded rather than silently overwriting history.</li>
              <li>Automated matches use deterministic rules agreed with the client.</li>
              <li>Ambiguous items are not forced into a match to improve a dashboard.</li>
              <li>Access to restricted financial data is limited to approved systems and people.</li>
              <li>Cut-off times, tolerances and exception ownership are explicit.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Next Step */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '68ch' }}>
            <span className="eyebrow">Next step</span>
            <h2>Start with a representative sample.</h2>
            <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '24px' }}>
              Describe the source systems, file formats, current matching process and the discrepancies that take the most time to resolve. We can define an assessment and a testable scope.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
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
      </section>
    </>
  );
};
