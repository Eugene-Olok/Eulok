import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScope,
  computeLogarithmicRiskScore,
  encodeScopeToQuery,
  parseScopeFromQuery,
  ARCHETYPES,
  DEPLOYMENT_CONTEXTS,
  simpleHash,
} from './scopeCalculator.ts';

test('Scope Workbench — Exact milestone arithmetic & 100% effort share consistency across all 5 archetypes', () => {
  const archetypes = Object.keys(ARCHETYPES) as Array<keyof typeof ARCHETYPES>;
  for (const archetypeId of archetypes) {
    const bare = calculateScope({
      archetypeId,
      selectedRails: [],
      complianceRequirements: [],
      throughputTier: 'standard',
    });
    const bareSum = +bare.milestonePhases.reduce((acc, p) => acc + p.weeks, 0).toFixed(1);
    const barePctSum = bare.milestonePhases.reduce((acc, p) => acc + p.effortSharePct, 0);
    assert.equal(bare.milestoneTotalWeeks, bareSum);
    assert.equal(bare.estimatedWeeksMin, bareSum, `${archetypeId} min must equal sum of milestones`);
    assert.equal(barePctSum, 100, `${archetypeId} effort percentages must sum to exactly 100%`);
    assert.ok(bare.estimatedWeeksMax > bare.estimatedWeeksMin);

    const loaded = calculateScope({
      archetypeId,
      selectedRails: ['mtn_momo', 'airtel_money', 'ura_efris'],
      complianceRequirements: ['dppa_2019', 'audit_ledger'],
      throughputTier: 'mission_critical',
      deploymentContextId: 'eac_cross_border',
    });
    const loadedSum = +loaded.milestonePhases.reduce((acc, p) => acc + p.weeks, 0).toFixed(1);
    const loadedPctSum = loaded.milestonePhases.reduce((acc, p) => acc + p.effortSharePct, 0);
    assert.equal(loaded.milestoneTotalWeeks, loadedSum);
    assert.equal(loaded.estimatedWeeksMin, loadedSum);
    assert.equal(loadedPctSum, 100);
  }
});

test('Scope Workbench — Logarithmic risk curve shows diminishing marginal growth & keeps MTN-only configs LOW/MODERATE', () => {
  const deltaLow = computeLogarithmicRiskScore(2) - computeLogarithmicRiskScore(0);
  const deltaHigh = computeLogarithmicRiskScore(10) - computeLogarithmicRiskScore(8);
  assert.ok(deltaLow >= deltaHigh, 'Logarithmic scaling must exhibit diminishing marginal increments');

  const archetypes = Object.keys(ARCHETYPES) as Array<keyof typeof ARCHETYPES>;
  for (const archetypeId of archetypes) {
    const mtnOnly = calculateScope({
      archetypeId,
      selectedRails: ['mtn_momo'],
      complianceRequirements: [],
      throughputTier: 'standard',
    });
    assert.ok(
      mtnOnly.riskLevel === 'LOW' || mtnOnly.riskLevel === 'MODERATE',
      `${archetypeId} with MTN-only & no extra compliance must be LOW or MODERATE, got ${mtnOnly.riskLevel} (${mtnOnly.riskScore}/10)`
    );
  }

  const bare = calculateScope({
    archetypeId: 'reconciliation',
    selectedRails: [],
    complianceRequirements: [],
    throughputTier: 'standard',
  });
  assert.equal(bare.riskLevel, 'LOW');

  const standardDefault = calculateScope({
    archetypeId: 'reconciliation',
    selectedRails: ['mtn_momo', 'airtel_money'],
    complianceRequirements: ['dppa_2019', 'audit_ledger'],
    throughputTier: 'standard',
  });
  assert.equal(standardDefault.riskLevel, 'MODERATE');

  const highThroughput = calculateScope({
    archetypeId: 'reconciliation',
    selectedRails: ['mtn_momo', 'airtel_money', 'ura_efris'],
    complianceRequirements: ['dppa_2019', 'audit_ledger'],
    throughputTier: 'high',
  });
  assert.equal(highThroughput.riskLevel, 'HIGH');

  const missionCritical = calculateScope({
    archetypeId: 'reconciliation',
    selectedRails: ['mtn_momo', 'airtel_money', 'commercial_banks', 'ura_efris'],
    complianceRequirements: ['dppa_2019', 'audit_ledger', 'double_entry'],
    throughputTier: 'mission_critical',
    deploymentContextId: 'eac_cross_border',
  });
  assert.equal(missionCritical.riskLevel, 'CRITICAL');
  assert.ok(missionCritical.riskScore > highThroughput.riskScore);
});

