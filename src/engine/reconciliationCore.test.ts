import test from 'node:test';
import assert from 'node:assert/strict';
import { runReconciliation, RULES_FINGERPRINT } from './reconciliationCore.ts';
import { canTransition, executeTransition } from './workflowEngine.ts';
import type { Transaction, Obligation } from '../types/reconciliation.ts';

test('Reconciliation Engine — Rule R1: Exact Match', () => {
  const tx: Transaction = {
    tx_id: 'TX-R1-001',
    timestamp: '2026-10-20T10:00:00Z',
    provider: 'MTN Mobile Money',
    account: '0770000001',
    amount: 150000,
    currency: 'UGX',
    payer_reference: 'INV-1001',
    kind: 'payment',
  };

  const obl: Obligation = {
    obligation_id: 'INV-1001',
    client: 'Alpha Ltd',
    amount_due: 150000,
    due_date: '2026-10-31',
    description: 'Cloud Infrastructure Setup Milestone 1',
  };

  const outcome = runReconciliation([tx], [obl], 'RUN-TEST-R1');

  assert.equal(outcome.matches.length, 1);
  assert.equal(outcome.matches[0].status, 'exact');
  assert.equal(outcome.matches[0].amount_applied, 150000);
  assert.equal(outcome.summary.exact_count, 1);
  assert.equal(outcome.summary.matched_amount, 150000);
  assert.equal(outcome.unmatched.length, 0);
  assert.equal(outcome.duplicates.length, 0);
  assert.equal(outcome.exceptions.length, 0);
  assert.equal(outcome.rules_fingerprint, RULES_FINGERPRINT);
});

test('Reconciliation Engine — Rule R2: Partial Payment Match', () => {
  const tx: Transaction = {
    tx_id: 'TX-R2-001',
    timestamp: '2026-10-20T11:00:00Z',
    provider: 'Airtel Money',
    account: '0750000001',
    amount: 60000,
    currency: 'UGX',
    payer_reference: 'INV-1002',
    kind: 'payment',
  };

  const obl: Obligation = {
    obligation_id: 'INV-1002',
    client: 'Beta Studio',
    amount_due: 100000,
    due_date: '2026-10-31',
    description: 'Security & Auth Hardening',
  };

  const outcome = runReconciliation([tx], [obl], 'RUN-TEST-R2');

  assert.equal(outcome.matches.length, 1);
  assert.equal(outcome.matches[0].status, 'partial');
  assert.equal(outcome.matches[0].amount_applied, 60000);
  assert.equal(outcome.summary.partial_count, 1);
  assert.equal(outcome.summary.matched_amount, 60000);
});

test('Reconciliation Engine — Rule R3: Overpayment Exception', () => {
  const tx: Transaction = {
    tx_id: 'TX-R3-001',
    timestamp: '2026-10-20T12:00:00Z',
    provider: 'Bank EFT',
    account: 'UG99-BANK-001',
    amount: 250000,
    currency: 'UGX',
    payer_reference: 'INV-1003',
    kind: 'payment',
  };

  const obl: Obligation = {
    obligation_id: 'INV-1003',
    client: 'Gamma Corp',
    amount_due: 200000,
    due_date: '2026-10-31',
    description: 'PostgreSQL Database Provisioning',
  };

  const outcome = runReconciliation([tx], [obl], 'RUN-TEST-R3');

  assert.equal(outcome.exceptions.length, 1);
  assert.equal(outcome.exceptions[0].status, 'exception');
  assert.match(outcome.exceptions[0].rationale, /Overpayment exception/);
  assert.equal(outcome.matches.length, 0);
  assert.equal(outcome.summary.exception_count, 1);
});

test('Reconciliation Engine — Rule R5: Duplicate Transaction Detection', () => {
  const tx1: Transaction = {
    tx_id: 'TX-DUP-999',
    timestamp: '2026-10-20T13:00:00Z',
    provider: 'MTN Mobile Money',
    account: '0770000002',
    amount: 50000,
    currency: 'UGX',
    payer_reference: 'INV-1005',
    kind: 'payment',
  };

  const tx2: Transaction = {
    tx_id: 'TX-DUP-999',
    timestamp: '2026-10-20T13:00:05Z',
    provider: 'MTN Mobile Money',
    account: '0770000002',
    amount: 50000,
    currency: 'UGX',
    payer_reference: 'INV-1005',
    kind: 'payment',
  };

  const obl: Obligation = {
    obligation_id: 'INV-1005',
    client: 'Delta Co',
    amount_due: 50000,
    due_date: '2026-10-31',
    description: 'Deterministic API Integration',
  };

  const outcome = runReconciliation([tx1, tx2], [obl], 'RUN-TEST-R5');

  assert.equal(outcome.matches.length, 1);
  assert.equal(outcome.duplicates.length, 1);
  assert.equal(outcome.duplicates[0].status, 'duplicate_suspect');
  assert.match(outcome.duplicates[0].rationale, /Duplicate transaction ID/);
  assert.equal(outcome.summary.duplicate_count, 1);
});

