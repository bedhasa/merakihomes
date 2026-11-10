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

export const createStarterMessages = (): ChatMessage[] => {
  const timestamp = new Date();
  return [
    {
      id: 'welcome',
      role: 'assistant',
      content: {
        type: 'text',
        text: "\u{1F44B} Hello and welcome to Meraki Homes! I'm Agaz AI, Meraki Homes' assistant. I can help with services, pricing, and booking requests.",
      },
      timestamp,
    },
    {
      id: 'help-topics',
      role: 'assistant',
      content: {
        type: 'text',
        text: 'Choose a service question to start. Operations confirms availability, final scope, and price after reviewing a booking request.',
      },
      timestamp,
    },
  ];
};
