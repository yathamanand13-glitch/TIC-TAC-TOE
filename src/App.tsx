/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePrivateMode } from './hooks/usePrivateMode';
import { Header } from './components/common/Header';
import { GameModeView } from './components/game/GameModeView';
import { PrivateUnlockModal } from './components/private/PrivateUnlockModal';
import { PrivateModeShell } from './components/private/PrivateModeShell';

export default function App() {
  const {
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
  } = usePrivateMode();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col tactical-grid-bg relative select-none">
      {/* Top Bar Contract (3 zones) */}
      <Header
        mode={mode}
        onOpenPrivateMode={openUnlockGate}
        onPanicExit={panicSwitch}
      />

      {/* Mode State Switching: Clean unmounting of private content when in game mode */}
      {mode === 'PRIVATE_MODE' ? (
        <PrivateModeShell
          onExit={exitPrivateMode}
          onPanicExit={panicSwitch}
        />
      ) : (
        <GameModeView onOpenPrivateMode={openUnlockGate} />
      )}

      {/* Private Mode Authentication Gate Modal */}
      {mode === 'PRIVATE_MODE_LOCKED' && (
        <PrivateUnlockModal
          isVaultInitialized={isVaultInitialized}
          isVerifying={isVerifying}
          verificationError={verificationError}
          remainingAttempts={remainingAttempts}
          lockoutStatus={lockoutStatus}
          onSubmit={submitPasscode}
          onCancel={cancelUnlock}
        />
      )}
    </div>
  );
}
