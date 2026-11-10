import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Sliders,
  Activity,
  Search,
  MessageSquare,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { openCommandPalette } from '../utils/navigation';

export interface MobileSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  badge?: string;
}

const PRIMARY_ITEMS: NavItem[] = [
  { id: 'services', label: 'Services Overview', path: '/services' },
  { id: 'rescue', label: 'Rescue Software', path: '/rescue', badge: 'High Priority' },
  { id: 'work', label: 'How We Work', path: '/work' },
  { id: 'case-studies', label: 'Work & Evidence', path: '/case-studies' },
  { id: 'insights', label: 'Engineering Notes', path: '/insights' },
  { id: 'about', label: 'About EULOK', path: '/about' },
];

const TOOLS_ITEMS = [
  {
    id: 'ops-suite',
    label: 'Reconciliation Demo',
    path: '/ops-suite',
    desc: 'Ledger & mobile money match simulation',
    icon: Terminal,
    color: 'var(--electric-blue)',
    tag: 'Live Engine',
  },
  {
    id: 'scope-calculator',
    label: 'Scoping Studio (SOW)',
    path: '/scope-calculator',
    desc: 'Deterministic feasibility & milestone estimator',
    icon: Sliders,
    color: '#fbbf24',
    tag: 'Interactive',
  },
  {
    id: 'verification',
    label: 'Release Verification Standard',
    path: '/verification',
    desc: 'Deterministic release verification & acceptance criteria',
    icon: CheckCircle2,
    color: '#4ade80',
    tag: 'Standard',
  },
  {
    id: 'status',
    label: 'Live Edge Telemetry',
    path: '/status',
    desc: 'Real-time client latency & edge infrastructure topology',
    icon: Activity,
    color: '#38bdf8',
    tag: 'Live',
  },
];

export const MobileSlideOver: React.FC<MobileSlideOverProps> = ({
  isOpen,
  onClose,
  currentPage = 'home',
  onNavigate,
  onOpenIntakeModal,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent background scrolling when open & handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open for a11y
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  const handleLinkClick = (pageId: string) => {
    onClose();
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  const handleStartProject = () => {
    onClose();
    if (onOpenIntakeModal) {
      onOpenIntakeModal();
    }
  };

  const handleOpenSearch = () => {
    onClose();
    openCommandPalette();
  };

  const isCurrentActive = (id: string) => {
    if (id === 'services' && currentPage.startsWith('services')) return true;
    return currentPage === id;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="slideover-root"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation drawer"
        >
          {/* Backdrop with fade animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="slideover-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel with slide animation from right */}
          <motion.aside
            initial={{ x: '100%', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
            animate={{
              x: 0,
              boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.45)',
            }}
            exit={{ x: '100%', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="slideover-panel"
          >
            {/* SlideOver Header */}
            <div className="slideover-header">
              <a
                href="/"
                className="brand-wordmark"
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    handleLinkClick('home');
                  }
                }}
              >
                <span>EULOK</span>
                <span className="brand-badge">ENG</span>
              </a>

              <button
                ref={closeButtonRef}
                type="button"
                className="slideover-close-btn"
                onClick={onClose}
                aria-label="Close navigation menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick HUD Search trigger */}
            <div className="slideover-search-wrap">
              <button
                type="button"
                className="slideover-search-btn"
                onClick={handleOpenSearch}
                aria-label="Search pages and services"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={15} color="var(--electric-blue)" />
                  <span>Search site or press ⌘K</span>
                </div>
                <kbd className="mono-kbd">⌘K</kbd>
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="slideover-content">
              {/* Section: Main Navigation */}
              <div className="slideover-section">
                <div className="slideover-section-label">Main Navigation</div>
                <nav className="slideover-nav" aria-label="Mobile main links">
                  <a
                    href="/"
                    className={`slideover-link ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        handleLinkClick('home');
                      }
                    }}
                  >
                    <span>Home</span>
                    <ChevronRight size={14} className="slideover-chevron" />
                  </a>

                  {PRIMARY_ITEMS.map((item) => {
                    const active = isCurrentActive(item.id);
                    return (
                      <a
                        key={item.id}
                        href={item.path}
                        className={`slideover-link ${active ? 'active' : ''}`}
                        onClick={(e) => {
                          if (onNavigate) {
                            e.preventDefault();
                            handleLinkClick(item.id);
                          }
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="badge badge-accent" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                              {item.badge}
                            </span>
                          )}
                        </span>
                        <ChevronRight size={14} className="slideover-chevron" />
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Section: Interactive Tools & Gates */}
              <div className="slideover-section">
                <div className="slideover-section-label">Interactive Tools & Verification Gates</div>
                <div className="slideover-tools-grid">
                  {TOOLS_ITEMS.map((tool) => {
                    const Icon = tool.icon;
                    const active = currentPage === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        className={`slideover-tool-card ${active ? 'active' : ''}`}
                        onClick={() => handleLinkClick(tool.id)}
                      >
                        <div className="slideover-tool-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon size={16} color={tool.color} />
                            <span className="slideover-tool-title">{tool.label}</span>
                          </div>
                          <span className="mono-tag" style={{ fontSize: '0.64rem', padding: '1px 5px' }}>
                            {tool.tag}
                          </span>
                        </div>
                        <div className="slideover-tool-desc">{tool.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section: Institutional & Security */}
              <div className="slideover-section">
                <div className="slideover-section-label">Institutional Standards</div>
                <div className="slideover-sublinks">
                  <a
                    href="/contact"
                    className="slideover-sublink"
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        handleLinkClick('contact');
                      }
                    }}
                  >
                    Contact & Technical FAQ
                  </a>
                  <a
                    href="/standards"
                    className="slideover-sublink"
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        handleLinkClick('standards');
                      }
                    }}
                  >
                    Delivery Commitments
                  </a>
                  <a
                    href="/security"
                    className="slideover-sublink"
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        handleLinkClick('security');
                      }
                    }}
                  >
                    Security & RFC 9116
                  </a>
                  <a
                    href="/privacy"
                    className="slideover-sublink"
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        handleLinkClick('privacy');
                      }
                    }}
                  >
                    Privacy Notice
                  </a>
                </div>
              </div>
            </div>

            {/* SlideOver Footer */}
            <div className="slideover-footer">
              <div className="slideover-footer-actions">
                <ThemeToggle showLabel className="slideover-theme-toggle" />
                <a
                  href="https://wa.me/256760779160?text=Hello%20EULOK%2C%20I%20would%20like%20to%20discuss%20a%20software%20engineering%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-quiet button-small"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={14} color="#25D366" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                className="button button-primary w-full"
                onClick={handleStartProject}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  fontWeight: 600,
                  fontSize: '0.94rem',
                }}
              >
                <span>Start a project</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
