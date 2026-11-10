import React from 'react';
import { Send } from 'lucide-react';
import type { AssistantLanguage } from './types';

interface ChatFooterProps {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isTyping: boolean;
  error: string | null;
  onRetry: () => void;
  language: AssistantLanguage;
  onLanguageChange: (language: AssistantLanguage) => void;
}

const languages: Array<{ value: AssistantLanguage; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'en', label: 'English' },
  { value: 'am', label: 'አማርኛ' },
  { value: 'om', label: 'Afaan Oromoo' },
];
export const ChatFooter: React.FC<ChatFooterProps> = ({ inputRef, draft, onDraftChange, onSend, isTyping, error, onRetry, language, onLanguageChange }) => {
  const isSendDisabled = isTyping || !draft.trim();

  return (
    <footer className="rounded-b-2xl border-t border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      {error && <div role="alert" className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"><span>{error}</span><button type="button" onClick={onRetry} disabled={isTyping} className="shrink-0 font-semibold underline disabled:opacity-50">Retry</button></div>}
      <div role="group" aria-label="Reply language" className="mb-3 flex flex-wrap gap-1.5">
        {languages.map(option => <button key={option.value} type="button" aria-pressed={language === option.value} onClick={() => onLanguageChange(option.value)} className={`min-h-8 rounded-full border px-3 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] ${language === option.value ? 'border-[#102A43] bg-[#102A43] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-[#D4A853] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>{option.label}</button>)}
      </div>      <form
        onSubmit={event => {
          event.preventDefault();
          onSend();
        }}
        className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-sm transition duration-200 focus-within:border-[#D4A853] focus-within:ring-2 focus-within:ring-[#D4A853]/20 dark:border-slate-700 dark:bg-slate-800"
      >
        <label className="sr-only" htmlFor="meraki-assistant-input">Message Agaz AI, the Meraki Homes assistant</label>
        <textarea
          ref={inputRef}
          id="meraki-assistant-input"
          rows={2}
          value={draft}
          onChange={event => onDraftChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              onSend();
            }
          }}
          maxLength={2000}
          placeholder="Ask Agaz AI about Meraki Homes..."
          aria-describedby="meraki-assistant-input-help"
          className="max-h-28 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-5 text-[#102A43] outline-none placeholder:text-[13px] placeholder:font-normal placeholder:text-slate-400 focus-visible:outline-none dark:text-white"
        />
        <button
          type="submit"
          disabled={isSendDisabled}
          aria-label="Send message"
          title={isSendDisabled ? (isTyping ? 'Please wait for the reply' : 'Enter a message to send') : 'Send message'}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#102A43] text-[#D4A853] shadow-sm transition duration-200 enabled:hover:-translate-y-0.5 enabled:hover:bg-[#183b5b] enabled:hover:shadow-md enabled:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={17} aria-hidden="true" />
        </button>
      </form>
      <p id="meraki-assistant-input-help" className="mt-2.5 text-center text-[10px] tracking-wide text-slate-400 dark:text-slate-500">
        Agaz AI · Meraki Homes
      </p>
    </footer>
  );
};
