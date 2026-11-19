import { navigateTo } from '../utils/navigation';
import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate?: (page: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({
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
            <span aria-current="page">Privacy Notice &amp; DPPA Compliance</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">Uganda DPPA 2019 · Statutory Privacy Governance</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)', marginBottom: '20px', maxWidth: '24ch' }}>
              A clear, auditable account of website and inquiry data.
            </h1>
            <p className="lead" style={{ maxWidth: '68ch', marginBottom: 0 }}>
              This notice describes how inquiry and operational contact data is processed, safeguarded, and retained under Uganda’s Data Protection and Privacy Act, 2019 across our East African engineering practice.
            </p>
          </div>
        </div>
      </section>

      {/* Sections 1 & 2: Governance Grid */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div className="governance-grid">
            {/* Section 1: Data Controller Identity */}
            <div>
              <span className="eyebrow">01 / Data Controller Identity</span>
              <h2>Who is responsible for your information?</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                <strong>EULOK</strong> is an independent software engineering practice based in Kampala, Uganda, serving organizations across Uganda and the East African Community. Under the <em>Data Protection and Privacy Act, 2019</em>, EULOK acts as the <strong>Data Controller</strong> for communications submitted through our website, email, and WhatsApp channels.
              </p>

              <div className="card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.92rem' }}>
                  <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                    <span style={{ color: 'var(--accent-blue)', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                      Operating Jurisdiction
                    </span>
                    <strong>Kampala, Uganda (East Africa Time · UTC+3)</strong>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                    <span style={{ color: 'var(--accent-blue)', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                      Regulatory Oversight
                    </span>
                    <strong>Personal Data Protection Office (PDPO) Uganda</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--accent-blue)', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                      Designated Privacy Contact
                    </span>
                    <code>privacy@eulok.com</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Minimal Collection Discipline */}
            <div>
              <span className="eyebrow">02 / Minimal Collection Discipline</span>
              <h2>What information do we process?</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                We collect only the information strictly necessary to evaluate technical feasibility, communicate about your inquiry, and protect service reliability.
              </p>

              <div style={{ display: 'grid', gap: '14px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--warm-white)' }}>
                    Project Scoping &amp; Inquiry Records
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                    System classification, target timeline, technical problem statements, and client contact coordinates (business email or WhatsApp telephone number).
                  </p>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--warm-white)' }}>
                    Network Protection Logs
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                    Ephemeral request metadata processed at our edge network solely for DDoS mitigation and abuse rate-limiting. No third-party ad trackers or behavioral cookies are used.
                  </p>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--warm-white)' }}>
                    Zero Unredacted Credentials Policy
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                    Initial inquiries must never transmit live API secrets, banking passwords, private cryptographic keys, or unredacted customer financial ledgers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections 3 & 4: Lawful Basis & Statutory Rights */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div style={{ marginBottom: '40px' }}>
            <span className="eyebrow">03 / Statutory Grounds</span>
            <h2>Lawful Basis for Processing (DPPA Section 10)</h2>
            <div className="grid-3" style={{ marginTop: '20px' }}>
              <div className="card" style={{ padding: '22px' }}>
                <span className="card-number">SECTION 10(1)(b)</span>
                <h3 style={{ fontSize: '1.08rem', marginBottom: '8px' }}>Pre-Contractual Steps</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                  Evaluating project feasibility, technical risks, and scope boundaries at the prospective client’s direct request.
                </p>
              </div>
              <div className="card" style={{ padding: '22px' }}>
                <span className="card-number">SECTION 10(1)(c)</span>
                <h3 style={{ fontSize: '1.08rem', marginBottom: '8px' }}>Security &amp; Resilience</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                  Safeguarding public communication channels against automated spam, bots, and volumetric abuse.
                </p>
              </div>
              <div className="card" style={{ padding: '22px' }}>
                <span className="card-number">SECTION 10(1)(a)</span>
                <h3 style={{ fontSize: '1.08rem', marginBottom: '8px' }}>Voluntary Initiation</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                  Direct correspondence initiated voluntarily via our email or WhatsApp messaging channels.
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="eyebrow">04 / Section 24–31 Statutory Rights</span>
            <h2>Your Enforceable Rights as a Data Subject</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '68ch', marginBottom: '20px' }}>
              Under Sections 24 through 31 of Uganda’s Data Protection and Privacy Act, 2019, you retain direct control over any personal contact records held in connection with your inquiries:
            </p>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Statutory Right</th>
                    <th>DPPA Section</th>
                    <th>Implementation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Right to Access</strong></td>
                    <td><code>Section 24</code></td>
                    <td>Request a structured export of personal contact records held from prior inquiries within 14 business days.</td>
                  </tr>
                  <tr>
                    <td><strong>Right to Rectification</strong></td>
                    <td><code>Section 25</code></td>
                    <td>Prompt correction of inaccurate organization details or contact coordinates upon written notice.</td>
                  </tr>
                  <tr>
                    <td><strong>Right to Erasure / Deletion</strong></td>
                    <td><code>Section 26</code></td>
                    <td>Permanent deletion of past inquiry records where no contractual or statutory tax retention duty applies.</td>
                  </tr>
                  <tr>
                    <td><strong>Right to Object</strong></td>
                    <td><code>Section 28</code></td>
                    <td>Object to follow-up correspondence at any time; contact records are archived or erased immediately.</td>
                  </tr>
                  <tr>
                    <td><strong>Regulatory Recourse</strong></td>
                    <td><code>Section 31</code></td>
                    <td>Lodge a formal complaint directly with Uganda’s Personal Data Protection Office at <code>pdpo.go.ug</code>.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Sections 5, 6 & Sole Contact CTA */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div className="governance-grid">
            <div>
              <span className="eyebrow">05 / Cross-Border &amp; Retention</span>
              <h2>Regional Isolation &amp; Explicit Lifespans</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '18px' }}>
                Under Section 19 of the DPPA, regional edge delivery nodes cache public web pages close to visitors across Kampala and East Africa for sub-second access, while proprietary client repositories and databases remain strictly isolated inside authorized client environments.
              </p>

              <div className="card" style={{ padding: '22px' }}>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 12px' }}>Retention Schedule</h3>
                <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0, fontSize: '0.9rem' }}>
                  <li><strong>Uncommitted Inquiries:</strong> Scoping notes without a signed agreement are expunged within <strong>180 calendar days</strong>.</li>
                  <li><strong>Signed Contracts &amp; Tax Records:</strong> Retained for <strong>7 years</strong> to satisfy Uganda Revenue Authority (URA) statutory record obligations.</li>
                  <li><strong>Edge Protection Logs:</strong> Rolling <strong>30-day</strong> overwrite window.</li>
                </ul>
              </div>
            </div>

            <div className="card" style={{ padding: 'clamp(24px, 4vw, 34px)', borderColor: 'var(--line-strong)', alignSelf: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Shield size={22} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--warm-white)' }}>
                  Exercise Data Subject Rights
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.65, marginBottom: '22px' }}>
                Submit formal data access, rectification, or deletion requests directly to our designated privacy officer. Verified requests are processed free of charge within statutory timelines.
              </p>
              <a
                href="mailto:privacy@eulok.com?subject=PDPO%20Data%20Subject%20Request%20-%20EULOK"
                className="button button-primary"
              >
                <span>Email privacy@eulok.com</span>
                <ArrowRight size={14} />
              </a>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '20px', marginBottom: 0 }}>
                Version 2026.11 · Statutory basis: Uganda DPPA 2019 &amp; Regulations 2021.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
