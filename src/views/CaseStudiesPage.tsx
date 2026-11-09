import { navigateTo, openIntakeModal } from '../utils/navigation';
import React, { useState } from 'react';
import {
  FileText,
  Terminal,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  ExternalLink,
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface CaseStudiesPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const CaseStudiesPage: React.FC<CaseStudiesPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  const handleFilterChange = (catId: string) => {
    setIsFiltering(true);
    setFilter(catId);
    setTimeout(() => setIsFiltering(false), 120);
  };

  const categories = [
    { id: 'all', label: 'All Work' },
    { id: 'financial', label: 'Financial Systems' },
    { id: 'software', label: 'Business Software' },
    { id: 'websites', label: 'Websites' },
    { id: 'automation', label: 'Automation' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <>
      <section className="section-full theme-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 0 50px' }}>
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Work & Evidence</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">PUBLISHED EVIDENCE · DEMONSTRATIONS & ARCHITECTURE</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', marginBottom: '20px' }}>
              Evidence before claims.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch' }}>
              We publish work when the operational context can be explained honestly and the outcomes independently verified. Client material is shared only with explicit contractual permission.
            </p>
          </div>

          {/* Work Discovery Filter Bar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '32px' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`button button-small ${filter === cat.id ? 'button-primary' : 'button-quiet'}`}
                onClick={() => handleFilterChange(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Explicit Content Types Section */}
      <section className="section-full theme-navy" style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          {isFiltering ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
            </div>
          ) : (
            <>
              {/* Section 1: Client Case Studies */}
              <div style={{ marginBottom: '56px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="mono-tag" style={{ color: 'var(--accent-blue)' }}>SECTION 1 · CLIENT WORK</span>
                    <h2 style={{ fontSize: '1.6rem', margin: '4px 0 0' }}>Client Case Studies</h2>
                  </div>
                  <span className="badge badge-neutral">Published: 0 (Strict Policy)</span>
                </div>

                <div className="card" style={{ background: 'var(--bg-primary)', border: '1px solid var(--line-strong)', padding: 'clamp(24px, 4vw, 36px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.75fr) minmax(0, 1.25fr)', gap: '28px', alignItems: 'start' }}>
                <div>
                  <span className="badge badge-warn" style={{ marginBottom: '10px' }}>
                    Deliberate Empty State
                  </span>
                  <h3 style={{ fontSize: '1.35rem' }}>First case study publishing after the EFRIS pilot closes.</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Scope and date, not scope and spin.
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-subtle)' }}>
                    Many agencies fabricate client success stories, customer logos, and claims of "10x revenue increase." At EULOK, our policy requires three conditions before publishing client work:
                  </p>
                  <ol style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 16px' }}>
                    <li style={{ marginBottom: '4px' }}>The project has achieved final verified acceptance in production.</li>
                    <li style={{ marginBottom: '4px' }}>The client has reviewed and explicitly approved the technical case study.</li>
                    <li>Any stated metrics are backed by verifiable baseline and outcome records.</li>
                  </ol>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Until those requirements are met, we provide verified technical demonstrations of our software instead.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Demonstrations */}
          <div style={{ marginBottom: '56px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>SECTION 2 · VERIFIED ARTIFACTS</span>
                <h2 style={{ fontSize: '1.6rem', margin: '4px 0 0' }}>Technical Demonstrations</h2>
              </div>
              <span className="badge badge-pass">Interactive Software Available</span>
            </div>

            <div className="card" style={{ background: 'var(--bg-primary)', border: '1px solid var(--line-strong)', padding: 'clamp(24px, 4vw, 36px)' }}>
              <span className="badge badge-neutral" style={{ color: 'var(--electric-blue)', marginBottom: '12px' }}>
                FINANCIAL SYSTEMS / PRODUCT 1
              </span>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>
                Mobile-Money Reconciliation Architecture
              </h3>
              <p className="lead" style={{ fontSize: '1.05rem', color: 'var(--text-subtle)', marginBottom: '20px' }}>
                A deterministic, zero-LLM system for comparing incoming payment collections against authoritative financial obligations.
              </p>

              <div className="grid-2" style={{ marginBottom: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '0.86rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>The Operational Problem:</h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-subtle)' }}>
                    Payment records arrive through multiple mobile-money gateways (MTN MoMo, Airtel Money) and bank exports with different references, delayed timestamps, and occasional duplicate webhooks. Manual spreadsheet reconciliation causes delayed receipting, unallocated deposits, and revenue leakage.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.86rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>The Engineering Approach:</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-subtle)', fontSize: '0.92rem' }}>
                    <li>Arbitrary-precision Decimal math (eliminating float rounding errors)</li>
                    <li>Strict deterministic matching rules (R1 exact match, R2 partial allocations)</li>
                    <li>Duplicate-event detection and conflicting identifier flags</li>
                    <li>Refunds (R7) and reversals (R8) isolated from automated matching</li>
                    <li>Explicit human approval queue for proposed matches</li>
                  </ul>
                </div>
              </div>

              {/* Synthetic Data Demonstration Table */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.86rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Illustrative Reconciliation Outcomes (Synthetic Fixture Data):
                </h4>
                <div className="table-wrapper" style={{ margin: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Source Record</th>
                        <th>Reference</th>
                        <th>Amount (UGX)</th>
                        <th>Deterministic Outcome</th>
                        <th>Operational Next Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">MTN MoMo (Web)</th>
                        <td><code>OBL-001</code></td>
                        <td>500,000</td>
                        <td><span className="badge badge-exact">Exact Match (R1)</span></td>
                        <td>Auto-reconcile &amp; close obligation</td>
                      </tr>
                      <tr>
                        <th scope="row">MTN MoMo (Agent)</th>
                        <td><code>OBL-002</code></td>
                        <td>300,000</td>
                        <td><span className="badge badge-exact">Exact Match (R1)</span></td>
                        <td>Auto-reconcile &amp; generate receipt</td>
                      </tr>
                      <tr>
                        <th scope="row">Airtel Money</th>
                        <td><code>OBL-003</code></td>
                        <td>250,000</td>
                        <td><span className="badge badge-partial">Partial Match (R2)</span></td>
                        <td>Apply 250k; balance 100k remains due</td>
                      </tr>
                      <tr>
                        <th scope="row">Airtel Money (2nd)</th>
                        <td><code>OBL-003</code></td>
                        <td>100,000</td>
                        <td><span className="badge badge-partial">Partial Match (R2)</span></td>
                        <td>Apply 100k; obligation fully satisfied</td>
                      </tr>
                      <tr>
                        <th scope="row">MTN MoMo (Retry)</th>
                        <td><code>OBL-002</code></td>
                        <td>300,000</td>
                        <td><span className="badge badge-duplicate">Duplicate Suspect (R5)</span></td>
                        <td>Skip ledger update; retain for audit</td>
                      </tr>
                      <tr>
                        <th scope="row">MTN MoMo (Refund)</th>
                        <td><code>OBL-001</code></td>
                        <td>50,000</td>
                        <td><span className="badge badge-refund">Refund Isolated (R7)</span></td>
                        <td>Escalate to human review; never auto-apply</td>
                      </tr>
                      <tr>
                        <th scope="row">Airtel Money (Reversal)</th>
                        <td><code>OBL-003</code></td>
                        <td>250,000</td>
                        <td><span className="badge badge-refund">Reversal Isolated (R8)</span></td>
                        <td>Freeze corresponding ledger entry</td>
                      </tr>
                      <tr>
                        <th scope="row">External Merchant</th>
                        <td><code>UNKNOWN</code></td>
                        <td>80,000</td>
                        <td><span className="badge badge-unmatched">Unmatched</span></td>
                        <td>Route to investigation queue</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className="button button-primary"
                  onClick={() => onNavigate('ops-suite')}
                >
                  <Terminal size={16} />
                  <span>Launch Live Interactive Reconciliation Workspace</span>
                </button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No real customer PII or credentials used. Synthetic demonstration records only.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Articles */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="mono-tag" style={{ color: 'var(--warm-white)' }}>SECTION 3 · ARCHITECTURE PAPERS</span>
                <h2 style={{ fontSize: '1.6rem', margin: '4px 0 0' }}>Technical Articles &amp; Supply Lines</h2>
              </div>
              <button
                className="text-link"
                onClick={() => onNavigate('insights')}
              >
                View all Engineering Notes →
              </button>
            </div>

            <div className="grid-3">
              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>NOTE 01</span>
                <h3>Deterministic Calculations</h3>
                <p>Why floating-point arithmetic causes cumulative ledger drift, and why pure integer minor units are necessary for finance.</p>
                <button className="text-link" onClick={() => onNavigate('insights')} style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  Read article →
                </button>
              </div>

              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>NOTE 02</span>
                <h3>Idempotency in Mobile Money</h3>
                <p>Handling webhook retries, network jitter, and distributed locks to prevent double credits in cellular environments.</p>
                <button className="text-link" onClick={() => onNavigate('insights')} style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  Read article →
                </button>
              </div>

              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>NOTE 03</span>
                <h3>Software Rescue Triage</h3>
                <p>How to audit, isolate risks, and stabilize an abandoned or unstable codebase without defaulting to an expensive total rewrite.</p>
                <button className="text-link" onClick={() => onNavigate('insights')} style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  Read article →
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};
