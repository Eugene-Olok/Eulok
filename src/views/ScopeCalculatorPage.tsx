import React, { useState, useMemo } from 'react';
import { navigateTo, openIntakeModal, type IntakePrefillContext } from '../utils/navigation';
import {
  calculateScope,
  encodeScopeToQuery,
  parseScopeFromQuery,
  ARCHETYPES,
  INTEGRATION_RAILS,
  COMPLIANCE_ITEMS,
  CURRENCIES,
  ECONOMIC_REGIONS,
  type ScopingInputs,
  type CurrencyCode,
  type EconomicRegionCode,
} from '../engine/scopeCalculator';
import {
  CheckCircle2,
  Download,
  Copy,
  ArrowRight,
  Link2,
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
  const [regionId, setRegionId] = useState<EconomicRegionCode>('uganda');
  const [currency, setCurrency] = useState<CurrencyCode>('UGX');
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
      if (parsed.regionId) {
        setRegionId(parsed.regionId);
        if (!parsed.currency) {
          setCurrency(ECONOMIC_REGIONS[parsed.regionId].defaultCurrency);
        }
      }
      if (parsed.currency) setCurrency(parsed.currency);
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
      regionId,
      currency,
      clientName: clientName.trim() || undefined,
    });
    const nextUrl = `${window.location.pathname}?${query}`;
    window.history.replaceState(null, '', nextUrl);
  }, [hydratedFromUrl, archetypeId, selectedRails, compliance, throughput, regionId, currency, clientName]);

  const handleSelectRegion = (nextRegion: EconomicRegionCode) => {
    setRegionId(nextRegion);
    setCurrency(ECONOMIC_REGIONS[nextRegion].defaultCurrency);
  };

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
      regionId,
      currency,
      clientName: clientName.trim() || undefined,
    });
  }, [archetypeId, selectedRails, compliance, throughput, regionId, currency, clientName]);

  const handleCopyMemorandum = () => {
    navigator.clipboard.writeText(scopingResult.memorandumMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      const query = encodeScopeToQuery({
        archetypeId,
        selectedRails,
        complianceRequirements: compliance,
        throughputTier: throughput,
        regionId,
        currency,
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
    a.download = `${scopingResult.verificationHash}-memorandum.md`;
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
      budget: `${scopingResult.suggestedTier} (${scopingResult.regionLabel})`,
      specHash: scopingResult.verificationHash,
      specSummary: `${scopingResult.archetypeName} · ${scopingResult.estimatedWeeksMin}–${scopingResult.estimatedWeeksMax} wks · ${scopingResult.riskScore}/10 ${scopingResult.riskLevel}`,
      preferredCurrency: currency === 'USD' ? 'USD' : 'UGX',
      problemDescription: `Scoping Studio Spec ${scopingResult.verificationHash}${clientName.trim() ? ` for ${clientName.trim()}` : ''}: ${scopingResult.archetypeName} targeted for ${scopingResult.regionLabel}. Timeline: ${scopingResult.estimatedWeeksMin}–${scopingResult.estimatedWeeksMax} weeks. Rails: ${railsNames}. Throughput tier: ${throughput}.`,
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

  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <nav className="container-expansive breadcrumb-nav" aria-label="Breadcrumb">
        <button type="button" onClick={() => onNavigate('home')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Scoping Studio & Feasibility</span>
      </nav>

      {/* Hero Header */}
      <header className="page-hero-header">
        <div className="container-expansive">
          <span className="eyebrow">Interactive System Configurator · Uganda & Remote Delivery</span>
          <h1 className="hero-heading" style={{ maxWidth: '24ch' }}>
            Model your system. See the reality.
          </h1>
          <p className="hero-subheading" style={{ maxWidth: '68ch' }}>
            Configure target integration rails, regulatory standards, throughput constraints, and client economic region to inspect milestone-derived timelines, logarithmic risk scores, and download a Statement of Work draft.
          </p>
        </div>
      </header>

      {/* Main Studio Interactive Layout */}
      <section className="section-padded">
        <div className="container-expansive">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '32px', alignItems: 'start' }}>
            {/* Left Column: Interactive Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Client Name Input */}
              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <label htmlFor="scope-client-name" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--warm-white)', marginBottom: '8px' }}>
                  Client / Organization Name (Optional)
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
              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '10px', display: 'inline-block' }}>
                  STEP 01 · SYSTEM ARCHETYPE
                </span>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Select Core Domain</h3>

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
              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)', marginBottom: '10px', display: 'inline-block' }}>
                  STEP 02 · INTEGRATION RAILS
                </span>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Select Connected Interfaces</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(INTEGRATION_RAILS).map(([key, rail]) => {
                    const isChecked = selectedRails.includes(key);
                    return (
                      <label
                        key={key}
                        style={{
                          padding: '12px 14px',
                          background: isChecked ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-secondary)',
                          border: `1px solid ${isChecked ? 'rgba(56, 189, 248, 0.35)' : 'var(--line)'}`,
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
              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '10px', display: 'inline-block' }}>
                  STEP 03 · REGULATORY & GOVERNANCE
                </span>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Security & Audit Controls</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(COMPLIANCE_ITEMS).map(([key, comp]) => {
                    const isChecked = compliance.includes(key);
                    return (
                      <label
                        key={key}
                        style={{
                          padding: '12px 14px',
                          background: isChecked ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-secondary)',
                          border: `1px solid ${isChecked ? 'rgba(56, 189, 248, 0.35)' : 'var(--line)'}`,
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
              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)', marginBottom: '10px', display: 'inline-block' }}>
                  STEP 04 · TRANSACTION VOLUME
                </span>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Operational Throughput Tier</h3>

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

            {/* Right Column: Live Output & Verifiable Memorandum */}
            <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Executive Metrics Card */}
              <div
                className="card"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--line-strong)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <span className="mono-tag" style={{ color: 'var(--electric-blue)', fontWeight: 700 }}>
                    SPECIFICATION HASH
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--accent-blue)' }}>
                    {scopingResult.verificationHash}
                  </span>
                </div>

                {/* Target Economy / Region Selector */}
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Client Economy / Region
                  </span>
                  <div
                    role="group"
                    aria-label="Select client economic region"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}
                  >
                    {(Object.values(ECONOMIC_REGIONS)).map((reg) => {
                      const active = regionId === reg.id;
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => handleSelectRegion(reg.id)}
                          aria-pressed={active}
                          className={`button button-small ${active ? 'button-primary' : 'button-quiet'}`}
                          style={{
                            minHeight: '34px',
                            padding: '5px 10px',
                            fontSize: '0.76rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {reg.shortLabel} ({reg.economicMultiplier}×)
                        </button>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '5px', lineHeight: 1.35 }}>
                    {ECONOMIC_REGIONS[regionId].marketContext}
                  </span>
                </div>

                {/* Currency Switcher */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Display Currency
                  </span>
                  <div
                    role="group"
                    aria-label="Select planning currency"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}
                  >
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                      const active = currency === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setCurrency(code)}
                          aria-pressed={active}
                          className={`button button-small ${active ? 'button-primary' : 'button-quiet'}`}
                          style={{
                            minHeight: '34px',
                            padding: '5px 11px',
                            fontSize: '0.78rem',
                            fontFamily: 'var(--font-mono)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {code}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Estimated Timeline
                    </span>
                    <div style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--warm-white)', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
                      {scopingResult.estimatedWeeksMin}–{scopingResult.estimatedWeeksMax} <span style={{ fontSize: '0.88rem', fontWeight: 400, color: 'var(--text-muted)' }}>weeks</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: 1.35 }}>
                      Derived from {scopingResult.milestoneTotalWeeks} wks across 6 stages + {scopingResult.contingencyWeeks} {scopingResult.contingencyWeeks === 1 ? 'wk' : 'wks'} UAT/API buffer
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Technical Risk
                    </span>
                    <div style={{ fontSize: '1.55rem', fontWeight: 700, color: riskBadgeColor, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
                      {scopingResult.riskScore} <span style={{ fontSize: '0.88rem', fontWeight: 400 }}>/ 10 ({scopingResult.riskLevel})</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: 1.35 }}>
                      Logarithmic scale across rails, compliance & throughput
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '20px', padding: '14px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Planning Investment ({ECONOMIC_REGIONS[regionId].shortLabel} · {currency})
                  </span>
                  <div style={{ fontSize: '1.22rem', fontWeight: 700, color: 'var(--warm-white)', fontVariantNumeric: 'tabular-nums' }}>
                    {scopingResult.suggestedTier}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--electric-blue)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                    {scopingResult.referenceEquivalent}
                  </div>
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px', lineHeight: 1.4 }}>
                    {scopingResult.pricingBasisNote} Fixed contractual fee is established upon completion of Stage 02 Specification.
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleProceedToIntake}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Proceed to Official Scoping Intake</span>
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
                      <span>{copied ? 'Copied SOW' : 'Copy SOW'}</span>
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

              {/* 6-Stage Delivery Sequence Preview */}
              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '6px', display: 'inline-block' }}>
                    SCHEDULE & QUALITY GATES
                  </span>
                  <span className="mono-tag" style={{ fontSize: '0.74rem', color: 'var(--electric-blue)', fontVariantNumeric: 'tabular-nums' }}>
                    Total: {scopingResult.milestoneTotalWeeks} wks
                  </span>
                </div>
                <h4 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Milestone Progression</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                  {scopingResult.milestonePhases.map((phase) => (
                    <div key={phase.stageNumber} style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', color: 'var(--warm-white)', fontWeight: 600 }}>
                        <span>{phase.stageName}</span>
                        <span style={{ color: 'var(--electric-blue)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{phase.weeks} {phase.weeks === 1 ? 'wk' : 'wks'}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
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

              {/* Architectural Controls Preview */}
              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)', marginBottom: '8px', display: 'inline-block' }}>
                  ACTIVE GUARDS
                </span>
                <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>Engineering Controls</h4>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {scopingResult.architecturalControls.map((ctrl, i) => (
                    <li key={i}>{ctrl}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
