import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';

interface PerformanceBuildsPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const PerformanceBuildsPage: React.FC<PerformanceBuildsPageProps> = ({
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
        <span aria-current="page">Performance builds</span>
      </nav>

      <header className="page-header">
        <p className="eyebrow">Websites · Business systems · Reliability</p>
        <h1>Build for the people who use and maintain it.</h1>
        <p className="lead">
          Fast, accessible web experiences and fit-for-purpose business software, designed around users, operating constraints and a clear definition of done.
        </p>
      </header>

      <section className="content-section" id="business-websites">
        <p className="eyebrow">01 / Digital presence</p>
        <h2>Business websites that make the next step clear.</h2>
        <p>
          We create mobile-first websites that explain the offer, answer buyer questions and make it straightforward to enquire. Performance and accessibility are part of implementation, not decoration added at the end.
        </p>
        <ul>
          <li>Responsive company, service and product websites.</li>
          <li>Semantic page structure, meaningful metadata and crawlable content.</li>
          <li>Optimized media when used; no unnecessary third-party widgets.</li>
          <li>Accessible navigation, visible keyboard focus, readable contrast and clear hierarchy.</li>
          <li>Direct contact paths and analytics when appropriately configured.</li>
          <li>Handover notes for content, hosting, deployment and future changes.</li>
        </ul>
        <p>
          We agree pages, content responsibilities, revision limits, acceptance criteria and ownership before implementation.
        </p>
      </section>

      <section className="content-section" id="custom-systems">
        <p className="eyebrow">02 / Business operations</p>
        <h2>Custom systems for workflows off-the-shelf tools do not fit.</h2>
        <p>
          When spreadsheets, manual approvals or disconnected tools become a source of errors, a focused internal system may help. We scope the smallest application that fits the workflow rather than defaulting to a large platform.
        </p>
        <ul>
          <li>Internal portals and operational dashboards.</li>
          <li>Validated forms, role-based access and auditable state changes.</li>
          <li>Inventory, booking, records and administrative workflows where requirements are clear.</li>
          <li>Data migration with reconciliation, backups and sign-off.</li>
          <li>API integration and reporting based on agreed definitions.</li>
        </ul>
        <p>
          Regulated financial or healthcare decisions, native mobile apps and complex multi-tenant products require separate feasibility, risk and capability assessment.
        </p>
      </section>

      <section className="content-section" id="rescue-and-care">
        <p className="eyebrow">03 / Software rescue</p>
        <h2>Stabilise what exists before deciding to replace it.</h2>
        <p>
          For unreliable or abandoned software, we start with an evidence-backed assessment: reproduce failures, inspect architecture and dependencies, identify operational risks and propose prioritised remediation. A rebuild is one option, not the default.
        </p>
        <ul>
          <li>Codebase and architecture assessment.</li>
          <li>Bug reproduction, regression tests and production issue triage.</li>
          <li>Dependency and configuration review with actionable remediation.</li>
          <li>Release process, deployment and rollback improvements.</li>
          <li>Incremental modernisation with explicit acceptance criteria.</li>
        </ul>

        <h3 id="care">Ongoing engineering care</h3>
        <p>
          Maintenance is a separate scoped agreement covering defined updates, small fixes, monitoring or backup checks where configured, and a stated response window. It does not imply 24/7 response, guaranteed uptime or an enterprise SLA.
        </p>
      </section>

      <section className="content-section">
        <p className="eyebrow">Engineering acceptance</p>
        <h2>Performance is measured—not promised by adjective.</h2>
        <p>
          Each project receives checks appropriate to its risk and architecture. Where a performance budget is useful, we agree the metric, method, conditions and threshold before implementation. Lab results, real-user Core Web Vitals and synthetic availability checks are different evidence types.
        </p>
        <p>
          Accessibility targets are scoped against WCAG 2.2 AA and verified with automated checks plus manual review appropriate to the engagement. No compliance certification is implied.
        </p>
      </section>

      <section className="content-section">
        <p className="eyebrow">Typical deliverables</p>
        <h2>Clear outputs and ownership</h2>
        <div className="card-grid">
          <article className="card">
            <h3>Working implementation</h3>
            <p>Changes that meet agreed requirements and acceptance criteria.</p>
          </article>
          <article className="card">
            <h3>Verification evidence</h3>
            <p>Test results, known limitations and checks that could not be run.</p>
          </article>
          <article className="card">
            <h3>Handover</h3>
            <p>Deployment, access, operating and maintenance notes with responsibilities stated.</p>
          </article>
        </div>
      </section>

      <section className="content-section">
        <p className="eyebrow">Next step</p>
        <h2>Choose the smallest useful starting point.</h2>
        <p>
          Tell us whether you need a website, workflow system, repair or continued care. We establish constraints and scope before making a commitment.
        </p>
        <p>
          <button
            className="button button-primary"
            onClick={onOpenIntakeModal}
          >
            Discuss a build or rescue <span aria-hidden="true">↗</span>
          </button>
        </p>
      </section>
    </>
  );
};
