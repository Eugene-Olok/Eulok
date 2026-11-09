import React from 'react';

export interface LoadingSkeletonProps {
  variant?: 'text' | 'heading' | 'card' | 'grid' | 'table' | 'hero' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 3,
  count = 1,
  className = '',
  style = {},
}) => {
  const baseShimmerStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 37%, rgba(255,255,255,0.03) 63%)',
    backgroundSize: '400% 100%',
    animation: 'skeleton-shimmer 1.4s ease infinite',
    borderRadius: '6px',
    ...style,
  };

  if (variant === 'hero') {
    return (
      <div className={`skeleton-hero-wrapper ${className}`} aria-busy="true" aria-hidden="true" style={{ width: '100%', padding: '40px 0' }}>
        <div style={{ ...baseShimmerStyle, height: '18px', width: '180px', marginBottom: '16px' }} />
        <div style={{ ...baseShimmerStyle, height: '48px', width: '70%', maxWidth: '640px', marginBottom: '20px' }} />
        <div style={{ ...baseShimmerStyle, height: '24px', width: '85%', maxWidth: '780px', marginBottom: '12px' }} />
        <div style={{ ...baseShimmerStyle, height: '24px', width: '55%', maxWidth: '520px', marginBottom: '32px' }} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ ...baseShimmerStyle, height: '42px', width: '160px', borderRadius: '8px' }} />
          <div style={{ ...baseShimmerStyle, height: '42px', width: '140px', borderRadius: '8px' }} />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`skeleton-card-wrapper card ${className}`}
        aria-busy="true"
        aria-hidden="true"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--line)',
          borderRadius: '10px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          ...style,
        }}
      >
        <div style={{ ...baseShimmerStyle, height: '14px', width: '100px' }} />
        <div style={{ ...baseShimmerStyle, height: '24px', width: '65%' }} />
        <div style={{ ...baseShimmerStyle, height: '16px', width: '100%' }} />
        <div style={{ ...baseShimmerStyle, height: '16px', width: '85%' }} />
        <div style={{ ...baseShimmerStyle, height: '36px', width: '120px', marginTop: '8px', borderRadius: '6px' }} />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`skeleton-table-wrapper table-wrapper ${className}`} aria-busy="true" aria-hidden="true">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              {[1, 2, 3, 4].map((i) => (
                <th key={i}>
                  <div style={{ ...baseShimmerStyle, height: '16px', width: '80%' }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row}>
                {[1, 2, 3, 4].map((col) => (
                  <td key={col}>
                    <div style={{ ...baseShimmerStyle, height: '14px', width: col === 1 ? '90%' : '60%' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div
        className={`skeleton-grid ${className}`}
        aria-busy="true"
        aria-hidden="true"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          width: '100%',
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <LoadingSkeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (variant === 'heading') {
    return (
      <div
        className={`skeleton-heading ${className}`}
        aria-busy="true"
        aria-hidden="true"
        style={{
          ...baseShimmerStyle,
          height: height || '32px',
          width: width || '45%',
          marginBottom: '14px',
        }}
      />
    );
  }

  return (
    <div className={`skeleton-text-group ${className}`} aria-busy="true" aria-hidden="true" style={{ width: '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            ...baseShimmerStyle,
            height: height || '16px',
            width: i === lines - 1 && !width ? '65%' : width || '100%',
            marginBottom: i < lines - 1 ? '10px' : 0,
          }}
        />
      ))}
    </div>
  );
};
