import React, { useState, useEffect } from 'react';
import {
  Shield,
  Edit3,
  Smartphone,
  Eye,
  Lock,
  Copy,
  Check,
  Key,
  Radio,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, PresenceState, LastSeenPrivacy, DeviceSession } from '../../../types/profile';
import { profileService } from '../../../services/profile/profileService';
import { sessionService } from '../../../services/profile/sessionService';
import { EditProfileModal } from './EditProfileModal';
import { SessionManagerModal } from './SessionManagerModal';
import { PrivateSection } from '../../../types/app';

interface ProfileViewProps {
  onNavigateToSection: (section: PrivateSection) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToSection }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const loadData = async () => {
    const prof = await profileService.getProfile();
    setProfile(prof);
    const sess = await sessionService.getActiveSessions();
    setSessions(sess);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePresenceChange = async (presence: PresenceState) => {
    if (!profile) return;
    await profileService.updatePresence(presence);
    setProfile(prev => (prev ? { ...prev, presence } : null));
  };

  const handleLastSeenChange = async (lastSeenPrivacy: LastSeenPrivacy) => {
    if (!profile) return;
    await profileService.updateLastSeenPrivacy(lastSeenPrivacy);
    setProfile(prev => (prev ? { ...prev, lastSeenPrivacy } : null));
  };

  const handleSaveProfile = async (updates: Partial<UserProfile>) => {
    const updated = await profileService.updateProfile(updates);
    setProfile(updated);
  };

  const handleTerminateSession = async (sessionId: string) => {
    await sessionService.terminateSession(sessionId);
    const updated = await sessionService.getActiveSessions();
    setSessions(updated);
  };

  const handleTerminateAllOthers = async () => {
    await sessionService.terminateAllOtherSessions();
    const updated = await sessionService.getActiveSessions();
    setSessions(updated);
  };

  const copyPublicKey = () => {
    if (!profile?.publicKeyFingerprint) return;
    navigator.clipboard.writeText(profile.publicKeyFingerprint);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getPresenceBadge = (presence: PresenceState) => {
    switch (presence) {
      case 'online':
        return { label: 'Online / Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'stealth':
        return { label: 'Stealth / Incognito', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
      case 'away':
        return { label: 'Standby / Away', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'busy':
        return { label: 'Do Not Disturb', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    }
  };

  const currentPresence = getPresenceBadge(profile.presence);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full space-y-6">
      
      {/* Profile Header Hero Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl overflow-hidden">
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Presence Indicator */}
          <div className="relative shrink-0">
            <div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${profile.avatarColor} flex items-center justify-center text-3xl font-extrabold text-white shadow-2xl ring-4 ring-zinc-900`}
            >
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-zinc-900 flex items-center justify-center shadow-md ${
                profile.presence === 'online'
                  ? 'bg-emerald-400'
                  : profile.presence === 'stealth'
                  ? 'bg-indigo-400'
                  : profile.presence === 'away'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
          </div>

          {/* User Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-zinc-100 flex items-center justify-center sm:justify-start gap-2">
                  <span>{profile.displayName}</span>
                  <Shield className="w-4 h-4 text-cyan-400" />
                </h1>
                <div className="text-xs font-mono text-cyan-400/90 mt-0.5">
                  @{profile.username}
                </div>
              </div>

              {/* Edit Profile Action */}
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="self-center sm:self-start flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/60 text-xs font-semibold transition-colors shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Status message */}
            {profile.statusMessage && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300">
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{profile.statusMessage}</span>
              </div>
            )}

            {/* Bio / About */}
            <p className="mt-3 text-xs text-zinc-400 leading-relaxed max-w-xl">
              {profile.about}
            </p>
          </div>
        </div>
      </div>

      {/* Online / Presence State Control */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Live Presence Mode</h2>
          </div>
          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${currentPresence.color}`}>
            {currentPresence.label}
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          Control how your cryptographic signal broadcasts to peer nodes across the encrypted mesh network.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {(['online', 'stealth', 'away', 'busy'] as PresenceState[]).map(st => {
            const isSelected = profile.presence === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => handlePresenceChange(st)}
                className={`py-2 px-3 rounded-xl text-xs font-medium capitalize flex items-center justify-center gap-2 border transition-all ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 border-cyan-500/50 shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    st === 'online'
                      ? 'bg-emerald-400'
                      : st === 'stealth'
                      ? 'bg-indigo-400'
                      : st === 'away'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span>{st}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Privacy & Last Seen Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last Seen Privacy */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Eye className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Last Seen Visibility</h2>
            </div>
            <p className="text-xs text-zinc-400">
              Determine who can observe when your node was last connected to the mesh relay.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-2">
            {(['everyone', 'contacts', 'nobody'] as LastSeenPrivacy[]).map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleLastSeenChange(val)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono capitalize transition-all border ${
                  profile.lastSeenPrivacy === val
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Public Cryptographic Identity Key */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Key className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-100">ECC Safety Number</h2>
            </div>
            <p className="text-xs text-zinc-400">
              Cryptographic fingerprint used for out-of-band peer safety verification.
            </p>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-300 truncate mr-2">
              {profile.publicKeyFingerprint}
            </span>
            <button
              type="button"
              onClick={copyPublicKey}
              className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
              title="Copy key fingerprint"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Device & Session Management Quick Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-cyan-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span>Active Node Sessions</span>
              <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                {sessions.length} active
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage authorized devices, revoke remote tokens, or inspect network nodes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSessionsOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 text-xs font-semibold transition-colors shrink-0 shadow-sm"
        >
          <span>Manage Sessions</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Settings Jump Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900/90 to-zinc-900/50 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-200">Security & Privacy Settings</h3>
            <p className="text-[11px] text-zinc-400">Configure auto-lock timers, camouflage hotkeys, and appearance.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToSection('settings')}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
        >
          Go to Settings
        </button>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        profile={profile}
        onSave={handleSaveProfile}
        onClose={() => setIsEditOpen(false)}
      />

      {/* Session Management Modal */}
      <SessionManagerModal
        isOpen={isSessionsOpen}
        sessions={sessions}
        onTerminateSession={handleTerminateSession}
        onTerminateAllOthers={handleTerminateAllOthers}
        onRefresh={loadData}
        onClose={() => setIsSessionsOpen(false)}
      />

    </div>
  );
};
