import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Monitor, Wifi, Battery, Signal, Sparkles } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const { isPhoneFrame, setIsPhoneFrame } = useApp();
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#EDEFE0]/30 flex flex-col items-center justify-start p-0 sm:py-6 sm:px-4">
      {/* Top Floating Viewport Switcher Toolbar */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-3 px-2">
        <div className="flex items-center gap-1.5 text-xs text-[#102A43] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#D4A853]" />
          <span>Warm Highland Hospitality • 390px Viewport</span>
        </div>

        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1.5 bg-white border border-[#D9E0E7] text-[#102A43] text-xs font-semibold py-1 px-3 rounded-full shadow-sm hover:bg-[#F2F4F6] transition-colors"
          title="Toggle Mobile Device Frame"
        >
          {isPhoneFrame ? <Monitor size={13} /> : <Smartphone size={13} />}
          <span>{isPhoneFrame ? 'Full View' : 'Device Shell'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full max-w-md mx-auto bg-white transition-all duration-300 relative ${
          isPhoneFrame
            ? 'sm:rounded-[48px] sm:shadow-[0_25px_60px_-15px_rgba(16,42,67,0.25)] sm:border-[10px] sm:border-[#102A43] overflow-hidden min-h-[844px]'
            : 'min-h-screen shadow-level-1'
        }`}
      >
        {/* Device Status Bar (Carrier: Ethio Telecom 5G) */}
        <div className="bg-white text-[#102A43] px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold select-none z-30 relative">
          <span className="text-[12px] font-bold tracking-tight">{currentTime}</span>

          {/* Dynamic Island / Notch pill */}
          <div className="hidden sm:flex w-24 h-5 bg-[#102A43] rounded-full items-center justify-end px-2">
            <span className="w-2 h-2 rounded-full bg-[#D4A853]/60" />
          </div>

          <div className="flex items-center gap-1.5 text-[#102A43]">
            <span className="text-[10px] font-bold tracking-tighter text-[#74777E] mr-0.5">EthioTel 5G</span>
            <Signal size={12} className="stroke-[2.5]" />
            <Wifi size={12} className="stroke-[2.5]" />
            <Battery size={13} className="stroke-[2.5] fill-current" />
          </div>
        </div>

        {/* Application Content Canvas */}
        <main className="relative min-h-[calc(100vh-64px)] sm:min-h-[780px]">
          {children}
        </main>
      </div>
    </div>
  );
};
