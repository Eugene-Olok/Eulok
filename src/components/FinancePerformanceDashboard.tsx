import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  generateIntegrationTelemetry,
  generate30DaySuccessHistory,
  type DailySuccessRatePoint,
  type SandboxOverlayDelta,
  type TelemetryLoadProfileId,
  type TelemetryRailId,
  type TelemetryWindowId,
} from '../engine/integrationTelemetry';

interface FinancePerformanceDashboardProps {
  sandboxOverlay?: SandboxOverlayDelta;
}

const WINDOW_OPTIONS: { id: TelemetryWindowId; label: string }[] = [
  { id: '1h', label: '1H Window' },
  { id: '24h', label: '24H Window' },
  { id: '7d', label: '7D Window' },
];

const RAIL_OPTIONS: { id: TelemetryRailId; label: string }[] = [
  { id: 'all', label: 'All Payment Rails' },
  { id: 'mtn_momo', label: 'MTN MoMo' },
  { id: 'airtel_money', label: 'Airtel Money' },
  { id: 'ura_efris', label: 'URA EFRIS' },
  { id: 'bank_eft', label: 'Bank EFT' },
];

const LOAD_OPTIONS: { id: TelemetryLoadProfileId; label: string }[] = [
  { id: 'nominal', label: 'Nominal Traffic' },
  { id: 'month_end_spike', label: 'Month-End Spike' },
  { id: 'carrier_jitter', label: 'Carrier Jitter & Retries' },
];

interface TooltipPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
  payload?: DailySuccessRatePoint;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadEntry[];
  mode: 'throughput' | 'errors' | 'history30d';
}

