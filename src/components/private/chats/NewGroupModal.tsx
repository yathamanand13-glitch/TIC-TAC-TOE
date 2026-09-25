import React, { useState } from 'react';
import { X, Users, Check, Sparkles, AlertCircle } from 'lucide-react';
import { INITIAL_MEMBERS } from '../../../services/chat/chatService';

interface NewGroupModalProps {
  isOpen: boolean;
  onCreateGroup: (name: string, description: string, color: string, members: string[]) => void;
  onClose: () => void;
}

const GROUP_GRADIENTS = [
  { id: 'violet-indigo', label: 'Violet / Indigo', value: 'from-violet-500 to-indigo-700' },
  { id: 'cyan-blue', label: 'Cyan / Blue', value: 'from-cyan-500 to-blue-700' },
  { id: 'emerald-teal', label: 'Emerald / Teal', value: 'from-emerald-500 to-teal-700' },
  { id: 'rose-red', label: 'Crimson / Rose', value: 'from-rose-500 to-red-700' },
  { id: 'amber-orange', label: 'Amber / Bronze', value: 'from-amber-500 to-orange-700' },
];

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onCreateGroup,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarColor, setAvatarColor] = useState(GROUP_GRADIENTS[0].value);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([
    'usr_ghost_01',
    'usr_cipher_02',
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableContacts = INITIAL_MEMBERS.filter(m => m.userId !== 'current_user');

  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please provide a tactical group name.');
      return;
    }
    if (selectedMemberIds.length === 0) {
      setError('Please select at least one participating node.');
      return;
    }

    onCreateGroup(cleanName, description.trim(), avatarColor, selectedMemberIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Assemble Tactical Cell (Group)</h2>
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
          {/* Avatar preview & color */}
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-lg font-bold text-white shadow-lg shrink-0`}
            >
              {name ? name.charAt(0).toUpperCase() : <Users className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <span className="text-[11px] text-zinc-500 block mb-1.5 font-mono">Cell Insignia Tone:</span>
              <div className="flex items-center gap-2">
                {GROUP_GRADIENTS.map(grad => (
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

          {/* Group Name */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Group / Cell Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              placeholder="e.g. Apex Recon Vanguard"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Mission Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              maxLength={120}
              placeholder="Purpose of this encrypted tactical channel..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none font-mono"
            />
          </div>

          {/* Select Members */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-zinc-400">
                Authorized Members ({selectedMemberIds.length} selected)
              </label>
            </div>
            <div className="space-y-1 bg-zinc-950/70 p-2 rounded-xl border border-zinc-800 max-h-40 overflow-y-auto">
              {availableContacts.map(contact => {
                const isSelected = selectedMemberIds.includes(contact.userId);
                return (
                  <button
                    key={contact.userId}
                    type="button"
                    onClick={() => toggleMember(contact.userId)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      isSelected ? 'bg-zinc-800/80 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md bg-gradient-to-tr ${
                          contact.avatarColor || 'from-cyan-500 to-blue-600'
                        } flex items-center justify-center text-[10px] font-bold text-white`}
                      >
                        {contact.displayName.charAt(0)}
                      </div>
                      <span className="font-medium">{contact.displayName}</span>
                      <span className="text-[10px] font-mono text-zinc-500">@{contact.username}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-500 text-zinc-950'
                          : 'border-zinc-700 bg-zinc-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
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
              className="flex-1 py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Establish Group</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
