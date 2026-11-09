import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';

interface FinanceIntegrationsPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const FinanceIntegrationsPage: React.FC<FinanceIntegrationsPageProps> = ({
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
        <span aria-current="page">Finance integrations</span>
      </nav>

      <header className="page-header">
        <p className="eyebrow">Integration · Payments · Business systems</p>
        <h1>Make your systems agree on what happened.</h1>
        <p className="lead">
          Connect payment, invoicing, accounting and operational tools without treating one successful API response as proof that the whole business process completed.
        </p>
      </header>

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
            className="button button-primary"
            onClick={onOpenIntakeModal}
          >
            Discuss an integration <span aria-hidden="true">↗</span>
          </button>
        </p>
        <p>
          <button
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
