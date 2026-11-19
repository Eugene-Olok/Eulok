import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';
import { EditorialVisual } from '../components/EditorialVisual';

interface PerformanceBuildsPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const PerformanceBuildsPage: React.FC<PerformanceBuildsPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  return (
    <>
      {/* Hero */}
      <section className="section-full theme-dark band-hero">
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <button type="button" onClick={() => onNavigate('services')}>Services</button>
            <span className="separator">/</span>
            <span aria-current="page">Performance builds</span>
          </nav>

          <div className="split-feature-grid" style={{ gap: 'clamp(28px, 4vw, 48px)' }}>
            <div>
              <span className="eyebrow">Websites · Business systems · Low-Bandwidth Speed</span>
              <h1 style={{ fontSize: 'clamp(2.3rem, 5vw, 4rem)', marginBottom: '20px' }}>
                Built for Ugandan mobile grids and real operations.
              </h1>
              <p className="lead" style={{ maxWidth: '60ch', marginBottom: 0 }}>
                Fast, accessible websites and custom business portals engineered to load reliably over 3G/4G networks and remain clean for your team to own.
              </p>
            </div>

            <EditorialVisual
              webpSrc="/images/studio-craft.webp"
              fallbackSrc="/images/studio-craft.jpg"
              alt="Clean precision hardware reflecting performance-focused software engineering"
              aspectRatio="4/3"
              priority
              kicker="PERFORMANCE BUILDS"
              caption="Pre-rendered pages and clean operational portals verified down to 320px viewports."
            />
          </div>
        </div>
      </section>

      {/* 01 Digital Presence */}
      <section className="section-full theme-navy band-section" id="business-websites">
        <div className="container-expansive">
          <div className="governance-grid">
            <div>
              <span className="eyebrow">01 / Digital presence</span>
              <h2>Business websites that make the next step clear.</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '18px' }}>
                We engineer mobile-first websites that explain what you offer, load rapidly on East African cellular links, and guide qualified visitors smoothly into WhatsApp or project inquiry channels.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                Page structure, content ownership, acceptance criteria, and full repository handover are agreed cleanly before engineering begins.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.08rem', margin: '0 0 12px' }}>Website Delivery Scope</h3>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
                <li>Responsive company, service, and institutional sites verified from 320px to 1440px.</li>
                <li>Semantic markup, canonical SEO metadata, and social share cards.</li>
                <li>Compressed visual assets without heavy third-party script bloat.</li>
                <li>Accessible keyboard navigation, clear focus states, and readable contrast.</li>
                <li>Direct WhatsApp, email, and structured inquiry workflows.</li>
                <li>Deployment runbooks and maintenance documentation.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Business Operations */}
      <section className="section-full theme-dark band-section" id="custom-systems">
        <div className="container-expansive">
          <div className="governance-grid">
            <div>
              <span className="eyebrow">02 / Business operations</span>
              <h2>Custom systems where spreadsheets break down.</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '18px' }}>
                When manual approvals, shared spreadsheets, and fragmented files create stock drift or audit gaps, a focused internal portal replaces guesswork with structured roles and clean records.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                Regulated financial rails, multi-tenant platforms, and offline-first field sync undergo explicit feasibility design prior to commitment.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.08rem', margin: '0 0 12px' }}>Custom Portal Capabilities</h3>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
                <li>Role-based portals for schools, SACCOs, clinics, and distribution teams.</li>
                <li>Validated data entry with auditable change histories.</li>
                <li>Inventory, member billing, dispatch, and reporting workflows.</li>
                <li>Controlled migration from legacy Excel or CSV ledgers with backups.</li>
                <li>Structured integration adapters into local payment and tax endpoints.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 03 Software Rescue & Care */}
      <section className="section-full theme-navy band-section" id="rescue-and-care">
        <div className="container-expansive">
          <div className="governance-grid">
            <div>
              <span className="eyebrow">03 / Software rescue</span>
              <h2>Stabilize what exists before deciding to replace it.</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '20px' }}>
                For stalled or brittle production systems, we inspect the codebase and infrastructure, reproduce active failures, protect data integrity, and map prioritized fixes before recommending any rebuild.
              </p>
              <div className="callout-panel">
                <h3 id="care" style={{ fontSize: '1.08rem', marginBottom: '8px' }}>Ongoing Engineering Care</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, fontSize: '0.9rem' }}>
                  Post-launch maintenance operates under an explicit scope covering dependency updates, backup checks, security patches, and agreed response windows.
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', alignSelf: 'start' }}>
              <h3 style={{ fontSize: '1.08rem', margin: '0 0 12px' }}>Stabilization Deliverables</h3>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
                <li>Architecture, dependency, and security hygiene review.</li>
                <li>Failure reproduction paired with automated regression safeguards.</li>
                <li>Database backup verification and clean staging environment setup.</li>
                <li>Repeatable release and rollback runbooks for your operations team.</li>
                <li>Incremental hardening under clear milestone acceptance.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Acceptance & Deliverables */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div className="governance-grid" style={{ marginBottom: '48px' }}>
            <div>
              <span className="eyebrow">Engineering Acceptance</span>
              <h2>Performance is measured, not claimed.</h2>
            </div>
            <div>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, marginBottom: '12px' }}>
                Every engagement sets verifiable payload budgets and WCAG 2.2 AA accessibility targets tested across actual mobile and desktop screen sizes before sign-off.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                Clients receive full code ownership alongside clear operational runbooks and honest disclosure of system constraints.
              </p>
            </div>
          </div>

          <div className="grid-3">
            <article className="card">
              <span className="card-number">01 / CODE</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Working Implementation</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Production source code built to agreed architectural boundaries and acceptance criteria.
              </p>
            </article>
            <article className="card">
              <span className="card-number">02 / EVIDENCE</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Verification Evidence</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Automated test outcomes, viewport reflow checks, and documented boundary behaviors.
              </p>
            </article>
            <article className="card">
              <span className="card-number">03 / OWNERSHIP</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Full Handover</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Deployment scripts, access rotation checklists, and operating documentation with zero vendor lock-in.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Next Step */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div className="cta-banner-grid">
            <div>
              <span className="eyebrow">Next step</span>
              <h2>Choose the smallest useful starting point.</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7, margin: 0 }}>
                Tell us whether you need a business site, operational portal, or system rescue. We clarify constraints before recommending a scope.
              </p>
            </div>
            <div>
              <button
                type="button"
                className="button button-primary"
                onClick={onOpenIntakeModal}
              >
                Discuss a build or rescue <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
