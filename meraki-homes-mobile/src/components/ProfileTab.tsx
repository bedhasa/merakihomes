import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  MapPin,
  CreditCard,
  Globe,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  Plus,
  Lock,
  Headphones,
  Award,
  Sparkles
} from 'lucide-react';

export const ProfileTab: React.FC = () => {
  const { language, setLanguage, t } = useApp();

  const [activePaymentMethod, setActivePaymentMethod] = useState<'telebirr' | 'cbe'>('telebirr');
  const [telebirrNumber, setTelebirrNumber] = useState('+251 91 142 8890');
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSavePayment = () => {
    setIsEditingPayment(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <div className="pb-24 pt-3 space-y-4 px-5">
      {/* Toast alert */}
      {showSavedToast && (
        <div className="p-3 bg-[#102A43] text-white text-xs rounded-2xl shadow-level-2 flex items-center gap-2 border border-[#D4A853]">
          <CheckCircle2 size={16} className="text-[#D4A853]" />
          <span>{language === 'am' ? 'የክፍያ መረጃዎ በተሳካ ሁኔታ ተቀምጧል!' : 'Payment method updated successfully!'}</span>
        </div>
      )}

      {/* User Identity Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#D9E0E7] shadow-level-1">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#102A43] to-[#204a70] text-white flex items-center justify-center font-bold text-xl border-2 border-[#D4A853] shadow-level-1">
              MH
            </div>
            <span
              className="absolute -bottom-1 -right-1 bg-[#D4A853] text-[#102A43] p-1 rounded-full border-2 border-white shadow-sm"
              title="Kebele Verified Identity"
            >
              <ShieldCheck size={12} className="stroke-[3]" />
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#102A43]">
                {language === 'am' ? 'ሜሮን ኃይሌ' : 'Meron Haile'}
              </h3>
              <span className="text-[10px] bg-[#D4A853]/20 text-[#7B5804] px-2 py-0.5 rounded-full font-bold">
                {language === 'am' ? 'የተረጋገጠ' : 'VETTED MEMBER'}
              </span>
            </div>
            <p className="text-xs text-[#74777E] mt-0.5">
              +251 91 142 8890
            </p>
            <p className="text-[11px] text-[#43474D] flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-[#D4A853]" />
              <span>{language === 'am' ? 'ቦሌ ክፍለ ከተማ፣ ወረዳ 03' : 'Bole Sub-City, Woreda 03, Addis Ababa'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Domestic Payment Integration Selectors */}
      <div className="bg-white rounded-3xl p-4 border border-[#D9E0E7] shadow-level-1 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#102A43]">
              {language === 'am' ? 'የክፍያ ዘዴዎች' : 'Ethiopian Payment Methods'}
            </h4>
            <p className="text-[11px] text-[#74777E]">
              {language === 'am' ? 'ቴሌብር እና ንግድ ባንክ (CBE Birr)' : 'Telebirr & Commercial Bank of Ethiopia'}
            </p>
          </div>
          <button
            onClick={() => setIsEditingPayment(!isEditingPayment)}
            className="text-xs font-semibold text-[#7B5804] hover:underline"
          >
            {isEditingPayment ? (language === 'am' ? 'ዝጋ' : 'Cancel') : (language === 'am' ? 'አስተካክል' : 'Edit')}
          </button>
        </div>

        {/* Telebirr Card */}
        <div
          onClick={() => setActivePaymentMethod('telebirr')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            activePaymentMethod === 'telebirr'
              ? 'border-[#0072CE] bg-[#0072CE]/5 ring-1 ring-[#0072CE]'
              : 'border-[#D9E0E7] bg-[#F7F8FA] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0072CE] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              telebirr
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#102A43]">Telebirr Mobile Wallet</span>
                {activePaymentMethod === 'telebirr' && (
                  <span className="text-[9px] bg-[#0072CE] text-white px-1.5 py-0.2 rounded-full font-bold">
                    DEFAULT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#43474D] font-mono mt-0.5">
                {telebirrNumber}
              </p>
            </div>
          </div>

          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-[#0072CE]">
            {activePaymentMethod === 'telebirr' && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#0072CE]" />
            )}
          </div>
        </div>

        {/* Commercial Bank of Ethiopia (CBE Birr) Card */}
        <div
          onClick={() => setActivePaymentMethod('cbe')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            activePaymentMethod === 'cbe'
              ? 'border-[#5C068C] bg-[#5C068C]/5 ring-1 ring-[#5C068C]'
              : 'border-[#D9E0E7] bg-[#F7F8FA] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C068C] text-[#C5A059] flex items-center justify-center font-bold text-xs shadow-sm">
              CBE
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#102A43]">CBE Birr / Commercial Bank</span>
                {activePaymentMethod === 'cbe' && (
                  <span className="text-[9px] bg-[#5C068C] text-white px-1.5 py-0.2 rounded-full font-bold">
                    DEFAULT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#43474D] font-mono mt-0.5">
                Acc: 1000 **** **** 8421
              </p>
            </div>
          </div>

          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-[#5C068C]">
            {activePaymentMethod === 'cbe' && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#5C068C]" />
            )}
          </div>
        </div>

        {isEditingPayment && (
          <div className="p-3 bg-[#F7F8FA] rounded-2xl border border-[#D9E0E7] space-y-2.5 pt-3">
            <label className="text-xs font-bold text-[#102A43] block">
              {language === 'am' ? 'የቴሌብር ስልክ ቁጥር' : 'Update Telebirr Phone Number'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={telebirrNumber}
                onChange={(e) => setTelebirrNumber(e.target.value)}
                className="flex-1 h-10 px-3 rounded-xl bg-white border border-[#D9E0E7] text-xs font-mono focus:outline-none focus:border-[#D4A853]"
              />
              <button
                onClick={handleSavePayment}
                className="bg-[#D4A853] text-[#102A43] text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#e0b764]"
              >
                {language === 'am' ? 'አስቀምጥ' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Addresses in Addis Ababa */}
      <div className="bg-white rounded-3xl p-4 border border-[#D9E0E7] shadow-level-1 space-y-3">
        <h4 className="text-sm font-bold text-[#102A43]">
          {language === 'am' ? 'የተቀመጡ አድራሻዎች' : 'Saved Addis Residences'}
        </h4>

        <div className="space-y-2">
          <div className="p-3 rounded-2xl bg-[#F7F8FA] border border-[#D9E0E7]/60 flex items-start gap-3">
            <MapPin size={16} className="text-[#D4A853] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#102A43]">
                  {language === 'am' ? 'ዋና ቤት (ቦሌ አትላስ)' : 'Primary Residence (Bole Atlas)'}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full">
                  DEFAULT
                </span>
              </div>
              <p className="text-[11px] text-[#43474D] mt-0.5">
                Bole Atlas, Behind Edna Mall, Building 4B, Apt 402
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F7F8FA] border border-[#D9E0E7]/60 flex items-start gap-3">
            <MapPin size={16} className="text-[#74777E] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-bold text-[#102A43]">
                {language === 'am' ? 'ቢሮ (ካዛንቺስ)' : 'Office (Kazanchis)'}
              </span>
              <p className="text-[11px] text-[#43474D] mt-0.5">
                Kazanchis, UNECA Compound Lane, Villa 12
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Preference Selector */}
      <div className="bg-white rounded-3xl p-4 border border-[#D9E0E7] shadow-level-1">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} className="text-[#102A43]" />
          <h4 className="text-sm font-bold text-[#102A43]">
            {language === 'am' ? 'የቋንቋ ምርጫ' : 'Language & Display'}
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
              language === 'en'
                ? 'bg-[#102A43] text-white border-[#D4A853]'
                : 'bg-[#F7F8FA] text-[#334155] border-[#D9E0E7]'
            }`}
          >
            <span>English (US/UK)</span>
            {language === 'en' && <span className="w-2 h-2 rounded-full bg-[#D4A853]" />}
          </button>

          <button
            onClick={() => setLanguage('am')}
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
              language === 'am'
                ? 'bg-[#102A43] text-white border-[#D4A853]'
                : 'bg-[#F7F8FA] text-[#334155] border-[#D9E0E7]'
            }`}
          >
            <span>አማርኛ (Amharic)</span>
            {language === 'am' && <span className="w-2 h-2 rounded-full bg-[#D4A853]" />}
          </button>
        </div>
      </div>

      {/* Support & Highland Hospitality Hotline */}
      <div className="bg-[#FAF6EC] rounded-3xl p-4 border border-[#E7D6AC] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#102A43] text-[#D4A853] flex items-center justify-center font-bold">
            <Headphones size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#102A43]">
              {language === 'am' ? 'የቤቴ 24/7 የእርዳታ መስመር' : '24/7 Highland Support'}
            </h4>
            <p className="text-[11px] text-[#7B5804] font-semibold">
              Dial 8080 (Toll Free) • +251 11 661 2233
            </p>
          </div>
        </div>

        <a
          href="tel:8080"
          className="bg-[#D4A853] text-[#102A43] text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#e0b764]"
        >
          {language === 'am' ? 'ይደውሉ' : 'Call'}
        </a>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-2 text-[10px] text-[#74777E]">
        <p>Bete - Warm Highland Hospitality (ቤቴ)</p>
        <p className="mt-0.5">Bole Sub-City, Addis Ababa, Ethiopia • v2.4</p>
      </div>
    </div>
  );
};
