import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Clock3, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

type AgeKey = "kids" | "youth" | "adult";

type Question = {
  category: string;
  prompt: string;
  options: string[];
  correct: number;
};

const content = {
  it: {
    title: "Pausa mentale",
    intro: "Fai una pausa consapevole e allena attenzione, sequenze e ragionamento con 8 sfide brevi.",
    label: "Allenamento cognitivo",
    ageLabel: "Fascia d'età",
    ages: [
      { value: "kids", label: "5–13 anni" },
      { value: "youth", label: "14–17 anni" },
      { value: "adult", label: "18+ anni" },
    ],
    start: "Inizia le sfide",
    advancedTitle: "Vuoi una sfida più complessa?",
    advancedDescription: "Enigmi a più passaggi, codici e deduzioni, in un gioco separato con spiegazioni.",
    advancedLink: "Scopri Enigma: sfida avanzata",
    chessTitle: "Scacchi contro IA",
    chessDescription: "Gioca una partita completa contro l'intelligenza artificiale e scegli la difficoltà.",
    chessLink: "Gioca a scacchi",
    question: "Domanda",
    of: "di",
    choose: "Scegli una risposta",
    continue: "Continua",
    finish: "Vedi risultato",
    resultTitle: "Profilo della sessione",
    correct: "Risposte corrette",
    time: "Tempo",
    restart: "Gioca di nuovo",
    disclaimer: "Le sfide hanno finalità ludico-educative e non misurano né stimano il QI. I risultati non costituiscono una valutazione psicometrica o diagnostica.",
    scoreLabels: ["Ottimo allenamento", "Buon risultato", "Ottimo punto di partenza"],
  },
  en: {
    title: "Mind break",
    intro: "Take a mindful break and train attention, sequences and reasoning with 8 short challenges.",
    label: "Cognitive workout",
    ageLabel: "Age range",
    ages: [
      { value: "kids", label: "Ages 5–13" },
      { value: "youth", label: "Ages 14–17" },
      { value: "adult", label: "Ages 18+" },
    ],
    start: "Start challenges",
    advancedTitle: "Ready for a tougher challenge?",
    advancedDescription: "Multi-step enigmas, codes, and deduction in a separate game with explanations.",
    advancedLink: "Explore Enigma: advanced challenge",
    chessTitle: "Chess vs AI",
    chessDescription: "Play a full game against the AI and choose your difficulty.",
    chessLink: "Play chess",
    question: "Question",
    of: "of",
    choose: "Choose an answer",
    continue: "Continue",
    finish: "View result",
    resultTitle: "Session profile",
    correct: "Correct answers",
    time: "Time",
    restart: "Play again",
    disclaimer: "These challenges are for education and play only; they do not measure or estimate IQ. Results are not a psychological or diagnostic assessment.",
    scoreLabels: ["Excellent exercise", "Good result", "Strong starting point"],
  },
};

