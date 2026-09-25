import React, { useState } from 'react';
import { X, Check, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../../types/profile';

interface EditProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
  onClose: () => void;
}

const AVATAR_COLOR_GRADIENTS = [
  { id: 'cyan-blue', label: 'Cyan / Blue', value: 'from-cyan-500 to-blue-600' },
  { id: 'violet-indigo', label: 'Violet / Indigo', value: 'from-violet-500 to-indigo-600' },
  { id: 'emerald-teal', label: 'Emerald / Teal', value: 'from-emerald-500 to-teal-600' },
  { id: 'amber-orange', label: 'Amber / Rose', value: 'from-amber-500 to-rose-600' },
  { id: 'zinc-slate', label: 'Stealth Steel', value: 'from-zinc-400 to-zinc-700' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  profile,
  onSave,
  onClose,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [about, setAbout] = useState(profile.about);
  const [statusMessage, setStatusMessage] = useState(profile.statusMessage || '');
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = displayName.trim();
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!cleanName) {
      setError('Display name cannot be empty.');
      return;
    }

    if (cleanUser.length < 3) {
      setError('Username must be at least 3 alphanumeric characters.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        displayName: cleanName,
        username: cleanUser,
        about: about.trim(),
        statusMessage: statusMessage.trim(),
        avatarColor,
      });
      setIsSaving(false);
      onClose();
    } catch (err) {
      setIsSaving(false);
      setError('Failed to update profile: ' + (err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Edit Operator Profile</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Avatar Preview & Tone Selector */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2">Avatar Silhouette</label>
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-lg font-bold text-white shadow-lg shrink-0`}
              >
                {displayName ? displayName.charAt(0).toUpperCase() : 'N'}
              </div>
              <div className="flex-1">
                <span className="text-[11px] text-zinc-500 block mb-1.5">Color Vector:</span>
                <div className="flex items-center gap-2">
                  {AVATAR_COLOR_GRADIENTS.map(grad => (
                    <button
                      key={grad.id}
                      type="button"
                      onClick={() => setAvatarColor(grad.value)}
                      title={grad.label}
                      className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${grad.value} transition-transform ${
                        avatarColor === grad.value
                          ? 'ring-2 ring-cyan-400 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={32}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              placeholder="e.g. Commander Nova"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Username Handle</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase())}
                maxLength={24}
                className="w-full pl-7 pr-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                placeholder="handle_name"
                required
              />
            </div>
          </div>

          {/* Status Message */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Current Signal / Status</label>
            <input
              type="text"
              value={statusMessage}
              onChange={e => setStatusMessage(e.target.value)}
              maxLength={60}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              placeholder="e.g. Encrypted link · High integrity"
            />
          </div>

          {/* About / Bio */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">About / Bio</label>
            <textarea
              value={about}
              onChange={e => setAbout(e.target.value)}
              rows={3}
              maxLength={180}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none"
              placeholder="Describe your security posture or operator bio..."
            />
            <div className="text-right text-[10px] text-zinc-500 font-mono mt-1">
              {about.length}/180
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
