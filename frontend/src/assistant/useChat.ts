'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { createTextMessage, getRandomTypingDelay } from './conversationUtils';
import { getMockResponse } from './mockResponses';
import { createStarterMessages } from './types';
import type { ChatMessage } from './types';

export const useChat = (inputRef: RefObject<HTMLTextAreaElement | null>) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const initializeConversation = useCallback(() => {
    setMessages(current => current.length ? current : createStarterMessages());
  }, []);

  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text || isTyping) return;

    setMessages(current => [...current, createTextMessage('user', text)]);
    setDraft('');

    const response = getMockResponse(text, fallbackIndex);
    if (response.isFallback) setFallbackIndex(current => current + 1);
    setPendingResponse(response.text);
    setIsTyping(true);
  }, [draft, fallbackIndex, isTyping]);

  useEffect(() => {
    if (pendingResponse === null) return;

    const timeoutId = window.setTimeout(() => {
      setMessages(current => [...current, createTextMessage('assistant', pendingResponse)]);
      setPendingResponse(null);
      setIsTyping(false);
      inputRef.current?.focus();
    }, getRandomTypingDelay());

    return () => window.clearTimeout(timeoutId);
  }, [inputRef, pendingResponse]);

  return {
    messages,
    draft,
    setDraft,
    isTyping,
    pendingResponse,
    initializeConversation,
    sendMessage,
  };
};
