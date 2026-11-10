import React from 'react';
import { motion } from 'motion/react';
import { AssistantAvatar } from './AssistantAvatar';

export const TypingIndicator: React.FC = () => (
  <div role="status" aria-label="Merk is replying" className="flex items-end gap-2.5">
    <AssistantAvatar />
    <div className="flex h-10 items-center gap-1.5 rounded-2xl rounded-bl-sm border border-slate-100 bg-[#F7F8FA] px-4 dark:border-slate-700 dark:bg-slate-800">
      {[0, 1, 2].map(index => (
        <motion.span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-[#8C6A2F] dark:bg-[#D4A853]"
          animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.14, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      ))}
    </div>
  </div>
);
