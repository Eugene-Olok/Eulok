export interface BreadcrumbItem {
  label: string;
  page?: string;
}

export const PAGE_LABEL_MAP: Record<string, string> = {
  home: 'Home',
  services: 'Services',
  'services/performance-builds': 'Performance Builds',
  'services/finance-integrations': 'Finance & EFRIS Integrations',
  'services/reconciliation': 'Deterministic Reconciliation',
  rescue: 'Software Rescue & Modernization',
  work: 'How We Work',
  'case-studies': 'Case Studies & Evidence',
  insights: 'Engineering Notes',
  verification: 'Release Verification Standard',
  'scope-calculator': 'Scoping Studio',
  status: 'System Health & Telemetry',
  about: 'About EULOK',
  contact: 'Project Intake & Contact',
  standards: 'Delivery Commitments',
  security: 'Security & RFC 9116',
  privacy: 'Privacy Notice',
  accessibility: 'Accessibility (WCAG 2.2 AA)',
  'ops-suite': 'Reconciliation Core Demo',
};

export function resolveBreadcrumbs(currentPage: string, customItems?: BreadcrumbItem[]): BreadcrumbItem[] {
  if (currentPage === 'home' && (!customItems || customItems.length === 0)) {
    return [];
  }

  if (customItems && customItems.length > 0) {
    return customItems;
  }

  const items: BreadcrumbItem[] = [{ label: 'Home', page: 'home' }];

  if (currentPage.includes('/')) {
    const parts = currentPage.split('/');
    let accumulated = '';
    for (let i = 0; i < parts.length - 1; i++) {
      accumulated += (i > 0 ? '/' : '') + parts[i];
      const label = PAGE_LABEL_MAP[accumulated] || parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
      items.push({ label, page: accumulated });
    }
  }

  const currentLabel = PAGE_LABEL_MAP[currentPage] || currentPage;
  items.push({ label: currentLabel });
  return items;
}
