import React, { useState } from 'react';
import { ViewMode, Currency, Booking } from './types';
import { INITIAL_BOOKINGS } from './data/mockServices';
import { Navbar } from './components/Navbar';
import { MarketingView } from './components/MarketingView';
import { CustomerView } from './components/prototype/CustomerView';
import { WorkerView } from './components/prototype/WorkerView';
import { AdminView } from './components/prototype/AdminView';
import { AuditReportView } from './components/AuditReportView';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('marketing');
  const [currency, setCurrency] = useState<Currency>('ETB');
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [presetServiceId, setPresetServiceId] = useState<string | null>(null);
  const [marketingSubPage, setMarketingSubPage] = useState<string>('home');

  const handleCreateBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleUpdateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleSelectServiceFromMarketing = (serviceId?: string) => {
    if (serviceId) setPresetServiceId(serviceId);
    setViewMode('customer');
  };

  return (
    <div className="min-h-screen font-sans antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-golden-200 selection:text-slate-900">
      
      {/* Universal Clean White Navigation Bar */}
      <Navbar
        currentView={viewMode}
        setCurrentView={setViewMode}
        currency={currency}
        setCurrency={setCurrency}
        activeBookingCount={bookings.filter(b => b.status === 'in_progress' || b.status === 'assigned').length}
        onNavLinkClick={(page) => { setMarketingSubPage(page); setViewMode('marketing'); }}
      />

      {/* Main View Router */}
      <main className="w-full">
        {viewMode === 'marketing' && (
          <MarketingView
            currency={currency}
            onBookService={handleSelectServiceFromMarketing}
            onNavigateToRole={(role) => setViewMode(role)}
            initialSubPage={marketingSubPage}
            onSubPageChange={setMarketingSubPage}
          />
        )}

        {viewMode === 'customer' && (
          <CustomerView
            bookings={bookings}
            currency={currency}
            onCreateBooking={handleCreateBooking}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            presetServiceId={presetServiceId}
          />
        )}

        {viewMode === 'admin' && (
          <AdminView
            bookings={bookings}
            currency={currency}
            onUpdateBookingStatus={handleUpdateBookingStatus}
          />
        )}

        {viewMode === 'worker' && (
          <WorkerView
            bookings={bookings}
            currency={currency}
            onUpdateBookingStatus={handleUpdateBookingStatus}
          />
        )}

        {viewMode === 'audit_report' && (
          <AuditReportView
            onOpenPrototype={(role) => {
              if (role) setViewMode(role);
            }}
          />
        )}
      </main>

      {/* Universal Clean Ethiopian Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-golden-500"></span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100">Meraki Homes Ethiopia</span>
            <span>Home Services</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Addis Ababa, Ethiopia</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
