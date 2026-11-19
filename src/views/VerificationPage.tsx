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
      subtitle: 'Pure logic verified against mathematical invariants and deterministic test vectors',
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
          detail: 'API keys, webhook secrets, and private signing tokens are excluded from client bundles and verified through automated secret scanning.',
          standard: 'Credential Isolation',
        },
        {
          name: 'Strict Environment Failsafes',
          detail: 'Serverless routes fail closed if required environment variables are absent, with zero fallback default secrets in source control.',
          standard: 'Fail-Closed Defaults',
        },
        {
          name: 'RFC 9116 Vulnerability Disclosure',
          detail: 'Public vulnerability reporting instructions are published at /.well-known/security.txt.',
          standard: 'RFC 9116 Validated',
        },
        {
          name: 'Statutory Data Protection',
          detail: 'Client intake and operational records follow Uganda Data Protection and Privacy Act 2019 retention schedules.',
          standard: 'DPPA 2019 Conformance',
        },
      ],
    },
    {
      title: 'Responsive & Multi-Viewport Engineering',
      subtitle: 'Verified fluid layouts across actual phone, tablet, and desktop widths without horizontal scroll',
      icon: Smartphone,
      criteria: [
        {
          name: '320px Viewport Integrity',
          detail: 'Layouts reflow cleanly down to 320px compact mobile screens without horizontal overflow or clipped typography.',
          standard: 'Zero Horizontal Overflow',
        },
        {
          name: 'Fluid Typography & Spacing',
          detail: 'Font sizes and layout spacing adapt smoothly across phone, tablet, and widescreen breakpoints.',
          standard: 'Fluid Token Scales',
        },
        {
          name: 'Safe-Area & Fixed Element Insets',
          detail: 'Floating drawers and overlays respect hardware safe-area insets and never obscure primary reading flows.',
          standard: 'Unobstructed Viewports',
        },
        {
          name: 'Touch Target Compliance',
          detail: 'Interactive buttons, menu toggles, and inputs provide generous 44×44px minimum tap areas on mobile devices.',
          standard: '≥ 44px Touch Targets',
        },
      ],
    },
    {
      title: 'Accessibility & Usability (WCAG 2.2 AA)',
      subtitle: 'Inclusive digital interfaces engineered for keyboard navigation and assistive screen readers',
      icon: Eye,
      criteria: [
        {
          name: 'Full Keyboard Navigability',
          detail: 'All menus, drawers, and interactive tools operate seamlessly via Tab/Shift+Tab and Escape dismissal.',
          standard: 'Keyboard Operable',
        },
        {
          name: 'Visible Focus Indicators',
          detail: 'High-contrast focus outlines render consistently across interactive buttons and links in both dark and light modes.',
          standard: 'Visible Focus Rings',
        },
        {
          name: 'Verified Contrast Ratios',
          detail: 'Body copy exceeds 4.5:1 contrast against surfaces; display headers exceed 3:1, paired with non-color cues.',
          standard: '≥ 4.5:1 Body Contrast',
        },
        {
          name: 'Accessible Dialog Traps & Semantics',
          detail: 'Drawers and modals implement accessible dialog roles, semantic headings, and focus restoration on dismissal.',
          standard: 'WAI-ARIA Conforming',
        },
      ],
    },
    {
      title: 'Production Edge Architecture',
      subtitle: 'Serverless, pre-rendered regional delivery with clean atomic releases',
      icon: Server,
      criteria: [
        {
          name: 'Pre-Rendered Core Pages',
          detail: 'Core marketing and documentation pages deliver clean pre-rendered HTML and CSS readable immediately over cellular networks.',
          standard: 'Instant HTML First Paint',
        },
        {
          name: 'Regional Anycast Delivery',
          detail: 'Static web payloads cache close to users across Kampala, Nairobi, and East African mobile corridors.',
          standard: 'Low-Latency Edge Cache',
        },
        {
          name: 'Immutable Atomic Deployments',
          detail: 'Production deployments tie directly to clean repository releases allowing instant rollback without downtime.',
          standard: 'Atomic Release Cutover',
        },
        {
          name: 'Stateless Form & Routing Boundaries',
          detail: 'Project inquiry handlers run cleanly at the edge without exposing sensitive backend credentials.',
          standard: 'Stateless Edge Isolation',
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
    <>
      {/* Hero Header */}
      <section className="section-full theme-dark band-hero">
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Release Verification Methodology</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">Engineering Rigor · Acceptance Standards</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)', marginBottom: '20px', maxWidth: '28ch' }}>
              Deterministic Release Verification Standard
            </h1>
            <p className="lead" style={{ maxWidth: '66ch', marginBottom: '24px' }}>
              How EULOK verifies software architectures before production release. We reject subjective claims and self-graded checkboxes. Every deliverable is verified through reproducible automated tests, security boundary isolation, accessibility audits, and multi-viewport responsive testing.
            </p>

            <blockquote className="callout-panel" style={{ maxWidth: '60ch', margin: 0 }}>
              <strong>Core Rule:</strong> Explicit verification over assumptions. Every critical system requires reproducible, auditable acceptance evidence prior to launch.
            </blockquote>
          </div>
        </div>
      </section>

      {/* The Five Verification Disciplines (Open Hierarchy, Zero Nested Cards-within-Cards) */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ marginBottom: '12px' }}>
            <span className="eyebrow">The EULOK Quality Spine</span>
            <h2>Five Architectural Verification Disciplines</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '64ch', lineHeight: 1.6, marginBottom: 0 }}>
              Production software must survive hostile network conditions, carrier retries, and continuous daily operation. Every deliverable passes five verification disciplines:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {pillars.map((pillar, pIdx) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="pillar-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={19} color="var(--electric-blue)" />
                      </div>
                      <div>
                        <span className="card-number" style={{ margin: 0 }}>DISCIPLINE 0{pIdx + 1}</span>
                        <h3 style={{ fontSize: '1.35rem', margin: '2px 0 0' }}>{pillar.title}</h3>
                      </div>
                    </div>

                    <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                      RELEASE GATE
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginBottom: '22px', maxWidth: '68ch' }}>
                    {pillar.subtitle}
                  </p>

                  <div className="grid-2">
                    {pillar.criteria.map((item) => (
                      <div
                        key={item.name}
                        className="card"
                        style={{
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                          <strong style={{ fontSize: '0.96rem', color: 'var(--warm-white)' }}>
                            {item.name}
                          </strong>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--electric-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {item.standard}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
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
      <section className="section-full theme-dark band-section">
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

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
    </>
  );
};
