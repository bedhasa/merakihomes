import React from 'react';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import type { ChatMessage, ChatMessageRole } from './types';

interface MessageGroupProps {
  role: ChatMessageRole;
  messages: ChatMessage[];
}

export const MessageGroup: React.FC<MessageGroupProps> = ({ role, messages }) => (
  <div className="space-y-2.5">
    {messages.map((message, index) => role === 'assistant'
      ? <AssistantMessage key={message.id} message={message} showAvatar={index === 0} />
      : <UserMessage key={message.id} message={message} />)}
  </div>
);
