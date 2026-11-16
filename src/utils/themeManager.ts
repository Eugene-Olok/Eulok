/**
 * EULOK Theme Manager
 * Deterministic dark and light mode management with localStorage persistence
 * and dynamic CSS variable application.
 */

export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'eulok_theme';

export interface ThemeVariables {
  '--bg-primary': string;
  '--bg-secondary': string;
  '--bg-card': string;
  '--bg-card-hover': string;
  '--surface-elevated': string;
  '--text-main': string;
  '--text-subtle': string;
  '--text-muted': string;
  '--line': string;
  '--line-strong': string;
  '--warm-white': string;
  '--accent-blue': string;
  '--electric-blue': string;
  '--status-pass-bg': string;
  '--status-pass-text': string;
  '--status-pass-border': string;
  '--status-warn-bg': string;
  '--status-warn-text': string;
  '--status-warn-border': string;
  '--status-fail-bg': string;
  '--status-fail-text': string;
  '--status-fail-border': string;
}

export const LIGHT_THEME_VARIABLES: ThemeVariables = {
  '--bg-primary': '#f8fafc',
  '--bg-secondary': '#f1f5f9',
  '--bg-card': '#ffffff',
  '--bg-card-hover': '#f8fafc',
  '--surface-elevated': '#ffffff',
  '--text-main': '#0f172a',
  '--text-subtle': '#334155',
  '--text-muted': '#475569',
  '--line': 'rgba(15, 23, 42, 0.11)',
  '--line-strong': 'rgba(15, 23, 42, 0.22)',
  '--warm-white': '#0f172a',
  '--accent-blue': '#0369a1',
  '--electric-blue': '#0284c7',
  '--status-pass-bg': 'rgba(22, 163, 74, 0.10)',
  '--status-pass-text': '#15803d',
  '--status-pass-border': 'rgba(22, 163, 74, 0.28)',
  '--status-warn-bg': 'rgba(217, 119, 6, 0.10)',
  '--status-warn-text': '#b45309',
  '--status-warn-border': 'rgba(217, 119, 6, 0.28)',
  '--status-fail-bg': 'rgba(220, 38, 38, 0.10)',
  '--status-fail-text': '#b91c1c',
  '--status-fail-border': 'rgba(220, 38, 38, 0.28)',
};

export const DARK_THEME_VARIABLES: ThemeVariables = {
  '--bg-primary': '#090D16',
  '--bg-secondary': '#0F1623',
  '--bg-card': '#131D2E',
  '--bg-card-hover': '#18253A',
  '--surface-elevated': '#1B2A42',
  '--text-main': '#F4F5F7',
  '--text-subtle': '#CBD5E1',
  '--text-muted': '#94A3B8',
  '--line': 'rgba(255, 255, 255, 0.10)',
  '--line-strong': 'rgba(255, 255, 255, 0.20)',
  '--warm-white': '#F4F5F7',
  '--accent-blue': '#60A5FA',
  '--electric-blue': '#38BDF8',
  '--status-pass-bg': 'rgba(34, 197, 94, 0.14)',
  '--status-pass-text': '#4ADE80',
  '--status-pass-border': 'rgba(34, 197, 94, 0.35)',
  '--status-warn-bg': 'rgba(245, 158, 11, 0.14)',
  '--status-warn-text': '#FBBF24',
  '--status-warn-border': 'rgba(245, 158, 11, 0.35)',
  '--status-fail-bg': 'rgba(239, 68, 68, 0.14)',
  '--status-fail-text': '#F87171',
  '--status-fail-border': 'rgba(239, 68, 68, 0.35)',
};

/**
 * Resolve the current active theme from storage or system preferences.
 */
export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (err) {
    // Graceful fallback on restricted sandboxes
  }

  return 'dark';
}

/**
 * Apply theme to document root, updating data-theme attribute and CSS variables dynamically.
 */
export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-theme', theme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    // Ignore storage errors in privacy modes
  }

  const vars = theme === 'light' ? LIGHT_THEME_VARIABLES : DARK_THEME_VARIABLES;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'light' ? '#f8fafc' : '#090D16');
  }

  // Dispatch custom event for synchronized components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('eulok:theme-change', { detail: { theme } }));
  }
}

/**
 * Toggle between dark and light modes.
 */
export function toggleTheme(currentTheme: ThemeMode): ThemeMode {
  const nextTheme: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  return nextTheme;
}
