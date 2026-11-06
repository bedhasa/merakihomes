import React from 'react';
import { AssistantAvatar } from './AssistantAvatar';
import { MessageBubble } from './MessageBubble';
import { MessageTimestamp } from './MessageTimestamp';
import type { ChatMessage } from './types';

interface AssistantMessageProps {
  message: ChatMessage;
  showAvatar: boolean;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, showAvatar }) => (
  <div className="flex w-full items-end gap-2.5">
    {showAvatar ? <AssistantAvatar /> : <span aria-hidden="true" className="w-8 shrink-0" />}
    <div className="min-w-0 max-w-[min(86%,40rem)] flex-1">
      <MessageBubble message={message} isAssistant />
      <MessageTimestamp timestamp={message.timestamp} />
    </div>
  </div>
);
