import React, { useState } from 'react';
import { X, ExternalLink, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [problem, setProblem] = useState('');
  const [tried, setTried] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const compiledMessage = `Hello Company OS,\n\nI'd like to discuss a project:\n\n*Problem / Need:* ${problem || 'Not specified yet'}\n*What we've tried:* ${tried || 'Not specified'}\n*Timeline / Deadline:* ${deadline || 'Flexible'}\n*Budget range:* ${budget || 'To be assessed'}\n\nPlease let me know your thoughts and next steps.`;

  const whatsappUrl = `https://wa.me/256760779160?text=${encodeURIComponent(compiledMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: '6px' }}>Project Inquiry</p>
            <h2 id="modal-title" style={{ marginBottom: 0, fontSize: '1.6rem' }}>Start with the problem</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
          WhatsApp is our direct enquiry channel. Describe the workflow bottleneck below. Please do not submit passwords, live transaction credentials, or confidential production keys.
        </p>

        <div className="form-group">
          <label className="form-label" htmlFor="modal-problem">
            1. What problem needs solving?
          </label>
          <textarea
            id="modal-problem"
            className="form-textarea"
            rows={3}
            placeholder="e.g. Mobile money payments from parents do not reconcile cleanly with school tuition balances..."
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="modal-tried">
            2. What happens today or what have you already tried?
          </label>
          <input
            id="modal-tried"
            type="text"
            className="form-input"
            placeholder="e.g. Staff manually check SMS notifications and paste into Excel spreadsheets..."
            value={tried}
            onChange={(e) => setTried(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label className="form-label" htmlFor="modal-deadline">
              Deadline / Urgency
            </label>
            <input
              id="modal-deadline"
              type="text"
              className="form-input"
              placeholder="e.g. Term begins in 4 weeks"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="modal-budget">
              Budget Range (UGX or USD)
            </label>
            <input
              id="modal-budget"
              type="text"
              className="form-input"
              placeholder="e.g. 5M - 15M UGX"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            className="button button-primary"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Continue on WhatsApp</span>
            <ExternalLink size={16} />
          </a>

          <button
            className="button button-quiet"
            onClick={handleCopy}
            type="button"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {copied ? (
              <>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Copy Draft Message</span>
              </>
            )}
          </button>
        </div>

        <p style={{ marginTop: '18px', marginBottom: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
          Based in Kampala, Uganda · Available for remote collaboration worldwide.
        </p>
      </div>
    </div>
  );
};
