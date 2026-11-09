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
  if (route in ROUTE_PATH_MAP) return ROUTE_PATH_MAP[route];
  if (route.startsWith('/')) return route;
  return `/${route}`;
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

export function openIntakeModal(serviceOrEvent?: unknown) {
  const service = typeof serviceOrEvent === 'string' ? serviceOrEvent : undefined;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('eulok:open-intake', {
        detail: { service },
      })
    );
  }
}

export function openCommandPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  }
}
