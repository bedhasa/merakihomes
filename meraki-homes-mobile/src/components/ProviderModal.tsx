import React from 'react';
import { useApp } from '../context/AppContext';
import { SERVICES, REVIEWS } from '../data/mockData';
import {
  X,
  CheckCircle2,
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  Award,
  Phone,
  MessageSquare,
  Globe,
  ArrowRight
} from 'lucide-react';

export const ProviderModal: React.FC = () => {
  const {
    activeProviderModal,
    closeProviderModal,
    openBookingModal,
    language,
    t
  } = useApp();

  const provider = activeProviderModal;
  if (!provider) return null;

  const relevantReviews = REVIEWS;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-level-3 border border-[#D9E0E7]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#D9E0E7] flex items-center justify-between bg-[#F7F8FA]">
          <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
            {language === 'am' ? 'የባለሙያ መገለጫ' : 'Specialist Profile'}
          </span>
          <button
            onClick={closeProviderModal}
            className="w-8 h-8 rounded-full bg-white border border-[#D9E0E7] flex items-center justify-center text-slate-500 hover:text-[#102A43]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4 flex-1">
          {/* Hero Profile */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={provider.avatarUrl}
                alt={provider.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4A853] shadow-level-1"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-[#D4A853] text-[#102A43] p-1 rounded-full border-2 border-white shadow-sm">
                <CheckCircle2 size={14} className="stroke-[3]" />
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-[#102A43]">
                  {language === 'am' ? provider.amharicName : provider.name}
                </h3>
              </div>
              <p className="text-xs text-[#74777E] mt-0.5">
                {language === 'am' ? provider.amharicSpecialty : provider.specialty}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-xs font-bold text-[#102A43] bg-[#D4A853]/20 px-2 py-0.5 rounded-full">
                  <Star size={11} className="fill-[#D4A853] text-[#D4A853]" />
                  <span>{provider.rating}</span>
                </span>
                <span className="text-[11px] text-[#43474D]">
                  {provider.completedJobs} {t.completedJobs}
                </span>
              </div>
            </div>
          </div>

          {/* Vetted Badges Row */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#F7F8FA] rounded-2xl border border-[#D9E0E7] flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-[#102A43] block text-[11px]">
                  {language === 'am' ? 'የቀበሌ መታወቂያ' : 'Kebele Verified'}
                </span>
                <span className="text-[10px] text-slate-500">Addis Sub-City</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#F7F8FA] rounded-2xl border border-[#D9E0E7] flex items-center gap-2">
              <Clock size={16} className="text-[#0072CE] shrink-0" />
              <div>
                <span className="font-bold text-[#102A43] block text-[11px]">
                  {provider.responseTime}
                </span>
                <span className="text-[10px] text-slate-500">Average Response</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h4 className="text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1">
              {language === 'am' ? 'ስለ ባለሙያው' : 'About Specialist'}
            </h4>
            <p className="text-xs text-[#43474D] leading-relaxed bg-[#F7F8FA] p-3 rounded-2xl border border-[#D9E0E7]">
              {language === 'am' ? provider.amharicBio : provider.bio}
            </p>
          </div>

          {/* Location & Spoken Languages */}
          <div className="p-3 bg-[#FAF6EC] rounded-2xl border border-[#E7D6AC] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[#334155]">
              <span className="flex items-center gap-1.5 text-[#7B5804] font-medium">
                <MapPin size={13} />
                <span>Addis Location</span>
              </span>
              <span className="font-bold text-[#102A43]">
                {language === 'am' ? provider.amharicLandmark : provider.landmark}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#334155]">
              <span className="flex items-center gap-1.5 text-[#7B5804] font-medium">
                <Globe size={13} />
                <span>Languages</span>
              </span>
              <span className="font-semibold text-[#102A43]">
                {provider.languages.join(', ')}
              </span>
            </div>
          </div>

          {/* Verified Client Reviews */}
          <div>
            <h4 className="text-xs font-bold text-[#102A43] uppercase tracking-wider mb-2">
              {language === 'am' ? 'የደንበኞች አስተያየት' : 'Verified Household Reviews'}
            </h4>
            <div className="space-y-2">
              {relevantReviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-white rounded-2xl border border-[#D9E0E7] shadow-sm text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#102A43]">{rev.author}</span>
                    <div className="flex items-center gap-0.5 text-xs font-bold text-[#D4A853]">
                      ★ {rev.rating}.0
                    </div>
                  </div>
                  <p className="text-[11px] text-[#43474D] leading-relaxed">
                    "{language === 'am' ? rev.amharicComment : rev.comment}"
                  </p>
                  <span className="text-[9px] text-slate-400 block pt-0.5">
                    {rev.neighborhood} • {rev.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D9E0E7] bg-white flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#74777E] block leading-none">Rate</span>
            <span className="text-base font-bold text-[#102A43]">
              {provider.hourlyRateETB} ETB/hr
            </span>
          </div>

          <button
            onClick={() => {
              closeProviderModal();
              const srv = SERVICES.find(s => s.category === provider.category) || SERVICES[0];
              openBookingModal(srv, provider);
            }}
            className="bg-[#D4A853] text-[#102A43] text-xs font-bold px-6 py-2.5 rounded-2xl hover:bg-[#e0b764] transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <span>{t.bookNow}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
