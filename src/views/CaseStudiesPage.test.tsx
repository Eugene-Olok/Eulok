import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaseStudiesPage } from './CaseStudiesPage';

describe('CaseStudiesPage — Genuine Work & Evidence Category Filtering', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/case-studies');
  });

  it('synchronously filters demonstrations and notes on click with zero skeleton delay', () => {
    const onNavigate = vi.fn();
    render(<CaseStudiesPage onNavigate={onNavigate} />);

    // Initial All Work view shows all 3 technical demonstrations and all 3 notes
    expect(screen.getByTestId('work-demo-momo-reconciliation')).toBeInTheDocument();
    expect(screen.getByTestId('work-demo-efris-webhook-resilience')).toBeInTheDocument();
    expect(screen.getByTestId('work-demo-rescue-static-architecture')).toBeInTheDocument();

    // Filter to Websites -> instant synchronous update (only Static-First Edge Architecture & Note 03 remain)
    fireEvent.click(screen.getByRole('button', { name: 'Websites' }));

    expect(screen.getByTestId('work-filter-summary')).toHaveTextContent('Showing Websites');
    expect(screen.queryByTestId('work-demo-momo-reconciliation')).not.toBeInTheDocument();
    expect(screen.getByTestId('work-demo-rescue-static-architecture')).toBeInTheDocument();
    expect(screen.getByTestId('work-note-rescue-stalled-project')).toBeInTheDocument();
    expect(screen.queryByTestId('work-note-deterministic-calc')).not.toBeInTheDocument();
    expect(window.location.search).toBe('?category=websites');

    // Switch to Integrations
    fireEvent.click(screen.getByRole('button', { name: 'Integrations' }));
    expect(screen.getByTestId('work-filter-summary')).toHaveTextContent('Showing Integrations');
    expect(screen.getByTestId('work-demo-efris-webhook-resilience')).toBeInTheDocument();
    expect(screen.queryByTestId('work-demo-rescue-static-architecture')).not.toBeInTheDocument();
    expect(window.location.search).toBe('?category=integrations');

    // Reset back to All Work
    fireEvent.click(screen.getByRole('button', { name: /Reset to All Work/i }));
    expect(screen.queryByTestId('work-filter-summary')).not.toBeInTheDocument();
    expect(screen.getByTestId('work-demo-momo-reconciliation')).toBeInTheDocument();
    expect(window.location.search).toBe('');
  });

  it('initializes category filter directly from URL ?category= query param', () => {
    window.history.replaceState(null, '', '/case-studies?category=financial');
    render(<CaseStudiesPage onNavigate={vi.fn()} />);

    expect(screen.getByTestId('work-filter-summary')).toHaveTextContent('Showing Financial Systems');
    expect(screen.getByTestId('work-demo-momo-reconciliation')).toBeInTheDocument();
    expect(screen.queryByTestId('work-demo-rescue-static-architecture')).not.toBeInTheDocument();
  });
});
