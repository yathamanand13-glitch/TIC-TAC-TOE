import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BoardState,
  Player,
  GameOpponent,
  AIDifficulty,
  GameStatus,
  WinningLine,
  MatchScore,
  GameSessionRecord,
  MoveRecord,
} from '../types/game';
import { checkWinner, isBoardFull, calculateAIMove } from '../lib/gameLogic';
import { soundFX } from '../lib/soundFX';

const INITIAL_BOARD: BoardState = Array(9).fill(null);

export function useTicTacToe() {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [opponent, setOpponent] = useState<GameOpponent>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [gameStatus, setGameStatus] = useState<GameStatus>('in_progress');
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [moves, setMoves] = useState<MoveRecord[]>([]);

  // Scores for current session
  const [scores, setScores] = useState<MatchScore>(() => {
    try {
      const saved = sessionStorage.getItem('vortex_game_scores');
      return saved ? JSON.parse(saved) : { xWins: 0, oWins: 0, draws: 0, totalGames: 0 };
    } catch {
      return { xWins: 0, oWins: 0, draws: 0, totalGames: 0 };
    }
  });

  // Session match history
  const [history, setHistory] = useState<GameSessionRecord[]>(() => {
    try {
      const saved = sessionStorage.getItem('vortex_game_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track if game already finalized to avoid double recording
  const isFinalizedRef = useRef(false);

  // Sync scores to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('vortex_game_scores', JSON.stringify(scores));
    } catch {
      // storage unavailable
    }
  }, [scores]);

  // Sync history to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('vortex_game_history', JSON.stringify(history));
    } catch {
      // storage unavailable
    }
  }, [history]);

  // Finalize game handler
  const finalizeGame = useCallback(
    (status: 'won' | 'draw', winner: Player | 'draw', line: WinningLine | null, currentBoard: BoardState, moveList: MoveRecord[]) => {
      if (isFinalizedRef.current) return;
      isFinalizedRef.current = true;

      setGameStatus(status);
      setWinningLine(line);

      if (status === 'won') {
        soundFX.playWin();
        setScores(prev => ({
          ...prev,
          xWins: winner === 'X' ? prev.xWins + 1 : prev.xWins,
          oWins: winner === 'O' ? prev.oWins + 1 : prev.oWins,
          totalGames: prev.totalGames + 1,
        }));
      } else {
        soundFX.playDraw();
        setScores(prev => ({
          ...prev,
          draws: prev.draws + 1,
          totalGames: prev.totalGames + 1,
        }));
      }

      const newRecord: GameSessionRecord = {
        id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        timestamp: Date.now(),
        winner,
        opponent,
        difficulty: opponent === 'ai' ? difficulty : undefined,
        totalMoves: moveList.length,
        finalBoard: [...currentBoard],
        winningIndices: line?.indices,
      };

      setHistory(prev => [newRecord, ...prev].slice(0, 20)); // Keep latest 20
    },
    [opponent, difficulty]
  );

  // User Move Handler
  const makeMove = useCallback(
    (index: number) => {
      if (board[index] !== null || gameStatus !== 'in_progress' || isAiThinking) {
        return false;
      }

      const nextBoard = [...board];
      nextBoard[index] = currentPlayer;
      const nextMoves: MoveRecord[] = [
        ...moves,
        { index, player: currentPlayer, moveNumber: moves.length + 1 },
      ];

      setBoard(nextBoard);
      setMoves(nextMoves);
      soundFX.playMove(currentPlayer);

      // Check win/draw for current player
      const { winner, winningLine: foundLine } = checkWinner(nextBoard);
      if (winner) {
        finalizeGame('won', winner, foundLine, nextBoard, nextMoves);
        return true;
      }

      if (isBoardFull(nextBoard)) {
        finalizeGame('draw', 'draw', null, nextBoard, nextMoves);
        return true;
      }

      // Switch turn
      const nextPlayer: Player = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      return true;
    },
    [board, currentPlayer, gameStatus, isAiThinking, moves, finalizeGame]
  );

  // AI Move Engine Loop
  useEffect(() => {
    if (
      opponent === 'ai' &&
      currentPlayer === 'O' &&
      gameStatus === 'in_progress' &&
      !isBoardFull(board)
    ) {
      setIsAiThinking(true);
      const delay = Math.floor(Math.random() * 250) + 300; // 300ms - 550ms realistic tactical pacing

      const timer = setTimeout(() => {
        const aiIndex = calculateAIMove(board, 'O', difficulty);
        if (aiIndex >= 0 && board[aiIndex] === null) {
          const nextBoard = [...board];
          nextBoard[aiIndex] = 'O';
          const nextMoves: MoveRecord[] = [
            ...moves,
            { index: aiIndex, player: 'O', moveNumber: moves.length + 1 },
          ];

          setBoard(nextBoard);
          setMoves(nextMoves);
          soundFX.playMove('O');

          const { winner, winningLine: foundLine } = checkWinner(nextBoard);
          if (winner) {
            finalizeGame('won', winner, foundLine, nextBoard, nextMoves);
          } else if (isBoardFull(nextBoard)) {
            finalizeGame('draw', 'draw', null, nextBoard, nextMoves);
          } else {
            setCurrentPlayer('X');
          }
        }
        setIsAiThinking(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [opponent, currentPlayer, gameStatus, board, difficulty, moves, finalizeGame]);

  // Start new round
  const resetGame = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer('X');
    setGameStatus('in_progress');
    setWinningLine(null);
    setIsAiThinking(false);
    setMoves([]);
    isFinalizedRef.current = false;
  }, []);

  // Reset all match stats
  const resetScores = useCallback(() => {
    setScores({ xWins: 0, oWins: 0, draws: 0, totalGames: 0 });
    setHistory([]);
    resetGame();
  }, [resetGame]);

  const changeOpponent = useCallback(
    (newOpponent: GameOpponent) => {
      setOpponent(newOpponent);
      resetGame();
    },
    [resetGame]
  );

  const changeDifficulty = useCallback(
    (newDifficulty: AIDifficulty) => {
      setDifficulty(newDifficulty);
      resetGame();
    },
    [resetGame]
  );

  return {
    board,
    currentPlayer,
    opponent,
    difficulty,
    gameStatus,
    winningLine,
    isAiThinking,
    scores,
    history,
    moves,
    makeMove,
    resetGame,
    resetScores,
    changeOpponent,
    changeDifficulty,
  };
}
