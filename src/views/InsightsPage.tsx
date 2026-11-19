import { navigateTo, openIntakeModal } from '../utils/navigation';
import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Link2,
  Search,
} from 'lucide-react';

interface InsightsPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  summary: string;
  demonstrates: string;
  relatedService: string;
  content: string[];
  codeSnippet?: string;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [noteSearchQuery, setNoteSearchQuery] = useState<string>('');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>('deterministic-calc');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
  };

  const articles: Article[] = [
    {
      id: 'deterministic-calc',
      title: 'Why Financial Systems Need Deterministic Calculations',
      category: 'Financial Engineering',
      readTime: '6 min read',
      date: '2026-10-18',
      summary: 'Why IEEE 754 binary floating-point math causes cumulative ledger drift, and why money calculations must use pure Decimal fixed-point logic with deterministic rule matching.',
      demonstrates: 'Financial engineering, numerical stability, and audit invariants.',
      relatedService: 'services/reconciliation',
      content: [
        'In computing, standard numbers are represented using binary floating point (IEEE 754). While ideal for graphics and scientific simulations, floating-point math cannot represent many decimal fractions (such as 0.1 or 0.05) exactly in base-2 binary.',
        'In a financial reconciliation workflow processing 50,000 mobile-money collections, rounding approximations accumulate into hundreds of thousands of shillings in ledger drift. Worse, when fuzzy heuristics are tasked with "guessing" transaction matches, they invent associations that do not exist.',
        'EULOK enforces two strict invariants for financial systems: (1) All currency arithmetic uses arbitrary-precision Decimal or integer minor units, and (2) Reconciliation matching is 100% deterministic with an immutable audit hash.',
      ],
      codeSnippet: `// Flawed: Standard JavaScript/Python float math
0.1 + 0.2 === 0.3; // false (0.30000000000000004)

// Correct: EULOK Deterministic Integer Minor Units
const amountDueMinor = 50000000n; // 500,000.00 UGX
const paidMinor = 50000000n;
const balanceMinor = amountDueMinor - paidMinor; // 0n (Exact)`,
    },
    {
      id: 'idempotency-momo',
      title: 'Idempotency and Duplicate Payment Events in Mobile Money',
      category: 'Reliability',
      readTime: '5 min read',
      date: '2026-10-14',
      summary: 'How aggregator timeouts, retries, and network jitter cause duplicate webhooks, and how to engineer duplicate-safe transaction boundaries.',
      demonstrates: 'Idempotency keys, distributed locks, and failure recovery.',
      relatedService: 'services/finance-integrations',
      content: [
        'Mobile-money aggregators and telecoms in East Africa operate over cellular networks subject to intermittent packet loss. When an aggregator delivers a webhook payload but fails to receive an HTTP 200 within its 3-second timeout window, its queue resends the identical transaction.',
        'If the receiving application naively inserts each incoming payload into its database, user accounts are credited twice. If the application rejects retries with an HTTP 400/500, the aggregator suspends delivery.',
        'Our integration adapters utilize an idempotency key hash (combining carrier transaction ID, account, amount, and timestamp) stored in a fast atomic cache. Duplicate events return an immediate HTTP 200 acknowledging receipt while skipping duplicate ledger allocation.',
      ],
      codeSnippet: `// Atomic idempotency claim prevents double-credit on carrier timeout retries
const eventKey = sha256(\`\${provider}:\${externalTxId}:\${invoiceRef}\`);
const claimed = await db.query(
  'INSERT INTO webhook_events (idempotency_key) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id',
  [eventKey]
);
if (claimed.rowCount === 0) {
  return { status: 200, action: 'IDEMPOTENT_NOOP' };
}`,
    },
    {
      id: 'human-approval-boundaries',
      title: 'Designing Human Approval into Automation: Fail-Closed Boundaries',
      category: 'Automation Governance',
      readTime: '7 min read',
      date: '2026-10-09',
      summary: 'Why automated workflow pipelines built for clients must never authorize irreversible financial operations, and how to enforce fail-closed human approval boundaries.',
      demonstrates: 'Safety architecture, permission controls, and audit trails.',
      relatedService: 'services/finance-integrations',
      content: [
        'When organizations adopt workflow automation, a common architectural mistake is granting automated pipelines unilateral authority to make consequential decisions—such as releasing funds, altering contract scope, or refunding transactions.',
        'In client automation systems we engineer, proposal and execution are strictly separated: automated workflows may prepare drafts, queue candidate matches, or synchronize records, but any action carrying financial, legal, or security consequences halts at an explicit human sign-off boundary.',
        'If a parameter is ambiguous or an external check times out, the system fails closed (blocks execution) rather than assuming a default pass state.',
      ],
      codeSnippet: `// Fail-closed exception gate for unreferenced or mismatched amounts
if (match.status === 'proposed' || match.status === 'exception') {
  return await escrowQueue.enqueueForFinanceSignOff({
    matchId: match.id,
    amountApplied: 0, // Never auto-apply ambiguous credits
    requiresHumanOperator: true,
  });
}`,
    },
    {
      id: 'rescue-stalled-project',
      title: 'How to Rescue a Stalled Software Project: Technical Triage',
      category: 'Technical Assessment',
      readTime: '8 min read',
      date: '2026-09-30',
      summary: 'A field guide to taking over abandoned or unmaintainable codebases without causing regressions or defaulting to an expensive rewrite.',
      demonstrates: 'Software archaeology, regression testing, and incremental refactoring.',
      relatedService: 'rescue',
      content: [
        'When an agency abandons an unfinished build or a solo developer leaves with institutional knowledge, business owners panic and assume they must start from zero.',
        'A complete rewrite is costly and usually reintroduces bugs that were already solved in the original codebase. The professional approach is systematic triage: reproduce reported production failures in an isolated container, establish automated tests for working paths, and isolate the unstable modules.',
      ],
      codeSnippet: `# Step 1-2 Rescue Triage Checklist
1. Audit .env & git history -> rotate leaked credentials immediately (P0)
2. Verify automated DB backup + test staging pg_restore (P0)
3. Wrap fragile billing endpoints in characterization tests before touching logic (P1)`,
    },
    {
      id: 'deployment-vs-production',
      title: 'Why a Successful Deployment is Not Proof of Production Readiness',
      category: 'Release Engineering',
      readTime: '5 min read',
      date: '2026-09-22',
      summary: 'A green CI build or successful container deployment only proves that code booted. Real readiness requires end-to-end verification and credential isolation.',
      demonstrates: 'Verification gates, production smoke tests, and operational observability.',
      relatedService: 'work',
      content: [
        'Teams frequently confuse a successful "npm run build" or "docker push" with verified software. A build can compile cleanly while an environment variable is missing, a database migration is pending, or an external API token has expired.',
        'Production readiness requires synthetic smoke tests exercising user journeys against the actual running environment, verifying that database connections, third-party authentication tokens, and CSP headers all function in concert.',
      ],
    },
    {
      id: 'unreliable-networks',
      title: 'Building for Unreliable Network Conditions and Constrained Devices',
      category: 'Infrastructure',
      readTime: '6 min read',
      date: '2026-09-15',
      summary: 'Engineering web applications for low-bandwidth mobile connections in East Africa using zero-bloat payloads and resilient offline states.',
      demonstrates: 'Performance budgeting, asset minimization, and network tolerance.',
      relatedService: 'services/performance-builds',
      content: [
        'While bloated modern web applications routinely ship 5MB JavaScript bundles with dozens of tracking scripts, users across Kampala and East Africa often browse on 3G mobile connections with metered data plans.',
        'A website that takes 12 seconds to hydrate will be abandoned. By enforcing strict performance budgets (lean compressed payloads, pre-rendered semantic HTML, modern CSS without heavy runtime overhead), applications load quickly and remain navigable even when connection latency spikes.',
      ],
    },
  ];

  // Expand and scroll directly when navigated via URL hash (#article-id)
  useEffect(() => {
    const syncFromHash = () => {
      const hashId = window.location.hash.replace(/^#/, '').trim();
      if (!hashId) return;
      const targetExists = articles.some((a) => a.id === hashId);
      if (targetExists) {
        setSelectedCategory('all');
        setExpandedArticleId(hashId);
        setTimeout(() => {
          document.getElementById(hashId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleCopySnippet = (articleId: string, snippet: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(snippet);
      setCopiedSnippetId(articleId);
      setTimeout(() => setCopiedSnippetId(null), 2000);
    }
  };

  const handleCopyArticleLink = (articleId: string) => {
    if (typeof window === 'undefined' || !navigator.clipboard) return;
    const url = `${window.location.origin}/insights#${articleId}`;
    navigator.clipboard.writeText(url);
    window.history.replaceState(null, '', `#${articleId}`);
    setCopiedLinkId(articleId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const categories = ['all', 'Financial Engineering', 'Reliability', 'Automation Governance', 'Technical Assessment', 'Release Engineering', 'Infrastructure'];

  const normalizedNoteQuery = noteSearchQuery.trim().toLowerCase();
  const filteredArticles = articles.filter((a) => {
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!normalizedNoteQuery) return true;
    const haystack = [
      a.title,
      a.category,
      a.summary,
      a.demonstrates,
      ...a.content,
      a.codeSnippet ?? '',
    ]
      .join(' ')
      .toLowerCase();
    const terms = normalizedNoteQuery.split(/\s+/).filter(Boolean);
    return terms.some((term) => haystack.includes(term));
  });

  return (
    <>
      <section className="section-full theme-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 0 50px' }}>
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Engineering Notes</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">TECHNICAL JOURNAL · ARCHITECTURE & RELIABILITY</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', marginBottom: '20px' }}>
              Engineering Notes &amp; Insights
            </h1>
            <p className="lead" style={{ maxWidth: '64ch' }}>
              Architectural decisions, financial correctness rules, and reliability boundaries engineered for Uganda and East Africa&apos;s production constraints.
            </p>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '32px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`button button-small ${selectedCategory === cat ? 'button-primary' : 'button-quiet'}`}
                  onClick={() => handleCategoryChange(cat)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {cat === 'all' ? 'All Topics' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid / List */}
      <section
        id="notes-archive"
        className="section-full theme-dark"
        style={{ padding: 'clamp(48px, 6vw, 80px) 0', borderTop: '1px solid var(--line)', scrollMarginTop: '92px' }}
      >
        <div className="container-expansive">
          {/* Local Archive Search Bar */}
          <div
            className="surface-panel"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '14px 16px',
              marginBottom: '24px',
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 0 }}>
              <Search
                size={15}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <label
                htmlFor="notes-archive-search"
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              >
                Search engineering notes archive
              </label>
              <input
                id="notes-archive-search"
                type="search"
                className="form-input"
                value={noteSearchQuery}
                onChange={(e) => setNoteSearchQuery(e.target.value)}
                placeholder="Search engineering notes, SQL patterns, idempotency, Decimal math, rescue…"
                style={{
                  marginTop: 0,
                  padding: '9px 14px 9px 36px',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                className="mono-tag"
                data-testid="notes-archive-count"
                style={{ fontSize: '0.76rem', fontVariantNumeric: 'tabular-nums' }}
              >
                Showing {filteredArticles.length} of {articles.length} notes
              </span>
              {(noteSearchQuery || selectedCategory !== 'all') && (
                <button
                  type="button"
                  className="button button-quiet button-small"
                  onClick={() => {
                    setNoteSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="card" style={{ padding: '28px', textAlign: 'left' }} data-testid="notes-archive-empty">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
                No Engineering Notes matched &ldquo;{noteSearchQuery}&rdquo;
              </h2>
              <p style={{ margin: '0 0 16px', fontSize: '0.92rem', color: 'var(--text-subtle)', maxWidth: '58ch' }}>
                Try broader engineering keywords like idempotency, reconciliation, Decimal, rescue, or deployment.
              </p>
              <button
                type="button"
                className="button button-primary button-small"
                onClick={() => {
                  setNoteSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Reset Note Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {filteredArticles.map((article) => {
                const isExpanded = expandedArticleId === article.id;
                return (
                <article
                  key={article.id}
                  id={article.id}
                  className="card"
                  style={{
                    borderColor: isExpanded ? 'var(--electric-blue)' : undefined,
                    padding: 'clamp(24px, 4vw, 36px)',
                    scrollMarginTop: '92px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div className="meta-inline">
                      <span style={{ color: 'var(--electric-blue)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                        {article.category}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {article.readTime}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        {article.date}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="button button-quiet button-small"
                      onClick={() => handleCopyArticleLink(article.id)}
                      style={{ minHeight: '28px', padding: '4px 10px', fontSize: '0.74rem' }}
                    >
                      {copiedLinkId === article.id ? (
                        <CheckCircle2 size={13} color="var(--status-pass-text)" />
                      ) : (
                        <Link2 size={13} />
                      )}
                      <span>{copiedLinkId === article.id ? 'Link Copied' : 'Copy link'}</span>
                    </button>
                  </div>

                  <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', marginBottom: '12px' }}>
                    {article.title}
                  </h2>
                  <p className="lead" style={{ fontSize: '1rem', color: 'var(--text-subtle)', marginBottom: '12px' }}>
                    {article.summary}
                  </p>

                  <p style={{ marginBottom: '16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--warm-white)' }}>Focus:</strong> {article.demonstrates}
                  </p>

                  {/* Expanded Content View */}
                  {isExpanded && (
                    <div style={{ paddingTop: '16px', borderTop: '1px solid var(--line)', marginTop: '16px' }}>
                      {article.content.map((paragraph, idx) => (
                        <p key={idx} style={{ lineHeight: 1.7, marginBottom: '16px', color: 'var(--warm-white)' }}>
                          {paragraph}
                        </p>
                      ))}

                      {article.codeSnippet && (
                        <div style={{ margin: '20px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                            <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>
                              Technical Reference Pattern:
                            </span>
                            <button
                              type="button"
                              className="button button-quiet button-small"
                              onClick={() => handleCopySnippet(article.id, article.codeSnippet!)}
                              style={{ minHeight: '28px', padding: '4px 10px', fontSize: '0.74rem' }}
                            >
                              {copiedSnippetId === article.id ? (
                                <CheckCircle2 size={13} color="var(--status-pass-text)" />
                              ) : (
                                <Copy size={13} />
                              )}
                              <span>{copiedSnippetId === article.id ? 'Copied Snippet' : 'Copy snippet'}</span>
                            </button>
                          </div>
                          <pre>
                            <code>{article.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
                        <button
                          type="button"
                          className="button button-quiet button-small"
                          onClick={() => onNavigate(article.relatedService)}
                        >
                          Explore Related Service →
                        </button>

                        <button
                          type="button"
                          className="button button-primary button-small"
                          onClick={() => onOpenIntakeModal()}
                        >
                          Discuss Your System Architecture
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                      type="button"
                      className="text-link"
                      aria-expanded={isExpanded}
                      onClick={() => {
                        const next = isExpanded ? null : article.id;
                        setExpandedArticleId(next);
                        if (next && typeof window !== 'undefined') {
                          window.history.replaceState(null, '', `#${next}`);
                        }
                      }}
                      style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>{isExpanded ? 'Collapse Article' : 'Read Full Technical Note'}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
    </>
  );
};
