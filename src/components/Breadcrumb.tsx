import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { navigateTo } from '../utils/navigation';

import {
  BreadcrumbItem,
  PAGE_LABEL_MAP,
  resolveBreadcrumbs,
} from './breadcrumbNavigation';

export type { BreadcrumbItem };
export { PAGE_LABEL_MAP, resolveBreadcrumbs };

interface BreadcrumbProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  customItems?: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentPage = 'home',
  onNavigate = navigateTo,
  customItems,
}) => {
  const items = resolveBreadcrumbs(currentPage, customItems);

  // If at home and no custom items provided, breadcrumbs are not needed
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="container-expansive breadcrumb-nav" aria-label="Breadcrumb" style={{ padding: '16px 0 0' }}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.86rem',
          lineHeight: 1.5,
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {index > 0 && (
                <span className="breadcrumb-sep" aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
                  /
                </span>
              )}

              {isLast || !item.page ? (
                <span
                  className="breadcrumb-current"
                  aria-current="page"
                  style={{ color: 'var(--warm-white)', fontWeight: 600 }}
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(item.page!)}
                  className="breadcrumb-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--electric-blue)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                >
                  {item.page === 'home' && (
                    <Home size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  )}
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
