import React from 'react';

interface MessageTimestampProps {
  timestamp: Date;
  align?: 'left' | 'right';
}

export const MessageTimestamp: React.FC<MessageTimestampProps> = ({ timestamp, align = 'left' }) => (
  <time
    dateTime={timestamp.toISOString()}
    className={`mt-1 block px-1 text-[11px] leading-4 text-slate-400 dark:text-slate-500 ${align === 'right' ? 'text-right' : 'text-left'}`}
  >
    {timestamp.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
  </time>
);
