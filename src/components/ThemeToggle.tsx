import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getInitialTheme, toggleTheme, applyTheme, ThemeMode } from '../utils/themeManager';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Sync theme on client mount
    const initial = getInitialTheme();
    setTheme(initial);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: ThemeMode }>;
      if (customEvent.detail?.theme) {
        setTheme(customEvent.detail.theme);
      }
    };

    window.addEventListener('eulok:theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('eulok:theme-change', handleThemeChange);
    };
  }, []);

  const handleToggle = () => {
    const next = toggleTheme(theme);
    setTheme(next);
  };

  const isLight = mounted && theme === 'light';

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`theme-toggle-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '7px 11px',
        borderRadius: '8px',
        border: '1px solid var(--line)',
        background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
        color: 'var(--text-main)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        transition: 'all 0.15s ease',
      }}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      aria-pressed={isLight}
      title={`Current: ${isLight ? 'Light' : 'Dark'} mode · Click to switch`}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isLight ? 'rotate(15deg) scale(1.05)' : 'rotate(0deg) scale(1)',
        }}
      >
        {isLight ? (
          <Sun size={15} color="#f59e0b" style={{ flexShrink: 0 }} />
        ) : (
          <Moon size={15} color="var(--electric-blue)" style={{ flexShrink: 0 }} />
        )}
      </span>
      {showLabel && (
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
          {isLight ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
