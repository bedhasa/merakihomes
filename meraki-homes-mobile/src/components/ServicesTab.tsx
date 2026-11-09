import React from 'react';
import { useApp } from '../context/AppContext';
import { SERVICES } from '../data/mockData';
import { ServiceCategory } from '../types';
import {
  Check,
  Star,
  Clock,
  ShieldCheck,
  Sparkles,
  Coffee,
  Wrench,
  Droplet,
  Heart,
  Tv,
  PlusCircle,
  ArrowRight
} from 'lucide-react';

export const ServicesTab: React.FC = () => {
  const {
    language,
    t,
    selectedCategory,
    setSelectedCategory,
    openBookingModal,
    searchQuery
  } = useApp();

  const categories: { id: ServiceCategory; label: string; amharic: string; icon: any }[] = [
    { id: 'all', label: 'All Services', amharic: 'ሁሉም', icon: Sparkles },
    { id: 'cleaning', label: 'Home Cleaning', amharic: 'የቤት ፅዳት', icon: Sparkles },
    { id: 'buna', label: 'Buna Ceremony', amharic: 'የቡና መስተንግዶ', icon: Coffee },
    { id: 'electrical', label: 'Electrical & Solar', amharic: 'ኤሌክትሪክና ሶላር', icon: Wrench },
    { id: 'plumbing', label: 'Water & Plumbing', amharic: 'ቧንቧና ውሃ', icon: Droplet },
    { id: 'caregiving', label: 'Caregivers & Nanny', amharic: 'እንክብካቤ', icon: Heart },
    { id: 'appliance', label: 'Appliance Repair', amharic: 'የእቃዎች ጥገና', icon: Tv },
  ];

  const filtered = SERVICES.filter(service => {
    const matchesCat = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pb-24 pt-3 space-y-4 px-5">
      {/* Category Pills Bar */}
      <div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-2 min-h-[38px] rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-[#102A43] text-white border-[#D4A853] shadow-level-1'
                    : 'bg-white text-[#334155] border-[#D9E0E7] hover:border-[#D4A853]/50'
                }`}
              >
                <Icon size={13} className={isSelected ? 'text-[#D4A853]' : 'text-slate-400'} />
                <span>{language === 'am' ? cat.amharic : cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filtered.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl p-4 border border-[#D9E0E7] shadow-level-1 hover:border-[#D4A853]/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-3.5 bg-slate-100">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="bg-[#102A43]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                    {language === 'am' ? service.amharicDuration : service.duration}
                  </span>
                  {service.popular && (
                    <span className="bg-[#D4A853] text-[#102A43] text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                      {language === 'am' ? 'ተወዳጅ' : 'MOST BOOKED'}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1 text-xs font-bold text-[#102A43] shadow-sm">
                  <Star size={12} className="fill-[#D4A853] text-[#D4A853]" />
                  <span>{service.rating}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({service.reviewsCount})</span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#102A43] leading-snug">
                    {language === 'am' ? service.amharicTitle : service.title}
                  </h3>
                  <p className="text-xs text-[#43474D] mt-1 leading-relaxed">
                    {language === 'am' ? service.amharicDescription : service.description}
                  </p>
                </div>
              </div>

              {/* What's Included list */}
              <div className="mt-3.5 bg-[#F7F8FA] rounded-2xl p-3 border border-[#D9E0E7]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777E] block mb-2">
                  {language === 'am' ? 'የአገልግሎቱ ዝርዝር' : 'What is Included'}
                </span>
                <div className="space-y-1.5">
                  {(language === 'am' ? service.amharicIncluded : service.included).map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#334155]">
                      <span className="w-4 h-4 rounded-full bg-[#D4A853]/20 flex items-center justify-center text-[#7B5804] shrink-0 mt-0.5">
                        <Check size={10} className="stroke-[3]" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price and Action Footer */}
            <div className="mt-4 pt-3 border-t border-[#D9E0E7]/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#74777E] block leading-none">
                  {language === 'am' ? service.amharicPriceUnit : service.priceUnit}
                </span>
                <span className="text-lg font-bold text-[#102A43]">
                  {service.priceETB.toLocaleString()} ETB
                </span>
              </div>

              <button
                onClick={() => openBookingModal(service)}
                className="bg-[#D4A853] text-[#102A43] text-xs font-bold px-4 py-2.5 rounded-2xl hover:bg-[#e0b764] transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <span>{t.bookNow}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Service Request Card */}
      <div className="bg-[#FAF6EC] rounded-3xl p-4 border border-[#E7D6AC] text-center">
        <h4 className="text-sm font-bold text-[#102A43]">
          {language === 'am' ? 'ልዩ የቤት ወይም የበዓል ጥያቄ አለዎት?' : 'Need a Custom Home or Holiday Setup?'}
        </h4>
        <p className="text-xs text-[#43474D] mt-1 max-w-xs mx-auto">
          {language === 'am'
            ? 'ለሰርግ፣ ለእረፍት ቀናት ድግስ፣ ወይም ለሙሉ ቤት ጥገና ልዩ ቡድናችንን ያነጋግሩ።'
            : 'For holiday feasts, family gatherings, or compound renovations, request custom staffing.'}
        </p>
        <button
          onClick={() => openBookingModal(SERVICES[0])}
          className="mt-3 bg-[#102A43] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#1b3857] transition-all"
        >
          {language === 'am' ? 'ልዩ ጥያቄ ያቅርቡ' : 'Request Custom Service'}
        </button>
      </div>
    </div>
  );
};
