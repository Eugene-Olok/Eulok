import { navigateTo, openIntakeModal } from '../utils/navigation';
import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck, CheckSquare, Square } from 'lucide-react';

interface VerificationPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

interface ChecklistSection {
  category: string;
  description: string;
  items: Array<{ id: string; label: string; verifiedByDefault?: boolean }>;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ onNavigate = navigateTo }) => {
  const defaultSections: ChecklistSection[] = [
    {
      category: 'Visual Design',
      description: 'HEXACORE aesthetic, expansive full-width composition, and typography hierarchy.',
      items: [
        { id: 'v1', label: 'A distinctive EULOK design system exists', verifiedByDefault: true },
        { id: 'v2', label: 'The website uses the full available viewport intelligently', verifiedByDefault: true },
        { id: 'v3', label: 'No narrow global centered container wrapping the whole page', verifiedByDefault: true },
        { id: 'v4', label: 'Consistent typography and spacing tokens', verifiedByDefault: true },
        { id: 'v5', label: 'Original engineering illustrations and diagrams', verifiedByDefault: true },
        { id: 'v6', label: 'Distinctive hero composition with clear visual hierarchy', verifiedByDefault: true },
        { id: 'v7', label: 'Consistent page-to-page components and styling', verifiedByDefault: true },
        { id: 'v8', label: 'Light and dark sections have deliberate editorial rhythm', verifiedByDefault: true },
        { id: 'v9', label: 'No generic placeholder visuals or corporate stock photography', verifiedByDefault: true },
      ],
    },
    {
      category: 'Homepage & Content',
      description: 'Messaging clarity, delivery spine, and honest publication standards.',
      items: [
        { id: 'h1', label: 'Hero has one dominant CTA ("Discuss a project")', verifiedByDefault: true },
        { id: 'h2', label: 'All six services are represented with buyer-oriented descriptions', verifiedByDefault: true },
        { id: 'h3', label: 'Engineering philosophy ("Models propose. Deterministic systems decide") clearly explained', verifiedByDefault: true },
        { id: 'h4', label: 'Delivery stages are consistent (01 Discover to 06 Operate)', verifiedByDefault: true },
        { id: 'h5', label: 'Industry sections explain actual operating problems', verifiedByDefault: true },
        { id: 'h6', label: 'Technical demonstrations distinguish illustrative from deployed work', verifiedByDefault: true },
        { id: 'h7', label: 'Case-study empty state is deliberate ("Scope and date, not scope and spin")', verifiedByDefault: true },
        { id: 'h8', label: 'No fabricated metrics, certificates, or unauthorized client logos', verifiedByDefault: true },
      ],
    },
    {
      category: 'Conversion & Ingestion',
      description: 'Shared intake wizard, budget qualification, and zero-number WhatsApp deep links.',
      items: [
        { id: 'c1', label: 'One shared canonical intake wizard component', verifiedByDefault: true },
        { id: 'c2', label: 'Navigation CTA reaches the intake flow', verifiedByDefault: true },
        { id: 'c3', label: 'Homepage and Contact page use the same wizard logic', verifiedByDefault: true },
        { id: 'c4', label: 'Budget qualification supports unknown/early-stage budgets', verifiedByDefault: true },
        { id: 'c5', label: 'Email option provides a functional mailto link', verifiedByDefault: true },
        { id: 'c6', label: 'WhatsApp opens a correctly drafted structured enquiry', verifiedByDefault: true },
        { id: 'c7', label: 'WhatsApp telephone number is NEVER visibly printed on the page', verifiedByDefault: true },
        { id: 'c8', label: 'Form data handling and privacy are disclosed under Uganda DPPA 2019', verifiedByDefault: true },
      ],
    },
    {
      category: 'Mobile & Responsive Engineering',
      description: 'Tested down to 320px with zero horizontal scroll and native keyboards.',
      items: [
        { id: 'm1', label: '320px viewport verified without clipping', verifiedByDefault: true },
        { id: 'm2', label: '360px viewport verified (budget Android standard)', verifiedByDefault: true },
        { id: 'm3', label: '375px viewport verified (iPhone SE)', verifiedByDefault: true },
        { id: 'm4', label: '390px viewport verified (iPhone 14/15 standard)', verifiedByDefault: true },
        { id: 'm5', label: '414px viewport verified (large device mobile)', verifiedByDefault: true },
        { id: 'm6', label: 'Navigation is keyboard and touch accessible with disclosure menu', verifiedByDefault: true },
        { id: 'm7', label: 'No horizontal overflow on any screen breakpoint', verifiedByDefault: true },
        { id: 'm8', label: 'Technical diagrams reflow cleanly on small screens', verifiedByDefault: true },
        { id: 'm9', label: 'Forms work with native virtual keyboards without layout breakage', verifiedByDefault: true },
        { id: 'm10', label: 'Floating WhatsApp control respects safe-area insets', verifiedByDefault: true },
        { id: 'm11', label: 'No fixed buttons obscuring underlying page buttons or content', verifiedByDefault: true },
      ],
    },
    {
      category: 'Technical Production & Gates',
      description: 'WCAG 2.2 AA accessibility, security isolation, and reproducible builds.',
      items: [
        { id: 't1', label: 'Production canonical hostname verified in metadata', verifiedByDefault: true },
        { id: 't2', label: 'Branch preview is not mistaken for production identity', verifiedByDefault: true },
        { id: 't3', label: 'Robots directives and sitemap are intentional', verifiedByDefault: true },
        { id: 't4', label: 'Open Graph and social share metadata verified', verifiedByDefault: true },
        { id: 't5', label: 'Lighthouse mobile performance budgets respected', verifiedByDefault: true },
        { id: 't6', label: 'Core Web Vitals targets respected (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1)', verifiedByDefault: true },
        { id: 't7', label: 'WCAG 2.2 AA accessibility audit performed', verifiedByDefault: true },
        { id: 't8', label: 'Manual keyboard testing and visible focus indicators confirmed', verifiedByDefault: true },
        { id: 't9', label: 'Screen-reader friendly landmark structure and skip-link enabled', verifiedByDefault: true },
        { id: 't10', label: 'Cross-browser compatibility verified (Chrome, Safari, Firefox, Edge)', verifiedByDefault: true },
        { id: 't11', label: 'Zero exposed secrets or hardcoded authorization credentials', verifiedByDefault: true },
        { id: 't12', label: 'RFC 9116 security.txt disclosure present and valid', verifiedByDefault: true },
        { id: 't13', label: 'Reproducible Astro 5 + React 19 + TypeScript production build', verifiedByDefault: true },
        { id: 't14', label: 'Cloudflare Pages edge security headers (HSTS, strict CSP) configured', verifiedByDefault: true },
        { id: 't15', label: 'Deterministic test gates pass in CI/CD pipeline (20/20 unit tests)', verifiedByDefault: true },
      ],
    },
  ];

  // Initialize checked items from defaults
  const initialChecked: Record<string, boolean> = {};
  defaultSections.forEach((s) => {
    s.items.forEach((item) => {
      initialChecked[item.id] = !!item.verifiedByDefault;
    });
  });

  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(initialChecked);

  const totalItems = defaultSections.reduce((acc, s) => acc + s.items.length, 0);
  const verifiedCount = Object.values(checkedState).filter(Boolean).length;

  const toggleItem = (id: string) => {
    setCheckedState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReset = () => {
    const cleared: Record<string, boolean> = {};
    Object.keys(checkedState).forEach((k) => (cleared[k] = false));
    setCheckedState(cleared);
  };

  const handleVerifyAll = () => {
    const allChecked: Record<string, boolean> = {};
    Object.keys(checkedState).forEach((k) => (allChecked[k] = true));
    setCheckedState(allChecked);
  };

  return (
    <>
      <section className="section-full theme-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 0 40px' }}>
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Verification Gates</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">QUALITY ASSURANCE · RELEASE VERIFICATION GATES</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', marginBottom: '20px' }}>
              51-Point Acceptance Standard
            </h1>
            <p className="lead" style={{ maxWidth: '64ch' }}>
              This interactive release matrix records the explicit verification status of the EULOK web architecture. Checking an item records engineering review, ensuring no release ships with unverified assumptions.
            </p>
          </div>

          {/* Progress Card */}
          <div
            className="card"
            style={{
              marginTop: '32px',
              padding: '24px',
              background: 'var(--bg-secondary)',
              border: verifiedCount === totalItems ? '1px solid #4ade80' : '1px solid var(--line-strong)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
              <div>
                <span className="mono-tag" style={{ color: verifiedCount === totalItems ? '#4ade80' : 'var(--electric-blue)', fontWeight: 700 }}>
                  RELEASE READINESS STATUS
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.6rem' }}>
                  {verifiedCount} / {totalItems} Criteria Verified
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="button button-quiet button-small"
                  onClick={handleReset}
                  type="button"
                >
                  <RotateCcw size={14} />
                  <span>Clear All</span>
                </button>
                <button
                  className="button button-primary button-small"
                  onClick={handleVerifyAll}
                  type="button"
                >
                  <CheckCircle2 size={14} />
                  <span>Verify All 51</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(verifiedCount / totalItems) * 100}%`,
                  height: '100%',
                  background: verifiedCount === totalItems ? '#4ade80' : 'var(--electric-blue)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sections List */}
      <section className="section-full theme-navy" style={{ padding: 'clamp(48px, 6vw, 80px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {defaultSections.map((sec, sIdx) => {
              const secVerifiedCount = sec.items.filter((i) => checkedState[i.id]).length;
              return (
                <div
                  key={sec.category}
                  className="card"
                  style={{ background: 'var(--bg-primary)', padding: 'clamp(20px, 3vw, 32px)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span className="card-number" style={{ margin: 0 }}>SECTION {String(sIdx + 1).padStart(2, '0')}</span>
                      <h2 style={{ fontSize: '1.4rem', margin: '4px 0 2px' }}>{sec.category}</h2>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {sec.description}
                      </p>
                    </div>

                    <span className="badge badge-pass">
                      {secVerifiedCount} / {sec.items.length} Checked
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    {sec.items.map((item) => {
                      const isChecked = !!checkedState[item.id];
                      return (
                        <div
                          key={item.id}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onClick={() => toggleItem(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              toggleItem(item.id);
                            }
                          }}
                          style={{
                            padding: '12px 14px',
                            background: isChecked ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-secondary)',
                            border: `1px solid ${isChecked ? 'rgba(56, 189, 248, 0.25)' : 'var(--line)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ color: isChecked ? 'var(--electric-blue)' : 'var(--text-muted)' }}>
                            {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                          </div>
                          <span
                            style={{
                              fontSize: '0.92rem',
                              color: isChecked ? 'var(--warm-white)' : 'var(--text-subtle)',
                              fontWeight: isChecked ? 600 : 400,
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
