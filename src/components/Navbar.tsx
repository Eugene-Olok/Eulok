import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Search,
  ChevronDown,
  Sliders,
  Activity,
  Layers,
  Shield,
} from 'lucide-react';
import { routeToPath, navigateTo, openIntakeModal, openCommandPalette } from '../utils/navigation';
import { ThemeToggle } from './ThemeToggle';
import { MobileSlideOver } from './MobileSlideOver';

interface NavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  matchPrefix?: boolean;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'services', label: 'Services', path: '/services', matchPrefix: true },
  { id: 'rescue', label: 'Rescue Software', path: '/rescue' },
  { id: 'work', label: 'How We Work', path: '/work' },
  { id: 'case-studies', label: 'Work & Evidence', path: '/case-studies' },
  { id: 'insights', label: 'Engineering Notes', path: '/insights' },
  { id: 'about', label: 'About', path: '/about' },
];

const TOOLS_PAGES = ['ops-suite', 'scope-calculator', 'verification', 'status'];

export const Navbar: React.FC<NavbarProps> = ({
  currentPage = 'home',
  onNavigate,
  onOpenIntakeModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isToolsActive = TOOLS_PAGES.includes(currentPage);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setToolsDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavClick = (page: string) => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    if (onNavigate) {
      onNavigate(page);
    } else {
      navigateTo(page);
    }
  };

  const handleIntakeClick = () => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    if (onOpenIntakeModal) {
      onOpenIntakeModal();
    } else {
      openIntakeModal();
    }
  };

  const isItemActive = (item: NavItem) => {
    if (item.matchPrefix) {
      return currentPage.startsWith(item.id);
    }
    return currentPage === item.id;
  };

  return (
    <header className="site-header">
      <div className="container-expansive">
        <div className="nav-container">
          {/* Brand Wordmark */}
          <a
            href="/"
            className="brand-wordmark"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                handleNavClick('home');
              }
            }}
            aria-label="EULOK Home"
          >
            <span>EULOK</span>
            <span className="brand-badge">ENG</span>
          </a>

          {/* Desktop Navigation Links with Framer Motion layoutId Underline */}
          <nav className="nav-links-desktop" aria-label="Main navigation">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              return (
                <div key={item.id} className="nav-link-wrapper">
                  <a
                    href={item.path}
                    className={`nav-item-btn ${active ? 'active' : ''}`}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        handleNavClick(item.id);
                      }
                    }}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <motion.span
                        layoutId="navbar-sliding-underline"
                        className="nav-sliding-underline"
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </a>
                </div>
              );
            })}

            {/* Interactive Tools & Gates Dropdown */}
            <div className="nav-dropdown-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className={`nav-item-btn ${isToolsActive ? 'active' : ''}`}
                onClick={() => setToolsDropdownOpen((prev) => !prev)}
                onMouseEnter={() => setToolsDropdownOpen(true)}
                aria-expanded={toolsDropdownOpen}
                aria-haspopup="true"
                aria-label="Tools and Verification Gates menu"
              >
                <span>Tools & Gates</span>
                <ChevronDown
                  size={13}
                  style={{
                    transform: toolsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
                {isToolsActive && (
                  <motion.span
                    layoutId="navbar-sliding-underline"
                    className="nav-sliding-underline"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </button>

              <AnimatePresence>
                {toolsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="nav-dropdown-menu"
                    onMouseLeave={() => setToolsDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      className="nav-dropdown-item"
                      onClick={() => handleNavClick('ops-suite')}
                    >
                      <Terminal size={17} color="var(--electric-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div className="nav-dropdown-item-title">
                          <span>Reconciliation Demo</span>
                          <span className="mono-tag" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>Live Engine</span>
                        </div>
                        <div className="nav-dropdown-item-desc">
                          Interactive mobile-money & bank ledger matching simulation.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="nav-dropdown-item"
                      onClick={() => handleNavClick('scope-calculator')}
                    >
                      <Sliders size={17} color="#fbbf24" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div className="nav-dropdown-item-title">
                          <span>Scoping Studio (SOW)</span>
                          <span className="mono-tag" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>Interactive</span>
                        </div>
                        <div className="nav-dropdown-item-desc">
                          Technical feasibility, risk scoring & milestone estimator.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="nav-dropdown-item"
                      onClick={() => handleNavClick('verification')}
                    >
                      <CheckCircle2 size={17} color="#4ade80" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div className="nav-dropdown-item-title">
                          <span>Release Verification Standard</span>
                          <span className="mono-tag" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>Standard</span>
                        </div>
                        <div className="nav-dropdown-item-desc">
                          Deterministic release verification & architectural acceptance criteria.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="nav-dropdown-item"
                      onClick={() => handleNavClick('status')}
                    >
                      <Activity size={17} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div className="nav-dropdown-item-title">
                          <span>Edge Telemetry</span>
                          <span className="mono-tag" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>Live</span>
                        </div>
                        <div className="nav-dropdown-item-desc">
                          Real-time client latency & edge infrastructure topology.
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Action Cluster: Search HUD, ThemeToggle, and Primary CTA */}
          <div className="nav-action-cluster">
            {/* Command Palette HUD Trigger */}
            <button
              type="button"
              className="button button-quiet button-small"
              onClick={() => openCommandPalette()}
              title="Open Command Palette (Cmd+K)"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px' }}
              aria-label="Open HUD Search (Cmd+K)"
            >
              <Search size={13} color="var(--text-muted)" />
              <span className="mono-tag" style={{ fontSize: '0.72rem', padding: '1px 5px', margin: 0 }}>⌘K</span>
            </button>

            {/* Theme Toggle (Dark/Light) */}
            <ThemeToggle />

            {/* Dominant CTA */}
            <button
              type="button"
              className="button button-primary button-small"
              onClick={handleIntakeClick}
            >
              <span>Start a project</span>
              <ArrowRight size={14} />
            </button>

            {/* Mobile Navigation Toggle Button */}
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open mobile navigation menu"
            >
              <Menu size={18} />
              <span>Menu</span>
            </button>
          </div>
        </div>

        {/* Dedicated Framer Motion Animated SlideOver Drawer */}
        <MobileSlideOver
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentPage={currentPage}
          onNavigate={handleNavClick}
          onOpenIntakeModal={handleIntakeClick}
        />
      </div>
    </header>
  );
};
