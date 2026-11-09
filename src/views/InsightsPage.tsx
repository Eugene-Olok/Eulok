import { navigateTo, openIntakeModal } from '../utils/navigation';
import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

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
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>('deterministic-calc');
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  const handleCategoryChange = (cat: string) => {
    if (cat === selectedCategory) return;
    setIsFiltering(true);
    setSelectedCategory(cat);
    setTimeout(() => {
      setIsFiltering(false);
    }, 180);
  };

  const articles: Article[] = [
    {
      id: 'deterministic-calc',
      title: 'Why Financial Systems Need Deterministic Calculations',
      category: 'Financial Engineering',
      readTime: '6 min read',
      date: '2026-10-18',
      summary: 'Why IEEE 754 binary floating-point math causes cumulative ledger drift, and why money calculations must use pure Decimal fixed-point logic with zero-LLM matching.',
      demonstrates: 'Financial engineering, numerical stability, and audit invariants.',
      relatedService: 'services/reconciliation',
      content: [
        'In computing, standard numbers are represented using binary floating point (IEEE 754). While ideal for graphics and scientific simulations, floating-point math cannot represent many decimal fractions (such as 0.1 or 0.05) exactly in base-2 binary.',
        'In a financial reconciliation workflow processing 50,000 mobile-money collections, rounding approximations accumulate into hundreds of thousands of shillings in ledger drift. Worse, when automated bots or LLMs are tasked with "guessing" transaction matches, they invent associations that do not exist.',
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
    },
    {
      id: 'human-approval-boundaries',
      title: 'Designing Human Approval into Automation: Fail-Closed Boundaries',
      category: 'AI Governance',
      readTime: '7 min read',
      date: '2026-10-09',
      summary: 'Why autonomous agents must never authorize irreversible financial operations, and how to build architectural control boundaries where failure fails closed.',
      demonstrates: 'Safety architecture, permission controls, and audit trails.',
      relatedService: 'services/finance-integrations',
      content: [
        'A popular misconception in generative AI adoption is that autonomous agents should make consequential business decisions—such as releasing funds, altering contract scope, or refunding transactions.',
        'At EULOK, our core architecture principle is: Models propose. Deterministic systems decide. Models may synthesize documents, propose transaction matches, or format intake briefs; but any action that carries financial, legal, or security consequences halts at an explicit human sign-off boundary.',
        'If a parameter is ambiguous or an external check times out, the system fails closed (blocks execution) rather than assuming a default pass state.',
      ],
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
        'While modern Silicon Valley web apps routinely ship 5MB JavaScript bundles with dozens of tracking scripts, users in Kampala often browse on 3G mobile connections with metered data plans.',
        'A website that takes 12 seconds to hydrate will be abandoned. By enforcing strict performance budgets (under 100KB initial bundle, semantic HTML, modern CSS without runtime overhead), applications load instantly and remain navigable even when connection latency spikes.',
      ],
    },
  ];

  const categories = ['all', 'Financial Engineering', 'Reliability', 'AI Governance', 'Technical Assessment', 'Release Engineering', 'Infrastructure'];

  const filteredArticles = articles.filter(
    (a) => selectedCategory === 'all' || a.category === selectedCategory
  );

  return (
    <>
      <section className="section-full theme-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 0 50px' }}>
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Engineering Notes</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">TECHNICAL JOURNAL · ARCHITECTURE & RELIABILITY</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', marginBottom: '20px' }}>
              Engineering Notes & Insights
            </h1>
            <p className="lead" style={{ maxWidth: '64ch' }}>
              In-depth explanations of the architectural decisions, financial correctness rules, and reliability boundaries behind our systems. No generic marketing fluff—real technical supply lines.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '32px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`button button-small ${selectedCategory === cat ? 'button-primary' : 'button-quiet'}`}
                onClick={() => handleCategoryChange(cat)}
                style={{ textTransform: 'capitalize' }}
              >
                {cat === 'all' ? 'All Topics' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid / List */}
      <section className="section-full theme-navy" style={{ padding: 'clamp(48px, 6vw, 80px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          {isFiltering ? (
            <div style={{ padding: '16px 0' }}>
              <LoadingSkeleton variant="card" count={3} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {filteredArticles.map((article) => {
                const isExpanded = expandedArticleId === article.id;
                return (
                <article
                  key={article.id}
                  className="card"
                  style={{
                    background: 'var(--bg-primary)',
                    border: isExpanded ? '1px solid var(--electric-blue)' : '1px solid var(--line)',
                    padding: 'clamp(24px, 4vw, 36px)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="badge badge-neutral" style={{ color: 'var(--electric-blue)' }}>
                        {article.category}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {article.readTime}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        {article.date}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      By EULOK Engineering Team
                    </span>
                  </div>

                  <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', marginBottom: '12px' }}>
                    {article.title}
                  </h2>
                  <p className="lead" style={{ fontSize: '1rem', color: 'var(--text-subtle)', marginBottom: '16px' }}>
                    {article.summary}
                  </p>

                  <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    <strong>Demonstrates:</strong> {article.demonstrates}
                  </div>

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
                          <span className="mono-tag" style={{ color: 'var(--electric-blue)', display: 'block', marginBottom: '6px' }}>
                            Technical Example:
                          </span>
                          <pre>
                            <code>{article.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
                        <button
                          className="button button-quiet button-small"
                          onClick={() => onNavigate(article.relatedService)}
                        >
                          Explore Related Service →
                        </button>

                        <button
                          className="button button-primary button-small"
                          onClick={onOpenIntakeModal}
                        >
                          Discuss Your System Architecture
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                      className="text-link"
                      onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
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
