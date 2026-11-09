import React from 'react';
import { Bot } from 'lucide-react';

interface AssistantAvatarProps {
  size?: 'small' | 'medium';
}

export const AssistantAvatar: React.FC<AssistantAvatarProps> = ({ size = 'small' }) => (
  <span
    aria-hidden="true"
    className={`grid shrink-0 place-items-center rounded-full bg-[#D4A853]/20 text-[#102A43] ring-1 ring-[#D4A853]/40 dark:text-[#D4A853] ${size === 'medium' ? 'h-11 w-11' : 'h-8 w-8'}`}
  >
    <Bot size={size === 'medium' ? 21 : 16} strokeWidth={1.8} />
  </span>
);
