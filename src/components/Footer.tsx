import React from 'react';
import { MessageSquare, Mail, ArrowUpRight, Activity, Sliders } from 'lucide-react';
import { navigateTo, openIntakeModal } from '../utils/navigation';
import { ThemeToggle } from './ThemeToggle';

interface FooterProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenIntakeModal,
}) => {
  const whatsappUrl = 'https://wa.me/256760779160?text=Hello%20EULOK%2C%20I%20would%20like%20to%20discuss%20a%20software%20engineering%20project.';

  const handleNav = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      navigateTo(page);
    }
  };

  const handleIntake = () => {
    if (onOpenIntakeModal) {
      onOpenIntakeModal();
    } else {
      openIntakeModal();
    }
  };

  return (
    <footer className="site-footer">
      <div className="container-expansive">
        <div className="footer-grid">
          {/* Col 1: Brand & Philosophy */}
          <div className="footer-col">
            <a
              href="/"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  handleNav('home');
                }
              }}
              className="brand-wordmark"
              style={{ marginBottom: '14px', display: 'inline-flex' }}
            >
              <span>EULOK</span>
              <span className="brand-badge">ENG</span>
            </a>
            <p style={{ maxWidth: '38ch', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              Independent software engineering for organizations that need systems to survive production.
            </p>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Kampala, Uganda · Remote worldwide
            </p>
            <blockquote style={{ margin: '14px 0 0', padding: '6px 12px', borderLeft: '2px solid var(--accent-blue)', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
              Models propose. Deterministic systems decide.
            </blockquote>
          </div>

          {/* Col 2: Explore */}
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><a href="/" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('home'); } }}>Home</a></li>
              <li><a href="/services" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('services'); } }}>Services Overview</a></li>
              <li><a href="/rescue" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('rescue'); } }}>Software Rescue</a></li>
              <li><a href="/work" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('work'); } }}>How We Work</a></li>
              <li><a href="/case-studies" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('case-studies'); } }}>Work & Case Studies</a></li>
              <li><a href="/about" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('about'); } }}>About EULOK</a></li>
            </ul>
          </div>

          {/* Col 3: Engineering */}
          <div className="footer-col">
            <h4>Engineering & Tools</h4>
            <ul>
              <li><a href="/scope-calculator" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('scope-calculator'); } }}>Scoping Studio (SOW)</a></li>
              <li><a href="/ops-suite" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('ops-suite'); } }}>Reconciliation Core</a></li>
              <li><a href="/insights" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('insights'); } }}>Engineering Notes</a></li>
              <li><a href="/services/finance-integrations" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('services/finance-integrations'); } }}>Finance Integrations</a></li>
              <li><a href="/verification" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('verification'); } }}>Release Verification Standard</a></li>
              <li><a href="/status" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('status'); } }}>Live Edge Telemetry</a></li>
            </ul>
          </div>

          {/* Col 4: Start a Project */}
          <div className="footer-col">
            <h4>Start a Project</h4>
            <ul>
              <li>
                <button
                  type="button"
                  onClick={handleIntake}
                  style={{ fontWeight: 700, color: 'var(--warm-white)', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                >
                  Start Project Intake →
                </button>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={14} color="#25D366" />
                  <span>Continue on WhatsApp</span>
                  <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@eulok.com?subject=Project%20Inquiry%20-%20EULOK"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Mail size={14} />
                  <span>Send an Email</span>
                </a>
              </li>
              <li>
                <a href="/contact" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('contact'); } }}>Contact Channel Info</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="/privacy" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('privacy'); } }}>Privacy Notice</a>
            <a href="/security" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('security'); } }}>Security & RFC 9116</a>
            <a href="/accessibility" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('accessibility'); } }}>Accessibility (WCAG 2.2 AA)</a>
            <a href="/standards" onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('standards'); } }}>Delivery Commitments</a>
            <a
              href="/status"
              onClick={(e) => { if (onNavigate) { e.preventDefault(); handleNav('status'); } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4ade80' }}
            >
              <span className="live-status-dot" style={{ width: '7px', height: '7px' }} />
              Live Status
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <ThemeToggle showLabel />
            <span>© {new Date().getFullYear()} EULOK. Each engagement is subject to explicit written scope and acceptance.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
