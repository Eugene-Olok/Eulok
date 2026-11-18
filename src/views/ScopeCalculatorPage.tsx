import React, { useState, useMemo } from 'react';
import { navigateTo, openIntakeModal, type IntakePrefillContext } from '../utils/navigation';
import {
  calculateScope,
  encodeScopeToQuery,
  parseScopeFromQuery,
  ARCHETYPES,
  INTEGRATION_RAILS,
  COMPLIANCE_ITEMS,
  DEPLOYMENT_CONTEXTS,
  type ScopingInputs,
  type DeploymentContextId,
} from '../engine/scopeCalculator';
import {
  CheckCircle2,
  Download,
  Copy,
  ArrowRight,
  Link2,
  ShieldAlert,
  Layers,
  MessageSquare,
} from 'lucide-react';

interface ScopeCalculatorPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: (serviceOrContext?: string | IntakePrefillContext) => void;
}

export const ScopeCalculatorPage: React.FC<ScopeCalculatorPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  const [archetypeId, setArchetypeId] = useState<ScopingInputs['archetypeId']>('reconciliation');
  const [selectedRails, setSelectedRails] = useState<string[]>(['mtn_momo', 'airtel_money']);
  const [compliance, setCompliance] = useState<string[]>(['dppa_2019', 'audit_ledger']);
  const [throughput, setThroughput] = useState<ScopingInputs['throughputTier']>('standard');
  const [deploymentContextId, setDeploymentContextId] = useState<DeploymentContextId>('uganda_domestic');
  const [clientName, setClientName] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [hydratedFromUrl, setHydratedFromUrl] = useState<boolean>(false);

  // Hydrate configurator from shareable URL query params after initial SSR-safe mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.search) {
      const parsed = parseScopeFromQuery(window.location.search);
      if (parsed.archetypeId) setArchetypeId(parsed.archetypeId);
      if (parsed.selectedRails !== undefined) setSelectedRails(parsed.selectedRails);
      if (parsed.complianceRequirements !== undefined) setCompliance(parsed.complianceRequirements);
      if (parsed.throughputTier) setThroughput(parsed.throughputTier);
      if (parsed.deploymentContextId) setDeploymentContextId(parsed.deploymentContextId);
      if (parsed.clientName) setClientName(parsed.clientName);
    }
    setHydratedFromUrl(true);
  }, []);

  // Keep shareable URL synchronized with current configuration
  React.useEffect(() => {
    if (!hydratedFromUrl || typeof window === 'undefined') return;
    const query = encodeScopeToQuery({
      archetypeId,
      selectedRails,
      complianceRequirements: compliance,
      throughputTier: throughput,
      deploymentContextId,
      clientName: clientName.trim() || undefined,
    });
    const nextUrl = `${window.location.pathname}?${query}`;
    window.history.replaceState(null, '', nextUrl);
  }, [hydratedFromUrl, archetypeId, selectedRails, compliance, throughput, deploymentContextId, clientName]);

  const toggleRail = (id: string) => {
    setSelectedRails((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleCompliance = (id: string) => {
    setCompliance((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const scopingResult = useMemo(() => {
    return calculateScope({
      archetypeId,
      selectedRails,
      complianceRequirements: compliance,
      throughputTier: throughput,
      deploymentContextId,
      clientName: clientName.trim() || undefined,
    });
  }, [archetypeId, selectedRails, compliance, throughput, deploymentContextId, clientName]);

  const handleCopyMemorandum = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(scopingResult.memorandumMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const query = encodeScopeToQuery({
        archetypeId,
        selectedRails,
        complianceRequirements: compliance,
        throughputTier: throughput,
        deploymentContextId,
        clientName: clientName.trim() || undefined,
      });
      const shareUrl = `${window.location.origin}${window.location.pathname}?${query}`;
      navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([scopingResult.memorandumMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scopingResult.verificationHash}-architecture-spec.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleProceedToIntake = () => {
    const mappedNeed =
      archetypeId === 'rescue'
        ? 'Fix or rescue existing software'
        : archetypeId === 'efris'
        ? 'Connect existing systems'
        : 'Build something new';

    const mappedSystem =
      archetypeId === 'reconciliation'
        ? 'Financial reconciliation system'
        : archetypeId === 'efris'
        ? 'Payment & API integration'
        : archetypeId === 'website'
        ? 'Business website'
        : 'Custom business software';

    const railsNames =
      selectedRails.length > 0
        ? selectedRails.map((r) => INTEGRATION_RAILS[r]?.name || r).join(', ')
        : 'No external rails selected';

    onOpenIntakeModal({
      need: mappedNeed,
      systemType: mappedSystem,
      targetTimeline: `${scopingResult.estimatedWeeksMin}–${scopingResult.estimatedWeeksMax} weeks (from Scoping Studio)`,
      specHash: scopingResult.verificationHash,
      specSummary: `${scopingResult.archetypeName} · ${scopingResult.deploymentContextLabel} · ${scopingResult.estimatedWeeksMin}–${scopingResult.estimatedWeeksMax} wks · ${scopingResult.riskScore}/10 ${scopingResult.riskLevel}`,
      problemDescription: `Scoping Workbench Spec ${scopingResult.verificationHash}${clientName.trim() ? ` for ${clientName.trim()}` : ''}: ${scopingResult.archetypeName} configured for ${scopingResult.deploymentContextLabel}. Projected timeline: ${scopingResult.estimatedWeeksMin}–${scopingResult.estimatedWeeksMax} weeks (${scopingResult.failureModes.length} failure modes mitigated). Rails: ${railsNames}. Throughput: ${scopingResult.throughputLabel}. Requesting engineering review & commercial consultation.`,
    });
  };

  const riskBadgeColor =
    scopingResult.riskLevel === 'LOW'
      ? 'var(--status-pass-text)'
      : scopingResult.riskLevel === 'MODERATE'
      ? 'var(--electric-blue)'
      : scopingResult.riskLevel === 'HIGH'
      ? 'var(--status-warn-text)'
      : 'var(--status-fail-text)';

  const severityColor = (severity: 'P0' | 'P1' | 'P2') =>
    severity === 'P0'
      ? 'var(--status-fail-text)'
      : severity === 'P1'
      ? 'var(--status-warn-text)'
      : 'var(--electric-blue)';

  return (
    <>
      {/* Hero Header */}
      <section className="section-full theme-dark band-hero">
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button type="button" onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Scoping Studio &amp; Architecture Workbench</span>
          </nav>

          <div style={{ maxWidth: '880px' }}>
            <span className="eyebrow">Interactive Architecture Workbench · Uganda &amp; East Africa</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)', marginBottom: '20px', maxWidth: '24ch' }}>
              Model your system. Inspect every failure boundary.
            </h1>
            <p className="lead" style={{ maxWidth: '68ch', marginBottom: 0 }}>
              Configure East African payment rails, tax interfaces, throughput constraints, and regulatory posture to inspect target architecture layers, failure-mode mitigations, logarithmic technical risk, and milestone delivery gates. Commercial pricing is discussed directly after technical review.
            </p>
          </div>
        </div>
      </section>

      {/* Main Studio Interactive Layout */}
      <section className="section-full theme-navy band-section">
        <div className="container-expansive">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '32px', alignItems: 'start' }}>
            {/* Left Column: Interactive Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Client Name Input */}
              <div className="card">
                <label htmlFor="scope-client-name" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--warm-white)', marginBottom: '8px' }}>
                  Organization Name (Optional)
                </label>
                <input
                  id="scope-client-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kampala Logistics Ltd, Rift Valley SACCO, Horizon Pay"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              {/* Archetype Selector */}
              <div className="card">
                <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '10px', display: 'inline-block' }}>
                  STEP 01 · SYSTEM ARCHETYPE
                </span>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Select Core Domain</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(ARCHETYPES).map(([key, item]) => {
                    const isSelected = archetypeId === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setArchetypeId(key as ScopingInputs['archetypeId'])}
                        className={`wizard-option-btn ${isSelected ? 'selected' : ''}`}
                        style={{ textAlign: 'left', padding: '12px 16px' }}
                      >
                        <div>
                          <div style={{ color: 'var(--warm-white)', fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* External Rails */}
              <div className="card">
                <span className="mono-tag" style={{ color: 'var(--electric-blue)', marginBottom: '10px', display: 'inline-block' }}>
                  STEP 02 · EAST AFRICAN INTEGRATION RAILS
                </span>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Select Connected Interfaces</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(INTEGRATION_RAILS).map(([key, rail]) => {
                    const isChecked = selectedRails.includes(key);
                    return (
                      <label
                        key={key}
                        className="surface-inset"
                        style={{
                          padding: '12px 14px',
                          background: isChecked ? 'rgba(56, 189, 248, 0.08)' : undefined,
                          borderColor: isChecked ? 'rgba(56, 189, 248, 0.35)' : undefined,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRail(key)}
                          style={{ cursor: 'pointer', flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ color: isChecked ? 'var(--warm-white)' : 'var(--text-subtle)', fontWeight: 600, fontSize: '0.9rem' }}>
                            {rail.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {rail.notes}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Compliance & Governance */}
              <div className="card">
                <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '10px', display: 'inline-block' }}>
                  STEP 03 · REGULATORY &amp; AUDIT CONTROLS
                </span>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Governance &amp; Ledger Guarantees</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(COMPLIANCE_ITEMS).map(([key, comp]) => {
                    const isChecked = compliance.includes(key);
                    return (
                      <label
                        key={key}
                        className="surface-inset"
                        style={{
                          padding: '12px 14px',
                          background: isChecked ? 'rgba(56, 189, 248, 0.08)' : undefined,
                          borderColor: isChecked ? 'rgba(56, 189, 248, 0.35)' : undefined,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCompliance(key)}
                          style={{ cursor: 'pointer', flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ color: isChecked ? 'var(--warm-white)' : 'var(--text-subtle)', fontWeight: 600, fontSize: '0.9rem' }}>
                            {comp.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {comp.standard}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Throughput Volume */}
              <div className="card">
                <span className="mono-tag" style={{ color: 'var(--electric-blue)', marginBottom: '10px', display: 'inline-block' }}>
                  STEP 04 · TRANSACTION VOLUME
                </span>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Operational Throughput Tier</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'standard', label: 'Standard', desc: '< 10k tx/day' },
                    { id: 'high', label: 'High', desc: '10k–100k tx/day' },
                    { id: 'mission_critical', label: 'Critical', desc: '100k+ tx/day' },
                  ].map((t) => {
                    const isSelected = throughput === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setThroughput(t.id as ScopingInputs['throughputTier'])}
                        className={`wizard-option-btn ${isSelected ? 'selected' : ''}`}
                        style={{ padding: '10px 8px', textAlign: 'center', flexDirection: 'column' }}
                      >
                        <div style={{ color: 'var(--warm-white)', fontWeight: 600, fontSize: '0.88rem' }}>{t.label}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Live Architecture & Technical Feasibility */}
            <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Executive Metrics & Deployment Context Card */}
              <div className="card" style={{ borderColor: 'var(--line-strong)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <span className="mono-tag" style={{ color: 'var(--electric-blue)', fontWeight: 700 }}>
                    SPECIFICATION HASH
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--accent-blue)' }}>
                    {scopingResult.verificationHash}
                  </span>
                </div>

                {/* Deployment Context Selector (Uganda vs EAC) */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Deployment Footprint
                  </span>
                  <div
                    role="group"
                    aria-label="Select East Africa deployment footprint"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}
                  >
                    {Object.values(DEPLOYMENT_CONTEXTS).map((ctx) => {
                      const active = deploymentContextId === ctx.id;
                      return (
                        <button
                          key={ctx.id}
                          type="button"
                          onClick={() => setDeploymentContextId(ctx.id)}
                          aria-pressed={active}
                          className={`button button-small ${active ? 'button-primary' : 'button-quiet'}`}
                          style={{
                            minHeight: '36px',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            justifyContent: 'center',
                          }}
                        >
                          {ctx.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>
                    {DEPLOYMENT_CONTEXTS[deploymentContextId].operationalProfile}
                  </p>
                </div>

                {/* Timeline & Risk Readout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div className="surface-inset" style={{ padding: '14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Delivery Timeline
                    </span>
                    <div style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--warm-white)', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
                      {scopingResult.estimatedWeeksMin}–{scopingResult.estimatedWeeksMax} <span style={{ fontSize: '0.88rem', fontWeight: 400, color: 'var(--text-muted)' }}>weeks</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: 1.35 }}>
                      {scopingResult.milestoneTotalWeeks} wks across 6 stages + {scopingResult.contingencyWeeks} {scopingResult.contingencyWeeks === 1 ? 'wk' : 'wks'} KYB/UAT buffer
                    </span>
                  </div>

                  <div className="surface-inset" style={{ padding: '14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Technical Risk Index
                    </span>
                    <div style={{ fontSize: '1.55rem', fontWeight: 700, color: riskBadgeColor, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
                      {scopingResult.riskScore} <span style={{ fontSize: '0.88rem', fontWeight: 400 }}>/ 10 ({scopingResult.riskLevel})</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: 1.35 }}>
                      {scopingResult.failureModes.length} explicit failure boundary controls mapped
                    </span>
                  </div>
                </div>

                {/* Direct Consultation Disclosure (No Pricing Calculator) */}
                <div className="surface-inset" style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <MessageSquare size={16} color="var(--electric-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--warm-white)', marginBottom: '2px' }}>
                      Core Guarantee &amp; Commercial Scoping
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: '0.76rem', color: 'var(--text-subtle)', lineHeight: 1.45 }}>
                      {scopingResult.coreGuarantee}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {scopingResult.consultationNote}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleProceedToIntake}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Discuss Architecture &amp; Commercial Terms</span>
                    <ArrowRight size={16} />
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                    <button
                      type="button"
                      className="button button-quiet button-small"
                      onClick={handleCopyMemorandum}
                      style={{ justifyContent: 'center', padding: '8px 10px' }}
                    >
                      {copied ? <CheckCircle2 size={14} color="var(--status-pass-text)" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied Spec' : 'Copy Spec'}</span>
                    </button>

                    <button
                      type="button"
                      className="button button-quiet button-small"
                      onClick={handleCopyShareLink}
                      style={{ justifyContent: 'center', padding: '8px 10px' }}
                    >
                      {linkCopied ? <CheckCircle2 size={14} color="var(--status-pass-text)" /> : <Link2 size={14} />}
                      <span>{linkCopied ? 'Link Copied' : 'Share Link'}</span>
                    </button>

                    <button
                      type="button"
                      className="button button-quiet button-small"
                      onClick={handleDownload}
                      style={{ justifyContent: 'center', padding: '8px 10px' }}
                    >
                      <Download size={14} />
                      <span>Download .md</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Target Architecture Topology */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Layers size={16} color="var(--electric-blue)" />
                  <h3 style={{ margin: 0, fontSize: '1.08rem' }}>Target Architecture Topology</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {scopingResult.architectureTopology.map((layer) => (
                    <div key={layer.layerId} className="surface-inset" style={{ padding: '10px 12px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--warm-white)' }}>
                          {layer.title}
                        </span>
                        <span className="mono-tag" style={{ fontSize: '0.68rem', color: 'var(--electric-blue)' }}>
                          {layer.layerId}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 4px', fontSize: '0.78rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
                        {layer.responsibility}
                      </p>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        Pattern: {layer.pattern}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Failure Modes & Deterministic Mitigations Matrix */}
              <div className="card" data-testid="failure-modes-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} color="var(--status-warn-text)" />
                    <h3 style={{ margin: 0, fontSize: '1.08rem' }}>Failure-Mode Mitigations</h3>
                  </div>
                  <span className="mono-tag" style={{ fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums' }}>
                    {scopingResult.failureModes.length} Active Controls
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {scopingResult.failureModes.map((fm) => (
                    <div key={fm.id} className="surface-inset" style={{ padding: '10px 12px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--warm-white)' }}>
                          {fm.failureMode}
                        </span>
                        <span className="mono-tag" style={{ fontSize: '0.68rem', color: severityColor(fm.severity), borderColor: severityColor(fm.severity) }}>
                          {fm.severity} · {fm.surface}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        <strong>Trigger:</strong> {fm.triggerCondition}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
                        <strong>Mitigation:</strong> {fm.deterministicMitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6-Stage Delivery Sequence Preview */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '6px', display: 'inline-block' }}>
                    SCHEDULE &amp; EXIT GATES
                  </span>
                  <span className="mono-tag" style={{ fontSize: '0.74rem', color: 'var(--electric-blue)', fontVariantNumeric: 'tabular-nums' }}>
                    Total: {scopingResult.milestoneTotalWeeks} wks
                  </span>
                </div>
                <h3 style={{ margin: '0 0 12px', fontSize: '1.08rem' }}>Milestone Effort Allocation</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
                  {scopingResult.milestonePhases.map((phase) => (
                    <div key={phase.stageNumber} style={{ borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', color: 'var(--warm-white)', fontWeight: 600 }}>
                        <span>{phase.stageName}</span>
                        <span style={{ color: 'var(--electric-blue)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                          {phase.weeks} {phase.weeks === 1 ? 'wk' : 'wks'} ({phase.effortSharePct}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'var(--line)', borderRadius: '999px', overflow: 'hidden', margin: '6px 0' }}>
                        <div style={{ width: `${phase.effortSharePct}%`, height: '100%', background: 'var(--electric-blue)' }} />
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        Gate: {phase.exitGate}
                      </div>
                      {phase.floorNote && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '3px', opacity: 0.9 }}>
                          Note: {phase.floorNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Acceptance Gates */}
              <div className="card">
                <span className="mono-tag" style={{ color: 'var(--status-pass-text)', marginBottom: '8px', display: 'inline-block' }}>
                  PRODUCTION HANDOVER CRITERIA
                </span>
                <h3 style={{ margin: '0 0 10px', fontSize: '1.08rem' }}>Verification Gates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scopingResult.acceptanceGates.map((gate) => (
                    <div key={gate.code} style={{ fontSize: '0.8rem', lineHeight: 1.45, color: 'var(--text-subtle)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--electric-blue)', fontWeight: 600 }}>
                        {gate.code}
                      </span>{' '}
                      <strong style={{ color: 'var(--warm-white)' }}>{gate.gate}:</strong>{' '}
                      {gate.verificationMethod}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
