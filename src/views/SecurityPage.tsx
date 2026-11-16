import { navigateTo, openIntakeModal } from '../utils/navigation';
import { siteConfig, resolveSiteUrl } from '../siteConfig';
import React, { useState, useEffect } from 'react';
import { Shield, Key, FileCheck, ArrowRight, Lock, CheckCircle2, AlertTriangle, Terminal, Cpu, Database, Eye } from 'lucide-react';

interface SecurityPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  const [securityTxtUrl, setSecurityTxtUrl] = useState<string>(() =>
    resolveSiteUrl('/.well-known/security.txt', siteConfig.defaultBaseUrl)
  );

  useEffect(() => {
    setSecurityTxtUrl(resolveSiteUrl('/.well-known/security.txt'));
  }, []);

  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <nav className="container-expansive breadcrumb-nav" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('home')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Security & RFC 9116 Policy</span>
      </nav>

      {/* Hero Header */}
      <header className="page-hero-header">
        <div className="container-expansive">
          <span className="eyebrow">RFC 9116 Security Disclosure · Vulnerability Policy</span>
          <h1 className="hero-heading" style={{ maxWidth: '24ch' }}>
            Security is an architectural discipline, not a badge.
          </h1>
          <p className="hero-subheading" style={{ maxWidth: '68ch' }}>
            We design systems with fail-closed security boundaries: isolation of client credentials, strict perimeter sanitization, deterministic business logic, and transparent vulnerability reporting.
          </p>
        </div>
      </header>

      {/* Core Controls */}
      <section className="section-padded">
        <div className="container-expansive">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px', marginBottom: '48px' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Key size={20} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Credential Isolation</h3>
              </div>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                <li>API keys, webhook secrets, and certificates are never committed to Git repositories.</li>
                <li>Production credentials undergo documented revocation and key rotation at milestone handovers.</li>
                <li>Client project environments use separate keyspaces and isolated virtual networks.</li>
                <li>Zero hardcoded fallback secrets: all endpoints fail closed if environment variables are missing.</li>
              </ul>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Cpu size={20} color="var(--accent-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>AI Isolation Boundaries</h3>
              </div>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                <li>Client source code and proprietary logic are never routed to free or unapproved consumer AI tools.</li>
                <li>Restricted data (PII, live financial ledgers, banking secrets) is strictly barred from model prompts.</li>
                <li>Probabilistic AI models are never granted authority over financial transactions or access controls.</li>
                <li>Models propose; deterministic systems and human engineers verify.</li>
              </ul>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Database size={20} color="var(--electric-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Deterministic State Machines</h3>
              </div>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                <li>Financial reconciliation uses strict Decimal math to eliminate floating-point rounding hazards.</li>
                <li>Payment webhooks enforce duplicate-key idempotency to prevent duplicate ledger credits.</li>
                <li>Status transitions follow mathematically verifiable state graphs with explicit rejection traps.</li>
                <li>Audit logs are cryptographically fingerprinted with SHA-256 digests.</li>
              </ul>
            </div>
          </div>

          {/* RFC 9116 Policy Specification */}
          <div style={{ maxWidth: '78ch' }}>
            <span className="eyebrow">RFC 9116 Policy</span>
            <h2>Vulnerability Disclosure Program</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              EULOK maintains a transparent, public vulnerability disclosure policy complying with Internet Engineering Task Force (IETF) RFC 9116. Our security contact file is publicly available at:
            </p>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }}>
              <code>{securityTxtUrl}</code>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Guidelines for Security Researchers:</h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              <li>Send reports to <code>{siteConfig.securityEmail}</code> with reproducible technical steps, proof of concept, and affected endpoints.</li>
              <li>Allow a reasonable window (minimum 30 calendar days) before public disclosure to permit mitigation.</li>
              <li>Do not access, modify, or destroy client data. Do not execute volumetric DDoS attacks against production infrastructure.</li>
              <li>We acknowledge valid submissions within <strong>48 hours</strong> and provide regular remediation updates.</li>
            </ul>

            {/* Cloudflare Edge Hardening */}
            <span className="eyebrow">Edge Hardening</span>
            <h2>HTTP Response Headers & Content Security Policy</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              All responses from edge hosting are configured with explicit defense-in-depth HTTP security headers:
            </p>
            <div className="table-responsive" style={{ marginBottom: '36px' }}>
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Security Header</th>
                    <th>Configured Value</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Strict-Transport-Security</code></td>
                    <td><code>max-age=63072000; includeSubDomains; preload</code></td>
                    <td>Enforces HTTPS and eliminates SSL-stripping MITM attacks.</td>
                  </tr>
                  <tr>
                    <td><code>Content-Security-Policy</code></td>
                    <td><code>default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; frame-ancestors 'self'</code></td>
                    <td>Restricts origins, embedding, and form targets while accommodating static Astro pre-rendered bootstrap scripts (see deliberate trade-off below).</td>
                  </tr>
                  <tr>
                    <td><code>X-Content-Type-Options</code></td>
                    <td><code>nosniff</code></td>
                    <td>Prevents MIME-sniffing vulnerabilities.</td>
                  </tr>
                  <tr>
                    <td><code>X-Frame-Options</code></td>
                    <td><code>SAMEORIGIN</code></td>
                    <td>Prevents clickjacking and unauthorized embedding.</td>
                  </tr>
                  <tr>
                    <td><code>Permissions-Policy</code></td>
                    <td><code>camera=(), microphone=(), geolocation=()</code></td>
                    <td>Disables intrusive browser sensor APIs.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Intentional CSP Trade-off Disclosure */}
            <div style={{ background: 'var(--bg-secondary)', padding: '20px 22px', borderRadius: '10px', border: '1px solid var(--line)', marginBottom: '36px' }}>
              <span className="mono-tag" style={{ color: 'var(--status-warn-text)', display: 'inline-block', marginBottom: '6px' }}>
                DELIBERATE ARCHITECTURAL TRADE-OFF
              </span>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.08rem' }}>Why <code>'unsafe-inline'</code> appears on this static site</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '10px' }}>
                On static CDN hosting (Cloudflare Pages without per-request HTML rewriting), Astro emits framework-injected inline bootstrap scripts for island hydration and early theme initialization. Allowing <code>'unsafe-inline'</code> strictly for those pre-rendered artifacts is an intentional, bounded trade-off because this informational site has no authenticated session state, zero user-generated HTML rendering, and zero database backing.
              </p>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                <strong>Production Client Standard:</strong> On dynamic transactional systems (reconciliation portals, EFRIS gateways, admin dashboards), <code>'unsafe-inline'</code> is strictly prohibited and replaced with per-request cryptographic nonces or SHA-256 script hashes enforced at the edge worker or origin server.
              </p>
            </div>

            {/* Report CTA */}
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h3 style={{ margin: 0, marginBottom: '8px' }}>Security Inquiries & Disclosure</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '16px' }}>
                For security audits, incident disclosures, or compliance questionnaires, contact the engineering security coordinator.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href={`mailto:${siteConfig.securityEmail}`} className="button button-primary">
                  <span>Contact {siteConfig.securityEmail}</span>
                  <ArrowRight size={14} />
                </a>
                <button type="button" className="button button-quiet" onClick={() => onNavigate('verification')}>
                  <span>Inspect Release Verification Standard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