test('Reconciliation Engine — Rule R6: Conflicting Identifier Detection', () => {
  const tx1: Transaction = {
    tx_id: 'TX-CONFLICT-101',
    timestamp: '2026-10-20T14:00:00Z',
    provider: 'MTN Mobile Money',
    account: '0770000003',
    amount: 50000,
    currency: 'UGX',
    payer_reference: 'INV-1006',
    kind: 'payment',
  };

  const tx2: Transaction = {
    tx_id: 'TX-CONFLICT-101',
    timestamp: '2026-10-20T14:02:00Z',
    provider: 'MTN Mobile Money',
    account: '0770000003',
    amount: 75000, // Different amount with same tx_id
    currency: 'UGX',
    payer_reference: 'INV-1006',
    kind: 'payment',
  };

  const obl: Obligation = {
    obligation_id: 'INV-1006',
    client: 'Epsilon Ltd',
    amount_due: 50000,
    due_date: '2026-10-31',
    description: 'Contract Review',
  };

  const outcome = runReconciliation([tx1, tx2], [obl], 'RUN-TEST-R6');

  assert.equal(outcome.exceptions.length, 1);
  assert.match(outcome.exceptions[0].rationale, /Conflicting identifier/);
});

test('Reconciliation Engine — Rules R7 & R8: Refunds and Reversals Partitioning', () => {
  const normalTx: Transaction = {
    tx_id: 'TX-PAY-001',
    timestamp: '2026-10-20T15:00:00Z',
    provider: 'MTN Mobile Money',
    account: '0770000004',
    amount: 80000,
    currency: 'UGX',
    payer_reference: 'INV-1007',
    kind: 'payment',
  };

  const refundTx: Transaction = {
    tx_id: 'TX-REF-001',
    timestamp: '2026-10-20T15:30:00Z',
    provider: 'MTN Mobile Money',
    account: '0770000004',
    amount: 20000,
    currency: 'UGX',
    payer_reference: 'INV-1007',
    kind: 'refund',
  };

  const reversalTx: Transaction = {
    tx_id: 'TX-REV-001',
    timestamp: '2026-10-20T16:00:00Z',
    provider: 'Airtel Money',
    account: '0750000002',
    amount: 15000,
    currency: 'UGX',
    payer_reference: 'INV-1007',
    kind: 'reversal',
  };

  const obl: Obligation = {
    obligation_id: 'INV-1007',
    client: 'Zeta Inc',
    amount_due: 80000,
    due_date: '2026-10-31',
    description: 'Full-Stack Performance Optimization',
  };

  const outcome = runReconciliation([normalTx, refundTx, reversalTx], [obl], 'RUN-TEST-R7-R8');

  assert.equal(outcome.matches.length, 1);
  assert.equal(outcome.refunds.length, 1);
  assert.equal(outcome.reversals.length, 1);
  assert.equal(outcome.summary.refunds_count, 1);
  assert.equal(outcome.summary.reversals_count, 1);
});

test('Workflow Engine — Valid state transitions along Phase 8 path', () => {
  // PROSPECT -> INTAKE
  assert.equal(canTransition('PROSPECT', 'record_intake'), true);
  const intakeRes = executeTransition('PROSPECT', 'record_intake');
  assert.equal(intakeRes.success, true);
  assert.equal(intakeRes.nextState, 'INTAKE');

  // INTAKE -> APPROVAL
  assert.equal(canTransition('INTAKE', 'submit_for_approval'), true);
  const approvalRes = executeTransition('INTAKE', 'submit_for_approval');
  assert.equal(approvalRes.success, true);
  assert.equal(approvalRes.nextState, 'APPROVAL');

  // APPROVAL -> SCOPE
  assert.equal(canTransition('APPROVAL', 'go_founder_approved'), true);
  const scopeRes = executeTransition('APPROVAL', 'go_founder_approved');
  assert.equal(scopeRes.success, true);
  assert.equal(scopeRes.nextState, 'SCOPE');

  // Guard against invalid leap: PROSPECT cannot jump directly to DELIVERY
  assert.equal(canTransition('PROSPECT', 'start_delivery'), false);
  const illegalRes = executeTransition('PROSPECT', 'start_delivery');
  assert.equal(illegalRes.success, false);
  assert.equal(illegalRes.nextState, 'PROSPECT');
  assert.match(illegalRes.message, /Fail-closed rule enforced/);
});
