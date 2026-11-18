import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { generateReferenceId, sanitizeString, validateIntakePayload } from '../engine/intakeValidation';
import {
  type IntakePrefillContext,
  readStoredIntakePrefill,
  clearStoredIntakePrefill,
} from '../utils/navigation';
import { IntakeSuccessMessage } from './IntakeSuccessMessage';

interface IntakeWizardProps {
  initialNeed?: string;
  initialSystem?: string;
  prefill?: IntakePrefillContext;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const IntakeWizard: React.FC<IntakeWizardProps> = ({
  initialNeed,
  initialSystem,
  prefill,
  isModal = false,
  onCloseModal,
}) => {
  const [step, setStep] = useState<number>(1);
  const [need, setNeed] = useState<string>(prefill?.need || initialNeed || 'Build something new');
  const [systemType, setSystemType] = useState<string>(prefill?.systemType || initialSystem || 'Custom business software');
  const [budgetCurrency, setBudgetCurrency] = useState<'UGX' | 'USD'>('UGX');
  const [budget, setBudget] = useState<string>(prefill?.budget || 'UGX 2M–7.5M');
  const [problemDescription, setProblemDescription] = useState<string>(prefill?.problemDescription || '');
  const [attemptedSolutions, setAttemptedSolutions] = useState<string>(prefill?.attemptedSolutions || '');
  const [attachedSpecHash, setAttachedSpecHash] = useState<string | undefined>(prefill?.specHash);
  const [attachedSpecSummary, setAttachedSpecSummary] = useState<string | undefined>(prefill?.specSummary);
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>(''); // Bot trap
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string>('');
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);

  React.useEffect(() => {
    if (prefill) return;
    const stored = readStoredIntakePrefill();
    if (stored) {
      if (stored.need) setNeed(stored.need);
      if (stored.systemType) setSystemType(stored.systemType);
      if (stored.budget) setBudget(stored.budget);
      if (stored.problemDescription) setProblemDescription(stored.problemDescription);
      if (stored.attemptedSolutions) setAttemptedSolutions(stored.attemptedSolutions);
      if (stored.specHash) setAttachedSpecHash(stored.specHash);
      if (stored.specSummary) setAttachedSpecSummary(stored.specSummary);
    }
  }, [prefill]);

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

  const budgetOptionsByCurrency = {
    UGX: [
      { label: 'UGX 2M–7.5M', note: 'Focused presence builds, bounded diagnostics, or targeted adapters' },
      { label: 'UGX 7.5M–18.5M', note: 'Custom workflow portals, URA EFRIS gateways, rescue sprints' },
      { label: 'UGX 18.5M–55M+', note: 'Multi-rail reconciliation cores and full operational systems' },
      { label: 'Unknown / Early stage', note: 'Need initial discovery and technical scoping first' },
      { label: 'Custom explanation', note: 'Procurement constraints or phased milestone schedules' },
    ],
    USD: [
      { label: '$500–$2,000', note: 'Indicative planning range for bounded diagnostics or focused sites' },
      { label: '$2,000–$8,000', note: 'Multi-system integrations, custom workflow portals, rescue sprints' },
      { label: '$8,000–$25,000+', note: 'Regional East African enterprise and donor-funded multi-rail infrastructure' },
      { label: 'Unknown / Early stage', note: 'Need initial discovery and technical scoping first' },
      { label: 'Custom explanation', note: 'Procurement constraints, phased milestone grants' },
    ],
  };

  const budgetOptions = [
    ...(attachedSpecHash && prefill?.budget
      ? [{ label: prefill.budget, note: `Imported from Scoping Spec ${attachedSpecHash}` }]
      : []),
    ...budgetOptionsByCurrency[budgetCurrency],
  ];

  const compiledDraft = `Hello EULOK,\n\nI would like to discuss a software engineering engagement:\n\nReference: ${referenceId || 'PENDING'}\n${attachedSpecHash ? `Attached Spec: ${attachedSpecHash}${attachedSpecSummary ? ` (${attachedSpecSummary})` : ''}\n` : ''}1. Project Need: ${need}\n2. System Type: ${systemType}\n3. Budget Indication: ${budget}\n4. Operational Problem: ${problemDescription.trim() || 'To be discussed during discovery.'}\n5. What was already tried: ${attemptedSolutions.trim() || 'None recorded yet.'}\n${clientEmail ? `6. Contact Email: ${clientEmail.trim()}\n` : ''}${clientPhone ? `7. Contact Phone: ${clientPhone.trim()}\n` : ''}\nPlease let me know your thoughts and availability for a focused scoping discussion.`;

