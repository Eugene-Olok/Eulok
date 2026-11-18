import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntakeWizard } from './IntakeWizard';

function stepThroughToBriefForm() {
  // Step 1 -> Step 2 -> Step 3 -> Step 4
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
}

describe('IntakeWizard — Loading Indicator, Timeline Step & Persistent Success Component', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('uses Target timeline in Step 3 without any pricing or currency amounts', () => {
    render(<IntakeWizard isModal={false} />);

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    expect(screen.getByText(/Target timeline & rollout/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Structured rollout \(6–12 weeks\)/i })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/UGX 2M|500–\$2,000|Approximate planning budget/i);
  });

  it('shows spinner loading state while submitting, forwards structured spec fields, and renders IntakeSuccessMessage without closing modal', async () => {
    let resolveFetch!: (value: Response) => void;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    const fetchMock = vi.fn().mockReturnValue(pendingFetch);
    globalThis.fetch = fetchMock;
    const onCloseModal = vi.fn();

    render(
      <IntakeWizard
        isModal={true}
        onCloseModal={onCloseModal}
        prefill={{
          need: 'Build something new',
          systemType: 'Financial reconciliation system',
          targetTimeline: '6–9 weeks (from Scoping Studio)',
          specHash: 'SPEC-ABCD12',
          specSummary: 'Uganda Domestic · 6/10 HIGH',
          problemDescription: 'Daily MTN MoMo ledger mismatches require deterministic matching.',
        }}
      />
    );
    stepThroughToBriefForm();

    const submitBtn = screen.getByTestId('intake-submit-btn');
    fireEvent.click(submitBtn);

    // Loading state verification
    await waitFor(() => {
      expect(submitBtn).toHaveAttribute('aria-busy', 'true');
      expect(submitBtn).toBeDisabled();
      expect(screen.getByTestId('intake-submit-loading')).toBeInTheDocument();
      expect(screen.getByText(/Submitting Brief…/i)).toBeInTheDocument();
    });

    const [, fetchInit] = fetchMock.mock.calls[0];
    const parsedBody = JSON.parse(String((fetchInit as RequestInit).body));
    expect(parsedBody.targetTimeline).toBe('6–9 weeks (from Scoping Studio)');
    expect(parsedBody.specHash).toBe('SPEC-ABCD12');
    expect(parsedBody.specSummary).toBe('Uganda Domestic · 6/10 HIGH');
    expect(parsedBody.budget).toBeUndefined();

    // Resolve API response cleanly
    resolveFetch(
      new Response(
        JSON.stringify({
          success: true,
          referenceId: 'EULOK-TEST9988',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    // Success component stays open and does NOT close modal automatically
    await waitFor(() => {
      expect(screen.getByTestId('intake-success-message')).toBeInTheDocument();
    });
    expect(screen.getByTestId('intake-reference-id')).toHaveTextContent('EULOK-TEST9988');
    expect(screen.getByText(/Project Scoping Brief Submitted/i)).toBeInTheDocument();
    expect(screen.getByText('TARGET TIMELINE')).toBeInTheDocument();
    expect(onCloseModal).not.toHaveBeenCalled();

    // Clicking explicit Done & Close triggers modal close
    fireEvent.click(screen.getByTestId('intake-success-done'));
    expect(onCloseModal).toHaveBeenCalledTimes(1);
  });

  it('surfaces server 422 validation errors inline instead of showing false success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          errors: ['Provided telephone number is invalid.'],
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      )
    );

    render(<IntakeWizard isModal={false} />);
    stepThroughToBriefForm();

    fireEvent.change(screen.getByPlaceholderText(/Reconciliation between payment gateway/i), {
      target: { value: 'Need URA EFRIS signing service audit.' },
    });
    fireEvent.change(screen.getByPlaceholderText('+256 700 000000'), {
      target: { value: '12' },
    });

    fireEvent.click(screen.getByTestId('intake-submit-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('intake-submit-error')).toHaveTextContent(
        'Provided telephone number is invalid.'
      );
    });
    expect(screen.queryByTestId('intake-success-message')).not.toBeInTheDocument();
  });
});
