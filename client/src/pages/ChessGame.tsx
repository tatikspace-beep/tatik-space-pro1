import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chess,
  type Color,
  type Move,
  type PieceSymbol,
  type Square,
} from "chess.js";
import { BrainCircuit, RotateCcw, Undo2 } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  type ChessAiMove,
  type ChessDifficulty,
} from "@/lib/chessAi";

type PromotionRequest = Pick<ChessAiMove, "from" | "to">;
type PromotionPiece = "q" | "r" | "b" | "n";
type RecordedMove = {
  color: Color;
  from: Square;
  san: string;
  to: Square;
};

const pieceGlyphs: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};

const pieceNames = {
  it: {
    w: {
      k: "Re bianco",
      q: "Donna bianca",
      r: "Torre bianca",
      b: "Alfiere bianco",
      n: "Cavallo bianco",
      p: "Pedone bianco",
    },
    b: {
      k: "Re nero",
      q: "Donna nera",
      r: "Torre nera",
      b: "Alfiere nero",
      n: "Cavallo nero",
      p: "Pedone nero",
    },
  },
  en: {
    w: {
      k: "White king",
      q: "White queen",
      r: "White rook",
      b: "White bishop",
      n: "White knight",
      p: "White pawn",
    },
    b: {
      k: "Black king",
      q: "Black queen",
      r: "Black rook",
      b: "Black bishop",
      n: "Black knight",
      p: "Black pawn",
    },
  },
};

const copy = {
  it: {
    title: "Scacchi contro IA",
    intro:
      "Gioca una partita completa contro un avversario locale. Scegli la difficoltà, fai la tua mossa e prova a dare scacco matto.",
    label: "Gioco da tavolo",
    board: "Scacchiera",
    player: "Tu · Bianco",
    computer: "IA · Nero",
    difficulty: "Difficoltà IA",
    easy: "Facile",
    medium: "Media",
    hard: "Difficile",
    yourTurn: "È il tuo turno",
    aiTurn: "Turno dell'IA",
    aiThinking: "L'IA sta pensando…",
    inCheck: "Il tuo re è sotto scacco",
    aiInCheck: "Il re dell'IA è sotto scacco",
    playerWins: "Scacco matto: hai vinto!",
    aiWins: "Scacco matto: l'IA ha vinto",
    stalemate: "Patta per stallo",
    draw: "Partita patta",
    newGame: "Nuova partita",
    undo: "Annulla turno",
    moves: "Mosse",
    noMoves: "Le mosse appariranno qui.",
    promotion: "Scegli il pezzo per la promozione",
    promoteTo: "Promuovi a",
    emptySquare: "casella vuota",
    engineNote:
      "IA locale con ricerca di mosse e valutazione della posizione. La partita resta sul tuo dispositivo.",
    engineError:
      "L'IA non è riuscita a calcolare una mossa. Avvia una nuova partita e riprova.",
    back: "Torna a Pausa mentale",
  },
  en: {
    title: "Chess vs AI",
    intro:
      "Play a full game against a local opponent. Choose a difficulty, make your move, and try to checkmate the king.",
    label: "Board game",
    board: "Chessboard",
    player: "You · White",
    computer: "AI · Black",
    difficulty: "AI difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    yourTurn: "Your turn",
    aiTurn: "AI's turn",
    aiThinking: "AI is thinking…",
    inCheck: "Your king is in check",
    aiInCheck: "The AI king is in check",
    playerWins: "Checkmate: you win!",
    aiWins: "Checkmate: the AI wins",
    stalemate: "Draw by stalemate",
    draw: "Draw",
    newGame: "New game",
    undo: "Undo turn",
    moves: "Moves",
    noMoves: "Moves will appear here.",
    promotion: "Choose a piece for promotion",
    promoteTo: "Promote to",
    emptySquare: "empty square",
    engineNote:
      "Local AI using move search and position evaluation. Your game stays on your device.",
    engineError:
      "The AI could not calculate a move. Start a new game and try again.",
    back: "Back to Mind break",
  },
};

