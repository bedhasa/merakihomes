export interface MockResponse {
  text: string;
  isFallback: boolean;
}

const fallbackResponses = [
  "Thanks for your message!\n\nI'm currently running in demonstration mode.\n\nIn the next phase I'll be connected to our intelligent assistant.",
  "Thanks for reaching out!\n\nI'm in demonstration mode for now. In the next phase, I'll be connected to our intelligent assistant.",
  "I appreciate your message!\n\nI'm currently in demonstration mode. I'll be connected to our intelligent assistant in a future phase.",
];

export const getMockResponse = (userMessage: string, fallbackIndex = 0): MockResponse => {
  const message = userMessage.toLowerCase().trim();

  if (/\b(hello|hi|hey)\b/.test(message)) {
    return { text: 'Hello! 👋 Welcome to Meraki Homes.', isFallback: false };
  }

  if (/\b(clean|cleaning|cleaner|cleaners)\b/.test(message)) {
    return {
      text: "Home Cleaning is one of our most popular services. In a future step I'll help you choose the right option.",
      isFallback: false,
    };
  }

  if (/\b(price|pricing|cost|costs)\b|how much/.test(message)) {
    return { text: "I'll soon be able to provide live pricing from our service database.", isFallback: false };
  }

  if (/\b(book|booking|bookings)\b/.test(message)) {
    return { text: 'Booking integration will be added in a later phase.', isFallback: false };
  }

  return {
    text: fallbackResponses[Math.abs(fallbackIndex) % fallbackResponses.length],
    isFallback: true,
  };
};
