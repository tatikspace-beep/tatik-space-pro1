import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { chooseChessAiMove } from "./chessAi";

describe("chooseChessAiMove", () => {
  it.each(["easy", "medium", "hard"] as const)(
    "returns a legal %s move without changing the game",
    difficulty => {
      const game = new Chess();
      const originalFen = game.fen();
      const move = chooseChessAiMove(game, difficulty, () => 0);

      expect(move).not.toBeNull();
      expect(game.fen()).toBe(originalFen);
      expect(
        game
          .moves({ verbose: true })
          .some(
            candidate =>
              candidate.from === move?.from &&
              candidate.to === move?.to &&
              candidate.promotion === move?.promotion
          )
      ).toBe(true);
    }
  );

  it("returns no move when the game is already over", () => {
    const checkmated = new Chess("7k/6Q1/6K1/8/8/8/8/8 b - - 0 1");

    expect(chooseChessAiMove(checkmated, "medium")).toBeNull();
  });
});
