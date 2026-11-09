import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Grid, MapPin, CalendarCheck, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t, bookings } = useApp();

  const activeBookingsCount = bookings.filter(b => b.status !== 'completed').length;

  interface NavItem {
    id: 'home' | 'services' | 'nearby' | 'bookings' | 'profile';
    label: string;
    icon: typeof Home;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'services', label: t.services, icon: Grid },
    { id: 'nearby', label: t.nearby, icon: MapPin },
    { id: 'bookings', label: t.bookings, icon: CalendarCheck, badge: activeBookingsCount },
    { id: 'profile', label: t.profile, icon: User },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#D9E0E7] shadow-level-3 mx-auto max-w-md w-full"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 relative min-h-[48px] touch-manipulation transition-all duration-200 group focus:outline-none"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={`transition-colors ${
                    isActive ? 'text-[#102A43]' : 'text-[#64748B] group-hover:text-[#102A43]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#D4A853] text-[#102A43] text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] h-4 flex items-center justify-center border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-[#102A43] font-semibold' : 'text-[#64748B]'
                }`}
              >
                {item.label}
              </span>
              {/* Warm Gold micro-indicator dot as specified in design system */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A853] mt-0.5 shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
