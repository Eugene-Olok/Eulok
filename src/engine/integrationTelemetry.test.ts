import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateIntegrationTelemetry,
  generate30DaySuccessHistory,
  SLA_SUCCESS_TARGET_PCT,
} from './integrationTelemetry.ts';

test('telemetry series bucket count matches selected window', () => {
  const h1 = generateIntegrationTelemetry({
    windowId: '1h',
    railId: 'all',
    loadProfileId: 'nominal',
  });
  const h24 = generateIntegrationTelemetry({
    windowId: '24h',
    railId: 'all',
    loadProfileId: 'nominal',
  });
  const d7 = generateIntegrationTelemetry({
    windowId: '7d',
    railId: 'all',
    loadProfileId: 'nominal',
  });

  assert.equal(h1.series.length, 12);
  assert.equal(h24.series.length, 12);
  assert.equal(d7.series.length, 7);
  assert.equal(h1.railBreakdown.length, 4);
});

test('carrier jitter load profile elevates buffered retries and P95 latency over nominal', () => {
  const nominal = generateIntegrationTelemetry({
    windowId: '24h',
    railId: 'mtn_momo',
    loadProfileId: 'nominal',
  });
  const jitter = generateIntegrationTelemetry({
    windowId: '24h',
    railId: 'mtn_momo',
    loadProfileId: 'carrier_jitter',
  });

  assert.ok(jitter.kpis.bufferedRetryCount > nominal.kpis.bufferedRetryCount);
  assert.ok(jitter.kpis.p95LatencyMs > nominal.kpis.p95LatencyMs);
});

test('sandbox overlay increments latest bucket throughput and KPI counters deterministically', () => {
  const base = generateIntegrationTelemetry({
    windowId: '1h',
    railId: 'all',
    loadProfileId: 'nominal',
  });
  const withOverlay = generateIntegrationTelemetry({
    windowId: '1h',
    railId: 'all',
    loadProfileId: 'nominal',
    sandboxOverlay: {
      ledgerCommits: 3,
      queuedRetries: 2,
      rejectedSignatures: 1,
    },
  });

  const lastBase = base.series[base.series.length - 1];
  const lastOverlay = withOverlay.series[withOverlay.series.length - 1];

  assert.equal(lastOverlay.settled, lastBase.settled + 3);
  assert.equal(lastOverlay.bufferedRetry, lastBase.bufferedRetry + 2);
  assert.equal(lastOverlay.hmacRejected, lastBase.hmacRejected + 1);
  assert.equal(withOverlay.kpis.totalRequests, base.kpis.totalRequests + 6);
});

test('rail filtering produces smaller single-rail volume than aggregate all-rails view', () => {
  const allRails = generateIntegrationTelemetry({
    windowId: '24h',
    railId: 'all',
    loadProfileId: 'nominal',
  });
  const efrisOnly = generateIntegrationTelemetry({
    windowId: '24h',
    railId: 'ura_efris',
    loadProfileId: 'nominal',
  });

  assert.ok(efrisOnly.kpis.totalRequests < allRails.kpis.totalRequests);
  assert.ok(efrisOnly.kpis.p95LatencyMs > 500);
});

test('generate30DaySuccessHistory emits 30 ordered points from D-29 to Today within valid percentage bounds', () => {
  const history = generate30DaySuccessHistory({
    railId: 'all',
    loadProfileId: 'nominal',
  });

  assert.equal(history.points.length, 30);
  assert.equal(history.points[0].dayLabel, 'D-29');
  assert.equal(history.points[29].dayLabel, 'Today');
  assert.equal(history.slaTargetPct, SLA_SUCCESS_TARGET_PCT);

  for (const pt of history.points) {
    assert.ok(pt.successRatePct >= 85 && pt.successRatePct <= 100);
    assert.equal(pt.totalTransactions, pt.settledCount + pt.failedCount);
  }
  assert.ok(history.kpis.daysMeetingSla >= 0 && history.kpis.daysMeetingSla <= 30);
});

test('carrier_jitter lowers 30-day average success rate compared to nominal profile', () => {
  const nominal = generate30DaySuccessHistory({
    railId: 'mtn_momo',
    loadProfileId: 'nominal',
  });
  const jitter = generate30DaySuccessHistory({
    railId: 'mtn_momo',
    loadProfileId: 'carrier_jitter',
  });

  assert.ok(jitter.kpis.averageSuccessRatePct < nominal.kpis.averageSuccessRatePct);
  assert.ok(jitter.kpis.minSuccessRatePct < nominal.kpis.minSuccessRatePct);
});

test('generate30DaySuccessHistory reflects sandbox overlay counts strictly on Today point', () => {
  const base = generate30DaySuccessHistory({
    railId: 'ura_efris',
    loadProfileId: 'nominal',
  });
  const overlaid = generate30DaySuccessHistory({
    railId: 'ura_efris',
    loadProfileId: 'nominal',
    sandboxOverlay: {
      ledgerCommits: 10,
      queuedRetries: 4,
      rejectedSignatures: 25,
    },
  });

  // Historical D-29..D-01 remain unchanged
  assert.deepEqual(overlaid.points.slice(0, 29), base.points.slice(0, 29));

  const todayBase = base.points[29];
  const todayOverlaid = overlaid.points[29];
  assert.equal(todayOverlaid.failedCount, todayBase.failedCount + 25);
  assert.equal(todayOverlaid.recoveredCount, todayBase.recoveredCount + 4);
  assert.ok(todayOverlaid.settledCount > todayBase.settledCount - 25);
  assert.ok(todayOverlaid.successRatePct < todayBase.successRatePct);
});

test('nominal 30-day trend improves from first 15 days to second 15 days', () => {
  const nominal = generate30DaySuccessHistory({
    railId: 'all',
    loadProfileId: 'nominal',
  });
  assert.ok(nominal.kpis.trendDeltaPct >= 0);
  assert.ok(nominal.kpis.maxSuccessRatePct >= nominal.kpis.minSuccessRatePct);
});

