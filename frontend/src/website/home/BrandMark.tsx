import React from 'react';

export const BrandMark: React.FC<{ onNavy?: boolean }> = ({ onNavy = false }) => (
  <span className="flex min-w-0 items-center gap-2">
    <img src="/meraki-skyline-logo.png" alt="" aria-hidden="true" className="h-[60px] w-[64px] shrink-0 object-contain" />
    <span className="min-w-0">
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        <span className={`text-[14px] font-black tracking-[0.1px] ${onNavy ? 'text-white' : 'text-[#142B4A]'}`}>MERAKI</span>
        <span className="text-[14px] font-black tracking-[0.1px] text-[#B27A13]">HOMES</span>
        <span className="h-[5px] w-[5px] rounded-full bg-[#8B5E00]" />
      </span>
      <span className={`block whitespace-nowrap text-[9px] ${onNavy ? 'text-white/70' : 'text-slate-500'}`}>Home Services, Made Easy.</span>
    </span>
  </span>
);
