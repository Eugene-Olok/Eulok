import { navigateTo } from '../utils/navigation';
import { siteConfig, resolveSiteUrl } from '../siteConfig';
import React, { useState, useEffect } from 'react';
import { Key, ArrowRight, Cpu, Database, ShieldCheck } from 'lucide-react';

interface SecurityPageProps {
  onNavigate?: (page: string) => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({
  onNavigate = navigateTo,
}) => {
  const [securityTxtUrl, setSecurityTxtUrl] = useState<string>(() =>
    resolveSiteUrl('/.well-known/security.txt', siteConfig.defaultBaseUrl)
  );

  useEffect(() => {
    setSecurityTxtUrl(resolveSiteUrl('/.well-known/security.txt'));
  }, []);

  return (
    <>
      {/* Hero Header */}
      <section className="section-full theme-dark band-hero">
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Security &amp; RFC 9116 Policy</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">RFC 9116 Security Disclosure · Data Protection Architecture</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)', marginBottom: '20px', maxWidth: '24ch' }}>
              Security is an architectural discipline, not a compliance badge.
            </h1>
            <p className="lead" style={{ maxWidth: '68ch', marginBottom: 0 }}>
              Every client engagement follows fail-closed security boundaries: strict isolation of credentials and environments, deterministic financial state transitions, and transparent vulnerability disclosure.
            </p>
          </div>
        </div>
      </section>

      {/* Core Controls */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ maxWidth: '760px', marginBottom: '32px' }}>
            <span className="eyebrow">Operational Controls</span>
            <h2>How client systems and records remain protected</h2>
          </div>

          <div className="grid-3">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Key size={20} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Credential Isolation</h3>
              </div>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65, margin: 0 }}>
                <li>API keys, mobile-money secrets, and signing certificates are never committed to source control.</li>
                <li>Production keys undergo documented rotation at milestone handovers.</li>
                <li>Each client system operates inside isolated project credentials and networks.</li>
                <li>All endpoints fail closed when required environment secrets are absent.</li>
              </ul>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Cpu size={20} color="var(--accent-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Data &amp; Code Isolation</h3>
              </div>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65, margin: 0 }}>
                <li>Client source code and proprietary domain rules stay isolated inside dedicated repositories.</li>
                <li>Live ledgers, customer PII, and URA EFRIS tax tokens never leave authorized client environments.</li>
                <li>Access permissions are enforced explicitly at server boundaries before data reads or writes.</li>
                <li>Irreversible financial mutations preserve human operator review gates.</li>
              </ul>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Database size={20} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Deterministic State Guards</h3>
              </div>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65, margin: 0 }}>
                <li>Payment webhooks validate constant-time HMAC signatures before parsing payloads.</li>
                <li>Atomic idempotency keys reject duplicate carrier retries without double-crediting.</li>
                <li>Reconciliation totals run on exact integer minor units rather than approximate floats.</li>
                <li>Audit trails preserve immutable historical entries rather than overwriting state.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* RFC 9116 Vulnerability Disclosure & Direct Security Contact */}
      <section className="section-full theme-dark band-section">
        <div className="container-expansive">
          <div className="governance-grid">
            <div>
              <span className="eyebrow">RFC 9116 Policy</span>
              <h2>Vulnerability Disclosure Program</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '18px' }}>
                EULOK maintains a public vulnerability disclosure specification aligned with IETF RFC 9116. Machine-readable security contact details are published at:
              </p>
              <div className="surface-panel" style={{ borderRadius: '8px', padding: '14px 18px', marginBottom: '24px' }}>
                <code>{securityTxtUrl}</code>
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: '12px' }}>Coordinated Disclosure Guidelines</h3>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
                <li>Send reports to <code>{siteConfig.securityEmail}</code> with clear reproduction steps and affected URLs.</li>
                <li>Allow at least 30 calendar days for verified remediation prior to public disclosure.</li>
                <li>Never access, modify, or exfiltrate user data or disrupt availability through volumetric testing.</li>
                <li>Valid reports are acknowledged within <strong>48 hours</strong> with status updates until closure.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: 'clamp(24px, 4vw, 34px)', borderColor: 'var(--line-strong)', alignSelf: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <ShieldCheck size={22} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Security Inquiries &amp; Reporting</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.65, marginBottom: '22px' }}>
                To report a suspected vulnerability or request security documentation during vendor due diligence, contact the engineering security desk directly.
              </p>
              <a href={`mailto:${siteConfig.securityEmail}`} className="button button-primary">
                <span>Contact {siteConfig.securityEmail}</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
