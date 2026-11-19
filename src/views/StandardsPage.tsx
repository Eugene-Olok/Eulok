import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';
import { CheckCircle2, ShieldAlert, ArrowRight, FileCheck, Layers, GitPullRequest, Wifi, Server, Cpu } from 'lucide-react';

interface StandardsPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const StandardsPage: React.FC<StandardsPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  return (
    <>
      {/* Hero Header */}
      <section className="section-full theme-dark band-hero">
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Delivery Commitments &amp; Standards</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">Working Agreement · Deterministic Discipline</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)', marginBottom: '20px', maxWidth: '24ch' }}>
              Clear commitments. Verifiable delivery.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch', marginBottom: 0 }}>
              A client should always know exactly what is being engineered, how acceptance will be assessed, what risks remain open, and what happens at handover.
            </p>
          </div>
        </div>
      </section>

      {/* Delivery Phases */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '760px', marginBottom: '32px' }}>
            <span className="eyebrow">Engagement Lifecycle</span>
            <h2>Contractual &amp; Technical Checkpoints</h2>
          </div>

          <div className="grid-3">
            {/* Card 1 */}
            <div className="card">
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '10px', display: 'inline-block' }}>
                Stage 01 · Before Work Begins
              </span>
              <h3 style={{ marginBottom: '12px' }}>Explicitness Over Assumptions</h3>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                <li>Written deliverables, exclusions, and acceptance criteria agreed before coding.</li>
                <li>Dependencies, third-party API credentials, and sandbox accesses verified.</li>
                <li>Unknowns surfaced directly rather than glossed over with optimistic estimates.</li>
                <li>Engineering kicks off only after mutual sign-off of commercial terms.</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="card">
              <span className="mono-tag" style={{ color: 'var(--electric-blue)', marginBottom: '10px', display: 'inline-block' }}>
                Stage 02 · During Delivery
              </span>
              <h3 style={{ marginBottom: '12px' }}>Deterministic Quality Gates</h3>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                <li>Scope updates require written review and mutual sign-off before adjusting schedules.</li>
                <li>Automated tests, contract tests, and boundary checks accompany every release.</li>
                <li>Exceptions and edge cases surface explicitly into auditable review queues.</li>
                <li>Consequential financial calculations and ledger updates retain human approval gates.</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="card">
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '10px', display: 'inline-block' }}>
                Stage 03 · At Handover
              </span>
              <h3 style={{ marginBottom: '12px' }}>Operational Autonomy</h3>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                <li>Deliverables evaluated against our deterministic Release Verification Standard.</li>
                <li>Full source code ownership transferred without proprietary vendor lock-in.</li>
                <li>Architecture runbooks, disaster recovery procedures, and API specifications delivered.</li>
                <li>Credential rotation and access handover executed cleanly.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Network Resilience & Low-Bandwidth Standards */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Performance Architecture</span>
              <h2>Built for Ugandan &amp; East African Cellular Networks</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7 }}>
                Business software in East Africa cannot assume unmetered fiber or flagship hardware. We engineer around daily network conditions in Kampala, Nairobi, Kigali, and regional MTN and Airtel cellular corridors.
              </p>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65, margin: 0 }}>
                <li><strong>Instant Content Rendering:</strong> Pages render meaningful text and controls immediately over 3G/4G connections without heavy download waterfalls.</li>
                <li><strong>Lean Transfer Payloads:</strong> Compressed assets keep initial page weights light for staff working on metered mobile data bundles.</li>
                <li><strong>Mobile Handset Ergonomics:</strong> Interfaces are tested from 320px entry-level smartphones up to widescreen displays without horizontal scrolling.</li>
                <li><strong>Regional Edge Distribution:</strong> Static assets serve cleanly from distributed edge nodes near East African internet exchanges.</li>
              </ul>
            </div>

            <div className="card" style={{ borderColor: 'var(--line-strong)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Wifi size={22} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Regional Resilience Benchmarks</h3>
              </div>
              <div className="table-wrapper" style={{ margin: '12px 0 0' }}>
                <table style={{ fontSize: '0.86rem' }}>
                  <thead>
                    <tr>
                      <th>Operational Factor</th>
                      <th>Production Standard</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Cellular Latency</strong></td>
                      <td>Responsive over high-RTT (350ms+) mobile networks</td>
                    </tr>
                    <tr>
                      <td><strong>Core Transfer Weight</strong></td>
                      <td>Compressed pre-rendered HTML &amp; styles for metered 3G/4G bundles</td>
                    </tr>
                    <tr>
                      <td><strong>Typography Readability</strong></td>
                      <td>Immediate system-fallback rendering with zero invisible-text delays</td>
                    </tr>
                    <tr>
                      <td><strong>Network Interruptions</strong></td>
                      <td>Fail-closed queues preserving submissions when connectivity drops</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Realistic Availability vs Marketing Claims */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div className="card" style={{ borderColor: 'var(--line-strong)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Server size={22} color="var(--status-pass-text)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Realistic Availability Discipline</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '10px 0 16px' }}>
                We refuse to publish unsubstantiated &ldquo;99.999% uptime&rdquo; marketing claims. Real-world systems depend on upstream telecom gateways, payment webhooks, and third-party APIs that suffer outages.
              </p>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>
                <li><strong>Fail-Closed State Machines:</strong> When external APIs drop, transactions freeze safely without silent loss of client capital.</li>
                <li><strong>Deterministic Rollback Runbooks:</strong> Every release includes an automated roll-forward/roll-backward procedure.</li>
                <li><strong>Edge Static Isolation:</strong> Even if a backend processing node is restarting, informational sites and intake endpoints remain operational at the edge.</li>
                <li><strong>Idempotency By Default:</strong> Duplicate webhooks and network retries are handled cleanly without duplicate billing.</li>
              </ul>
            </div>

            <div>
              <span className="eyebrow">Reliability Rigor</span>
              <h2>How to assess our work</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '20px' }}>
                We distinguish a target from a measured outcome, and a local build from a production verification. You can inspect our deterministic verification framework and review each gate before commissioning a project.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button type="button" className="button button-primary" onClick={() => onNavigate('verification')}>
                  <span>Inspect Release Verification Standard</span>
                  <ArrowRight size={14} />
                </button>
                <button type="button" className="button button-quiet" onClick={onOpenIntakeModal}>
                  <span>Discuss a Defined Project</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