test('Scope Workbench — Uganda & East Africa deployment contexts exclude pricing completely', () => {
  assert.deepEqual(Object.keys(DEPLOYMENT_CONTEXTS), ['uganda_domestic', 'eac_cross_border']);

  const uganda = calculateScope({
    archetypeId: 'reconciliation',
    selectedRails: ['mtn_momo', 'ura_efris'],
    complianceRequirements: ['dppa_2019'],
    throughputTier: 'standard',
    deploymentContextId: 'uganda_domestic',
    clientName: 'Kampala Cooperative SACCO',
  });

  const eac = calculateScope({
    archetypeId: 'reconciliation',
    selectedRails: ['mtn_momo', 'ura_efris'],
    complianceRequirements: ['dppa_2019'],
    throughputTier: 'standard',
    deploymentContextId: 'eac_cross_border',
    clientName: 'East Africa Clearing Hub',
  });

  assert.ok(eac.milestoneTotalWeeks >= uganda.milestoneTotalWeeks);
  assert.ok(eac.rawRiskLoad > uganda.rawRiskLoad);
  assert.ok(uganda.failureModes.some((fm) => fm.id === 'fm-momo-retry'));
  assert.ok(uganda.failureModes.some((fm) => fm.id === 'fm-efris-brownout'));
  assert.ok(eac.failureModes.some((fm) => fm.id === 'fm-eac-corridor'));
  assert.equal(uganda.architectureTopology.length, 4);
  assert.ok(uganda.acceptanceGates.length >= 4);

  // Strict assertion: zero automated price estimates or currency symbols in Markdown output
  assert.ok(!uganda.memorandumMarkdown.includes('Planning Investment'));
  assert.ok(!/\$[0-9]|GBP|EUR/.test(uganda.memorandumMarkdown));
  assert.ok(uganda.memorandumMarkdown.includes('engineering consultation'));
  assert.ok(uganda.memorandumMarkdown.includes('Kampala Cooperative SACCO'));
});

test('Scope Workbench — Milestone floor notes are explicitly disclosed when triggered', () => {
  const website = calculateScope({
    archetypeId: 'website',
    selectedRails: [],
    complianceRequirements: [],
    throughputTier: 'standard',
  });
  const floored = website.milestonePhases.filter((p) => p.floorApplied);
  assert.ok(floored.length > 0);
  assert.ok(floored.every((p) => Boolean(p.floorNote)));
});

test('Scope Workbench — Deterministic hash stability', () => {
  const hash1 = simpleHash('reconciliation-airtel_money,mtn_momo-audit_ledger-5');
  const hash2 = simpleHash('reconciliation-airtel_money,mtn_momo-audit_ledger-5');
  assert.equal(hash1, hash2);
  assert.ok(hash1.startsWith('EULOK-SPEC-'));
});

test('Scope Workbench — Shareable URL query encoding & parsing round-trip fidelity (zero pricing params)', () => {
  const inputs = {
    archetypeId: 'efris' as const,
    selectedRails: ['ura_efris', 'mtn_momo'],
    complianceRequirements: ['dppa_2019', 'audit_ledger'],
    throughputTier: 'high' as const,
    deploymentContextId: 'eac_cross_border' as const,
    clientName: 'Rift Logistics Co',
  };

  const qs = encodeScopeToQuery(inputs);
  assert.ok(qs.length > 0 && !qs.startsWith('?'));
  assert.ok(qs.includes('arch=efris'));
  assert.ok(qs.includes('ctx=eac_cross_border'));
  assert.ok(!qs.includes('cur='));
  assert.ok(!qs.includes('region='));

  const parsed = parseScopeFromQuery(`?${qs}`);
  assert.equal(parsed.archetypeId, 'efris');
  assert.deepEqual(parsed.selectedRails, ['mtn_momo', 'ura_efris']);
  assert.deepEqual(parsed.complianceRequirements, ['audit_ledger', 'dppa_2019']);
  assert.equal(parsed.throughputTier, 'high');
  assert.equal(parsed.deploymentContextId, 'eac_cross_border');
  assert.equal(parsed.clientName, 'Rift Logistics Co');

  // Empty rails/compliance serialize explicitly as 'none' and restore as empty arrays
  const minimalQs = encodeScopeToQuery({
    archetypeId: 'website',
    selectedRails: [],
    complianceRequirements: [],
    throughputTier: 'standard',
    deploymentContextId: 'uganda_domestic',
  });
  assert.ok(minimalQs.includes('rails=none'));
  assert.ok(minimalQs.includes('comp=none'));
  const minimalParsed = parseScopeFromQuery(minimalQs);
  assert.deepEqual(minimalParsed.selectedRails, []);
  assert.deepEqual(minimalParsed.complianceRequirements, []);

  // Untrusted query injection values are ignored
  const malicious = parseScopeFromQuery('?arch=hacked&rails=fake_rail,mtn_momo&tier=infinite&ctx=mars&cur=USD');
  assert.equal(malicious.archetypeId, undefined);
  assert.deepEqual(malicious.selectedRails, ['mtn_momo']);
  assert.equal(malicious.throughputTier, undefined);
  assert.equal(malicious.deploymentContextId, undefined);
});
