import React, { useState, useEffect } from 'react';
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
  const [customerInitialTab, setCustomerInitialTab] = useState<'book' | undefined>(undefined);

  const handleCreateBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleUpdateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleSelectServiceFromMarketing = (serviceId?: string) => {
    if (serviceId) setPresetServiceId(serviceId);
    setCustomerInitialTab('book');
    setViewMode('customer');
  };

  const handleBookServiceClick = () => {
    setPresetServiceId(null);
    setCustomerInitialTab('book');
    setViewMode('customer');
  };

  useEffect(() => {
    if (viewMode !== 'customer') {
      setCustomerInitialTab(undefined);
    }
  }, [viewMode]);

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
        onBookServiceClick={handleBookServiceClick}
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
            initialTab={customerInitialTab}
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
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">MERAKI HOMES</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">"Where Every Detail Is Done With Soul"</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">CONTACT</h4>
              <div className="text-[11px] space-y-1">
                <div>+251 936 259 142</div>
                <div>+251 913 394 404</div>
                <div>Addis Ababa, Ethiopia</div>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">SERVICES</h4>
              <div className="text-[11px] space-y-1">
                <div>Home Cleaning</div>
                <div>Laundry & Ironing</div>
                <div>Cooking & Meal Prep</div>
                <div>Childcare & Elder Care</div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
            © 2026 Meraki Homes PLC. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
