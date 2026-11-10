import React, { useState, useEffect, useRef } from 'react';
import { navigateTo, openIntakeModal } from '../utils/navigation';
import {
  Search,
  Command,
  ArrowRight,
  Sparkles,
  Sliders,
  Activity,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Terminal,
  Grid,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Tools & Simulators' | 'Governance & RFC';
  action: () => void;
  icon: React.ReactNode;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleGrid = () => {
    document.body.classList.toggle('no-grid');
  };

  const items: PaletteItem[] = [
    {
      id: 'scoping-studio',
      title: 'Scoping Studio & Feasibility Configurator',
      subtitle: 'Model architecture, calculate timeline, and export signed SOW',
      category: 'Tools & Simulators',
      action: () => navigateTo('scope-calculator'),
      icon: <Sliders size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'reconciliation-core',
      title: 'Interactive Reconciliation Playground',
      subtitle: 'Run 8-rule deterministic matching engine with live test vectors',
      category: 'Tools & Simulators',
      action: () => navigateTo('ops-suite'),
      icon: <Cpu size={16} color="#4ade80" />,
    },
    {
      id: 'system-status',
      title: 'Live System Status & Edge Telemetry',
      subtitle: 'Real-time client latency probe, component matrix, and uptime',
      category: 'Tools & Simulators',
      action: () => navigateTo('status'),
      icon: <Activity size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'verification-gates',
      title: 'Release Verification Standard',
      subtitle: 'Deterministic release verification framework and architectural criteria',
      category: 'Governance & RFC',
      action: () => navigateTo('verification'),
      icon: <ShieldCheck size={16} color="#4ade80" />,
    },
    {
      id: 'start-intake',
      title: 'Start Project Intake Scoping',
      subtitle: 'Open 4-step guided intake wizard with reference generator',
      category: 'Tools & Simulators',
      action: () => openIntakeModal(),
      icon: <Sparkles size={16} color="var(--electric-blue)" />,
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
      id: 'software-rescue',
      title: 'Software Rescue & Modernization',
      subtitle: 'Stabilize failing codebases, restore test suites, fix tech debt',
      category: 'Navigation',
      action: () => navigateTo('rescue'),
      icon: <Terminal size={16} color="#fbbf24" />,
    },
    {
      id: 'standards',
      title: 'Delivery Commitments & Low-Bandwidth Standards',
      subtitle: 'Uganda cellular resilience, explicit contracts, no 99.99% spin',
      category: 'Governance & RFC',
      action: () => navigateTo('standards'),
      icon: <FileText size={16} color="var(--electric-blue)" />,
    },
    {
      id: 'security-rfc9116',
      title: 'Security Policy & RFC 9116',
      subtitle: 'Vulnerability disclosure and zero-secrets architecture',
      category: 'Governance & RFC',
      action: () => navigateTo('security'),
      icon: <ShieldCheck size={16} color="var(--warm-white)" />,
    },
    {
      id: 'privacy-dppa',
      title: 'Privacy Notice (Uganda DPPA 2019)',
      subtitle: 'Section 24 statutory rights and data retention schedules',
      category: 'Governance & RFC',
      action: () => navigateTo('privacy'),
      icon: <ShieldCheck size={16} color="var(--accent-blue)" />,
    },
    {
      id: 'toggle-grid',
      title: 'Toggle Blueprint Grid Background',
      subtitle: 'Toggle engineering background grid overlay',
      category: 'Tools & Simulators',
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
      // Check Cmd+K or Ctrl+K
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
          maxWidth: '620px',
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
            placeholder="Type a command, tool, or service..."
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
          <span className="mono-tag" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No matching commands or pages found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(56, 189, 248, 0.3)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ color: isSelected ? 'var(--warm-white)' : 'var(--text-subtle)', fontWeight: 600, fontSize: '0.88rem' }}>
                        {item.title}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="mono-tag" style={{ fontSize: '0.7rem', color: isSelected ? 'var(--electric-blue)' : 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                    {item.category}
                  </span>
                </div>
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
          <span>Use ↑ ↓ to navigate, Enter to select</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>EULOK HUD · FAANG Grade</span>
        </div>
      </div>
    </div>
  );
};
