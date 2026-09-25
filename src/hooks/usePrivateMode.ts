import { useState, useEffect, useCallback } from 'react';
import { ApplicationMode } from '../types/app';
import { LockoutStatus } from '../types/auth';
import { credentialVerifier } from '../services/privateMode/credentialVerifier';
import { soundFX } from '../lib/soundFX';

export function usePrivateMode() {
  const [mode, setMode] = useState<ApplicationMode>('GAME_MODE');
  const [isVaultInitialized, setIsVaultInitialized] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus>({
    isLocked: false,
    remainingSeconds: 0,
  });

  // Verify initialization on mount
  useEffect(() => {
    credentialVerifier.isInitialized().then(res => {
      setIsVaultInitialized(res);
    });
  }, []);

  // Lockout tick timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutStatus.isLocked) {
      timer = setInterval(() => {
        const current = credentialVerifier.getLockoutStatus();
        setLockoutStatus(current);
        if (!current.isLocked) {
          setVerificationError(null);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutStatus.isLocked]);

  // Request entering private mode (shows authentication gate)
  const openUnlockGate = useCallback(() => {
    const lockout = credentialVerifier.getLockoutStatus();
    setLockoutStatus(lockout);
    setVerificationError(null);
    setRemainingAttempts(null);
    setMode('PRIVATE_MODE_LOCKED');
  }, []);

  // Cancel unlock and return safely to game mode
  const cancelUnlock = useCallback(() => {
    setVerificationError(null);
    setMode('GAME_MODE');
  }, []);

  // Submit passcode for initialization or verification
  const submitPasscode = useCallback(
    async (passcode: string): Promise<boolean> => {
      setIsVerifying(true);
      setVerificationError(null);

      try {
        const initialized = await credentialVerifier.isInitialized();

        if (!initialized) {
          // First-time setup
          const initRes = await credentialVerifier.initializeCredential(passcode);
          if (initRes.success) {
            setIsVaultInitialized(true);
            soundFX.playUnlock();
            setMode('PRIVATE_MODE');
            setIsVerifying(false);
            return true;
          } else {
            setVerificationError(initRes.error || 'Failed to initialize private credentials.');
            setIsVerifying(false);
            return false;
          }
        } else {
          // Verification
          const verifyRes = await credentialVerifier.verifyCredential(passcode);
          if (verifyRes.success) {
            soundFX.playUnlock();
            setMode('PRIVATE_MODE');
            setIsVerifying(false);
            return true;
          } else {
            setVerificationError(verifyRes.error || 'Access denied.');
            if (verifyRes.attemptsRemaining !== undefined) {
              setRemainingAttempts(verifyRes.attemptsRemaining);
            }
            if (verifyRes.lockoutSeconds) {
              setLockoutStatus({
                isLocked: true,
                remainingSeconds: verifyRes.lockoutSeconds,
              });
            }
            setIsVerifying(false);
            return false;
          }
        }
      } catch (err) {
        setVerificationError('Cryptographic subsystem error: ' + (err as Error).message);
        setIsVerifying(false);
        return false;
      }
    },
    []
  );

  // Leave private mode (wipe session token, drop all private view state)
  const exitPrivateMode = useCallback(() => {
    credentialVerifier.clearSession();
    setMode('GAME_MODE');
    setVerificationError(null);
  }, []);

  // Emergency Panic switch: instantly cleans session and restores game
  const panicSwitch = useCallback(() => {
    credentialVerifier.clearSession();
    setMode('GAME_MODE');
    setVerificationError(null);
  }, []);

  // Keyboard shortcut for Panic switch (Esc) or stealth entry (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Panic switch on Escape while in private mode
      if (mode === 'PRIVATE_MODE' && e.key === 'Escape') {
        panicSwitch();
      }
      // Stealth hotkey (Ctrl+Shift+P or Cmd+Shift+P)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        if (mode === 'GAME_MODE') {
          openUnlockGate();
        } else if (mode === 'PRIVATE_MODE') {
          panicSwitch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, openUnlockGate, panicSwitch]);

  return {
    mode,
    isVaultInitialized,
    isVerifying,
    verificationError,
    remainingAttempts,
    lockoutStatus,
    openUnlockGate,
    cancelUnlock,
    submitPasscode,
    exitPrivateMode,
    panicSwitch,
  };
}
