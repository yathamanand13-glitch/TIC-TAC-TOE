import React from 'react';
import { BoardState, CellValue, Player, WinningLine } from '../../types/game';
import { WinningLineOverlay } from './WinningLineOverlay';

interface GameBoardProps {
  board: BoardState;
  currentPlayer: Player;
  winningLine: WinningLine | null;
  winner: Player | null;
  isAiThinking: boolean;
  onCellClick: (index: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPlayer,
  winningLine,
  winner,
  isAiThinking,
  onCellClick,
}) => {
  const isWinningCell = (index: number) => {
    return winningLine?.indices.includes(index) || false;
  };

  const renderMark = (value: CellValue, index: number) => {
    if (!value) return null;

    if (value === 'X') {
      return (
        <div
          className={`relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-transform ${
            isWinningCell(index) ? 'scale-110 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]' : ''
          }`}
        >
          {/* Laser Cross X */}
          <svg viewBox="0 0 48 48" className="w-full h-full text-cyan-400">
            <line
              x1="10"
              y1="10"
              x2="38"
              y2="38"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]"
            />
            <line
              x1="38"
              y1="10"
              x2="10"
              y2="38"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]"
            />
            {/* Center tactical point */}
            <circle cx="24" cy="24" r="2.5" fill="#e0f2fe" />
          </svg>
        </div>
      );
    }

    // Player O: Precision Reticle
    return (
      <div
        className={`relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-transform ${
          isWinningCell(index) ? 'scale-110 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]' : ''
        }`}
      >
        <svg viewBox="0 0 48 48" className="w-full h-full text-amber-400">
          <circle
            cx="24"
            cy="24"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
          />
          {/* Reticle ticks */}
          <line x1="24" y1="4" x2="24" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="40" x2="24" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="24" x2="8" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-square p-3 sm:p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 shadow-2xl backdrop-blur-md flex flex-col justify-center items-center">
      {/* Tactical corner accents */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-zinc-700/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-zinc-700/60 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-zinc-700/60 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-zinc-700/60 pointer-events-none" />

      {/* 3x3 Grid container */}
      <div className="relative grid grid-cols-3 grid-rows-3 gap-2 sm:gap-2.5 w-full h-full">
        {board.map((cell, index) => {
          const winning = isWinningCell(index);
          const isEmpty = cell === null;
          const isDisabled = !isEmpty || Boolean(winner) || isAiThinking;

          return (
            <button
              key={index}
              type="button"
              disabled={isDisabled}
              onClick={() => onCellClick(index)}
              aria-label={`Grid cell ${index + 1}${cell ? `, marked ${cell}` : ', empty'}`}
              className={`group relative flex items-center justify-center rounded-xl transition-all duration-200 select-none
                ${winning 
                  ? 'bg-zinc-800/90 border border-zinc-600/80 shadow-lg' 
                  : 'bg-zinc-950/70 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/50'
                }
                ${!isDisabled ? 'cursor-pointer active:scale-95' : 'cursor-default'}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-transparent
              `}
            >
              {/* Inner coordinate watermark */}
              <span className="absolute top-1.5 left-2 text-[9px] font-mono text-zinc-700 select-none pointer-events-none">
                {String.fromCharCode(65 + Math.floor(index / 3))}{(index % 3) + 1}
              </span>

              {/* Placed Mark */}
              {renderMark(cell, index)}

              {/* Ghost preview for empty cell during human turn */}
              {isEmpty && !isDisabled && !isAiThinking && (
                <div className="opacity-0 group-hover:opacity-20 transition-opacity duration-150 pointer-events-none">
                  {currentPlayer === 'X' ? (
                    <div className="w-10 h-10 border-2 border-cyan-400 rounded-sm rotate-45" />
                  ) : (
                    <div className="w-10 h-10 border-2 border-amber-400 rounded-full" />
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Dynamic laser line across winning cells */}
        <WinningLineOverlay winningLine={winningLine} winner={winner} />
      </div>
    </div>
  );
};
