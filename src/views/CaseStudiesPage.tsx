import { navigateTo, openIntakeModal } from '../utils/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Terminal, ArrowRight } from 'lucide-react';
import {
  WORK_CATEGORIES,
  TECHNICAL_DEMONSTRATIONS,
  TECHNICAL_NOTE_REFS,
  type WorkCategoryId,
} from '../data/workEvidence';

interface CaseStudiesPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

function readCategoryFromUrl(): WorkCategoryId {
  if (typeof window === 'undefined') return 'all';
  const param = new URLSearchParams(window.location.search).get('category');
  const match = WORK_CATEGORIES.find((cat) => cat.id === param);
  return match ? match.id : 'all';
}

export const CaseStudiesPage: React.FC<CaseStudiesPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  const [filter, setFilter] = useState<WorkCategoryId>('all');

  useEffect(() => {
    const initial = readCategoryFromUrl();
    if (initial !== 'all') {
      setFilter(initial);
    }
  }, []);

  const handleFilterChange = (catId: WorkCategoryId) => {
    setFilter(catId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (catId === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', catId);
      }
      window.history.replaceState(null, '', url.toString());
    }
  };

  const filteredEvidence = useMemo(() => {
    const activeCategory = WORK_CATEGORIES.find((c) => c.id === filter) || WORK_CATEGORIES[0];
    if (filter === 'all') {
      return {
        demonstrations: TECHNICAL_DEMONSTRATIONS,
        notes: TECHNICAL_NOTE_REFS,
        categoryLabel: activeCategory.label,
      };
    }
    return {
      demonstrations: TECHNICAL_DEMONSTRATIONS.filter(
        (item) => item.category === filter || item.categories.includes(filter)
      ),
      notes: TECHNICAL_NOTE_REFS.filter(
        (note) => note.category === filter || note.categories.includes(filter)
      ),
      categoryLabel: activeCategory.label,
    };
  }, [filter]);

  return (
    <>
      <section className="section-full theme-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 0 50px' }}>
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Work &amp; Evidence</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">WORK &amp; EVIDENCE · EAST AFRICA ARCHITECTURE PROOFS</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', marginBottom: '20px' }}>
              Verified demonstrations and engineering briefs.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch' }}>
              Test live mobile-money reconciliation, URA EFRIS webhook resilience, and static performance architecture directly before discussing a client engagement.
            </p>
          </div>

          {/* Work Discovery Filter Bar */}
          <div
            role="group"
            aria-label="Filter work evidence by category"
            style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '32px' }}
          >
            {WORK_CATEGORIES.map((cat) => {
              const active = filter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={active}
                  className={`button button-small ${active ? 'button-primary' : 'button-quiet'}`}
                  onClick={() => handleFilterChange(cat.id)}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-full theme-navy" style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          {/* Active Filter Banner when narrowed */}
          {filter !== 'all' && (
            <div
              data-testid="work-filter-summary"
              aria-live="polite"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '32px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)' }}>
                Showing <strong style={{ color: 'var(--warm-white)' }}>{filteredEvidence.categoryLabel}</strong>:{' '}
                {filteredEvidence.demonstrations.length} interactive architecture{' '}
                {filteredEvidence.demonstrations.length === 1 ? 'demonstration' : 'demonstrations'} and{' '}
                {filteredEvidence.notes.length} engineering{' '}
                {filteredEvidence.notes.length === 1 ? 'note' : 'notes'}.
              </span>
              <button
                type="button"
                className="text-link"
                style={{ fontSize: '0.84rem' }}
                onClick={() => handleFilterChange('all')}
              >
                Reset to All Work →
              </button>
            </div>
          )}

          {/* Section 1: Technical Demonstrations (Lead with Proofs) */}
          <div style={{ marginBottom: '64px' }} data-testid="work-demonstrations-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>01 · INTERACTIVE DEMONSTRATIONS</span>
                <h2 style={{ fontSize: '1.75rem', margin: '4px 0 0' }}>Working System Proofs</h2>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: 'var(--status-pass-text)',
                }}
              >
                {filteredEvidence.demonstrations.length} Verified {filteredEvidence.demonstrations.length === 1 ? 'System' : 'Systems'}
              </span>
            </div>

            {filteredEvidence.demonstrations.length === 0 ? (
              <div className="card" style={{ padding: '24px' }} data-testid="work-demo-empty">
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  No interactive technical demonstration is mapped to {filteredEvidence.categoryLabel} yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {filteredEvidence.demonstrations.map((demo) => (
                  <div
                    key={demo.id}
                    data-testid={`work-demo-${demo.id}`}
                    className="card"
                    style={{ borderColor: 'var(--line-strong)', padding: 'clamp(24px, 4vw, 36px)' }}
                  >
                    <span
                      className="mono-tag"
                      style={{ color: 'var(--electric-blue)', display: 'block', marginBottom: '10px' }}
                    >
                      {demo.tag}
                    </span>
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>
                      {demo.title}
                    </h3>
                    <p className="lead" style={{ fontSize: '1.05rem', color: 'var(--text-subtle)', marginBottom: '22px' }}>
                      {demo.summary}
                    </p>

                    <div className="grid-2" style={{ marginBottom: '24px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.84rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                          Operational Context
                        </h4>
                        <p style={{ fontSize: '0.92rem', color: 'var(--text-subtle)', lineHeight: 1.65 }}>
                          {demo.problem}
                        </p>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.84rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                          Engineering Approach
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-subtle)', fontSize: '0.92rem', lineHeight: 1.65 }}>
                          {demo.engineeringApproach.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {demo.hasSyntheticLedgerTable && (
                      <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.84rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '8px' }}>
                          Illustrative Reconciliation Outcomes (Synthetic Fixture Data)
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
                    )}

                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => onNavigate(demo.primaryRoute)}
                      >
                        <Terminal size={16} />
                        <span>{demo.primaryCtaLabel}</span>
                      </button>
                      <button
                        type="button"
                        className="button button-quiet button-small"
                        onClick={onOpenIntakeModal}
                      >
                        <span>Discuss a similar system</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Technical Articles */}
          <div style={{ marginBottom: '64px' }} data-testid="work-notes-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="mono-tag" style={{ color: 'var(--warm-white)' }}>02 · ENGINEERING BRIEFS</span>
                <h2 style={{ fontSize: '1.75rem', margin: '4px 0 0' }}>Technical Notes &amp; Reference Patterns</h2>
              </div>
              <button
                type="button"
                className="text-link"
                onClick={() => onNavigate('insights')}
              >
                View all Engineering Notes →
              </button>
            </div>

            {filteredEvidence.notes.length === 0 ? (
              <div className="card" style={{ padding: '24px' }} data-testid="work-note-empty">
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  No engineering notes are tagged under {filteredEvidence.categoryLabel} yet.
                </p>
              </div>
            ) : (
              <div className="grid-3">
                {filteredEvidence.notes.map((note) => (
                  <div key={note.id} className="card" data-testid={`work-note-${note.id}`}>
                    <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>{note.number}</span>
                    <h3>{note.title}</h3>
                    <p>{note.summary}</p>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => onNavigate(note.targetRoute)}
                      style={{ marginTop: 'auto', paddingTop: '10px' }}
                    >
                      Read article →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Client Case Study Publication Standard */}
          <div className="card" style={{ borderColor: 'var(--line-strong)', padding: 'clamp(24px, 4vw, 36px)' }}>
            <div className="governance-grid" style={{ gap: '28px' }}>
              <div>
                <span className="mono-tag" style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '8px' }}>
                  03 · CONFIDENTIALITY &amp; PUBLICATION CRITERIA
                </span>
                <h2 style={{ fontSize: '1.45rem', margin: '0 0 10px' }}>
                  {filter === 'all'
                    ? 'Client work is published solely with written disclosure approval.'
                    : `Client case study archive for ${filteredEvidence.categoryLabel}`}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                  Many financial and institutional systems in East Africa operate under strict non-disclosure protections. Named client stories appear only when production acceptance and customer sign-off are explicitly granted.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 10px' }}>Publication Requirements</h3>
                <ol style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 16px', lineHeight: 1.65 }}>
                  <li style={{ marginBottom: '4px' }}>Final production acceptance verified under real workloads.</li>
                  <li style={{ marginBottom: '4px' }}>Written client review and approval for public disclosure.</li>
                  <li>Reproducible baseline and verified outcome metrics from production operations.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
