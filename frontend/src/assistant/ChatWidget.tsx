'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import { useChat } from './useChat';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chat = useChat(inputRef);

  const closeChat = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const openChat = () => {
    chat.initializeConversation();
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeChat();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            onClose={closeChat}
            closeButtonRef={closeButtonRef}
            inputRef={inputRef}
            messages={chat.messages}
            draft={chat.draft}
            onDraftChange={chat.setDraft}
            onSend={chat.sendMessage}
            isTyping={chat.isTyping}

            error={chat.error}
            onRetry={() => void chat.sendMessage(chat.retryText || '', true)}
            language={chat.language}
            onLanguageChange={chat.setLanguage}
          />
        )}
      </AnimatePresence>
      <ChatButton isOpen={isOpen} onClick={isOpen ? closeChat : openChat} buttonRef={buttonRef} />
    </>
  );
};
