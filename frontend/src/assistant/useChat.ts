'use client';

import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { isUiLocale, resolveAgazLanguage, type AgazLanguage } from '../../../shared/locales/config';
import { createTextMessage } from './conversationUtils';
import { createStarterMessages } from './types';
import type { AssistantLanguage, ChatMessage } from './types';

const VISITOR_KEY = 'meraki-assistant-visitor-v1';

type Suggestion = { id: string; categoryId: string | null; packageId: string | null };
type ChatReply = { conversationId: string; message: string; suggestedService: Suggestion | null };

function sessionId(key: string): string {
  try {
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(key, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export const useChat = (inputRef: RefObject<HTMLTextAreaElement | null>) => {
  const t = useTranslations('assistant');
  const uiLocaleRaw = useLocale();
  const uiLocale = isUiLocale(uiLocaleRaw) ? uiLocaleRaw : 'en';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryText, setRetryText] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [language, setLanguage] = useState<AssistantLanguage>('auto');
  const sending = useRef(false);
  const visitorIdRef = useRef<string | null>(null);

  const initializeConversation = useCallback(() => {
    setMessages(current => current.length ? current : createStarterMessages({ welcome: t('welcome'), helpTopics: t('helpTopics') }));
  }, [t]);

  const sendMessage = useCallback(async (rawText = draft, retry = false) => {
    const text = rawText.trim();
    if (!text || text.length > 2000 || sending.current) return;
    sending.current = true;
    if (!retry) {
      setMessages(current => [...current, createTextMessage('user', text)]);
      setDraft('');
    }
    setIsTyping(true);
    setError(null);
    setRetryText(null);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 90_000);
    try {
      visitorIdRef.current ??= sessionId(VISITOR_KEY);
      const visitorId = visitorIdRef.current;
      const response = await fetch('/api/agaz/chat', {
        method: 'POST',
        // Server error messages follow the page language, not the browser's.
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Language': uiLocale },
        body: JSON.stringify({
          message: text,
          language: resolveAgazLanguage(language as AgazLanguage, uiLocale),
          conversationId,
          visitorId,
        }),
        signal: controller.signal,
        cache: 'no-store',
      });
      const payload = await response.json() as ChatReply | { error?: { message?: string } };
      if (!response.ok) {
        const message = 'error' in payload ? payload.error?.message : undefined;
        if (response.status === 404 && conversationId) {
          setConversationId(null);
        }
        throw new Error(message || t('errorReply'));
      }
      if (!('message' in payload) || typeof payload.message !== 'string' || typeof payload.conversationId !== 'string') {
        throw new Error(t('errorUnexpected'));
      }
      setConversationId(payload.conversationId);
      const reply = createTextMessage('assistant', payload.message);
      reply.suggestedService = payload.suggestedService ?? null;
      setMessages(current => [...current, reply]);
      setRetryText(null);
      inputRef.current?.focus();
    } catch (cause) {
      const message = cause instanceof DOMException && cause.name === 'AbortError'
        ? t('errorSlow')
        : cause instanceof Error ? cause.message : t('errorUnavailable');
      setError(message);
      setRetryText(text);
    } finally {
      window.clearTimeout(timer);
      sending.current = false;
      setIsTyping(false);
    }
  }, [conversationId, draft, inputRef, language, t, uiLocale]);

  return { messages, draft, setDraft, isTyping, error, retryText, language, setLanguage, initializeConversation, sendMessage };
};
