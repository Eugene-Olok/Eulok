import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRescueReadiness, RESCUE_DIAGNOSTIC_CHECKS } from './rescueDiagnostic.ts';

test('Rescue Diagnostic — Zero passing checks triggers P0 immediate stabilization', () => {
  const result = evaluateRescueReadiness([]);
  assert.equal(result.readinessPosture, 'STABILIZE_IMMEDIATELY');
  assert.equal(result.p0Count, 3);
  assert.equal(result.p1Count, 3);
  assert.equal(result.p2Count, 2);
  assert.equal(result.remediationPlan[0].priority, 'P0');
});

test('Rescue Diagnostic — All checks passing yields healthy baseline with empty remediation queue', () => {
  const allIds = RESCUE_DIAGNOSTIC_CHECKS.map((c) => c.id);
  const result = evaluateRescueReadiness(allIds);
  assert.equal(result.readinessPosture, 'HEALTHY_BASELINE');
  assert.equal(result.failingChecks.length, 0);
  assert.equal(result.remediationPlan.length, 0);
});

test('Rescue Diagnostic — Single P0 gap triggers containment rather than P2 hardening', () => {
  const withoutSecretsIsolation = RESCUE_DIAGNOSTIC_CHECKS
    .filter((c) => c.id !== 'secrets_isolated')
    .map((c) => c.id);
  const result = evaluateRescueReadiness(withoutSecretsIsolation);
  assert.equal(result.readinessPosture, 'CONTAINMENT_REQUIRED');
  assert.equal(result.p0Count, 1);
  assert.equal(result.remediationPlan[0].area, 'Secrets & Credential Isolation');
});

test('Rescue Diagnostic — Only P2 gaps yield targeted hardening ordered correctly', () => {
  const onlyP2Missing = RESCUE_DIAGNOSTIC_CHECKS
    .filter((c) => c.priorityIfFailing !== 'P2')
    .map((c) => c.id);
  const result = evaluateRescueReadiness(onlyP2Missing);
  assert.equal(result.readinessPosture, 'TARGETED_HARDENING');
  assert.equal(result.p0Count, 0);
  assert.equal(result.p1Count, 0);
  assert.equal(result.p2Count, 2);
  assert.ok(result.triageSummaryMarkdown.includes('[P2]'));
});
