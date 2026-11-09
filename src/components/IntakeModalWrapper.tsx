import React, { useState, useEffect } from 'react';
import { IntakeWizard } from './IntakeWizard';

export const IntakeModalWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialService, setInitialService] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ service?: string }>;
      if (customEvent.detail?.service) {
        setInitialService(customEvent.detail.service);
      }
      setIsOpen(true);
    };

    window.addEventListener('eulok:open-intake', handleOpen);
    return () => {
      window.removeEventListener('eulok:open-intake', handleOpen);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Project Intake Form"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '92%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button
            className="button button-quiet button-small"
            onClick={() => setIsOpen(false)}
            aria-label="Close modal"
          >
            ✕ Close
          </button>
        </div>
        <IntakeWizard
          isModal={true}
          initialNeed={initialService}
          onCloseModal={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
};
