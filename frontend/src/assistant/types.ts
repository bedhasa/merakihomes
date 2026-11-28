export type ChatMessageRole = 'assistant' | 'user';
export type AssistantLanguage = 'auto' | 'en' | 'am' | 'om';

export interface TextMessageContent {
  type: 'text';
  text: string;
}

export interface ServiceCardMessageContent {
  type: 'service-card';
  serviceId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  priceLabel?: string;
}

export interface ImageMessageContent {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

export interface ButtonGroupMessageContent {
  type: 'button-group';
  buttons: Array<{ id: string; label: string }>;
}

export interface BookingSummaryMessageContent {
  type: 'booking-summary';
  title: string;
  details: Array<{ label: string; value: string }>;
}

export type ChatMessageContent =
  | TextMessageContent
  | ServiceCardMessageContent
  | ImageMessageContent
  | ButtonGroupMessageContent
  | BookingSummaryMessageContent;

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: ChatMessageContent;
  timestamp: Date;
  suggestedService?: { id: string; categoryId: string | null; packageId: string | null } | null;
}

/** Opening messages; texts come from the `assistant` catalog (welcome, helpTopics). */
export const createStarterMessages = (texts: { welcome: string; helpTopics: string }): ChatMessage[] => {
  const timestamp = new Date();
  return [
    {
      id: 'welcome',
      role: 'assistant',
      content: {
        type: 'text',
        text: texts.welcome,
      },
      timestamp,
    },
    {
      id: 'help-topics',
      role: 'assistant',
      content: {
        type: 'text',
        text: texts.helpTopics,
      },
      timestamp,
    },
  ];
};