const promotionPieces: PromotionPiece[] = ["q", "r", "b", "n"];
const promotionNames: Record<
  "it" | "en",
  Record<PromotionPiece, string>
> = {
  it: { q: "donna", r: "torre", b: "alfiere", n: "cavallo" },
  en: { q: "queen", r: "rook", b: "bishop", n: "knight" },
};

function getStatus(
  game: Chess,
  thinking: boolean,
  engineError: string | null,
  text: (typeof copy)["it"] | (typeof copy)["en"]
) {
  if (engineError) return engineError;
  if (game.isCheckmate())
    return game.turn() === "b" ? text.playerWins : text.aiWins;
  if (game.isStalemate()) return text.stalemate;
  if (game.isDraw()) return text.draw;
  if (thinking) return text.aiThinking;
  if (game.isCheck())
    return game.turn() === "w" ? text.inCheck : text.aiInCheck;
  return game.turn() === "w" ? text.yourTurn : text.aiTurn;
}

export default function ChessGame() {
  const { language } = useLanguage();
  const locale = language === "it" ? "it" : "en";
  const text = copy[locale];
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moves, setMoves] = useState<RecordedMove[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [promotionRequest, setPromotionRequest] =
    useState<PromotionRequest | null>(null);
  const [difficulty, setDifficulty] = useState<ChessDifficulty>("medium");
  const [thinking, setThinking] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const game = gameRef.current;
  const isGameOver = game.isGameOver();
  const selectedMoves = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true })
    : [];
  const legalDestinations = useMemo(
    () => new Set(selectedMoves.map(move => move.to)),
    [fen, selectedSquare]
  );
  const latestMove = moves[moves.length - 1];
  const movePairs = useMemo(() => {
    const pairs: Array<{ number: number; white: string; black: string }> = [];
    for (let index = 0; index < moves.length; index += 2) {
      pairs.push({
        number: Math.floor(index / 2) + 1,
        white: moves[index].san,
        black: moves[index + 1]?.san ?? "",
      });
    }
    return pairs;
  }, [moves]);

  useEffect(() => {
    if (game.fen() !== fen || game.turn() !== "b" || game.isGameOver()) {
      setThinking(false);
      return;
    }

    setThinking(true);
    setEngineError(null);
    let worker: Worker;
    try {
      worker = new Worker(new URL("../lib/chessAi.worker.ts", import.meta.url), {
        type: "module",
      });
    } catch (error) {
      console.error("Chess AI worker could not be started", error);
      setEngineError(text.engineError);
      setThinking(false);
      return;
    }

    worker.onmessage = (
      event: MessageEvent<{ move?: ChessAiMove | null; error?: string }>
    ) => {
      const currentGame = gameRef.current;
      if (
        currentGame.fen() !== fen ||
        currentGame.turn() !== "b" ||
        currentGame.isGameOver()
      ) {
        setThinking(false);
        return;
      }

      try {
        if (event.data.error) {
          console.error("Chess AI failed to calculate a move", event.data.error);
          setEngineError(text.engineError);
          setThinking(false);
          return;
        }

        const aiMove = event.data.move;
        if (!aiMove) {
          setEngineError(text.engineError);
          setThinking(false);
          return;
        }

        const playedMove = currentGame.move(aiMove);
        setMoves(previous => [
          ...previous,
          {
            color: playedMove.color,
            from: playedMove.from,
            san: playedMove.san,
            to: playedMove.to,
          },
        ]);
        setFen(currentGame.fen());
        setThinking(false);
      } catch (error) {
        console.error("Chess AI returned an invalid move", error);
        setEngineError(text.engineError);
        setThinking(false);
      }
    };

    worker.onerror = event => {
      console.error("Chess AI worker failed", event.message);
      setEngineError(text.engineError);
      setThinking(false);
    };
    worker.onmessageerror = event => {
      console.error("Chess AI worker returned an unreadable response", event);
      setEngineError(text.engineError);
      setThinking(false);
    };
    worker.postMessage({ fen, difficulty });

    return () => worker.terminate();
  }, [difficulty, fen, game, text.engineError]);

  const applyMove = (move: ChessAiMove) => {
    const playedMove = game.move(move);
    setMoves(previous => [
      ...previous,
      {
        color: playedMove.color,
        from: playedMove.from,
        san: playedMove.san,
        to: playedMove.to,
      },
    ]);
    setFen(game.fen());
    setSelectedSquare(null);
    setPromotionRequest(null);
    setEngineError(null);
  };

  const handleSquareClick = (square: Square) => {
    if (thinking || isGameOver || promotionRequest || game.turn() !== "w")
      return;

    if (selectedSquare) {
      const candidate = selectedMoves.find(move => move.to === square);
      if (candidate) {
        if (candidate.promotion) {
          setPromotionRequest({ from: candidate.from, to: candidate.to });
        } else {
          applyMove({ from: candidate.from, to: candidate.to });
        }
        return;
      }
    }

    const piece = game.get(square);
    setSelectedSquare(piece?.color === "w" ? square : null);
  };

  const startNewGame = () => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setMoves([]);
    setSelectedSquare(null);
    setPromotionRequest(null);
    setThinking(false);
    setEngineError(null);
  };

  const undoTurn = () => {
    if (thinking) return;
    const undoCount = Math.min(2, game.history().length);
    if (undoCount === 0) return;
    for (let index = 0; index < undoCount; index += 1) game.undo();
    setFen(game.fen());
    setMoves(previous => previous.slice(0, -undoCount));
    setSelectedSquare(null);
    setPromotionRequest(null);
    setEngineError(null);
  };

  const choosePromotion = (piece: PromotionPiece) => {
    if (!promotionRequest) return;
    applyMove({ ...promotionRequest, promotion: piece });
  };

  const status = getStatus(game, thinking, engineError, text);
  const board = game.board();
  const moveHistoryLength = game.history().length;

  return (
    <main className="min-h-screen bg-background">
      <Seo
        title={`${text.title} | Tatik.space`}
        description={text.intro}
        path="/scacchi"
        language={locale}
      />
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground">
            <BrainCircuit className="h-4 w-4 text-primary" /> {text.label}
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            {text.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            {text.intro}
          </p>
        </div>
      </section>

      <section className="container max-w-6xl px-4 py-8 md:py-12">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <Card className="mx-auto w-full max-w-[620px]">
            <CardHeader>
              <CardTitle>{text.board}</CardTitle>
              <CardDescription className="flex flex-wrap gap-x-4 gap-y-1">
                <span>{text.player}</span>
                <span>{text.computer}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                role="grid"
                aria-label={text.board}
                className="mx-auto grid aspect-square w-full max-w-[560px] grid-cols-8 overflow-hidden rounded-md border-4 border-foreground/80 shadow-lg"
              >
                {board.flatMap((rank, row) =>
                  rank.map((piece, file) => {
                    const square =
                      `${String.fromCharCode(97 + file)}${8 - row}` as Square;
                    const selected = selectedSquare === square;
                    const isLegalDestination = legalDestinations.has(square);
                    const isLastMove =
                      latestMove?.from === square || latestMove?.to === square;
                    const lightSquare = (row + file) % 2 === 0;
                    const squareName = `${String.fromCharCode(97 + file)}${8 - row}`;
                    const pieceName = piece
                      ? pieceNames[locale][piece.color][piece.type]
                      : text.emptySquare;

                    return (
                      <button
                        key={square}
                        type="button"
                        role="gridcell"
                        aria-label={`${squareName}, ${pieceName}`}
                        aria-pressed={selected}
                        disabled={
                          thinking || isGameOver || Boolean(promotionRequest)
                        }
                        onClick={() => handleSquareClick(square)}
                        className={`relative flex aspect-square min-w-0 items-center justify-center ${
                          lightSquare ? "bg-[#f0d9b5]" : "bg-[#b58863]"
                        } ${selected ? "z-10 ring-4 ring-inset ring-yellow-400" : ""} ${
                          isLastMove && !selected
                            ? "ring-4 ring-inset ring-yellow-300/70"
                            : ""
                        } disabled:cursor-default`}
                      >
                        {piece ? (
                          <span
                            aria-hidden="true"
                            className={`select-none font-serif text-[clamp(1.7rem,8vw,3.8rem)] leading-none ${
                              piece.color === "w"
                                ? "text-white [text-shadow:0_1px_2px_#222,1px_2px_2px_#222]"
                                : "text-slate-950 [text-shadow:0_1px_1px_#fff]"
                            }`}
                          >
                            {pieceGlyphs[piece.color][piece.type]}
                          </span>
                        ) : null}
                        {isLegalDestination ? (
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none absolute h-3 w-3 rounded-full ${
                              piece
                                ? "border-4 border-emerald-500/80"
                                : "bg-emerald-700/40"
                            }`}
                          />
                        ) : null}
                        {file === 0 ? (
                          <span
                            aria-hidden="true"
                            className={`absolute left-1 top-0.5 text-[10px] font-semibold ${
                              lightSquare ? "text-[#b58863]" : "text-[#f0d9b5]"
                            }`}
                          >
                            {8 - row}
                          </span>
                        ) : null}
                        {row === 7 ? (
                          <span
                            aria-hidden="true"
                            className={`absolute bottom-0 right-1 text-[10px] font-semibold ${
                              lightSquare ? "text-[#b58863]" : "text-[#f0d9b5]"
                            }`}
                          >
                            {String.fromCharCode(97 + file)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>

              {promotionRequest ? (
                <div
                  className="rounded-lg border p-3"
                  role="group"
                  aria-label={text.promotion}
                >
                  <p className="mb-2 text-sm font-medium">{text.promotion}</p>
                  <div className="flex gap-2">
                    {promotionPieces.map(piece => (
                      <Button
                        key={piece}
                        type="button"
                        variant="outline"
                        onClick={() => choosePromotion(piece)}
                      >
                        <span className="font-serif text-xl" aria-hidden="true">
                          {pieceGlyphs.w[piece]}
                        </span>
                        {text.promoteTo} {promotionNames[locale][piece]}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div
                aria-live="polite"
                role={engineError ? "alert" : "status"}
                className={`rounded-lg border p-3 text-center font-medium ${
                  engineError
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "bg-muted/40"
                }`}
              >
                {status}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>{text.difficulty}</CardTitle>
                <CardDescription>{text.engineNote}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label htmlFor="chess-difficulty" className="sr-only">
                  {text.difficulty}
                </label>
                <select
                  id="chess-difficulty"
                  value={difficulty}
                  onChange={event =>
                    setDifficulty(event.target.value as ChessDifficulty)
                  }
                  disabled={thinking}
                  className="h-11 w-full rounded-md border border-input bg-background px-3"
                >
                  <option value="easy">{text.easy}</option>
                  <option value="medium">{text.medium}</option>
                  <option value="hard">{text.hard}</option>
                </select>
                <Button type="button" className="w-full" onClick={startNewGame}>
                  <RotateCcw className="h-4 w-4" /> {text.newGame}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={undoTurn}
                  disabled={thinking || moveHistoryLength === 0}
                >
                  <Undo2 className="h-4 w-4" /> {text.undo}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{text.moves}</CardTitle>
              </CardHeader>
              <CardContent>
                {movePairs.length > 0 ? (
                  <ol className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-3 text-sm">
                    {movePairs.map(pair => (
                      <li
                        key={pair.number}
                        className="grid grid-cols-[2rem_1fr_1fr] gap-3"
                      >
                        <span className="text-muted-foreground">
                          {pair.number}.
                        </span>
                        <span>{pair.white}</span>
                        <span>{pair.black}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="rounded-md border p-3 text-sm text-muted-foreground">
                    {text.noMoves}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
