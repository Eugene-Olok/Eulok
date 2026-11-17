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
      {/* Hero */}
      <section className="section-full theme-dark band-hero">
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <button type="button" onClick={() => onNavigate('services')}>Services</button>
            <span className="separator">/</span>
            <span aria-current="page">Performance builds</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">Websites · Business systems · Reliability</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)', marginBottom: '20px', maxWidth: '22ch' }}>
              Build for the people who use and maintain it.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch', marginBottom: 0 }}>
              Fast, accessible web experiences and fit-for-purpose business software, designed around users, operating constraints and a clear definition of done.
            </p>
          </div>
        </div>
      </section>

      {/* 01 Digital Presence */}
      <section className="section-full theme-navy band-section" id="business-websites">
        <div className="container-expansive">
          <div style={{ maxWidth: '72ch' }}>
            <span className="eyebrow">01 / Digital presence</span>
            <h2>Business websites that make the next step clear.</h2>
            <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '18px' }}>
              We create mobile-first websites that explain the offer, answer buyer questions and make it straightforward to enquire. Performance and accessibility are part of implementation, not decoration added at the end.
            </p>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '18px' }}>
              <li>Responsive company, service and product websites.</li>
              <li>Semantic page structure, meaningful metadata and crawlable content.</li>
              <li>Optimized media when used; no unnecessary third-party widgets.</li>
              <li>Accessible navigation, visible keyboard focus, readable contrast and clear hierarchy.</li>
              <li>Direct contact paths and analytics when appropriately configured.</li>
              <li>Handover notes for content, hosting, deployment and future changes.</li>
            </ul>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              We agree pages, content responsibilities, revision limits, acceptance criteria and ownership before implementation.
            </p>
          </div>
        </div>
      </section>

      {/* 02 Business Operations */}
      <section className="section-full theme-dark band-section" id="custom-systems">
        <div className="container-expansive">
          <div style={{ maxWidth: '72ch' }}>
            <span className="eyebrow">02 / Business operations</span>
            <h2>Custom systems for workflows off-the-shelf tools do not fit.</h2>
            <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '18px' }}>
              When spreadsheets, manual approvals or disconnected tools become a source of errors, a focused internal system may help. We scope the smallest application that fits the workflow rather than defaulting to a large platform.
            </p>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '18px' }}>
              <li>Internal portals and operational dashboards.</li>
              <li>Validated forms, role-based access and auditable state changes.</li>
              <li>Inventory, booking, records and administrative workflows where requirements are clear.</li>
              <li>Data migration with reconciliation, backups and sign-off.</li>
              <li>API integration and reporting based on agreed definitions.</li>
            </ul>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              Regulated financial or healthcare decisions, native mobile apps and complex multi-tenant products require separate feasibility, risk and capability assessment.
            </p>
          </div>
        </div>
      </section>

      {/* 03 Software Rescue */}
      <section className="section-full theme-navy band-section" id="rescue-and-care">
        <div className="container-expansive">
          <div style={{ maxWidth: '72ch' }}>
            <span className="eyebrow">03 / Software rescue</span>
            <h2>Stabilise what exists before deciding to replace it.</h2>
            <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '18px' }}>
              For unreliable or abandoned software, we start with an evidence-backed assessment: reproduce failures, inspect architecture and dependencies, identify operational risks and propose prioritised remediation. A rebuild is one option, not the default.
            </p>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '28px' }}>
              <li>Codebase and architecture assessment.</li>
              <li>Bug reproduction, regression tests and production issue triage.</li>
              <li>Dependency and configuration review with actionable remediation.</li>
              <li>Release process, deployment and rollback improvements.</li>
              <li>Incremental modernisation with explicit acceptance criteria.</li>
            </ul>

            <div className="callout-stripe">
              <h3 id="care" style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Ongoing engineering care</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
                Maintenance is a separate scoped agreement covering defined updates, small fixes, monitoring or backup checks where configured, and a stated response window. It does not imply 24/7 response, guaranteed uptime or an enterprise SLA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Acceptance */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '72ch' }}>
            <span className="eyebrow">Engineering acceptance</span>
            <h2>Performance is measured—not promised by adjective.</h2>
            <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '16px' }}>
              Each project receives checks appropriate to its risk and architecture. Where a performance budget is useful, we agree the metric, method, conditions and threshold before implementation. Lab results, real-user Core Web Vitals and synthetic availability checks are different evidence types.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              Accessibility targets are scoped against WCAG 2.2 AA and verified with automated checks plus manual review appropriate to the engagement. No compliance certification is implied.
            </p>
          </div>
        </div>
      </section>

      {/* Typical Deliverables */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '680px', marginBottom: '28px' }}>
            <span className="eyebrow">Typical deliverables</span>
            <h2>Clear outputs and ownership</h2>
          </div>
          <div className="grid-3">
            <article className="card">
              <span className="card-number">01 / CODE</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Working implementation</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Changes that meet agreed requirements and acceptance criteria.
              </p>
            </article>
            <article className="card">
              <span className="card-number">02 / EVIDENCE</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Verification evidence</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Test results, known limitations and checks that could not be run.
              </p>
            </article>
            <article className="card">
              <span className="card-number">03 / OWNERSHIP</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Handover</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Deployment, access, operating and maintenance notes with responsibilities stated.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Next Step */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '68ch' }}>
            <span className="eyebrow">Next step</span>
            <h2>Choose the smallest useful starting point.</h2>
            <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '24px' }}>
              Tell us whether you need a website, workflow system, repair or continued care. We establish constraints and scope before making a commitment.
            </p>
            <button
              type="button"
              className="button button-primary"
              onClick={onOpenIntakeModal}
            >
              Discuss a build or rescue <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
