import type {
  Transaction,
  Obligation,
  Match,
  ReconciliationOutcome,
  ReconciliationSummary,
} from '../types/reconciliation.ts';

export const RULES_FINGERPRINT = 'sha256:7f4a9b2c8e1d3e5f6a0b9c8d7e6f5a4b3c2d1e0f';

interface ObligationState {
  obligation: Obligation;
  remaining: number;
}

export function runReconciliation(
  transactions: Transaction[],
  obligations: Obligation[],
  runId?: string
): ReconciliationOutcome {
  const rid = runId || `RUN-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  const matches: Match[] = [];
  const unmatched: Transaction[] = [];
  const duplicates: Match[] = [];
  const exceptions: Match[] = [];
  const refunds: Transaction[] = [];
  const reversals: Transaction[] = [];

  // Track obligations remaining balance
  const oblStates: Map<string, ObligationState> = new Map();
  for (const obl of obligations) {
    oblStates.set(obl.obligation_id, {
      obligation: obl,
      remaining: obl.amount_due,
    });
  }

  // Seen transactions for duplicate and conflict detection
  const seenTxIds = new Map<string, Transaction>();

  // Step 1: Isolate refunds and reversals (R7 & R8)
  const payments: Transaction[] = [];
  for (const tx of transactions) {
    if (tx.kind === 'refund') {
      refunds.push(tx);
      continue;
    }
    if (tx.kind === 'reversal') {
      reversals.push(tx);
      continue;
    }
    payments.push(tx);
  }

  // Step 2: Duplicate & conflicting id detection (R5 & R6)
  const uniquePayments: Transaction[] = [];
  for (const tx of payments) {
    if (seenTxIds.has(tx.tx_id)) {
      const first = seenTxIds.get(tx.tx_id)!;
      if (first.amount !== tx.amount) {
        // R6: Conflicting identifier
        const match: Match = {
          match_id: `M-EX-${Math.random().toString(36).substring(2, 9)}`,
          status: 'exception',
          transaction: tx,
          obligation: null,
          amount_applied: 0,
          rationale: `Conflicting identifier: tx_id "${tx.tx_id}" already recorded with amount ${first.amount.toLocaleString()} UGX, current record has ${tx.amount.toLocaleString()} UGX. Requires security review.`,
        };
        exceptions.push(match);
      } else {
        // R5: Duplicate suspect
        const match: Match = {
          match_id: `M-DUP-${Math.random().toString(36).substring(2, 9)}`,
          status: 'duplicate_suspect',
          transaction: tx,
          obligation: null,
          amount_applied: 0,
          rationale: `Duplicate transaction ID: "${tx.tx_id}" with amount ${tx.amount.toLocaleString()} UGX already recorded at ${first.timestamp}. Retained for duplicate audit.`,
        };
        duplicates.push(match);
      }
    } else {
      seenTxIds.set(tx.tx_id, tx);
      uniquePayments.push(tx);
    }
  }

  // Step 3: Match against obligations (R1, R2, R3, R4)
  for (const tx of uniquePayments) {
    const ref = tx.payer_reference?.trim();

    if (ref && oblStates.has(ref)) {
      const oblState = oblStates.get(ref)!;

      if (oblState.remaining <= 0) {
        // Obligation already fully satisfied
        const match: Match = {
          match_id: `M-EX-${Math.random().toString(36).substring(2, 9)}`,
          status: 'exception',
          transaction: tx,
          obligation: oblState.obligation,
          amount_applied: 0,
          rationale: `Overpayment: Obligation ${oblState.obligation.obligation_id} (${oblState.obligation.client}) is already fully paid. Received surplus ${tx.amount.toLocaleString()} UGX.`,
        };
        exceptions.push(match);
      } else if (tx.amount === oblState.remaining) {
        // R1: Exact Match
        oblState.remaining = 0;
        const match: Match = {
          match_id: `M-EXACT-${Math.random().toString(36).substring(2, 9)}`,
          status: 'exact',
          transaction: tx,
          obligation: oblState.obligation,
          amount_applied: tx.amount,
          rationale: `Exact match: Reference ${ref} matches obligation ${oblState.obligation.obligation_id} for exactly ${tx.amount.toLocaleString()} UGX. Obligation closed.`,
        };
        matches.push(match);
      } else if (tx.amount < oblState.remaining) {
        // R2: Partial Match
        oblState.remaining -= tx.amount;
        const match: Match = {
          match_id: `M-PART-${Math.random().toString(36).substring(2, 9)}`,
          status: 'partial',
          transaction: tx,
          obligation: oblState.obligation,
          amount_applied: tx.amount,
          rationale: `Partial match: Reference ${ref} applied to obligation ${oblState.obligation.obligation_id}. Remaining balance: ${oblState.remaining.toLocaleString()} UGX.`,
        };
        matches.push(match);
      } else {
        // R3: Overpayment Exception (tx amount > remaining)
        const match: Match = {
          match_id: `M-EX-${Math.random().toString(36).substring(2, 9)}`,
          status: 'exception',
          transaction: tx,
          obligation: oblState.obligation,
          amount_applied: 0,
          rationale: `Overpayment exception: Reference ${ref} pays ${tx.amount.toLocaleString()} UGX but only ${oblState.remaining.toLocaleString()} UGX remains due. Routed to human review.`,
        };
        exceptions.push(match);
      }
    } else {
      // No reference or reference not recognized
      // R4: Check if unreferenced amount exactly matches exactly one open obligation
      const candidates = Array.from(oblStates.values()).filter(
        (o) => o.remaining === tx.amount
      );

      if (candidates.length === 1) {
        const candidate = candidates[0];
        // Proposed match - requires human confirmation
        const match: Match = {
          match_id: `M-PROP-${Math.random().toString(36).substring(2, 9)}`,
          status: 'proposed',
          transaction: tx,
          obligation: candidate.obligation,
          amount_applied: 0, // Not auto-applied!
          rationale: `Proposed match: No payer reference provided, but amount (${tx.amount.toLocaleString()} UGX) exactly equals open balance for ${candidate.obligation.obligation_id} (${candidate.obligation.client}). Requires human confirmation.`,
        };
        matches.push(match);
      } else {
        // Unmatched item
        unmatched.push(tx);
      }
    }
  }

  // Calculate summary
  let totalPaymentsAmount = 0;
  for (const tx of payments) {
    totalPaymentsAmount += tx.amount;
  }

  let matchedAmount = 0;
  let exactCount = 0;
  let partialCount = 0;
  let proposedCount = 0;

  for (const m of matches) {
    matchedAmount += m.amount_applied;
    if (m.status === 'exact') exactCount++;
    if (m.status === 'partial') partialCount++;
    if (m.status === 'proposed') proposedCount++;
  }

  const summary: ReconciliationSummary = {
    total_transactions: transactions.length,
    total_obligations: obligations.length,
    total_payments_amount: totalPaymentsAmount,
    matched_amount: matchedAmount,
    exact_count: exactCount,
    partial_count: partialCount,
    proposed_count: proposedCount,
    unmatched_count: unmatched.length,
    duplicate_count: duplicates.length,
    exception_count: exceptions.length,
    refunds_count: refunds.length,
    reversals_count: reversals.length,
  };

  return {
    run_id: rid,
    rules_fingerprint: RULES_FINGERPRINT,
    timestamp,
    matches,
    unmatched,
    duplicates,
    exceptions,
    refunds,
    reversals,
    summary,
  };
}
