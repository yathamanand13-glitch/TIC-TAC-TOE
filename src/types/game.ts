export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type BoardState = CellValue[]; // 9 elements

export type GameOpponent = 'ai' | 'pvp';
export type AIDifficulty = 'easy' | 'medium' | 'impossible';

export interface WinningLine {
  indices: [number, number, number];
  direction: 'row-0' | 'row-1' | 'row-2' | 'col-0' | 'col-1' | 'col-2' | 'diag-main' | 'diag-anti';
}

export type GameStatus = 'in_progress' | 'won' | 'draw';

export interface MoveRecord {
  index: number;
  player: Player;
  moveNumber: number;
}

export interface MatchScore {
  xWins: number;
  oWins: number;
  draws: number;
  totalGames: number;
}

export interface GameSessionRecord {
  id: string;
  timestamp: number;
  winner: Player | 'draw';
  opponent: GameOpponent;
  difficulty?: AIDifficulty;
  totalMoves: number;
  finalBoard: BoardState;
  winningIndices?: [number, number, number];
}
