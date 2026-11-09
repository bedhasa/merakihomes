import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, ProviderItem } from '../types';
import { PROVIDERS, NEIGHBORHOODS } from '../data/mockData';
import confetti from 'canvas-confetti';
import {
  X,
  Check,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone
} from 'lucide-react';

export const BookingModal: React.FC = () => {
  const {
    activeBookingModal,
    closeBookingModal,
    language,
    t,
    addBooking,
    setActiveTab
  } = useApp();

  const service = activeBookingModal?.service;
  const initialProvider = activeBookingModal?.provider || (service ? PROVIDERS.find(p => p.category === service.category) : PROVIDERS[0]) || PROVIDERS[0];

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem>(initialProvider);
  const [selectedDate, setSelectedDate] = useState('Today (Oct 27)');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Morning (09:30 - 13:00)');
  const [selectedZone, setSelectedZone] = useState('Bole');
  const [addressInput, setAddressInput] = useState('Bole Atlas, Behind Edna Mall, Apt 402');
  const [compoundNotes, setCompoundNotes] = useState('Green gate, notify security at entrance');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [telebirrPhone, setTelebirrPhone] = useState('+251 91 142 8890');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  if (!service) return null;

  const serviceFee = service.priceETB;
  const transportFee = 100;
  const totalETB = serviceFee + transportFee;

  const dates = [
    { label: 'Today', date: 'Oct 27', amharic: 'ዛሬ' },
    { label: 'Tomorrow', date: 'Oct 28', amharic: 'ነገ' },
    { label: 'Wednesday', date: 'Oct 29', amharic: 'ረቡዕ' },
    { label: 'Thursday', date: 'Oct 30', amharic: 'ሐሙስ' },
  ];

  const timeSlots = [
    { slot: 'Morning (09:00 - 12:30)', amharic: 'ጥዋት (03:00 - 06:30)' },
    { slot: 'Afternoon (13:30 - 16:30)', amharic: 'ከሰዓት (07:30 - 10:30)' },
    { slot: 'Evening (17:00 - 19:30)', amharic: 'ምሽት (11:00 - 01:30)' },
  ];

  const handleConfirm = () => {
    const id = addBooking({
      serviceId: service.id,
      serviceTitle: service.title,
      amharicServiceTitle: service.amharicTitle,
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      amharicProviderName: selectedProvider.amharicName,
      providerAvatar: selectedProvider.avatarUrl,
      providerPhone: '+251 91 234 5678',
      status: 'confirmed',
      date: `${selectedDate}, ${selectedTimeSlot.split(' ')[0]}`,
      timeSlot: selectedTimeSlot,
      address: `${addressInput}, ${selectedZone}`,
      neighborhood: selectedZone,
      amharicNeighborhood: NEIGHBORHOODS.find(n => n.id === selectedZone)?.amharic || selectedZone,
      compoundNotes,
      paymentMethod,
      paymentPhone: paymentMethod === 'telebirr' ? telebirrPhone : undefined,
      totalPriceETB: totalETB,
      serviceFeeETB: serviceFee,
      transportFeeETB: transportFee,
    });

    setConfirmedBookingId(id);
    setStep(5);

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#102A43', '#D4A853', '#0072CE']
      });
    } catch (e) {
      // safe fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-level-3 border border-[#D9E0E7]">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-[#D9E0E7] flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4A853]" />
            <span className="text-xs font-bold text-[#102A43] tracking-wide uppercase">
              {step === 5
                ? (language === 'am' ? 'ቀጠሮው ተረጋግጧል' : 'Booking Confirmed')
                : (language === 'am' ? `ደረጃ ${step} ከ 4` : `Step ${step} of 4`)}
            </span>
          </div>

          <button
            onClick={closeBookingModal}
            className="w-8 h-8 rounded-full bg-white border border-[#D9E0E7] flex items-center justify-center text-[#74777E] hover:text-[#102A43] hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4 flex-1">
          {/* STEP 1: Service Confirmation & Specialist Assignment */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 bg-[#F7F8FA] p-3.5 rounded-2xl border border-[#D9E0E7]">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#102A43]">
                    {language === 'am' ? service.amharicTitle : service.title}
                  </h3>
                  <p className="text-xs text-[#43474D] mt-0.5">
                    {language === 'am' ? service.amharicDuration : service.duration}
                  </p>
                  <p className="text-sm font-bold text-[#102A43] mt-1">
                    {service.priceETB.toLocaleString()} ETB
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#102A43] block mb-2">
                  {language === 'am' ? 'የተመደበው የታመነ ባለሙያ' : 'Assigned Highland Specialist'}
                </label>
                <div className="p-3 bg-white rounded-2xl border border-[#D4A853] shadow-level-1 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedProvider.avatarUrl}
                      alt={selectedProvider.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43]">
                        {language === 'am' ? selectedProvider.amharicName : selectedProvider.name}
                      </h4>
                      <p className="text-[11px] text-[#74777E]">
                        {language === 'am' ? selectedProvider.amharicSpecialty : selectedProvider.specialty}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                        ★ {selectedProvider.rating} ({selectedProvider.completedJobs} {t.completedJobs})
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-[#7B5804] bg-[#D4A853]/20 px-2 py-1 rounded-lg">
                    {language === 'am' ? 'የቀበሌ ማረጋገጫ ያለው' : 'Kebele Vetted'}
                  </span>
                </div>
              </div>

              {/* What's Included Summary */}
              <div className="p-3 bg-[#FAF6EC] rounded-2xl border border-[#E7D6AC]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B5804] block mb-1.5">
                  {language === 'am' ? 'የሚካተቱ አገልግሎቶች' : 'Standard Inclusions'}
                </span>
                <div className="space-y-1">
                  {(language === 'am' ? service.amharicIncluded : service.included).slice(0, 3).map((inc, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-[#334155]">
                      <Check size={11} className="text-[#D4A853] stroke-[3]" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Local Time Slot Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#102A43] block mb-2">
                  {language === 'am' ? 'ቀን ይምረጡ' : 'Select Service Date'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dates.map((d) => {
                    const isSelected = selectedDate.includes(d.date);
                    return (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDate(`${d.label} (${d.date})`)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#102A43] text-white border-[#D4A853] shadow-level-1'
                            : 'bg-[#F7F8FA] text-[#334155] border-[#D9E0E7] hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold block">
                          {language === 'am' ? d.amharic : d.label}
                        </span>
                        <span className={`text-[11px] ${isSelected ? 'text-[#D4A853]' : 'text-slate-500'}`}>
                          {d.date}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#102A43] block mb-2">
                  {language === 'am' ? 'ሰዓት ይምረጡ (የአዲስ አበባ ሰዓት)' : 'Select Arrival Window (Addis Time)'}
                </label>
                <div className="space-y-2">
                  {timeSlots.map((ts) => {
                    const isSelected = selectedTimeSlot === ts.slot;
                    return (
                      <button
                        key={ts.slot}
                        onClick={() => setSelectedTimeSlot(ts.slot)}
                        className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#102A43] text-white border-[#D4A853] shadow-level-1'
                            : 'bg-[#F7F8FA] text-[#334155] border-[#D9E0E7] hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock size={14} className={isSelected ? 'text-[#D4A853]' : 'text-slate-400'} />
                          <span className="text-xs font-semibold">
                            {language === 'am' ? ts.amharic : ts.slot}
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#D4A853] bg-[#D4A853]' : 'border-slate-300'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#102A43]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Addis Ababa Address & Compound Gate Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#102A43] block mb-2">
                  {language === 'am' ? 'የአዲስ አበባ ሰፈር' : 'Neighborhood Zone'}
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#F7F8FA] border border-[#D9E0E7] text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#D4A853]"
                >
                  {NEIGHBORHOODS.filter(n => n.id !== 'All').map((n) => (
                    <option key={n.id} value={n.id}>
                      {language === 'am' ? n.amharic : n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#102A43] block mb-1">
                  {language === 'am' ? 'የመንገድ እና የህንፃ ዝርዝር አድራሻ' : 'Street & Residence Address'}
                </label>
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="e.g. Bole Atlas, Behind Edna Mall, Apt 402"
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#F7F8FA] border border-[#D9E0E7] text-xs text-[#191c1e] focus:outline-none focus:border-[#D4A853]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#102A43] block mb-1">
                  {language === 'am' ? 'የግቢው በር እና የጥበቃ መመሪያዎች' : 'Compound & Security Instructions'}
                </label>
                <textarea
                  value={compoundNotes}
                  onChange={(e) => setCompoundNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Green sliding gate, security guard notified, 3rd floor"
                  className="w-full p-3 rounded-2xl bg-[#F7F8FA] border border-[#D9E0E7] text-xs text-[#191c1e] focus:outline-none focus:border-[#D4A853]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Ethiopian Payment Method Selection */}
          {step === 4 && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-[#102A43] block mb-1">
                {language === 'am' ? 'የመክፈያ ዘዴ ይምረጡ' : 'Select Domestic Ethiopian Payment'}
              </label>

              {/* Telebirr Card */}
              <div
                onClick={() => setPaymentMethod('telebirr')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'telebirr'
                    ? 'border-[#0072CE] bg-[#0072CE]/5 ring-1 ring-[#0072CE]'
                    : 'border-[#D9E0E7] bg-[#F7F8FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0072CE] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    telebirr
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102A43]">
                      Telebirr Mobile Payment
                    </h4>
                    <p className="text-[11px] text-[#43474D]">
                      Direct deduction from your Telebirr account
                    </p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border-2 border-[#0072CE] flex items-center justify-center">
                  {paymentMethod === 'telebirr' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0072CE]" />
                  )}
                </div>
              </div>

              {paymentMethod === 'telebirr' && (
                <div className="p-3 bg-[#0072CE]/5 rounded-2xl border border-[#0072CE]/30 space-y-1">
                  <label className="text-[11px] font-bold text-[#0072CE] block">
                    {language === 'am' ? 'የተመዘገበ የቴሌብር ስልክ ቁጥር' : 'Registered Telebirr Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={telebirrPhone}
                    onChange={(e) => setTelebirrPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-[#D9E0E7] text-xs font-mono text-[#102A43]"
                  />
                </div>
              )}

              {/* CBE Birr Card */}
              <div
                onClick={() => setPaymentMethod('cbe')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'cbe'
                    ? 'border-[#5C068C] bg-[#5C068C]/5 ring-1 ring-[#5C068C]'
                    : 'border-[#D9E0E7] bg-[#F7F8FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5C068C] text-[#C5A059] flex items-center justify-center font-bold text-xs shadow-sm">
                    CBE
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102A43]">
                      Commercial Bank of Ethiopia (CBE Birr)
                    </h4>
                    <p className="text-[11px] text-[#43474D]">
                      Instant account transfer or CBE Birr USSD
                    </p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border-2 border-[#5C068C] flex items-center justify-center">
                  {paymentMethod === 'cbe' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#5C068C]" />
                  )}
                </div>
              </div>

              {/* Cash on Completion */}
              <div
                onClick={() => setPaymentMethod('cash')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'cash'
                    ? 'border-[#102A43] bg-slate-100 ring-1 ring-[#102A43]'
                    : 'border-[#D9E0E7] bg-[#F7F8FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#102A43] text-[#D4A853] flex items-center justify-center font-bold text-xs shadow-sm">
                    ETB
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102A43]">
                      {language === 'am' ? 'በጥሬ ገንዘብ በቦታው' : 'Cash upon Completion'}
                    </h4>
                    <p className="text-[11px] text-[#43474D]">
                      Pay the specialist directly after inspection
                    </p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border-2 border-[#102A43] flex items-center justify-center">
                  {paymentMethod === 'cash' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#102A43]" />
                  )}
                </div>
              </div>

              {/* Order Summary Pricing Box */}
              <div className="p-3 bg-[#F7F8FA] rounded-2xl border border-[#D9E0E7] text-xs space-y-1.5">
                <div className="flex justify-between text-[#43474D]">
                  <span>{t.serviceFee}</span>
                  <span>{serviceFee.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-[#43474D]">
                  <span>{t.transportFee}</span>
                  <span>{transportFee} ETB</span>
                </div>
                <div className="pt-2 border-t border-[#D9E0E7] flex justify-between font-bold text-[#102A43] text-sm">
                  <span>{t.totalPayable}</span>
                  <span className="text-[#102A43]">{totalETB.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Success & Confirmed View */}
          {step === 5 && (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-level-1">
                <CheckCircle2 size={36} className="stroke-[2.5]" />
              </div>

              <h3 className="text-lg font-bold text-[#102A43]">
                {t.bookingSuccess}
              </h3>
              <p className="text-xs text-[#43474D] max-w-xs mx-auto">
                {t.bookingSuccessDesc}
              </p>

              <div className="p-3.5 bg-[#FAF6EC] rounded-2xl border border-[#E7D6AC] max-w-sm mx-auto text-left text-xs space-y-1">
                <div className="flex justify-between font-mono font-bold text-[#102A43]">
                  <span>Tracking ID:</span>
                  <span className="text-[#0072CE]">{confirmedBookingId}</span>
                </div>
                <div className="flex justify-between text-[#43474D]">
                  <span>Specialist:</span>
                  <span className="font-semibold text-[#102A43]">{selectedProvider.name}</span>
                </div>
                <div className="flex justify-between text-[#43474D]">
                  <span>Slot:</span>
                  <span>{selectedDate}, {selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between text-[#43474D]">
                  <span>Total:</span>
                  <span className="font-bold text-[#102A43]">{totalETB.toLocaleString()} ETB</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    closeBookingModal();
                    setActiveTab('bookings');
                  }}
                  className="w-full bg-[#102A43] text-white text-xs font-bold py-3 rounded-2xl hover:bg-[#193a59] transition-colors"
                >
                  {language === 'am' ? 'ቀጠሮዬን ይከታተሉ' : 'View in Bookings Tab'}
                </button>
                <button
                  onClick={closeBookingModal}
                  className="w-full bg-white border border-[#D9E0E7] text-[#334155] text-xs font-semibold py-2.5 rounded-2xl hover:bg-[#F2F4F6] transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls (for Steps 1 to 4) */}
        {step < 5 && (
          <div className="p-4 border-t border-[#D9E0E7] bg-white flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-4 py-2.5 rounded-2xl border border-[#D9E0E7] text-xs font-bold text-[#334155] flex items-center gap-1.5 hover:bg-[#F2F4F6]"
              >
                <ArrowLeft size={14} />
                <span>{t.back}</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep((prev) => (prev + 1) as any)}
                className="bg-[#D4A853] text-[#102A43] text-xs font-bold px-6 py-2.5 rounded-2xl hover:bg-[#e0b764] transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <span>{t.next}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                className="bg-[#D4A853] text-[#102A43] text-xs font-bold px-6 py-2.5 rounded-2xl hover:bg-[#e0b764] transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <ShieldCheck size={14} />
                <span>{t.confirmBooking} {paymentMethod.toUpperCase()}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
