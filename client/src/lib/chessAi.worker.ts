import { Chess } from "chess.js";
import { chooseChessAiMove, type ChessDifficulty } from "./chessAi";

self.addEventListener(
  "message",
  (event: MessageEvent<{ fen: string; difficulty: ChessDifficulty }>) => {
    try {
      const move = chooseChessAiMove(
        new Chess(event.data.fen),
        event.data.difficulty
      );
      self.postMessage({ move });
    } catch (error) {
      self.postMessage({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);
