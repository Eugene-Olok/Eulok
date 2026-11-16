import { navigateTo, openIntakeModal, type IntakePrefillContext } from '../utils/navigation';
import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Download,
  RotateCcw,
} from 'lucide-react';
import {
  RESCUE_DIAGNOSTIC_CHECKS,
  evaluateRescueReadiness,
} from '../engine/rescueDiagnostic';

interface RescuePageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: (serviceOrContext?: string | IntakePrefillContext) => void;
}

const DEFAULT_PASSING_CHECKS = ['observability_logs', 'architecture_ownership'];

export const RescuePage: React.FC<RescuePageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  const [passingCheckIds, setPassingCheckIds] = useState<string[]>(DEFAULT_PASSING_CHECKS);

  const diagnostic = useMemo(
    () => evaluateRescueReadiness(passingCheckIds),
    [passingCheckIds]
  );

  const toggleCheck = (checkId: string) => {
    setPassingCheckIds((prev) =>
      prev.includes(checkId) ? prev.filter((id) => id !== checkId) : [...prev, checkId]
    );
  };

  const applyDiagnosticPreset = (preset: 'crisis' | 'stalled' | 'healthy') => {
    if (preset === 'crisis') {
      setPassingCheckIds([]);
    } else if (preset === 'stalled') {
      setPassingCheckIds(['observability_logs', 'architecture_ownership']);
    } else {
      setPassingCheckIds(RESCUE_DIAGNOSTIC_CHECKS.map((c) => c.id));
    }
  };

  const handleDownloadTriageReport = () => {
    if (typeof document === 'undefined') return;
    const blob = new Blob([diagnostic.triageSummaryMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eulok-rescue-triage-${diagnostic.readinessPosture.toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleHandoffToIntake = () => {
    const context: IntakePrefillContext = {
      need: 'Fix or rescue existing software',
      systemType: 'Existing codebase / stalled project rescue',
      problemDescription: diagnostic.triageSummaryMarkdown,
      specSummary: `${diagnostic.postureLabel} (${diagnostic.passingChecks.length}/${RESCUE_DIAGNOSTIC_CHECKS.length} checks passing · ${diagnostic.p0Count} P0, ${diagnostic.p1Count} P1, ${diagnostic.p2Count} P2)`,
    };

    if (onOpenIntakeModal !== openIntakeModal) {
      openIntakeModal(context);
      onOpenIntakeModal(context);
      return;
    }
    openIntakeModal(context);
  };

  const postureStyle =
    diagnostic.readinessPosture === 'STABILIZE_IMMEDIATELY'
      ? { color: 'var(--status-fail-text)', border: 'var(--status-fail-border)', badge: 'badge-fail' }
      : diagnostic.readinessPosture === 'CONTAINMENT_REQUIRED'
      ? { color: 'var(--status-warn-text)', border: 'var(--status-warn-border)', badge: 'badge-warn' }
      : diagnostic.readinessPosture === 'TARGETED_HARDENING'
      ? { color: 'var(--electric-blue)', border: 'var(--line-strong)', badge: 'badge-neutral' }
      : { color: 'var(--status-pass-text)', border: 'var(--status-pass-border)', badge: 'badge-pass' };

  return (
    <>
      {/* Rescue Hero */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 0 60px' }}>
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <button type="button" onClick={() => onNavigate('services')}>Services</button>
            <span className="separator">/</span>
            <span aria-current="page">Software Rescue</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">RESCUE & STABILIZATION ENGINEERING</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', marginBottom: '20px' }}>
              Your software is stuck. Let's establish why.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch' }}>
              When releases break, contractors disappear, integrations drop transactions, or a codebase becomes too fragile to modify, a total rebuild is rarely the first answer. We audit the reality, reproduce failure modes, and stabilize the system with verifiable acceptance criteria.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '32px' }}>
              <button
                type="button"
                className="button button-primary"
                onClick={() => handleHandoffToIntake()}
              >
                <span>Discuss a software rescue</span>
                <ArrowRight size={16} />
              </button>
              <a
                href="#rescue-triage"
                className="button button-quiet"
              >
                Run 8-Point Rescue Triage
              </a>
              <button
                type="button"
                className="button button-quiet"
                onClick={() => onNavigate('work')}
              >
                Inspect our delivery standards
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Rescue Readiness Triage & Scorecard */}
      <section
        id="rescue-triage"
        className="section-full theme-navy"
        style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderTop: '1px solid var(--line)' }}
      >
        <div className="container-expansive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
            <div style={{ maxWidth: '740px' }}>
              <span className="eyebrow">Interactive Triage Tool · Deterministic Audit</span>
              <h2 style={{ marginBottom: '10px' }}>Live Software Rescue Readiness Scorecard</h2>
              <p className="lead" style={{ marginBottom: 0 }}>
                Check every safeguard that is verified and true in your current codebase today. Unchecked items are ranked automatically into P0, P1, and P2 stabilization work.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} role="group" aria-label="Triage scenario presets">
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => applyDiagnosticPreset('crisis')}
              >
                0/8 Crisis State
              </button>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => applyDiagnosticPreset('stalled')}
              >
                Typical Stalled Build
              </button>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => applyDiagnosticPreset('healthy')}
              >
                8/8 Healthy Baseline
              </button>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => setPassingCheckIds(DEFAULT_PASSING_CHECKS)}
                aria-label="Reset triage checklist"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left: 8-Point Checklist */}
            <div className="card" style={{ background: 'var(--bg-primary)', padding: 'clamp(20px, 3vw, 28px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>8 Engineering Safeguard Checks</h3>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)', fontVariantNumeric: 'tabular-nums' }}>
                  {diagnostic.passingChecks.length} / {RESCUE_DIAGNOSTIC_CHECKS.length} VERIFIED
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {RESCUE_DIAGNOSTIC_CHECKS.map((check) => {
                  const isPassing = passingCheckIds.includes(check.id);
                  const priorityBadge =
                    check.priorityIfFailing === 'P0'
                      ? 'badge-fail'
                      : check.priorityIfFailing === 'P1'
                      ? 'badge-warn'
                      : 'badge-neutral';

                  return (
                    <label
                      key={check.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: isPassing ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-secondary)',
                        border: `1px solid ${isPassing ? 'var(--status-pass-border)' : 'var(--line)'}`,
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease, background 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isPassing}
                        onChange={() => toggleCheck(check.id)}
                        style={{ marginTop: '4px', width: '16px', height: '16px', accentColor: 'var(--electric-blue)', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--warm-white)' }}>
                            {check.label}
                          </strong>
                          <span className={`badge ${isPassing ? 'badge-pass' : priorityBadge}`}>
                            {isPassing ? 'PASS' : `${check.priorityIfFailing} RISK`}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-subtle)', lineHeight: 1.45 }}>
                          {check.question}
                        </p>
                        {!isPassing && (
                          <p style={{ margin: '6px 0 0', fontSize: '0.77rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                            Exposure: {check.failureImpact}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Right: Live Posture & Prioritized Remediation Output */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                className="card"
                style={{
                  background: 'var(--bg-primary)',
                  border: `1px solid ${postureStyle.border}`,
                  padding: 'clamp(20px, 3vw, 28px)',
                }}
                aria-live="polite"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>DIAGNOSTIC POSTURE</span>
                  <span className={`badge ${postureStyle.badge}`}>{diagnostic.readinessPosture}</span>
                </div>

                <h3 style={{ fontSize: '1.4rem', color: postureStyle.color, marginBottom: '12px' }}>
                  {diagnostic.postureLabel}
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: '8px',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>PASSING</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--status-pass-text)', fontVariantNumeric: 'tabular-nums' }}>
                      {diagnostic.passingChecks.length}/8
                    </strong>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>P0 CRIT</span>
                    <strong style={{ fontSize: '1.2rem', color: diagnostic.p0Count > 0 ? 'var(--status-fail-text)' : 'var(--warm-white)', fontVariantNumeric: 'tabular-nums' }}>
                      {diagnostic.p0Count}
                    </strong>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>P1 HIGH</span>
                    <strong style={{ fontSize: '1.2rem', color: diagnostic.p1Count > 0 ? 'var(--status-warn-text)' : 'var(--warm-white)', fontVariantNumeric: 'tabular-nums' }}>
                      {diagnostic.p1Count}
                    </strong>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>P2 OPT</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--warm-white)', fontVariantNumeric: 'tabular-nums' }}>
                      {diagnostic.p2Count}
                    </strong>
                  </div>
                </div>

                <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--line)', marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                    Recommended Next Engagement
                  </div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--warm-white)', marginTop: '4px' }}>
                    {diagnostic.recommendedEngagement}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--electric-blue)', marginTop: '2px' }}>
                    Diagnostic window: {diagnostic.estimatedDiagnosticWindow}
                  </div>
                </div>

                {/* Prioritized Remediation Queue */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '10px' }}>
                    Prioritized Remediation Queue ({diagnostic.remediationPlan.length})
                  </div>

                  {diagnostic.remediationPlan.length === 0 ? (
                    <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--status-pass-bg)', border: '1px solid var(--status-pass-border)', color: 'var(--status-pass-text)', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} />
                      <span>All 8 baseline controls verified. Ready for targeted feature evolution or performance hardening.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                      {diagnostic.remediationPlan.map((item, idx) => (
                        <div
                          key={`${item.priority}-${idx}`}
                          style={{
                            padding: '10px 12px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--line)',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span
                              className={`badge ${
                                item.priority === 'P0' ? 'badge-fail' : item.priority === 'P1' ? 'badge-warn' : 'badge-neutral'
                              }`}
                            >
                              {item.priority}
                            </span>
                            <strong style={{ color: 'var(--warm-white)' }}>{item.area}</strong>
                          </div>
                          <div style={{ color: 'var(--text-subtle)', lineHeight: 1.45 }}>{item.action}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleHandoffToIntake}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Hand Off Triage Report to Intake</span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="button button-quiet button-small"
                    onClick={handleDownloadTriageReport}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Download size={14} />
                    <span>Download Triage Report (.md)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Failure Symptoms */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '40px' }}>
            <span className="eyebrow">Diagnostic Signals</span>
            <h2>Common breakdown patterns we remediate.</h2>
            <p className="lead">
              Software usually stalls for systematic reasons: missing integration contracts, unverified deployment steps, or unchecked scope drift.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ background: 'var(--bg-secondary)' }}>
              <span className="mono-tag" style={{ color: 'var(--status-fail-text)', display: 'block', marginBottom: '10px' }}>01 / STALLED DELIVERY</span>
              <h3>Unfinished Contractor Projects</h3>
              <p>
                An agency or freelance developer delivered half-working software, missing core edge-case handling or disappearing before production deployment.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)' }}>
              <span className="mono-tag" style={{ color: 'var(--status-fail-text)', display: 'block', marginBottom: '10px' }}>02 / SILENT ERRORS</span>
              <h3>Unreliable Integrations</h3>
              <p>
                Payment callbacks fail intermittently, mobile-money webhooks drop transactions, or sync jobs duplicate records without clear error logs.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)' }}>
              <span className="mono-tag" style={{ color: 'var(--status-fail-text)', display: 'block', marginBottom: '10px' }}>03 / FRAGILITY</span>
              <h3>Code Too Risky to Change</h3>
              <p>
                Every small bug fix triggers regression failures in unrelated modules because the architecture lacks unit tests and clear boundary isolation.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)' }}>
              <span className="mono-tag" style={{ color: 'var(--status-fail-text)', display: 'block', marginBottom: '10px' }}>04 / PERFORMANCE</span>
              <h3>Timeout Cascades & Latency</h3>
              <p>
                Database queries crawl as user volume grows, causing mobile apps to hang and customer payments to time out before confirmation.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)' }}>
              <span className="mono-tag" style={{ color: 'var(--status-fail-text)', display: 'block', marginBottom: '10px' }}>05 / BLIND SPOTS</span>
              <h3>Missing Documentation & Runbooks</h3>
              <p>
                The team lacks deployment scripts, server access maps, and database backup routines, leaving the business vulnerable to single-person departures.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)' }}>
              <span className="mono-tag" style={{ color: 'var(--status-fail-text)', display: 'block', marginBottom: '10px' }}>06 / SECURITY RISK</span>
              <h3>Exposed Secrets & Data Gaps</h3>
              <p>
                API keys and database passwords hardcoded in source repositories or client databases exposed to unapproved third-party analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Step Rescue Methodology */}
      <section className="section-full theme-warm-light" style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '44px' }}>
            <span className="eyebrow">Rescue Methodology</span>
            <h2>Our 6-step stabilization process.</h2>
            <p className="lead">
              We do not advocate burning down existing systems on day one. We establish deterministic baselines before recommending surgical refactoring.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '24px' }}>
            <div className="card">
              <span className="card-number">STEP 01</span>
              <h3>Establish Current State</h3>
              <p>
                Inspect repositories, check deployment logs, interview operators, and reliably reproduce observed bugs in a local sandbox environment.
              </p>
            </div>

            <div className="card">
              <span className="card-number">STEP 02</span>
              <h3>Identify Critical Risks</h3>
              <p>
                Uncover security exposure, credential leaks, unbacked-up data tables, and points of irreversible financial or data corruption.
              </p>
            </div>

            <div className="card">
              <span className="card-number">STEP 03</span>
              <h3>Assess Architecture</h3>
              <p>
                Separate healthy business logic from unmaintainable dependencies, evaluating whether a component needs repair or replacement.
              </p>
            </div>

            <div className="card">
              <span className="card-number">STEP 04</span>
              <h3>Establish Priorities</h3>
              <p>
                Triage fixes into immediate operational stabilizers (P0), integration guards (P1), and strategic modernization (P2).
              </p>
            </div>

            <div className="card">
              <span className="card-number">STEP 05</span>
              <h3>Agree Recovery Scope</h3>
              <p>
                Deliver a fixed-scope technical proposal specifying exactly what will be fixed, verified, and excluded, eliminating open-ended billing.
              </p>
            </div>

            <div className="card">
              <span className="card-number">STEP 06</span>
              <h3>Execute & Verify</h3>
              <p>
                Implement fixes behind automated regression tests, verify in staging, and transfer clean runbooks and operational sovereignty to your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Engineering Care Boundary */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(64px, 8vw, 96px) 0', borderTop: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Ongoing Care</span>
              <h2>Stabilize first. Maintain responsibly.</h2>
              <p>
                After stabilizing a rescued system, we offer ongoing engineering care to prevent future regression. Care agreements specify exact maintenance hours, backup checks, security dependency updates, and response windows.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                We do not promise misleading 24/7 "five-nines" availability unless a dedicated enterprise infrastructure agreement is separately contracted.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--line-strong)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>What Software Rescue Delivers</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-subtle)', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '8px' }}>Comprehensive architecture diagnostic & risk report</li>
                <li style={{ marginBottom: '8px' }}>Reproducible regression test suite for core paths</li>
                <li style={{ marginBottom: '8px' }}>Idempotent API retry & exception queues</li>
                <li style={{ marginBottom: '8px' }}>Sanitized secrets & credential boundary separation</li>
                <li style={{ marginBottom: '8px' }}>Clear deployment script and rollback runbook</li>
                <li>Complete handover documentation</li>
              </ul>

              <div style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => handleHandoffToIntake()}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Start Rescue Assessment →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
