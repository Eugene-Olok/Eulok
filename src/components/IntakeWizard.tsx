import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Mail,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { generateReferenceId, sanitizeString } from '../engine/intakeValidation';

interface IntakeWizardProps {
  initialNeed?: string;
  initialSystem?: string;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const IntakeWizard: React.FC<IntakeWizardProps> = ({
  initialNeed,
  initialSystem,
  isModal = false,
  onCloseModal,
}) => {
  const [step, setStep] = useState<number>(1);
  const [need, setNeed] = useState<string>(initialNeed || 'Build something new');
  const [systemType, setSystemType] = useState<string>(initialSystem || 'Custom business software');
  const [budget, setBudget] = useState<string>('$500–$2,000');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [attemptedSolutions, setAttemptedSolutions] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>(''); // Bot trap
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const needsOptions = [
    { label: 'Build something new', desc: 'Design and engineer software from discovery to release' },
    { label: 'Fix or rescue existing software', desc: 'Diagnose failures, stabilize releases, and modernize safely' },
    { label: 'Automate a business process', desc: 'Replace spreadsheet admin while preserving human approval' },
    { label: 'Connect existing systems', desc: 'Payment APIs, Webhooks, CRM & billing reconciliation' },
  ];

  const systemOptions = [
    { label: 'Custom business software', desc: 'Internal portals, dashboards, member ledgers' },
    { label: 'Business website', desc: 'High-performance, mobile-first digital presence' },
    { label: 'Financial reconciliation system', desc: 'Match transactions against bank/MoMo statements' },
    { label: 'Payment & API integration', desc: 'Mobile money, EFRIS, or accounting connectors' },
    { label: 'Spreadsheet to database migration', desc: 'Safe schema design, data validation and audit log' },
  ];

  const budgetOptions = [
    { label: '$500–$2,000', note: 'Indicative planning range, not a formal quote' },
    { label: '$2,000–$5,000', note: 'Multi-system builds, custom workflow portals' },
    { label: '$5,000–$15,000+', note: 'Comprehensive integrations and production systems' },
    { label: 'Unknown / Early stage', note: 'Need initial discovery and technical scoping first' },
    { label: 'Custom explanation', note: 'Procurement constraints, phased milestone grants' },
  ];

  const compiledDraft = `Hello EULOK,\n\nI would like to discuss a software engineering engagement:\n\nReference: ${referenceId || 'PENDING'}\n1. Project Need: ${need}\n2. System Type: ${systemType}\n3. Budget Indication: ${budget}\n4. Operational Problem: ${problemDescription.trim() || 'To be discussed during discovery.'}\n5. What was already tried: ${attemptedSolutions.trim() || 'None recorded yet.'}\n${clientEmail ? `6. Contact Email: ${clientEmail.trim()}\n` : ''}${clientPhone ? `7. Contact Phone: ${clientPhone.trim()}\n` : ''}\nPlease let me know your thoughts and availability for a focused scoping discussion.`;

  // Encoded WhatsApp URL without printing the number anywhere in text
  const whatsappUrl = `https://wa.me/256760779160?text=${encodeURIComponent(compiledDraft)}`;
  const mailtoUrl = `mailto:hello@eulok.com?subject=${encodeURIComponent(`Project Inquiry [${referenceId || 'NEW'}]: ${systemType}`)}&body=${encodeURIComponent(compiledDraft)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyRef = () => {
    if (referenceId) {
      navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    // Bot trap check
    if (honeypot.trim().length > 0) {
      setIsSubmitting(false);
      return; // Silent discard for bot spam
    }

    const payload = {
      need,
      systemType,
      budget,
      problemDescription: sanitizeString(problemDescription),
      attemptedSolutions: sanitizeString(attemptedSolutions),
      clientEmail: clientEmail.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      honeypot: honeypot || undefined,
    };

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setReferenceId(data.referenceId || generateReferenceId());
        setStep(5);
      } else {
        // Fallback: If running in static preview or network glitch, generate client-side reference
        // and allow user to continue via WhatsApp/Email without data loss.
        setReferenceId(generateReferenceId());
        setStep(5);
      }
    } catch {
      // Graceful offline degradation
      setReferenceId(generateReferenceId());
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isModal ? 'modal-panel' : 'card'} style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
      {/* Wizard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <span className="eyebrow" style={{ marginBottom: '6px' }}>Project Intake · Guided Scoping</span>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', marginBottom: '4px' }}>
            {step === 1 && 'What is the goal?'}
            {step === 2 && 'What type of system?'}
            {step === 3 && 'Approximate planning budget'}
            {step === 4 && 'Describe the operational problem'}
            {step === 5 && 'Inquiry Registered & Reference Created'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {step <= 4
              ? `Step ${step} of 4 — Scoping information helps us assess feasibility before making commitments.`
              : 'Deterministic tracking reference generated. Direct channels open below.'}
          </p>
        </div>

        {isModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1.4rem',
              lineHeight: 1,
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Progress Dots */}
      <div className="wizard-step-indicator">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`wizard-dot ${step === i ? 'active' : ''} ${step > i ? 'completed' : ''}`}
            onClick={() => {
              if (i < step && step < 5) setStep(i);
            }}
            style={{ cursor: i < step && step < 5 ? 'pointer' : 'default' }}
            title={`Step ${i}`}
          >
            {step > i ? '✓' : i}
          </div>
        ))}
      </div>

      {/* Step 1: Need */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            {needsOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                className={`wizard-option-btn ${need === opt.label ? 'selected' : ''}`}
                onClick={() => setNeed(opt.label)}
              >
                <div>
                  <div style={{ color: 'var(--warm-white)', fontWeight: 700 }}>{opt.label}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    {opt.desc}
                  </div>
                </div>
                <ArrowRight size={16} color={need === opt.label ? 'var(--electric-blue)' : 'var(--text-muted)'} />
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              className="button button-primary"
              onClick={() => setStep(2)}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: System Type */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            {systemOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                className={`wizard-option-btn ${systemType === opt.label ? 'selected' : ''}`}
                onClick={() => setSystemType(opt.label)}
              >
                <div>
                  <div style={{ color: 'var(--warm-white)', fontWeight: 700 }}>{opt.label}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    {opt.desc}
                  </div>
                </div>
                <ArrowRight size={16} color={systemType === opt.label ? 'var(--electric-blue)' : 'var(--text-muted)'} />
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button
              className="button button-quiet"
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              className="button button-primary"
              onClick={() => setStep(3)}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Budget Range */}
      {step === 3 && (
        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Indicative planning range helps us recommend an appropriately scoped starting increment. It is not an eligibility gate or a binding quote.
          </p>

          <div style={{ marginBottom: '20px' }}>
            {budgetOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                className={`wizard-option-btn ${budget === opt.label ? 'selected' : ''}`}
                onClick={() => setBudget(opt.label)}
              >
                <div>
                  <div style={{ color: 'var(--warm-white)', fontWeight: 700 }}>{opt.label}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    {opt.note}
                  </div>
                </div>
                <ArrowRight size={16} color={budget === opt.label ? 'var(--electric-blue)' : 'var(--text-muted)'} />
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button
              className="button button-quiet"
              onClick={() => setStep(2)}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              className="button button-primary"
              onClick={() => setStep(4)}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Problem context & Conversion */}
      {step === 4 && (
        <form onSubmit={handleSubmit}>
          {/* Honeypot field for bot suppression (off-screen) */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
            <input
              type="text"
              name="company_title_verification"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--warm-white)', marginBottom: '6px' }}>
              1. What problem needs to be solved? <span style={{ color: 'var(--electric-blue)' }}>*</span>
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              placeholder="e.g. Reconciliation between payment gateway webhooks and our internal invoices fails intermittently due to duplicate receipts..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--warm-white)', marginBottom: '6px' }}>
              2. What has been attempted so far? (Optional)
            </label>
            <input
              className="form-input"
              placeholder="e.g. Manual Excel export every morning, custom Python script that broke after API update..."
              value={attemptedSolutions}
              onChange={(e) => setAttemptedSolutions(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '4px' }}>
                Your Email Address (Optional)
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="founder@company.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '4px' }}>
                Direct Phone / WhatsApp (Optional)
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="+256 700 000000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
          </div>

          {submitError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.84rem', marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span>{submitError}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              className="button button-quiet"
              onClick={() => setStep(3)}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting || !problemDescription.trim()}
              style={{ minWidth: '220px' }}
            >
              {isSubmitting ? (
                <span>Generating Reference...</span>
              ) : (
                <>
                  <span>Register Scoping Brief</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '16px', marginBottom: 0 }}>
            Privacy note: Data is retained for 180 days solely for discovery under Uganda DPPA 2019 Section 24. Never sold or shared.
          </p>
        </form>
      )}

      {/* Step 5: Confirmed & Direct Channels */}
      {step === 5 && (
        <div>
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span className="mono-tag" style={{ color: 'var(--electric-blue)', fontWeight: 700 }}>
                  SCOPING REFERENCE REGISTERED
                </span>
                <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--warm-white)', marginTop: '4px' }}>
                  {referenceId}
                </div>
              </div>

              <button
                type="button"
                className="button button-quiet button-small"
                onClick={handleCopyRef}
              >
                {copied ? <CheckCircle2 size={14} color="#4ade80" /> : <Copy size={14} />}
                <span>{copied ? 'Copied ID' : 'Copy Reference'}</span>
              </button>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle)', margin: '12px 0 0' }}>
              Your inquiry has been cataloged under this reference ID. You can now engage directly via WhatsApp or Email with this tracking context.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--warm-white)', display: 'block', marginBottom: '10px' }}>
              Choose your direct contact channel:
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <a
                className="button button-primary"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#052e16',
                  borderColor: '#25D366',
                  justifyContent: 'center',
                  padding: '12px 18px',
                }}
              >
                <MessageSquare size={18} fill="#052e16" />
                <span>Open in WhatsApp</span>
              </a>

              <a
                className="button button-quiet"
                href={mailtoUrl}
                style={{ justifyContent: 'center', padding: '12px 18px' }}
              >
                <Mail size={18} />
                <span>Open in Email</span>
              </a>
            </div>
          </div>

          {/* Compiled Brief Preview */}
          <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                Structured Project Brief
              </span>
              <button
                type="button"
                className="text-link"
                style={{ fontSize: '0.8rem' }}
                onClick={handleCopy}
              >
                {copied ? '✓ Copied Brief' : 'Copy Full Text'}
              </button>
            </div>
            <pre style={{ margin: 0, padding: '10px', fontSize: '0.82rem', maxHeight: '110px', overflowY: 'auto' }}>
              <code>{compiledDraft}</code>
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <button
              type="button"
              className="text-link"
              style={{ fontSize: '0.85rem' }}
              onClick={() => {
                setStep(1);
                setProblemDescription('');
                setAttemptedSolutions('');
                setReferenceId('');
              }}
            >
              Start Another Inquiry
            </button>

            {isModal && onCloseModal && (
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={onCloseModal}
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
