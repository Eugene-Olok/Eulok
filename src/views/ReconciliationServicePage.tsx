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
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('home')}>Home</button>
        <span className="separator">/</span>
        <button onClick={() => onNavigate('services')}>Services</button>
        <span className="separator">/</span>
        <span aria-current="page">Reconciliation</span>
      </nav>

      <header className="page-header">
        <p className="eyebrow">Finance operations · Traceability · Exceptions</p>
        <h1>Know which records match—and which do not.</h1>
        <p className="lead">
          Make reconciliation repeatable with explicit matching rules, visible exceptions and evidence behind every resolution.
        </p>
      </header>

      <section className="content-section">
        <p className="eyebrow">The problem</p>
        <h2>Manual matching is hard to audit and harder to scale.</h2>
        <p>
          Payment exports, bank statements, invoices and internal records may describe the same activity using different references or timing. A useful process distinguishes a confirmed match from a likely match, an unmatched item and an unresolved data problem.
        </p>
      </section>

      <section className="content-section">
        <p className="eyebrow">Interactive Engine</p>
        <h2>Try Product 1: The Reconciliation Agent</h2>
        <p>
          We provide a deterministic, zero-LLM reconciliation engine for mobile money payments, bank files, and obligations ledger. It executes rules R1 through R8 with mathematical precision.
        </p>
        <button
          className="button button-primary"
          onClick={() => onNavigate('ops-suite')}
          style={{ marginBottom: '16px' }}
        >
          Launch Interactive Reconciliation Workspace →
        </button>
      </section>

      <section className="content-section">
        <p className="eyebrow">Capabilities</p>
        <h2>Designed for explainable matching</h2>
        <ul>
          <li>Import and normalize approved source files or system feeds.</li>
          <li>Apply agreed matching rules using reference, amount, date and validated fields.</li>
          <li>Detect duplicates, missing records, amount differences and timing differences.</li>
          <li>Route ambiguous or unmatched items to a human review queue.</li>
          <li>Record evidence and decisions associated with each exception.</li>
          <li>Produce period summaries and drill-down reports for operational review.</li>
        </ul>
        <p>
          Rules are agreed against the client's actual data and risk tolerance. No match-rate guarantee is made before representative data has been assessed.
        </p>
      </section>

      <section className="content-section">
        <p className="eyebrow">Typical deliverables</p>
        <h2>What the client receives</h2>
        <div className="card-grid">
          <article className="card">
            <h3>Source and rule map</h3>
            <p>Source inventory, field mapping, matching precedence and known data-quality limits.</p>
          </article>
          <article className="card">
            <h3>Reconciliation workflow</h3>
            <p>Repeatable imports, matching outcomes and an explicit exception path.</p>
          </article>
          <article className="card">
            <h3>Evidence and reports</h3>
            <p>Traceable references, period summaries and documented review/approval steps.</p>
          </article>
        </div>
      </section>

      <section className="content-section">
        <p className="eyebrow">Controls</p>
        <h2>Financial correctness is the boundary</h2>
        <ul>
          <li>Source records remain preserved; corrections are recorded rather than silently overwriting history.</li>
          <li>Automated matches use deterministic rules agreed with the client.</li>
          <li>Ambiguous items are not forced into a match to improve a dashboard.</li>
          <li>Access to restricted financial data is limited to approved systems and people.</li>
          <li>Cut-off times, tolerances and exception ownership are explicit.</li>
        </ul>
      </section>

      <section className="content-section">
        <p className="eyebrow">Next step</p>
        <h2>Start with a representative sample.</h2>
        <p>
          Describe the source systems, file formats, current matching process and the discrepancies that take the most time to resolve. We can define an assessment and a testable scope.
        </p>
        <p>
          <button
            className="button button-primary"
            onClick={onOpenIntakeModal}
          >
            Discuss reconciliation <span aria-hidden="true">↗</span>
          </button>
        </p>
        <p>
          <button
            className="text-link"
            onClick={() => onNavigate('services/finance-integrations')}
          >
            Related: finance integrations →
          </button>
        </p>
      </section>
    </>
  );
};
