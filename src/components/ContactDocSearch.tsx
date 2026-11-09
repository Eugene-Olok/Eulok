import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp, ArrowRight, BookOpen, HelpCircle } from 'lucide-react';
import { FAQItem, FAQ_CATEGORIES, filterFaqs } from '../data/contactFaqs';
import { navigateTo } from '../utils/navigation';

interface ContactDocSearchProps {
  onNavigate?: (page: string) => void;
}

export const ContactDocSearch: React.FC<ContactDocSearchProps> = ({
  onNavigate = navigateTo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('scope-pricing');

  const filteredItems = useMemo(() => {
    return filterFaqs(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleClear = () => {
    setSearchQuery('');
    setActiveCategory('All');
  };

  return (
    <section className="section-padded" style={{ borderTop: '1px solid var(--line)', paddingBottom: '64px' }}>
      <div className="container-expansive">
        <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--electric-blue)', marginBottom: '8px' }}>
            <BookOpen size={16} />
            <span className="eyebrow" style={{ margin: 0 }}>Instant Service Documentation & FAQs</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)', marginBottom: '12px' }}>
            Find answers to common technical & scope questions
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, maxWidth: '64ch' }}>
            Filter our operational policies, pricing models, carrier integrations, and verification standards in real time.
          </p>
        </div>

        {/* Search Bar & Controls */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px', background: 'var(--bg-secondary)' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }} role="search" aria-label="Documentation search">
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="faq-search-input"
              data-testid="faq-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. 'MoMo', 'pricing', 'EFRIS', 'ownership', 'rescue', 'timeline')..."
              style={{
                width: '100%',
                padding: '12px 42px 12px 42px',
                borderRadius: '8px',
                fontSize: '0.96rem',
                border: '1px solid var(--line-strong)',
                background: 'var(--bg-primary)',
                color: 'var(--text-main)',
              }}
              aria-label="Filter documentation and FAQs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search text"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>
              Filter by topic:
            </span>
            {FAQ_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`button button-small ${activeCategory === category ? 'button-primary' : 'button-quiet'}`}
                style={{ fontSize: '0.82rem', padding: '4px 10px' }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          <span>
            Showing <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? 'topic' : 'topics'}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </span>
          {(searchQuery || activeCategory !== 'All') && (
            <button
              type="button"
              onClick={handleClear}
              className="text-link"
              style={{ fontSize: '0.84rem' }}
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Items List */}
        {filteredItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: '20px 24px',
                    borderColor: isExpanded ? 'var(--electric-blue)' : 'var(--line)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleExpand(item.id)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'inherit',
                      gap: '16px',
                    }}
                    aria-expanded={isExpanded}
                  >
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                          {item.category}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 600, color: 'var(--warm-white)' }}>
                        {item.question}
                      </h3>
                    </div>

                    <div style={{ color: 'var(--text-muted)', paddingTop: '4px' }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
                      <p style={{ color: 'var(--text-subtle)', lineHeight: 1.65, fontSize: '0.94rem', margin: 0 }}>
                        {item.answer}
                      </p>

                      <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: '0.74rem',
                                color: 'var(--text-muted)',
                                background: 'var(--bg-secondary)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {item.serviceLink && (
                          <button
                            type="button"
                            onClick={() => onNavigate(item.serviceLink!.page)}
                            className="button button-quiet button-small"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span>{item.serviceLink.label}</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
            <HelpCircle size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ marginBottom: '8px' }}>No matching documentation found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '48ch', margin: '0 auto 20px', fontSize: '0.92rem' }}>
              We couldn't find any questions matching "{searchQuery}". Try different search terms or submit your inquiry directly through the form above.
            </p>
            <button
              type="button"
              onClick={handleClear}
              className="button button-quiet button-small"
            >
              Clear filters and view all topics
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
