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
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <nav className="container-expansive breadcrumb-nav" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('home')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Delivery Commitments & Standards</span>
      </nav>

      {/* Hero Header */}
      <header className="page-hero-header">
        <div className="container-expansive">
          <span className="eyebrow">Working Agreement · FAANG-Grade Discipline</span>
          <h1 className="hero-heading" style={{ maxWidth: '24ch' }}>
            Clear commitments. Verifiable delivery.
          </h1>
          <p className="hero-subheading" style={{ maxWidth: '64ch' }}>
            A client should always know exactly what is being engineered, how acceptance will be assessed, what risks remain open, and what happens at handover.
          </p>
        </div>
      </header>

      {/* Delivery Phases */}
      <section className="section-padded">
        <div className="container-expansive">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
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
                <li>Scope changes require written classification: In Scope, Change Order, or Out of Scope.</li>
                <li>Automated tests, contract tests, and boundary checks accompany every pull request.</li>
                <li>Exceptions and edge cases surfaced explicitly; false green status never tolerated.</li>
                <li>Consequential financial calculations and ledger updates retain human review checkpoints.</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="card">
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '10px', display: 'inline-block' }}>
                Stage 03 · At Handover
              </span>
              <h3 style={{ marginBottom: '12px' }}>Operational Autonomy</h3>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                <li>Deliverables evaluated item-by-item against the 51-Point Acceptance Gate checklist.</li>
                <li>Full source code ownership transferred without proprietary vendor lock-in.</li>
                <li>Architecture runbooks, disaster recovery procedures, and API specifications delivered.</li>
                <li>Credential rotation and access handover executed cleanly.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Network Resilience & Low-Bandwidth Standards */}
      <section className="section-padded section-alt">
        <div className="container-expansive">
          <div className="grid-2">
            <div>
              <span className="eyebrow">Performance Architecture</span>
              <h2>Low-Bandwidth & Emerging Network Resilience</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7 }}>
                Software built for emerging markets cannot rely on unmetered fiber or $1,200 smartphones. We engineer for actual network conditions in Kampala, Nairobi, and across regional cellular grids (MTN, Airtel).
              </p>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                <li><strong>Static-First Astro Architecture:</strong> Pages pre-render to raw HTML and CSS at build time. Zero bloated hydration client JavaScript required to read content.</li>
                <li><strong>Sub-100KB Critical Payloads:</strong> Content displays in under 1.5 seconds even on throttle-capped 3G connections.</li>
                <li><strong>Budget Hardware Friendly:</strong> Tested down to 320px/360px viewports on entry-level Android devices without memory exhaustion or reflow jank.</li>
                <li><strong>Zero-Budget Infrastructure:</strong> Distributed on Cloudflare’s global edge nodes with instant local cache hits, bypassing congested international transit.</li>
              </ul>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)', border: '1px solid var(--line-strong)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Wifi size={22} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Network Constraints Policy</h3>
              </div>
              <div className="table-wrapper" style={{ marginTop: '12px' }}>
                <table style={{ fontSize: '0.86rem' }}>
                  <thead>
                    <tr>
                      <th>Constraint</th>
                      <th>Production Standard</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Network Latency</strong></td>
                      <td>Functional at 350ms+ RTT cellular latency</td>
                    </tr>
                    <tr>
                      <td><strong>Initial Page Weight</strong></td>
                      <td>&lt; 100 KB total compressed static assets</td>
                    </tr>
                    <tr>
                      <td><strong>Font Loading</strong></td>
                      <td>Font-display: swap with zero FOIT (flash of invisible text)</td>
                    </tr>
                    <tr>
                      <td><strong>Client Runtime</strong></td>
                      <td>Zero framework tax on read-only marketing routes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Realistic Availability vs Marketing Claims */}
      <section className="section-padded">
        <div className="container-expansive">
          <div className="grid-2">
            <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--line-strong)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Server size={22} color="#4ade80" />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Realistic Availability Discipline</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '10px 0 16px' }}>
                We refuse to publish unsubstantiated "99.999% uptime" marketing claims. Real-world systems depend on upstream telecom gateways, payment webhooks, and third-party APIs that suffer outages.
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
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                We distinguish a target from a measured outcome, and a local build from a production verification. You can inspect our full 51-point verification criteria and evaluate each gate before commissioning a project.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button className="button button-primary" onClick={() => onNavigate('verification')}>
                  <span>Inspect the 51-Point Release Gates</span>
                  <ArrowRight size={14} />
                </button>
                <button className="button button-quiet" onClick={onOpenIntakeModal}>
                  <span>Discuss a Defined Project</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
