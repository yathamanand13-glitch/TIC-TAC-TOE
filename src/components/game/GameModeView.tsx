import React, { useState } from 'react';
import { useTicTacToe } from '../../hooks/useTicTacToe';
import { GameBoard } from './GameBoard';
import { ScoreBoard } from './ScoreBoard';
import { GameControls } from './GameControls';
import { GameHistoryDrawer } from './GameHistoryDrawer';

interface GameModeViewProps {
  onOpenPrivateMode: () => void;
}

export const GameModeView: React.FC<GameModeViewProps> = ({ onOpenPrivateMode }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [stealthTapCount, setStealthTapCount] = useState(0);

  const {
    board,
    currentPlayer,
    opponent,
    difficulty,
    gameStatus,
    winningLine,
    isAiThinking,
    scores,
    history,
    makeMove,
    resetGame,
    resetScores,
    changeOpponent,
    changeDifficulty,
  } = useTicTacToe();

  const winner = winningLine ? (board[winningLine.indices[0]] as 'X' | 'O') : null;

  // Optional stealth Easter egg: 3 fast taps on the subtle version label opens private mode
  const handleStealthTap = () => {
    const next = stealthTapCount + 1;
    if (next >= 3) {
      setStealthTapCount(0);
      onOpenPrivateMode();
    } else {
      setStealthTapCount(next);
      setTimeout(() => setStealthTapCount(0), 1000);
    }
  };

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 max-w-4xl mx-auto w-full z-10">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] bg-cyan-950/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="flex flex-col items-center gap-5 sm:gap-6 w-full">
        {/* Score Board */}
        <ScoreBoard
          scores={scores}
          currentPlayer={currentPlayer}
          gameStatus={gameStatus}
          winner={winner}
          opponent={opponent}
          difficulty={difficulty}
          isAiThinking={isAiThinking}
        />

        {/* Tactical 3x3 Game Board */}
        <GameBoard
          board={board}
          currentPlayer={currentPlayer}
          winningLine={winningLine}
          winner={winner}
          isAiThinking={isAiThinking}
          onCellClick={makeMove}
        />

        {/* Game Mode & Action Controls */}
        <GameControls
          opponent={opponent}
          difficulty={difficulty}
          gameStatus={gameStatus}
          historyCount={history.length}
          onOpponentChange={changeOpponent}
          onDifficultyChange={changeDifficulty}
          onNewRound={resetGame}
          onResetScore={resetScores}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      </div>

      {/* Match History Modal */}
      <GameHistoryDrawer
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Subtle Stealth Trigger / Discrete Footer Metadata */}
      <footer className="mt-8 text-center">
        <button
          type="button"
          onClick={handleStealthTap}
          className="text-[11px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors select-none cursor-default"
          title="Sector Engine · Disguised Terminal"
        >
          v1.4.2 · Sector Engine Verified
        </button>
      </footer>
    </main>
  );
};
