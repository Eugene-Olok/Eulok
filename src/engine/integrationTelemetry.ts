/**
 * Deterministic Integration Adapter Performance & Error Telemetry Model
 *
 * Models realistic, reproducible throughput, idempotent deduplication, buffered
 * retries, HMAC rejections, and P95 latency profiles across payment rails and
 * load conditions for visual inspection on /services/finance-integrations.
 */

export type TelemetryWindowId = '1h' | '24h' | '7d';
export type TelemetryRailId = 'all' | 'mtn_momo' | 'airtel_money' | 'ura_efris' | 'bank_eft';
export type TelemetryLoadProfileId = 'nominal' | 'month_end_spike' | 'carrier_jitter';

export interface SandboxOverlayDelta {
  ledgerCommits: number;
  queuedRetries: number;
  rejectedSignatures: number;
}

export interface TelemetryPoint {
  bucket: string;
  settled: number;
  idempotentNoOp: number;
  bufferedRetry: number;
  hmacRejected: number;
  unrecoveredErrorRatePct: number;
  bufferedRetryRatePct: number;
  hmacRejectRatePct: number;
  p95LatencyMs: number;
}

export interface RailBreakdownRow {
  railId: Exclude<TelemetryRailId, 'all'>;
  name: string;
  protocol: string;
  throughputSharePct: number;
  requestsInWindow: number;
  bufferedRetryRatePct: number;
  hmacRejectRatePct: number;
  unrecoveredErrorRatePct: number;
  p95LatencyMs: number;
}

export interface TelemetryDashboardSnapshot {
  windowId: TelemetryWindowId;
  railId: TelemetryRailId;
  loadProfileId: TelemetryLoadProfileId;
  series: TelemetryPoint[];
  kpis: {
    totalRequests: number;
    peakThroughputLabel: string;
    settledSuccessRatePct: number;
    unrecoveredErrorRatePct: number;
    bufferedRetryCount: number;
    hmacRejectedCount: number;
    p95LatencyMs: number;
  };
  railBreakdown: RailBreakdownRow[];
}

export const SLA_SUCCESS_TARGET_PCT = 99.5;

export interface DailySuccessRatePoint {
  dayLabel: string;
  dayIndex: number;
  successRatePct: number;
  slaTargetPct: number;
  totalTransactions: number;
  settledCount: number;
  recoveredCount: number;
  failedCount: number;
}

export interface ThirtyDaySuccessHistory {
  railId: TelemetryRailId;
  loadProfileId: TelemetryLoadProfileId;
  slaTargetPct: number;
  points: DailySuccessRatePoint[];
  kpis: {
    averageSuccessRatePct: number;
    minSuccessRatePct: number;
    maxSuccessRatePct: number;
    daysMeetingSla: number;
    trendDeltaPct: number;
    latestSuccessRatePct: number;
  };
}

interface RailSpec {
  id: Exclude<TelemetryRailId, 'all'>;
  name: string;
  protocol: string;
  baseShare: number;
  baseRpm: number;
  baseRetryPct: number;
  baseRejectPct: number;
  baseErrorPct: number;
  baseP95Ms: number;
}

const RAIL_SPECS: RailSpec[] = [
  {
    id: 'mtn_momo',
    name: 'MTN MoMo Collection',
    protocol: 'REST + HMAC-SHA256 Webhook',
    baseShare: 44,
    baseRpm: 168,
    baseRetryPct: 0.72,
    baseRejectPct: 0.14,
    baseErrorPct: 0.03,
    baseP95Ms: 245,
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money Gateway',
    protocol: 'Callback + Status Poll',
    baseShare: 29,
    baseRpm: 112,
    baseRetryPct: 0.94,
    baseRejectPct: 0.16,
    baseErrorPct: 0.04,
    baseP95Ms: 280,
  },
  {
    id: 'ura_efris',
    name: 'URA EFRIS Fiscalization',
    protocol: 'Signed JSON Queue + Retry',
    baseShare: 15,
    baseRpm: 58,
    baseRetryPct: 1.85,
    baseRejectPct: 0.05,
    baseErrorPct: 0.06,
    baseP95Ms: 620,
  },
  {
    id: 'bank_eft',
    name: 'Bank EFT / ISO 20022',
    protocol: 'mTLS Webhook + SFTP Batch',
    baseShare: 12,
    baseRpm: 46,
    baseRetryPct: 0.25,
    baseRejectPct: 0.04,
    baseErrorPct: 0.02,
    baseP95Ms: 190,
  },
];

