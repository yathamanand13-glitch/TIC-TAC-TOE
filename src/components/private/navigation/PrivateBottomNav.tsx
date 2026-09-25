import React from 'react';
import { MessageSquare, PhoneCall, MapPin, User, Settings } from 'lucide-react';
import { PrivateSection } from '../../../types/app';

interface PrivateBottomNavProps {
  activeSection: PrivateSection;
  onSelectSection: (section: PrivateSection) => void;
  unreadCount?: number;
  missedCallsCount?: number;
}

export const PrivateBottomNav: React.FC<PrivateBottomNavProps> = ({
  activeSection,
  onSelectSection,
  unreadCount = 2,
  missedCallsCount = 0,
}) => {
  const navItems = [
    {
      id: 'chats' as PrivateSection,
      label: 'Chats',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'calls' as PrivateSection,
      label: 'Calls',
      icon: PhoneCall,
      badge: missedCallsCount > 0 ? missedCallsCount : undefined,
    },
    {
      id: 'map' as PrivateSection,
      label: 'Radar',
      icon: MapPin,
    },
    {
      id: 'profile' as PrivateSection,
      label: 'Profile',
      icon: User,
    },
    {
      id: 'settings' as PrivateSection,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around select-none shadow-2xl"
      aria-label="Mobile Navigation"
    >
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectSection(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 transition-transform" />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold bg-cyan-500 text-zinc-950">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-1">{item.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
