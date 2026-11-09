import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScope, ARCHETYPES, simpleHash } from './scopeCalculator.ts';

test('Scope Calculator — Generates deterministic results for reconciliation project', () => {
  const result = calculateScope({
    archetypeId: 'reconciliation',
    selectedRails: ['mtn_momo', 'airtel_money'],
    complianceRequirements: ['dppa_2019', 'audit_ledger'],
    throughputTier: 'standard',
    clientName: 'Acme Payments Uganda',
  });

  assert.equal(result.archetypeName, ARCHETYPES.reconciliation.name);
  assert.ok(result.estimatedWeeksMin > 0);
  assert.ok(result.estimatedWeeksMax >= result.estimatedWeeksMin);
  assert.ok(result.riskScore >= 1 && result.riskScore <= 10);
  assert.ok(result.verificationHash.startsWith('EULOK-SPEC-'));
  assert.equal(result.milestonePhases.length, 6);
  assert.ok(result.memorandumMarkdown.includes('Acme Payments Uganda'));
  assert.ok(result.architecturalControls.length >= 5);
});

test('Scope Calculator — High throughput increases risk score and delivery time', () => {
  const standard = calculateScope({
    archetypeId: 'efris',
    selectedRails: ['ura_efris'],
    complianceRequirements: ['audit_ledger'],
    throughputTier: 'standard',
  });

  const missionCritical = calculateScope({
    archetypeId: 'efris',
    selectedRails: ['ura_efris'],
    complianceRequirements: ['audit_ledger'],
    throughputTier: 'mission_critical',
  });

  assert.ok(missionCritical.estimatedWeeksMax >= standard.estimatedWeeksMax);
  assert.ok(missionCritical.riskScore >= standard.riskScore);
});

test('Scope Calculator — Deterministic hash stability', () => {
  const hash1 = simpleHash('reconciliation-airtel_money,mtn_momo-audit_ledger-5');
  const hash2 = simpleHash('reconciliation-airtel_money,mtn_momo-audit_ledger-5');
  assert.equal(hash1, hash2);
  assert.ok(hash1.startsWith('EULOK-SPEC-'));
});
