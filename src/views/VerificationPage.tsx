import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Smartphone,
  Eye,
  Server,
  ArrowRight,
  Lock,
  Layers,
  FileCheck,
} from 'lucide-react';
import { navigateTo, openIntakeModal } from '../utils/navigation';

interface VerificationPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

interface VerificationPillar {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  criteria: Array<{ name: string; detail: string; standard: string }>;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal,
}) => {
  const pillars: VerificationPillar[] = [
    {
      title: 'Deterministic Invariant Testing',
      subtitle: 'Pure logic verified against mathematical truth with zero model hallucinations',
      icon: Cpu,
      criteria: [
        {
          name: 'Fixed-Point Integer Precision',
          detail: 'Financial calculations use integer cents or Decimal types to eliminate IEEE 754 floating-point drift across multi-million UGX ledgers.',
          standard: 'Zero Rounding Drift',
        },
        {
          name: 'Strict Event Idempotency',
          detail: 'Aggregator webhooks and payment event payloads enforce SHA-256 fingerprinting to prevent replay attacks and duplicate postings.',
          standard: 'Duplicate Rejection',
        },
        {
          name: 'Monotonic Workflow Transitions',
          detail: 'Delivery pipelines and financial states follow single-direction progression; settled transactions cannot be retroactively modified without an audit entry.',
          standard: 'Fail-Closed State Machine',
        },
        {
          name: 'Partitioned Reconciliation Ledgers',
          detail: 'Refunds and reversals are strictly partitioned from credit settlements, ensuring debtor liabilities are never silently offset.',
          standard: 'Partition Isolation',
        },
      ],
    },
    {
      title: 'Security & Secrets Governance',
      subtitle: 'Zero trust boundary isolation between development, client data, and production infrastructure',
      icon: ShieldCheck,
      criteria: [
        {
          name: 'Zero Client-Side Credentials',
          detail: 'API keys, webhook secrets, and private signing tokens are never bundled in client code; verified via automated Gitleaks static analysis.',
          standard: 'Credential Isolation',
        },
        {
          name: 'Strict Environment Failsafes',
          detail: 'Endpoints and functions fail closed if critical environment variables are absent; zero fallback default secrets allowed in codebase.',
          standard: 'Fail-Closed Defaults',
        },
        {
          name: 'RFC 9116 Vulnerability Disclosure',
          detail: 'Institutional security contact protocol and PGP disclosure keys published under standard /.well-known/security.txt endpoints.',
          standard: 'RFC 9116 Validated',
        },
        {
          name: 'Statutory Data Protection',
          detail: 'Client intake and operational data comply with the Uganda Data Protection and Privacy Act 2019 with explicit retention schedules.',
          standard: 'DPPA 2019 Conformance',
        },
      ],
    },
    {
      title: 'Responsive & Multi-Viewport Engineering',
      subtitle: 'Verified fluid layouts across actual physical screen widths without horizontal scroll',
      icon: Smartphone,
      criteria: [
        {
          name: '320px Viewport Integrity',
          detail: 'Layouts reflow cleanly down to 320px (compact budget Android standard) without horizontal overflow or clipped typography.',
          standard: 'Zero Horizontal Overflow',
        },
        {
          name: 'Fluid Typography & Spacing',
          detail: 'Font sizes and container gutters use CSS clamp() tokens, preventing abrupt reflow jumps across tablet and mobile breakpoints.',
          standard: 'Fluid Token Scales',
        },
        {
          name: 'Safe-Area & Fixed Element Insets',
          detail: 'Interactive floating controls respect hardware safe-area insets (iOS home bar, Android gesture zones) and never obscure underlying content.',
          standard: 'Unobstructed Viewports',
        },
        {
          name: 'Touch Target Compliance',
          detail: 'Interactive buttons, menu toggles, and form inputs provide a minimum 44×44px hit target for reliable mobile ergonomics.',
          standard: '≥ 44px Touch Targets',
        },
      ],
    },
    {
      title: 'Accessibility & Usability (WCAG 2.2 AA)',
      subtitle: 'Inclusive digital surfaces engineered for keyboard navigation and assistive screen readers',
      icon: Eye,
      criteria: [
        {
          name: 'Full Keyboard Navigability',
          detail: 'All interactive elements, drawers, and modal dialogs are reachable via Tab/Shift+Tab, with Escape keys bound to close operations.',
          standard: 'Keyboard Operable',
        },
        {
          name: 'Visible Focus Indicators',
          detail: 'High-contrast 2px focus outlines (:focus-visible) render consistently across all actionable buttons and links in both dark and light modes.',
          standard: 'Visible Focus Rings',
        },
        {
          name: 'Contrast Ratios & Editorial Color',
          detail: 'Body copy exceeds 4.5:1 contrast against backdrops; large display headers exceed 3:1. Color is never the sole conveyer of status.',
          standard: '≥ 4.5:1 Body Contrast',
        },
        {
          name: 'Accessible Dialog Traps & Semantics',
          detail: 'Modals and slide-over drawers implement proper aria-modal="true", role="dialog", and focus restoration on dismissal.',
          standard: 'WAI-ARIA Conforming',
        },
      ],
    },
    {
      title: 'Production Edge Architecture',
      subtitle: 'Serverless, pre-rendered global Anycast distribution with atomic release cutovers',
      icon: Server,
      criteria: [
        {
          name: '100% Pre-rendered Static Pages',
          detail: 'Core marketing and documentation pages compile to static HTML/CSS. Content is fully readable without executing client-side JavaScript.',
          standard: 'Astro 5 SSG Compilation',
        },
        {
          name: 'Cloudflare Pages Anycast Network',
          detail: 'Assets are distributed globally across 300+ edge locations, ensuring sub-100ms first-byte response times worldwide.',
          standard: 'Global Anycast Edge',
        },
        {
          name: 'Immutable Atomic Deployments',
          detail: 'Each production deployment is tied to an immutable git commit hash, allowing instant roll-forward or rollback without downtime.',
          standard: 'Atomic Git Cutover',
        },
        {
          name: 'Stateless Edge Functions',
          detail: 'Inquiry processing routes (/api/intake) execute in isolated edge V8 isolates with zero permanent database credential exposure.',
          standard: 'Stateless Edge V8',
        },
      ],
    },
  ];

  const handleStartProject = () => {
    if (onOpenIntakeModal) {
      onOpenIntakeModal();
    } else {
      openIntakeModal();
    }
  };

  return (
    <div className="page-wrapper">
      {/* Breadcrumb Navigation */}
      <nav className="container-expansive breadcrumb-nav" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('home')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Release Verification Methodology</span>
      </nav>

      {/* Hero Header */}
      <header className="page-hero-header">
        <div className="container-expansive">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>
              ENGINEERING RIGOR · ACCEPTANCE STANDARDS
            </span>
          </div>

          <h1 className="hero-heading" style={{ maxWidth: '28ch' }}>
            Deterministic Release Verification Standard
          </h1>
          <p className="hero-subheading" style={{ maxWidth: '66ch' }}>
            How EULOK verifies software architectures before production release. We reject subjective claims and self-graded checkboxes. Every deliverable is proven through reproducible automated tests, security boundary isolation, accessibility audits, and multi-viewport responsive testing.
          </p>

          <blockquote
            style={{
              margin: '24px 0 0',
              padding: '12px 18px',
              borderLeft: '3px solid var(--electric-blue)',
              background: 'var(--bg-secondary)',
              borderRadius: '0 8px 8px 0',
              color: 'var(--warm-white)',
              maxWidth: '60ch',
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}
          >
            <strong>Core Rule:</strong> Models propose. Deterministic systems decide. We never treat model output as proof of correctness. Critical software requires reproducible, auditable evidence.
          </blockquote>
        </div>
      </header>

      {/* The Five Verification Disciplines */}
      <section className="section-padded">
        <div className="container-expansive">
          <div style={{ marginBottom: '36px' }}>
            <span className="eyebrow">The EULOK Quality Spine</span>
            <h2>Five Architectural Verification Disciplines</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '64ch', lineHeight: 1.6 }}>
              Production software must survive hostile network environments, unexpected edge cases, and continuous operation. We test deliverables against five core dimensions:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {pillars.map((pillar, pIdx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="card"
                  style={{
                    background: 'var(--bg-primary)',
                    padding: 'clamp(20px, 3.5vw, 36px)',
                    border: '1px solid var(--line-strong)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                        }}
                      >
                        <Icon size={20} color="var(--electric-blue)" />
                      </div>
                      <div>
                        <span className="card-number" style={{ margin: 0 }}>DISCIPLINE 0{pIdx + 1}</span>
                        <h3 style={{ fontSize: '1.35rem', margin: '2px 0 0' }}>{pillar.title}</h3>
                      </div>
                    </div>

                    <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                      MANDATORY RELEASE GATE
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px', maxWidth: '68ch' }}>
                    {pillar.subtitle}
                  </p>

                  <div className="grid-2">
                    {pillar.criteria.map((item) => (
                      <div
                        key={item.name}
                        style={{
                          padding: '16px',
                          background: 'var(--bg-secondary)',
                          borderRadius: '8px',
                          border: '1px solid var(--line)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.94rem', color: 'var(--warm-white)' }}>
                            {item.name}
                          </strong>
                          <span className="badge badge-pass" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {item.standard}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Handover & Client Audit Governance */}
      <section className="section-padded section-alt">
        <div className="container-expansive">
          <div className="grid-2">
            <div>
              <span className="eyebrow">Handover Protocol</span>
              <h2>Clean Handover & Complete Code Ownership</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
                Every client engagement concludes with a comprehensive handover package. Clients receive full repository rights, clean git history, documented architecture specifications, and deterministic test suites that run independently in standard Node.js environments.
              </p>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                <li>No proprietary vendor lock-in or obfuscated runtimes.</li>
                <li>Executable test suites with zero external cloud dependencies.</li>
                <li>Production runbooks for DNS cutover, rollback, and disaster recovery.</li>
                <li>Documented credential rotation certificates upon final milestone delivery.</li>
              </ul>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '12px', display: 'inline-block' }}>
                DISCUSS AN ENGAGEMENT
              </span>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>
                Need production software verified to these standards?
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Whether you need a legacy codebase rescued, a multi-rail reconciliation engine built, or a mission-critical platform engineered from discovery through production, we deliver with written scope and deterministic acceptance.
              </p>

              <button
                type="button"
                className="button button-primary"
                onClick={handleStartProject}
                style={{ alignSelf: 'flex-start' }}
              >
                <span>Start Project Intake</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
