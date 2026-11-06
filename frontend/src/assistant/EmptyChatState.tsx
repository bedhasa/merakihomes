import React from 'react';
import { AssistantAvatar } from './AssistantAvatar';

export const EmptyChatState: React.FC = () => (
  <div className="flex min-h-full flex-col items-center justify-center px-6 py-10 text-center">
    <AssistantAvatar size="medium" />
    <h3 className="mt-4 text-sm font-semibold text-[#102A43] dark:text-white">Welcome to Meraki Homes</h3>
    <p className="mt-2 max-w-xs text-sm leading-5 text-slate-600 dark:text-slate-300">
      I&apos;m here to help you find a service, understand pricing, or get ready to book.
    </p>
  </div>
);
