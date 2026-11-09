import React from 'react';
import { MessageSquare } from 'lucide-react';
import { openIntakeModal } from '../utils/navigation';

interface FloatingWhatsAppProps {
  onOpenIntake?: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onOpenIntake }) => {
  const handleClick = () => {
    if (onOpenIntake) {
      onOpenIntake();
    } else {
      openIntakeModal();
    }
  };

  return (
    <button
      className="floating-whatsapp-btn"
      onClick={handleClick}
      aria-label="Contact EULOK on WhatsApp"
      title="Contact EULOK on WhatsApp"
    >
      <MessageSquare size={18} fill="#052e16" color="#052e16" />
      <span>Contact on WhatsApp</span>
    </button>
  );
};
