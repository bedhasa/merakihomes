import React, { useState } from 'react';
import { MOCK_SERVICES, MOCK_WORKERS, ADDIS_NEIGHBORHOODS, MOCK_REVIEWS, ETB_EXCHANGE_RATE } from '../../data/mockServices';
import { ServiceCategory, Booking, Currency, PaymentMethodType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { 
  Sparkles, Star, Clock, MapPin, Calendar, Check, ShieldCheck, 
  ChevronRight, Phone, MessageSquare, ArrowLeft, CreditCard, 
  Plus, Minus, X, AlertCircle, ShoppingBag, Truck, UserCheck, Flame, Refrigerator, Sun, Leaf, Shirt,
  Wallet, ThumbsUp, Download, CheckCircle2, Navigation
} from 'lucide-react';

interface CustomerViewProps {
  bookings: Booking[];
  currency: Currency;
  onCreateBooking: (newBooking: Booking) => void;
  onUpdateBookingStatus: (id: string, status: Booking['status']) => void;
  presetServiceId?: string | null;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  bookings,
  currency,
  onCreateBooking,
  onUpdateBookingStatus,
  presetServiceId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(
    presetServiceId ? MOCK_SERVICES.find(s => s.id === presetServiceId) || null : null
  );
  const [activeTab, setActiveTab] = useState<'dashboard' | 'book' | 'history' | 'payments' | 'reviews' | 'tracker'>(
    presetServiceId ? 'book' : 'dashboard'
  );
  const [trackedBookingId, setTrackedBookingId] = useState<string | null>(bookings[0]?.id || null);

  // Booking Flow State
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Bole Atlas');
  const [address, setAddress] = useState<string>('House #402, near Edna Mall, Bole Atlas');
  const [selectedDate, setSelectedDate] = useState<string>('Today, 2:30 PM');
  const [selectedSlot, setSelectedSlot] = useState<string>('02:30 PM - 04:30 PM');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [cleanersCount, setCleanersCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('telebirr');
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscountUSD, setPromoDiscountUSD] = useState<number>(0);
  const [promoError, setPromoError] = useState<string>('');

  // Review submission state
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Calculate pricing
  const calculateTotalUSD = () => {
    if (!selectedCategory) return 0;
    const base = selectedCategory.basePrice * durationHours * cleanersCount;
    const addonsTotal = selectedAddons.reduce((sum, addonId) => {
      const found = selectedCategory.addons.find(a => a.id === addonId);
      return sum + (found ? found.price : 0);
    }, 0);
    const subtotal = base + addonsTotal;
    return Math.max(0, subtotal - promoDiscountUSD);
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'MERAKI10') {
      setPromoDiscountUSD(10);
      setPromoError('');
    } else if (promoCode.toUpperCase() === 'TELEBIRR15') {
      setPromoDiscountUSD(15);
      setPromoError('');
    } else {
      setPromoError('Invalid code. Try "MERAKI10" or "TELEBIRR15"');
    }
  };

  const toggleAddon = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(prev => prev.filter(id => id !== addonId));
    } else {
      setSelectedAddons(prev => [...prev, addonId]);
    }
  };

  const handleFinalizeBooking = () => {
    if (!selectedCategory) return;
    const assignedWorker = MOCK_WORKERS[0]; // Bethlehem
    const totalUSD = calculateTotalUSD();
    const totalETB = Math.round(totalUSD * ETB_EXCHANGE_RATE);

    const newBooking: Booking = {
      id: `MRK-${Math.floor(100000 + Math.random() * 900000)}`,
      serviceId: selectedCategory.id,
      serviceName: `${selectedCategory.name} (${durationHours} Hrs)`,
      customerName: 'Dr. Kebede Tadesse',
      customerPhone: '+251 91 123 4567',
      address,
      neighborhood: selectedNeighborhood,
      date: selectedDate,
      timeSlot: selectedSlot,
      durationHours,
      cleanersCount,
      addonsSelected: selectedAddons,
      totalPrice: totalUSD,
      totalPriceETB: totalETB,
      status: 'in_progress',
      paymentMethod,
      paymentStatus: 'paid',
      workerId: assignedWorker.id,
      workerName: assignedWorker.name,
      workerAvatar: assignedWorker.avatar,
      workerRating: assignedWorker.rating,
      etaMinutes: 10,
      notes,
      createdAt: new Date().toLocaleString()
    };

    onCreateBooking(newBooking);
    setTrackedBookingId(newBooking.id);
    setSelectedCategory(null);
    setActiveTab('tracker');
  };

  const activeTrackedBooking = bookings.find(b => b.id === trackedBookingId) || bookings[0];

  return (
    <div id="customer-portal" className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-24">
      
      {/* Portal Top Bar Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-golden-500 animate-pulse"></span>
            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Customer Portal</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">| Dr. Kebede Tadesse</span>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'dashboard' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('book');
                if (!selectedCategory) setSelectedCategory(MOCK_SERVICES[0]);
                setBookingStep(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'book' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              + Book Service
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'history' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Booking History ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'payments' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Payments & Wallet
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'reviews' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Reviews
            </button>
            {activeTrackedBooking && (
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-colors ${
                  activeTab === 'tracker' ? 'bg-golden-500 dark:bg-golden-400 text-slate-950 dark:text-slate-950' : 'text-golden-800 dark:text-golden-300 bg-golden-50 dark:bg-golden-950/30 border border-golden-200 dark:border-golden-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Live GPS Tracker</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Stats Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Telebirr Wallet Balance</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">4,250 ETB</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Ready for instant checkout</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-golden-50 dark:bg-golden-950/30 flex items-center justify-center border border-golden-200 dark:border-golden-700">
                  <Wallet className="w-5 h-5 text-golden-700 dark:text-golden-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Total Bookings</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{bookings.length + 17}</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">VIP Client Tier</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                  <ShoppingBag className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Favorite Pro</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Bethlehem T.</div>
                  <span className="text-[10px] text-golden-700 dark:text-golden-400 font-bold">★ 4.96 (12 visits)</span>
                </div>
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" alt="Bethlehem" className="w-10 h-10 rounded-full object-cover border border-golden-400" />
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Primary Location</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Bole Atlas</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Addis Ababa</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                  <MapPin className="w-5 h-5 text-golden-600 dark:text-golden-400" />
                </div>
              </div>
            </div>

            {/* Active Service Notification Card */}
            {activeTrackedBooking && (
              <div className="bg-golden-50 dark:bg-golden-950/30 border border-golden-300 dark:border-golden-700 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-golden-500 dark:bg-golden-400 text-slate-950 dark:text-slate-950 flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100 font-mono font-bold text-[10px] uppercase">
                        ACTIVE DISPATCH #{activeTrackedBooking.id}
                      </span>
                      <span className="text-xs text-golden-800 dark:text-golden-300 font-bold">ETA ~{activeTrackedBooking.etaMinutes || 8} Mins</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{activeTrackedBooking.serviceName}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Worker: {activeTrackedBooking.workerName} • Location: {activeTrackedBooking.address}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('tracker')}
                  className="px-6 py-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white dark:text-slate-100 font-bold text-xs rounded-xl shadow-xs shrink-0"
                >
                  View Live GPS Map & OTP
                </button>
              </div>
            )}

            {/* Quick Re-order Services */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Service Re-order</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">Select to customize visit</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_SERVICES.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedCategory(s);
                      setActiveTab('book');
                      setBookingStep(1);
                    }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-golden-400 dark:hover:border-golden-500 rounded-2xl p-5 cursor-pointer transition-all space-y-4 shadow-xs group"
                  >
                    <img src={s.image} alt={s.name} className="w-full h-36 object-cover rounded-xl group-hover:scale-102 transition-transform" />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{s.name}</h3>
                        <span className="text-xs font-bold text-golden-700 dark:text-golden-400">★ {s.rating}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{s.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(s.basePrice, currency)}</span>
                      <span className="text-xs font-bold text-golden-700 dark:text-golden-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
                        Book <ChevronRight className="w-4 h-4 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== BOOK SERVICE TAB ==================== */}
        {activeTab === 'book' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {!selectedCategory ? (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">Select a Service to Book</h1>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Choose from our background-checked professional offerings in Addis Ababa.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {MOCK_SERVICES.map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedCategory(s);
                        setBookingStep(1);
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-golden-400 dark:hover:border-golden-500 rounded-2xl p-5 cursor-pointer transition-all space-y-3 shadow-xs"
                    >
                      <img src={s.image} alt={s.name} className="w-full h-32 object-cover rounded-xl" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{s.name}</h3>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-golden-700 dark:text-golden-400 font-bold">{formatCurrency(s.basePrice, currency)}</span>
                        <span className="text-slate-500 dark:text-slate-400">★ {s.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xs">
                
                {/* Wizard Step Progress Indicator */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                  <div className="flex items-center space-x-3">
                    <img src={selectedCategory.image} alt={selectedCategory.name} className="w-12 h-12 rounded-xl object-cover border border-golden-400" />
                    <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCategory.name}</h2>
                    <span className="text-xs text-golden-700 dark:text-golden-400 font-bold">Base: {formatCurrency(selectedCategory.basePrice, currency)} / {selectedCategory.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-bold">
                    <span className={`px-3 py-1 rounded-full ${bookingStep === 1 ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>1. Details</span>
                    <span className={`px-3 py-1 rounded-full ${bookingStep === 2 ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>2. Schedule</span>
                    <span className={`px-3 py-1 rounded-full ${bookingStep === 3 ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>3. Address</span>
                    <span className={`px-3 py-1 rounded-full ${bookingStep === 4 ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>4. Payment</span>
                  </div>
                </div>

                {/* STEP 1: Addons & Duration */}
                {bookingStep === 1 && (
                  <div className="space-y-6 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Duration counter */}
                      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 space-y-3">
                        <label className="block text-slate-700 dark:text-slate-200 font-bold">Service Duration (Hours)</label>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => setDurationHours(Math.max(1, durationHours - 1))}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 flex items-center justify-center text-slate-900 dark:text-white font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-500"
                          >
                            -
                          </button>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{durationHours} Hours</span>
                          <button
                            onClick={() => setDurationHours(durationHours + 1)}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 flex items-center justify-center text-slate-900 dark:text-white font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-500"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Cleaners count */}
                      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 space-y-3">
                        <label className="block text-slate-700 dark:text-slate-200 font-bold">Number of Professionals</label>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => setCleanersCount(Math.max(1, cleanersCount - 1))}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 flex items-center justify-center text-slate-900 dark:text-white font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-500"
                          >
                            -
                          </button>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{cleanersCount} Pro</span>
                          <button
                            onClick={() => setCleanersCount(cleanersCount + 1)}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 flex items-center justify-center text-slate-900 dark:text-white font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-500"
                          >
                            +
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Addons List */}
                    <div className="space-y-3">
                      <label className="block text-slate-700 dark:text-slate-200 font-bold">Select Specialized Add-ons:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCategory.addons.map(addon => {
                          const isSelected = selectedAddons.includes(addon.id);
                          return (
                            <div
                              key={addon.id}
                              onClick={() => toggleAddon(addon.id)}
                              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-golden-50 dark:bg-golden-950/30 border-golden-400 dark:border-golden-500 text-slate-900 dark:text-slate-100 font-bold'
                                  : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
                              }`}
                            >
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{addon.name}</div>
                              </div>
                              <span className="font-bold text-golden-700 dark:text-golden-400">+{formatCurrency(addon.price, currency)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold"
                      >
                        Cancel Selection
                      </button>
                      <button
                        onClick={() => setBookingStep(2)}
                        className="px-6 py-3 bg-golden-500 hover:bg-golden-400 text-slate-950 font-bold rounded-xl shadow-xs"
                      >
                        Next: Schedule Visit →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Schedule & Time slot */}
                {bookingStep === 2 && (
                  <div className="space-y-6 text-xs">
                    <div className="space-y-3">
                      <label className="block text-slate-700 dark:text-slate-200 font-bold">Select Date:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['Today, 2:30 PM', 'Tomorrow, 9:00 AM', 'Thursday, Oct 24', 'Friday, Oct 25'].map(d => (
                          <button
                            key={d}
                            onClick={() => setSelectedDate(d)}
                            className={`p-3 rounded-xl border text-center font-bold transition-all ${
                              selectedDate === d
                                ? 'bg-golden-50 dark:bg-golden-950/30 border-golden-400 dark:border-golden-500 text-slate-900 dark:text-slate-100'
                                : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-slate-700 dark:text-slate-200 font-bold">Select Arrival Window Slot:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {['08:00 AM - 10:00 AM', '11:00 AM - 01:00 PM', '02:30 PM - 04:30 PM'].map(s => (
                          <button
                            key={s}
                            onClick={() => setSelectedSlot(s)}
                            className={`p-3 rounded-xl border text-center font-bold transition-all ${
                              selectedSlot === s
                                ? 'bg-golden-50 dark:bg-golden-950/30 border-golden-400 dark:border-golden-500 text-slate-900 dark:text-slate-100'
                                : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => setBookingStep(1)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold"
                      >
                        ← Back to Details
                      </button>
                      <button
                        onClick={() => setBookingStep(3)}
                        className="px-6 py-3 bg-golden-500 hover:bg-golden-400 text-slate-950 font-bold rounded-xl shadow-xs"
                      >
                        Next: Address & Instructions →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Address & Location in Addis */}
                {bookingStep === 3 && (
                  <div className="space-y-6 text-xs">
                    <div className="space-y-3">
                      <label className="block text-slate-700 dark:text-slate-200 font-bold">Addis Ababa Neighborhood / Zone:</label>
                      <select
                        value={selectedNeighborhood}
                        onChange={(e) => setSelectedNeighborhood(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-bold focus:border-golden-500"
                      >
                        {ADDIS_NEIGHBORHOODS.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-slate-700 dark:text-slate-200 font-bold">Specific Street & House / Apartment Address:</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House #, Building name, landmark..."
                        className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:border-golden-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-slate-700 dark:text-slate-200 font-bold">Special Instructions for Worker:</label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Gate code, key location, pets in house..."
                        className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:border-golden-500"
                      ></textarea>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => setBookingStep(2)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold"
                      >
                        ← Back to Schedule
                      </button>
                      <button
                        onClick={() => setBookingStep(4)}
                        className="px-6 py-3 bg-golden-500 hover:bg-golden-400 text-slate-950 font-bold rounded-xl shadow-xs"
                      >
                        Next: Checkout & Pay →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Checkout & Payment Selection */}
                {bookingStep === 4 && (
                  <div className="space-y-6 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Payment Method Selector */}
                      <div className="space-y-3">
                        <label className="block text-slate-700 dark:text-slate-200 font-bold">Select Payment Gateway:</label>
                        
                        <div
                          onClick={() => setPaymentMethod('telebirr')}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            paymentMethod === 'telebirr'
                              ? 'bg-golden-50 dark:bg-golden-950/30 border-golden-400 dark:border-golden-500 text-slate-950 dark:text-slate-100 font-bold'
                              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">Telebirr Instant Express</div>
                            <div className="text-[10px] text-slate-500">Auto-debit from Telebirr Wallet (4,250 ETB)</div>
                          </div>
                          <span className="px-2 py-0.5 bg-golden-500 text-slate-950 font-black text-[10px] rounded">FAST</span>
                        </div>

                        <div
                          onClick={() => setPaymentMethod('cbe_birr')}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            paymentMethod === 'cbe_birr'
                              ? 'bg-golden-50 dark:bg-golden-950/30 border-golden-400 dark:border-golden-500 text-slate-950 dark:text-slate-100 font-bold'
                              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">CBE Birr App</div>
                            <div className="text-[10px] text-slate-500">Commercial Bank of Ethiopia Direct</div>
                          </div>
                        </div>

                        <div
                          onClick={() => setPaymentMethod('chapa')}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            paymentMethod === 'chapa'
                              ? 'bg-golden-50 dark:bg-golden-950/30 border-golden-400 dark:border-golden-500 text-slate-950 dark:text-slate-100 font-bold'
                              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">Chapa Gateway (Visa / Mastercard)</div>
                            <div className="text-[10px] text-slate-500">International cards accepted</div>
                          </div>
                        </div>

                        <div
                          onClick={() => setPaymentMethod('cash')}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            paymentMethod === 'cash'
                              ? 'bg-golden-50 dark:bg-golden-950/30 border-golden-400 dark:border-golden-500 text-slate-950 dark:text-slate-100 font-bold'
                              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">Cash on Delivery</div>
                            <div className="text-[10px] text-slate-500">Pay worker upon completion</div>
                          </div>
                        </div>

                        {/* Promo code box */}
                        <div className="pt-2">
                          <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Promo Code:</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              placeholder="e.g. MERAKI10"
                              className="p-2.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl text-slate-900 dark:text-white focus:border-golden-500 flex-1"
                            />
                            <button
                              onClick={handleApplyPromo}
                              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white dark:text-slate-100 font-bold rounded-xl"
                            >
                              Apply
                            </button>
                          </div>
                          {promoError && <p className="text-red-500 dark:text-red-400 text-[10px] mt-1">{promoError}</p>}
                          {promoDiscountUSD > 0 && <p className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] mt-1">✓ Promo applied! -$10 USD discount</p>}
                        </div>

                      </div>

                      {/* Order Summary Box */}
                      <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-4">
                        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Final Order Summary</h3>
                        
                        <div className="space-y-2 text-slate-700 dark:text-slate-200">
                          <div className="flex justify-between">
                            <span>Service:</span>
                            <strong className="text-slate-900 dark:text-white">{selectedCategory.name}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration & Workers:</span>
                            <span className="text-slate-900 dark:text-white">{durationHours} hrs x {cleanersCount} pro</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Neighborhood:</span>
                            <span className="text-slate-900 dark:text-white">{selectedNeighborhood}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date & Slot:</span>
                            <span className="text-slate-900 dark:text-white">{selectedDate}</span>
                          </div>
                          {selectedAddons.length > 0 && (
                            <div className="flex justify-between text-golden-800 dark:text-golden-300 font-bold">
                              <span>Add-ons ({selectedAddons.length}):</span>
                              <span>+{selectedAddons.length} item(s)</span>
                            </div>
                          )}
                          {promoDiscountUSD > 0 && (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                              <span>Discount:</span>
                              <span>-$10 USD</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-600 space-y-1">
                          <div className="flex justify-between items-end">
                            <span className="text-slate-600 dark:text-slate-300 font-bold">Total Amount:</span>
                            <div className="text-right">
                              <div className="text-2xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(calculateTotalUSD(), currency)}
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                                (~{Math.round(calculateTotalUSD() * ETB_EXCHANGE_RATE).toLocaleString()} ETB)
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleFinalizeBooking}
                          className="w-full py-3.5 bg-golden-500 hover:bg-golden-400 text-slate-950 font-black text-sm rounded-xl shadow-xs transition-all"
                        >
                          Confirm & Pay via {paymentMethod.toUpperCase()}
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ==================== BOOKING HISTORY TAB ==================== */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Booking History</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">{bookings.length} Orders Recorded</span>
            </div>

            <div className="space-y-4">
              {bookings.map(b => (
                <div key={b.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{b.id}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          b.status === 'in_progress' ? 'bg-golden-100 dark:bg-golden-900/30 text-golden-900 dark:text-golden-300 border border-golden-200 dark:border-golden-700' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{b.serviceName}</h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(b.totalPrice, currency)}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Method: {b.paymentMethod.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Date & Slot:</span>
                      <strong className="text-slate-900 dark:text-white">{b.date}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Location:</span>
                      <strong className="text-slate-900 dark:text-white">{b.neighborhood}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Assigned Worker:</span>
                      <strong className="text-slate-900 dark:text-white">{b.workerName || 'Unassigned'}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <button className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center space-x-1 font-semibold">
                      <Download className="w-3.5 h-3.5 text-golden-600 dark:text-golden-400" />
                      <span>Download Receipt</span>
                    </button>

                    <button
                      onClick={() => {
                        setTrackedBookingId(b.id);
                        setActiveTab('tracker');
                      }}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-bold rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      View Dispatch Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== PAYMENTS & WALLET TAB ==================== */}
        {activeTab === 'payments' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payments & Local Wallet</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Telebirr Wallet Card */}
              <div className="bg-golden-500 dark:bg-golden-600 rounded-2xl p-6 text-slate-950 dark:text-slate-950 space-y-6 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold uppercase text-xs tracking-wider">Telebirr Integrated Wallet</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 dark:bg-slate-900 text-golden-300 text-[10px] font-bold">CONNECTED 🇪🇹</span>
                </div>
                <div>
                  <span className="text-xs font-semibold opacity-90">Current Balance</span>
                  <div className="text-4xl font-black mt-1">4,250 ETB</div>
                  <span className="text-xs opacity-80">(~$35.40 USD)</span>
                </div>
                <button className="w-full py-3 bg-slate-950 dark:bg-slate-900 hover:bg-slate-900 dark:hover:bg-slate-800 text-white font-bold rounded-xl text-xs">
                  + Top Up Balance via Telebirr
                </button>
              </div>

              {/* CBE Birr & Card Gateways */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-xs">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Linked Local Gateways</h3>
                
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-between">
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Commercial Bank of Ethiopia (CBE Birr)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Active</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-between">
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Chapa Payment Gateway</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Active</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-between">
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Visa ending in **** 8492</span>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Primary</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== REVIEWS TAB ==================== */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rate & Review Your Professionals</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">Share your feedback to help maintain quality standards in Addis Ababa.</p>
              </div>
            </div>

            {/* Leave a review box */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Write a Review for Bethlehem T.</h3>
              
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setNewReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${star <= newReviewRating ? 'fill-golden-400 text-golden-400' : 'text-slate-300 dark:text-slate-600'}`} />
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Share details about the cleanliness and worker professionalism..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white focus:border-golden-500"
              ></textarea>

              {reviewSubmitted ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                  ✓ Thank you! Your review has been submitted.
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (newReviewComment.trim()) setReviewSubmitted(true);
                  }}
                  className="px-6 py-2.5 bg-golden-500 hover:bg-golden-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
                >
                  Submit Verified Review
                </button>
              )}
            </div>

            {/* Recent Reviews catalog */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Community Reviews</h3>
              {MOCK_REVIEWS.map(rev => (
                <div key={rev.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 fill-golden-400 text-golden-400" />
                      <span className="font-bold text-golden-700 dark:text-golden-400 text-xs">{rev.rating}.0</span>
                      <span className="text-xs text-slate-900 dark:text-white font-bold">{rev.serviceName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{rev.date}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">"{rev.comment}"</p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Customer: {rev.customerName} • {rev.neighborhood}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== LIVE GPS DISPATCH TRACKER TAB ==================== */}
        {activeTab === 'tracker' && activeTrackedBooking && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-golden-700 dark:text-golden-400 font-mono font-bold uppercase">LIVE DISPATCH RADAR</span>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Tracking Order #{activeTrackedBooking.id}</h1>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 text-xs font-mono font-bold">
                PRO EN ROUTE (ETA ~8 MINS)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Simulated Map View */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden relative min-h-[380px] flex flex-col justify-between p-6 shadow-xs">
                <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[radial-gradient(#d97706_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>

                {/* Simulated Street overlay */}
                <div className="relative z-10 flex justify-between items-start">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 shadow-xs">
                    <strong>Zone:</strong> Bole Atlas Road, Addis Ababa
                  </div>

                  <div className="bg-golden-100 dark:bg-golden-900/30 text-golden-900 dark:text-golden-300 border border-golden-300 dark:border-golden-700 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
                    Live GPS Signal Active
                  </div>
                </div>

                {/* Simulated Worker Pin */}
                <div className="relative z-10 my-auto text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-golden-100 dark:bg-golden-900/30 border-2 border-golden-500 dark:border-golden-400 mx-auto flex items-center justify-center animate-ping">
                    <Navigation className="w-8 h-8 text-golden-600 dark:text-golden-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Bethlehem T. is 1.2 km away</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Heading towards {activeTrackedBooking.address}</div>
                </div>

                {/* Bottom Bar: Security OTP */}
                <div className="relative z-10 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 p-4 rounded-xl border border-slate-800 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Arrival Verification Code:</span>
                    <span className="text-2xl font-mono font-black text-golden-400 tracking-widest">8492</span>
                  </div>
                  <p className="text-[11px] text-slate-300 dark:text-slate-400 max-w-xs text-right">Provide this 4-digit OTP code to Bethlehem upon arrival to start stopwatch.</p>
                </div>

              </div>

              {/* Worker Profile & Details */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-xs">
                <div className="text-center space-y-2 border-b border-slate-100 dark:border-slate-700 pb-5">
                  <img src={activeTrackedBooking.workerAvatar} alt="Worker" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-golden-400" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeTrackedBooking.workerName}</h3>
                    <div className="text-xs text-golden-700 dark:text-golden-400 font-bold">Certified Specialist • ★ {activeTrackedBooking.workerRating}</div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">✓ Police Record Verified</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full py-3 bg-golden-500 hover:bg-golden-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-xs">
                    <Phone className="w-4 h-4" />
                    <span>Call Worker (+251 91 123 4567)</span>
                  </button>

                  <button className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-600">
                    <MessageSquare className="w-4 h-4 text-golden-600 dark:text-golden-400" />
                    <span>Send In-App Message</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-xs space-y-1.5">
                  <strong className="text-slate-900 dark:text-white block">Job Specifications:</strong>
                  <div className="text-slate-600 dark:text-slate-300">Duration: {activeTrackedBooking.durationHours} Hours</div>
                  <div className="text-slate-600 dark:text-slate-300">Total: {formatCurrency(activeTrackedBooking.totalPrice, currency)}</div>
                  <div className="text-slate-600 dark:text-slate-300">Payment: {activeTrackedBooking.paymentMethod.toUpperCase()}</div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
};
