import React from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageTimestamp } from './MessageTimestamp';
import type { ChatMessage } from './types';

interface UserMessageProps {
  message: ChatMessage;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => (
  <div className="flex w-full justify-end">
    <div className="min-w-0 max-w-[80%]">
      <MessageBubble message={message} isAssistant={false} />
      <MessageTimestamp timestamp={message.timestamp} align="right" />
    </div>
  </div>
);
