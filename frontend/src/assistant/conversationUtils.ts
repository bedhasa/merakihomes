import type { ChatMessage, ChatMessageRole } from './types';

export const createTextMessage = (role: ChatMessageRole, text: string): ChatMessage => ({
  id: `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
  role,
  content: { type: 'text', text },
  timestamp: new Date(),
});

export const getRandomTypingDelay = (): number => 800 + Math.floor(Math.random() * 401);