const WINDOW_BUCKETS: Record<TelemetryWindowId, string[]> = {
  '1h': ['00m', '05m', '10m', '15m', '20m', '25m', '30m', '35m', '40m', '45m', '50m', '55m'],
  '24h': ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

const WINDOW_MULTIPLIER: Record<TelemetryWindowId, { volume: number; unitSuffix: string }> = {
  '1h': { volume: 5, unitSuffix: '/5m' },
  '24h': { volume: 92, unitSuffix: '/2h' },
  '7d': { volume: 1100, unitSuffix: '/day' },
};

const LOAD_MULTIPLIERS: Record<
  TelemetryLoadProfileId,
  { volumeFactor: number; retryFactor: number; rejectFactor: number; latencyFactor: number; errorFactor: number }
> = {
  nominal: {
    volumeFactor: 1.0,
    retryFactor: 1.0,
    rejectFactor: 1.0,
    latencyFactor: 1.0,
    errorFactor: 1.0,
  },
  month_end_spike: {
    volumeFactor: 2.35,
    retryFactor: 1.45,
    rejectFactor: 1.15,
    latencyFactor: 1.32,
    errorFactor: 1.25,
  },
  carrier_jitter: {
    volumeFactor: 0.92,
    retryFactor: 4.1,
    rejectFactor: 2.2,
    latencyFactor: 1.85,
    errorFactor: 1.65,
  },
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function deterministicWave(index: number, total: number, profile: TelemetryLoadProfileId): number {
  const phase = (index / Math.max(1, total - 1)) * Math.PI * 2;
  const businessCurve = 0.88 + 0.24 * Math.sin(phase - 0.6) + 0.08 * Math.cos(phase * 2);
  if (profile === 'month_end_spike') {
    const spikeBoost = index >= Math.floor(total * 0.55) && index <= Math.floor(total * 0.85) ? 1.35 : 0.92;
    return businessCurve * spikeBoost;
  }
  if (profile === 'carrier_jitter') {
    const jitterWave = index % 3 === 1 ? 0.78 : index % 2 === 0 ? 1.12 : 0.95;
    return businessCurve * jitterWave;
  }
  return businessCurve;
}

export function generateIntegrationTelemetry(params: {
  windowId: TelemetryWindowId;
  railId: TelemetryRailId;
  loadProfileId: TelemetryLoadProfileId;
  sandboxOverlay?: SandboxOverlayDelta;
}): TelemetryDashboardSnapshot {
  const { windowId, railId, loadProfileId, sandboxOverlay } = params;
  const buckets = WINDOW_BUCKETS[windowId];
  const windowCfg = WINDOW_MULTIPLIER[windowId];
  const loadCfg = LOAD_MULTIPLIERS[loadProfileId];

  const activeSpecs =
    railId === 'all' ? RAIL_SPECS : RAIL_SPECS.filter((r) => r.id === railId);

  const combinedBaseRpm = activeSpecs.reduce((acc, r) => acc + r.baseRpm, 0);
  const weightedRetryBase =
    activeSpecs.reduce((acc, r) => acc + r.baseRetryPct * r.baseRpm, 0) / Math.max(1, combinedBaseRpm);
  const weightedRejectBase =
    activeSpecs.reduce((acc, r) => acc + r.baseRejectPct * r.baseRpm, 0) / Math.max(1, combinedBaseRpm);
  const weightedErrorBase =
    activeSpecs.reduce((acc, r) => acc + r.baseErrorPct * r.baseRpm, 0) / Math.max(1, combinedBaseRpm);
  const weightedP95Base =
    activeSpecs.reduce((acc, r) => acc + r.baseP95Ms * r.baseRpm, 0) / Math.max(1, combinedBaseRpm);

  const series: TelemetryPoint[] = buckets.map((bucket, idx) => {
    const wave = deterministicWave(idx, buckets.length, loadProfileId);
    const totalInBucket = Math.max(
      12,
      Math.round(combinedBaseRpm * windowCfg.volume * loadCfg.volumeFactor * wave)
    );

    const jitterPulse = loadProfileId === 'carrier_jitter' && idx % 3 === 1 ? 1.55 : 1.0;

    const retryPct = round2(weightedRetryBase * loadCfg.retryFactor * jitterPulse);
    const rejectPct = round2(weightedRejectBase * loadCfg.rejectFactor * (idx % 4 === 2 ? 1.3 : 0.95));
    const errorPct = round2(weightedErrorBase * loadCfg.errorFactor * (jitterPulse > 1 ? 1.2 : 0.95));

    const baseBufferedRetry = Math.round((totalInBucket * retryPct) / 100);
    const baseHmacRejected = Math.round((totalInBucket * rejectPct) / 100);
    const unrecovered = Math.round((totalInBucket * errorPct) / 100);
    const idempotentNoOp = Math.max(
      1,
      Math.round(baseBufferedRetry * 0.48) + Math.round(totalInBucket * 0.012)
    );
    const baseSettled = Math.max(
      1,
      totalInBucket - baseBufferedRetry - baseHmacRejected - unrecovered
    );

    const isLatest = idx === buckets.length - 1;
    const bufferedRetry = baseBufferedRetry + (isLatest ? sandboxOverlay?.queuedRetries ?? 0 : 0);
    const hmacRejected = baseHmacRejected + (isLatest ? sandboxOverlay?.rejectedSignatures ?? 0 : 0);
    const settled = baseSettled + (isLatest ? sandboxOverlay?.ledgerCommits ?? 0 : 0);

    const bucketDenom = Math.max(1, settled + idempotentNoOp + bufferedRetry + hmacRejected + unrecovered);
    const effectiveRetryPct = round2((bufferedRetry / bucketDenom) * 100);
    const effectiveRejectPct = round2((hmacRejected / bucketDenom) * 100);
    const effectiveErrorPct = round2((unrecovered / bucketDenom) * 100);

    const p95LatencyMs = Math.round(
      weightedP95Base *
        loadCfg.latencyFactor *
        (0.92 + 0.16 * (wave - 0.8)) *
        (jitterPulse > 1 ? 1.22 : 1.0)
    );

    return {
      bucket,
      settled,
      idempotentNoOp,
      bufferedRetry,
      hmacRejected,
      unrecoveredErrorRatePct: effectiveErrorPct,
      bufferedRetryRatePct: effectiveRetryPct,
      hmacRejectRatePct: effectiveRejectPct,
      p95LatencyMs,
    };
  });

  const totals = series.reduce(
    (acc, pt) => {
      acc.settled += pt.settled;
      acc.noOp += pt.idempotentNoOp;
      acc.queued += pt.bufferedRetry;
      acc.rejected += pt.hmacRejected;
      acc.peak = Math.max(acc.peak, pt.settled + pt.idempotentNoOp);
      acc.maxP95 = Math.max(acc.maxP95, pt.p95LatencyMs);
      acc.errSum += pt.unrecoveredErrorRatePct;
      return acc;
    },
    { settled: 0, noOp: 0, queued: 0, rejected: 0, peak: 0, maxP95: 0, errSum: 0 }
  );

  const totalRequests = totals.settled + totals.noOp + totals.queued + totals.rejected;
  const settledSuccessRatePct = round2(
    ((totals.settled + totals.noOp) / Math.max(1, totalRequests)) * 100
  );
  const unrecoveredErrorRatePct = round2(totals.errSum / Math.max(1, series.length));

  const railBreakdown: RailBreakdownRow[] = RAIL_SPECS.map((spec) => {
    const requestsInWindow = Math.round(
      spec.baseRpm * windowCfg.volume * buckets.length * loadCfg.volumeFactor
    );
    return {
      railId: spec.id,
      name: spec.name,
      protocol: spec.protocol,
      throughputSharePct: spec.baseShare,
      requestsInWindow,
      bufferedRetryRatePct: round2(spec.baseRetryPct * loadCfg.retryFactor),
      hmacRejectRatePct: round2(spec.baseRejectPct * loadCfg.rejectFactor),
      unrecoveredErrorRatePct: round2(spec.baseErrorPct * loadCfg.errorFactor),
      p95LatencyMs: Math.round(spec.baseP95Ms * loadCfg.latencyFactor),
    };
  });

  return {
    windowId,
    railId,
    loadProfileId,
    series,
    kpis: {
      totalRequests,
      peakThroughputLabel: `${totals.peak.toLocaleString('en-US')} tx${windowCfg.unitSuffix}`,
      settledSuccessRatePct,
      unrecoveredErrorRatePct,
      bufferedRetryCount: totals.queued,
      hmacRejectedCount: totals.rejected,
      p95LatencyMs: totals.maxP95,
    },
    railBreakdown,
  };
}

export function generate30DaySuccessHistory(params: {
  railId: TelemetryRailId;
  loadProfileId: TelemetryLoadProfileId;
  sandboxOverlay?: SandboxOverlayDelta;
}): ThirtyDaySuccessHistory {
  const { railId, loadProfileId, sandboxOverlay } = params;
  const activeSpecs =
    railId === 'all' ? RAIL_SPECS : RAIL_SPECS.filter((r) => r.id === railId);
  const combinedBaseRpm = activeSpecs.reduce((acc, r) => acc + r.baseRpm, 0);
  const weightedBaseLossPct =
    activeSpecs.reduce(
      (acc, r) => acc + (r.baseErrorPct + r.baseRejectPct * 0.45 + r.baseRetryPct * 0.12) * r.baseRpm,
      0
    ) / Math.max(1, combinedBaseRpm);

  const loadCfg = LOAD_MULTIPLIERS[loadProfileId];
  const dayCount = 30;
  const points: DailySuccessRatePoint[] = [];

  for (let i = 0; i < dayCount; i++) {
    const daysAgo = dayCount - 1 - i;
    const dayLabel = daysAgo === 0 ? 'Today' : `D-${String(daysAgo).padStart(2, '0')}`;
    const wave = deterministicWave(i, dayCount, loadProfileId);
    const totalTransactions = Math.max(
      120,
      Math.round(combinedBaseRpm * 42 * loadCfg.volumeFactor * wave)
    );

    const seasonalDip =
      loadProfileId === 'carrier_jitter'
        ? (i % 5 === 2 ? 1.85 : i % 7 === 4 ? 1.45 : 1.0)
        : loadProfileId === 'month_end_spike'
        ? (i >= 24 ? 1.35 : 0.96)
        : i === 11 || i === 22
        ? 1.25
        : 0.92;

    const gradualImprovement = 1.0 - (i / dayCount) * 0.14;
    const effectiveLossPct = weightedBaseLossPct * loadCfg.errorFactor * seasonalDip * gradualImprovement;

    const rawFailed = Math.max(0, Math.round((totalTransactions * effectiveLossPct) / 100));
    const baseRecovered = Math.max(0, Math.round(totalTransactions * 0.008));

    const isToday = daysAgo === 0;
    const extraSettled = isToday ? sandboxOverlay?.ledgerCommits ?? 0 : 0;
    const extraQueued = isToday ? sandboxOverlay?.queuedRetries ?? 0 : 0;
    const extraRejected = isToday ? sandboxOverlay?.rejectedSignatures ?? 0 : 0;

    const failedCount = rawFailed + extraRejected;
    const recoveredCount = baseRecovered + extraQueued;
    const settledCount = Math.max(1, totalTransactions - failedCount + extraSettled);
    const denom = Math.max(1, settledCount + failedCount);
    const successRatePct = round2(Math.min(100, Math.max(85, (settledCount / denom) * 100)));

    points.push({
      dayLabel,
      dayIndex: i + 1,
      successRatePct,
      slaTargetPct: SLA_SUCCESS_TARGET_PCT,
      totalTransactions: denom,
      settledCount,
      recoveredCount,
      failedCount,
    });
  }

  const rates = points.map((p) => p.successRatePct);
  const averageSuccessRatePct = round2(
    rates.reduce((sum, val) => sum + val, 0) / points.length
  );
  const minSuccessRatePct = Math.min(...rates);
  const maxSuccessRatePct = Math.max(...rates);
  const daysMeetingSla = points.filter((p) => p.successRatePct >= SLA_SUCCESS_TARGET_PCT).length;

  const firstHalfAvg =
    rates.slice(0, 15).reduce((sum, val) => sum + val, 0) / 15;
  const secondHalfAvg =
    rates.slice(15).reduce((sum, val) => sum + val, 0) / 15;
  const trendDeltaPct = round2(secondHalfAvg - firstHalfAvg);
  const latestSuccessRatePct = points[points.length - 1].successRatePct;

  return {
    railId,
    loadProfileId,
    slaTargetPct: SLA_SUCCESS_TARGET_PCT,
    points,
    kpis: {
      averageSuccessRatePct,
      minSuccessRatePct,
      maxSuccessRatePct,
      daysMeetingSla,
      trendDeltaPct,
      latestSuccessRatePct,
    },
  };
}

