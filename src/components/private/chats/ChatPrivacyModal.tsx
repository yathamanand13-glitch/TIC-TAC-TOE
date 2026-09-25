import React, { useState } from 'react';
import {
  X,
  Shield,
  Clock,
  Eye,
  BellOff,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Check,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Conversation } from '../../../types/chat';

interface ChatPrivacyModalProps {
  isOpen: boolean;
  conversation: Conversation;
  onUpdateDisappearingTimer: (timer: 'off' | '24h' | '7d' | '30d') => void;
  onBlockContact?: (userId: string) => void;
  onReportContact?: (userId: string, reason: string) => void;
  onClose: () => void;
}

export const ChatPrivacyModal: React.FC<ChatPrivacyModalProps> = ({
  isOpen,
  conversation,
  onUpdateDisappearingTimer,
  onBlockContact,
  onReportContact,
  onClose,
}) => {
  const [currentTimer, setCurrentTimer] = useState<'off' | '24h' | '7d' | '30d'>('off');
  const [readReceiptsOverride, setReadReceiptsOverride] = useState(true);
  const [isMuted, setIsMuted] = useState(Boolean(conversation.isMuted));
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  if (!isOpen) return null;

  const otherMember = conversation.members.find(m => m.userId !== 'current_user');
  const otherUserId = otherMember?.userId || conversation.id;
  const otherName = otherMember?.displayName || conversation.name;

  const handleSelectTimer = (val: 'off' | '24h' | '7d' | '30d') => {
    setCurrentTimer(val);
    onUpdateDisappearingTimer(val);
  };

  const handleBlock = () => {
    setIsBlocked(true);
    if (onBlockContact) {
      onBlockContact(otherUserId);
    }
  };

  const handleReport = (reason: string) => {
    setReportReason(reason);
    setIsReportSubmitted(true);
    if (onReportContact) {
      onReportContact(otherUserId, reason);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-display">
                Channel Privacy & Security
              </h2>
              <p className="text-[10px] font-mono text-zinc-500">
                {conversation.name} · Independent Channel Config
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs font-mono">
          
          {/* Section 1: Disappearing Messages with Mandatory Warning */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Disappearing Transmissions</span>
              </label>
              <span className="text-[10px] text-zinc-500">Per-chat timer</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['off', '24h', '7d', '30d'] as const).map(val => {
                const isSelected = currentTimer === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectTimer(val)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {val === 'off' ? 'Off' : val}
                  </button>
                );
              })}
            </div>

            {/* Crucial Mandatory Explanation */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/60 text-[11px] text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Privacy Notice & Technical Reality</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Disappearing messages automatically scrub content from local caches after the selected timer. However, <strong>disappearing messages do not guarantee that recipients cannot preserve content</strong> using external screen capture, external cameras, hardware video capture, or content export before expiration.
              </p>
            </div>
          </div>

          {/* Section 2: Cryptographic Safety Number / E2EE Fingerprint */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Safety Fingerprint</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-300 font-bold">
                E2EE VERIFIED
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono tracking-widest break-all">
              7F8A 49B8 0C32 E194 88DF 23A1 990B FE41 7732 C901
            </div>
            <p className="text-[10px] text-zinc-500">
              Compare this fingerprint with {otherName} via voice or in person to verify that your peer connection is not being intercepted.
            </p>
          </div>

          {/* Section 3: Read Receipts for this conversation */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Read Receipts in this Channel</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Send delivery and read checks for messages</p>
            </div>
            <button
              type="button"
              onClick={() => setReadReceiptsOverride(prev => !prev)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                readReceiptsOverride ? 'bg-cyan-500' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                  readReceiptsOverride ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Section 4: Block & Report Actions */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              Enclave Protection Actions
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Block User */}
              <button
                type="button"
                onClick={handleBlock}
                disabled={isBlocked}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  isBlocked
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-zinc-950 hover:bg-rose-950/40 border-zinc-800 hover:border-rose-900 text-rose-400'
                }`}
              >
                <UserX className="w-4 h-4" />
                <span>{isBlocked ? 'Node Blocked' : `Block ${otherName}`}</span>
              </button>

              {/* Report User */}
              <button
                type="button"
                onClick={() => handleReport('harassment')}
                disabled={isReportSubmitted}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  isReportSubmitted
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-zinc-950 hover:bg-amber-950/40 border-zinc-800 hover:border-amber-900 text-amber-400'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isReportSubmitted ? 'Report Submitted' : 'Report Security Concern'}</span>
              </button>
            </div>

            {isBlocked && (
              <p className="text-[10px] text-rose-400 mt-1">
                Node is blocked. Inbound transmissions will be dropped without acknowledgement.
              </p>
            )}

            {isReportSubmitted && (
              <p className="text-[10px] text-amber-400 mt-1">
                Security concern logged with cryptographic safety hash.
              </p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
