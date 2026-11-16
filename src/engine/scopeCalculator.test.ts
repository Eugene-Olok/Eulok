import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScope,
  computeLogarithmicRiskScore,
  encodeScopeToQuery,
  parseScopeFromQuery,
  ARCHETYPES,
  CURRENCIES,
  ECONOMIC_REGIONS,
  simpleHash,
} from './scopeCalculator.ts';

test('Scope Calculator — Exact milestone arithmetic consistency across all 5 archetypes', () => {
  const archetypes = Object.keys(ARCHETYPES) as Array<keyof typeof ARCHETYPES>;
  for (const archetypeId of archetypes) {
    // Low-complexity (no rails, no compliance)
    const bare = calculateScope({
      archetypeId,
      selectedRails: [],
      complianceRequirements: [],
      throughputTier: 'standard',
    });
    const bareSum = +bare.milestonePhases.reduce((acc, p) => acc + p.weeks, 0).toFixed(1);
    assert.equal(bare.milestoneTotalWeeks, bareSum);
    assert.equal(bare.estimatedWeeksMin, bareSum, `${archetypeId} min must equal sum of milestones`);
    assert.ok(bare.estimatedWeeksMax > bare.estimatedWeeksMin);

    // Loaded (rails + compliance + mission critical)
    const loaded = calculateScope({
      archetypeId,
      selectedRails: ['mtn_momo', 'airtel_money', 'ura_efris'],
      complianceRequirements: ['dppa_2019', 'audit_ledger'],
      throughputTier: 'mission_critical',
    });
    const loadedSum = +loaded.milestonePhases.reduce((acc, p) => acc + p.weeks, 0).toFixed(1);
    assert.equal(loaded.milestoneTotalWeeks, loadedSum);
    assert.equal(loaded.estimatedWeeksMin, loadedSum);
  }
});

test('Scope Calculator — Logarithmic risk curve shows diminishing marginal growth & keeps MTN-only configs LOW/MODERATE', () => {
  // Pure logarithmic diminishing marginal increase check
  const deltaLow = computeLogarithmicRiskScore(2) - computeLogarithmicRiskScore(0);
  const deltaHigh = computeLogarithmicRiskScore(10) - computeLogarithmicRiskScore(8);
  assert.ok(deltaLow >= deltaHigh, 'Logarithmic scaling must exhibit diminishing marginal increments');

  // Every standard archetype with MTN-only integration and NO extra compliance stays LOW or MODERATE (never HIGH/CRITICAL)
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

  // Flagship reconciliation spans LOW -> MODERATE -> HIGH -> CRITICAL cleanly
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
  });
  assert.equal(missionCritical.riskLevel, 'CRITICAL');
  assert.ok(missionCritical.riskScore > highThroughput.riskScore);
});

test('Scope Calculator — Regional economic pricing scales significantly between Uganda, East Africa, UK/EU, and USA', () => {
  const baseInputs = {
    archetypeId: 'reconciliation' as const,
    selectedRails: ['mtn_momo', 'airtel_money'],
    complianceRequirements: ['dppa_2019', 'audit_ledger'],
    throughputTier: 'standard' as const,
    currency: 'USD' as const, // Hold display currency constant in USD to isolate regional economic effect
  };

  const uganda = calculateScope({ ...baseInputs, regionId: 'uganda' });
  const eastAfrica = calculateScope({ ...baseInputs, regionId: 'east_africa' });
  const uk = calculateScope({ ...baseInputs, regionId: 'uk' });
  const europe = calculateScope({ ...baseInputs, regionId: 'europe' });
  const usa = calculateScope({ ...baseInputs, regionId: 'usa' });

  assert.equal(uganda.economicMultiplier, 1.0);
  assert.ok(eastAfrica.budgetMinUsd > uganda.budgetMinUsd);
  assert.ok(uk.budgetMinUsd > eastAfrica.budgetMinUsd);
  assert.ok(europe.budgetMinUsd >= uk.budgetMinUsd);
  assert.ok(usa.budgetMinUsd > uganda.budgetMinUsd * 2.5, 'USA market pricing must substantially exceed Uganda local pricing');
  assert.ok(usa.memorandumMarkdown.includes('United States'));

  // Default currency follows region if currency is omitted
  const usaDefaultCurrency = calculateScope({
    archetypeId: 'custom_portal',
    selectedRails: [],
    complianceRequirements: [],
    throughputTier: 'standard',
    regionId: 'usa',
  });
  assert.equal(usaDefaultCurrency.currency, 'USD');
  assert.ok(usaDefaultCurrency.suggestedTier.startsWith('$'));

  const ukDefaultCurrency = calculateScope({
    archetypeId: 'custom_portal',
    selectedRails: [],
    complianceRequirements: [],
    throughputTier: 'standard',
    regionId: 'uk',
  });
  assert.equal(ukDefaultCurrency.currency, 'GBP');
  assert.ok(ukDefaultCurrency.suggestedTier.startsWith('£'));
});

