export interface IntakePrefillContext {
  need?: string;
  systemType?: string;
  budget?: string;
  problemDescription?: string;
  attemptedSolutions?: string;
  specHash?: string;
  specSummary?: string;
  preferredCurrency?: 'UGX' | 'USD';
}

export const INTAKE_PREFILL_STORAGE_KEY = 'eulok:intake_prefill';

export const ROUTE_PATH_MAP: Record<string, string> = {
  home: '/',
  services: '/services',
  'services/performance-builds': '/services/performance-builds',
  'services/finance-integrations': '/services/finance-integrations',
  'services/reconciliation': '/services/reconciliation',
  rescue: '/rescue',
  work: '/work',
  'case-studies': '/case-studies',
  insights: '/insights',
  verification: '/verification',
  about: '/about',
  contact: '/contact',
  standards: '/standards',
  security: '/security',
  privacy: '/privacy',
  accessibility: '/accessibility',
  'ops-suite': '/ops-suite',
  'scope-calculator': '/scope-calculator',
  status: '/status',
};

export function routeToPath(route: string): string {
  if (!route || route === 'home') return '/';
  const [baseRoute, hash] = route.split('#');
  const resolved = baseRoute in ROUTE_PATH_MAP ? ROUTE_PATH_MAP[baseRoute] : baseRoute.startsWith('/') ? baseRoute : `/${baseRoute}`;
  return hash ? `${resolved}#${hash}` : resolved;
}

export function pathToRoute(pathname: string): string {
  const clean = pathname.replace(/\/$/, '') || '/';
  for (const [route, mappedPath] of Object.entries(ROUTE_PATH_MAP)) {
    if (clean === mappedPath) return route;
  }
  return clean.replace(/^\//, '') || 'home';
}

export function navigateTo(route: string) {
  const path = routeToPath(route);
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
}

export function readStoredIntakePrefill(): IntakePrefillContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(INTAKE_PREFILL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as IntakePrefillContext) : null;
  } catch {
    return null;
  }
}

export function clearStoredIntakePrefill(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(INTAKE_PREFILL_STORAGE_KEY);
  } catch {
    // Ignore storage access errors in private contexts
  }
}

export function openIntakeModal(serviceOrContext?: unknown) {
  let detail: IntakePrefillContext = {};
  if (typeof serviceOrContext === 'string') {
    detail = { systemType: serviceOrContext };
  } else if (
    serviceOrContext &&
    typeof serviceOrContext === 'object' &&
    !('nativeEvent' in serviceOrContext) &&
    !('currentTarget' in serviceOrContext)
  ) {
    detail = serviceOrContext as IntakePrefillContext;
  }

  if (typeof window !== 'undefined') {
    if (Object.keys(detail).length > 0) {
      try {
        window.sessionStorage.setItem(INTAKE_PREFILL_STORAGE_KEY, JSON.stringify(detail));
      } catch {
        // Non-blocking storage fallback
      }
    }
    window.dispatchEvent(
      new CustomEvent('eulok:open-intake', {
        detail,
      })
    );
  }
}

export function openCommandPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  }
}
