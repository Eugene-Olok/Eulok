import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Search,
  Cpu,
  GitBranch,
  Terminal,
} from 'lucide-react';

interface RescuePageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const RescuePage: React.FC<RescuePageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  return (
    <>
      {/* Rescue Hero */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 0 60px' }}>
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <button onClick={() => onNavigate('services')}>Services</button>
            <span className="separator">/</span>
            <span aria-current="page">Software Rescue</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">RESCUE & STABILIZATION ENGINEERING</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', marginBottom: '20px' }}>
              Your software is stuck. Let's establish why.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch' }}>
              When releases break, contractors disappear, integrations drop transactions, or a codebase becomes too fragile to modify, a total rebuild is rarely the first answer. We audit the reality, reproduce failure modes, and stabilize the system with verifiable acceptance criteria.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '32px' }}>
              <button
                className="button button-primary"
                onClick={onOpenIntakeModal}
              >
                <span>Discuss a software rescue</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="button button-quiet"
                onClick={() => onNavigate('work')}
              >
                Inspect our delivery standards
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Failure Symptoms */}
      <section className="section-full theme-navy" style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '40px' }}>
            <span className="eyebrow">Diagnostic Signals</span>
            <h2>Common breakdown patterns we remediate.</h2>
            <p className="lead">
              Software usually stalls for systematic reasons: missing integration contracts, unverified deployment steps, or unchecked scope drift.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: '#f87171', display: 'block', marginBottom: '10px' }}>01 / STALLED DELIVERY</span>
              <h3>Unfinished Contractor Projects</h3>
              <p>
                An agency or freelance developer delivered half-working software, missing core edge-case handling or disappearing before production deployment.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: '#f87171', display: 'block', marginBottom: '10px' }}>02 / SILENT ERRORS</span>
              <h3>Unreliable Integrations</h3>
              <p>
                Payment callbacks fail intermittently, mobile-money webhooks drop transactions, or sync jobs duplicate records without clear error logs.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: '#f87171', display: 'block', marginBottom: '10px' }}>03 / FRAGILITY</span>
              <h3>Code Too Risky to Change</h3>
              <p>
                Every small bug fix triggers regression failures in unrelated modules because the architecture lacks unit tests and clear boundary isolation.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: '#f87171', display: 'block', marginBottom: '10px' }}>04 / PERFORMANCE</span>
              <h3>Timeout Cascades & Latency</h3>
              <p>
                Database queries crawl as user volume grows, causing mobile apps to hang and customer payments to time out before confirmation.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: '#f87171', display: 'block', marginBottom: '10px' }}>05 / BLIND SPOTS</span>
              <h3>Missing Documentation & Runbooks</h3>
              <p>
                The team lacks deployment scripts, server access maps, and database backup routines, leaving the business vulnerable to single-person departures.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: '#f87171', display: 'block', marginBottom: '10px' }}>06 / SECURITY RISK</span>
              <h3>Exposed Secrets & Data Gaps</h3>
              <p>
                API keys and database passwords hardcoded in source repositories or client databases exposed to unapproved third-party analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Step Rescue Methodology */}
      <section className="section-full theme-warm-light" style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '44px' }}>
            <span className="eyebrow">Rescue Methodology</span>
            <h2>Our 6-step stabilization process.</h2>
            <p className="lead">
              We do not advocate burning down existing systems on day one. We establish deterministic baselines before recommending surgical refactoring.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '24px' }}>
            <div className="card">
              <span className="card-number">STEP 01</span>
              <h3>Establish Current State</h3>
              <p>
                Inspect repositories, check deployment logs, interview operators, and reliably reproduce observed bugs in a local sandbox environment.
              </p>
            </div>

            <div className="card">
              <span className="card-number">STEP 02</span>
              <h3>Identify Critical Risks</h3>
              <p>
                Uncover security exposure, credential leaks, unbacked-up data tables, and points of irreversible financial or data corruption.
              </p>
            </div>

            <div className="card">
              <span className="card-number">STEP 03</span>
              <h3>Assess Architecture</h3>
              <p>
                Separate healthy business logic from unmaintainable dependencies, evaluating whether a component needs repair or replacement.
              </p>
            </div>

            <div className="card">
              <span className="card-number">STEP 04</span>
              <h3>Establish Priorities</h3>
              <p>
                Triage fixes into immediate operational stabilizers (P0), integration guards (P1), and strategic modernization (P2).
              </p>
            </div>

            <div className="card">
              <span className="card-number">STEP 05</span>
              <h3>Agree Recovery Scope</h3>
              <p>
                Deliver a fixed-scope technical proposal specifying exactly what will be fixed, verified, and excluded, eliminating open-ended billing.
              </p>
            </div>

            <div className="card">
              <span className="card-number">STEP 06</span>
              <h3>Execute & Verify</h3>
              <p>
                Implement fixes behind automated regression tests, verify in staging, and transfer clean runbooks and operational sovereignty to your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Engineering Care Boundary */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Ongoing Care</span>
              <h2>Stabilize first. Maintain responsibly.</h2>
              <p>
                After stabilizing a rescued system, we offer ongoing engineering care to prevent future regression. Care agreements specify exact maintenance hours, backup checks, security dependency updates, and response windows.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                We do not promise misleading 24/7 "five-nines" availability unless a dedicated enterprise infrastructure agreement is separately contracted.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--line-strong)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>What Software Rescue Delivers</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-subtle)', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '8px' }}>Comprehensive architecture diagnostic & risk report</li>
                <li style={{ marginBottom: '8px' }}>Reproducible regression test suite for core paths</li>
                <li style={{ marginBottom: '8px' }}>Idempotent API retry & exception queues</li>
                <li style={{ marginBottom: '8px' }}>Sanitized secrets & credential boundary separation</li>
                <li style={{ marginBottom: '8px' }}>Clear deployment script and rollback runbook</li>
                <li>Complete handover documentation</li>
              </ul>

              <div style={{ marginTop: '24px' }}>
                <button
                  className="button button-primary"
                  onClick={onOpenIntakeModal}
                  style={{ width: '100%' }}
                >
                  Start Rescue Assessment →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
