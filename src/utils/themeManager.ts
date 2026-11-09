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
  '--surface-elevated': string;
  '--text-main': string;
  '--text-subtle': string;
  '--text-muted': string;
  '--line': string;
  '--line-strong': string;
  '--warm-white': string;
  '--electric-blue': string;
}

export const LIGHT_THEME_VARIABLES: ThemeVariables = {
  '--bg-primary': '#f8fafc',
  '--bg-secondary': '#f1f5f9',
  '--bg-card': '#ffffff',
  '--surface-elevated': '#ffffff',
  '--text-main': '#090e17',
  '--text-subtle': '#334155',
  '--text-muted': '#64748b',
  '--line': 'rgba(0, 0, 0, 0.12)',
  '--line-strong': 'rgba(0, 0, 0, 0.22)',
  '--warm-white': '#090e17',
  '--electric-blue': '#0284c7',
};

export const DARK_THEME_VARIABLES: ThemeVariables = {
  '--bg-primary': '#090E17',
  '--bg-secondary': '#101928',
  '--bg-card': '#142034',
  '--surface-elevated': '#1a2a44',
  '--text-main': '#F3F1EC',
  '--text-subtle': '#cbd5e1',
  '--text-muted': '#8899ac',
  '--line': 'rgba(255, 255, 255, 0.12)',
  '--line-strong': 'rgba(255, 255, 255, 0.22)',
  '--warm-white': '#F3F1EC',
  '--electric-blue': '#38bdf8',
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
