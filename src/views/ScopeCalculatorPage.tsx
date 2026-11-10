import React, { useState, useMemo } from 'react';
import { navigateTo, openIntakeModal } from '../utils/navigation';
import {
  calculateScope,
  ARCHETYPES,
  INTEGRATION_RAILS,
  COMPLIANCE_ITEMS,
  type ScopingInputs,
} from '../engine/scopeCalculator';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ScopeCalculatorPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: (service?: string) => void;
}

export const ScopeCalculatorPage: React.FC<ScopeCalculatorPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  const [archetypeId, setArchetypeId] = useState<ScopingInputs['archetypeId']>('reconciliation');
  const [selectedRails, setSelectedRails] = useState<string[]>(['mtn_momo', 'airtel_money']);
  const [compliance, setCompliance] = useState<string[]>(['dppa_2019', 'audit_ledger']);
  const [throughput, setThroughput] = useState<ScopingInputs['throughputTier']>('standard');
  const [clientName, setClientName] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

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
      clientName: clientName.trim() || undefined,
    });
  }, [archetypeId, selectedRails, compliance, throughput, clientName]);

  const handleCopyMemorandum = () => {
    navigator.clipboard.writeText(scopingResult.memorandumMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
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
    onOpenIntakeModal(scopingResult.archetypeName);
  };

  const riskBadgeColor =
    scopingResult.riskLevel === 'LOW'
      ? '#4ade80'
      : scopingResult.riskLevel === 'MODERATE'
      ? 'var(--electric-blue)'
      : scopingResult.riskLevel === 'HIGH'
      ? '#fbbf24'
      : '#f87171';

  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <nav className="container-expansive breadcrumb-nav" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('home')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Scoping Studio & Feasibility</span>
      </nav>

      {/* Hero Header */}
      <header className="page-hero-header">
        <div className="container-expansive">
          <span className="eyebrow">Interactive System Configurator · FAANG Architecture</span>
          <h1 className="hero-heading" style={{ maxWidth: '24ch' }}>
            Model your system. See the reality.
          </h1>
          <p className="hero-subheading" style={{ maxWidth: '68ch' }}>
            Configure target integration rails, regulatory standards, and throughput constraints to calculate exact delivery timelines, risk vectors, and download a verifiable Technical Statement of Work.
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
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--warm-white)', marginBottom: '8px' }}>
                  Client / Organization Name (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex FinTech, Rift Valley Logistics, Horizon Pay"
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
                      <div
                        key={key}
                        onClick={() => toggleRail(key)}
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
                          onChange={() => {}} // handled by parent div
                          style={{ cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ color: isChecked ? 'var(--warm-white)' : 'var(--text-subtle)', fontWeight: 600, fontSize: '0.9rem' }}>
                            {rail.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {rail.notes}
                          </div>
                        </div>
                      </div>
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
                      <div
                        key={key}
                        onClick={() => toggleCompliance(key)}
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
                          onChange={() => {}}
                          style={{ cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ color: isChecked ? 'var(--warm-white)' : 'var(--text-subtle)', fontWeight: 600, fontSize: '0.9rem' }}>
                            {comp.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {comp.standard}
                          </div>
                        </div>
                      </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="mono-tag" style={{ color: 'var(--electric-blue)', fontWeight: 700 }}>
                    SPECIFICATION HASH
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--accent-blue)' }}>
                    {scopingResult.verificationHash}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Estimated Timeline
                    </span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--warm-white)', marginTop: '4px' }}>
                      {scopingResult.estimatedWeeksMin}–{scopingResult.estimatedWeeksMax} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>weeks</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Technical Risk
                    </span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: riskBadgeColor, marginTop: '4px' }}>
                      {scopingResult.riskScore} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/ 10 ({scopingResult.riskLevel})</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Planning Investment Bracket
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warm-white)' }}>
                    {scopingResult.suggestedTier}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Fixed contractual fee established upon completion of Stage 02 Specification.
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      className="button button-quiet button-small"
                      onClick={handleCopyMemorandum}
                      style={{ justifyContent: 'center' }}
                    >
                      {copied ? <CheckCircle2 size={14} color="#4ade80" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied SOW' : 'Copy SOW'}</span>
                    </button>

                    <button
                      type="button"
                      className="button button-quiet button-small"
                      onClick={handleDownload}
                      style={{ justifyContent: 'center' }}
                    >
                      <Download size={14} />
                      <span>Download .md</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 6-Stage Delivery Sequence Preview */}
              <div className="card" style={{ background: 'var(--bg-primary)' }}>
                <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '8px', display: 'inline-block' }}>
                  SCHEDULE & QUALITY GATES
                </span>
                <h4 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Milestone Progression</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                  {scopingResult.milestonePhases.map((phase) => (
                    <div key={phase.stageNumber} style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--warm-white)', fontWeight: 600 }}>
                        <span>{phase.stageName}</span>
                        <span style={{ color: 'var(--electric-blue)' }}>{phase.weeks} wks</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                        Gate: {phase.exitGate}
                      </div>
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
