import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Smartphone,
  Palette,
  Lock,
  Info,
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
  KeyRound,
  RotateCcw,
  Clock,
  Eye,
  Volume2,
  Sliders,
} from 'lucide-react';
import { AppSettings, AutoLockTimeout, ThemeOption, DisappearingMessageDefault } from '../../../types/settings';
import { settingsService } from '../../../services/settings/settingsService';
import { PrivateSection } from '../../../types/app';

interface SettingsViewProps {
  onNavigateToSection: (section: PrivateSection) => void;
}

type SettingsTab =
  | 'profile'
  | 'privacy'
  | 'notifications'
  | 'devices'
  | 'appearance'
  | 'private_mode'
  | 'about';

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigateToSection }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('privacy');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const triggerSaveNotification = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const handleUpdatePrivacy = async (field: keyof AppSettings['privacy'], value: any) => {
    if (!settings) return;
    const updated = await settingsService.updatePrivacy({ [field]: value });
    setSettings(prev => (prev ? { ...prev, privacy: updated } : null));
    triggerSaveNotification();
  };

  const handleUpdateNotifications = async (field: keyof AppSettings['notifications'], value: any) => {
    if (!settings) return;
    const updated = await settingsService.updateNotifications({ [field]: value });
    setSettings(prev => (prev ? { ...prev, notifications: updated } : null));
    triggerSaveNotification();
  };

  const handleUpdateAppearance = async (field: keyof AppSettings['appearance'], value: any) => {
    if (!settings) return;
    const updated = await settingsService.updateAppearance({ [field]: value });
    setSettings(prev => (prev ? { ...prev, appearance: updated } : null));
    triggerSaveNotification();
  };

  const handleUpdateSecurity = async (field: keyof AppSettings['security'], value: any) => {
    if (!settings) return;
    const updated = await settingsService.updateSecurity({ [field]: value });
    setSettings(prev => (prev ? { ...prev, security: updated } : null));
    triggerSaveNotification();
  };

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const settingCategories: Array<{ id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'profile', label: 'Profile Identity', icon: User },
    { id: 'privacy', label: 'Privacy & Cryptography', icon: Shield },
    { id: 'notifications', label: 'Tactical Alerts', icon: Bell },
    { id: 'devices', label: 'Authorized Sessions', icon: Smartphone },
    { id: 'appearance', label: 'Visual Interface', icon: Palette },
    { id: 'private_mode', label: 'Private Mode & Security', icon: Lock },
    { id: 'about', label: 'System & Specifications', icon: Info },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full max-w-5xl mx-auto w-full overflow-hidden">
      
      {/* Category Nav - Horizontal bar on mobile, Left rail on desktop */}
      <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-zinc-800/80 p-3 shrink-0 bg-zinc-950/40">
        <h2 className="hidden md:block text-xs font-mono uppercase tracking-wider text-zinc-500 px-3 py-2">
          Configuration
        </h2>
        <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          {settingCategories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (cat.id === 'profile') {
                    onNavigateToSection('profile');
                  } else {
                    setActiveTab(cat.id);
                  }
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Settings Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        
        {/* Saved feedback toast */}
        {savedBanner && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-xl animate-in fade-in slide-in-from-top-2">
            <Check className="w-3.5 h-3.5" />
            <span>Preferences Updated</span>
          </div>
        )}

        {/* Tab 1: Privacy */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold font-display text-zinc-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Privacy & Cryptography</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Manage metadata leakage prevention, read confirmation, and peer IP protection.
              </p>
            </div>

            <div className="space-y-3">
              {/* Read Receipts */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Cryptographic Delivery Confirmations</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Send end-to-end delivery signatures when messages are opened.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdatePrivacy('readReceipts', !settings.privacy.readReceipts)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.privacy.readReceipts ? 'bg-cyan-500' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                      settings.privacy.readReceipts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Block Screenshots & DOM Inspection */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Screen Blur on Focus Loss</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Automatically obscure private content when the browser window loses foreground focus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdatePrivacy('blockScreenshots', !settings.privacy.blockScreenshots)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.privacy.blockScreenshots ? 'bg-cyan-500' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                      settings.privacy.blockScreenshots ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Default Ephemeral Timer */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Default Ephemeral Message Burn Timer</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Automated timer after which messages are scrubbed from local memory on both nodes.
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['off', '24h', '7d', '30d'] as DisappearingMessageDefault[]).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleUpdatePrivacy('defaultDisappearingTimer', val)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono uppercase transition-all border ${
                        settings.privacy.defaultDisappearingTimer === val
                          ? 'bg-zinc-800 text-zinc-100 border-cyan-500/50 shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {val === 'off' ? 'Off' : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Peer-to-Peer IP Shield (Relay Always) */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Force Encrypted TURN Relay for WebRTC</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Conceal your peer IP address by proxying calls through zero-log relay servers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdatePrivacy('peerToPeerDirectIP', !settings.privacy.peerToPeerDirectIP)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.privacy.peerToPeerDirectIP ? 'bg-cyan-500' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                      settings.privacy.peerToPeerDirectIP ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold font-display text-zinc-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>Tactical Notifications</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Configure subtle audio alerts and stealth banner notifications.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Tactical Audio Cues</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Play discrete acoustic chime on incoming messages and call handshakes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateNotifications('soundEnabled', !settings.notifications.soundEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.notifications.soundEnabled ? 'bg-cyan-500' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                      settings.notifications.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Disguised Stealth Banners</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Disguise incoming message notifications as system game updates ("Vortex Grid sync complete").
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateNotifications('stealthBanners', !settings.notifications.stealthBanners)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.notifications.stealthBanners ? 'bg-cyan-500' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                      settings.notifications.stealthBanners ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Devices / Sessions */}
        {activeTab === 'devices' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold font-display text-zinc-100 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Devices & Enclave Sessions</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Inspect active sessions and access device management controls.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Full Session Management in Profile</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Inspect IP addresses, geographical hops, and selectively terminate node access.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToSection('profile')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Open Authorized Node Manager</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Appearance */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold font-display text-zinc-100 flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>Visual Interface & Theme</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Customize subtle palette accents, motion preferences, and text density.
              </p>
            </div>

            <div className="space-y-3">
              {/* Palette Accent Options */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Enclave Color Scheme</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Sophisticated cinematic visual tones.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'tactical-dark' as ThemeOption, label: 'Tactical Cyan / Dark', desc: 'Default stealth grid' },
                    { id: 'void-black' as ThemeOption, label: 'Void Obsidian', desc: 'Zero-glow pure black' },
                    { id: 'cyber-violet' as ThemeOption, label: 'Deep Cyber Violet', desc: 'Subtle atmospheric tint' },
                  ].map(thm => (
                    <button
                      key={thm.id}
                      type="button"
                      onClick={() => handleUpdateAppearance('theme', thm.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.appearance.theme === thm.id
                          ? 'bg-zinc-800 border-cyan-500/60 text-zinc-100 shadow-sm'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-semibold">{thm.label}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{thm.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Reduced Motion / Fast Transitions</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Disables smooth ambient animations for instantaneous tactical responses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateAppearance('reducedMotion', !settings.appearance.reducedMotion)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.appearance.reducedMotion ? 'bg-cyan-500' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                      settings.appearance.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Private Mode & Security */}
        {activeTab === 'private_mode' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold font-display text-zinc-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Private Mode Security & Panic Controls</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Configure auto-lock intervals, panic switch hotkeys, and memory destruction rules.
              </p>
            </div>

            <div className="space-y-3">
              {/* Auto Lock Duration */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-200">Inactivity Auto-Lock Timeout</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Automatically wipe private session after period of no mouse/keyboard events.
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '1 Minute', value: 60 as AutoLockTimeout },
                    { label: '5 Minutes', value: 300 as AutoLockTimeout },
                    { label: '15 Minutes', value: 900 as AutoLockTimeout },
                    { label: '30 Minutes', value: 1800 as AutoLockTimeout },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleUpdateSecurity('autoLockSeconds', opt.value)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono transition-all border ${
                        settings.security.autoLockSeconds === opt.value
                          ? 'bg-zinc-800 text-zinc-100 border-cyan-500/50 shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Wipe on Panic Switch */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Panic Switch Memory Purge [Esc]</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Zero out all in-memory keys and immediately drop DOM tree back to Tic-Tac-Toe.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateSecurity('wipeStateOnPanic', !settings.security.wipeStateOnPanic)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.security.wipeStateOnPanic ? 'bg-rose-500' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                      settings.security.wipeStateOnPanic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* No Password Reset reminder */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200">Zero-Recovery Architecture Policy: </span>
                  Private passcodes are salted using 16 random cryptographic bytes and evaluated via 100,000 PBKDF2 rounds. There is strictly no password recovery mechanism, ensuring zero unauthorized decryption vectors.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: About */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold font-display text-zinc-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>System Architecture & Specifications</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Technical overview of cryptographic primitives and architecture boundaries.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 font-mono text-xs text-zinc-400">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-200">Enclave Version:</span>
                <span className="text-cyan-400">v2.1.0-milestone2</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-200">Camouflage Host:</span>
                <span className="text-zinc-300">Vortex Grid (Tic-Tac-Toe AI Engine)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-200">Key Derivation (KDF):</span>
                <span className="text-zinc-300">PBKDF2 SHA-256 (100,000 iterations)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-200">Database Adapter Boundary:</span>
                <span className="text-emerald-400">Supabase Pluggable Service Interface</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-200">UI DOM Isolation:</span>
                <span className="text-emerald-400">Zero CSS Hidden Bleed (Full Unmount)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
