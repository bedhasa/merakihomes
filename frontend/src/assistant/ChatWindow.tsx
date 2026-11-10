import React from 'react';
import { motion } from 'motion/react';
import { ChatBody } from './ChatBody';
import { ChatFooter } from './ChatFooter';
import { ChatHeader } from './ChatHeader';
import type { ChatMessage } from './types';

interface ChatWindowProps {
  onClose: () => void;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isTyping: boolean;
  error: string | null;
  onRetry: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, closeButtonRef, inputRef, messages, draft, onDraftChange, onSend, isTyping, error, onRetry }) => (
  <motion.section
    id="meraki-assistant-window"
    role="dialog"
    aria-modal="false"
    aria-labelledby="meraki-assistant-title"
    initial={{ opacity: 0, y: 14, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.98 }}
    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    className="fixed inset-x-4 bottom-[92px] z-[80] flex max-h-[calc(100dvh-7.5rem)] min-h-[min(420px,calc(100dvh-7.5rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-[#102A43]/20 dark:border-slate-700 dark:bg-slate-900 sm:inset-x-auto sm:bottom-28 sm:right-8 sm:w-[min(24rem,calc(100vw-3rem))]"
  >
    <ChatHeader onClose={onClose} closeButtonRef={closeButtonRef} />
    <ChatBody messages={messages} isTyping={isTyping} />
    <ChatFooter inputRef={inputRef} draft={draft} onDraftChange={onDraftChange} onSend={onSend} isTyping={isTyping} error={error} onRetry={onRetry} />
  </motion.section>
);
