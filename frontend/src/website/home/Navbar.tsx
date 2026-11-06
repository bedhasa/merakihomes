import React, { useEffect, useState } from 'react';
import { ArrowRight, Menu, Moon, Sparkles, Sun, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../../contexts/ThemeContext';

export interface NavbarProps {
  currentPage: string;
  onPageChange: (pageId: string) => void;
  onBookNow: () => void;
  isTransparentTop?: boolean;
}

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'trust', label: 'Trust & Safety' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange, onBookNow }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToPage = (id: string) => {
    onPageChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 flex h-[92px] items-center border-b border-slate-200/80 bg-white/95 backdrop-blur-lg transition-shadow duration-300 dark:border-slate-700 dark:bg-[#102A43]/95 ${scrolled ? 'shadow-md shadow-[#102A43]/10 dark:shadow-black/20' : 'shadow-sm shadow-[#102A43]/5'}`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <button onClick={() => goToPage('home')} className="group flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]" aria-label="Meraki Homes Home">
          <span className="meraki-logo-background flex items-center rounded-md px-1 py-0.5">
            <img src="/meraki-homes-logo.svg" alt="Meraki Homes" className="h-[84px] w-auto max-w-[145px] object-contain" />
          </span>
        </button>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-7" aria-label="Main navigation">
          {navLinks.map(({ id, label }) => {
            const active = currentPage === id;
            return <button key={id} onClick={() => goToPage(id)} aria-current={active ? 'page' : undefined} className={`group relative min-h-11 px-1 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] ${active ? 'text-[#102A43] dark:text-white' : 'text-slate-600 hover:text-[#102A43] dark:text-slate-300 dark:hover:text-white'}`}>
              {label}
              <span aria-hidden="true" className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-[#D4A853] transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </button>;
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a href="/login" className="rounded px-2 py-2 text-sm font-medium text-[#102A43] transition-colors hover:text-[#8C6A2F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] dark:text-slate-100 dark:hover:text-[#E5C883]">Sign In</a>
          <button onClick={toggleTheme} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} className="grid h-10 w-10 place-items-center rounded-lg text-[#102A43] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] dark:text-white dark:hover:bg-white/10">
            {isDarkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <button onClick={onBookNow} className="group inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#D4A853] px-5 py-2.5 text-sm font-bold text-[#102A43] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43] focus-visible:ring-offset-2">
            <Sparkles size={15} aria-hidden="true" />Book Now<ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <button onClick={toggleTheme} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} className="grid h-10 w-10 place-items-center rounded-lg text-[#102A43] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] dark:text-white dark:hover:bg-white/10">
            {isDarkMode ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </button>
          <button onClick={() => setMobileMenuOpen(value => !value)} aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'} className="rounded-lg p-2 text-[#102A43] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] dark:text-white dark:hover:bg-white/10">
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="absolute left-0 right-0 top-[92px] overflow-hidden border-t border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-[#102A43] lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-5 py-4" aria-label="Mobile navigation">
            {navLinks.map(({ id, label }) => <button key={id} onClick={() => goToPage(id)} aria-current={currentPage === id ? 'page' : undefined} className={`flex min-h-11 w-full items-center rounded-lg px-3 text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] ${currentPage === id ? 'bg-[#FBF8F0] font-semibold text-[#102A43] dark:bg-white/10 dark:text-white' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10'}`}>{label}</button>)}
            <a href="/login" className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-[#102A43] hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-white/10">Sign In</a>
            <button onClick={() => { setMobileMenuOpen(false); onBookNow(); }} className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#D4A853] px-4 py-3 text-base font-bold text-[#102A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43] focus-visible:ring-offset-2"><Sparkles size={16} aria-hidden="true" />Book Now<ArrowRight size={17} aria-hidden="true" /></button>
          </nav>
        </motion.div>}
      </AnimatePresence>
    </motion.header>
  );
};
