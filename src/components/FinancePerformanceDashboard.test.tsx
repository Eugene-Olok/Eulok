import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FinancePerformanceDashboard } from './FinancePerformanceDashboard';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({
      children,
      height = 270,
    }: {
      children: React.ReactElement<{ width?: number; height?: number }>;
      height?: number;
    }) => (
      <div style={{ width: 800, height }}>
        {React.isValidElement(children)
          ? React.cloneElement(children, { width: 800, height: typeof height === 'number' ? height : 270 })
          : children}
      </div>
    ),
  };
});

describe('FinancePerformanceDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders throughput KPIs and the 30-day historical success rate line chart container with Recharts SVG', async () => {
    render(<FinancePerformanceDashboard />);

    expect(screen.getByText(/Transaction Throughput & Error Rate Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Historical Transaction Success Rate \(Last 30 Days\)/i)).toBeInTheDocument();

    const chartContainer = screen.getByTestId('success-rate-30d-chart-container');
    await waitFor(() => {
      const svg = chartContainer.querySelector('svg');
      expect(svg).not.toBeNull();
    });

    expect(screen.getByTestId('history-30d-avg-badge')).toHaveTextContent(/30D Avg:/);
    expect(screen.getByTestId('history-30d-sla-badge')).toHaveTextContent(/Days ≥ 99\.5% SLA/);
    expect(screen.getByTestId('history-30d-delta-badge')).toHaveTextContent(/15D Delta/);
  });

  it('updates 30-day historical average and SLA metrics when load profile or payment rail changes', async () => {
    render(<FinancePerformanceDashboard />);

    const avgBadge = screen.getByTestId('history-30d-avg-badge');
    const initialAvgText = avgBadge.textContent;

    fireEvent.click(screen.getByRole('button', { name: 'Carrier Jitter & Retries' }));

    await waitFor(() => {
      expect(avgBadge.textContent).not.toBe(initialAvgText);
    });

    fireEvent.click(screen.getByRole('button', { name: 'URA EFRIS' }));
    await waitFor(() => {
      expect(screen.getByTestId('history-30d-avg-badge').textContent).toMatch(/\d+\.\d{2}%/);
    });
  });
});
