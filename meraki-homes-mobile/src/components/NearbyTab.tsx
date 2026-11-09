import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PROVIDERS, SERVICES, NEIGHBORHOODS } from '../data/mockData';
import { ProviderItem } from '../types';
import {
  MapPin,
  Navigation,
  Star,
  ShieldCheck,
  Clock,
  CheckCircle2,
  PhoneCall,
  Filter,
  ChevronRight,
  Compass
} from 'lucide-react';

export const NearbyTab: React.FC = () => {
  const {
    language,
    t,
    selectedNeighborhood,
    setSelectedNeighborhood,
    openBookingModal,
    openProviderModal
  } = useApp();

  const [selectedProvider, setSelectedProvider] = useState<ProviderItem>(PROVIDERS[0]);
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(5);

  const filteredProviders = PROVIDERS.filter(p => {
    const matchesZone = selectedNeighborhood === 'All' || p.neighborhood === selectedNeighborhood;
    const matchesRadius = p.distanceKm <= maxRadiusKm;
    return matchesZone && matchesRadius;
  });

  return (
    <div className="pb-24 pt-3 space-y-4 px-5">
      {/* Map Header & Radius Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#102A43]">
            {language === 'am' ? 'የአዲስ አበባ የቀጥታ ካርታ' : 'Live Addis Radar'}
          </h2>
          <p className="text-xs text-[#74777E]">
            {filteredProviders.length} {language === 'am' ? 'ባለሙያዎች በመስራት ላይ ናቸው' : 'vetted specialists active nearby'}
          </p>
        </div>

        {/* Radius Filter Pills */}
        <div className="flex items-center gap-1 bg-white border border-[#D9E0E7] p-1 rounded-full text-xs font-semibold shadow-sm">
          {[2, 5, 10].map((radius) => (
            <button
              key={radius}
              onClick={() => setMaxRadiusKm(radius)}
              className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                maxRadiusKm === radius
                  ? 'bg-[#102A43] text-white font-bold'
                  : 'text-[#334155] hover:bg-[#F2F4F6]'
              }`}
            >
              {radius} km
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Addis Ababa Map Graphic Simulation */}
      <div className="relative h-64 bg-[#E8EDF2] rounded-3xl overflow-hidden border border-[#D9E0E7] shadow-level-1">
        {/* Map Grid Roads and Stylized Addis Topography */}
        <div className="absolute inset-0 bg-[#E9EEF4]">
          {/* Arterial roads: Bole Road, Ring Road, Meskel Square vector lines */}
          <svg className="w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            {/* Bole Road */}
            <path d="M 0,220 Q 150,150 400,80" stroke="#CBD5E1" strokeWidth="12" fill="none" />
            <path d="M 0,220 Q 150,150 400,80" stroke="#FFFFFF" strokeWidth="6" fill="none" />

            {/* Kazanchis - Piassa arterial */}
            <path d="M 120,0 L 220,260" stroke="#CBD5E1" strokeWidth="8" fill="none" />
            <path d="M 120,0 L 220,260" stroke="#FFFFFF" strokeWidth="4" fill="none" />

            {/* Ring Road Curve */}
            <path d="M 280,0 Q 340,120 400,260" stroke="#CBD5E1" strokeWidth="10" fill="none" strokeDasharray="6,4" />
            <path d="M 50,70 L 350,190" stroke="#CBD5E1" strokeWidth="6" fill="none" />

            {/* Green park zones (Africa Park / Friendship Park) */}
            <circle cx="160" cy="110" r="28" fill="#CDE7D5" opacity="0.7" />
            <circle cx="280" cy="80" r="22" fill="#CDE7D5" opacity="0.7" />
          </svg>

          {/* District Labels */}
          <div className="absolute top-5 left-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
            Piassa
          </div>
          <div className="absolute top-12 left-36 text-[9px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
            Kazanchis
          </div>
          <div className="absolute top-28 right-12 text-[9px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
            CMC Michael
          </div>
          <div className="absolute bottom-16 right-28 text-[9px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
            Bole Atlas
          </div>
          <div className="absolute bottom-6 left-14 text-[9px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
            Old Airport
          </div>
        </div>

        {/* User Current Location Pin (Edna Mall / Bole) */}
        <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-[#102A43]/20 flex items-center justify-center animate-ping" />
          <div className="absolute w-5 h-5 rounded-full bg-[#102A43] border-2 border-white flex items-center justify-center shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
          </div>
          <span className="mt-5 text-[9px] font-bold bg-[#102A43] text-white px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
            {language === 'am' ? 'እርስዎ ያሉበት (ቦሌ)' : 'You (Bole Edna Mall)'}
          </span>
        </div>

        {/* Interactive Provider Markers on Map */}
        {filteredProviders.map((provider) => {
          const isSelected = selectedProvider.id === provider.id;
          return (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider)}
              style={{
                left: `${provider.coordinates.x}%`,
                top: `${provider.coordinates.y}%`
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20 group focus:outline-none`}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-2xl overflow-hidden border-2 transition-transform shadow-level-2 ${
                    isSelected
                      ? 'border-[#D4A853] scale-110 ring-4 ring-[#D4A853]/30 shadow-gold-glow'
                      : 'border-white hover:scale-105'
                  }`}
                >
                  <img
                    src={provider.avatarUrl}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rating badge above pin */}
                <span
                  className={`absolute -top-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold shadow-sm whitespace-nowrap border ${
                    isSelected
                      ? 'bg-[#D4A853] text-[#102A43] border-white'
                      : 'bg-white text-[#102A43] border-[#D9E0E7]'
                  }`}
                >
                  ★ {provider.rating}
                </span>

                {/* Mini marker point tip */}
                <div
                  className={`w-2 h-2 rotate-45 -mt-1 ${
                    isSelected ? 'bg-[#D4A853]' : 'bg-white'
                  }`}
                />
              </div>
            </button>
          );
        })}

        {/* Compass / Recenter Button */}
        <button
          onClick={() => setSelectedNeighborhood('All')}
          className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm p-2 rounded-2xl shadow-level-2 border border-[#D9E0E7] text-[#102A43] hover:bg-[#F2F4F6] transition-colors"
          title="Reset View"
        >
          <Navigation size={15} className="text-[#102A43]" />
        </button>
      </div>

      {/* Selected Provider Highlight Card */}
      {selectedProvider && (
        <div className="bg-white rounded-3xl p-4 border border-[#D4A853]/50 shadow-level-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="relative">
                <img
                  src={selectedProvider.avatarUrl}
                  alt={selectedProvider.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#D9E0E7]"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#D4A853] text-[#102A43] p-0.5 rounded-full border border-white">
                  <CheckCircle2 size={12} className="stroke-[3]" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-[#102A43]">
                    {language === 'am' ? selectedProvider.amharicName : selectedProvider.name}
                  </h3>
                  <span className="text-[10px] bg-[#D4A853]/20 text-[#7B5804] px-1.5 py-0.2 rounded-full font-bold">
                    {language === 'am' ? selectedProvider.amharicBadgeText : selectedProvider.badgeText}
                  </span>
                </div>
                <p className="text-xs text-[#74777E] mt-0.5">
                  {language === 'am' ? selectedProvider.amharicSpecialty : selectedProvider.specialty}
                </p>

                <div className="flex items-center gap-2 mt-1.5 text-xs text-[#43474D]">
                  <span className="flex items-center gap-0.5 font-bold text-[#102A43]">
                    <Star size={12} className="fill-[#D4A853] text-[#D4A853]" />
                    <span>{selectedProvider.rating}</span>
                  </span>
                  <span>•</span>
                  <span>{selectedProvider.completedJobs} {t.completedJobs}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => openProviderModal(selectedProvider)}
              className="text-xs font-semibold text-[#7B5804] hover:text-[#102A43] flex items-center gap-0.5"
            >
              <span>{t.viewProfile}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="mt-3 p-2.5 bg-[#F7F8FA] rounded-2xl border border-[#D9E0E7]/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#334155]">
              <MapPin size={13} className="text-[#D4A853]" />
              <span>
                {language === 'am' ? selectedProvider.amharicLandmark : selectedProvider.landmark}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#102A43] font-bold">
              <Clock size={12} className="text-emerald-600" />
              <span>{selectedProvider.responseTime}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#D9E0E7]/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#74777E] block leading-none">
                {language === 'am' ? 'የሰዓት ክፍያ' : 'Hourly Rate'}
              </span>
              <span className="text-base font-bold text-[#102A43]">
                {selectedProvider.hourlyRateETB} ETB/hr
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openProviderModal(selectedProvider)}
                className="bg-white border border-[#D9E0E7] text-[#102A43] text-xs font-semibold px-3 py-2 rounded-2xl hover:bg-[#F2F4F6] transition-colors"
              >
                {language === 'am' ? 'መረጃ' : 'Info'}
              </button>

              <button
                onClick={() => {
                  const srv = SERVICES.find(s => s.category === selectedProvider.category) || SERVICES[0];
                  openBookingModal(srv, selectedProvider);
                }}
                className="bg-[#D4A853] text-[#102A43] text-xs font-bold px-4 py-2 rounded-2xl hover:bg-[#e0b764] transition-all active:scale-95 shadow-sm"
              >
                {t.bookNow}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nearby Specialists Full List */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-[#102A43] pt-1">
          {language === 'am' ? 'ሁሉም በአቅራቢያ ያሉ ባለሙያዎች' : 'All Nearby Specialists'}
        </h3>
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            onClick={() => {
              setSelectedProvider(provider);
            }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              selectedProvider.id === provider.id
                ? 'bg-[#102A43] text-white border-[#D4A853]'
                : 'bg-white text-[#191c1e] border-[#D9E0E7] hover:border-[#D4A853]/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={provider.avatarUrl}
                alt={provider.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="text-xs font-bold leading-snug">
                  {language === 'am' ? provider.amharicName : provider.name}
                </h4>
                <p className={`text-[11px] truncate max-w-[150px] ${
                  selectedProvider.id === provider.id ? 'text-slate-300' : 'text-[#74777E]'
                }`}>
                  {language === 'am' ? provider.amharicSpecialty : provider.specialty}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold block">
                {provider.distanceKm} km
              </span>
              <span className={`text-[10px] ${
                selectedProvider.id === provider.id ? 'text-[#D4A853]' : 'text-slate-500'
              }`}>
                ★ {provider.rating}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