const questions = {
  it: {
    kids: [
      { category: "Sequenze", prompt: "Quale numero viene dopo: 2, 4, 6, 8, ...?", options: ["9", "10", "12", "7"], correct: 1 },
      { category: "Classificazione", prompt: "Quale elemento non appartiene al gruppo: mela, banana, automobile, fragola?", options: ["Mela", "Banana", "Automobile", "Fragola"], correct: 2 },
      { category: "Analogie", prompt: "Il pesce vive nell'acqua: l'uccello vive principalmente nel...?", options: ["Cielo", "Sasso", "Acqua", "Libro"], correct: 0 },
      { category: "Ragionamento", prompt: "Luca ha 3 mele, ne dà 1 a Sara e ne trova 2. Quante ne ha?", options: ["2", "4", "5", "6"], correct: 1 },
      { category: "Pattern", prompt: "Completa lo schema: A, BB, CCC, ...", options: ["DDDD", "DD", "D", "CCCC"], correct: 0 },
      { category: "Deduzione", prompt: "Tutti i cani abbaiano. Fido è un cane. Cosa fa Fido?", options: ["Miagola", "Abbaia", "Vola", "Nuota"], correct: 1 },
      { category: "Spazio", prompt: "Quanti lati hanno due triangoli?", options: ["3", "4", "6", "8"], correct: 2 },
      { category: "Logica", prompt: "Se ieri fosse domani, oggi sarebbe venerdì. Che giorno è oggi?", options: ["Mercoledì", "Giovedì", "Venerdì", "Sabato"], correct: 1 },
    ],
    youth: [
      { category: "Numeri", prompt: "Quale numero completa la serie: 3, 6, 12, 24, ...?", options: ["36", "48", "30", "42"], correct: 1 },
      { category: "Analogie", prompt: "Termometro sta a temperatura come orologio sta a...?", options: ["Lancetta", "Tempo", "Polso", "Sveglia"], correct: 1 },
      { category: "Intruso", prompt: "Individua il termine estraneo: triangolo, quadrato, cerchio, cubo.", options: ["Triangolo", "Quadrato", "Cerchio", "Cubo"], correct: 3 },
      { category: "Deduzione", prompt: "Anna è più veloce di Giulia. Chiara è più lenta di Giulia. Chi è la più veloce?", options: ["Anna", "Giulia", "Chiara", "Tutte uguali"], correct: 0 },
      { category: "Alfabeto", prompt: "Quale lettera continua: A, C, E, G, ...?", options: ["H", "I", "L", "F"], correct: 1 },
      { category: "Operazioni", prompt: "Trova il numero mancante: 2 (10) 5 | 3 (12) 4 | 6 (? ) 3", options: ["9", "18", "15", "21"], correct: 1 },
      { category: "Corsa", prompt: "Se superi il secondo classificato, in quale posizione ti trovi?", options: ["Prima", "Seconda", "Terza", "Ultima"], correct: 1 },
      { category: "Spazio", prompt: "Quanti lati hanno in totale due triangoli e un quadrato?", options: ["8", "10", "12", "9"], correct: 1 },
    ],
    adult: [
      { category: "Sequenze", prompt: "Quale numero completa: 2, 5, 11, 23, 47, ...?", options: ["94", "95", "89", "91"], correct: 1 },
      { category: "Analogie", prompt: "Acqua sta a tubatura come elettricità sta a...?", options: ["Lampadina", "Cavo", "Interruttore", "Centrale"], correct: 1 },
      { category: "Deduzione", prompt: "Se alcuni Bloop sono Razz e tutti i Razz sono Loo, cosa è certamente vero?", options: ["Tutti i Bloop sono Loo", "Alcuni Bloop sono sicuramente Loo", "Nessun Loo è Bloop", "Tutti i Loo sono Razz"], correct: 1 },
      { category: "Tempo", prompt: "Un orologio avanza di 4 minuti ogni ora. Alle 18:00 reali segnerà...?", options: ["18:20", "18:24", "17:36", "18:30"], correct: 1 },
      { category: "Intruso", prompt: "Individua il termine estraneo: epistemologia, ontologia, etica, fisiologia.", options: ["Epistemologia", "Ontologia", "Etica", "Fisiologia"], correct: 3 },
      { category: "Alfanumerico", prompt: "Quale lettera continua: Z, X, U, Q, L, ...?", options: ["F", "G", "H", "E"], correct: 0 },
      { category: "Spazio", prompt: "Un cubo dipinto viene tagliato in 27 cubetti. Quanti hanno due facce dipinte?", options: ["8", "12", "6", "16"], correct: 1 },
      { category: "Sintesi", prompt: "Se domani fosse ieri, oggi sarebbe lunedì. Che giorno è oggi?", options: ["Sabato", "Domenica", "Martedì", "Mercoledì"], correct: 1 },
    ],
  },
  en: {
    kids: [
      { category: "Sequences", prompt: "What comes next: 2, 4, 6, 8, ...?", options: ["9", "10", "12", "7"], correct: 1 },
      { category: "Classification", prompt: "Which item does not belong: apple, banana, car, strawberry?", options: ["Apple", "Banana", "Car", "Strawberry"], correct: 2 },
      { category: "Analogies", prompt: "A fish lives in water. A bird mainly lives in...?", options: ["The sky", "A rock", "Water", "A book"], correct: 0 },
      { category: "Reasoning", prompt: "Luke has 3 apples, gives 1 to Sam and finds 2 more. How many does he have?", options: ["2", "4", "5", "6"], correct: 1 },
      { category: "Pattern", prompt: "Complete the pattern: A, BB, CCC, ...", options: ["DDDD", "DD", "D", "CCCC"], correct: 0 },
      { category: "Deduction", prompt: "All dogs bark. Fido is a dog. What does Fido do?", options: ["Meow", "Bark", "Fly", "Swim"], correct: 1 },
      { category: "Space", prompt: "How many sides do two triangles have?", options: ["3", "4", "6", "8"], correct: 2 },
      { category: "Logic", prompt: "If yesterday were tomorrow, today would be Friday. What day is today?", options: ["Wednesday", "Thursday", "Friday", "Saturday"], correct: 1 },
    ],
    youth: [
      { category: "Numbers", prompt: "What completes the sequence: 3, 6, 12, 24, ...?", options: ["36", "48", "30", "42"], correct: 1 },
      { category: "Analogies", prompt: "A thermometer is to temperature as a clock is to...?", options: ["Hand", "Time", "Wrist", "Alarm"], correct: 1 },
      { category: "Odd one out", prompt: "Find the odd term: triangle, square, circle, cube.", options: ["Triangle", "Square", "Circle", "Cube"], correct: 3 },
      { category: "Deduction", prompt: "Anna is faster than Julia. Claire is slower than Julia. Who is fastest?", options: ["Anna", "Julia", "Claire", "All equal"], correct: 0 },
      { category: "Alphabet", prompt: "What comes next: A, C, E, G, ...?", options: ["H", "I", "L", "F"], correct: 1 },
      { category: "Operations", prompt: "Find the missing number: 2 (10) 5 | 3 (12) 4 | 6 (? ) 3", options: ["9", "18", "15", "21"], correct: 1 },
      { category: "Race", prompt: "If you pass the runner in second place, what place are you in?", options: ["First", "Second", "Third", "Last"], correct: 1 },
      { category: "Space", prompt: "How many sides do two triangles and one square have in total?", options: ["8", "10", "12", "9"], correct: 1 },
    ],
    adult: [
      { category: "Sequences", prompt: "What completes: 2, 5, 11, 23, 47, ...?", options: ["94", "95", "89", "91"], correct: 1 },
      { category: "Analogies", prompt: "Water is to a pipe as electricity is to...?", options: ["Bulb", "Cable", "Switch", "Plant"], correct: 1 },
      { category: "Deduction", prompt: "If some Bloop are Razz and all Razz are Loo, what is certainly true?", options: ["All Bloop are Loo", "Some Bloop are certainly Loo", "No Loo are Bloop", "All Loo are Razz"], correct: 1 },
      { category: "Time", prompt: "A clock gains 4 minutes per hour. When real time is 18:00, what does it show?", options: ["18:20", "18:24", "17:36", "18:30"], correct: 1 },
      { category: "Odd one out", prompt: "Find the odd term: epistemology, ontology, ethics, physiology.", options: ["Epistemology", "Ontology", "Ethics", "Physiology"], correct: 3 },
      { category: "Alphanumeric", prompt: "What comes next: Z, X, U, Q, L, ...?", options: ["F", "G", "H", "E"], correct: 0 },
      { category: "Space", prompt: "A painted cube is cut into 27 equal cubes. How many have exactly two painted faces?", options: ["8", "12", "6", "16"], correct: 1 },
      { category: "Synthesis", prompt: "If tomorrow were yesterday, today would be Monday. What day is today?", options: ["Saturday", "Sunday", "Tuesday", "Wednesday"], correct: 1 },
    ],
  },
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function LogicGames() {
  const { language } = useLanguage();
  const locale = language === "it" ? "it" : "en";
  const text = content[locale];
  const [ageKey, setAgeKey] = useState<AgeKey>("adult");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const activeQuestions = useMemo<Question[]>(
    () => questions[locale][ageKey],
    [ageKey, locale],
  );

  useEffect(() => {
    if (!started || finished) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, finished]);

  const begin = () => {
    setStarted(true);
    setFinished(false);
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setElapsed(0);
  };

  const restart = () => {
    setStarted(false);
    setFinished(false);
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setElapsed(0);
  };

  const continueQuiz = () => {
    if (selected === null) return;
    const newScore = score + (selected === activeQuestions[questionIndex].correct ? 1 : 0);
    setScore(newScore);
    if (questionIndex === activeQuestions.length - 1) {
      setFinished(true);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
  };

  const scoreLabel = score >= 7 ? text.scoreLabels[0] : score >= 5 ? text.scoreLabels[1] : text.scoreLabels[2];
  const progress = ((questionIndex + (started ? 1 : 0)) / activeQuestions.length) * 100;

  return (
    <main className="min-h-screen bg-background">
      <Seo
        title={`${text.title} | Tatik.space`}
        description={text.intro}
        path="/pausa-mentale"
        language={locale}
      />
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-5xl px-4 py-12 md:py-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground">
            <BrainCircuit className="h-4 w-4 text-primary" /> {text.label}
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">{text.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{text.intro}</p>
        </div>
      </section>

      <section className="container max-w-5xl px-4 py-8 md:py-12">
        {!started ? (
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{text.ageLabel}</CardTitle>
                <CardDescription>{text.disclaimer}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <select
                  value={ageKey}
                  onChange={(event) => setAgeKey(event.target.value as AgeKey)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3"
                >
                  {text.ages.map((age) => (
                    <option key={age.value} value={age.value}>{age.label}</option>
                  ))}
                </select>
                <Button type="button" className="w-full" onClick={begin}>
                  <Sparkles className="mr-2 h-4 w-4" /> {text.start}
                </Button>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>{text.advancedTitle}</CardTitle>
                <CardDescription>{text.advancedDescription}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/sfida-logica-avanzata">{text.advancedLink}</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>{text.chessTitle}</CardTitle>
                <CardDescription>{text.chessDescription}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/scacchi">{text.chessLink}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : finished ? (
          <Card className="mx-auto max-w-2xl overflow-hidden">
            <div className="bg-primary px-6 py-8 text-center text-primary-foreground">
              <Trophy className="mx-auto mb-3 h-10 w-10" />
              <CardTitle className="text-primary-foreground">{text.resultTitle}</CardTitle>
              <p className="mt-2 text-2xl font-bold">{scoreLabel}</p>
            </div>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground">{text.correct}</p>
                <p className="mt-1 text-3xl font-bold">{score}/{activeQuestions.length}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground">{text.time}</p>
                <p className="mt-1 text-3xl font-bold">{formatTime(elapsed)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="mb-5 text-sm text-muted-foreground">{text.disclaimer}</p>
                <Button type="button" variant="outline" className="w-full" onClick={restart}>
                  <RotateCcw className="mr-2 h-4 w-4" /> {text.restart}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">{text.question} {questionIndex + 1} {text.of} {activeQuestions.length}</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock3 className="h-4 w-4" /> {formatTime(elapsed)}
                </span>
              </div>
              <Progress value={progress} aria-label={`${text.question} ${questionIndex + 1}`} />
              <CardDescription>{activeQuestions[questionIndex].category}</CardDescription>
              <CardTitle className="text-xl md:text-2xl">{activeQuestions[questionIndex].prompt}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeQuestions[questionIndex].options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                    selected === index
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-primary/60 hover:bg-accent"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </button>
              ))}
              <Button type="button" className="mt-2 w-full" disabled={selected === null} onClick={continueQuiz}>
                {questionIndex === activeQuestions.length - 1 ? text.finish : text.continue}
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
