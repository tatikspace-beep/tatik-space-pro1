import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  advancedLogicChallenges,
  type LogicAgeGroup,
} from "./advancedLogicChallenges";

const copy = {
  it: {
    title: "Enigma: sfida avanzata",
    intro:
      "Una nuova avventura di deduzione, codici e problemi a più passaggi. Scegli la fascia d'età e affronta 10 enigmi con spiegazioni dopo ogni risposta.",
    label: "Percorso separato · livello avanzato",
    ageLabel: "Scegli la fascia d'età",
    ages: [
      { value: "kids", label: "5–13 anni" },
      { value: "youth", label: "14–17 anni" },
      { value: "adult", label: "18+ anni" },
    ],
    start: "Inizia la sfida",
    question: "Enigma",
    of: "di",
    choose: "Seleziona una risposta, poi verificala.",
    verify: "Verifica risposta",
    correct: "Esatto!",
    incorrect: "Non proprio.",
    continue: "Enigma successivo",
    finish: "Vedi risultato",
    resultTitle: "Sfida completata",
    score: "Risposte corrette",
    time: "Tempo",
    restart: "Ricomincia",
    back: "Torna a Pausa mentale",
    successTitle: "Codice sbloccato!",
    closeTitle: "Un altro tentativo ti porterà più lontano",
    disclaimer:
      "Attività originale a scopo ludico-educativo. Non è un test ufficiale, non misura né stima il QI e non costituisce una valutazione diagnostica.",
  },
  en: {
    title: "Enigma: advanced challenge",
    intro:
      "A new adventure in deduction, codes, and multi-step problems. Choose an age range and solve 10 enigmas with explanations after each answer.",
    label: "Separate experience · advanced level",
    ageLabel: "Choose an age range",
    ages: [
      { value: "kids", label: "Ages 5–13" },
      { value: "youth", label: "Ages 14–17" },
      { value: "adult", label: "Ages 18+" },
    ],
    start: "Start the challenge",
    question: "Enigma",
    of: "of",
    choose: "Select an answer, then check it.",
    verify: "Check answer",
    correct: "Correct!",
    incorrect: "Not quite.",
    continue: "Next enigma",
    finish: "View result",
    resultTitle: "Challenge complete",
    score: "Correct answers",
    time: "Time",
    restart: "Start again",
    back: "Back to Mind break",
    successTitle: "Code unlocked!",
    closeTitle: "Another try will take you further",
    disclaimer:
      "Original activity for education and play. It is not an official test, does not measure or estimate IQ, and is not a diagnostic assessment.",
  },
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function AdvancedLogicGame() {
  const { language } = useLanguage();
  const locale = language === "it" ? "it" : "en";
  const text = copy[locale];
  const [ageGroup, setAgeGroup] = useState<LogicAgeGroup>("adult");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const challenges = useMemo(
    () =>
      advancedLogicChallenges[ageGroup].map(challenge => ({
        ...challenge,
        ...challenge[locale],
      })),
    [ageGroup, locale]
  );
  const currentChallenge = challenges[questionIndex];

  useEffect(() => {
    if (!started || finished) return;
    const timer = window.setInterval(
      () => setElapsed(value => value + 1),
      1000
    );
    return () => window.clearInterval(timer);
  }, [started, finished]);

  const start = () => {
    setStarted(true);
    setFinished(false);
    setQuestionIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setElapsed(0);
  };

  const restart = () => {
    setStarted(false);
    setFinished(false);
    setQuestionIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setElapsed(0);
  };

  const verify = () => {
    if (selected === null || checked) return;
    if (selected === currentChallenge.correct) setScore(value => value + 1);
    setChecked(true);
  };

  const next = () => {
    if (!checked) return;
    if (questionIndex === challenges.length - 1) {
      setFinished(true);
      return;
    }
    setQuestionIndex(value => value + 1);
    setSelected(null);
    setChecked(false);
  };

  const progress =
    ((questionIndex + (started ? 1 : 0)) / challenges.length) * 100;
  const resultTitle = score >= 8 ? text.successTitle : text.closeTitle;

  return (
    <main className="min-h-screen bg-background">
      <Seo
        title={`${text.title} | Tatik.space`}
        description={text.intro}
        path="/sfida-logica-avanzata"
        language={locale}
      />
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-5xl px-4 py-12 md:py-16">
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

      <section className="container max-w-5xl px-4 py-8 md:py-12">
        {!started ? (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>{text.ageLabel}</CardTitle>
              <CardDescription>{text.disclaimer}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <select
                aria-label={text.ageLabel}
                value={ageGroup}
                onChange={event =>
                  setAgeGroup(event.target.value as LogicAgeGroup)
                }
                className="h-11 w-full rounded-md border border-input bg-background px-3"
              >
                {text.ages.map(age => (
                  <option key={age.value} value={age.value}>
                    {age.label}
                  </option>
                ))}
              </select>
              <Button type="button" className="w-full" onClick={start}>
                <Sparkles className="h-4 w-4" /> {text.start}
              </Button>
            </CardContent>
          </Card>
        ) : finished ? (
          <Card className="mx-auto max-w-2xl overflow-hidden">
            <div className="bg-primary px-6 py-8 text-center text-primary-foreground">
              <Trophy className="mx-auto mb-3 h-10 w-10" />
              <CardTitle className="text-primary-foreground">
                {text.resultTitle}
              </CardTitle>
              <p className="mt-2 text-2xl font-bold">{resultTitle}</p>
            </div>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground">{text.score}</p>
                <p className="mt-1 text-3xl font-bold">
                  {score}/{challenges.length}
                </p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground">{text.time}</p>
                <p className="mt-1 text-3xl font-bold">{formatTime(elapsed)}</p>
              </div>
              <div className="space-y-3 sm:col-span-2">
                <p className="text-sm text-muted-foreground">
                  {text.disclaimer}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={restart}
                >
                  <RotateCcw className="h-4 w-4" /> {text.restart}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">
                  {text.question} {questionIndex + 1} {text.of}{" "}
                  {challenges.length}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock3 className="h-4 w-4" /> {formatTime(elapsed)}
                </span>
              </div>
              <Progress
                value={progress}
                aria-label={`${text.question} ${questionIndex + 1}`}
              />
              <CardDescription>{currentChallenge.category}</CardDescription>
              <CardTitle className="text-xl md:text-2xl">
                {currentChallenge.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">{text.choose}</p>
              <div className="grid gap-3">
                {currentChallenge.options.map((option, index) => {
                  const isAnswer = index === currentChallenge.correct;
                  const isSelected = index === selected;
                  const stateClass =
                    checked && isAnswer
                      ? "border-emerald-600 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100"
                      : checked && isSelected
                        ? "border-destructive bg-destructive/10 text-foreground"
                        : isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-accent/50";
                  return (
                    <button
                      key={`${currentChallenge.id}-${index}`}
                      type="button"
                      aria-pressed={isSelected}
                      disabled={checked}
                      onClick={() => setSelected(index)}
                      className={`flex min-h-12 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors disabled:cursor-default ${stateClass}`}
                    >
                      <span>{option}</span>
                      {checked && isAnswer ? (
                        <CheckCircle2
                          className="h-5 w-5 shrink-0"
                          aria-hidden="true"
                        />
                      ) : null}
                      {checked && isSelected && !isAnswer ? (
                        <XCircle
                          className="h-5 w-5 shrink-0 text-destructive"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {checked ? (
                <div
                  role="status"
                  className={`rounded-lg border p-4 ${selected === currentChallenge.correct ? "border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/30" : "border-border bg-muted/40"}`}
                >
                  <p className="mb-1 flex items-center gap-2 font-semibold">
                    {selected === currentChallenge.correct ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    {selected === currentChallenge.correct
                      ? text.correct
                      : text.incorrect}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentChallenge.explanation}
                  </p>
                </div>
              ) : null}
              <Button
                type="button"
                className="w-full"
                disabled={checked ? false : selected === null}
                onClick={checked ? next : verify}
              >
                {checked
                  ? questionIndex === challenges.length - 1
                    ? text.finish
                    : text.continue
                  : text.verify}
                {checked ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
            </CardContent>
          </Card>
        )}
        <div className="mx-auto mt-6 max-w-2xl">
          <Button asChild variant="ghost" className="px-0">
            <Link href="/pausa-mentale">
              <ArrowLeft className="h-4 w-4" /> {text.back}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
