import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Globe,
  RefreshCw,
  Search,
  ExternalLink,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import {
  TREND_TOPICS,
  type GroundedTrendsPayload,
  type TrendTopicId,
} from '../engine/trendsParser';
import { LoadingSkeleton } from './LoadingSkeleton';

interface TrendsApiResponse extends Partial<GroundedTrendsPayload> {
  ok?: boolean;
  code?: string;
  error?: string;
}

const TOPIC_LIST = Object.values(TREND_TOPICS);

const QUICK_SEARCH_PRESETS: Array<{ label: string; topic: TrendTopicId; query: string }> = [
  { label: 'URA EFRIS API Updates', topic: 'efris-compliance', query: 'URA EFRIS electronic invoicing API updates' },
  { label: 'MTN MoMo OpenAPI', topic: 'east-africa-rails', query: 'MTN MoMo OpenAPI webhook settlement East Africa' },
  { label: 'ISO 20022 Clearing', topic: 'iso20022-open-banking', query: 'ISO 20022 instant payment reconciliation settlement' },
  { label: 'Webhook Idempotency', topic: 'idempotency-settlement', query: 'payment webhook idempotency retry queue engineering' },
];

function formatGeneratedTimestamp(iso?: string): string {
  if (!iso) return 'Current Session';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function getImpactAccent(level: 'HIGH' | 'MEDIUM' | 'WATCH'): string {
  if (level === 'HIGH') return 'var(--status-warn-text)';
  if (level === 'WATCH') return 'var(--electric-blue)';
  return 'var(--status-pass-text)';
}

export const LiveFinOpsTrendsSection: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<TrendTopicId>('all');
  const [queryInput, setQueryInput] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [data, setData] = useState<GroundedTrendsPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<{ code?: string; message: string } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadTrends = useCallback(async (topic: TrendTopicId, query: string) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorState(null);

    try {
      const response = await fetch('/api/insights/trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          topic,
          query: query.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as TrendsApiResponse;
      if (controller.signal.aborted) return;

      if (!response.ok || !payload.ok) {
        setErrorState({
          code: payload.code || `HTTP_${response.status}`,
          message:
            payload.error ||
            'Unable to retrieve live web-grounded financial operations trends right now.',
        });
        return;
      }

      setData({
        topic: payload.topic ?? topic,
        customQuery: payload.customQuery,
        generatedAt: payload.generatedAt ?? new Date().toISOString(),
        model: payload.model ?? 'gemini-4-hydrogen',
        briefingSummary: payload.briefingSummary ?? '',
        trends: Array.isArray(payload.trends) ? payload.trends : [],
        sources: Array.isArray(payload.sources) ? payload.sources : [],
        searchQueries: Array.isArray(payload.searchQueries) ? payload.searchQueries : [],
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setErrorState({
        code: 'NETWORK_ERROR',
        message: 'Network request failed while fetching live search-grounded trends.',
      });
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadTrends('all', '');
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadTrends]);

  const handleTopicSelect = (topicId: TrendTopicId) => {
    setSelectedTopic(topicId);
    void loadTrends(topicId, activeQuery);
  };

  const handleQuickPreset = (preset: { topic: TrendTopicId; query: string }) => {
    setSelectedTopic(preset.topic);
    setQueryInput(preset.query);
    setActiveQuery(preset.query);
    void loadTrends(preset.topic, preset.query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = queryInput.trim();
    setActiveQuery(cleaned);
    void loadTrends(selectedTopic, cleaned);
  };

  const handleResetQuery = () => {
    setQueryInput('');
    setActiveQuery('');
    void loadTrends(selectedTopic, '');
  };

  const isKeyConfigError =
    errorState?.code === 'API_KEY_ERROR' || errorState?.code === 'MISSING_API_KEY';

  return (
    <section
      id="live-finops-trends"
      className="section-full theme-navy band-section"
      style={{ scrollMarginTop: '92px' }}
      aria-labelledby="live-trends-heading"
    >
      <div className="container-expansive">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ maxWidth: '720px' }}>
            <span className="eyebrow">Google Search Grounding · Live Industry Intelligence</span>
            <h2
              id="live-trends-heading"
              style={{ fontSize: 'clamp(1.65rem, 3.2vw, 2.35rem)', marginBottom: '10px' }}
            >
              Real-Time Financial Operations Brief
            </h2>
            <p style={{ margin: 0, color: 'var(--text-subtle)', maxWidth: '64ch' }}>
              Live synthesis of current payment rail updates, fiscal compliance changes, and settlement reliability practices retrieved via server-side Google Search grounding with linked primary citations.
            </p>
          </div>

          <button
            type="button"
            className="button button-quiet button-small"
            onClick={() => loadTrends(selectedTopic, activeQuery)}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : undefined} />
            <span>{isLoading ? 'Grounding Web Brief…' : 'Refresh Brief'}</span>
          </button>
        </div>

        {/* Topic Selector + Focus Query Bar */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            padding: '18px',
            marginBottom: '24px',
          }}
        >
          <div
            role="group"
            aria-label="Financial operations trend focus"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
          >
            {TOPIC_LIST.map((topic) => {
              const isSelected = topic.id === selectedTopic;
              return (
                <button
                  key={topic.id}
                  type="button"
                  aria-pressed={isSelected}
                  className={`button button-small ${isSelected ? 'button-primary' : 'button-quiet'}`}
                  onClick={() => handleTopicSelect(topic.id)}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <label
              htmlFor="finops-trend-query"
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
              Focus search query for live financial operations trends
            </label>
            <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 0 }}>
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
              <input
                id="finops-trend-query"
                type="text"
                className="form-input"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Query specific topic (e.g. URA EFRIS updates, MTN MoMo settlement, ISO 20022)"
                maxLength={140}
                style={{
                  marginTop: 0,
                  padding: '10px 14px 10px 36px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <button
              type="submit"
              className="button button-primary button-small"
              disabled={isLoading}
            >
              <Globe size={14} />
              <span>Run Grounded Search</span>
            </button>

            {(activeQuery || queryInput) && (
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={handleResetQuery}
                disabled={isLoading}
              >
                Clear Filter
              </button>
            )}
          </form>

          {/* Quick Grounded Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span className="mono-tag" style={{ fontSize: '0.72rem' }}>Quick searches:</span>
            {QUICK_SEARCH_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="button button-quiet button-small"
                style={{ minHeight: '30px', padding: '4px 10px', fontSize: '0.76rem' }}
                onClick={() => handleQuickPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Output Container */}
        <div aria-live="polite">
          {isLoading ? (
            <div className="surface-panel" style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Querying live web sources for current financial operations standards and rail developments…
              </p>
              <LoadingSkeleton variant="card" count={2} />
            </div>
          ) : errorState ? (
            <div
              role="status"
              data-testid="trends-error-panel"
              className="card"
              style={{
                padding: '22px',
                borderColor: 'var(--status-warn-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-warn-text)', fontWeight: 700, fontSize: '0.95rem' }}>
                <AlertTriangle size={16} />
                <span>Live Search Grounding Unavailable ({errorState.code || 'SERVICE_NOTICE'})</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-subtle)', maxWidth: '72ch' }}>
                {errorState.message}
              </p>
              {isKeyConfigError && (
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '72ch' }}>
                  EULOK does not fabricate or simulate external news briefings when live Google Search grounding credentials are invalid or unconfigured. You can inspect verified engineering reference notes below while configuring a valid server <code>GEMINI_API_KEY</code> in workspace <strong>Settings &gt; Secrets</strong>.
                </p>
              )}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={() => loadTrends(selectedTopic, activeQuery)}
                >
                  <RefreshCw size={14} />
                  <span>Retry Live Search</span>
                </button>
                <a
                  href="#deterministic-calc"
                  className="button button-quiet button-small"
                >
                  <BookOpen size={14} />
                  <span>Read Deterministic Engineering Notes ↓</span>
                </a>
              </div>
            </div>
          ) : data ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Grounded Executive Synthesis */}
              <div className="surface-panel" style={{ padding: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    marginBottom: '10px',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span style={{ color: 'var(--electric-blue)', fontWeight: 600 }}>
                    {TREND_TOPICS[data.topic]?.label}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Updated {formatGeneratedTimestamp(data.generatedAt)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{data.sources.length} cited web sources</span>
                  {data.customQuery && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Query: &ldquo;{data.customQuery}&rdquo;</span>
                    </>
                  )}
                </div>
                <p style={{ margin: 0, color: 'var(--warm-white)', fontSize: '0.98rem', lineHeight: 1.65 }}>
                  {data.briefingSummary}
                </p>
              </div>

              {/* Trend Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))',
                  gap: '16px',
                }}
              >
                {data.trends.map((trend, idx) => (
                  <article
                    key={`${trend.title}-${idx}`}
                    className="card"
                    style={{
                      padding: '22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          alignItems: 'center',
                          fontSize: '0.76rem',
                          color: 'var(--text-muted)',
                          marginBottom: '10px',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span style={{ color: 'var(--electric-blue)', fontWeight: 600 }}>
                          {trend.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{trend.publishedWindow}</span>
                        <span aria-hidden="true">·</span>
                        <span style={{ color: getImpactAccent(trend.impactLevel), fontWeight: 600 }}>
                          {trend.impactLevel} PRIORITY
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.14rem', marginBottom: '10px', lineHeight: 1.35 }}>
                        {trend.title}
                      </h3>

                      <p style={{ fontSize: '0.92rem', color: 'var(--text-subtle)', margin: 0, lineHeight: 1.6 }}>
                        {trend.summary}
                      </p>
                    </div>

                    <div
                      style={{
                        paddingTop: '12px',
                        borderTop: '1px solid var(--line)',
                        fontSize: '0.84rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ color: 'var(--warm-white)' }}>Engineering Action:</strong>{' '}
                      {trend.engineeringTakeaway}
                    </div>
                  </article>
                ))}
              </div>

              {/* Grounded Primary Web Sources & Search Queries */}
              <div className="surface-panel" style={{ padding: '18px 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '12px',
                  }}
                >
                  <strong style={{ fontSize: '0.88rem', color: 'var(--warm-white)' }}>
                    Verified Search Grounding Citations
                  </strong>
                  {data.searchQueries.length > 0 && (
                    <span className="mono-tag" style={{ fontSize: '0.75rem' }}>
                      Queries: {data.searchQueries.slice(0, 3).join(' · ')}
                    </span>
                  )}
                </div>

                {data.sources.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    No external citation URIs were returned for this query. Try broadening the topic focus above.
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                      gap: '10px',
                    }}
                  >
                    {data.sources.map((src) => (
                      <a
                        key={src.url}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="surface-inset"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          textDecoration: 'none',
                          color: 'var(--text-main)',
                          minWidth: 0,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {src.title}
                          </div>
                          <div
                            style={{
                              fontSize: '0.74rem',
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {src.domain}
                          </div>
                        </div>
                        <ExternalLink size={14} style={{ flexShrink: 0, color: 'var(--electric-blue)' }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

