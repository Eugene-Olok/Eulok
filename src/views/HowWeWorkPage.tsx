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

          <div className="grid-2" style={{ gap: '24px' }}>
            {/* Stage 01 */}
            <div className="card">
              <span className="card-number">01 — DISCOVER</span>
              <h3>Understand the business problem</h3>
              <p>
                We investigate what is failing today, who uses the workflow, which systems interact, and what regional network or regulatory constraints apply.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--line)', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--warm-white)' }}>Exit Gate:</strong> Operational constraints, existing-system findings, and target outcomes agreed.
              </div>
            </div>

            {/* Stage 02 */}
            <div className="card">
              <span className="card-number">02 — SCOPE</span>
              <h3>Define the work before building</h3>
              <p>
                Deliverables, measurable acceptance criteria, technical assumptions, and exclusions are agreed in writing before engineering begins.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--line)', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--warm-white)' }}>Exit Gate:</strong> Written specification and milestone schedule approved by both parties.
              </div>
            </div>

            {/* Stage 03 */}
            <div className="card">
              <span className="card-number">03 — DESIGN</span>
              <h3>Architect data and failure boundaries</h3>
              <p>
                We design relational schemas, webhook authentication, user journeys, and fail-closed exception queues before committing production code.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--line)', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--warm-white)' }}>Exit Gate:</strong> System topology and integration contracts validated against operational limits.
              </div>
            </div>

            {/* Stage 04 */}
            <div className="card">
              <span className="card-number">04 — BUILD &amp; VERIFY</span>
              <h3>Implement with automated test coverage</h3>
              <p>
                Features ship in reviewable increments verified against deterministic unit suites, duplicate-event simulations, and mobile reflow checks.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--line)', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--warm-white)' }}>Exit Gate:</strong> All acceptance tests and release verification gates pass cleanly.
              </div>
            </div>

            {/* Stage 05 */}
            <div className="card">
              <span className="card-number">05 — DEPLOY &amp; HAND OVER</span>
              <h3>Release cleanly with full ownership</h3>
              <p>
                Production launches follow repeatable runbooks with clean repository transfer, credential rotation, and transparent operational guides.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--line)', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--warm-white)' }}>Exit Gate:</strong> Deliverables verified on production staging and signed off by your team.
              </div>
            </div>

            {/* Stage 06 */}
            <div className="card">
              <span className="card-number">06 — OPERATE &amp; IMPROVE</span>
              <h3>Maintain stability under clear support windows</h3>
              <p>
                Where retained, we handle security patches, dependency updates, backup verification, and targeted enhancements inside agreed SLAs.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--line)', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--warm-white)' }}>Exit Gate:</strong> Scheduled maintenance and support commitments fulfilled cleanly.
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
              We display pass states only when deterministic evidence exists and is current. An informal assertion or compilation pass is not proof of production readiness.
            </p>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">Gate</th>
                  <th scope="col">What It Verifies</th>
                  <th scope="col">Methodology & Tooling</th>
                  <th scope="col">Required Exit Criteria</th>
                  <th scope="col">Enforcement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Unit Tests</th>
                  <td>Core business logic, decimal calculations, state transitions</td>
                  <td>Deterministic unit test runners, zero-mock pure functions</td>
                  <td>100% pass on critical financial paths</td>
                  <td><span className="badge badge-neutral">Blocking Gate</span></td>
                </tr>
                <tr>
                  <th scope="row">Integration Tests</th>
                  <td>API contracts, webhook handling, database queries</td>
                  <td>Idempotency simulation, sandbox payload replay</td>
                  <td>All contract &amp; replay suites green</td>
                  <td><span className="badge badge-neutral">Blocking Gate</span></td>
                </tr>
                <tr>
                  <th scope="row">Browser &amp; Responsive</th>
                  <td>Critical user flows, mobile reflow, form validation</td>
                  <td>Headless multi-device testing (320px mobile to 1440px desktop)</td>
                  <td>Clean console and zero horizontal overflow</td>
                  <td>Pre-Release Check</td>
                </tr>
                <tr>
                  <th scope="row">Accessibility</th>
                  <td>Keyboard navigation, contrast ratios, focus indicators</td>
                  <td>Automated conformance audit &amp; manual keyboard walkthrough</td>
                  <td>WCAG 2.2 AA contrast &amp; target size compliance</td>
                  <td>Pre-Release Check</td>
                </tr>
                <tr>
                  <th scope="row">Security &amp; Secrets</th>
                  <td>Secret scanning, credential isolation, dependency hygiene</td>
                  <td>Repository secret verification &amp; vulnerability audit</td>
                  <td>Zero exposed tokens or unpatched critical CVEs</td>
                  <td>Blocking Gate</td>
                </tr>
                <tr>
                  <th scope="row">Performance</th>
                  <td>Payload budget and mobile load latency</td>
                  <td>Asset compression audit on 3G/4G network profiles</td>
                  <td>Pre-rendered HTML/CSS shell within transfer limits</td>
                  <td>Release Budget</td>
                </tr>
                <tr>
                  <th scope="row">Production Verification</th>
                  <td>Live domain routing, HTTPS headers, security contacts</td>
                  <td>Post-deploy route &amp; endpoint verification probes</td>
                  <td>Verified HTTP 200 routing, canonicals &amp; RFC 9116 contact</td>
                  <td>Post-Deploy Check</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Delivery Commitments & Engagement Cadence */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div className="governance-grid">
            <div>
              <span className="eyebrow">Clear Commitments</span>
              <h2>Designed to prevent avoidable surprises.</h2>
              <p>
                Software projects stall when edge cases are deferred until launch week or technical boundaries stay unspoken. We keep accountability visible from day one:
              </p>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-subtle)', lineHeight: 1.7 }}>
                <li style={{ marginBottom: '10px' }}><strong>Written scope &amp; mutual sign-off:</strong> Feature additions are reviewed and agreed before shifting release dates.</li>
                <li style={{ marginBottom: '10px' }}><strong>Resilient failure handling:</strong> We design explicitly for dropped cellular signals, duplicate callbacks, and malformed exports.</li>
                <li style={{ marginBottom: '10px' }}><strong>Money-moving logic gets care:</strong> Financial code runs on exact integer units tested against golden datasets.</li>
                <li><strong>Complete ownership transfer:</strong> Your team leaves with clean source code, runbooks, and zero lock-in.</li>
              </ul>
            </div>

            <div className="card" style={{ borderColor: 'var(--line-strong)', alignSelf: 'start' }}>
              <span className="card-number">ENGAGEMENT CADENCE</span>
              <h3 style={{ marginBottom: '16px' }}>Structured Around Real Discovery</h3>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: 'var(--warm-white)', display: 'block', fontSize: '0.95rem' }}>Targeted Technical Diagnostic</strong>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                  A bounded 1–2 week assessment for rescuing stalled systems or verifying integration feasibility before committing a larger build.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: 'var(--warm-white)', display: 'block', fontSize: '0.95rem' }}>Milestone-Verified Delivery</strong>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                  Engineering organized into observable staging milestones—moving forward only when acceptance tests pass.
                </p>
              </div>

              <div>
                <strong style={{ color: 'var(--warm-white)', display: 'block', fontSize: '0.95rem' }}>Direct Commercial Consultation</strong>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                  Commercial terms and schedules are discussed transparently after reviewing your systems and constraints.
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
