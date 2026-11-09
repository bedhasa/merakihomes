import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookingStatus, BookingOrder } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  FileText,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const BookingsTab: React.FC = () => {
  const {
    language,
    t,
    bookings,
    updateBookingStatus,
    openChatModal,
    openReceiptModal,
    openBookingModal,
    setActiveTab
  } = useApp();

  const [bookingFilter, setBookingFilter] = useState<'active' | 'history'>('active');

  const activeBookings = bookings.filter(b => b.status !== 'completed');
  const pastBookings = bookings.filter(b => b.status === 'completed');

  const currentList = bookingFilter === 'active' ? activeBookings : pastBookings;

  const statusSteps: { key: BookingStatus; label: string; amharic: string }[] = [
    { key: 'confirmed', label: 'Confirmed', amharic: 'ተረጋግጧል' },
    { key: 'dispatched', label: 'Dispatched', amharic: 'መንገድ ላይ' },
    { key: 'arrived', label: 'Arrived', amharic: 'ደርሷል' },
    { key: 'in_progress', label: 'In Progress', amharic: 'በመስራት ላይ' },
    { key: 'completed', label: 'Completed', amharic: 'ተጠናቋል' },
  ];

  const getStepIndex = (status: BookingStatus) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  const handleNextStep = (booking: BookingOrder) => {
    const currentIndex = getStepIndex(booking.status);
    if (currentIndex < statusSteps.length - 1) {
      const nextStatus = statusSteps[currentIndex + 1].key;
      updateBookingStatus(booking.id, nextStatus);
    }
  };

  return (
    <div className="pb-24 pt-3 space-y-4 px-5">
      {/* Top Segmented Control */}
      <div className="flex bg-[#EDEFE0]/60 p-1 rounded-2xl border border-[#D9E0E7]">
        <button
          onClick={() => setBookingFilter('active')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            bookingFilter === 'active'
              ? 'bg-[#102A43] text-white shadow-level-1'
              : 'text-[#43474D] hover:text-[#102A43]'
          }`}
        >
          {language === 'am' ? 'በሂደት ላይ ያሉ' : 'Active Services'} ({activeBookings.length})
        </button>
        <button
          onClick={() => setBookingFilter('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            bookingFilter === 'history'
              ? 'bg-[#102A43] text-white shadow-level-1'
              : 'text-[#43474D] hover:text-[#102A43]'
          }`}
        >
          {language === 'am' ? 'የተጠናቀቁ' : 'Past History'} ({pastBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {currentList.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-[#D9E0E7] text-center shadow-level-1">
          <div className="w-14 h-14 rounded-2xl bg-[#F7F8FA] flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Calendar size={28} />
          </div>
          <h3 className="text-sm font-bold text-[#102A43]">
            {bookingFilter === 'active'
              ? (language === 'am' ? 'ምንም ንቁ ቀጠሮ የለም' : 'No active appointments')
              : (language === 'am' ? 'ምንም ያለፈ አገልግሎት የለም' : 'No past appointments')
            }
          </h3>
          <p className="text-xs text-[#74777E] mt-1 max-w-xs mx-auto">
            {language === 'am'
              ? 'ለቤትዎ የሚፈልጉትን አገልግሎት በመምረጥ በቀላሉ ቀጠሮ ይያዙ።'
              : 'Schedule a vetted professional for deep cleaning, buna ceremony, or home maintenance.'}
          </p>
          <button
            onClick={() => setActiveTab('services')}
            className="mt-4 bg-[#D4A853] text-[#102A43] text-xs font-bold px-4 py-2 rounded-2xl hover:bg-[#e0b764] transition-colors"
          >
            {language === 'am' ? 'አገልግሎት ይምረጡ' : 'Browse Services'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((booking) => {
            const stepIdx = getStepIndex(booking.status);
            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl p-4 border border-[#D9E0E7] shadow-level-1 transition-all"
              >
                {/* Header Row: ID & Status Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-[#D9E0E7]/60">
                  <div>
                    <span className="text-[10px] font-bold text-[#74777E] uppercase tracking-wider block">
                      {booking.id}
                    </span>
                    <h3 className="text-sm font-bold text-[#102A43]">
                      {language === 'am' ? booking.amharicServiceTitle : booking.serviceTitle}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      booking.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-[#D4A853]/20 text-[#7B5804] border-[#D4A853]/40'
                    }`}
                  >
                    {language === 'am'
                      ? statusSteps.find(s => s.key === booking.status)?.amharic
                      : statusSteps.find(s => s.key === booking.status)?.label}
                  </span>
                </div>

                {/* Status Stepper Progress (for active bookings) */}
                {booking.status !== 'completed' && (
                  <div className="my-3.5 bg-[#F7F8FA] p-3 rounded-2xl border border-[#D9E0E7]/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#74777E] uppercase tracking-wider">
                        {language === 'am' ? 'የአገልግሎቱ ሂደት' : 'Live Progress Tracker'}
                      </span>
                      <button
                        onClick={() => handleNextStep(booking)}
                        className="text-[10px] font-bold text-[#0072CE] hover:underline flex items-center gap-1"
                        title="Simulate Next Status for Demo"
                      >
                        <RefreshCw size={10} />
                        <span>{language === 'am' ? 'ቀጣዩን ደረጃ አሳይ' : 'Simulate Next Step'}</span>
                      </button>
                    </div>

                    {/* Stepper Dots & Line */}
                    <div className="relative flex items-center justify-between px-1 mt-1">
                      <div className="absolute left-2 right-2 top-2.5 h-0.5 bg-[#D9E0E7] z-0" />
                      <div
                        className="absolute left-2 top-2.5 h-0.5 bg-[#D4A853] z-0 transition-all duration-300"
                        style={{ width: `${(stepIdx / (statusSteps.length - 1)) * 95}%` }}
                      />

                      {statusSteps.map((step, idx) => {
                        const isDone = idx <= stepIdx;
                        const isCurrent = idx === stepIdx;
                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                isCurrent
                                  ? 'bg-[#102A43] text-[#D4A853] ring-4 ring-[#D4A853]/30 scale-110'
                                  : isDone
                                  ? 'bg-[#D4A853] text-[#102A43]'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[9px] mt-1 font-semibold whitespace-nowrap ${
                                isCurrent ? 'text-[#102A43] font-bold' : 'text-slate-400'
                              }`}
                            >
                              {language === 'am' ? step.amharic : step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Assigned Specialist Details */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.providerAvatar}
                      alt={booking.providerName}
                      className="w-11 h-11 rounded-2xl object-cover border border-[#D9E0E7]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43]">
                        {language === 'am' ? booking.amharicProviderName : booking.providerName}
                      </h4>
                      <p className="text-[11px] text-[#74777E] flex items-center gap-1">
                        <MapPin size={11} className="text-[#D4A853]" />
                        <span>{language === 'am' ? booking.amharicNeighborhood : booking.neighborhood}</span>
                      </p>
                    </div>
                  </div>

                  {/* Provider Communication Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openChatModal(booking)}
                      className="w-9 h-9 rounded-xl bg-[#F7F8FA] border border-[#D9E0E7] flex items-center justify-center text-[#102A43] hover:bg-[#EDEEF0] transition-colors"
                      title={t.chatProvider}
                    >
                      <MessageSquare size={16} />
                    </button>
                    <a
                      href={`tel:${booking.providerPhone}`}
                      className="w-9 h-9 rounded-xl bg-[#102A43] text-white flex items-center justify-center hover:bg-[#1b3a5a] transition-colors"
                      title={t.callProvider}
                    >
                      <Phone size={15} />
                    </a>
                  </div>
                </div>

                {/* Date & Compound Details */}
                <div className="py-2.5 border-t border-[#D9E0E7]/60 text-xs text-[#334155] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={12} className="text-[#D4A853]" />
                      <span>{booking.date}</span>
                    </span>
                    <span className="font-semibold text-[#102A43]">
                      {booking.totalPriceETB.toLocaleString()} ETB
                    </span>
                  </div>

                  <p className="text-[11px] text-[#43474D]">
                    📍 {booking.address}
                  </p>
                  {booking.compoundNotes && (
                    <p className="text-[10px] text-slate-500 italic">
                      Note: {booking.compoundNotes}
                    </p>
                  )}
                </div>

                {/* Footer: Payment method badge & Receipt action */}
                <div className="pt-2.5 border-t border-[#D9E0E7]/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {booking.paymentMethod === 'telebirr' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#0072CE]/10 text-[#0072CE] px-2 py-0.5 rounded-full border border-[#0072CE]/30">
                        <CreditCard size={11} />
                        Telebirr ({booking.paymentPhone || '+251 9...'})
                      </span>
                    )}
                    {booking.paymentMethod === 'cbe' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#5C068C]/10 text-[#5C068C] px-2 py-0.5 rounded-full border border-[#5C068C]/30">
                        <CreditCard size={11} />
                        CBE Birr
                      </span>
                    )}
                    {booking.paymentMethod === 'cash' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-[#334155] px-2 py-0.5 rounded-full border border-slate-200">
                        Cash on Arrival
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openReceiptModal(booking)}
                    className="text-xs font-semibold text-[#102A43] hover:text-[#7B5804] flex items-center gap-1 underline"
                  >
                    <FileText size={12} />
                    <span>{t.viewReceipt}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
