import React from 'react';
import { Mail, Send, Phone, MapPin, ArrowUpRight, ShieldCheck, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '../../i18n/navigation';
import { BrandMark } from './BrandMark';

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
  { id: 'about', labelKey: 'about' as const },
  { id: 'trust', labelKey: 'trust' as const },
  { id: 'team', label: 'Our Team' },
  { id: 'blog', label: 'Journal & Guides' },
  { id: 'faq', label: 'FAQs' },
  { id: 'contact', labelKey: 'contact' as const },
];

export const Footer: React.FC<FooterProps> = ({
  onPageChange,
  onBookNow,
  onServiceSelect,
}) => {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  return (
    <footer className="bg-[#102A43] text-white border-t border-white/10 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info & Mission (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onPageChange('home')}
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]"
              aria-label={t('ariaLogo')}
            >
              <BrandMark onNavy />
            </button>

            <p className="text-sm leading-relaxed text-white/75 max-w-sm">
              {t('mission')}
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
              <span>{t('headquarters')}</span>
            </div>
          </div>

          {/* Services Column (Col 3) — catalogue labels stay English in v1 */}
          <div>
            <h3 className="text-xs font-bold tracking-[.18em] uppercase text-[#D4A853] mb-4">
              {t('services')}
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
              {t('company')}
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              {companyLinks.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onPageChange(c.id)}
                    className="hover:text-[#D4A853] transition-colors text-left"
                  >
                    {'labelKey' in c ? tNav(c.labelKey) : c.label}
                  </button>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/track-booking"
                  className="hover:text-[#D4A853] transition-colors text-white font-medium"
                >
                  {t('trackExisting')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact & Staff Access (Col 5) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-[.18em] uppercase text-[#D4A853] mb-4">
              {t('contactSupport')}
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
                <span>{t('staffPortal')}</span>
                <ArrowUpRight size={12} />
              </a>
            </div> : null}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>

          <p className="text-center md:text-right text-white/50 max-w-md">
            {t('disclaimer')}
          </p>

          <div className="flex items-center gap-1 text-white/70">
            <span>{t('crafted')}</span>
            <Heart size={13} className="text-[#D4A853] fill-[#D4A853]" />
            <span>{t('forAddis')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