test('Scope Calculator — Pricing reflects archetype & risk score, not raw duration alone', () => {
  const websitePortal = calculateScope({
    archetypeId: 'website',
    selectedRails: [],
    complianceRequirements: [],
    throughputTier: 'standard',
    currency: 'USD',
  });

  const rescueMissionCritical = calculateScope({
    archetypeId: 'rescue',
    selectedRails: ['mtn_momo', 'commercial_banks'],
    complianceRequirements: ['audit_ledger'],
    throughputTier: 'mission_critical',
    currency: 'USD',
  });

  assert.ok(rescueMissionCritical.budgetMaxUsd > websitePortal.budgetMaxUsd * 2);

  // Higher-risk reconciliation costs more than low-risk website at comparable baseline
  const lowRiskPortal = calculateScope({
    archetypeId: 'website',
    selectedRails: ['accounting_webhooks'],
    complianceRequirements: ['dppa_2019'],
    throughputTier: 'standard',
    currency: 'USD',
  });
  const recon = calculateScope({
    archetypeId: 'reconciliation',
    selectedRails: [],
    complianceRequirements: [],
    throughputTier: 'standard',
    currency: 'USD',
  });
  assert.ok(recon.budgetMinUsd > lowRiskPortal.budgetMinUsd);
});

test('Scope Calculator — Multi-currency support formats UGX (default), USD, KES, EUR, GBP accurately', () => {
  const currencies = Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>;
  const results = currencies.map((currency) =>
    calculateScope({
      archetypeId: 'efris',
      selectedRails: ['ura_efris'],
      complianceRequirements: ['dppa_2019'],
      throughputTier: 'standard',
      currency,
      clientName: 'Kampala Traders Ltd',
    })
  );

  for (const res of results) {
    assert.ok(res.budgetMin > 0);
    assert.ok(res.budgetMax > res.budgetMin);
    assert.ok(res.memorandumMarkdown.includes('Kampala Traders Ltd'));
    assert.ok(res.memorandumMarkdown.includes(res.currency));
  }

  const defaultResult = calculateScope({
    archetypeId: 'efris',
    selectedRails: ['ura_efris'],
    complianceRequirements: ['dppa_2019'],
    throughputTier: 'standard',
  });
  assert.equal(defaultResult.regionId, 'uganda');
  assert.equal(defaultResult.currency, 'UGX');
  assert.ok(defaultResult.suggestedTier.startsWith('UGX '));
  assert.ok(Object.keys(ECONOMIC_REGIONS).length === 5);
});

test('Scope Calculator — Milestone floor notes are explicitly disclosed when triggered', () => {
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

test('Scope Calculator — Deterministic hash stability', () => {
  const hash1 = simpleHash('reconciliation-airtel_money,mtn_momo-audit_ledger-5');
  const hash2 = simpleHash('reconciliation-airtel_money,mtn_momo-audit_ledger-5');
  assert.equal(hash1, hash2);
  assert.ok(hash1.startsWith('EULOK-SPEC-'));
});

test('Scope Calculator — Shareable URL query encoding & parsing round-trip fidelity', () => {
  const inputs = {
    archetypeId: 'efris' as const,
    selectedRails: ['ura_efris', 'mtn_momo'],
    complianceRequirements: ['dppa_2019', 'audit_ledger'],
    throughputTier: 'high' as const,
    regionId: 'usa' as const,
    currency: 'USD' as const,
    clientName: 'East Logistics Co',
  };

  const qs = encodeScopeToQuery(inputs);
  assert.ok(qs.length > 0 && !qs.startsWith('?'));
  assert.ok(qs.includes('arch=efris'));
  assert.ok(qs.includes('region=usa'));
  assert.ok(qs.includes('cur=USD'));

  const parsed = parseScopeFromQuery(`?${qs}`);
  assert.equal(parsed.archetypeId, 'efris');
  assert.deepEqual(parsed.selectedRails, ['mtn_momo', 'ura_efris']); // normalized sorted order
  assert.deepEqual(parsed.complianceRequirements, ['audit_ledger', 'dppa_2019']);
  assert.equal(parsed.throughputTier, 'high');
  assert.equal(parsed.regionId, 'usa');
  assert.equal(parsed.currency, 'USD');
  assert.equal(parsed.clientName, 'East Logistics Co');

  // Empty rails/compliance serialize explicitly as 'none' and restore as empty arrays
  const minimalQs = encodeScopeToQuery({
    archetypeId: 'website',
    selectedRails: [],
    complianceRequirements: [],
    throughputTier: 'standard',
    regionId: 'uganda',
    currency: 'UGX',
  });
  assert.ok(minimalQs.includes('rails=none'));
  assert.ok(minimalQs.includes('comp=none'));
  const minimalParsed = parseScopeFromQuery(minimalQs);
  assert.deepEqual(minimalParsed.selectedRails, []);
  assert.deepEqual(minimalParsed.complianceRequirements, []);

  // Untrusted query injection values are ignored
  const malicious = parseScopeFromQuery('?arch=hacked&rails=fake_rail,mtn_momo&tier=infinite&region=mars&cur=BTC');
  assert.equal(malicious.archetypeId, undefined);
  assert.deepEqual(malicious.selectedRails, ['mtn_momo']);
  assert.equal(malicious.throughputTier, undefined);
  assert.equal(malicious.regionId, undefined);
  assert.equal(malicious.currency, undefined);
});