const TelemetryTooltip: React.FC<CustomTooltipProps> = ({ active, label, payload, mode }) => {
  if (!active || !payload || payload.length === 0) return null;

  const historyPoint = mode === 'history30d' ? payload[0]?.payload : undefined;

  return (
    <div
      className="surface-panel"
      style={{
        border: '1px solid var(--line-strong)',
        borderRadius: '8px',
        padding: '10px 12px',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
        fontSize: '0.78rem',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: 'var(--warm-white)',
          marginBottom: '6px',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {payload.map((entry, idx) => {
          const val = typeof entry.value === 'number' ? entry.value : Number(entry.value ?? 0);
          const suffix =
            mode === 'history30d'
              ? '%'
              : mode === 'errors'
              ? entry.dataKey === 'p95LatencyMs'
                ? ' ms'
                : '%'
              : ' tx';
          return (
            <div
              key={`${entry.name}-${idx}`}
              style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}
            >
              <span style={{ color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    background: entry.color || 'var(--electric-blue)',
                    display: 'inline-block',
                  }}
                />
                {entry.name}
              </span>
              <strong style={{ color: 'var(--warm-white)', fontFamily: 'var(--font-mono)' }}>
                {mode === 'history30d' || (mode === 'errors' && entry.dataKey !== 'p95LatencyMs')
                  ? val.toFixed(2)
                  : val.toLocaleString('en-US')}
                {suffix}
              </strong>
            </div>
          );
        })}

        {historyPoint && (
          <div
            style={{
              marginTop: '4px',
              paddingTop: '6px',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
            }}
          >
            <div>Settled: {historyPoint.settledCount.toLocaleString('en-US')} tx</div>
            <div>Recovered Retries: {historyPoint.recoveredCount.toLocaleString('en-US')} tx</div>
            <div>Unrecovered / Rejected: {historyPoint.failedCount.toLocaleString('en-US')} tx</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const FinancePerformanceDashboard: React.FC<FinancePerformanceDashboardProps> = ({
  sandboxOverlay,
}) => {
  const [windowId, setWindowId] = useState<TelemetryWindowId>('24h');
  const [railId, setRailId] = useState<TelemetryRailId>('all');
  const [loadProfileId, setLoadProfileId] = useState<TelemetryLoadProfileId>('nominal');
  const [chartsMounted, setChartsMounted] = useState<boolean>(false);

  useEffect(() => {
    setChartsMounted(true);
  }, []);

  const snapshot = useMemo(
    () =>
      generateIntegrationTelemetry({
        windowId,
        railId,
        loadProfileId,
        sandboxOverlay,
      }),
    [windowId, railId, loadProfileId, sandboxOverlay]
  );

  const history30d = useMemo(
    () =>
      generate30DaySuccessHistory({
        railId,
        loadProfileId,
        sandboxOverlay,
      }),
    [railId, loadProfileId, sandboxOverlay]
  );

  const hasSandboxEvents =
    (sandboxOverlay?.ledgerCommits ?? 0) +
      (sandboxOverlay?.queuedRetries ?? 0) +
      (sandboxOverlay?.rejectedSignatures ?? 0) >
    0;

  return (
    <section
      className="section-full theme-navy band-section"
      id="performance-telemetry"
      aria-labelledby="performance-telemetry-heading"
      style={{ scrollMarginTop: '92px' }}
    >
      <div className="container-expansive">
        <span className="eyebrow">Adapter Benchmark Model · Throughput, Error &amp; SLA Telemetry</span>
        <h2 id="performance-telemetry-heading">
          Transaction Throughput &amp; Error Rate Dashboard
        </h2>
        <p className="lead" style={{ maxWidth: '70ch' }}>
          Reference adapter load-profile visualizer modeling settled transactions, idempotent deduplications, buffered carrier timeouts, fail-closed HMAC rejections, and 30-day settlement success history. Dispatches executed in the Webhook Sandbox above automatically increment today&apos;s active bucket.
        </p>

        <div
          className="card"
          style={{
            borderColor: 'var(--line-strong)',
            padding: 'clamp(16px, 3vw, 28px)',
            marginTop: '24px',
          }}
        >
          {/* Filter & Load Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }} role="group" aria-label="Telemetry time window">
              {WINDOW_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={windowId === opt.id}
                  className={`button button-small ${windowId === opt.id ? 'button-primary' : 'button-quiet'}`}
                  onClick={() => setWindowId(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }} role="group" aria-label="Traffic load profile">
              {LOAD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={loadProfileId === opt.id}
                  className={`button button-small ${loadProfileId === opt.id ? 'button-primary' : 'button-quiet'}`}
                  onClick={() => setLoadProfileId(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rail Filter Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }} role="group" aria-label="Payment rail filter">
              {RAIL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={railId === opt.id}
                  className={`button button-small ${railId === opt.id ? 'button-primary' : 'button-quiet'}`}
                  onClick={() => setRailId(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <span className="mono-tag" style={{ fontSize: '0.74rem', color: hasSandboxEvents ? 'var(--electric-blue)' : 'var(--text-muted)' }}>
              {hasSandboxEvents
                ? `Sandbox delta active (+${sandboxOverlay?.ledgerCommits ?? 0} settled · +${sandboxOverlay?.queuedRetries ?? 0} queued · +${sandboxOverlay?.rejectedSignatures ?? 0} rejected)`
                : 'Reference load-test profile'}
            </span>
          </div>

          {/* 4-Column KPI Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 175px), 1fr))',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <div className="surface-inset" style={{ padding: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                PEAK THROUGHPUT
              </span>
              <strong
                data-testid="telemetry-kpi-throughput"
                style={{ fontSize: '1.22rem', color: 'var(--electric-blue)', fontVariantNumeric: 'tabular-nums' }}
              >
                {snapshot.kpis.peakThroughputLabel}
              </strong>
            </div>

            <div className="surface-inset" style={{ padding: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                CLEAN DELIVERY RATE
              </span>
              <strong
                data-testid="telemetry-kpi-delivery"
                style={{ fontSize: '1.22rem', color: 'var(--status-pass-text)', fontVariantNumeric: 'tabular-nums' }}
              >
                {snapshot.kpis.settledSuccessRatePct.toFixed(2)}%
              </strong>
            </div>

            <div className="surface-inset" style={{ padding: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                UNRECOVERED 5XX RATE
              </span>
              <strong
                data-testid="telemetry-kpi-error-rate"
                style={{ fontSize: '1.22rem', color: 'var(--status-fail-text)', fontVariantNumeric: 'tabular-nums' }}
              >
                {snapshot.kpis.unrecoveredErrorRatePct.toFixed(2)}%
              </strong>
            </div>

            <div className="surface-inset" style={{ padding: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                MAX P95 ADAPTER LATENCY
              </span>
              <strong
                data-testid="telemetry-kpi-latency"
                style={{ fontSize: '1.22rem', color: 'var(--warm-white)', fontVariantNumeric: 'tabular-nums' }}
              >
                {snapshot.kpis.p95LatencyMs} ms
              </strong>
            </div>
          </div>

          {/* Dual Responsive Charts */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            {/* Chart 1: Transaction Throughput & Deduplication */}
            <div className="surface-inset" style={{ padding: '16px', minWidth: 0 }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.94rem', color: 'var(--warm-white)', display: 'block' }}>
                  Transaction Throughput &amp; Idempotent Handling
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  Total volume: {snapshot.kpis.totalRequests.toLocaleString('en-US')} processed requests
                </span>
              </div>

              <div style={{ width: '100%', height: '270px', minWidth: 0 }} data-testid="throughput-chart-container">
                {chartsMounted ? (
                  <ResponsiveContainer width="100%" height={270}>
                    <ComposedChart data={snapshot.series} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id="settledAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.38} />
                          <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                      <XAxis
                        dataKey="bucket"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--line)' }}
                        tickLine={false}
                      />
                      <YAxis
                        width={46}
                        tickFormatter={(v: number) =>
                          v >= 1_000_000
                            ? `${(v / 1_000_000).toFixed(1)}M`
                            : v >= 1_000
                            ? `${Math.round(v / 1_000)}k`
                            : String(v)
                        }
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<TelemetryTooltip mode="throughput" />} />
                      <Legend
                        iconSize={9}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                        formatter={(value) => (
                          <span style={{ color: 'var(--text-subtle)', marginRight: '10px' }}>{value}</span>
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="settled"
                        name="Settled (200 OK)"
                        stroke="#38BDF8"
                        strokeWidth={2}
                        fill="url(#settledAreaGrad)"
                        isAnimationActive={false}
                      />
                      <Bar
                        dataKey="idempotentNoOp"
                        name="Idempotent No-Op"
                        fill="#818CF8"
                        radius={[3, 3, 0, 0]}
                        barSize={12}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="bufferedRetry"
                        name="Buffered Queue (202)"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ width: '100%', height: '270px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    Initializing throughput visualization…
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Error Rates & P95 Latency */}
            <div className="surface-inset" style={{ padding: '16px', minWidth: 0 }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.94rem', color: 'var(--warm-white)', display: 'block' }}>
                  Error Rate Breakdown (%) &amp; P95 Latency
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  Buffered timeouts: {snapshot.kpis.bufferedRetryCount.toLocaleString('en-US')} · 401 rejections: {snapshot.kpis.hmacRejectedCount.toLocaleString('en-US')}
                </span>
              </div>

              <div style={{ width: '100%', height: '270px', minWidth: 0 }} data-testid="error-rate-chart-container">
                {chartsMounted ? (
                  <ResponsiveContainer width="100%" height={270}>
                    <ComposedChart data={snapshot.series} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                      <XAxis
                        dataKey="bucket"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--line)' }}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        unit="%"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        unit="ms"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<TelemetryTooltip mode="errors" />} />
                      <Legend
                        iconSize={9}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                        formatter={(value) => (
                          <span style={{ color: 'var(--text-subtle)', marginRight: '10px' }}>{value}</span>
                        )}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="bufferedRetryRatePct"
                        name="Timeout Retry %"
                        fill="#F59E0B"
                        radius={[3, 3, 0, 0]}
                        barSize={10}
                        isAnimationActive={false}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="hmacRejectRatePct"
                        name="401 HMAC Reject %"
                        fill="#EF4444"
                        radius={[3, 3, 0, 0]}
                        barSize={10}
                        isAnimationActive={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="unrecoveredErrorRatePct"
                        name="Unrecovered 5xx %"
                        stroke="#FB7185"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        isAnimationActive={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="p95LatencyMs"
                        name="P95 Latency (ms)"
                        stroke="#34D399"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ width: '100%', height: '270px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    Initializing error-rate telemetry…
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart 3: 30-Day Historical Transaction Success Rate LineChart */}
          <div
            id="30-day-success-rate"
            className="surface-inset"
            style={{
              padding: 'clamp(16px, 2.5vw, 22px)',
              marginBottom: '20px',
              minWidth: 0,
              scrollMarginTop: '92px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)', display: 'block', marginBottom: '4px' }}>
                  30-DAY ROLLING SLA TRAJECTORY
                </span>
                <strong style={{ fontSize: '1.02rem', color: 'var(--warm-white)', display: 'block' }}>
                  Historical Transaction Success Rate (Last 30 Days)
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Synchronized to selected payment rail &amp; load profile against {history30d.slaTargetPct}% target floor
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge badge-pass" data-testid="history-30d-avg-badge">
                  30D Avg: {history30d.kpis.averageSuccessRatePct.toFixed(2)}%
                </span>
                <span className="badge badge-neutral" data-testid="history-30d-sla-badge">
                  {history30d.kpis.daysMeetingSla}/30 Days ≥ {history30d.slaTargetPct}% SLA
                </span>
                <span
                  className={`badge ${history30d.kpis.trendDeltaPct >= 0 ? 'badge-pass' : 'badge-warn'}`}
                  data-testid="history-30d-delta-badge"
                >
                  {history30d.kpis.trendDeltaPct >= 0 ? '+' : ''}
                  {history30d.kpis.trendDeltaPct.toFixed(2)}% 15D Delta
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 145px), 1fr))',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <div className="surface-panel" style={{ padding: '10px 12px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>30D MEAN SUCCESS</span>
                <strong style={{ fontSize: '1.08rem', color: 'var(--electric-blue)', fontVariantNumeric: 'tabular-nums' }}>
                  {history30d.kpis.averageSuccessRatePct.toFixed(2)}%
                </strong>
              </div>
              <div className="surface-panel" style={{ padding: '10px 12px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>TODAY LIVE BUCKET</span>
                <strong style={{ fontSize: '1.08rem', color: 'var(--status-pass-text)', fontVariantNumeric: 'tabular-nums' }}>
                  {history30d.kpis.latestSuccessRatePct.toFixed(2)}%
                </strong>
              </div>
              <div className="surface-panel" style={{ padding: '10px 12px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>30D FLOOR (MIN)</span>
                <strong style={{ fontSize: '1.08rem', color: 'var(--status-warn-text)', fontVariantNumeric: 'tabular-nums' }}>
                  {history30d.kpis.minSuccessRatePct.toFixed(2)}%
                </strong>
              </div>
              <div className="surface-panel" style={{ padding: '10px 12px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>30D PEAK (MAX)</span>
                <strong style={{ fontSize: '1.08rem', color: 'var(--warm-white)', fontVariantNumeric: 'tabular-nums' }}>
                  {history30d.kpis.maxSuccessRatePct.toFixed(2)}%
                </strong>
              </div>
            </div>

            <div
              style={{ width: '100%', height: '280px', minWidth: 0 }}
              data-testid="success-rate-30d-chart-container"
            >
              {chartsMounted ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={history30d.points}
                    margin={{ top: 10, right: 18, left: 2, bottom: 14 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                    <XAxis
                      dataKey="dayLabel"
                      interval={4}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--line)' }}
                      tickLine={false}
                    />
                    <YAxis
                      width={52}
                      domain={[
                        (dataMin: number) => Number(Math.max(90, Math.floor((dataMin - 0.3) * 10) / 10).toFixed(1)),
                        100,
                      ]}
                      tickFormatter={(v: number) => `${Number(v).toFixed(1)}%`}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<TelemetryTooltip mode="history30d" />} />
                    <Legend
                      iconSize={10}
                      wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                      formatter={(value) => (
                        <span style={{ color: 'var(--text-subtle)', marginRight: '12px' }}>{value}</span>
                      )}
                    />
                    <ReferenceLine
                      y={history30d.slaTargetPct}
                      stroke="var(--status-pass-text)"
                      strokeDasharray="4 4"
                      label={{
                        value: `${history30d.slaTargetPct}% SLA Floor`,
                        position: 'insideTopRight',
                        fill: 'var(--status-pass-text)',
                        fontSize: 11,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="successRatePct"
                      name="Daily Settlement Success Rate (%)"
                      stroke="#38BDF8"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: '#38BDF8', fill: 'var(--bg-primary)' }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ width: '100%', height: '270px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Initializing 30-day historical success rate line chart…
                </div>
              )}
            </div>
          </div>

          {/* Per-Rail Benchmark Breakdown Table */}
          <div className="table-wrapper" style={{ margin: 0 }}>
            <table style={{ width: '100%', fontVariantNumeric: 'tabular-nums' }}>
              <thead>
                <tr>
                  <th>Integration Rail</th>
                  <th>Adapter Pattern</th>
                  <th style={{ textAlign: 'right' }}>Traffic Share</th>
                  <th style={{ textAlign: 'right' }}>Retry Rate</th>
                  <th style={{ textAlign: 'right' }}>401 Rejects</th>
                  <th style={{ textAlign: 'right' }}>5xx Error</th>
                  <th style={{ textAlign: 'right' }}>P95 Latency</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.railBreakdown.map((row) => {
                  const isFocused = railId === 'all' || railId === row.railId;
                  return (
                    <tr
                      key={row.railId}
                      style={{
                        opacity: isFocused ? 1 : 0.45,
                      }}
                    >
                      <td>
                        <strong style={{ color: 'var(--warm-white)' }}>{row.name}</strong>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                        {row.protocol}
                      </td>
                      <td style={{ textAlign: 'right' }}>{row.throughputSharePct}%</td>
                      <td style={{ textAlign: 'right', color: 'var(--status-warn-text)' }}>
                        {row.bufferedRetryRatePct.toFixed(2)}%
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--status-fail-text)' }}>
                        {row.hmacRejectRatePct.toFixed(2)}%
                      </td>
                      <td style={{ textAlign: 'right' }}>{row.unrecoveredErrorRatePct.toFixed(2)}%</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {row.p95LatencyMs} ms
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

