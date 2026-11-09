import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';
import { Eye, CheckCircle2, ArrowRight, ShieldCheck, Monitor, Smartphone, Keyboard } from 'lucide-react';

interface AccessibilityPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const AccessibilityPage: React.FC<AccessibilityPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <nav className="container-expansive breadcrumb-nav" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('home')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Accessibility Statement</span>
      </nav>

      {/* Hero Header */}
      <header className="page-hero-header">
        <div className="container-expansive">
          <span className="eyebrow">Accessibility & Inclusivity</span>
          <h1 className="hero-heading" style={{ maxWidth: '24ch' }}>
            Usable across devices, viewports, and ways of interacting.
          </h1>
          <p className="hero-subheading" style={{ maxWidth: '64ch' }}>
            We design and engineer our web applications to be understandable, navigable, and usable for all people, including those relying on keyboards, screen readers, and high-contrast displays.
          </p>
        </div>
      </header>

      {/* Standards & Practices */}
      <section className="section-padded">
        <div className="container-expansive">
          <div style={{ maxWidth: '68ch' }}>
            <span className="eyebrow">Conformance Target</span>
            <h2>WCAG 2.2 Level AA Standard</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              We test our digital surfaces against the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA. Our engineering pipeline enforces accessibility gates during automated integration:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Keyboard size={18} color="var(--electric-blue)" />
                  <h4 style={{ margin: 0 }}>Full Keyboard Navigation</h4>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                  Visible focus rings (`:focus-visible`), logical tab indexing, skip-to-content links, and full dialog trap/escape management.
                </p>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Eye size={18} color="var(--accent-blue)" />
                  <h4 style={{ margin: 0 }}>Contrast & Typography</h4>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                  High contrast ratios (exceeding 4.5:1 for body copy and 3:1 for large text) across HEXACORE themes. Never relying on color alone for state.
                </p>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Smartphone size={18} color="var(--electric-blue)" />
                  <h4 style={{ margin: 0 }}>Responsive down to 320px</h4>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                  Fluid typography (`clamp()`), expansive layouts with zero horizontal scrollbars, and touch targets sized to at least 44×44px.
                </p>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Monitor size={18} color="var(--accent-blue)" />
                  <h4 style={{ margin: 0 }}>Semantic Structure</h4>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                  Proper landmark roles (`header`, `nav`, `main`, `footer`), nested headings (`h1` through `h4`), and descriptive ARIA labels.
                </p>
              </div>
            </div>

            <span className="eyebrow">Continuous Improvement</span>
            <h2>Feedback and Barrier Reporting</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              Despite automated testing, accessibility barriers can emerge in specific browser and assistive technology combinations. If you encounter any difficulty navigating or reading any part of this site, please let us know:
            </p>

            <div style={{ background: 'var(--deep-navy)', padding: '24px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <h3 style={{ margin: 0, marginBottom: '8px' }}>Report an Accessibility Issue</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Please specify the page URL, assistive device used, and observed barrier. We will prioritize remediation within 5 business days.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href="mailto:accessibility@eulok.com?subject=Accessibility%20Barrier%20Report%20-%20EULOK"
                  className="button button-primary"
                >
                  <span>Email accessibility@eulok.com</span>
                  <ArrowRight size={14} />
                </a>
                <button className="button button-quiet" onClick={onOpenIntakeModal}>
                  <span>Submit via Intake Form</span>
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginTop: '24px' }}>
              Statement last updated: November 2026.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
