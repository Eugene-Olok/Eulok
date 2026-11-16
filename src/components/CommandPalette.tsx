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
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Tools & Simulators' | 'Engineering Notes' | 'Governance & Actions';
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
      id: 'scoping-studio',
      title: 'Scoping Studio & Feasibility Configurator',
      subtitle: 'Model architecture, timeline, regional budget & shareable SOW permalink',
      category: 'Tools & Simulators',
      action: () => navigateTo('scope-calculator'),
      icon: <Sliders size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'reconciliation-core',
      title: 'Deterministic Reconciliation Engine Demo',
      subtitle: 'Run 8-rule integer matching engine with presets & live invariant checks',
      category: 'Tools & Simulators',
      action: () => navigateTo('ops-suite'),
      icon: <Cpu size={16} color="var(--status-pass-text)" />,
    },
    {
      id: 'rescue-triage',
      title: 'Software Rescue 8-Point Triage Scorecard',
      subtitle: 'Assess P0/P1/P2 stabilization readiness and export Markdown brief',
      category: 'Tools & Simulators',
      action: () => navigateTo('rescue#rescue-triage'),
      icon: <Terminal size={16} color="var(--status-warn-text)" />,
    },
    {
      id: 'webhook-sandbox',
      title: 'Webhook HMAC & Idempotency Replay Sandbox',
      subtitle: 'Simulate valid MTN callbacks, carrier retries, tampered HMAC & EFRIS timeouts',
      category: 'Tools & Simulators',
      action: () => navigateTo('services/finance-integrations#webhook-sandbox'),
      icon: <Webhook size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'system-status',
      title: 'Live System Status & Edge Telemetry',
      subtitle: 'Client RTT probe, component matrix, and synthetic operational checks',
      category: 'Tools & Simulators',
      action: () => navigateTo('status'),
      icon: <Activity size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'start-intake',
      title: 'Start Project Intake Scoping',
      subtitle: 'Open 4-step guided intake wizard with UGX / USD budget bracket selection',
      category: 'Tools & Simulators',
      action: () => openIntakeModal(),
      icon: <Sparkles size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'all-services',
      title: 'All Engineering Services',
      subtitle: 'Websites, financial systems, software rescue & workflow automation',
      category: 'Navigation',
      action: () => navigateTo('services'),
      icon: <Briefcase size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'performance-builds',
      title: 'Websites & Performance Builds',
      subtitle: 'Low-bandwidth Astro builds engineered for East African cellular networks',
      category: 'Navigation',
      action: () => navigateTo('services/performance-builds'),
      icon: <Layers size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'finance-integrations',
      title: 'Finance & URA EFRIS Integrations',
      subtitle: 'Mobile money webhooks, electronic fiscalization, and bank APIs',
      category: 'Navigation',
      action: () => navigateTo('services/finance-integrations'),
      icon: <Layers size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'payment-reconciliation',
      title: 'Payment Reconciliation Systems',
      subtitle: 'Multi-rail MTN, Airtel & bank ledger reconciliation with audit trails',
      category: 'Navigation',
      action: () => navigateTo('services/reconciliation'),
      icon: <Cpu size={16} color="var(--status-pass-text)" />,
    },
    {
      id: 'software-rescue',
      title: 'Software Rescue & Modernization',
      subtitle: 'Stabilize failing codebases, restore test suites, fix tech debt',
      category: 'Navigation',
      action: () => navigateTo('rescue'),
      icon: <Terminal size={16} color="var(--status-warn-text)" />,
    },
    {
      id: 'case-studies',
      title: 'Work & Evidence',
      subtitle: 'Verified system demonstrations and strict publication criteria',
      category: 'Navigation',
      action: () => navigateTo('case-studies'),
      icon: <FileText size={16} color="var(--warm-white)" />,
    },
    {
      id: 'note-deterministic-calc',
      title: 'Note: Why Financial Systems Need Deterministic Calculations',
      subtitle: 'IEEE 754 floating-point drift vs exact integer minor units',
      category: 'Engineering Notes',
      action: () => navigateTo('insights#deterministic-calc'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'note-idempotency-momo',
      title: 'Note: Idempotency & Duplicate Events in Mobile Money',
      subtitle: 'SHA-256 event fingerprinting for cellular webhook retries',
      category: 'Engineering Notes',
      action: () => navigateTo('insights#idempotency-momo'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'note-human-boundaries',
      title: 'Note: Fail-Closed Boundaries & Human Approval',
      subtitle: 'Models propose, deterministic systems decide — halting high-stakes writes',
      category: 'Engineering Notes',
      action: () => navigateTo('insights#human-approval-boundaries'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'note-rescue-triage',
      title: 'Note: How to Rescue a Stalled Software Project',
      subtitle: 'Container reproduction & characterization tests over costly rewrites',
      category: 'Engineering Notes',
      action: () => navigateTo('insights#rescue-stalled-project'),
      icon: <BookOpen size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'verification-gates',
      title: 'Release Verification Standard',
      subtitle: 'Deterministic release verification framework and architectural criteria',
      category: 'Governance & Actions',
      action: () => navigateTo('verification'),
      icon: <ShieldCheck size={16} color="var(--status-pass-text)" />,
    },
    {
      id: 'standards',
      title: 'Delivery Commitments & Low-Bandwidth Standards',
      subtitle: 'Uganda cellular resilience, explicit contracts, no 99.99% spin',
      category: 'Governance & Actions',
      action: () => navigateTo('standards'),
      icon: <FileText size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'security-rfc9116',
      title: 'Security Policy & RFC 9116',
      subtitle: 'Vulnerability disclosure and zero-secrets architecture',
      category: 'Governance & Actions',
      action: () => navigateTo('security'),
      icon: <ShieldCheck size={16} color="var(--warm-white)" />,
    },
    {
      id: 'privacy-dppa',
      title: 'Privacy Notice (Uganda DPPA 2019)',
      subtitle: 'Section 24 statutory rights and data retention schedules',
      category: 'Governance & Actions',
      action: () => navigateTo('privacy'),
      icon: <ShieldCheck size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Light / Dark Color Theme',
      subtitle: 'Switch interface appearance cleanly with persisted preference',
      category: 'Governance & Actions',
      action: handleToggleTheme,
      icon: <Sun size={16} color="var(--status-warn-text)" />,
    },
    {
      id: 'toggle-grid',
      title: 'Toggle Blueprint Grid Background',
      subtitle: 'Toggle subtle engineering grid backdrop',
      category: 'Governance & Actions',
      action: toggleGrid,
      icon: <Grid size={16} color="var(--text-muted)" />,
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Global Keyboard shortcut and custom event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
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
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
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
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
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
      className="modal-overlay"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 7, 10, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(40px, 12vh, 100px) 16px 24px',
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--line-strong)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '12px',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            gap: '12px',
          }}
        >
          <Search size={18} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            aria-label="Search pages, tools, engineering notes, and actions"
            placeholder="Search tools, services, engineering notes, or actions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--warm-white)',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mono-tag"
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
            }}
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div
          role="listbox"
          aria-label="Matching destinations and actions"
          style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No matching commands, notes, or tools found.
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
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(56, 189, 248, 0.10)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(56, 189, 248, 0.35)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'var(--bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--line)',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: isSelected ? 'var(--warm-white)' : 'var(--text-subtle)', fontWeight: 600, fontSize: '0.88rem' }}>
                        {item.title}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', overflowWrap: 'break-word' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="mono-tag" style={{ fontSize: '0.68rem', color: isSelected ? 'var(--electric-blue)' : 'var(--text-muted)', flexShrink: 0, marginLeft: '10px' }}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '10px 18px',
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>Use ↑ ↓ to navigate · Enter to open</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Command Navigation · ⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
};
