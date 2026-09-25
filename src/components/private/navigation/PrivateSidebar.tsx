import React from 'react';
import {
  MessageSquare,
  PhoneCall,
  MapPin,
  User,
  Settings,
  Shield,
  LogOut,
  Lock,
} from 'lucide-react';
import { PrivateSection } from '../../../types/app';
import { UserProfile } from '../../../types/profile';

interface PrivateSidebarProps {
  activeSection: PrivateSection;
  onSelectSection: (section: PrivateSection) => void;
  profile: UserProfile | null;
  onLock: () => void;
  onPanicExit: () => void;
  unreadCount?: number;
  missedCallsCount?: number;
}

export const PrivateSidebar: React.FC<PrivateSidebarProps> = ({
  activeSection,
  onSelectSection,
  profile,
  onLock,
  onPanicExit,
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
      label: 'Radar Map',
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

  const getPresenceColor = (presence?: string) => {
    switch (presence) {
      case 'online':
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
      case 'stealth':
        return 'bg-indigo-400';
      case 'away':
        return 'bg-amber-400';
      case 'busy':
        return 'bg-rose-400';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shrink-0 h-full select-none justify-between">
      {/* Upper Brand / Security Identity */}
      <div>
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/70 flex items-center justify-center text-cyan-400 shadow-inner">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-tight text-zinc-100">
                  AEGIS ENCLAVE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  E2EE
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500">Milestone 2 · Secure Shell</p>
            </div>
          </div>
        </div>

        {/* Primary Navigation List */}
        <nav className="p-3 space-y-1.5" aria-label="Private Application Navigation">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/70 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Lower Profile & Panic Zone */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2 bg-zinc-950/40">
        {/* User Mini Bar */}
        <button
          type="button"
          onClick={() => onSelectSection('profile')}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900/80 transition-colors text-left group"
        >
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                profile?.avatarColor || 'from-cyan-500 to-blue-600'
              } flex items-center justify-center text-xs font-bold text-white shadow-sm`}
            >
              {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'N'}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${getPresenceColor(
                profile?.presence
              )}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-200 truncate group-hover:text-cyan-300 transition-colors">
              {profile?.displayName || 'Commander Nova'}
            </div>
            <div className="text-[11px] font-mono text-zinc-500 truncate">
              @{profile?.username || 'nova_spectre'}
            </div>
          </div>
        </button>

        {/* Security Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onLock}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-[11px] font-medium transition-colors"
            title="Lock session and return to game"
          >
            <Lock className="w-3 h-3 text-zinc-400" />
            <span>Lock</span>
          </button>

          <button
            type="button"
            onClick={onPanicExit}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-900/70 text-rose-200 text-[11px] font-semibold transition-colors"
            title="Immediate session wipe (Hotkey: Esc)"
          >
            <LogOut className="w-3 h-3 text-rose-400" />
            <span>Panic</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
