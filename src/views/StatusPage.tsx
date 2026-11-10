import React, { useState, useEffect } from 'react';
import { navigateTo } from '../utils/navigation';
import {
  CheckCircle2,
  Activity,
  ShieldCheck,
  Server,
  Cpu,
  Clock,
  Wifi,
  ExternalLink,
  RotateCw,
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface StatusPageProps {
  onNavigate?: (page: string) => void;
}

interface SystemComponent {
  name: string;
  classification: string;
  architecture: string;
  topology: string;
}

export const StatusPage: React.FC<StatusPageProps> = ({ onNavigate = navigateTo }) => {
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [probeSuccess, setProbeSuccess] = useState<boolean>(true);

  const runLatencyProbe = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      // Ping the lightweight edge asset to measure real live round-trip latency
      const res = await fetch('/robots.txt', { cache: 'no-store', method: 'HEAD' });
      const duration = Math.round(performance.now() - start);
      setLatencyMs(duration);
      setProbeSuccess(res.ok);
    } catch {
      setLatencyMs(null);
      setProbeSuccess(false);
    } finally {
      setIsPinging(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    runLatencyProbe();
  }, []);

  const systems: SystemComponent[] = [
    {
      name: 'Deterministic Reconciliation Core',
      classification: 'Pure Mathematical Engine',
      architecture: 'Fixed-point integer cents, 8 deterministic rules, zero floating-point drift',
      topology: 'Stateless In-Memory Core',
    },
    {
      name: 'Intake Gateway & Sanitization',
      classification: 'Edge API Endpoint (/api/intake)',
      architecture: 'Honeypot bot suppression, angle-bracket sanitization, reference ID generation',
      topology: 'Cloudflare Pages Functions (V8)',
    },
    {
      name: 'Global Pre-Rendered CDN',
      classification: 'Global Anycast Edge Network',
      architecture: 'Pre-rendered static HTML/CSS, strict CSP headers, sub-100ms first byte',
      topology: 'Cloudflare Pages (300+ Cities)',
    },
    {
      name: 'Uganda DPPA 2019 Regulatory Guard',
      classification: 'Statutory Data Protection',
      architecture: 'Section 24 client rights, explicit retention schedules, zero tracking cookies',
      topology: 'Regulatory Compliance Layer',
    },
    {
      name: 'Deterministic Test Gates',
      classification: 'Automated CI/CD Quality Gates',
      architecture: 'Hermetic unit tests, SEO invariants, and reconciliation test vectors',
      topology: 'Node.js Test Runner (Zero Cloud Mock)',
    },
    {
      name: 'RFC 9116 Security Disclosure',
      classification: 'Vulnerability Disclosure Protocol',
      architecture: 'Published at /.well-known/security.txt with PGP security contact channels',
      topology: 'RFC 9116 Compliant Endpoint',
    },
  ];

  const latencyLabel =
    latencyMs === null
      ? 'Connecting...'
      : latencyMs < 80
      ? 'Low-Latency Edge (< 80ms)'
      : latencyMs < 250
      ? 'Regional Edge (< 250ms)'
      : 'High Latency / Cellular Route (250ms+)';

  return (
    <div className="page-wrapper">
      {/* Breadcrumb Navigation */}
      <nav className="container-expansive breadcrumb-nav" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('home')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Edge Architecture & Live Telemetry</span>
      </nav>

      {/* Hero Header */}
      <header className="page-hero-header">
        <div className="container-expansive">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="live-status-pill" style={{ margin: 0 }}>
              <span className={`live-status-dot ${probeSuccess ? '' : 'status-dot-warn'}`} />
              {probeSuccess ? 'Edge Origin Accessible' : 'Probe Reconnecting'}
            </span>
          </div>

          <h1 className="hero-heading" style={{ maxWidth: '26ch' }}>
            Edge Architecture & Live Telemetry
          </h1>
          <p className="hero-subheading" style={{ maxWidth: '64ch' }}>
            Real-time edge network telemetry, infrastructure topology, and disaster recovery standards for the EULOK web architecture. Measured directly from your client browser—no fabricated metrics or marketing estimates.
          </p>
        </div>
      </header>

      {/* Edge Latency Probe Bar */}
      <section className="section-padded">
        <div className="container-expansive">
          <div
            className="card"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--line-strong)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              padding: '24px 30px',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <Wifi size={22} color="var(--electric-blue)" />
              </div>

              <div>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)', display: 'block', marginBottom: '2px' }}>
                  MEASURED CLIENT-TO-EDGE ROUNDTRIP
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--warm-white)' }}>
                  {latencyMs !== null ? (
                    <>
                      {latencyMs} ms
                      <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '10px' }}>
                        ({latencyLabel})
                      </span>
                    </>
                  ) : (
                    <LoadingSkeleton variant="text" width="180px" height="24px" lines={1} style={{ display: 'inline-block' }} />
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Sampled at {lastChecked || 'page load'}
              </span>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={runLatencyProbe}
                disabled={isPinging}
              >
                <RotateCw size={14} className={isPinging ? 'spin' : ''} />
                <span>Re-sample</span>
              </button>
            </div>
          </div>

          {/* System Components Architecture Table */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Classification</th>
                  <th>Deployment Topology</th>
                  <th>Architectural Guarantee</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((s) => (
                  <tr key={s.name}>
                    <td>
                      <strong style={{ color: 'var(--warm-white)' }}>{s.name}</strong>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>{s.classification}</td>
                    <td>
                      <span className="mono-tag" style={{ fontSize: '0.74rem', padding: '2px 6px' }}>
                        {s.topology}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-subtle)', fontSize: '0.84rem' }}>{s.architecture}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Production Architecture Specs */}
      <section className="section-padded section-alt">
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '28px' }}>
            <span className="eyebrow">Production Topology</span>
            <h2>Zero-Maintenance Static Infrastructure</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              EULOK enforces an absolute zero-maintenance hosting policy. All production nodes operate on pre-rendered edge infrastructure without vulnerable server daemons or recurring hosting fees.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '8px', display: 'inline-block' }}>
                BUILD COMPILER
              </span>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Astro 5 Static Compilation</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                100% pre-rendered HTML/CSS. Zero client-side JavaScript execution required to read content, preserving bandwidth on low-connectivity networks.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: 'var(--electric-blue)', marginBottom: '8px', display: 'inline-block' }}>
                EDGE HOSTING
              </span>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Global Anycast Distribution</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Distributed on 300+ edge locations worldwide. Automatic TLS 1.3 encryption, DDoS mitigation, and HTTP/3 support with zero single points of failure.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '8px', display: 'inline-block' }}>
                SERVERLESS INTAKE
              </span>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Isolated Edge V8 Functions</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Edge V8 isolates for `/api/intake` processing with sub-5ms cold starts, zero public database endpoints, and deterministic honeypot bot filtering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Incident & Recovery Architecture */}
      <section className="section-padded">
        <div className="container-expansive">
          <div className="grid-2">
            <div>
              <span className="eyebrow">Reliability Governance</span>
              <h2>Incident Response & Recovery Protocol</h2>
              <p style={{ color: 'var(--text-subtle)', lineHeight: 1.7 }}>
                We believe in complete architectural transparency. Rather than displaying unverifiable uptime percentages, we govern releases through deterministic recovery controls:
              </p>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '16px' }}>
                <li><strong>Atomic Rollback:</strong> Releases are keyed to immutable git commits; rollbacks complete via instant DNS/edge pointer switch.</li>
                <li><strong>Zero Ingestion Database Exposure:</strong> Inquiries are processed via ephemeral V8 isolates without vulnerable SQL or NoSQL endpoints exposed to web scrapers.</li>
                <li><strong>Statutory Retention Limits:</strong> Prospective client inquiry records expire automatically to prevent data accumulation.</li>
              </ul>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--line-strong)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Operational Runbooks</h3>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 20px' }}>
                <li><strong>Disaster Recovery:</strong> Multi-region static fallback with automated roll-forward and roll-backward.</li>
                <li><strong>Secrets Isolation:</strong> Zero credentials in client-side code; verified with Gitleaks static analysis.</li>
                <li><strong>Vulnerability Reporting:</strong> Governed by RFC 9116 via <a href="/security" style={{ color: 'var(--electric-blue)' }}>Security Policy</a>.</li>
              </ul>

              <button
                type="button"
                className="button button-quiet"
                onClick={() => onNavigate('verification')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Read Release Verification Methodology</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
