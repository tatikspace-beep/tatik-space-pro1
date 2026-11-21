import { useMemo, useState } from "react";
import { AlertCircle, BrainCircuit, Loader2, Upload } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Seo } from "@/components/Seo";
import { MlStudioSources } from "@/components/MlStudioSources";
import { AnalyticsReportDownload, AnalyticsUsageNotice } from "@/components/AnalyticsReportDownload";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createMlAssessment } from "@/lib/mlStudioAssessment";
import type { AnalyticsReportVisual } from "@/lib/analyticsReportPdf";
import { trpc } from "@/lib/trpc";

const copy = {
  it: {
    title: "ML Studio",
    description: "Addestra e confronta modelli di machine learning su dataset CSV, JSON ed Excel.",
    intro: "Porta l’analisi ML in qualunque settore: scegli il problema, indica l’obiettivo e confronta modelli con un test separato.",
    dataset: "Dataset tabellare",
    file: "Carica un dataset tabellare singolo (CSV, JSON o XLSX)",
    fileLimit: "Elaborazione temporanea sulla Function Vercel esistente: massimo 2,5 MB, 10.000 righe e 50 colonne. Il dataset non viene salvato.",
    task: "Tipo di problema",
    classification: "Classificazione",
    regression: "Regressione",
    sector: "Settore o contesto (facoltativo)",
    sectorPlaceholder: "Es. salute, finanza, ambiente, vendite",
    target: "Variabile obiettivo",
    features: "Variabili predittive",
    run: "Addestra e confronta",
    working: "Elaborazione…",
    models: "Confronto modelli su test separato",
    model: "Modello",
    observations: "osservazioni",
    train: "addestramento",
    accuracy: "Accuratezza",
    balancedAccuracy: "Accuratezza bilanciata",
    macroF1: "F1 macro",
    r2: "R²",
    mae: "MAE",
    rmse: "RMSE",
    best: "Miglior modello sul test",
    importance: "Variabili piu influenti (Random Forest)",
    rows: "Righe",
    testRows: "Test",
    metricsChart: "Confronto visuale delle metriche",
    chartType: "Tipo di grafico",
    chartBars: "Barre",
    chartLines: "Linee",
    chartRadar: "Radar",
    chartScatter: "Dispersione",
    chartScatterNote: "Classificazione: accuratezza vs F1 macro; dimensione del punto = accuratezza bilanciata. Regressione: MAE vs RMSE.",
    errorsChart: "Errori sul test (nelle unità del target)",
    assessmentDisclaimer: "Indicazione automatica, non certificata.",
    confusion: "Matrice di confusione · righe = classe reale, colonne = classe prevista",
    realPredicted: "Reale / Prevista",
    explainTitle: "Chiedi un’interpretazione AI (facoltativa)",
    question: "La tua domanda",
    questionPlaceholder: "Es. Quale modello generalizza meglio e quali limiti devo considerare?",
    consent: "Invia al modello AI soltanto domanda, settore e metriche aggregate. Non inviare le righe originali del dataset.",
    freeOnly: "Usa solo la rotta OpenRouter openrouter/free, senza fallback a modelli a pagamento. La disponibilita e la quota gratuita dipendono dal provider e non sono garantite.",
    explain: "Genera interpretazione gratuita",
    answer: "Interpretazione",
    method: "La classificazione confronta Random Forest, SVM lineare e una rete neurale MLP leggera; la regressione confronta Random Forest, Ridge e MLP. Il test casuale 80/20 non e una validazione indipendente. La MLP non e una CNN per immagini. Le metriche non dimostrano causalita e non sostituiscono una valutazione esperta.",
    login: "Accedi per usare il ML Studio.",
    signIn: "Accedi",
  },
  en: {
    title: "ML Studio",
    description: "Train and compare machine-learning models on CSV, JSON, and Excel datasets.",
    intro: "Bring ML analysis to any sector: choose a task, select its target, and compare models against a held-out test set.",
    dataset: "Tabular dataset",
    file: "Upload one tabular dataset (CSV, JSON, or XLSX)",
    fileLimit: "Temporary processing on the existing Vercel Function: max 2.5 MB, 10,000 rows, and 50 columns. The dataset is not stored.",
    task: "Problem type",
    classification: "Classification",
    regression: "Regression",
    sector: "Sector or context (optional)",
    sectorPlaceholder: "e.g. health, finance, environment, sales",
    target: "Target variable",
    features: "Predictor variables",
    run: "Train and compare",
    working: "Processing…",
    models: "Model comparison on held-out test set",
    model: "Model",
    observations: "observations",
    train: "training",
    accuracy: "Accuracy",
    balancedAccuracy: "Balanced accuracy",
    macroF1: "Macro F1",
    r2: "R²",
    mae: "MAE",
    rmse: "RMSE",
    best: "Best model on test set",
    importance: "Most influential variables (Random Forest)",
    rows: "Rows",
    testRows: "Test",
    metricsChart: "Visual model comparison",
    chartType: "Chart type",
    chartBars: "Bars",
    chartLines: "Lines",
    chartRadar: "Radar",
    chartScatter: "Scatter",
    chartScatterNote: "Classification: accuracy vs macro F1; point size = balanced accuracy. Regression: MAE vs RMSE.",
    errorsChart: "Test errors (in target units)",
    assessmentDisclaimer: "Automated guidance, not certified.",
    confusion: "Confusion matrix · rows = actual class, columns = predicted class",
    realPredicted: "Actual / Predicted",
    explainTitle: "Ask for an AI interpretation (optional)",
    question: "Your question",
    questionPlaceholder: "e.g. Which model generalizes better and what limitations should I consider?",
    consent: "Send only the question, sector, and aggregate metrics to the AI model. Original dataset rows are not sent.",
    freeOnly: "Uses only the OpenRouter openrouter/free route, with no paid-model fallback. Provider availability and free quotas are controlled by the provider and are not guaranteed.",
    explain: "Generate free interpretation",
    answer: "Interpretation",
    method: "Classification compares Random Forest, linear SVM, and a lightweight neural MLP; regression compares Random Forest, Ridge, and MLP. The random 80/20 test split is not independent validation. MLP is not an image CNN. Metrics do not prove causality or replace expert review.",
    login: "Sign in to use ML Studio.",
    signIn: "Sign in",
  },
};

function encodeBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function formatMetric(value: number | undefined) {
  return value === undefined ? "—" : value.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

export default function MlStudio() {
  const { language } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const text = copy[language === "it" ? "it" : "en"];
  const [file, setFile] = useState<{ name: string; contentBase64: string } | null>(null);
  const [preview, setPreview] = useState<{
    name: string;
    rows: number;
    columns: Array<{ name: string; kind: "numeric" | "category"; nonEmpty: number }>;
  } | null>(null);
  const [task, setTask] = useState<"classification" | "regression">("classification");
  const [target, setTarget] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line" | "radar" | "scatter">("bar");
  const [sector, setSector] = useState("");
  const [question, setQuestion] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [answer, setAnswer] = useState("");
  const previewMutation = trpc.mlStudio.previewDataset.useMutation();
  const trainMutation = trpc.mlStudio.trainTabular.useMutation();
  const explainMutation = trpc.mlStudio.explainResults.useMutation();
  const result = trainMutation.data;
  const assessment = useMemo(
    () => result ? createMlAssessment(result, language === "it" ? "it" : "en") : null,
    [result, language],
  );
  const reportContent = useMemo(() => {
    if (!result || !assessment) return "";
    const modelMetrics = result.models.map((model) => result.task === "classification"
      ? `${model.name}: accuracy ${formatMetric(model.accuracy)}, balanced accuracy ${formatMetric(model.balancedAccuracy)}, macro F1 ${formatMetric(model.macroF1)}`
      : `${model.name}: R² ${formatMetric(model.r2)}, MAE ${formatMetric(model.mae)}, RMSE ${formatMetric(model.rmse)}`);
    return [
      `Dataset: ${result.fileName}`,
      `Task: ${result.task}; target: ${result.target}`,
      `Rows: ${result.usableRows}; training: ${result.trainRows}; test: ${result.testRows}`,
      `Best model: ${result.bestModel}`,
      "",
      "Model metrics:",
      ...modelMetrics,
      "",
      "Technical assessment:",
      `Summary: ${assessment.summary}`,
      "Key findings:",
      ...assessment.findings.map((finding) => `• ${finding}`),
      `Methodological note: ${assessment.disclaimer}`,
      "",
      "Feature importance:",
      ...result.featureImportance.map((feature) => `${feature.name}: ${formatMetric(feature.importance)}`),
      "",
      "Warnings:",
      ...(result.warnings.length ? result.warnings : ["None"]),
    ].join("\n");
  }, [assessment, result]);
  const classificationChartData = result?.task === "classification"
    ? result.models.map((model) => ({
      model: model.name,
      accuracy: model.accuracy ?? 0,
      balancedAccuracy: model.balancedAccuracy ?? 0,
      macroF1: model.macroF1 ?? 0,
    }))
    : [];
  const radarChartData = result?.task === "classification"
    ? [
      { metric: text.accuracy, ...Object.fromEntries(result.models.map((model) => [model.name, model.accuracy ?? 0])) },
      { metric: text.balancedAccuracy, ...Object.fromEntries(result.models.map((model) => [model.name, model.balancedAccuracy ?? 0])) },
      { metric: text.macroF1, ...Object.fromEntries(result.models.map((model) => [model.name, model.macroF1 ?? 0])) },
    ]
    : [];
  const regressionErrorData = result?.task === "regression"
    ? result.models.map((model) => ({ model: model.name, mae: model.mae ?? 0, rmse: model.rmse ?? 0 }))
    : [];
  const bestConfusionMatrix = result?.models.find((model) => model.name === result.bestModel)?.confusionMatrix ?? [];
  const maxConfusionCount = Math.max(1, ...bestConfusionMatrix.flat());
  const reportVisuals = useMemo<AnalyticsReportVisual[]>(() => {
    if (!result) return [];
    const visuals: AnalyticsReportVisual[] = [];
    if (result.task === "classification") {
      visuals.push({
        type: "chart",
        title: text.metricsChart,
        chartType: "bar",
        orientation: "horizontal",
        categories: result.models.map((model) => model.name),
        series: [
          { name: text.accuracy, color: "#2563eb", values: result.models.map((model) => model.accuracy ?? null) },
          { name: text.balancedAccuracy, color: "#16a34a", values: result.models.map((model) => model.balancedAccuracy ?? null) },
          { name: text.macroF1, color: "#f59e0b", values: result.models.map((model) => model.macroF1 ?? null) },
        ],
        minValue: 0,
        maxValue: 1,
      });
      if (result.classLabels.length && result.classLabels.length <= 10 && bestConfusionMatrix.length) {
        visuals.push({
          type: "matrix",
          title: text.confusion,
          rowLabels: result.classLabels,
          columnLabels: result.classLabels,
          values: bestConfusionMatrix,
        });
      }
    } else {
      visuals.push({
        type: "chart",
        title: text.r2,
        chartType: "bar",
        orientation: "horizontal",
        categories: result.models.map((model) => model.name),
        series: [{ name: text.r2, color: "#2563eb", values: result.models.map((model) => model.r2 ?? null) }],
      }, {
        type: "chart",
        title: text.errorsChart,
        chartType: "bar",
        orientation: "horizontal",
        categories: result.models.map((model) => model.name),
        series: [
          { name: text.mae, color: "#16a34a", values: result.models.map((model) => model.mae ?? null) },
          { name: text.rmse, color: "#f59e0b", values: result.models.map((model) => model.rmse ?? null) },
        ],
        minValue: 0,
      });
    }
    if (result.featureImportance.length) {
      const topFeatures = result.featureImportance.slice(0, 12);
      visuals.push({
        type: "chart",
        title: `${text.importance} (top ${topFeatures.length})`,
        chartType: "bar",
        orientation: "horizontal",
        categories: topFeatures.map((feature) => feature.name),
        series: [{ name: text.importance, color: "#0f766e", values: topFeatures.map((feature) => feature.importance) }],
        minValue: 0,
      });
    }
    return visuals;
  }, [bestConfusionMatrix, result, text]);
  const activeChartType = chartType === "radar" && result?.task !== "classification" ? "bar" : chartType;
  const usableTargets = useMemo(
    () => preview?.columns.filter((column) => task === "classification" || column.kind === "numeric") ?? [],
    [preview, task],
  );

  const loadDatasetPayload = async (dataset: { name: string; contentBase64: string }) => {
    setError("");
    setAnswerError("");
    setAnswer("");
    setConsent(false);
    setQuestion("");
    trainMutation.reset();
    setPreview(null);
    setFile(null);
    const data = await previewMutation.mutateAsync(dataset);
    setFile(dataset);
    setPreview(data);
    const defaultTask = data.columns.some((column) => column.kind === "category") ? "classification" : "regression";
    setTask(defaultTask);
    const defaultTarget = data.columns.find((column) => defaultTask === "classification" ? column.kind === "category" : column.kind === "numeric")?.name ?? "";
    setTarget(defaultTarget);
    setFeatures(data.columns.filter((column) => column.name !== defaultTarget).map((column) => column.name));
  };

  const loadFile = async (selected: File | undefined) => {
    if (!selected) return;
    if (selected.size > 2_500_000) {
      setError(language === "it" ? "Il file deve essere piu piccolo di 2,5 MB." : "The file must be smaller than 2.5 MB.");
      return;
    }
    try {
      const contentBase64 = encodeBase64(new Uint8Array(await selected.arrayBuffer()));
      await loadDatasetPayload({ name: selected.name, contentBase64 });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const changeTask = (next: "classification" | "regression") => {
    trainMutation.reset();
    setConsent(false);
    setTask(next);
    const nextTarget = preview?.columns.find((column) => next === "classification" ? column.kind === "category" : column.kind === "numeric")?.name ?? "";
    setTarget(nextTarget);
    setFeatures((current) => current.filter((feature) => feature !== nextTarget));
    setAnswer("");
  };

  const runTraining = async () => {
    setError("");
    setAnswerError("");
    setAnswer("");
    setConsent(false);
    if (!file || !target || !features.length) {
      setError(language === "it"
        ? "Carica un dataset e seleziona obiettivo e almeno una variabile predittiva."
        : "Upload a dataset and select a target plus at least one predictor.");
      return;
    }
    try {
      await trainMutation.mutateAsync({ ...file, task, target, features });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const explain = async () => {
    setAnswerError("");
    if (!result || !question.trim() || !consent) return;
    try {
      const response = await explainMutation.mutateAsync({
        question: question.trim(),
        consent: true,
        language: language === "it" ? "it" : "en",
        sector: sector.trim(),
        task: result.task,
        target: result.target,
        bestModel: result.bestModel,
        trainRows: result.trainRows,
        testRows: result.testRows,
        models: result.models,
        featureImportance: result.featureImportance,
        classLabels: result.classLabels,
      });
      setAnswer(response.content);
    } catch (reason) {
      setAnswerError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Seo title={`${text.title} | Tatik.space`} description={text.description} path="/analysis/ml-studio" language={language} noIndex />
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-6xl px-4 py-14 md:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground">
            <BrainCircuit className="h-4 w-4 text-primary" /> {text.dataset}
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">{text.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{text.intro}</p>
        </div>
      </section>
      <section className="container max-w-6xl space-y-6 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>{text.dataset}</CardTitle>
            <CardDescription>{text.fileLimit}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <AnalyticsUsageNotice language={language === "it" ? "it" : "en"} />
            <label className="block space-y-2 text-sm font-medium">
              {text.file}
              <Input type="file" accept=".csv,.json,.xlsx" disabled={!isAuthenticated || authLoading || previewMutation.isPending} onChange={(event) => {
                void loadFile(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }} />
            </label>
            {preview && (
              <>
                <p className="text-sm text-muted-foreground">{preview.name} · {preview.rows.toLocaleString()} {text.rows} · {preview.columns.length} colonne</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">{text.task}
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3" value={task} onChange={(event) => changeTask(event.target.value as "classification" | "regression")}>
                      <option value="classification">{text.classification}</option>
                      <option value="regression">{text.regression}</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-sm">{text.target}
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3" value={target} onChange={(event) => {
                      trainMutation.reset();
                      setConsent(false);
                      setAnswer("");
                      setTarget(event.target.value);
                      setFeatures((current) => current.filter((feature) => feature !== event.target.value));
                    }}>
                      {usableTargets.map((column) => <option key={column.name} value={column.name}>{column.name}</option>)}
                    </select>
                  </label>
                </div>
                <label className="block max-w-xl space-y-1 text-sm">{text.sector}
                  <Input value={sector} onChange={(event) => setSector(event.target.value)} maxLength={100} placeholder={text.sectorPlaceholder} />
                </label>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">{text.features}</legend>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {preview.columns.filter((column) => column.name !== target).map((column) => (
                      <label key={column.name} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={features.includes(column.name)} onChange={(event) => {
                          trainMutation.reset();
                          setConsent(false);
                          setAnswer("");
                          setFeatures((current) => event.target.checked ? [...current, column.name] : current.filter((feature) => feature !== column.name));
                        }} />
                        {column.name} <span className="text-xs text-muted-foreground">({column.kind})</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className="text-xs text-muted-foreground">{text.method}</p>
                <Button onClick={runTraining} disabled={!isAuthenticated || trainMutation.isPending || !usableTargets.length || !features.length}>
                  {trainMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {trainMutation.isPending ? text.working : text.run}
                </Button>
              </>
            )}
            {!isAuthenticated && !authLoading && <p className="text-sm text-muted-foreground">{text.login} <Link href="/login" className="text-primary underline">{text.signIn}</Link></p>}
            {(previewMutation.isPending) && <p role="status" className="text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />{text.working}</p>}
            {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>{text.models}</CardTitle>
              <CardDescription>{result.fileName} · {result.usableRows.toLocaleString()} {text.observations} · {result.trainRows.toLocaleString()} {text.train} / {result.testRows.toLocaleString()} {text.testRows}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="rounded-md border bg-muted/40 p-3 text-sm"><strong>{text.best}:</strong> {result.bestModel}</p>
              <label className="block max-w-sm space-y-1 text-sm font-medium">
                {text.chartType}
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                  value={activeChartType}
                  onChange={(event) => setChartType(event.target.value as typeof chartType)}
                >
                  <option value="bar">{text.chartBars}</option>
                  <option value="line">{text.chartLines}</option>
                  {result.task === "classification" && <option value="radar">{text.chartRadar}</option>}
                  <option value="scatter">{text.chartScatter}</option>
                </select>
              </label>
              {result.task === "classification" && activeChartType === "bar" && (
                <section className="rounded-lg border p-4" role="img" aria-label={text.metricsChart}>
                  <h3 className="mb-3 font-semibold">{text.metricsChart}</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={classificationChartData} layout="vertical" margin={{ left: 12, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`} />
                      <YAxis dataKey="model" type="category" width={130} />
                      <Tooltip formatter={(value) => formatMetric(Number(value))} />
                      <Legend />
                      <Bar dataKey="accuracy" name={text.accuracy} fill="#2563eb" maxBarSize={18} />
                      <Bar dataKey="balancedAccuracy" name={text.balancedAccuracy} fill="#16a34a" maxBarSize={18} />
                      <Bar dataKey="macroF1" name={text.macroF1} fill="#f59e0b" maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </section>
              )}
              {result.task === "classification" && activeChartType === "line" && (
                <section className="rounded-lg border p-4" role="img" aria-label={text.metricsChart}>
                  <h3 className="mb-3 font-semibold">{text.metricsChart}</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={classificationChartData} margin={{ left: 12, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" />
                      <YAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`} />
                      <Tooltip />
                      <Legend />
                      <Line dataKey="accuracy" name={text.accuracy} stroke="#2563eb" />
                      <Line dataKey="balancedAccuracy" name={text.balancedAccuracy} stroke="#16a34a" />
                      <Line dataKey="macroF1" name={text.macroF1} stroke="#f59e0b" />
                    </LineChart>
                  </ResponsiveContainer>
                </section>
              )}
              {result.task === "classification" && activeChartType === "radar" && (
                <section className="rounded-lg border p-4" role="img" aria-label={text.metricsChart}>
                  <h3 className="mb-3 font-semibold">{text.metricsChart}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 1]} />
                      <Tooltip />
                      <Legend />
                      {result.models.map((model, index) => {
                        const color = ["#2563eb", "#16a34a", "#f59e0b"][index % 3];
                        return <Radar key={model.name} dataKey={model.name} stroke={color} fill={color} fillOpacity={0.12} />;
                      })}
                    </RadarChart>
                  </ResponsiveContainer>
                </section>
              )}
              {result.task === "classification" && activeChartType === "scatter" && (
                <section className="rounded-lg border p-4" role="img" aria-label={text.chartScatter}>
                  <h3 className="mb-1 font-semibold">{text.chartScatter}</h3>
                  <p className="mb-3 text-xs text-muted-foreground">{text.chartScatterNote}</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <ScatterChart margin={{ left: 12, right: 24, bottom: 12 }}>
                      <CartesianGrid />
                      <XAxis dataKey="accuracy" name={text.accuracy} type="number" domain={[0, 1]} />
                      <YAxis dataKey="macroF1" name={text.macroF1} type="number" domain={[0, 1]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter name={text.models} data={classificationChartData} fill="#2563eb">
                        {classificationChartData.map((model, index) => (
                          <Cell key={model.model} fill={["#2563eb", "#16a34a", "#f59e0b"][index % 3]} />
                        ))}
                        <LabelList dataKey="model" position="top" />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </section>
              )}
              {result.task === "regression" && activeChartType === "bar" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="rounded-lg border p-4" role="img" aria-label="R² comparison">
                    <h3 className="mb-3 font-semibold">R²</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={result.models.map((model) => ({ model: model.name, r2: model.r2 ?? 0 }))} layout="vertical" margin={{ left: 12, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={["auto", "auto"]} />
                        <YAxis dataKey="model" type="category" width={130} />
                        <ReferenceLine x={0} stroke="#64748b" />
                        <Tooltip formatter={(value) => formatMetric(Number(value))} />
                        <Bar dataKey="r2" name="R²" fill="#2563eb" maxBarSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </section>
                  <section className="rounded-lg border p-4" role="img" aria-label={text.errorsChart}>
                    <h3 className="mb-3 font-semibold">{text.errorsChart}</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={regressionErrorData} layout="vertical" margin={{ left: 12, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, "auto"]} />
                        <YAxis dataKey="model" type="category" width={130} />
                        <Tooltip formatter={(value) => formatMetric(Number(value))} />
                        <Legend />
                        <Bar dataKey="mae" name={text.mae} fill="#16a34a" maxBarSize={18} />
                        <Bar dataKey="rmse" name={text.rmse} fill="#f59e0b" maxBarSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </section>
                </div>
              )}
              {result.task === "regression" && activeChartType === "line" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="rounded-lg border p-4" role="img" aria-label="R² comparison">
                    <h3 className="mb-3 font-semibold">R²</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={result.models.map((model) => ({ model: model.name, r2: model.r2 ?? 0 }))} margin={{ left: 12, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="model" />
                        <YAxis type="number" domain={["auto", "auto"]} />
                        <ReferenceLine y={0} stroke="#64748b" />
                        <Tooltip />
                        <Line dataKey="r2" name="R²" stroke="#2563eb" />
                      </LineChart>
                    </ResponsiveContainer>
                  </section>
                  <section className="rounded-lg border p-4" role="img" aria-label={text.errorsChart}>
                    <h3 className="mb-3 font-semibold">{text.errorsChart}</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={regressionErrorData} margin={{ left: 12, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="model" />
                        <YAxis type="number" domain={[0, "auto"]} />
                        <Tooltip />
                        <Legend />
                        <Line dataKey="mae" name={text.mae} stroke="#16a34a" />
                        <Line dataKey="rmse" name={text.rmse} stroke="#f59e0b" />
                      </LineChart>
                    </ResponsiveContainer>
                  </section>
                </div>
              )}
              {result.task === "regression" && activeChartType === "scatter" && (
                <section className="rounded-lg border p-4" role="img" aria-label={text.chartScatter}>
                  <h3 className="mb-1 font-semibold">{text.chartScatter}</h3>
                  <p className="mb-3 text-xs text-muted-foreground">{text.chartScatterNote}</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <ScatterChart margin={{ left: 12, right: 24, bottom: 12 }}>
                      <CartesianGrid />
                      <XAxis dataKey="mae" name={text.mae} type="number" />
                      <YAxis dataKey="rmse" name={text.rmse} type="number" />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter name={text.models} data={regressionErrorData} fill="#2563eb">
                        {regressionErrorData.map((model, index) => (
                          <Cell key={model.model} fill={["#2563eb", "#16a34a", "#f59e0b"][index % 3]} />
                        ))}
                        <LabelList dataKey="model" position="top" />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </section>
              )}
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-muted"><tr><th className="p-3">{text.model}</th>{result.task === "classification"
                    ? <><th className="p-3">{text.accuracy}</th><th className="p-3">{text.balancedAccuracy}</th><th className="p-3">{text.macroF1}</th></>
                    : <><th className="p-3">{text.r2}</th><th className="p-3">{text.mae}</th><th className="p-3">{text.rmse}</th></>}</tr></thead>
                  <tbody>{result.models.map((model) => <tr key={model.name} className="border-t">
                    <td className="p-3">{model.name}</td>
                    {result.task === "classification"
                      ? <><td className="p-3">{formatMetric(model.accuracy)}</td><td className="p-3">{formatMetric(model.balancedAccuracy)}</td><td className="p-3">{formatMetric(model.macroF1)}</td></>
                      : <><td className="p-3">{formatMetric(model.r2)}</td><td className="p-3">{formatMetric(model.mae)}</td><td className="p-3">{formatMetric(model.rmse)}</td></>}
                  </tr>)}</tbody>
                </table>
              </div>
              {result.task === "classification" && result.classLabels.length > 0 && (
                <div className="overflow-x-auto">
                  <p className="mb-2 text-sm font-medium">{text.confusion}</p>
                  <table className="w-full min-w-[420px] text-left text-xs">
                    <thead><tr><th className="p-2">{text.realPredicted}</th>{result.classLabels.map((label) => <th className="p-2" key={label}>{label}</th>)}</tr></thead>
                    <tbody>{result.classLabels.map((label, rowIndex) => (
                      <tr className="border-t" key={label}>
                        <th className="p-2">{label}</th>
                        {bestConfusionMatrix[rowIndex]?.map((count, columnIndex) => (
                          <td className="p-2" key={`${label}-${columnIndex}`}>
                            <span
                              className="block rounded px-2 py-2 text-center"
                              style={count ? { backgroundColor: `rgba(37, 99, 235, ${0.08 + 0.38 * count / maxConfusionCount})` } : undefined}
                            >
                              {count}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              {result.featureImportance.length > 0 && (
                <section className="rounded-lg border p-4" role="img" aria-label={text.importance}>
                  <h3 className="mb-2 font-semibold">{text.importance}</h3>
                  <ResponsiveContainer width="100%" height={Math.max(180, result.featureImportance.length * 34)}>
                    <BarChart data={result.featureImportance} layout="vertical" margin={{ left: 12, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, "dataMax"]} tickFormatter={(value) => formatMetric(Number(value))} />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip formatter={(value) => formatMetric(Number(value))} />
                      <Bar dataKey="importance" name={text.importance} fill="#0f766e" maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </section>
              )}
              <ul className="space-y-1 text-sm text-muted-foreground">{result.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul>
              {assessment && (
                <section className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{assessment.title}</h3>
                    <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">{text.assessmentDisclaimer}</span>
                  </div>
                  <p className="text-sm">{assessment.summary}</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {assessment.findings.map((finding) => <li key={finding}>{finding}</li>)}
                  </ul>
                  <p className="text-xs text-muted-foreground">{assessment.disclaimer}</p>
                </section>
              )}
              <section className="space-y-3 border-t pt-5">
                <h3 className="font-semibold">{text.explainTitle}</h3>
                <label className="block max-w-xl space-y-1 text-sm">{text.question}
                  <Input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} placeholder={text.questionPlaceholder} />
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input className="mt-1" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>{text.consent}</span>
                </label>
                <p className="text-xs text-muted-foreground">{text.freeOnly}</p>
                <Button variant="outline" onClick={explain} disabled={!consent || !question.trim() || explainMutation.isPending}>
                  {explainMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{text.explain}
                </Button>
                {answerError && <p role="alert" className="text-sm text-destructive">{answerError}</p>}
                {answer && <div className="rounded-lg border bg-muted/30 p-4"><h4 className="mb-2 font-medium">{text.answer}</h4><p className="whitespace-pre-wrap text-sm">{answer}</p></div>}
              </section>
            </CardContent>
          </Card>
        )}
        <AnalyticsReportDownload
          title={result ? `Report ML - ${result.fileName}` : "Report ML Studio"}
          content={reportContent}
          visuals={reportVisuals}
          returnPath="/analysis/ml-studio"
        />
        <MlStudioSources language={language} onMergedDataset={loadDatasetPayload} />
      </section>
    </main>
  );
}
