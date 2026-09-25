import React from 'react';
import { RotateCcw, Play, History, Bot, Users } from 'lucide-react';
import { GameOpponent, AIDifficulty, GameStatus } from '../../types/game';

interface GameControlsProps {
  opponent: GameOpponent;
  difficulty: AIDifficulty;
  gameStatus: GameStatus;
  historyCount: number;
  onOpponentChange: (opponent: GameOpponent) => void;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  onNewRound: () => void;
  onResetScore: () => void;
  onOpenHistory: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  opponent,
  difficulty,
  gameStatus,
  historyCount,
  onOpponentChange,
  onDifficultyChange,
  onNewRound,
  onResetScore,
  onOpenHistory,
}) => {
  return (
    <div className="w-full max-w-[340px] sm:max-w-[400px] flex flex-col gap-3">
      {/* Primary Match Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onNewRound}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-sm ${
            gameStatus !== 'in_progress'
              ? 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] font-semibold'
              : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-100 border border-zinc-700/60'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{gameStatus !== 'in_progress' ? 'Next Round' : 'New Round'}</span>
        </button>

        <button
          type="button"
          onClick={onResetScore}
          title="Reset match statistics"
          className="flex items-center justify-center p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
          aria-label="Reset match statistics"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          title="View session match history"
          className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors text-xs font-mono"
        >
          <History className="w-3.5 h-3.5" />
          <span>Logs ({historyCount})</span>
        </button>
      </div>

      {/* Opponent Segmented Selector */}
      <div className="flex items-center justify-between gap-1 p-1 bg-zinc-900/70 border border-zinc-800/80 rounded-xl">
        <button
          type="button"
          onClick={() => onOpponentChange('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            opponent === 'ai'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Vs AI Bot</span>
        </button>
        <button
          type="button"
          onClick={() => onOpponentChange('pvp')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            opponent === 'pvp'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Pass & Play</span>
        </button>
      </div>

      {/* AI Difficulty Selector (Only visible in AI mode) */}
      {opponent === 'ai' && (
        <div className="flex items-center justify-between gap-1 p-1 bg-zinc-900/50 border border-zinc-800/60 rounded-xl">
          {(['easy', 'medium', 'impossible'] as AIDifficulty[]).map(diff => (
            <button
              key={diff}
              type="button"
              onClick={() => onDifficultyChange(diff)}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-mono capitalize transition-all ${
                difficulty === diff
                  ? diff === 'impossible'
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-800/50 shadow-sm'
                    : 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
