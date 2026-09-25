import React from 'react';
import { X, Trophy, MinusCircle, Swords } from 'lucide-react';
import { GameSessionRecord } from '../../types/game';

interface GameHistoryDrawerProps {
  isOpen: boolean;
  history: GameSessionRecord[];
  onClose: () => void;
}

export const GameHistoryDrawer: React.FC<GameHistoryDrawerProps> = ({
  isOpen,
  history,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Session Match History</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label="Close history modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs font-mono">
              No session matches completed yet.
            </div>
          ) : (
            history.map((record, index) => {
              const dateStr = new Date(record.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={record.id || index}
                  className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  {/* Left: Outcome & Details */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {record.winner === 'draw' ? (
                        <span className="flex items-center gap-1 text-zinc-400 font-medium">
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>Draw</span>
                        </span>
                      ) : (
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            record.winner === 'X' ? 'text-cyan-400' : 'text-amber-400'
                          }`}
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Winner: Player {record.winner}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      <span>{record.opponent === 'ai' ? `Vs AI (${record.difficulty})` : 'Pass & Play'}</span>
                      <span aria-hidden="true" className="mx-1">·</span>
                      <span>{record.totalMoves} moves</span>
                      <span aria-hidden="true" className="mx-1">·</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Right: Mini Board Preview */}
                  <div className="grid grid-cols-3 gap-0.5 w-10 h-10 p-1 bg-zinc-900 rounded border border-zinc-800 shrink-0">
                    {record.finalBoard.map((cell, cIdx) => (
                      <div
                        key={cIdx}
                        className={`flex items-center justify-center text-[7px] font-bold rounded-[2px] ${
                          cell === 'X'
                            ? 'bg-cyan-950 text-cyan-400'
                            : cell === 'O'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-zinc-950'
                        }`}
                      >
                        {cell || ''}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/40 flex justify-between items-center text-[11px] text-zinc-500 font-mono">
          <span>Total matches: {history.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
