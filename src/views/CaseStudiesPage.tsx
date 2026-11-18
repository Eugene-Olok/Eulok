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
            <span className="eyebrow">PUBLISHED EVIDENCE · DEMONSTRATIONS &amp; ARCHITECTURE</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', marginBottom: '20px' }}>
              Evidence before claims.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch' }}>
              We publish work when the operational context can be explained honestly and the outcomes independently verified. Client material is shared only with explicit contractual permission.
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

      {/* 3 Explicit Content Types Section */}
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

              {/* Section 1: Client Case Studies */}
              <div style={{ marginBottom: '56px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="mono-tag" style={{ color: 'var(--accent-blue)' }}>SECTION 1 · CLIENT WORK</span>
                    <h2 style={{ fontSize: '1.6rem', margin: '4px 0 0' }}>Client Case Studies</h2>
                  </div>
                  <span className="badge badge-neutral">
                    Published{filter !== 'all' ? ` (${filteredEvidence.categoryLabel})` : ''}: 0 (Strict Policy)
                  </span>
                </div>

                <div className="card" style={{ borderColor: 'var(--line-strong)', padding: 'clamp(24px, 4vw, 36px)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '28px', alignItems: 'start' }}>
                    <div>
                      <span className="badge badge-warn" style={{ marginBottom: '10px' }}>
                        Deliberate Empty State
                      </span>
                      <h3 style={{ fontSize: '1.35rem' }}>
                        {filter === 'all'
                          ? 'Case studies are published upon verified acceptance.'
                          : `No public client case study in ${filteredEvidence.categoryLabel} yet.`}
                      </h3>
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
                        Until those requirements are met, explore the verified technical demonstrations and engineering notes filtered below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Demonstrations */}
              <div style={{ marginBottom: '56px' }} data-testid="work-demonstrations-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>SECTION 2 · VERIFIED ARTIFACTS</span>
                    <h2 style={{ fontSize: '1.6rem', margin: '4px 0 0' }}>Technical Demonstrations</h2>
                  </div>
                  <span className="badge badge-pass">
                    Showing {filteredEvidence.demonstrations.length} Verified {filteredEvidence.demonstrations.length === 1 ? 'System' : 'Systems'}
                  </span>
                </div>

                {filteredEvidence.demonstrations.length === 0 ? (
                  <div className="card" style={{ padding: '24px' }} data-testid="work-demo-empty">
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                      No interactive technical demonstration is mapped to {filteredEvidence.categoryLabel} yet.
                    </p>
                  </div>
                ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {filteredEvidence.demonstrations.map((demo) => (
                    <div
                      key={demo.id}
                      data-testid={`work-demo-${demo.id}`}
                      className="card"
                      style={{ borderColor: 'var(--line-strong)', padding: 'clamp(24px, 4vw, 36px)' }}
                    >
                      <span className="badge badge-neutral" style={{ color: 'var(--electric-blue)', marginBottom: '12px' }}>
                        {demo.tag}
                      </span>
                      <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>
                        {demo.title}
                      </h3>
                      <p className="lead" style={{ fontSize: '1.05rem', color: 'var(--text-subtle)', marginBottom: '20px' }}>
                        {demo.summary}
                      </p>

                      <div className="grid-2" style={{ marginBottom: '24px' }}>
                        <div>
                          <h4 style={{ fontSize: '0.86rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                            The Operational Problem:
                          </h4>
                          <p style={{ fontSize: '0.92rem', color: 'var(--text-subtle)' }}>
                            {demo.problem}
                          </p>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.86rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                            The Engineering Approach:
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-subtle)', fontSize: '0.92rem' }}>
                            {demo.engineeringApproach.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {demo.hasSyntheticLedgerTable && (
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

              {/* Section 3: Technical Articles */}
              <div data-testid="work-notes-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="mono-tag" style={{ color: 'var(--warm-white)' }}>SECTION 3 · ARCHITECTURE PAPERS</span>
                    <h2 style={{ fontSize: '1.6rem', margin: '4px 0 0' }}>Technical Articles &amp; Supply Lines</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span className="badge badge-neutral">
                      Showing {filteredEvidence.notes.length} {filteredEvidence.notes.length === 1 ? 'Note' : 'Notes'}
                    </span>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => onNavigate('insights')}
                    >
                      View all Engineering Notes →
                    </button>
                  </div>
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
        </div>
      </section>
    </>
  );
};
