/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PhoneFrame } from './components/PhoneFrame';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { ServicesTab } from './components/ServicesTab';
import { NearbyTab } from './components/NearbyTab';
import { BookingsTab } from './components/BookingsTab';
import { ProfileTab } from './components/ProfileTab';
import { BookingModal } from './components/BookingModal';
import { ProviderModal } from './components/ProviderModal';
import { ChatModal } from './components/ChatModal';
import { ReceiptModal } from './components/ReceiptModal';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <PhoneFrame>
      <Header />

      <main className="transition-opacity duration-200">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'services' && <ServicesTab />}
        {activeTab === 'nearby' && <NearbyTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      <BottomNav />

      {/* Global Modals */}
      <BookingModal />
      <ProviderModal />
      <ChatModal />
      <ReceiptModal />
    </PhoneFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
