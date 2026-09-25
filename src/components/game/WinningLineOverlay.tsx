import React from 'react';
import { WinningLine } from '../../types/game';

interface WinningLineOverlayProps {
  winningLine: WinningLine | null;
  winner: 'X' | 'O' | null;
}

export const WinningLineOverlay: React.FC<WinningLineOverlayProps> = ({
  winningLine,
  winner,
}) => {
  if (!winningLine) return null;

  // Compute SVG line start and end coordinates based on grid percentages
  let x1 = 0, y1 = 0, x2 = 0, y2 = 0;

  switch (winningLine.direction) {
    case 'row-0':
      x1 = 8; y1 = 16.66; x2 = 92; y2 = 16.66;
      break;
    case 'row-1':
      x1 = 8; y1 = 50; x2 = 92; y2 = 50;
      break;
    case 'row-2':
      x1 = 8; y1 = 83.33; x2 = 92; y2 = 83.33;
      break;
    case 'col-0':
      x1 = 16.66; y1 = 8; x2 = 16.66; y2 = 92;
      break;
    case 'col-1':
      x1 = 50; y1 = 8; x2 = 50; y2 = 92;
      break;
    case 'col-2':
      x1 = 83.33; y1 = 8; x2 = 83.33; y2 = 92;
      break;
    case 'diag-main': // 0 -> 8
      x1 = 12; y1 = 12; x2 = 88; y2 = 88;
      break;
    case 'diag-anti': // 2 -> 6
      x1 = 88; y1 = 12; x2 = 12; y2 = 88;
      break;
  }

  const strokeColor = winner === 'X' ? '#06b6d4' : '#f59e0b';
  const glowColor = winner === 'X' ? 'rgba(6, 182, 212, 0.6)' : 'rgba(245, 158, 11, 0.6)';

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background shadow/glow line */}
      <line
        x1={`${x1}%`}
        y1={`${y1}%`}
        x2={`${x2}%`}
        y2={`${y2}%`}
        stroke={glowColor}
        strokeWidth="6"
        strokeLinecap="round"
        style={{
          filter: 'url(#laser-glow)',
          animation: 'draw-line 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      />

      {/* Core laser line */}
      <line
        x1={`${x1}%`}
        y1={`${y1}%`}
        x2={`${x2}%`}
        y2={`${y2}%`}
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        className="transition-all"
        style={{
          strokeDasharray: 120,
          strokeDashoffset: 120,
          animation: 'draw-line 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      />

      <style>{`
        @keyframes draw-line {
          to {
            strokeDashoffset: 0;
          }
        }
      `}</style>
    </svg>
  );
};
