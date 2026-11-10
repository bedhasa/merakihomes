'use client';

import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { createTextMessage } from './conversationUtils';
import { createStarterMessages } from './types';
import type { ChatMessage } from './types';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryText, setRetryText] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const sending = useRef(false);
  const visitorIdRef = useRef<string | null>(null);

  const initializeConversation = useCallback(() => {
    setMessages(current => current.length ? current : createStarterMessages());
  }, []);

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
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ message: text, language: 'auto', conversationId, visitorId }),
        signal: controller.signal,
        cache: 'no-store',
      });
      const payload = await response.json() as ChatReply | { error?: { message?: string } };
      if (!response.ok) {
        const message = 'error' in payload ? payload.error?.message : undefined;
        if (response.status === 404 && conversationId) {
          setConversationId(null);
        }
        throw new Error(message || 'The assistant could not reply. Please try again.');
      }
      if (!('message' in payload) || typeof payload.message !== 'string' || typeof payload.conversationId !== 'string') {
        throw new Error('The assistant returned an unexpected response. Please try again.');
      }
      setConversationId(payload.conversationId);
      const reply = createTextMessage('assistant', payload.message);
      reply.suggestedService = payload.suggestedService ?? null;
      setMessages(current => [...current, reply]);
      setRetryText(null);
      inputRef.current?.focus();
    } catch (cause) {
      const message = cause instanceof DOMException && cause.name === 'AbortError'
        ? 'The reply is taking longer than expected. Check your connection and retry.'
        : cause instanceof Error ? cause.message : 'The assistant is temporarily unavailable. Please try again.';
      setError(message);
      setRetryText(text);
    } finally {
      window.clearTimeout(timer);
      sending.current = false;
      setIsTyping(false);
    }
  }, [conversationId, draft, inputRef]);

  return { messages, draft, setDraft, isTyping, error, retryText, initializeConversation, sendMessage };
};
