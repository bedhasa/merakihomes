export type ChatMessageRole = 'assistant' | 'user';

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
}

export const createStarterMessages = (): ChatMessage[] => {
  const timestamp = new Date();
  return [
    {
      id: 'welcome',
      role: 'assistant',
      content: {
        type: 'text',
        text: "\u{1F44B} Hello and welcome to Meraki Homes!\n\nI'm your AI assistant and I'm here to help you find trusted home services quickly and easily.",
      },
      timestamp,
    },
    {
      id: 'help-topics',
      role: 'assistant',
      content: {
        type: 'text',
        text: 'I can help you:\n\u2022 Find the right service\n\u2022 Explain pricing\n\u2022 Answer common questions\n\u2022 Guide you through booking\n\nChoose one of the suggestions below to get started.',
      },
      timestamp,
    },
  ];
};
