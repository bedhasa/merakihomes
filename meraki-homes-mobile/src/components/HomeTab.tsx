import React from 'react';
import { useApp } from '../context/AppContext';
import { NEIGHBORHOODS, SERVICES, PROVIDERS } from '../data/mockData';
import {
  ShieldCheck,
  Star,
  MapPin,
  Sparkles,
  Coffee,
  Clock,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Calendar,
  Award,
  Zap
} from 'lucide-react';

export const HomeTab: React.FC = () => {
  const {
    language,
    t,
    selectedNeighborhood,
    setSelectedNeighborhood,
    openBookingModal,
    openProviderModal,
    setActiveTab,
    setSelectedCategory,
    bookings,
    searchQuery
  } = useApp();

  // Filtered providers based on neighborhood and search query
  const filteredProviders = PROVIDERS.filter(p => {
    const matchesZone = selectedNeighborhood === 'All' || p.neighborhood === selectedNeighborhood;
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  // Filtered services
  const filteredServices = SERVICES.filter(s => {
    return !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Active in-progress booking (if any)
  const activeBooking = bookings.find(b => b.status !== 'completed');

  return (
    <div className="pb-24 pt-3 space-y-5 px-5">
      {/* Active Service Banner (if any live booking) */}
      {activeBooking && (
        <div
          onClick={() => setActiveTab('bookings')}
          className="bg-[#102A43] text-white p-4 rounded-3xl shadow-level-2 border border-[#D4A853]/40 cursor-pointer transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#D4A853]">
              <span className="w-2 h-2 rounded-full bg-[#D4A853] animate-ping" />
              {t.activeBooking}
            </span>
            <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
              {activeBooking.id}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activeBooking.providerAvatar}
                alt={activeBooking.providerName}
                className="w-11 h-11 rounded-2xl object-cover border border-[#D4A853]"
              />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {language === 'am' ? activeBooking.amharicServiceTitle : activeBooking.serviceTitle}
                </h4>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <span>{language === 'am' ? activeBooking.amharicProviderName : activeBooking.providerName}</span>
                  <span>•</span>
                  <span className="text-[#D4A853] font-medium">
                    {activeBooking.status === 'in_progress' ? t.stepperInProgress : t.stepperDispatched}
                  </span>
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#D4A853] flex items-center justify-center text-[#102A43] font-bold">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      )}

      {/* Warm Highland Hospitality Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#102A43] via-[#163350] to-[#0A1A2A] text-white p-5 shadow-level-2 border border-[#D4A853]/30">
        {/* Subtle decorative gold warm glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 rounded-full bg-[#D4A853]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#D4A853]/20 border border-[#D4A853]/40 px-3 py-1 rounded-full text-xs font-semibold text-[#D4A853] mb-3">
            <Sparkles size={13} />
            <span>{language === 'am' ? 'የደጋው ሞቅ ያለ መስተንግዶ' : 'Warm Highland Hospitality'}</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
            {t.greetingSalam}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-[280px] leading-relaxed">
            {t.greetingSub}
          </p>

          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D4A853]/20 flex items-center justify-center text-[#D4A853]">
                <ShieldCheck size={16} />
              </div>
              <span className="text-[11px] text-slate-200 font-medium">
                {language === 'am' ? '100% በቀበሌ የተረጋገጡ' : '100% Kebele & Police Vetted'}
              </span>
            </div>

            <button
              onClick={() => {
                const bunaService = SERVICES.find(s => s.category === 'buna');
                openBookingModal(bunaService);
              }}
              className="bg-[#D4A853] text-[#102A43] text-xs font-bold px-3.5 py-2 rounded-2xl hover:bg-[#e0b764] transition-all active:scale-95 shadow-sm"
            >
              {language === 'am' ? 'ቡና እዘዝ' : 'Book Buna'}
            </button>
          </div>
        </div>
      </div>

      {/* Neighborhood Selector Chips */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-[#102A43]">
            {language === 'am' ? 'የአዲስ አበባ ሰፈሮች' : 'Neighborhood Zones'}
          </h3>
          <span className="text-[11px] text-[#74777E] font-medium">
            {language === 'am' ? 'ፈጣን አገልግሎት' : 'Fast Arrival'}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
          {NEIGHBORHOODS.map((zone) => {
            const isSelected = selectedNeighborhood === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => setSelectedNeighborhood(zone.id)}
                className={`whitespace-nowrap px-4 py-2 min-h-[38px] rounded-full text-xs font-semibold transition-all duration-200 border touch-manipulation active:scale-95 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#102A43] text-white border-[#D4A853] shadow-level-1'
                    : 'bg-white text-[#334155] border-[#D9E0E7] hover:border-[#D4A853]/50'
                }`}
              >
                {zone.id !== 'All' && (
                  <MapPin size={12} className={isSelected ? 'text-[#D4A853]' : 'text-slate-400'} />
                )}
                <span>{language === 'am' ? zone.amharic : zone.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Home Services Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#102A43]">
            {t.popularCategories}
          </h3>
          <button
            onClick={() => setActiveTab('services')}
            className="text-xs font-semibold text-[#7B5804] hover:text-[#102A43] flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredServices.slice(0, 4).map((service) => (
            <div
              key={service.id}
              onClick={() => openBookingModal(service)}
              className="bg-white rounded-3xl p-3 border border-[#D9E0E7] shadow-level-1 hover:border-[#D4A853]/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-2.5 bg-slate-100">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {service.popular && (
                    <span className="absolute top-2 left-2 bg-[#102A43] text-[#D4A853] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#D4A853]/40 shadow-sm">
                      {language === 'am' ? 'ተመራጭ' : 'POPULAR'}
                    </span>
                  )}
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5 text-[10px] font-bold text-[#102A43]">
                    <Star size={10} className="fill-[#D4A853] text-[#D4A853]" />
                    <span>{service.rating}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-[#102A43] line-clamp-1 leading-snug">
                  {language === 'am' ? service.amharicTitle : service.title}
                </h4>
                <p className="text-[11px] text-[#43474D] mt-0.5 line-clamp-1">
                  {language === 'am' ? service.amharicDuration : service.duration}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#D9E0E7]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#74777E] block leading-none">
                    {language === 'am' ? 'ዋጋ' : 'Rate'}
                  </span>
                  <span className="text-xs font-bold text-[#102A43]">
                    {service.priceETB.toLocaleString()} ETB
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openBookingModal(service);
                  }}
                  className="w-7 h-7 rounded-xl bg-[#D4A853] text-[#102A43] flex items-center justify-center font-bold hover:bg-[#e0b764] transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Highland Spotlight: Buna Ceremony & Hospitality */}
      <div className="bg-[#FAF6EC] rounded-3xl p-4 border border-[#E7D6AC] shadow-level-1 relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-[#D4A853]/50 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80"
              alt="Buna Jebena"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#7B5804] uppercase tracking-wider mb-0.5">
              <Coffee size={12} />
              <span>{language === 'am' ? 'የኢትዮጵያ ባህላዊ ቡና' : 'Highland Buna Specialty'}</span>
            </div>
            <h4 className="text-sm font-bold text-[#102A43]">
              {language === 'am' ? 'ትኩስ የጀበና ቡና እና የእጣን መስተንግዶ' : 'Authentic Clay Jebena & Roasting'}
            </h4>
            <p className="text-xs text-[#43474D] mt-1 leading-relaxed">
              {language === 'am'
                ? 'ሲዳማ ቡና፣ ትኩስ ፈንዲሻ፣ ቀጤማ እና የተረጋጋ የእንግዳ ክብር።'
                : 'Sidama green beans roasted on charcoal, freshly brewed Jebena, fendisha, and ceremonial grass.'}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-[#102A43]">
                850 ETB <span className="text-[10px] text-[#74777E] font-normal">{language === 'am' ? '/ ስነ-ስርዓት' : '/ ceremony'}</span>
              </span>
              <button
                onClick={() => {
                  const buna = SERVICES.find(s => s.category === 'buna');
                  openBookingModal(buna);
                }}
                className="bg-[#102A43] text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-[#1a3858] transition-colors"
              >
                {t.bookNow}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vetted Providers Nearby Carousel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#102A43]">
              {t.vettedNearby}
            </h3>
            <p className="text-[11px] text-[#74777E]">
              {language === 'am' ? 'በቀበሌ መታወቂያ እና በፖሊስ የተፈተሹ' : 'Background checked & police cleared'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('nearby')}
            className="text-xs font-semibold text-[#7B5804] hover:text-[#102A43] flex items-center gap-1"
          >
            <span>{language === 'am' ? 'ካርታ' : 'Map View'}</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              onClick={() => openProviderModal(provider)}
              className="min-w-[260px] max-w-[260px] bg-white rounded-3xl p-3.5 border border-[#D9E0E7] shadow-level-1 hover:border-[#D4A853]/60 transition-all cursor-pointer flex flex-col justify-between shrink-0"
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={provider.avatarUrl}
                      alt={provider.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#D9E0E7]"
                    />
                    {provider.verified && (
                      <span
                        className="absolute -bottom-1 -right-1 bg-[#D4A853] text-[#102A43] rounded-full p-0.5 border-2 border-white shadow-sm"
                        title="Vetted Specialist"
                      >
                        <CheckCircle2 size={12} className="stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#102A43] truncate">
                      {language === 'am' ? provider.amharicName : provider.name}
                    </h4>
                    <p className="text-[11px] text-[#74777E] truncate mt-0.5">
                      {language === 'am' ? provider.amharicSpecialty : provider.specialty}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5 text-xs font-bold text-[#102A43]">
                        <Star size={11} className="fill-[#D4A853] text-[#D4A853]" />
                        <span>{provider.rating}</span>
                      </div>
                      <span className="text-[10px] text-[#74777E]">
                        ({provider.reviewsCount})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-[#F7F8FA] rounded-2xl border border-[#D9E0E7]/60 text-[11px]">
                  <div className="flex items-center justify-between text-[#43474D]">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-[#D4A853]" />
                      <span className="truncate max-w-[120px]">
                        {language === 'am' ? provider.amharicLandmark : provider.landmark}
                      </span>
                    </span>
                    <span className="font-semibold text-[#102A43] shrink-0">
                      {provider.distanceKm} km
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#D9E0E7]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#74777E] block leading-none">
                    {language === 'am' ? 'በሰዓት' : 'Rate'}
                  </span>
                  <span className="text-xs font-bold text-[#102A43]">
                    {provider.hourlyRateETB} ETB/hr
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const srv = SERVICES.find(s => s.category === provider.category) || SERVICES[0];
                    openBookingModal(srv, provider);
                  }}
                  className="bg-[#D4A853] text-[#102A43] text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#e0b764] transition-colors"
                >
                  {t.bookNow}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Ethiopian Highland Guarantee Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#D9E0E7] shadow-level-1">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#102A43] text-[#D4A853] flex items-center justify-center shrink-0 shadow-sm">
            <Award size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#102A43]">
              {t.vettedGuarantee}
            </h4>
            <p className="text-[11px] text-[#43474D] mt-1 leading-relaxed">
              {t.vettedGuaranteeDesc}
            </p>
            <div className="mt-2.5 flex items-center gap-3 text-[10px] font-semibold text-[#74777E]">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-600" />
                {language === 'am' ? 'የቀበሌ ማረጋገጫ' : 'Kebele Verified'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-600" />
                {language === 'am' ? 'የፖሊስ ማረጋገጫ' : 'Police Cleared'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-[#0072CE]" />
                {language === 'am' ? 'ቴሌብር' : 'Telebirr'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
