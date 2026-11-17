import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LiveFinOpsTrendsSection } from './LiveFinOpsTrendsSection';

describe('LiveFinOpsTrendsSection — Grounded Search & Honest Diagnostics', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/insights');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('renders grounded trends, citation links, cache/latency metadata, and clickable query drill-downs', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          cached: false,
          latencyMs: 642,
          topic: 'all',
          generatedAt: '2026-11-17T04:00:00.000Z',
          model: 'gemini-4-hydrogen',
          briefingSummary: 'Real-time payment rails across East Africa prioritize deterministic settlement.',
          trends: [
            {
              title: 'Instant Mobile Money Reconciliation APIs Tighten Latency SLAs',
              category: 'Payment Rails',
              publishedWindow: 'Nov 2026',
              summary: 'Regional aggregators enforce sub-3s webhook acknowledgements.',
              engineeringTakeaway: 'Persist atomic idempotency keys prior to ledger mutation.',
              impactLevel: 'HIGH',
            },
          ],
          sources: [
            {
              title: 'Bank of Uganda NPS Oversight',
              url: 'https://www.bou.or.ug/nps',
              domain: 'bou.or.ug',
            },
          ],
          searchQueries: ['East Africa payment rail settlement 2026'],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    globalThis.fetch = fetchMock;

    render(<LiveFinOpsTrendsSection />);

    expect(screen.getByTestId('trends-loading-panel')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('trends-success-panel')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Instant Mobile Money Reconciliation APIs Tighten Latency SLAs/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/642ms/i)).toBeInTheDocument();
    expect(screen.getByText(/Live web query/i)).toBeInTheDocument();

    const citationLink = screen.getByRole('link', { name: /Bank of Uganda NPS Oversight/i });
    expect(citationLink).toHaveAttribute('href', 'https://www.bou.or.ug/nps');

    // Click returned grounding search query pill triggers targeted query
    const queryChip = screen.getByRole('button', {
      name: 'East Africa payment rail settlement 2026',
    });
    fireEvent.click(queryChip);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    const lastCallBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(lastCallBody.query).toBe('East Africa payment rail settlement 2026');
  });

  it('displays honest Settings > Secrets error state without synthetic news and bridges to local Engineering Notes', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          code: 'MISSING_API_KEY',
          error:
            'Server search grounding is unavailable because GEMINI_API_KEY is still set to the workspace placeholder.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const onFilterLocalNotes = vi.fn();
    render(<LiveFinOpsTrendsSection onFilterLocalNotes={onFilterLocalNotes} />);

    await waitFor(() => {
      expect(screen.getByTestId('trends-error-panel')).toBeInTheDocument();
    });

    expect(screen.getByText(/MISSING_API_KEY/i)).toBeInTheDocument();
    expect(screen.getByText(/Settings > Secrets/i)).toBeInTheDocument();

    const filterInput = screen.getByLabelText(/Focus search query/i);
    fireEvent.change(filterInput, { target: { value: 'idempotency' } });

    const localBridgeBtn = screen.getByTestId('filter-local-notes-btn');
    fireEvent.click(localBridgeBtn);
    expect(onFilterLocalNotes).toHaveBeenCalledWith('idempotency');
  });
});
