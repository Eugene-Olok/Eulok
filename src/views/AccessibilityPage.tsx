import { navigateTo } from '../utils/navigation';
import React from 'react';
import { Eye, ArrowRight, Monitor, Smartphone, Keyboard } from 'lucide-react';

interface AccessibilityPageProps {
  onNavigate?: (page: string) => void;
}

export const AccessibilityPage: React.FC<AccessibilityPageProps> = ({
  onNavigate = navigateTo,
}) => {
  return (
    <>
      {/* Hero Header */}
      <section className="section-full theme-dark band-hero">
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Accessibility Statement</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">Accessibility &amp; Inclusivity</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)', marginBottom: '20px', maxWidth: '24ch' }}>
              Usable across devices, networks, and ways of interacting.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch', marginBottom: 0 }}>
              We engineer web systems across Uganda and East Africa to remain legible, keyboard-operable, and dependable across budget mobile handsets, screen readers, and varied display settings.
            </p>
          </div>
        </div>
      </section>

      {/* Standards & Practices */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '760px', marginBottom: '32px' }}>
            <span className="eyebrow">Conformance Target</span>
            <h2>WCAG 2.2 Level AA Standard</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              Every public interface is tested against the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA before release:
            </p>
          </div>

          <div className="grid-2">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Keyboard size={18} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.12rem' }}>Full Keyboard Navigation</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Visible focus indicators, logical tab ordering, skip-to-content navigation, and full Escape dismissal and focus restoration on dialogs.
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Eye size={18} color="var(--accent-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.12rem' }}>Contrast &amp; Typography</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Verified contrast exceeding 4.5:1 for body text and 3:1 for display headings in both dark and light modes, with clear non-color status cues.
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Smartphone size={18} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.12rem' }}>Mobile Reflow Down to 320px</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Fluid layouts without horizontal scrolling on compact mobile handsets, paired with accessible touch targets sized at least 44×44px.
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Monitor size={18} color="var(--accent-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.12rem' }}>Semantic Structure &amp; Reduced Motion</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Consistent landmarks, clear heading hierarchy, descriptive labels, and automatic respect for system reduced-motion preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback & Barrier Reporting */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div className="governance-grid">
            <div>
              <span className="eyebrow">Continuous Improvement</span>
              <h2>Feedback and Barrier Reporting</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                If any page, interactive workbench, or document presents a navigation or readability barrier with your browser or assistive device, let us know directly so we can investigate and resolve it promptly.
              </p>
            </div>

            <div className="card" style={{ padding: 'clamp(24px, 4vw, 34px)', borderColor: 'var(--line-strong)', alignSelf: 'start' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Report an Accessibility Barrier</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
                Include the page link, device or assistive tool used, and what went wrong. Reported barriers are triaged within 5 business days.
              </p>
              <a
                href="mailto:accessibility@eulok.com?subject=Accessibility%20Barrier%20Report%20-%20EULOK"
                className="button button-primary"
              >
                <span>Email accessibility@eulok.com</span>
                <ArrowRight size={14} />
              </a>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginTop: '20px', marginBottom: 0 }}>
                Statement updated: November 2026.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
