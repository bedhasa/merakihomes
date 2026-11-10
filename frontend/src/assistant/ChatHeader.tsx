import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatHeaderProps {
  onClose: () => void;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, closeButtonRef }) => (
  <motion.header
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className="flex items-center justify-between gap-4 rounded-t-2xl bg-[#102A43] px-5 py-4 text-white"
  >
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#D4A853] text-[#102A43]">
        <MessageCircle size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 id="meraki-assistant-title" className="truncate text-base font-semibold">Merk</h2>
        <p className="mt-0.5 text-xs text-white/75">Meraki Homes AI Assistant</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p role="status" aria-live="polite" className="flex items-center gap-1.5 text-[11px] font-medium text-white/85">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
            Online now
          </p>
          <p className="text-[11px] text-white/60">Ask about services, pricing, or booking</p>
        </div>
      </div>
    </div>
    <button
      ref={closeButtonRef}
      type="button"
      onClick={onClose}
      aria-label="Close chat"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]"
    >
      <X size={20} aria-hidden="true" />
    </button>
  </motion.header>
);
