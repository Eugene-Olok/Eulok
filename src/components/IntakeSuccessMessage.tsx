import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Mail,
  MessageSquare,
} from 'lucide-react';

export interface IntakeSuccessMessageProps {
  referenceId: string;
  need: string;
  systemType: string;
  budget: string;
  compiledDraft: string;
  whatsappUrl: string;
  mailtoUrl: string;
  isOfflineFallback?: boolean;
  isModal?: boolean;
  onReset: () => void;
  onCloseModal?: () => void;
}

export const IntakeSuccessMessage: React.FC<IntakeSuccessMessageProps> = ({
  referenceId,
  need,
  systemType,
  budget,
  compiledDraft,
  whatsappUrl,
  mailtoUrl,
  isOfflineFallback = false,
  isModal = false,
  onReset,
  onCloseModal,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  const handleCopyRef = () => {
    if (!referenceId || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(referenceId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 3000);
  };

  const handleCopyBrief = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(compiledDraft);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 3000);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="intake-success-message"
    >
      {/* Confirmation Banner */}
      <div
        style={{
          background: 'var(--status-pass-bg)',
          border: '1px solid var(--status-pass-border)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.14)',
              border: '1px solid var(--status-pass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={20} color="var(--status-pass-text)" aria-hidden="true" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', color: 'var(--warm-white)' }}>
              Project Scoping Brief Submitted
            </h3>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-subtle)', lineHeight: 1.5 }}>
              {isOfflineFallback
                ? 'Recorded locally with a tracking reference for immediate dispatch via WhatsApp or Email.'
                : 'Your project scoping brief has been cataloged. Engineering review typically initiates within 1 business day.'}
            </p>
          </div>
        </div>

        <div
          className="surface-inset"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '8px',
          }}
        >
          <div>
            <span className="mono-tag" style={{ color: 'var(--electric-blue)', fontWeight: 700 }}>
              TRACKING REFERENCE ID
            </span>
            <div
              data-testid="intake-reference-id"
              style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--warm-white)',
                marginTop: '2px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {referenceId}
            </div>
          </div>

          <button
            type="button"
            className="button button-quiet button-small"
            onClick={handleCopyRef}
          >
            {copiedRef ? <CheckCircle2 size={14} color="var(--status-pass-text)" /> : <Copy size={14} />}
            <span>{copiedRef ? 'Copied ID' : 'Copy Reference'}</span>
          </button>
        </div>
      </div>

      {/* Scoping Summary Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
          gap: '10px',
          marginBottom: '14px',
        }}
      >
        <div className="surface-inset" style={{ padding: '8px 12px', borderRadius: '8px' }}>
          <span className="mono-tag" style={{ display: 'block', fontSize: '0.7rem', marginBottom: '2px' }}>
            GOAL
          </span>
          <strong style={{ fontSize: '0.84rem', color: 'var(--warm-white)' }}>{need}</strong>
        </div>
        <div className="surface-inset" style={{ padding: '8px 12px', borderRadius: '8px' }}>
          <span className="mono-tag" style={{ display: 'block', fontSize: '0.7rem', marginBottom: '2px' }}>
            SYSTEM TYPE
          </span>
          <strong style={{ fontSize: '0.84rem', color: 'var(--warm-white)' }}>{systemType}</strong>
        </div>
        <div className="surface-inset" style={{ padding: '8px 12px', borderRadius: '8px' }}>
          <span className="mono-tag" style={{ display: 'block', fontSize: '0.7rem', marginBottom: '2px' }}>
            PLANNING BUDGET
          </span>
          <strong style={{ fontSize: '0.84rem', color: 'var(--warm-white)' }}>{budget}</strong>
        </div>
      </div>

      {/* Direct Dispatch Channels */}
      <div style={{ marginBottom: '14px' }}>
        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--warm-white)', display: 'block', marginBottom: '8px' }}>
          Choose your direct engineering contact channel:
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '10px' }}>
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
              padding: '10px 16px',
            }}
          >
            <MessageSquare size={18} fill="#052e16" />
            <span>Open in WhatsApp</span>
          </a>

          <a
            className="button button-quiet"
            href={mailtoUrl}
            style={{ justifyContent: 'center', padding: '10px 16px' }}
          >
            <Mail size={18} />
            <span>Open in Email</span>
          </a>
        </div>
      </div>

      {/* Compiled Brief Preview */}
      <div className="surface-inset" style={{ padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '8px', flexWrap: 'wrap' }}>
          <span className="mono-tag" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
            Structured Project Brief
          </span>
          <button
            type="button"
            className="text-link"
            style={{ fontSize: '0.8rem' }}
            onClick={handleCopyBrief}
          >
            {copiedBrief ? '✓ Copied Brief' : 'Copy Full Text'}
          </button>
        </div>
        <pre style={{ margin: 0, padding: '8px', fontSize: '0.8rem', maxHeight: '84px', overflowY: 'auto' }}>
          <code>{compiledDraft}</code>
        </pre>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
        <button
          type="button"
          className="text-link"
          style={{ fontSize: '0.85rem' }}
          onClick={onReset}
        >
          Start Another Inquiry
        </button>

        {isModal && onCloseModal && (
          <button
            type="button"
            data-testid="intake-success-done"
            className="button button-primary button-small"
            onClick={onCloseModal}
          >
            Done &amp; Close
          </button>
        )}
      </div>
    </div>
  );
};
