import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ isOpen, onClick, buttonRef }) => (
  <motion.button
    ref={buttonRef}
    type="button"
    onClick={onClick}
    aria-label={isOpen ? 'Close Meraki Assistant' : 'Open Meraki Assistant'}
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    aria-controls="meraki-assistant-window"
    title={isOpen ? 'Close chat' : 'Chat with Meraki'}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.94 }}
    transition={{ type: 'spring', stiffness: 420, damping: 24 }}
    className="fixed bottom-6 right-6 z-[80] grid h-14 w-14 place-items-center rounded-full bg-[#102A43] text-[#D4A853] shadow-xl shadow-[#102A43]/25 ring-1 ring-white/20 transition-colors hover:bg-[#183b5b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4A853]/60 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
  >
    {isOpen ? <X size={25} strokeWidth={2} aria-hidden="true" /> : <MessageCircle size={26} strokeWidth={2} aria-hidden="true" />}
  </motion.button>
);
