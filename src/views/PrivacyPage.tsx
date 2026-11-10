import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';
import { Shield, Lock, FileText, ArrowRight, Eye, CheckCircle2, Scale, Building2, Globe, Clock, ShieldAlert } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <nav className="container-expansive breadcrumb-nav" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('home')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Privacy Policy & PDPO Compliance</span>
      </nav>

      {/* Hero Header */}
      <header className="page-hero-header">
        <div className="container-expansive">
          <div className="live-status-pill" style={{ marginBottom: '16px' }}>
            <span className="live-status-dot"></span>
            <span>Uganda DPPA 2019 & International Privacy Architecture</span>
          </div>
          <h1 className="hero-heading" style={{ maxWidth: '24ch' }}>
            A rigorous, auditable account of website and client data.
          </h1>
          <p className="hero-subheading" style={{ maxWidth: '68ch' }}>
            This policy describes how personal and technical data is collected, processed, retained, and safeguarded under Uganda’s Data Protection and Privacy Act, 2019 and relevant international data governance standards.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <section className="section-padded">
        <div className="container-expansive">
          <div style={{ maxWidth: '78ch' }}>
            {/* Section 1: Data Controller & Registration */}
            <span className="eyebrow">01 / Data Controller Identity</span>
            <h2>Who is responsible for your information?</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              <strong>EULOK</strong> is an independent software engineering practice based in Kampala, Uganda, operating remotely worldwide. Under the <em>Data Protection and Privacy Act, 2019</em>, EULOK acts as the <strong>Data Controller</strong> for communications received via our website, email, and WhatsApp scoping channels.
            </p>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '12px', padding: '20px 24px', marginBottom: '36px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--accent-blue)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Operating Jurisdiction</span>
                  <strong>Kampala, Uganda (East Africa Time, UTC+3)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--accent-blue)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Regulatory Oversight</span>
                  <strong>Personal Data Protection Office (PDPO) Uganda</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--accent-blue)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Designated Privacy Office</span>
                  <code>privacy@eulok.com</code>
                </div>
              </div>
            </div>

            {/* Section 2: Data Minimization */}
            <span className="eyebrow">02 / Minimal Collection Discipline</span>
            <h2>What information do we process?</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              We enforce strict zero-bloat data minimization. We only collect information strictly required to evaluate technical feasibility, formulate delivery proposals, and maintain security:
            </p>
            <div style={{ display: 'grid', gap: '16px', marginBottom: '36px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--warm-white)' }}>Project Scoping & Intake Records</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  System classification, budget planning range, technical problem statements, constraints, and client contact coordinates (business email or WhatsApp telephone number).
                </p>
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--warm-white)' }}>Hosting & Network Telemetry</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  Ephemeral HTTP request metadata (IP address, user-agent, requested route) processed at the Cloudflare edge solely for volumetric DDoS protection and rate limiting. No tracking cookies or advertising pixels.
                </p>
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--warm-white)' }}>Zero Unredacted Credentials Policy</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  Inquiries and initial discussions must never transmit live API secrets, bank credentials, private cryptographic keys, or unredacted financial transaction datasets.
                </p>
              </div>
            </div>

            {/* Section 3: Lawful Basis under Uganda DPPA 2019 */}
            <span className="eyebrow">03 / Statutory Grounds</span>
            <h2>Lawful Basis for Processing</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              In accordance with Section 10 of the Uganda Data Protection and Privacy Act, 2019:
            </p>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '36px' }}>
              <li><strong>Pre-Contractual Steps (Section 10(1)(b)):</strong> Processing inquiry data to determine project feasibility, resource availability, and commercial proposals at the data subject’s direct request.</li>
              <li><strong>Legitimate Interests & Security (Section 10(1)(c)):</strong> Securing infrastructure against automated bots, abuse, and brute-force attacks via edge rate-limiting.</li>
              <li><strong>Explicit Consent (Section 10(1)(a)):</strong> Direct engagement through messaging channels (WhatsApp/email) initiated voluntarily by the prospective client.</li>
            </ul>

            {/* Section 4: Statutory Rights Table */}
            <span className="eyebrow">04 / Section 24 Statutory Rights</span>
            <h2>Your Statutory Rights as a Data Subject</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              Under the DPPA 2019 (Sections 24 through 28), you are entitled to enforceable statutory protections:
            </p>
            <div className="table-responsive" style={{ marginBottom: '36px' }}>
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Statutory Right</th>
                    <th>DPPA Section</th>
                    <th>EULOK Implementation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Right to Access</strong></td>
                    <td><code>Section 24</code></td>
                    <td>You may request an export of all personal contact records held in relation to your inquiries within 14 business days.</td>
                  </tr>
                  <tr>
                    <td><strong>Right to Rectification</strong></td>
                    <td><code>Section 25</code></td>
                    <td>Correction of inaccurate contact coordinates or company entity information upon notice.</td>
                  </tr>
                  <tr>
                    <td><strong>Right to Erasure / Deletion</strong></td>
                    <td><code>Section 26</code></td>
                    <td>Permanent deletion of past project inquiries where no contractual or statutory tax retention obligation exists.</td>
                  </tr>
                  <tr>
                    <td><strong>Right to Object</strong></td>
                    <td><code>Section 28</code></td>
                    <td>You may object to any follow-up communication at any time; your contact records will be archived or removed immediately.</td>
                  </tr>
                  <tr>
                    <td><strong>Regulatory Recourse</strong></td>
                    <td><code>Section 31</code></td>
                    <td>Right to lodge a complaint directly with the Personal Data Protection Office (PDPO) at <code>pdpo.go.ug</code>.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 5: Cross-Border Transfers */}
            <span className="eyebrow">05 / Cross-Border Transfers (Section 19)</span>
            <h2>International Transfers & Regional Isolation</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              Section 19 of the Uganda Data Protection and Privacy Act governs cross-border transfers. EULOK hosts static web assets on globally distributed Cloudflare Pages edge nodes to ensure low latency in Uganda, Europe, North America, and across Africa.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '36px' }}>
              No confidential client source code, credentials, or proprietary databases are ever synced to unvetted third-party services or consumer AI platforms.
            </p>

            {/* Section 6: Data Retention Schedule */}
            <span className="eyebrow">06 / Data Retention Schedule</span>
            <h2>Explicit Lifespan for Inquiries</h2>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', marginBottom: '36px' }}>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>
                <li><strong>Uncommitted Inquiries:</strong> Scoping notes without a signed engagement agreement are expunged within <strong>180 calendar days</strong>.</li>
                <li><strong>Signed Engagement Documentation:</strong> Retained for <strong>7 years</strong> in compliance with Uganda Revenue Authority (URA) financial record obligations and commercial dispute limitation periods.</li>
                <li><strong>Edge Security Telemetry:</strong> Cloudflare edge firewall connection logs are overwritten automatically on a rolling <strong>30-day</strong> cycle.</li>
              </ul>
            </div>

            {/* Exercise Rights Box */}
            <div style={{ background: 'var(--deep-navy)', padding: '28px', borderRadius: '12px', border: '1px solid var(--line-strong)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <Shield size={22} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Exercise Data Subject Rights</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '20px' }}>
                Submit formal data access, rectification, or deletion requests directly to our designated privacy officer. Requests are logged and answered without charge within statutory timelines.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href="mailto:privacy@eulok.com?subject=PDPO%20Data%20Subject%20Request%20-%20EULOK"
                  className="button button-primary"
                >
                  <span>Email privacy@eulok.com</span>
                  <ArrowRight size={14} />
                </a>
                <button type="button" className="button button-quiet" onClick={onOpenIntakeModal}>
                  <span>Submit Technical Scoping Inquiry</span>
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '28px' }}>
              Version: 2026.11 · Statutory basis: Uganda DPPA 2019 & Regulations 2021.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
