import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WEBHOOK_SCENARIOS,
  simulateWebhookDelivery,
  constantTimeEqual,
} from './webhookSandbox.ts';

test('Webhook Sandbox — Tampered HMAC fails closed with HTTP 401 and zero ledger writes', () => {
  const result = simulateWebhookDelivery(WEBHOOK_SCENARIOS.tampered_signature, new Set());
  assert.equal(result.httpStatus, 401);
  assert.equal(result.signatureVerified, false);
  assert.equal(result.ledgerWritesDelta, 0);
  assert.equal(result.decision, 'REJECTED_FAIL_CLOSED');
});

test('Webhook Sandbox — Duplicate replay returns HTTP 200 idempotent no-op with zero double credit', () => {
  const retry = WEBHOOK_SCENARIOS.duplicate_webhook_retry;
  const processed = new Set<string>([retry.idempotencyKey]);
  const result = simulateWebhookDelivery(retry, processed);
  assert.equal(result.httpStatus, 200);
  assert.equal(result.isDuplicateReplay, true);
  assert.equal(result.ledgerWritesDelta, 0);
  assert.equal(result.decision, 'IDEMPOTENT_NOOP');
});

test('Webhook Sandbox — Valid first delivery credits ledger once; second replay is no-op', () => {
  const valid = WEBHOOK_SCENARIOS.valid_momo_settlement;
  const store = new Set<string>();

  const first = simulateWebhookDelivery(valid, store);
  assert.equal(first.httpStatus, 200);
  assert.equal(first.ledgerWritesDelta, 1);
  assert.equal(first.decision, 'LEDGER_CREDITED');

  store.add(valid.idempotencyKey);
  const second = simulateWebhookDelivery(valid, store);
  assert.equal(second.httpStatus, 200);
  assert.equal(second.ledgerWritesDelta, 0);
  assert.equal(second.decision, 'IDEMPOTENT_NOOP');
});

test('Webhook Sandbox — Upstream EFRIS timeout queues safely without false ledger completion', () => {
  const efris = WEBHOOK_SCENARIOS.efris_upstream_timeout;
  const result = simulateWebhookDelivery(efris, new Set());
  assert.equal(result.httpStatus, 202);
  assert.equal(result.ledgerWritesDelta, 0);
  assert.equal(result.decision, 'BUFFERED_RETRY_QUEUE');
});

test('Webhook Sandbox — Constant-time comparison correctness', () => {
  assert.equal(constantTimeEqual('abc123', 'abc123'), true);
  assert.equal(constantTimeEqual('abc123', 'abc124'), false);
  assert.equal(constantTimeEqual('abc', 'abcd'), false);
});
