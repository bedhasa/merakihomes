import React from 'react';
import { ViewMode, Currency } from '../types';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  activeBookingCount: number;
  onNavLinkClick?: (page: string) => void;
  onBookServiceClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currency,
  setCurrency,
  activeBookingCount,
  onNavLinkClick,
  onBookServiceClick,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navLinks = [
    { label: 'Home', page: 'home' },
    { label: 'About Us', page: 'about' },
    { label: 'Services Catalog', page: 'services' },
    { label: 'Pricing & Plans', page: 'pricing' },
    { label: 'FAQ', page: 'faq' },
    { label: 'Contact', page: 'contact' },
  ];

  const handleNavClick = (page: string) => {
    setCurrentView('marketing');
    if (onNavLinkClick) onNavLinkClick(page);
  };
  return (
    <header id="main-header" className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Minimal Brand Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group" 
            onClick={() => setCurrentView('marketing')}
          >
            <div className="w-9 h-9 rounded-xl bg-golden-500 flex items-center justify-center text-slate-950 font-black shadow-xs group-hover:bg-golden-400 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-slate-100">
                  MERAKI <span className="text-golden-600 dark:text-golden-400 font-serif italic">HOMES</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                  Addis Ababa
                </span>
              </div>
            </div>
          </div>

          {/* Website Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                id={`btn-nav-${link.page}`}
                onClick={() => handleNavClick(link.page)}
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action */}
          <div className="flex items-center space-x-2.5">
            {/* Quick CTA */}
            <button
              onClick={onBookServiceClick}
              className="hidden sm:flex items-center space-x-1.5 bg-golden-500 hover:bg-golden-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all"
            >
              <span>Book Service</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-all"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1.5 border-t border-slate-100 dark:border-slate-700 scrollbar-none">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNavClick(link.page)}
              className="px-3 py-1 rounded-lg text-xs font-bold shrink-0 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-golden-100 dark:hover:bg-golden-900/30 hover:text-slate-900 dark:hover:text-golden-300 transition-all"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={onBookServiceClick}
            className="px-3 py-1 rounded-lg text-xs font-bold shrink-0 bg-golden-500 text-slate-950"
          >
            Book Service
          </button>
        </div>

      </div>
    </header>
  );
};
