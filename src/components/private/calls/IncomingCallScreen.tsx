import React from 'react';
import { Phone, PhoneOff, Video, ShieldCheck } from 'lucide-react';
import { CallSession } from '../../../types/call';

interface IncomingCallScreenProps {
  session: CallSession;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
  session,
  onAccept,
  onDecline,
}) => {
  const isVideo = session.type.includes('video');
  const caller = session.initiator;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-10 select-none animate-in fade-in">
      
      {/* Top Protocol Security Meta */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-cyan-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Incoming WebRTC Handshake Request</span>
      </div>

      {/* Center Caller Profile & Ring Animation */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          {/* Animated concentric ringing rings */}
          <div className="absolute inset-0 -m-4 rounded-full border border-cyan-500/20 animate-ping [animation-duration:2s]" />
          <div className="absolute inset-0 -m-8 rounded-full border border-cyan-500/10 animate-ping [animation-duration:3s]" />

          <div
            className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${
              caller.avatarColor || 'from-cyan-500 to-blue-600'
            } flex items-center justify-center text-4xl font-bold text-white shadow-2xl ring-4 ring-zinc-900 relative z-10`}
          >
            {caller.name.charAt(0)}
          </div>
        </div>

        <h1 className="text-2xl font-bold font-display text-zinc-100">{caller.name}</h1>
        <p className="text-xs font-mono text-zinc-400 mt-1">@{caller.username}</p>

        <div className="mt-4 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-cyan-300 flex items-center gap-1.5">
          {isVideo ? <Video className="w-3.5 h-3.5 text-cyan-400" /> : <Phone className="w-3.5 h-3.5 text-cyan-400" />}
          <span>Incoming {isVideo ? 'Video Mesh' : 'Audio Transmission'}...</span>
        </div>
      </div>

      {/* Bottom Accept / Decline Actions */}
      <div className="flex items-center gap-8 sm:gap-16 w-full max-w-sm justify-center mb-6">
        {/* Decline */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onDecline}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all"
            title="Decline Transmission"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
          <span className="text-xs font-mono text-rose-300">Decline</span>
        </div>

        {/* Accept */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all"
            title="Accept Transmission"
          >
            {isVideo ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
          </button>
          <span className="text-xs font-mono text-emerald-400 font-bold">Accept</span>
        </div>
      </div>

    </div>
  );
};
