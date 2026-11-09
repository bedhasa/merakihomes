import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, CalendarDays, CircleHelp, Headset, Search } from 'lucide-react';
import { MessageGroup } from './MessageGroup';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage, ChatMessageRole } from './types';

const quickActions = [
  { label: 'Book a Service', icon: CalendarDays },
  { label: 'Explore Services', icon: Search },
  { label: 'Pricing', icon: CircleHelp },
  { label: 'Contact Support', icon: Headset },
];

interface ChatBodyProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

interface MessageGroupData {
  role: ChatMessageRole;
  messages: ChatMessage[];
}

const groupMessages = (messages: ChatMessage[]): MessageGroupData[] => {
  const groups: MessageGroupData[] = [];
  for (const message of messages) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.role === message.role) lastGroup.messages.push(message);
    else groups.push({ role: message.role, messages: [message] });
  }
  return groups;
};

export const ChatBody: React.FC<ChatBodyProps> = ({ messages, isTyping }) => {
  const groups = useMemo(() => groupMessages(messages), [messages]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (scrollArea) scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div ref={scrollRef} role="region" aria-label="Conversation and suggestions" tabIndex={0} className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D4A853] dark:bg-slate-900">
      <div role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions" className="space-y-4">
        {groups.map(group => (
          <div key={`${group.role}-${group.messages[0].id}`} role="group" aria-label={group.role === 'assistant' ? 'Assistant messages' : 'Your messages'}>
            <MessageGroup role={group.role} messages={group.messages} />
          </div>
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      <section aria-labelledby="chat-suggestions-title" className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-700">
        <h3 id="chat-suggestions-title" className="mb-3 text-[11px] font-semibold uppercase tracking-[.12em] text-slate-500 dark:text-slate-400">Suggested questions</h3>
        <div role="group" aria-label="Suggested questions" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {quickActions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="group flex min-h-12 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-left text-sm font-medium text-[#102A43] shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#D4A853] hover:bg-[#FBF8F0] hover:shadow-md active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            <span className="flex items-center gap-2.5">
              <Icon size={16} className="shrink-0 text-[#8C6A2F] transition-transform duration-200 group-hover:scale-110 dark:text-[#D4A853]" aria-hidden="true" />
              {label}
            </span>
            <ArrowRight size={14} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        ))}
        </div>
      </section>
    </div>
  );
};
