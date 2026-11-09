import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  ServiceCategory,
  ServiceItem,
  ProviderItem,
  BookingOrder,
  BookingStatus
} from '../types';
import { INITIAL_BOOKINGS, SERVICES, PROVIDERS } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof TRANSLATIONS.en;
  activeTab: 'home' | 'services' | 'nearby' | 'bookings' | 'profile';
  setActiveTab: (tab: 'home' | 'services' | 'nearby' | 'bookings' | 'profile') => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (zone: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ServiceCategory;
  setSelectedCategory: (cat: ServiceCategory) => void;
  bookings: BookingOrder[];
  addBooking: (booking: Omit<BookingOrder, 'id' | 'createdAt'>) => string;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  activeBookingModal: { service?: ServiceItem; provider?: ProviderItem } | null;
  openBookingModal: (service?: ServiceItem, provider?: ProviderItem) => void;
  closeBookingModal: () => void;
  activeProviderModal: ProviderItem | null;
  openProviderModal: (provider: ProviderItem) => void;
  closeProviderModal: () => void;
  activeChatModal: BookingOrder | null;
  openChatModal: (booking: BookingOrder) => void;
  closeChatModal: () => void;
  activeReceiptModal: BookingOrder | null;
  openReceiptModal: (booking: BookingOrder) => void;
  closeReceiptModal: () => void;
  isPhoneFrame: boolean;
  setIsPhoneFrame: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'nearby' | 'bookings' | 'profile'>('home');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  const [bookings, setBookings] = useState<BookingOrder[]>(INITIAL_BOOKINGS);
  const [activeBookingModal, setActiveBookingModal] = useState<{ service?: ServiceItem; provider?: ProviderItem } | null>(null);
  const [activeProviderModal, setActiveProviderModal] = useState<ProviderItem | null>(null);
  const [activeChatModal, setActiveChatModal] = useState<BookingOrder | null>(null);
  const [activeReceiptModal, setActiveReceiptModal] = useState<BookingOrder | null>(null);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  const t = TRANSLATIONS[language];

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'am' : 'en'));
  };

  const addBooking = (newBookingData: Omit<BookingOrder, 'id' | 'createdAt'>) => {
    const id = `BETE-AA-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: BookingOrder = {
      ...newBookingData,
      id,
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [newBooking, ...prev]);
    return id;
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status } : b))
    );
  };

  const openBookingModal = (service?: ServiceItem, provider?: ProviderItem) => {
    setActiveBookingModal({
      service: service || SERVICES[0],
      provider: provider || (service ? PROVIDERS.find(p => p.category === service.category) : PROVIDERS[0])
    });
  };

  const closeBookingModal = () => {
    setActiveBookingModal(null);
  };

  const openProviderModal = (provider: ProviderItem) => {
    setActiveProviderModal(provider);
  };

  const closeProviderModal = () => {
    setActiveProviderModal(null);
  };

  const openChatModal = (booking: BookingOrder) => {
    setActiveChatModal(booking);
  };

  const closeChatModal = () => {
    setActiveChatModal(null);
  };

  const openReceiptModal = (booking: BookingOrder) => {
    setActiveReceiptModal(booking);
  };

  const closeReceiptModal = () => {
    setActiveReceiptModal(null);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        activeTab,
        setActiveTab,
        selectedNeighborhood,
        setSelectedNeighborhood,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        bookings,
        addBooking,
        updateBookingStatus,
        activeBookingModal,
        openBookingModal,
        closeBookingModal,
        activeProviderModal,
        openProviderModal,
        closeProviderModal,
        activeChatModal,
        openChatModal,
        closeChatModal,
        activeReceiptModal,
        openReceiptModal,
        closeReceiptModal,
        isPhoneFrame,
        setIsPhoneFrame,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
