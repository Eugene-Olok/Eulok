export type MatchStatus =
  | 'exact'
  | 'partial'
  | 'proposed'
  | 'unmatched'
  | 'duplicate_suspect'
  | 'exception';

export type TransactionKind = 'payment' | 'refund' | 'reversal';

export type WorkflowState =
  | 'idle'
  | 'validating'
  | 'reconciling'
  | 'reviewing_exceptions'
  | 'needs_human_input'
  | 'blocked'
  | 'completed'
  | 'failed';

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';

export interface Transaction {
  tx_id: string;
  provider: string;
  account: string | null;
  amount: number;
  currency: string;
  timestamp: string; // ISO string or readable format
  payer_reference: string | null;
  kind: TransactionKind;
  note?: string;
  raw?: Record<string, unknown>;
}

export interface Obligation {
  obligation_id: string;
  client: string;
  amount_due: number;
  due_date: string;
  description: string;
}

export interface Allocation {
  obligation_id: string;
  amount: number;
}

export interface Match {
  match_id: string;
  status: MatchStatus;
  transaction: Transaction;
  obligation: Obligation | null;
  amount_applied: number;
  rationale: string;
  allocations?: Allocation[];
}

export interface ReconciliationSummary {
  total_transactions: number;
  total_obligations: number;
  total_payments_amount: number;
  matched_amount: number;
  exact_count: number;
  partial_count: number;
  proposed_count: number;
  unmatched_count: number;
  duplicate_count: number;
  exception_count: number;
  refunds_count: number;
  reversals_count: number;
}

export interface ReconciliationOutcome {
  run_id: string;
  rules_fingerprint: string;
  timestamp: string;
  matches: Match[];
  unmatched: Transaction[];
  duplicates: Match[];
  exceptions: Match[];
  refunds: Transaction[];
  reversals: Transaction[];
  summary: ReconciliationSummary;
}
