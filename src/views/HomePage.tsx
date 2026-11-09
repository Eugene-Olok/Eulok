import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  RefreshCw,
  GitCommit,
  CheckCircle2,
  FileCode,
  Terminal,
  Activity,
  AlertOctagon,
  Lock,
} from 'lucide-react';

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  return (
    <>
      {/* 01: HERO SECTION (Expansive full-width with 2-column composition) */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(56px, 8vw, 110px) 0 clamp(48px, 6vw, 80px)' }}>
        <div className="container-expansive">
          <div className="hero-grid">
            {/* Hero Left Column */}
            <div className="animate-fade-up">
              <span className="eyebrow">INDEPENDENT SOFTWARE ENGINEERING · KAMPALA & REMOTE</span>
              <h1 style={{ maxWidth: '16ch' }}>
                Software built for the realities of business.
              </h1>
              <p className="lead" style={{ maxWidth: '54ch' }}>
                EULOK designs, builds, repairs and improves software systems for businesses that need dependable technology—not another unfinished project.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginTop: '32px' }}>
                <button
                  className="button button-primary"
                  onClick={onOpenIntakeModal}
                >
                  <span>Discuss a project</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  className="button button-quiet"
                  onClick={() => onNavigate('rescue')}
                >
                  Rescue a stalled project
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '36px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
                <span>Engineered for Ugandan operational infrastructure. Built for production worldwide.</span>
              </div>
            </div>

            {/* Hero Right Column: Original Engineering Diagram with Live Indicator */}
            <div className="diagram-box animate-fade-in delay-200" style={{ margin: 0, border: '1px solid var(--line-strong)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>
                  EULOK_PIPELINE.ARCH
                </span>
                <span className="badge badge-pass" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'pulseGlow 2s infinite' }} />
                  Deterministic Core Active
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--line)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'border-color 0.2s ease' }}>
                  <Database size={16} color="var(--accent-blue)" />
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--warm-white)' }}>01 / Ingestion Boundary</strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Payment webhooks, bank exports, mobile-money events</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--electric-blue)', fontSize: '0.85rem' }}>
                  ↓
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--accent-blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 0 16px -4px rgba(56, 189, 248, 0.2)' }}>
                  <Cpu size={16} color="var(--electric-blue)" />
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--electric-blue)' }}>02 / Deterministic Processing</strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>Exact decimal math · Idempotency · Zero-LLM matching</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--electric-blue)', fontSize: '0.85rem' }}>
                  ↓
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--line)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={16} color="#4ade80" />
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--warm-white)' }}>03 / Acceptance & Verification</strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Automated test gates · Human escalation for exceptions</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ↓
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--line)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GitCommit size={16} color="var(--warm-white)" />
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--warm-white)' }}>04 / Auditable Production Handover</strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Operational runbooks · Verified artifact ownership</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02: ENGINEERING POSITION SECTION */}
      <section className="section-full theme-navy" style={{ padding: 'clamp(64px, 8vw, 100px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '48px' }}>
            <span className="eyebrow">Engineering Position</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
              Models propose. Deterministic systems decide.
            </h2>
            <p className="lead">
              We separate probabilistic AI assistance from authoritative business logic. AI can draft code, discover patterns, and propose transformations; but critical transactions, access boundaries, and financial balances require deterministic systems and explicit verification.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="card-number">PRINCIPLE 01</span>
              <h3>Deterministic Business Rules</h3>
              <p>
                Financial logic, permissions, and status transitions are governed by strict, reproducible state machines. An invoice never records payment, and absence of a record is never treated as zero.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="card-number">PRINCIPLE 02</span>
              <h3>Explicit Verification & Testing</h3>
              <p>
                We do not treat a compile pass or model assertion as proof of correctness. Changes pass automated unit, integration, accessibility, and security test gates before production release.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="card-number">PRINCIPLE 03</span>
              <h3>Human Decision Boundaries</h3>
              <p>
                Consequential operations—approving client proposals, authorizing scope adjustments, and issuing corrected ledger entries—retain accountable human approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03: SERVICES OVERVIEW (Alternating Warm Light Section) */}
      <section className="section-full theme-warm-light" style={{ padding: 'clamp(64px, 8vw, 100px) 0' }}>
        <div className="container-expansive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
            <div>
              <span className="eyebrow">Service Catalogue</span>
              <h2>Six disciplines for reliable software.</h2>
              <p className="reading-width" style={{ margin: 0 }}>
                Every service addresses a concrete operational bottleneck with clear boundaries, written deliverables, and verifiable acceptance.
              </p>
            </div>
            <button
              className="button button-primary"
              onClick={() => onNavigate('services')}
            >
              <span>Explore all services</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid-3">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="card-number" style={{ margin: 0 }}>01 / BUILD</span>
                <span className="badge badge-neutral">Presence</span>
              </div>
              <h3>Business websites</h3>
              <p>
                For businesses needing a professional, high-performing online presence that communicates clearly, performs on low-bandwidth connections, and converts visitors into enquiries.
              </p>
              <button
                className="text-link"
                style={{ marginTop: 'auto', paddingTop: '16px', color: 'var(--obsidian)' }}
                onClick={() => onNavigate('services/performance-builds')}
              >
                Website specifications →
              </button>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="card-number" style={{ margin: 0 }}>02 / BUILD</span>
                <span className="badge badge-neutral">Operations</span>
              </div>
              <h3>Custom software</h3>
              <p>
                For organizations replacing fragile spreadsheets and manual paperwork with purpose-built internal portals, operational dashboards, and auditable record systems.
              </p>
              <button
                className="text-link"
                style={{ marginTop: 'auto', paddingTop: '16px', color: 'var(--obsidian)' }}
                onClick={() => onNavigate('services/performance-builds')}
              >
                Custom system builds →
              </button>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="card-number" style={{ margin: 0 }}>03 / RECOVER</span>
                <span className="badge badge-neutral">Stabilization</span>
              </div>
              <h3>Software rescue & care</h3>
              <p>
                For businesses with stalled, unreliable, or difficult-to-maintain software. We audit architecture, triage regressions, establish test safeguards, and modernize incrementally.
              </p>
              <button
                className="text-link"
                style={{ marginTop: 'auto', paddingTop: '16px', color: 'var(--obsidian)' }}
                onClick={() => onNavigate('rescue')}
              >
                Rescue methodology →
              </button>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="card-number" style={{ margin: 0 }}>04 / AUTOMATE</span>
                <span className="badge badge-neutral">Productivity</span>
              </div>
              <h3>AI & workflow automation</h3>
              <p>
                For operations teams eliminating repetitive data entry and administrative hand-offs while enforcing guardrails and preserving human review on high-risk actions.
              </p>
              <button
                className="text-link"
                style={{ marginTop: 'auto', paddingTop: '16px', color: 'var(--obsidian)' }}
                onClick={() => onNavigate('services/finance-integrations')}
              >
                Workflow automation →
              </button>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="card-number" style={{ margin: 0 }}>05 / CONNECT</span>
                <span className="badge badge-neutral">Integrations</span>
              </div>
              <h3>Integrations and APIs</h3>
              <p>
                For organizations connecting payment providers, URA EFRIS interfaces, CRMs, and accounting platforms with idempotent webhook processing and clear recovery paths.
              </p>
              <button
                className="text-link"
                style={{ marginTop: 'auto', paddingTop: '16px', color: 'var(--obsidian)' }}
                onClick={() => onNavigate('services/finance-integrations')}
              >
                API and webhook adapters →
              </button>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="card-number" style={{ margin: 0 }}>06 / OPERATE</span>
                <span className="badge badge-neutral">Financial Core</span>
              </div>
              <h3>Financial reconciliation</h3>
              <p>
                For finance teams matching mobile-money collections (MTN, Airtel), bank statements, and internal invoices. Isolates duplicates, overpayments, and refunds automatically.
              </p>
              <button
                className="text-link"
                style={{ marginTop: 'auto', paddingTop: '16px', color: 'var(--obsidian)' }}
                onClick={() => onNavigate('services/reconciliation')}
              >
                Explore reconciliation systems →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 04: HOW EULOK WORKS (The Delivery Spine) */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(64px, 8vw, 100px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '44px' }}>
            <span className="eyebrow">Delivery Process</span>
            <h2>Six stages. Zero ambiguity.</h2>
            <p className="lead">
              We operate with an explicit delivery model. Unknowns stay visible, changes require mutual sign-off, and releases are governed by verification evidence.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '20px' }}>
            <div className="card">
              <span className="card-number">STAGE 01</span>
              <h3>Discover</h3>
              <p>Understand the business problem, operational context, affected stakeholders, constraints, and unknowns.</p>
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Exit Condition:</strong> Problem and scope boundaries agreed.
              </div>
            </div>

            <div className="card">
              <span className="card-number">STAGE 02</span>
              <h3>Scope</h3>
              <p>Draft explicit deliverables, measurable acceptance criteria, technical assumptions, and deliberate exclusions.</p>
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Exit Condition:</strong> Agreed scope authorized by lead engineer and client.
              </div>
            </div>

            <div className="card">
              <span className="card-number">STAGE 03</span>
              <h3>Design</h3>
              <p>Architect data structures, system boundaries, security controls, and interface contracts before writing code.</p>
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Exit Condition:</strong> Interface contracts and data models validated.
              </div>
            </div>

            <div className="card">
              <span className="card-number">STAGE 04</span>
              <h3>Build & Verify</h3>
              <p>Implement reviewable software in controlled increments accompanied by automated tests and security audits.</p>
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Exit Condition:</strong> Deterministic release gates pass.
              </div>
            </div>

            <div className="card">
              <span className="card-number">STAGE 05</span>
              <h3>Deploy & Hand Over</h3>
              <p>Release to production with documented access transfer, operating runbooks, and honest disclosure of limits.</p>
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Exit Condition:</strong> Acceptance criteria verified by client.
              </div>
            </div>

            <div className="card">
              <span className="card-number">STAGE 06</span>
              <h3>Operate & Improve</h3>
              <p>Maintain and optimize systems under an explicit support boundary with defined response windows.</p>
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Exit Condition:</strong> Contractual maintenance obligations fulfilled.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <button
              className="text-link"
              onClick={() => onNavigate('work')}
            >
              Read full delivery methodology and engineering gates →
            </button>
          </div>
        </div>
      </section>

      {/* 05: WHERE WE HELP (Industry Grid) */}
      <section className="section-full theme-navy" style={{ padding: 'clamp(64px, 8vw, 100px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '40px' }}>
            <span className="eyebrow">Operating Contexts</span>
            <h2>Where the way work gets done becomes the bottleneck.</h2>
            <p className="lead">
              We specialize in environments where transactions, member records, and legacy documents intersect with modern cloud infrastructure.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '10px' }}>SECTOR 01</span>
              <h3>Finance & Payments</h3>
              <p>
                Mobile money collections, aggregator reconciliation, EFRIS interface integration, and auditable disbursement tracking.
              </p>
              <button className="text-link" onClick={() => onNavigate('services/reconciliation')} style={{ fontSize: '0.85rem' }}>
                Reconciliation solutions →
              </button>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '10px' }}>SECTOR 02</span>
              <h3>Schools & Education</h3>
              <p>
                Tuition fee collection matching, student record portals, automated parent receipts, and fee balance exception alerts.
              </p>
              <button className="text-link" onClick={() => onNavigate('services/performance-builds')} style={{ fontSize: '0.85rem' }}>
                Custom school portals →
              </button>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '10px' }}>SECTOR 03</span>
              <h3>SACCOs & Cooperatives</h3>
              <p>
                Member savings ledgers, dividend distributions, loan repayment reconciliation, and auditable spreadsheet migration.
              </p>
              <button className="text-link" onClick={() => onNavigate('services/performance-builds')} style={{ fontSize: '0.85rem' }}>
                Cooperative systems →
              </button>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '10px' }}>SECTOR 04</span>
              <h3>Retail & Distribution</h3>
              <p>
                Inventory tracking across store locations, merchant POS webhook synchronization, and multi-channel reconciliation.
              </p>
              <button className="text-link" onClick={() => onNavigate('services/finance-integrations')} style={{ fontSize: '0.85rem' }}>
                Integration options →
              </button>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '10px' }}>SECTOR 05</span>
              <h3>NGOs & Operations Teams</h3>
              <p>
                Field expenditure reconciliation, restricted donor grant tracking, offline-friendly mobile forms, and secure document access.
              </p>
              <button className="text-link" onClick={() => onNavigate('services/performance-builds')} style={{ fontSize: '0.85rem' }}>
                Field operations software →
              </button>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '10px' }}>SECTOR 06</span>
              <h3>Technology Businesses</h3>
              <p>
                Software rescue, regression test hardening, API gateway refactoring, performance budget adherence, and CI/CD pipelines.
              </p>
              <button className="text-link" onClick={() => onNavigate('rescue')} style={{ fontSize: '0.85rem' }}>
                Software rescue services →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 06: TECHNICAL PROOF & ENGINEERING ARTIFACTS (Bento Grid) */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(64px, 8vw, 100px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
            <div>
              <span className="eyebrow">Technical Proof</span>
              <h2>Real engineering artifacts. No hand-waving.</h2>
              <p className="reading-width" style={{ margin: 0 }}>
                We believe engineering credibility is established through code, verifiable architectures, and transparent failure boundaries.
              </p>
            </div>
            <button
              className="button button-quiet"
              onClick={() => onNavigate('ops-suite')}
            >
              <Terminal size={15} />
              <span>Launch Interactive Engine</span>
            </button>
          </div>

          <div className="bento-grid">
            {/* Bento Card 1: Reconciliation Core */}
            <div className="card bento-span-8">
              <span className="mono-tag" style={{ color: 'var(--electric-blue)', marginBottom: '8px' }}>
                PRODUCT 1 · VERIFIED ALGORITHM
              </span>
              <h3>Deterministic Mobile-Money Reconciliation</h3>
              <p>
                Our core reconciliation engine operates with mathematical certainty using Decimal-based arithmetic. It processes input payment streams against receivables obligations, classifying exact matches, partial allocations, duplicate transactions, and isolating refunds and reversals without model guesswork.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                <span className="badge badge-pass">R1: Exact Match</span>
                <span className="badge badge-pass">R2: Reference Allocation</span>
                <span className="badge badge-warn">R5: Duplicate Detection</span>
                <span className="badge badge-fail">R6: Conflicting IDs</span>
                <span className="badge badge-neutral">R7/R8: Refund Isolation</span>
              </div>
            </div>

            {/* Bento Card 2: Release Gate 51 */}
            <div className="card bento-span-4">
              <span className="mono-tag" style={{ color: '#4ade80', marginBottom: '8px' }}>
                ASSURANCE
              </span>
              <h3>51-Point Acceptance Gate</h3>
              <p>
                Before declaring any client build complete, it must satisfy our comprehensive 51-point checklist covering performance, WCAG 2.2 AA accessibility, SEO canonicals, and fail-closed security.
              </p>
              <button
                className="text-link"
                style={{ marginTop: 'auto', paddingTop: '10px' }}
                onClick={() => onNavigate('verification')}
              >
                Inspect 51 verification criteria →
              </button>
            </div>

            {/* Bento Card 3: Idempotency & Retries */}
            <div className="card bento-span-4">
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '8px' }}>
                RELIABILITY
              </span>
              <h3>Idempotency & Duplicate Guards</h3>
              <p>
                Mobile money aggregator webhooks often retry upon transient network timeouts. Our adapters enforce duplicate-key idempotency to guarantee no transaction is credited twice.
              </p>
            </div>

            {/* Bento Card 4: Architecture Notes */}
            <div className="card bento-span-8">
              <span className="mono-tag" style={{ color: 'var(--warm-white)', marginBottom: '8px' }}>
                ENGINEERING NOTES
              </span>
              <h3>Why Financial Systems Need Deterministic Calculations</h3>
              <p>
                IEEE 754 binary floating-point math introduces rounding errors when summing currencies. We document why pure integer or fixed-point decimal arithmetic is required for financial compliance.
              </p>
              <button
                className="text-link"
                style={{ marginTop: '12px' }}
                onClick={() => onNavigate('insights')}
              >
                Read in Engineering Notes →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 07: CASE STUDIES & PUBLICATION STANDARD */}
      <section className="section-full theme-navy" style={{ padding: 'clamp(64px, 8vw, 100px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '40px' }}>
            <span className="eyebrow">Case Studies & Evidence</span>
            <h2>Evidence earned in production, not designed in Figma.</h2>
            <p className="lead">
              We publish case studies only after verified completion, client approval, and independent verification of stated results.
            </p>
          </div>

          <div className="card" style={{ padding: 'clamp(28px, 5vw, 48px)', background: 'var(--bg-primary)' }}>
            <div className="empty-state-grid">
              <div>
                <span className="badge badge-neutral" style={{ marginBottom: '12px' }}>
                  Publication Status
                </span>
                <h3 style={{ fontSize: '1.6rem' }}>Deliberate Empty State</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  First case study publishing after the EFRIS pilot closes. Scope and date, not scope and spin.
                </p>
              </div>

              <div>
                <p>
                  Many software agencies fabricate customer logos, glowing testimonials, and before-and-after conversion percentages. At EULOK, our policy prohibits publishing unverified client claims.
                </p>
                <p>
                  Until client-approved production case studies are published, we make our technical demonstrations, engineering notes, and verification standards available for review.
                </p>
                <button
                  className="button button-quiet button-small"
                  onClick={() => onNavigate('case-studies')}
                  style={{ marginTop: '8px' }}
                >
                  View Case Study Criteria & Demonstration Table →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 08: WHY EULOK (Core Principles) */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(64px, 8vw, 100px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '40px' }}>
            <span className="eyebrow">Operating Commitments</span>
            <h2>Why organizations partner with EULOK.</h2>
          </div>

          <div className="grid-3">
            <div className="card">
              <h3>Evidence over Adjectives</h3>
              <p>No vague promises of "cutting-edge AI". Every performance, accessibility, or reliability claim is backed by reproducible automated checks.</p>
            </div>
            <div className="card">
              <h3>Written Scope & Exclusions</h3>
              <p>Deliverables, dependencies, risks, and explicit exclusions are documented in writing before contracts are signed.</p>
            </div>
            <div className="card">
              <h3>Security by Design</h3>
              <p>Client credentials and source code are isolated. Sensitive financial data is never routed to unapproved or free inference providers.</p>
            </div>
            <div className="card">
              <h3>Automated Verification Gates</h3>
              <p>Every release passes automated unit, integration, accessibility (WCAG 2.2 AA), and security tests prior to deployment.</p>
            </div>
            <div className="card">
              <h3>Complete Ownership Handover</h3>
              <p>Clients receive the source code, deployment scripts, configuration guides, and documented limitations needed to operate independently.</p>
            </div>
            <div className="card">
              <h3>Zero Unnecessary Bloat</h3>
              <p>We build with the smallest adequate architecture. No heavy dependencies or recurring platform fees unless strictly justified.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 09: FINAL CONVERSION SECTION */}
      <section className="section-full theme-navy" style={{ padding: 'clamp(72px, 9vw, 110px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div className="cta-banner-grid">
            <div>
              <span className="eyebrow">Direct Engagement</span>
              <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', marginBottom: '16px' }}>
                Have a system that needs to work better?
              </h2>
              <p className="lead">
                Tell us what you're building, what is broken, or what your business needs to improve. We will clarify unknowns before recommending a build.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start' }}>
              <button
                className="button button-primary"
                style={{ width: '100%', maxWidth: '340px' }}
                onClick={onOpenIntakeModal}
              >
                <span>Start a conversation</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="button button-quiet"
                style={{ width: '100%', maxWidth: '340px' }}
                onClick={() => onNavigate('contact')}
              >
                Review contact channels
              </button>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Direct WhatsApp contact option available · Zero spam
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
