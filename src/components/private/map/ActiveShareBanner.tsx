import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Clock, StopCircle, Radio } from 'lucide-react';
import { LocationShareSession } from '../../../types/location';

interface ActiveShareBannerProps {
  session: LocationShareSession;
  onStopSharing: () => void;
}

export const ActiveShareBanner: React.FC<ActiveShareBannerProps> = ({
  session,
  onStopSharing,
}) => {
  const [remainingSecs, setRemainingSecs] = useState<number>(() => {
    return Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
  });

  useEffect(() => {
    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
      setRemainingSecs(diff);
      if (diff === 0) {
        onStopSharing();
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [session.expiresAt, onStopSharing]);

  const formatRemaining = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mx-3 sm:mx-6 my-2 p-3 sm:p-4 rounded-2xl bg-zinc-950/95 border border-emerald-500/50 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono animate-in slide-in-from-top-2">
      
      {/* Left: Active Pulse and Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-100 font-bold text-xs">
              Live Location Sharing Active
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              BROADCASTING
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-cyan-400">
              <Clock className="w-3 h-3" />
              <span>Expires in {formatRemaining(remainingSecs)}</span>
            </span>

            <span className="text-zinc-600">·</span>

            <span className="flex items-center gap-1.5 text-zinc-300">
              <Users className="w-3 h-3 text-zinc-400" />
              <span>Visible to:</span>
              <span className="text-zinc-100 font-semibold">
                {session.recipients.map(r => r.name.split(' ')[0]).join(', ')}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Prominent Stop Button */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <button
          type="button"
          onClick={onStopSharing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95"
        >
          <StopCircle className="w-4 h-4" />
          <span>Stop Sharing Location</span>
        </button>
      </div>

    </div>
  );
};
