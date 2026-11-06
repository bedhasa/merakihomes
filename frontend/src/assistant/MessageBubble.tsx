import React from 'react';
import { motion } from 'motion/react';
import type { ChatMessage } from './types';

interface MessageBubbleProps {
  message: ChatMessage;
  isAssistant: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isAssistant }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className={`w-fit max-w-full rounded-2xl px-4 py-3 text-sm leading-5 shadow-sm ${
      isAssistant
        ? 'rounded-bl-sm border border-slate-100 bg-[#F7F8FA] text-[#102A43] dark:border-slate-700 dark:bg-slate-800 dark:text-white'
        : 'rounded-br-sm bg-[#102A43] text-white'
    }`}
  >
    {message.content.type === 'text' && <p className="whitespace-pre-line break-words">{message.content.text}</p>}
  </motion.div>
);
