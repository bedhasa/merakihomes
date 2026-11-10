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
      {message.suggestedService && (
        <a
          href={`/booking?service=${encodeURIComponent(message.suggestedService.id)}${message.suggestedService.packageId ? `&package=${encodeURIComponent(message.suggestedService.packageId)}` : ''}`}
          className="mt-2 inline-flex min-h-10 items-center rounded-xl bg-[#D4A853] px-4 text-sm font-semibold text-[#102A43] transition hover:bg-[#e3bd6f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43]"
        >
          Continue to booking
        </a>
      )}
      <MessageTimestamp timestamp={message.timestamp} />
    </div>
  </div>
);
