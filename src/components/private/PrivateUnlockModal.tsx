import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, Eye, EyeOff, X, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { LockoutStatus } from '../../types/auth';

interface PrivateUnlockModalProps {
  isVaultInitialized: boolean;
  isVerifying: boolean;
  verificationError: string | null;
  remainingAttempts: number | null;
  lockoutStatus: LockoutStatus;
  onSubmit: (passcode: string) => Promise<boolean>;
  onCancel: () => void;
}

export const PrivateUnlockModal: React.FC<PrivateUnlockModalProps> = ({
  isVaultInitialized,
  isVerifying,
  verificationError,
  remainingAttempts,
  lockoutStatus,
  onSubmit,
  onCancel,
}) => {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localValidation, setLocalValidation] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidation(null);

    if (lockoutStatus.isLocked) {
      return;
    }

    if (!isVaultInitialized) {
      // First-time setup validation
      if (passcode.length < 4) {
        setLocalValidation('Passcode must be at least 4 characters.');
        return;
      }
      if (passcode !== confirmPasscode) {
        setLocalValidation('Confirmation passcode does not match.');
        return;
      }
    } else {
      if (!passcode) {
        setLocalValidation('Please enter your private passcode.');
        return;
      }
    }

    const success = await onSubmit(passcode);
    if (!success) {
      setPasscode('');
      setConfirmPasscode('');
      inputRef.current?.focus();
    }
  };

  const handleKeypadPress = (val: string) => {
    if (lockoutStatus.isLocked || isVerifying) return;
    if (val === 'CLEAR') {
      setPasscode('');
    } else if (val === 'BACKSPACE') {
      setPasscode(prev => prev.slice(0, -1));
    } else {
      if (passcode.length < 16) {
        setPasscode(prev => prev + val);
      }
    }
  };

  const activeError = localValidation || verificationError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Close / Return to Game button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg transition-colors"
          aria-label="Cancel and return to game"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Security Emblem */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-700/60 flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
            {lockoutStatus.isLocked ? (
              <AlertTriangle className="w-6 h-6 text-rose-500 animate-bounce" />
            ) : isVaultInitialized ? (
              <Lock className="w-6 h-6" />
            ) : (
              <KeyRound className="w-6 h-6 text-emerald-400" />
            )}
          </div>
          <h2 className="text-lg font-display font-bold text-zinc-100">
            {isVaultInitialized ? 'Authentication Gate' : 'Initialize Private Vault'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            {isVaultInitialized
              ? 'Enter your dedicated private-mode password to unlock the private communication enclave.'
              : 'Establish your private access credential. Passwords are salted and verified with client-side PBKDF2.'}
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutStatus.isLocked && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-900/60 flex items-center gap-2.5 text-xs text-rose-300">
            <Clock className="w-4 h-4 shrink-0 animate-spin" />
            <div>
              <span className="font-semibold">Security Lockout Active: </span>
              <span>Wait {lockoutStatus.remainingSeconds} seconds before attempting verification.</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">
              {isVaultInitialized ? 'Private Passcode' : 'Create New Passcode (Min. 4 chars)'}
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                disabled={lockoutStatus.isLocked || isVerifying}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-50"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm field on first initialization */}
          {!isVaultInitialized && (
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                Confirm Passcode
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPasscode}
                onChange={e => setConfirmPasscode(e.target.value)}
                disabled={lockoutStatus.isLocked || isVerifying}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-50"
                autoComplete="off"
              />
            </div>
          )}

          {/* Optional Quick Numeric Keypad for convenience */}
          {isVaultInitialized && (
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACKSPACE'].map(val => (
                  <button
                    key={val}
                    type="button"
                    disabled={lockoutStatus.isLocked || isVerifying}
                    onClick={() => handleKeypadPress(val)}
                    className="py-2 rounded-lg bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 font-mono text-xs transition-colors active:scale-95 disabled:opacity-40"
                  >
                    {val === 'CLEAR' ? 'CLR' : val === 'BACKSPACE' ? '⌫' : val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {activeError && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{activeError}</span>
            </div>
          )}

          {/* Attempts remaining note */}
          {remainingAttempts !== null && remainingAttempts > 0 && !lockoutStatus.isLocked && (
            <div className="text-[11px] font-mono text-amber-400 text-center">
              {remainingAttempts} verification attempt{remainingAttempts === 1 ? '' : 's'} remaining before security lockout.
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
            >
              Cancel & Return
            </button>
            <button
              type="submit"
              disabled={lockoutStatus.isLocked || isVerifying}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>{isVaultInitialized ? 'Authenticate' : 'Initialize Vault'}</span>
              )}
            </button>
          </div>
        </form>

        {/* Security Specs Footer (No "forgot password" or reset option) */}
        <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>PBKDF2 SHA-256 Enclave</span>
          </div>
          <span>Strict Zero-Recovery Policy</span>
        </div>

      </div>
    </div>
  );
};
