import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Clock,
  Terminal,
} from 'lucide-react';

interface HowWeWorkPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const HowWeWorkPage: React.FC<HowWeWorkPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  return (
    <>
      <section className="section-full theme-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 0 50px' }}>
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">How We Work</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">THE OPERATING SYSTEM · METHODICAL DELIVERY</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', marginBottom: '20px' }}>
              Understand first. Agree clearly. Deliver with evidence.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch' }}>
              We operate with a defined engineering methodology designed to eliminate surprises, make technical trade-offs explicit, and leave clients with sovereign operational ownership.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '30px' }}>
              <button
                className="button button-primary"
                onClick={onOpenIntakeModal}
              >
                <span>Discuss a project</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="button button-quiet"
                onClick={() => onNavigate('verification')}
              >
                Inspect release criteria
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Stage EULOK Delivery Model */}
      <section className="section-full theme-navy" style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '44px' }}>
            <span className="eyebrow">Delivery Pipeline</span>
            <h2>The Six-Stage Delivery Model</h2>
            <p className="lead">
              Each stage has an unambiguous purpose, explicit deliverables, and a verified exit condition before transitioning to the next phase.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stage 01 */}
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="card-number" style={{ margin: 0 }}>01 — DISCOVER</span>
                <span className="badge badge-neutral">Stage 1</span>
              </div>
              <h3>Understand the business problem</h3>
              <p>
                We investigate what is failing today, who uses the process, what systems are touched, what has already been attempted, and what operational constraints matter. If the problem is ambiguous, we recommend a bounded assessment rather than guessing.
              </p>
              <div className="grid-2" style={{ marginTop: '16px', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Deliverables:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Initial requirements, existing-system diagnostic, stakeholder map, constraints and unknowns list.</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Exit Condition:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Problem and intended business outcome are sufficiently understood and documented.</span>
                </div>
              </div>
            </div>

            {/* Stage 02 */}
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="card-number" style={{ margin: 0 }}>02 — SCOPE</span>
                <span className="badge badge-neutral">Stage 2</span>
              </div>
              <h3>Define the work before implementation</h3>
              <p>
                We document deliverables, measurable acceptance criteria, explicit exclusions, dependencies, and commercial terms in writing. Unknowns remain visible until resolved; changes are not silently absorbed.
              </p>
              <div className="grid-2" style={{ marginTop: '16px', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Deliverables:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Scope specification, acceptance criteria, exclusions list, technical assumptions, fixed cost/timeline estimate.</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Exit Condition:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Both lead engineer and client approve written terms and commercial scope.</span>
                </div>
              </div>
            </div>

            {/* Stage 03 */}
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="card-number" style={{ margin: 0 }}>03 — DESIGN</span>
                <span className="badge badge-neutral">Stage 3</span>
              </div>
              <h3>Design the system before committing code</h3>
              <p>
                We draft interface contracts, normalized database schemas, security boundaries, and user journeys. We establish how the software fails closed when dependencies drop out.
              </p>
              <div className="grid-2" style={{ marginTop: '16px', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Deliverables:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>System architecture map, data schema, user journeys, security controls, integration API contracts.</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Exit Condition:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Architecture and boundary contracts validated against project constraints.</span>
                </div>
              </div>
            </div>

            {/* Stage 04 */}
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="card-number" style={{ margin: 0 }}>04 — BUILD & VERIFY</span>
                <span className="badge badge-neutral">Stage 4</span>
              </div>
              <h3>Implement in controlled increments with automated tests</h3>
              <p>
                Code is written cleanly with high test coverage, strict type safety, and security reviews. Failures are treated as first-class citizens, accounting for timeouts, duplicates, and ambiguous records.
              </p>
              <div className="grid-2" style={{ marginTop: '16px', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Deliverables:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Working software increments, automated unit & integration tests, security checks, review evidence.</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Exit Condition:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>All agreed automated acceptance gates pass with zero regressions.</span>
                </div>
              </div>
            </div>

            {/* Stage 05 */}
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="card-number" style={{ margin: 0 }}>05 — DEPLOY & HAND OVER</span>
                <span className="badge badge-neutral">Stage 5</span>
              </div>
              <h3>Release responsibly with documented ownership</h3>
              <p>
                Deployment is carried out according to documented runbooks. We provide deployment artifacts, configuration guides, operating instructions, and an honest disclosure of limits.
              </p>
              <div className="grid-2" style={{ marginTop: '16px', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Deliverables:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Production deployment, configuration documentation, operating runbooks, source repository ownership transfer.</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Exit Condition:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Deliverables verified against agreed acceptance criteria and signed off by client.</span>
                </div>
              </div>
            </div>

            {/* Stage 06 */}
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="card-number" style={{ margin: 0 }}>06 — OPERATE & IMPROVE</span>
                <span className="badge badge-neutral">Stage 6</span>
              </div>
              <h3>Continuous stability under an explicit care boundary</h3>
              <p>
                Where contracted, we provide ongoing monitoring, security patch management, bug fixes, and incremental enhancements under explicit service windows.
              </p>
              <div className="grid-2" style={{ marginTop: '16px', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Deliverables:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Scheduled maintenance, security updates, incident resolution, performance monitoring reports.</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>Exit Condition:</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Contractual maintenance and support obligations fulfilled.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Gates Table: "What Must Pass Before Release" */}
      <section className="section-full theme-warm-light" style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '32px' }}>
            <span className="eyebrow">Deterministic Quality Gates</span>
            <h2>What Must Pass Before Release</h2>
            <p className="lead">
              We display pass states only when deterministic evidence exists and is current. An agent assertion or compilation pass is not proof of production readiness.
            </p>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">Gate</th>
                  <th scope="col">What It Verifies</th>
                  <th scope="col">Methodology & Tooling</th>
                  <th scope="col">Release Standard</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Unit Tests</th>
                  <td>Core business logic, decimal calculations, state transitions</td>
                  <td>Deterministic unit test runners, zero-mock pure functions</td>
                  <td>100% pass on critical financial paths</td>
                  <td><span className="badge badge-pass">PASS</span></td>
                </tr>
                <tr>
                  <th scope="row">Integration Tests</th>
                  <td>API contracts, webhook handling, database queries</td>
                  <td>Idempotency simulation, sandbox payload replay</td>
                  <td>All mock contract tests green</td>
                  <td><span className="badge badge-pass">PASS</span></td>
                </tr>
                <tr>
                  <th scope="row">Browser & E2E</th>
                  <td>Critical user journeys, responsive reflow, form validation</td>
                  <td>Playwright / automated browser verification across viewports</td>
                  <td>Zero console errors, zero layout overflow</td>
                  <td><span className="badge badge-pass">PASS</span></td>
                </tr>
                <tr>
                  <th scope="row">Accessibility</th>
                  <td>Keyboard navigation, contrast, landmarks, focus rings</td>
                  <td>Automated axe-core checks + manual keyboard walkthrough</td>
                  <td>WCAG 2.2 AA target, skip-link verified</td>
                  <td><span className="badge badge-pass">PASS</span></td>
                </tr>
                <tr>
                  <th scope="row">Security & Secrets</th>
                  <td>Gitleaks secret scanning, credential isolation, dependency audit</td>
                  <td>Static analysis, npm audit, zero tokens in Git</td>
                  <td>0 high/critical vulnerabilities, 0 exposed keys</td>
                  <td><span className="badge badge-pass">PASS</span></td>
                </tr>
                <tr>
                  <th scope="row">Performance</th>
                  <td>Bundle budget, Core Web Vitals (LCP, INP, CLS)</td>
                  <td>Vite build analyzer, compressed payload limits</td>
                  <td>Initial bundle &lt; 100KB, sub-2s mobile LCP</td>
                  <td><span className="badge badge-pass">PASS</span></td>
                </tr>
                <tr>
                  <th scope="row">Release Verification</th>
                  <td>Live production smoke test, DNS canonicals, SSL</td>
                  <td>HTTP header inspection, live endpoint health probes</td>
                  <td>Confirmed live response &amp; security.txt</td>
                  <td><span className="badge badge-pass">PASS</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Commercial Terms & Surprise Prevention */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div className="grid-2">
            <div>
              <span className="eyebrow">Clear Commitments</span>
              <h2>Designed to prevent avoidable surprises.</h2>
              <p>
                Surprises in software engineering happen when scope expands silently, edge cases are ignored until launch day, or pricing terms are left ambiguous. We address these at the outset:
              </p>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-subtle)' }}>
                <li style={{ marginBottom: '10px' }}><strong>Scope stays visible:</strong> Any new feature request is scoped and quoted as a formal Change Order rather than silently expanding deadlines.</li>
                <li style={{ marginBottom: '10px' }}><strong>Failures are first-class:</strong> We design for dropped mobile signals, duplicate webhooks, and unexpected data formats.</li>
                <li style={{ marginBottom: '10px' }}><strong>Money-moving logic gets care:</strong> Financial code is isolated and tested against golden datasets with exact Decimal units.</li>
                <li><strong>Ownership is absolute:</strong> When an engagement closes, you own the code and runbooks. No vendor lock-in.</li>
              </ul>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--line-strong)' }}>
              <h3>Commercial Engagement Models</h3>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: 'var(--warm-white)', display: 'block', fontSize: '0.95rem' }}>Fixed-Scope Assessment</strong>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                  A bounded 1–2 week technical diagnostic covering architecture, code rescue, or feasibility scoping. Ideal when the root cause is still unknown.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: 'var(--warm-white)', display: 'block', fontSize: '0.95rem' }}>Milestone-Based Build</strong>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                  Structured milestone deliveries with payments tied to observable acceptance criteria. Neither side proceeds until the prior milestone is verified.
                </p>
              </div>

              <div>
                <strong style={{ color: 'var(--warm-white)', display: 'block', fontSize: '0.95rem' }}>Ongoing Engineering Care</strong>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                  A monthly retainer covering security patches, monitoring, dependency maintenance, and agreed developer hours for iterative improvements.
                </p>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  className="button button-primary"
                  onClick={onOpenIntakeModal}
                  style={{ width: '100%' }}
                >
                  Start Scoping Discussion →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
