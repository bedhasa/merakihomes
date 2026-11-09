import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NEIGHBORHOODS } from '../data/mockData';
import { MapPin, Search, Globe, ChevronDown, Bell, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    toggleLanguage,
    t,
    selectedNeighborhood,
    setSelectedNeighborhood,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const currentZone = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood) || NEIGHBORHOODS[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D9E0E7] shadow-sm">
      {/* Top micro-bar: Addis weather & language switch */}
      <div className="bg-[#102A43] text-white px-5 py-1.5 flex items-center justify-between text-[11px] font-medium tracking-wide">
        <div className="flex items-center gap-1.5 text-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A853] animate-pulse" />
          <span>{t.addisWeather}</span>
        </div>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 text-[#D4A853] hover:text-white transition-colors py-0.5 px-2 rounded-full border border-[#D4A853]/40 bg-white/5 active:scale-95"
          title="Toggle Language / ቋንቋ ቀይር"
        >
          <Globe size={12} />
          <span className="font-bold">{language === 'en' ? 'አማርኛ (AM)' : 'English (EN)'}</span>
        </button>
      </div>

      {/* Main Header Row */}
      <div className="px-5 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#102A43] flex items-center justify-center text-white shadow-level-1 border border-[#D4A853]/40">
              <span className="font-bold text-lg text-[#D4A853]">ቤ</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-[18px] text-[#102A43] tracking-tight leading-none">
                  {t.appName}
                </span>
                <span className="text-[10px] bg-[#D4A853]/20 text-[#7B5804] font-bold px-1.5 py-0.5 rounded-full">
                  ADDIS
                </span>
              </div>
              <p className="text-[10px] text-[#43474D] font-medium tracking-tight">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Location Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#F7F8FA] hover:bg-[#EDEEF0] border border-[#D9E0E7] text-[#102A43] text-xs font-semibold py-1.5 px-3 rounded-full transition-colors active:scale-95 shadow-sm"
            >
              <MapPin size={13} className="text-[#D4A853]" />
              <span className="truncate max-w-[90px]">
                {language === 'am' ? currentZone.amharic : currentZone.name}
              </span>
              <ChevronDown size={12} className={`text-slate-500 transition-transform ${isZoneDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Zone Dropdown Menu */}
            {isZoneDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsZoneDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-level-2 border border-[#D9E0E7] z-50 py-2 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#74777E] uppercase tracking-wider border-b border-[#D9E0E7]/60">
                    {language === 'am' ? 'የአዲስ አበባ ሰፈሮች' : 'Addis Ababa Zones'}
                  </div>
                  {NEIGHBORHOODS.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => {
                        setSelectedNeighborhood(zone.id);
                        setIsZoneDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                        selectedNeighborhood === zone.id
                          ? 'bg-[#102A43] text-white font-semibold'
                          : 'text-[#334155] hover:bg-[#F2F4F6]'
                      }`}
                    >
                      <span>{language === 'am' ? zone.amharic : zone.name}</span>
                      {selectedNeighborhood === zone.id && (
                        <span className="w-2 h-2 rounded-full bg-[#D4A853]" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notification Button */}
          <button
            onClick={() => {
              setShowNotificationToast(true);
              setTimeout(() => setShowNotificationToast(false), 3000);
            }}
            className="w-9 h-9 rounded-full bg-white border border-[#D9E0E7] flex items-center justify-center text-[#102A43] hover:bg-[#F2F4F6] relative transition-colors"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4A853]" />
          </button>
        </div>

        {/* Quick Search Bar */}
        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={16} className="text-[#74777E]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full h-11 pl-10 pr-9 rounded-2xl bg-[#F7F8FA] border border-[#D9E0E7] text-xs text-[#191c1e] placeholder-[#74777E] focus:outline-none focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#74777E] hover:text-[#102A43]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Floating toast notification alert */}
      {showNotificationToast && (
        <div className="mx-4 mb-2 p-2.5 bg-[#102A43] text-white text-xs rounded-xl shadow-level-2 flex items-center justify-between animate-fade-in border border-[#D4A853]/30">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#D4A853]" />
            <span>
              {language === 'am'
                ? 'በቦሌ እና ካዛንቺስ 12 ታማኝ ባለሙያዎች ይገኛሉ።'
                : '12 vetted specialists active now in Bole & Kazanchis.'}
            </span>
          </div>
          <button
            onClick={() => setShowNotificationToast(false)}
            className="text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
};
