import React from 'react';
import { createRoot } from 'react-dom/client';
import { ManagementApp } from '../src/ManagementApp';
import '../../frontend/src/index.css';
import { ThemeProvider } from '../../frontend/src/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../frontend/src/contexts/ThemeContext';

const ManagementThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return <button onClick={toggleTheme} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-slate-300 bg-white text-[#102A43] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] dark:border-slate-600 dark:bg-slate-800 dark:text-white">
    {isDarkMode ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
  </button>;
};

createRoot(document.getElementById('root')!).render(<React.StrictMode><ThemeProvider><ManagementApp/><ManagementThemeToggle/></ThemeProvider></React.StrictMode>);
