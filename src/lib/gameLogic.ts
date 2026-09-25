import { BoardState, CellValue, Player, WinningLine, AIDifficulty } from '../types/game';

export const WINNING_COMBINATIONS: Array<{
  indices: [number, number, number];
  direction: WinningLine['direction'];
}> = [
  { indices: [0, 1, 2], direction: 'row-0' },
  { indices: [3, 4, 5], direction: 'row-1' },
  { indices: [6, 7, 8], direction: 'row-2' },
  { indices: [0, 3, 6], direction: 'col-0' },
  { indices: [1, 4, 7], direction: 'col-1' },
  { indices: [2, 5, 8], direction: 'col-2' },
  { indices: [0, 4, 8], direction: 'diag-main' },
  { indices: [2, 4, 6], direction: 'diag-anti' },
];

export function checkWinner(board: BoardState): {
  winner: Player | null;
  winningLine: WinningLine | null;
} {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo.indices;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningLine: combo,
      };
    }
  }
  return { winner: null, winningLine: null };
}

export function isBoardFull(board: BoardState): boolean {
  return board.every(cell => cell !== null);
}

export function getAvailableMoves(board: BoardState): number[] {
  const moves: number[] = [];
  board.forEach((cell, idx) => {
    if (cell === null) moves.push(idx);
  });
  return moves;
}

/**
 * Minimax algorithm implementation with depth penalty to choose fastest win / longest defense
 */
function minimax(
  board: BoardState,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player,
  alpha: number,
  beta: number
): number {
  const { winner } = checkWinner(board);
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer;
        const evaluation = minimax(board, depth + 1, false, aiPlayer, humanPlayer, alpha, beta);
        board[i] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        const evaluation = minimax(board, depth + 1, true, aiPlayer, humanPlayer, alpha, beta);
        board[i] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
}

/**
 * Computes AI move according to the configured difficulty
 */
export function calculateAIMove(
  board: BoardState,
  aiPlayer: Player,
  difficulty: AIDifficulty
): number {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return -1;

  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  // 1. Easy: Mostly random, slight chance of blocking
  if (difficulty === 'easy') {
    if (Math.random() < 0.35) {
      // Look for immediate win or block
      for (const move of availableMoves) {
        board[move] = aiPlayer;
        if (checkWinner(board).winner === aiPlayer) {
          board[move] = null;
          return move;
        }
        board[move] = null;
      }
      for (const move of availableMoves) {
        board[move] = humanPlayer;
        if (checkWinner(board).winner === humanPlayer) {
          board[move] = null;
          return move;
        }
        board[move] = null;
      }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // 2. Medium: 60% chance optimal, 40% heuristic/random
  if (difficulty === 'medium') {
    if (Math.random() < 0.45) {
      // Check for win or block first
      for (const move of availableMoves) {
        board[move] = aiPlayer;
        if (checkWinner(board).winner === aiPlayer) {
          board[move] = null;
          return move;
        }
        board[move] = null;
      }
      for (const move of availableMoves) {
        board[move] = humanPlayer;
        if (checkWinner(board).winner === humanPlayer) {
          board[move] = null;
          return move;
        }
        board[move] = null;
      }
      // Take center if available
      if (board[4] === null) return 4;
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }

  // 3. Impossible: Unbeatable Minimax
  let bestScore = -Infinity;
  let bestMove = availableMoves[0];

  // If first move and center is empty, taking center is strategically strong and fast
  if (availableMoves.length === 9) {
    return 4; // center
  }

  for (const move of availableMoves) {
    board[move] = aiPlayer;
    const score = minimax(board, 0, false, aiPlayer, humanPlayer, -Infinity, Infinity);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
