import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";

export type ChessDifficulty = "easy" | "medium" | "hard";
export type ChessAiMove = {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
};

const pieceValues: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

const MATE_SCORE = 100_000;

function evaluatePosition(game: Chess) {
  let score = 0;
  const board = game.board();

  for (let row = 0; row < board.length; row += 1) {
    for (let file = 0; file < board[row].length; file += 1) {
      const piece = board[row][file];
      if (!piece) continue;

      const side = piece.color === "b" ? 1 : -1;
      const advancement =
        piece.type === "p" ? (piece.color === "b" ? row : 7 - row) * 7 : 0;
      const centrality = 7 - Math.abs(3.5 - file) - Math.abs(3.5 - row);
      const centerBonus =
        piece.type === "n" || piece.type === "b"
          ? centrality * 5
          : piece.type === "q"
            ? centrality * 2
            : 0;

      score += side * (pieceValues[piece.type] + advancement + centerBonus);
    }
  }

  return score;
}

function movePriority(move: Move) {
  const captureValue = move.captured ? pieceValues[move.captured] * 10 : 0;
  const promotionValue = move.promotion ? pieceValues[move.promotion] + 800 : 0;
  return captureValue + promotionValue;
}

function orderedMoves(game: Chess) {
  return game
    .moves({ verbose: true })
    .sort((a, b) => movePriority(b) - movePriority(a));
}

function search(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  ply: number
): number {
  if (game.isCheckmate()) {
    return game.turn() === "b" ? -MATE_SCORE + ply : MATE_SCORE - ply;
  }
  if (game.isDraw()) return 0;
  if (depth === 0) return evaluatePosition(game);

  const maximizing = game.turn() === "b";
  let best = maximizing ? -Infinity : Infinity;

  for (const move of orderedMoves(game)) {
    game.move({ from: move.from, to: move.to, promotion: move.promotion });
    const value = search(game, depth - 1, alpha, beta, ply + 1);
    game.undo();

    if (maximizing) {
      best = Math.max(best, value);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, value);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }

  return best;
}

export function chooseChessAiMove(
  game: Chess,
  difficulty: ChessDifficulty,
  random: () => number = Math.random
): ChessAiMove | null {
  if (game.isGameOver()) return null;

  const depth = difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1;
  const maximizing = game.turn() === "b";
  let bestScore = maximizing ? -Infinity : Infinity;
  let bestMove: Move | null = null;
  let alpha = -Infinity;
  let beta = Infinity;
  const scoredMoves: Array<{ move: Move; score: number }> = [];

  for (const move of orderedMoves(game)) {
    game.move({ from: move.from, to: move.to, promotion: move.promotion });
    const score = search(game, depth - 1, alpha, beta, 1);
    game.undo();

    if (difficulty === "easy") {
      scoredMoves.push({ move, score });
      continue;
    }

    if (
      bestMove === null ||
      (maximizing ? score > bestScore : score < bestScore)
    ) {
      bestMove = move;
      bestScore = score;
    }
    if (maximizing) alpha = Math.max(alpha, bestScore);
    else beta = Math.min(beta, bestScore);
  }

  if (difficulty !== "easy") {
    if (!bestMove) return null;
    return {
      from: bestMove.from,
      to: bestMove.to,
      ...(bestMove.promotion ? { promotion: bestMove.promotion } : {}),
    };
  }

  if (scoredMoves.length === 0) return null;
  bestScore = maximizing
    ? Math.max(...scoredMoves.map(candidate => candidate.score))
    : Math.min(...scoredMoves.map(candidate => candidate.score));
  const threshold = 140;
  const candidates = scoredMoves.filter(candidate =>
    maximizing
      ? candidate.score >= bestScore - threshold
      : candidate.score <= bestScore + threshold
  );
  const index = Math.min(
    candidates.length - 1,
    Math.floor(random() * candidates.length)
  );
  const { move } = candidates[index];

  return {
    from: move.from,
    to: move.to,
    ...(move.promotion ? { promotion: move.promotion } : {}),
  };
}