  // Encoded WhatsApp URL without printing the number anywhere in text
  const whatsappUrl = `https://wa.me/256760779160?text=${encodeURIComponent(compiledDraft)}`;
  const mailtoUrl = `mailto:hello@eulok.com?subject=${encodeURIComponent(`Project Inquiry [${referenceId || 'NEW'}]: ${systemType}`)}&body=${encodeURIComponent(compiledDraft)}`;

  const handleReset = () => {
    setStep(1);
    setProblemDescription('');
    setAttemptedSolutions('');
    setSubmitError(null);
    setReferenceId('');
    setIsOfflineFallback(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
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

    const localValidation = validateIntakePayload(payload);
    if (!localValidation.isValid) {
      setSubmitError(localValidation.errors.join(' '));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        referenceId?: string;
        errors?: string[];
      };

      if (response.ok) {
        setReferenceId(data.referenceId || localValidation.referenceId || generateReferenceId());
        setIsOfflineFallback(false);
        clearStoredIntakePrefill();
        setStep(5);
      } else if (response.status === 404) {
        // Local Astro static dev/preview does not serve Cloudflare Pages Functions (/functions/api/intake.ts)
        setReferenceId(localValidation.referenceId || generateReferenceId());
        setIsOfflineFallback(true);
        clearStoredIntakePrefill();
        setStep(5);
      } else if (response.status >= 400 && response.status < 500) {
        const message =
          Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors.join(' ')
            : 'Please review the submitted details and fix any validation issues.';
        setSubmitError(message);
      } else {
        // Fallback: If backend is temporarily unavailable (5xx), issue client-side reference
        // so the inquiry can continue via WhatsApp/Email without data loss.
        setReferenceId(localValidation.referenceId || generateReferenceId());
        setIsOfflineFallback(true);
        setStep(5);
      }
    } catch {
      // Graceful offline degradation
      setReferenceId(localValidation.referenceId || generateReferenceId());
      setIsOfflineFallback(true);
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

      {/* Attached Scoping / Triage Context Banner */}
      {(attachedSpecHash || attachedSpecSummary) && (
        <div
          style={{
            padding: '12px 14px',
            marginBottom: '16px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: '0.82rem' }}>
            <strong style={{ color: 'var(--electric-blue)', display: 'block' }}>
              Imported Specification{attachedSpecHash ? `: ${attachedSpecHash}` : ''}
            </strong>
            {attachedSpecSummary && (
              <span style={{ color: 'var(--text-subtle)' }}>{attachedSpecSummary}</span>
            )}
          </div>
          <button
            type="button"
            className="text-link"
            style={{ fontSize: '0.76rem' }}
            onClick={() => {
              setAttachedSpecHash(undefined);
              setAttachedSpecSummary(undefined);
              clearStoredIntakePrefill();
            }}
          >
            Clear attachment
          </button>
        </div>
      )}

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, maxWidth: '46ch' }}>
              Indicative planning range helps us scope an appropriate starting increment. It is not a binding quote.
            </p>
            <div role="group" aria-label="Budget currency view" style={{ display: 'flex', gap: '6px' }}>
              {(['UGX', 'USD'] as const).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setBudgetCurrency(cur)}
                  aria-pressed={budgetCurrency === cur}
                  className={`button button-small ${budgetCurrency === cur ? 'button-primary' : 'button-quiet'}`}
                  style={{ padding: '4px 10px', minHeight: '32px', fontSize: '0.76rem' }}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', marginBottom: '20px' }}>
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
            <div
              role="alert"
              data-testid="intake-submit-error"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-fail-text)', fontSize: '0.84rem', marginBottom: '16px' }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
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
              data-testid="intake-submit-btn"
              className="button button-primary"
              disabled={isSubmitting || !problemDescription.trim()}
              aria-busy={isSubmitting}
              style={{ minWidth: '220px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={16}
                    className="spin"
                    aria-hidden="true"
                    data-testid="intake-submit-loading"
                  />
                  <span>Submitting Brief…</span>
                </>
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
        <IntakeSuccessMessage
          referenceId={referenceId}
          need={need}
          systemType={systemType}
          budget={budget}
          compiledDraft={compiledDraft}
          whatsappUrl={whatsappUrl}
          mailtoUrl={mailtoUrl}
          isOfflineFallback={isOfflineFallback}
          isModal={isModal}
          onReset={handleReset}
          onCloseModal={onCloseModal}
        />
      )}
    </div>
  );
};
