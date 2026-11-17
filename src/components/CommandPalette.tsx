import React, { useState, useEffect, useRef } from 'react';
import { navigateTo, openIntakeModal } from '../utils/navigation';
import { getInitialTheme, toggleTheme } from '../utils/themeManager';
import {
  Search,
  Sparkles,
  Sliders,
  Activity,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Terminal,
  Grid,
  BookOpen,
  Sun,
  Webhook,
  Briefcase,
  Home,
  Compass,
  Info,
  Mail,
  Eye,
  TrendingUp,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Tools & Simulators' | 'Engineering Notes' | 'Governance & Actions';
  keywords?: string[];
  action: () => void;
  icon: React.ReactNode;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const toggleGrid = () => {
    document.body.classList.toggle('no-grid');
  };

  const handleToggleTheme = () => {
    toggleTheme(getInitialTheme());
  };

  const items: PaletteItem[] = [
    {
      id: 'home-overview',
      title: 'Home Overview',
      subtitle: 'EULOK independent software engineering practice, Kampala & remote',
      category: 'Navigation',
      keywords: ['home', 'index', 'start', 'landing'],
      action: () => navigateTo('home'),
      icon: <Home size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'scoping-studio',
      title: 'Scoping Studio & Feasibility Configurator',
      subtitle: 'Model architecture, timeline, regional budget (UGX/USD) & shareable SOW permalink',
      category: 'Tools & Simulators',
      keywords: ['sow', 'pricing', 'uganda', 'usd', 'ugx', 'estimate', 'calculator', 'risk'],
      action: () => navigateTo('scope-calculator'),
      icon: <Sliders size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'reconciliation-core',
      title: 'Deterministic Reconciliation Engine Demo',
      subtitle: 'Run 8-rule integer matching engine with presets & live invariant checks',
      category: 'Tools & Simulators',
      keywords: ['ops-suite', 'momo', 'ledger', 'r1', 'r8', 'matching'],
      action: () => navigateTo('ops-suite'),
      icon: <Cpu size={16} color="var(--status-pass-text)" />,
    },
    {
      id: 'rescue-triage',
      title: 'Software Rescue 8-Point Triage Scorecard',
      subtitle: 'Assess P0/P1/P2 stabilization readiness and export Markdown brief',
      category: 'Tools & Simulators',
      keywords: ['rescue', 'audit', 'p0', 'triage', 'scorecard'],
      action: () => navigateTo('rescue#rescue-triage'),
      icon: <Terminal size={16} color="var(--status-warn-text)" />,
    },
    {
      id: 'webhook-sandbox',
      title: 'Webhook HMAC & Idempotency Replay Sandbox',
      subtitle: 'Simulate valid MTN callbacks, carrier retries, tampered HMAC & EFRIS timeouts',
      category: 'Tools & Simulators',
      keywords: ['hmac', 'webhook', 'idempotency', 'mtn', 'efris', 'replay'],
      action: () => navigateTo('services/finance-integrations#webhook-sandbox'),
      icon: <Webhook size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'success-rate-30d',
      title: '30-Day Historical Transaction Success Rate Chart',
      subtitle: 'Rolling 30-day settlement success line chart & 99.5% SLA compliance trend',
      category: 'Tools & Simulators',
      keywords: ['30 days', 'chart', 'line chart', 'sla', 'recharts', 'history', 'success rate'],
      action: () => navigateTo('services/finance-integrations#30-day-success-rate'),
      icon: <TrendingUp size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'performance-telemetry',
      title: 'Adapter Throughput & Error Rate Dashboard',
      subtitle: 'Interactive Recharts visualizer for MTN MoMo, Airtel Money, URA EFRIS & Bank EFT',
      category: 'Tools & Simulators',
      keywords: ['throughput', 'latency', 'p95', 'dashboard', 'recharts', 'metrics'],
      action: () => navigateTo('services/finance-integrations#performance-telemetry'),
      icon: <Activity size={16} color="var(--status-pass-text)" />,
    },
    {
      id: 'live-finops-trends',
      title: 'Live FinOps Industry Trends (Search-Grounded)',
      subtitle: 'Real-time payment rail, EFRIS, and settlement updates with cited web sources',
      category: 'Tools & Simulators',
      keywords: ['trends', 'google search', 'grounding', 'news', 'finops', 'brief'],
      action: () => navigateTo('insights#live-finops-trends'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'system-status',
      title: 'Live System Status & Edge Telemetry',
      subtitle: 'Client RTT probe, component matrix, and synthetic operational checks',
      category: 'Tools & Simulators',
      keywords: ['status', 'latency', 'uptime', 'edge', 'probe'],
      action: () => navigateTo('status'),
      icon: <Activity size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'start-intake',
      title: 'Start Project Intake Scoping',
      subtitle: 'Open 4-step guided intake wizard with UGX / USD budget bracket selection',
      category: 'Tools & Simulators',
      keywords: ['intake', 'hire', 'proposal', 'quote', 'wizard'],
      action: () => openIntakeModal(),
      icon: <Sparkles size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'all-services',
      title: 'All Engineering Services',
      subtitle: 'Websites, financial systems, software rescue & workflow automation',
      category: 'Navigation',
      keywords: ['services', 'offerings', 'capabilities'],
      action: () => navigateTo('services'),
      icon: <Briefcase size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'performance-builds',
      title: 'Websites & Performance Builds',
      subtitle: 'Low-bandwidth Astro builds engineered for East African cellular networks',
      category: 'Navigation',
      keywords: ['websites', 'astro', 'speed', '3g', 'performance'],
      action: () => navigateTo('services/performance-builds'),
      icon: <Layers size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'finance-integrations',
      title: 'Finance & URA EFRIS Integrations',
      subtitle: 'Mobile money webhooks, electronic fiscalization, and bank APIs',
      category: 'Navigation',
      keywords: ['finance', 'efris', 'momo', 'airtel', 'api', 'payments'],
      action: () => navigateTo('services/finance-integrations'),
      icon: <Layers size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'payment-reconciliation',
      title: 'Payment Reconciliation Systems',
      subtitle: 'Multi-rail MTN, Airtel & bank ledger reconciliation with audit trails',
      category: 'Navigation',
      keywords: ['reconciliation', 'sacco', 'school fees', 'matching'],
      action: () => navigateTo('services/reconciliation'),
      icon: <Cpu size={16} color="var(--status-pass-text)" />,
    },
    {
      id: 'software-rescue',
      title: 'Software Rescue & Modernization',
      subtitle: 'Stabilize failing codebases, restore test suites, fix tech debt',
      category: 'Navigation',
      keywords: ['rescue', 'legacy', 'bugs', 'recovery'],
      action: () => navigateTo('rescue'),
      icon: <Terminal size={16} color="var(--status-warn-text)" />,
    },
    {
      id: 'how-we-work',
      title: 'How We Work (6-Stage Delivery Model)',
      subtitle: 'Discover, Scope, Design, Build & Verify, Deploy & Hand Over, Operate',
      category: 'Navigation',
      keywords: ['process', 'workflow', 'stages', 'gates', 'work'],
      action: () => navigateTo('work'),
      icon: <Compass size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'case-studies',
      title: 'Work & Evidence',
      subtitle: 'Verified system demonstrations and strict publication criteria',
      category: 'Navigation',
      keywords: ['case studies', 'evidence', 'proof', 'portfolio'],
      action: () => navigateTo('case-studies'),
      icon: <FileText size={16} color="var(--warm-white)" />,
    },
    {
      id: 'about-eulok',
      title: 'About EULOK',
      subtitle: 'Practice overview, six engineering principles, and founder leadership',
      category: 'Navigation',
      keywords: ['about', 'eugene olok', 'kampala', 'principles', 'company'],
      action: () => navigateTo('about'),
      icon: <Info size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'contact-faqs',
      title: 'Contact & Service FAQs',
      subtitle: 'Direct channels, scoping inquiry wizard & searchable FAQ documentation',
      category: 'Navigation',
      keywords: ['contact', 'whatsapp', 'email', 'faq', 'kampala'],
      action: () => navigateTo('contact'),
      icon: <Mail size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'note-deterministic-calc',
      title: 'Note: Why Financial Systems Need Deterministic Calculations',
      subtitle: 'IEEE 754 floating-point drift vs exact integer minor units',
      category: 'Engineering Notes',
      keywords: ['float', 'decimal', 'minor units', 'insights', 'rfc'],
      action: () => navigateTo('insights#deterministic-calc'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'note-idempotency-momo',
      title: 'Note: Idempotency & Duplicate Events in Mobile Money',
      subtitle: 'SHA-256 event fingerprinting for cellular webhook retries',
      category: 'Engineering Notes',
      keywords: ['idempotency', 'duplicate', 'momo', 'webhook', 'insights'],
      action: () => navigateTo('insights#idempotency-momo'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'note-human-boundaries',
      title: 'Note: Fail-Closed Boundaries & Human Approval',
      subtitle: 'Models propose, deterministic systems decide — halting high-stakes writes',
      category: 'Engineering Notes',
      keywords: ['fail closed', 'human approval', 'governance', 'ai'],
      action: () => navigateTo('insights#human-approval-boundaries'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'note-rescue-triage',
      title: 'Note: How to Rescue a Stalled Software Project',
      subtitle: 'Container reproduction & characterization tests over costly rewrites',
      category: 'Engineering Notes',
      keywords: ['rescue', 'triage', 'rewrite', 'stalled'],
      action: () => navigateTo('insights#rescue-stalled-project'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'note-deployment-vs-production',
      title: 'Note: Deployment Is Not Proof of Production Readiness',
      subtitle: 'End-to-end verification, environment variables, and smoke probes',
      category: 'Engineering Notes',
      keywords: ['deployment', 'production', 'readiness', 'smoke test'],
      action: () => navigateTo('insights#deployment-vs-production'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'note-unreliable-networks',
      title: 'Note: Unreliable Network Conditions & Constrained Devices',
      subtitle: 'Low-bandwidth 3G engineering and zero-bloat pre-rendered HTML payloads',
      category: 'Engineering Notes',
      keywords: ['bandwidth', '3g', 'offline', 'kampala', 'payload'],
      action: () => navigateTo('insights#unreliable-networks'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'verification-gates',
      title: 'Release Verification Standard',
      subtitle: 'Deterministic release verification framework and architectural criteria',
      category: 'Governance & Actions',
      keywords: ['verification', 'gates', 'quality', 'release'],
      action: () => navigateTo('verification'),
      icon: <ShieldCheck size={16} color="var(--status-pass-text)" />,
    },
    {
      id: 'standards',
      title: 'Delivery Commitments & Low-Bandwidth Standards',
      subtitle: 'Uganda cellular resilience, explicit contracts, realistic availability',
      category: 'Governance & Actions',
      keywords: ['standards', 'commitments', 'low bandwidth', 'availability'],
      action: () => navigateTo('standards'),
      icon: <FileText size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'security-rfc9116',
      title: 'Security Policy & RFC 9116',
      subtitle: 'Vulnerability disclosure and zero-secrets architecture',
      category: 'Governance & Actions',
      keywords: ['security', 'rfc 9116', 'csp', 'vulnerability'],
      action: () => navigateTo('security'),
      icon: <ShieldCheck size={16} color="var(--warm-white)" />,
    },
    {
      id: 'privacy-dppa',
      title: 'Privacy Notice (Uganda DPPA 2019)',
      subtitle: 'Section 24 statutory rights and data retention schedules',
      category: 'Governance & Actions',
      keywords: ['privacy', 'dppa', 'pdpo', 'gdpr', 'data retention'],
      action: () => navigateTo('privacy'),
      icon: <ShieldCheck size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'accessibility-wcag',
      title: 'Accessibility Statement (WCAG 2.2 AA)',
      subtitle: 'Keyboard navigation, contrast verification & 320px responsive criteria',
      category: 'Governance & Actions',
      keywords: ['accessibility', 'wcag', 'a11y', 'contrast', 'keyboard'],
      action: () => navigateTo('accessibility'),
      icon: <Eye size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Light / Dark Color Theme',
      subtitle: 'Switch interface appearance cleanly with persisted preference',
      category: 'Governance & Actions',
      keywords: ['theme', 'dark mode', 'light mode', 'appearance', 'color'],
      action: handleToggleTheme,
      icon: <Sun size={16} color="var(--status-warn-text)" />,
    },
    {
      id: 'toggle-grid',
      title: 'Toggle Blueprint Grid Background',
      subtitle: 'Toggle subtle engineering grid backdrop',
      category: 'Governance & Actions',
      keywords: ['grid', 'blueprint', 'background'],
      action: toggleGrid,
      icon: <Grid size={16} color="var(--text-muted)" />,
    },
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.subtitle.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery) ||
          (item.keywords?.some((kw) => kw.toLowerCase().includes(normalizedQuery)) ?? false)
      )
    : items;

  // Global keyboard shortcut (Cmd+K / Ctrl+K) and custom event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
    }
  }, [isOpen]);

  // Ensure keyboard selection scrolls into view
  useEffect(() => {
    optionRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleSelect = (item: PaletteItem) => {
    setIsOpen(false);
    item.action();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(1, filteredItems.length)) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="command-palette-overlay"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className="command-palette-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="command-palette-search">
          <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            aria-label="Search pages, tools, engineering notes, and actions"
            placeholder="Search pages, charts, engineering notes, or actions…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mono-kbd"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            aria-label="Close Command Palette"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div
          role="listbox"
          aria-label="Matching destinations and actions"
          className="command-palette-results"
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No matching commands, pages, or tools found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    optionRefs.current[idx] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`command-palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div className="command-palette-icon">
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: isSelected ? 'var(--warm-white)' : 'var(--text-main)', fontWeight: 600, fontSize: '0.88rem' }}>
                        {item.title}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', overflowWrap: 'break-word' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <span
                    className="mono-tag"
                    style={{
                      fontSize: '0.68rem',
                      color: isSelected ? 'var(--electric-blue)' : 'var(--text-muted)',
                      flexShrink: 0,
                      marginLeft: '10px',
                    }}
                  >
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="command-palette-footer">
          <span>Use ↑ ↓ to navigate · Enter to open · {filteredItems.length} indexed</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Command Navigation · ⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
};

