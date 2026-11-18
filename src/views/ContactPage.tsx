import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';
import { IntakeWizard } from '../components/IntakeWizard';
import { ContactDocSearch } from '../components/ContactDocSearch';
import { Mail, MessageSquare, ShieldCheck, ArrowRight, Clock, FileCheck } from 'lucide-react';

interface ContactPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigate = navigateTo,
}) => {
  const whatsappUrl = 'https://wa.me/256760779160?text=Hello%20EULOK%2C%20I%20would%20like%20to%20discuss%20a%20software%20engineering%20project.';

  return (
    <>
      {/* Hero Header */}
      <section className="section-full theme-dark band-hero">
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Contact &amp; Project Intake</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">Start a conversation</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)', marginBottom: '20px', maxWidth: '22ch' }}>
              What needs to work better?
            </h1>
            <p className="lead" style={{ maxWidth: '64ch', marginBottom: 0 }}>
              Tell us what is breaking, slowing your team down, or stopping an operational process from functioning reliably. We will establish whether EULOK is the right technical fit before proposing a scope.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form Section: Direct Embedded Scoping Wizard */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '32px', alignItems: 'start' }}>
            {/* Left Col: Interactive Intake Wizard */}
            <div>
              <IntakeWizard isModal={false} />
            </div>

            {/* Right Col: Communication Channels & Operational Rules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <span className="eyebrow" style={{ color: 'var(--accent-blue)' }}>Direct Inquiries</span>
                <h3 style={{ marginTop: '4px', marginBottom: '12px' }}>Communication Channels</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  We work asynchronously and via focused working sessions. Choose your preferred initial outreach method:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-primary"
                    style={{ background: '#25D366', color: '#052e16', borderColor: '#25D366', justifyContent: 'center' }}
                  >
                    <MessageSquare size={16} fill="#052e16" />
                    <span>Continue on WhatsApp</span>
                  </a>

                  <a
                    href="mailto:hello@eulok.com?subject=Project%20Inquiry%20-%20EULOK"
                    className="button button-quiet"
                    style={{ justifyContent: 'center' }}
                  >
                    <Mail size={16} />
                    <span>Send via Email (hello@eulok.com)</span>
                  </a>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    <Clock size={14} />
                    <span>Based in Kampala, Uganda (UTC+3) · Serving Uganda &amp; East Africa</span>
                  </div>
                </div>
              </div>

              {/* Data Safety Rules */}
              <div className="card" style={{ borderColor: 'rgba(56, 189, 248, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <ShieldCheck size={18} color="var(--electric-blue)" />
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Initial Inquiry Data Policy</h4>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  For initial scoping, a high-level description is sufficient. <strong>Never submit live passwords, API tokens, personal client records, or unredacted financial database dumps</strong> in initial outreach.
                </p>
              </div>

              {/* Engagement Steps */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <FileCheck size={18} color="var(--accent-blue)" />
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>What Happens Next?</h4>
                </div>
                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <li>We evaluate the technical constraints and identify unknowns within 24–48 hours.</li>
                  <li>If the project is a fit, we schedule a 30-minute discovery session or propose a bounded diagnostic.</li>
                  <li>You receive an explicit proposal with deliverables, exclusions, acceptance criteria, and milestones.</li>
                  <li>Engineering begins only after commercial terms and scope are signed by both parties.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Service Documentation & FAQ Quick Filter */}
      <ContactDocSearch onNavigate={onNavigate} />

      {/* Alternative Guides */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '640px' }}>
            <span className="eyebrow">Explore Our Approach</span>
            <h2>Not sure if your problem fits our services?</h2>
            <p style={{ color: 'var(--text-subtle)', marginBottom: '20px' }}>
              Software rescue, custom operational systems, and financial reconciliation represent our primary focus areas. Explore how we structure contracts and verify delivery before committing.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button type="button" className="button button-quiet" onClick={() => onNavigate('services')}>
                <span>Browse Services</span>
                <ArrowRight size={14} />
              </button>
              <button type="button" className="button button-quiet" onClick={() => onNavigate('work')}>
                <span>How We Work</span>
                <ArrowRight size={14} />
              </button>
              <button type="button" className="button button-quiet" onClick={() => onNavigate('verification')}>
                <span>Release Verification Standard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
