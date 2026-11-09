import test from 'node:test';
import assert from 'node:assert/strict';
import { validateIntakePayload, sanitizeString } from './intakeValidation.ts';

test('Intake Validation — Valid payload with required fields', () => {
  const result = validateIntakePayload({
    need: 'Build something new',
    systemType: 'Financial reconciliation system',
    budget: '$2,000–$5,000',
    problemDescription: 'Need to reconcile MTN MoMo payments against bank statements.',
    clientEmail: 'lead@example.com',
    clientPhone: '+256700000000',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
  assert.ok(result.referenceId?.startsWith('EULOK-'));
  assert.equal(result.sanitizedPayload?.need, 'Build something new');
  assert.equal(result.sanitizedPayload?.clientEmail, 'lead@example.com');
});

test('Intake Validation — Bot honeypot rejects spam', () => {
  const result = validateIntakePayload({
    need: 'Build something new',
    systemType: 'Custom business software',
    budget: '$500–$2,000',
    problemDescription: 'Legitimate looking problem',
    honeypot: 'http://spam-link.ru',
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.includes('Automated submission rejected.'), true);
});

test('Intake Validation — Rejects missing need and system type', () => {
  const result = validateIntakePayload({});
  assert.equal(result.isValid, false);
  assert.ok(result.errors.length >= 2);
});

test('Intake Validation — Validates email format properly', () => {
  const invalidResult = validateIntakePayload({
    need: 'Build something new',
    systemType: 'Custom software',
    problemDescription: 'Valid problem description',
    clientEmail: 'not-an-email',
  });
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.some(e => e.includes('email address is invalid')));

  const validResult = validateIntakePayload({
    need: 'Build something new',
    systemType: 'Custom software',
    problemDescription: 'Valid problem description',
    clientEmail: 'engineer@organization.org',
  });
  assert.equal(validResult.isValid, true);
});

test('Intake Sanitizer — Strips angle brackets to prevent injection', () => {
  const input = '<script>alert("xss")</script>Hello EULOK';
  const clean = sanitizeString(input);
  assert.equal(clean.includes('<'), false);
  assert.equal(clean.includes('>'), false);
  assert.equal(clean.includes('Hello EULOK'), true);
});
