import React from 'react';
import { Player, MatchScore, GameStatus, GameOpponent, AIDifficulty } from '../../types/game';

interface ScoreBoardProps {
  scores: MatchScore;
  currentPlayer: Player;
  gameStatus: GameStatus;
  winner: Player | null;
  opponent: GameOpponent;
  difficulty: AIDifficulty;
  isAiThinking: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  scores,
  currentPlayer,
  gameStatus,
  winner,
  opponent,
  difficulty,
  isAiThinking,
}) => {
  const getTurnStatusText = () => {
    if (gameStatus === 'won') {
      return (
        <span className="font-semibold text-zinc-100 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${winner === 'X' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
          {winner === 'X' ? 'Player X Victory' : opponent === 'ai' ? 'Tactical AI Victory' : 'Player O Victory'}
        </span>
      );
    }
    if (gameStatus === 'draw') {
      return (
        <span className="font-semibold text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-500" />
          Tactical Stalemate
        </span>
      );
    }
    if (isAiThinking) {
      return (
        <span className="text-amber-400 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          AI Calculating Vector...
        </span>
      );
    }
    return (
      <span className="text-zinc-200 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${currentPlayer === 'X' ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
        {currentPlayer === 'X' ? 'Player X Turn' : opponent === 'ai' ? 'AI Opponent Turn' : 'Player O Turn'}
      </span>
    );
  };

  return (
    <div className="w-full max-w-[340px] sm:max-w-[400px] flex flex-col gap-3">
      {/* Turn & Outcome Indicator */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs font-mono">
        <div className="flex items-center gap-2">
          {getTurnStatusText()}
        </div>
        <div className="text-zinc-500 flex items-center gap-1.5">
          <span>{opponent === 'ai' ? `AI · ${difficulty}` : 'Local 2P'}</span>
        </div>
      </div>

      {/* Score Grid Cards */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Player X */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          currentPlayer === 'X' && gameStatus === 'in_progress'
            ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
            : 'bg-zinc-900/50 border-zinc-800/70'
        }`}>
          <div className="text-[11px] font-medium text-cyan-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <span>Player X</span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {scores.xWins}
          </div>
        </div>

        {/* Draws */}
        <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/70">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
            Draws
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-300 tabular-nums">
            {scores.draws}
          </div>
        </div>

        {/* Player O */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          currentPlayer === 'O' && gameStatus === 'in_progress'
            ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
            : 'bg-zinc-900/50 border-zinc-800/70'
        }`}>
          <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <span>{opponent === 'ai' ? 'AI Bot' : 'Player O'}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {scores.oWins}
          </div>
        </div>
      </div>
    </div>
  );
};
