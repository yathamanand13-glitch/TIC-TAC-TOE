import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, Swords, ShieldAlert } from 'lucide-react';
import { soundFX } from '../../lib/soundFX';
import { ApplicationMode } from '../../types/app';

interface HeaderProps {
  mode: ApplicationMode;
  onOpenPrivateMode: () => void;
  onPanicExit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onOpenPrivateMode,
  onPanicExit,
}) => {
  const [isMuted, setIsMuted] = useState(() => soundFX.getMuted());

  const handleToggleSound = () => {
    const updated = soundFX.toggleMute();
    setIsMuted(updated);
  };

  return (
    <header className="w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-cyan-400 shadow-inner">
            {mode === 'PRIVATE_MODE' ? (
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            ) : (
              <Swords className="w-4 h-4" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base sm:text-lg tracking-tight text-zinc-100 flex items-center gap-2">
              {mode === 'PRIVATE_MODE' ? 'AEGIS TERMINAL' : 'VORTEX TACTICS'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation / Status Meta */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400 font-mono">
          {mode === 'GAME_MODE' && (
            <>
              <span>Grid Protocol 3x3</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>Tactical AI Engine</span>
            </>
          )}
          {mode === 'PRIVATE_MODE_LOCKED' && (
            <span className="text-amber-400/90">Authentication Gate Active</span>
          )}
          {mode === 'PRIVATE_MODE' && (
            <span className="text-emerald-400/90">Secure Enclave Active</span>
          )}
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition-colors border border-transparent hover:border-zinc-700/40"
            aria-label={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            title={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Mode Switch Button */}
          {mode === 'GAME_MODE' && (
            <button
              type="button"
              onClick={onOpenPrivateMode}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-cyan-300 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 hover:border-cyan-500/40 rounded-lg transition-all shadow-sm"
              title="Activate Private Security Mode (Hotkey: Ctrl+Shift+P)"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xs:inline">Private Mode</span>
            </button>
          )}

          {mode === 'PRIVATE_MODE' && onPanicExit && (
            <button
              type="button"
              onClick={onPanicExit}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-200 bg-rose-950/80 hover:bg-rose-900/90 border border-rose-800/60 rounded-lg transition-all shadow-sm"
              title="Instant wipe and return to game (Hotkey: Esc)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Panic Exit</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
