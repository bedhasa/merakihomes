import React from 'react';
import { Mail, Send, Phone, MapPin, ArrowUpRight, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onPageChange: (pageId: string) => void;
  onBookNow: () => void;
  onServiceSelect?: (serviceId: string) => void;
}

const staffPortalUrl=process.env.NEXT_PUBLIC_MANAGEMENT_URL||(process.env.NODE_ENV==='development'?'http://localhost:3004/login':'');

const serviceLinks = [
  { id: 'premium_home_cleaning', label: 'Premium Home Cleaning' },
  { id: 'cooking_service', label: 'Personal Cooking & Prep' },
  { id: 'childcare_nanny', label: 'Childcare & Babysitting' },
  { id: 'elder_companion', label: 'Elder Companion Care' },
  { id: 'maid_laundry', label: 'Laundry & Ironing' },
  { id: 'handyman_plumbing', label: 'Minor Repairs & Handyman' },
  { id: 'gardening_outdoor', label: 'Gardening & Grounds' },
  { id: 'office_cleaning', label: 'Office & Commercial Cleaning' },
];

const companyLinks = [
  { id: 'about', label: 'About Meraki' },
  { id: 'trust', label: 'Trust & Safety' },
  { id: 'team', label: 'Our Team' },
  { id: 'blog', label: 'Journal & Guides' },
  { id: 'faq', label: 'FAQs' },
  { id: 'contact', label: 'Contact Us' },
];

export const Footer: React.FC<FooterProps> = ({
  onPageChange,
  onBookNow,
  onServiceSelect,
}) => {
  return (
    <footer className="bg-[#102A43] text-white border-t border-white/10 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info & Mission (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onPageChange('home')}
              className="meraki-logo-background inline-flex rounded-xl p-2 shadow-md"
              aria-label="Meraki Homes Logo"
            >
              <img
                src="/meraki-homes-logo.svg"
                alt="Meraki Homes"
                className="h-[130px] w-auto max-w-[210px] object-contain"
              />
            </button>

            <p className="text-sm leading-relaxed text-white/75 max-w-sm">
              Ethiopia’s first full-stack household services platform. Connecting trusted domestic workers with Addis Ababa families with soul, professionalism, and care.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://t.me/Bdhs_N"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white hover:bg-[#D4A853] hover:text-[#102A43] transition-colors"
              >
                <Send size={18} />
              </a>

              <a
                href="mailto:bdhsane@gmail.com"
                aria-label="Email Us"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white hover:bg-[#D4A853] hover:text-[#102A43] transition-colors"
              >
                <Mail size={18} />
              </a>

              <a
                href="tel:+251936259142"
                aria-label="Call Us"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white hover:bg-[#D4A853] hover:text-[#102A43] transition-colors"
              >
                <Phone size={18} />
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/60 pt-2">
              <MapPin size={14} className="text-[#D4A853]" />
              <span>Headquartered in Addis Ababa, Ethiopia</span>
            </div>
          </div>

          {/* Services Column (Col 3) */}
          <div>
            <h3 className="text-xs font-bold tracking-[.18em] uppercase text-[#D4A853] mb-4">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              {serviceLinks.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      if (onServiceSelect) onServiceSelect(s.id);
                      else onPageChange('services');
                    }}
                    className="hover:text-[#D4A853] transition-colors text-left"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column (Col 4) */}
          <div>
            <h3 className="text-xs font-bold tracking-[.18em] uppercase text-[#D4A853] mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              {companyLinks.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onPageChange(c.id)}
                    className="hover:text-[#D4A853] transition-colors text-left"
                  >
                    {c.label}
                  </button>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href="/track-booking"
                  className="hover:text-[#D4A853] transition-colors text-white font-medium"
                >
                  Track Existing Request →
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Contact & Staff Access (Col 5) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-[.18em] uppercase text-[#D4A853] mb-4">
              Contact & Support
            </h3>

            <div className="space-y-2 text-sm text-white/80">
              <p className="font-semibold text-white">Direct Dispatch:</p>
              <a
                href="tel:+251936259142"
                className="block hover:text-[#D4A853] transition-colors"
              >
                +251 936 259 142
              </a>
              <a
                href="tel:+251913394404"
                className="block hover:text-[#D4A853] transition-colors"
              >
                +251 913 394 404
              </a>
            </div>

            <div className="space-y-1 text-sm text-white/80 pt-2">
              <p className="font-semibold text-white">Email Inquiries:</p>
              <a
                href="mailto:bdhsane@gmail.com"
                className="block hover:text-[#D4A853] transition-colors"
              >
                bdhsane@gmail.com
              </a>
            </div>

            {staffPortalUrl ? <div className="pt-4 border-t border-white/10">
              <a
                href={staffPortalUrl}
                className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
              >
                <ShieldCheck size={14} className="text-[#D4A853]" />
                <span>Staff Operations Portal</span>
                <ArrowUpRight size={12} />
              </a>
            </div> : null}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Meraki Homes. All rights reserved.</p>

          <p className="text-center md:text-right text-white/50 max-w-md">
            Booking requests remain distinct from confirmed appointments. Scope, availability, and pricing are reviewed with you before confirmation.
          </p>

          <div className="flex items-center gap-1 text-white/70">
            <span>Crafted with</span>
            <Heart size={13} className="text-[#D4A853] fill-[#D4A853]" />
            <span>for Addis Ababa</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
