'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  useEffect(() => {
    try {
      const cookieTheme = document.cookie
        .split('; ')
        .find(value => value.startsWith('meraki-theme='))
        ?.split('=')[1];
      const savedTheme = cookieTheme || window.localStorage.getItem('theme');
      setIsDarkMode(savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } finally {
      setPreferenceLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!preferenceLoaded) return;
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = isDarkMode ? 'dark' : 'light';
    try {
      const preference = isDarkMode ? 'dark' : 'light';
      window.localStorage.setItem('theme', preference);
      document.cookie = `meraki-theme=${preference}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {
      // Theme still works for this session even if the preference cannot persist.
    }
  }, [isDarkMode, preferenceLoaded]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
