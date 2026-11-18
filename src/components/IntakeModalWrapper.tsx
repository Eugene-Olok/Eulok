import React, { useState, useEffect } from 'react';
import { IntakeWizard } from './IntakeWizard';
import { type IntakePrefillContext, readStoredIntakePrefill } from '../utils/navigation';

export const IntakeModalWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<IntakePrefillContext | undefined>(undefined);
  const [modalKey, setModalKey] = useState(0);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<IntakePrefillContext & { service?: string }>;
      const detail = customEvent.detail;
      if (detail && Object.keys(detail).length > 0) {
        const normalized: IntakePrefillContext = detail.service
          ? { systemType: detail.service }
          : detail;
        setPrefill(normalized);
      } else {
        setPrefill(readStoredIntakePrefill() || undefined);
      }
      setModalKey((k) => k + 1);
      setIsOpen(true);
    };

    window.addEventListener('eulok:open-intake', handleOpen);
    return () => {
      window.removeEventListener('eulok:open-intake', handleOpen);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

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
        <IntakeWizard
          key={modalKey}
          isModal={true}
          prefill={prefill}
          onCloseModal={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
};
