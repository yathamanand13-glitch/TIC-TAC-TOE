import React, { useState } from 'react';
import {
  X,
  Navigation,
  Clock,
  Users,
  ShieldAlert,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';
import { LiveShareDuration, LocationShareRecipient } from '../../../types/location';

interface StartLiveShareModalProps {
  isOpen: boolean;
  onStartShare: (duration: LiveShareDuration, recipients: LocationShareRecipient[]) => void;
  onClose: () => void;
}

const AVAILABLE_CONTACTS: LocationShareRecipient[] = [
  {
    id: 'usr_ghost_01',
    name: 'Ghost Sector Node',
    username: 'ghost_node',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'usr_cipher_02',
    name: 'Cipher Analyst V',
    username: 'cipher_analyst',
    avatarColor: 'from-violet-500 to-indigo-600',
  },
  {
    id: 'usr_recon_03',
    name: 'Recon Sentinel',
    username: 'recon_sentinel',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'usr_echo_04',
    name: 'Echo Vanguard',
    username: 'echo_vanguard',
    avatarColor: 'from-amber-500 to-orange-600',
  },
];

export const StartLiveShareModal: React.FC<StartLiveShareModalProps> = ({
  isOpen,
  onStartShare,
  onClose,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<LiveShareDuration>('15m');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<Set<string>>(
    new Set(['usr_ghost_01', 'usr_cipher_02'])
  );

  if (!isOpen) return null;

  const toggleRecipient = (id: string) => {
    setSelectedRecipientIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleStart = () => {
    const recipients = AVAILABLE_CONTACTS.filter(c => selectedRecipientIds.has(c.id));
    if (recipients.length === 0) return;
    onStartShare(selectedDuration, recipients);
    onClose();
  };

  const durationOptions: Array<{ id: LiveShareDuration; label: string; desc: string }> = [
    { id: '15m', label: '15 Minutes', desc: 'Short rendezvous / quick tactical sync' },
    { id: '1h', label: '1 Hour', desc: 'Standard field patrol / in-transit rendezvous' },
    { id: '8h', label: '8 Hours', desc: 'Extended mission / full-day operational sharing' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-display">
                Share Ephemeral Live Location
              </h2>
              <p className="text-[10px] font-mono text-zinc-400">
                End-to-End Encrypted · Auto-Expiring Real-Time Coordinates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs font-mono">
          
          {/* Step 1: Select Duration (Exactly 15m, 1h, 8h) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Select Sharing Duration</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {durationOptions.map(opt => {
                const isSelected = selectedDuration === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedDuration(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-sm ring-1 ring-cyan-400/30'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-zinc-200'}`}>
                        {opt.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-tight">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Authorized Recipients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Authorized Recipients</span>
              </label>
              <span className="text-[10px] text-zinc-500">
                {selectedRecipientIds.size} nodes authorized
              </span>
            </div>

            <div className="space-y-1.5">
              {AVAILABLE_CONTACTS.map(contact => {
                const isChecked = selectedRecipientIds.has(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => toggleRecipient(contact.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-zinc-800/80 border-cyan-500/50 text-zinc-100'
                        : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${contact.avatarColor} flex items-center justify-center text-xs font-bold text-white shadow-sm`}
                      >
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-200">{contact.name}</p>
                        <p className="text-[10px] text-zinc-500">@{contact.username}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-cyan-500 border-cyan-400 text-zinc-950'
                          : 'border-zinc-700 bg-zinc-900'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy & Security Contract Notice */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-[11px] space-y-1.5 text-zinc-400">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Ephemeral Privacy Policy</span>
            </div>
            <p>
              • <strong>WHO:</strong> Only the {selectedRecipientIds.size} designated nodes above can decode your position.
            </p>
            <p>
              • <strong>HOW LONG:</strong> Broadcast automatically ceases and self-destructs after{' '}
              <span className="text-zinc-200 font-bold">
                {selectedDuration === '15m' ? '15 minutes' : selectedDuration === '1h' ? '1 hour' : '8 hours'}
              </span>.
            </p>
            <p>
              • <strong>HOW TO STOP:</strong> A persistent red "Stop Sharing" button is displayed on the map at all times.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStart}
            disabled={selectedRecipientIds.size === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:pointer-events-none text-zinc-950 font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            <span>Start Live Sharing</span>
          </button>
        </div>

      </div>
    </div>
  );
};
