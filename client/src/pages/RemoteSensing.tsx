import { useMemo, useState } from "react";
import { AlertCircle, Download, ExternalLink, Loader2, Map, Satellite } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { DataInsightSources } from "@/components/DataInsightSources";
import { AnalyticsReportDownload, AnalyticsUsageNotice } from "@/components/AnalyticsReportDownload";
import { AoiUnet } from "@/components/AoiUnet";
import { EuroSatCnn } from "@/components/EuroSatCnn";
import { Seo } from "@/components/Seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import type { AnalyticsReportConclusion, AnalyticsReportVisual } from "@/lib/analyticsReportPdf";
import type { SentinelAoiJob } from "../../../server/data-insight";

const copy = {
  it: {
    title: "Telerilevamento e Machine Learning",
    description: "Analizza scene Sentinel-2 L2A, confronta classificatori e genera una mappa GeoTIFF per la tua area di studio.",
    intro: "Workflow geospaziale riproducibile con Sentinel-2 L2A, maschera nuvole SCL, indici spettrali, confronto Random Forest/SVM e mappa tematica a 10 metri.",
    bbox: "Area di studio WGS84 (ovest, sud, est, nord)",
    start: "Data iniziale",
    end: "Data finale",
    clouds: "Copertura nuvolosa massima (%)",
    mapModelLabel: "Modello che genera la mappa",
    randomForest: "Random Forest",
    svm: "SVM lineare",
    samplesPerClass: "Campioni massimi per classe",
    spatialBlock: "Dimensione del blocco di validazione",
    selectedClasses: "Classi da includere",
    metricsToShow: "Metriche da mostrare",
    prepareUnet: "Prepara dati per U-Net (Sentinel-2 + etichette proxy WorldCover)",
    prepareUnetNote: "Trasferisce al browser una griglia campionata e compressa (massimo 128×128); non salva i dati.",
    selectClassError: "Seleziona almeno una classe WorldCover.",
    samplesError: "Inserisci un numero di campioni per classe tra 100 e 2000.",
    accuracyMetric: "Accuracy",
    selectMetricError: "Seleziona almeno una metrica da mostrare.",
    sceneClouds: "nuvole",
    balancedAccuracy: "balanced accuracy",
    macroF1: "F1 macro",
    kappa: "Cohen's kappa",
    run: "Avvia analisi Sentinel-2",
    signIn: "Accedi per avviare l'elaborazione.",
    signInLink: "Accedi",
    running: "Elaborazione in corso…",
    loading: "Elaborazione in corso…",
    reference: "La valutazione misura l'accordo con ESA WorldCover 2021, non l'accuratezza rispetto a rilievi a terra indipendenti. Verifica la mappa in GIS prima di qualsiasi uso operativo o scientifico.",
    result: "Risultato dell'elaborazione",
    reportTitle: "Rapporto tecnico ML",
    reportDescription: "Confronto riproducibile su blocchi spaziali esclusi dall'addestramento.",
    scene: "Scena",
    accuracy: "Accordo spaziale con WorldCover",
    mapDownload: "Scarica GeoTIFF a colori",
    mapBandNote: "GeoTIFF standard a 4 bande RGBA per visualizzare i colori nei viewer comuni; legenda classi disponibile nel rapporto.",
    mapModel: "Modello esportato",
    mapComparison: "Il confronto RF/SVM usa gli stessi campioni di test.",
    macroWinner: (name: string) => `F1 macro più alta nel test spaziale: ${name}. Non equivale a verifica sul terreno.`,
    opinionTitle: "Valutazione tecnica orientativa (automatica)",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) =>
      `Sul test spaziale, ${winner} ottiene macro F1 ${winnerF1} contro ${other} (${otherF1}); nel campione e nell'area valutati mostra quindi un accordo maggiore con il riferimento.`,
    opinionReference: "Le etichette di confronto provengono da ESA WorldCover 2021 e non sono rilievi a terra indipendenti: le metriche non dimostrano l'accuratezza assoluta della mappa.",
    opinionRecommendation: "La mappa è adatta a un'esplorazione preliminare, non è sufficiente da sola per decisioni operative o scientifiche. Prima dell'uso, verifica in GIS e confronta con dati indipendenti dell'area.",
    opinionDisclaimer: "Sintesi automatizzata basata sui risultati mostrati; non è una perizia firmata né una certificazione professionale.",
    classMetricsTitle: "Prestazioni per classe",
    className: "Classe",
    precision: "Precision",
    recall: "Recall",
    f1: "F1",
    support: "Campioni test",
    confusionTitle: "Matrice di confusione — Random Forest",
    confusionDescription: "Righe: classe di riferimento · colonne: classe predetta",
    predicted: "Predetta",
    referenceLabel: "Riferimento",
    featureTitle: "Importanza relativa delle feature",
    featureDescription: "RF: importanza impurity-based; SVM: coefficienti assoluti medi della LinearSVC standardizzata. Valori descrittivi, non causali.",
    areaTitle: "Superficie classificata",
    areaHa: "Area (ha)",
    methodTitle: "Metodo e campioni",
    sampleCounts: (training: number, test: number, block: number) => `${training} campioni di training · ${test} di test · blocchi spaziali da ${block} m.`,
    deepLearningNote: "Il benchmark CNN EuroSAT è separato dalla mappa AOI. La U-Net può essere addestrata qui con etichette proxy WorldCover; non sono rilievi a terra indipendenti.",
    downloadError: "Download mappa non riuscito.",
    failed: "Elaborazione non riuscita",
    sourcesTitle: "Fonti e cataloghi del workflow",
    sourcesDescription: "Il workflow cerca le scene Sentinel-2 nel catalogo STAC Earth Search e usa ESA WorldCover 2021 come riferimento per addestramento e validazione.",
    sources: [
      { label: "Catalogo STAC Sentinel-2 usato dal workflow", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · fonte ufficiale", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · esplora immagini Sentinel", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · dati e accesso", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · documentazione scikit-learn", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · documentazione scikit-learn", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Esplora fonti e dataset correlati",
    portalLink: "Apri Analisi dati",
  },
  en: {
    title: "Remote sensing & Machine Learning",
    description: "Analyze Sentinel-2 L2A scenes, compare classifiers and produce a GeoTIFF map for your area of interest.",
    intro: "Reproducible geospatial workflow using Sentinel-2 L2A, SCL cloud masking, spectral indices, Random Forest/SVM comparison and a 10-meter thematic map.",
    bbox: "WGS84 area of interest (west, south, east, north)",
    start: "Start date",
    end: "End date",
    clouds: "Maximum cloud cover (%)",
    mapModelLabel: "Model used to create the map",
    randomForest: "Random Forest",
    svm: "Linear SVM",
    samplesPerClass: "Maximum samples per class",
    spatialBlock: "Validation block size",
    selectedClasses: "Classes to include",
    metricsToShow: "Metrics to display",
    prepareUnet: "Prepare U-Net data (Sentinel-2 + WorldCover proxy labels)",
    prepareUnetNote: "Transfers a sampled, compressed grid to the browser (maximum 128×128); the data is not stored.",
    selectClassError: "Select at least one WorldCover class.",
    samplesError: "Enter a sample count between 100 and 2000 per class.",
    accuracyMetric: "Accuracy",
    selectMetricError: "Select at least one metric to display.",
    sceneClouds: "cloud cover",
    balancedAccuracy: "balanced accuracy",
    macroF1: "macro F1",
    kappa: "Cohen's kappa",
    run: "Run Sentinel-2 analysis",
    signIn: "Sign in to start processing.",
    signInLink: "Sign in",
    running: "Processing…",
    loading: "Processing…",
    reference: "Evaluation measures agreement with ESA WorldCover 2021, not accuracy against independent ground surveys. Review the map in GIS before operational or scientific use.",
    result: "Processing result",
    reportTitle: "ML technical report",
    reportDescription: "Reproducible comparison on spatial blocks held out from training.",
    scene: "Scene",
    accuracy: "Spatial agreement with WorldCover",
    mapDownload: "Download color GeoTIFF",
    mapBandNote: "Standard 4-band RGBA GeoTIFF for color display in common viewers; the class legend is in the report.",
    mapModel: "Exported model",
    mapComparison: "RF/SVM comparison uses the same held-out samples.",
    macroWinner: (name: string) => `Highest macro F1 on the spatial test: ${name}. This is not field validation.`,
    opinionTitle: "Automated technical assessment",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) =>
      `On the spatial test, ${winner} scores macro F1 ${winnerF1} versus ${other} (${otherF1}); it therefore agrees more closely with the reference in the evaluated sample and area.`,
    opinionReference: "The reference labels come from ESA WorldCover 2021, not independent ground surveys; these metrics do not establish the map's absolute accuracy.",
    opinionRecommendation: "The map is suitable for preliminary exploration, not for operational or scientific decisions by itself. Review it in GIS and compare it with independent data from the area before use.",
    opinionDisclaimer: "Automated summary based on the displayed results; it is not a signed expert opinion or professional certification.",
    classMetricsTitle: "Per-class performance",
    className: "Class",
    precision: "Precision",
    recall: "Recall",
    f1: "F1",
    support: "Test samples",
    confusionTitle: "Confusion matrix — Random Forest",
    confusionDescription: "Rows: reference class · columns: predicted class",
    predicted: "Predicted",
    referenceLabel: "Reference",
    featureTitle: "Relative feature importance",
    featureDescription: "RF: impurity-based importance; SVM: mean absolute coefficients from standardized LinearSVC. Descriptive, not causal.",
    areaTitle: "Classified area",
    areaHa: "Area (ha)",
    methodTitle: "Method and samples",
    sampleCounts: (training: number, test: number, block: number) => `${training} training samples · ${test} test samples · ${block} m spatial blocks.`,
    deepLearningNote: "The EuroSAT CNN benchmark is separate from the AOI map. U-Net can be trained here with WorldCover proxy labels; these are not independent ground surveys.",
    downloadError: "Map download failed.",
    failed: "Processing failed",
    sourcesTitle: "Workflow sources and catalogs",
    sourcesDescription: "The workflow searches Sentinel-2 scenes in the Earth Search STAC catalog and uses ESA WorldCover 2021 as a training and validation reference.",
    sources: [
      { label: "Sentinel-2 STAC catalog used by the workflow", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · official source", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · explore Sentinel imagery", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · data access", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · scikit-learn documentation", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · scikit-learn documentation", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Explore related sources and datasets",
    portalLink: "Open Data analysis",
  },
};

const WORLDCOVER_CLASS_OPTIONS = [
  { code: 10, name: "Alberi", color: "#176b3a" },
  { code: 20, name: "Arbusteti", color: "#d6c77a" },
  { code: 30, name: "Praterie", color: "#b8dc8a" },
  { code: 40, name: "Colture", color: "#e7d34a" },
  { code: 50, name: "Edificato", color: "#d83232" },
  { code: 60, name: "Suolo nudo", color: "#b9a092" },
  { code: 70, name: "Neve e ghiaccio", color: "#dce9f4" },
  { code: 80, name: "Acqua", color: "#3478c8" },
  { code: 90, name: "Zone umide", color: "#4bb8a4" },
  { code: 95, name: "Mangrovie", color: "#64a878" },
  { code: 100, name: "Licheni e muschi", color: "#9dba7a" },
] as const;

type MetricKey = "accuracy" | "balancedAccuracy" | "macroF1" | "kappa";
type SpatialBlockMeters = 250 | 500 | 1000;

export default function RemoteSensing() {
  const { language } = useLanguage();
  const text = copy[language === "it" ? "it" : "en"];
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bbox, setBbox] = useState("12.48, 41.65, 12.55, 41.70");
  const [startDate, setStartDate] = useState("2021-06-01");
  const [endDate, setEndDate] = useState("2021-08-31");
  const [maxCloudCover, setMaxCloudCover] = useState("30");
  const [mapModel, setMapModel] = useState<"randomForest" | "svm">("randomForest");
  const [maxSamplesPerClass, setMaxSamplesPerClass] = useState("900");
  const [spatialBlockMeters, setSpatialBlockMeters] = useState<SpatialBlockMeters>(500);
  const [selectedClasses, setSelectedClasses] = useState<number[]>(
    WORLDCOVER_CLASS_OPTIONS.map(({ code }) => code),
  );
  const [visibleMetrics, setVisibleMetrics] = useState<MetricKey[]>([
    "accuracy",
    "balancedAccuracy",
    "macroF1",
    "kappa",
  ]);
  const [includeUnetData, setIncludeUnetData] = useState(true);
  const [job, setJob] = useState<SentinelAoiJob | null>(null);
  const [error, setError] = useState("");
  const [downloadBusy, setDownloadBusy] = useState(false);
  const startMutation = trpc.dataInsight.startRemoteSensing.useMutation();
  const isRunning = startMutation.isPending;

  const runAnalysis = async () => {
    setError("");
    setJob(null);
    const coordinates = bbox.split(",").map((part) => Number(part.trim()));
    if (coordinates.length !== 4 || coordinates.some((value) => !Number.isFinite(value))) {
      setError(text.bbox);
      return;
    }
    if (selectedClasses.length === 0) {
      setError(text.selectClassError);
      return;
    }
    if (visibleMetrics.length === 0) {
      setError(text.selectMetricError);
      return;
    }
    const sampleLimit = Number(maxSamplesPerClass);
    if (!Number.isInteger(sampleLimit) || sampleLimit < 100 || sampleLimit > 2000) {
      setError(text.samplesError);
      return;
    }
    try {
      const completedJob = await startMutation.mutateAsync({
        bbox: coordinates,
        startDate,
        endDate,
        maxCloudCover: Number(maxCloudCover),
        mapModel,
        maxSamplesPerClass: sampleLimit,
        spatialBlockMeters,
        selectedClasses,
        includeUnetData,
      });
      setJob(completedJob);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const downloadMap = async () => {
    setError("");
    setDownloadBusy(true);
    try {
      if (!job?.mapDataBase64) throw new Error(text.downloadError);
      const bytes = Uint8Array.from(atob(job.mapDataBase64), (character) => character.charCodeAt(0));
      const blob = new Blob([bytes], { type: "image/tiff" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `sentinel-2-classification-rgb-${job.jobId}.tif`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.downloadError);
    } finally {
      setDownloadBusy(false);
    }
  };

  const result = job?.result;
  const modelMetrics = result
    ? [
        { name: "Random Forest", metrics: result.models.randomForest },
        { name: "SVM lineare", metrics: result.models.svm },
      ]
    : [];
  const metricOptions: Array<{ key: MetricKey; label: string }> = [
    { key: "accuracy", label: text.accuracyMetric },
    { key: "balancedAccuracy", label: text.balancedAccuracy },
    { key: "macroF1", label: text.macroF1 },
    { key: "kappa", label: text.kappa },
  ];
  const toggleSelectedClass = (code: number) => {
    setSelectedClasses((current) => current.includes(code)
      ? current.filter((value) => value !== code)
      : [...current, code]);
  };
  const toggleVisibleMetric = (key: MetricKey) => {
    setVisibleMetrics((current) => current.includes(key)
      ? current.filter((value) => value !== key)
      : [...current, key]);
  };
  const macroF1WinnerModel = result
    ? result.models.randomForest.macroF1 >= result.models.svm.macroF1
      ? result.models.randomForest
      : result.models.svm
    : undefined;
  const macroF1OtherModel = result && macroF1WinnerModel
    ? macroF1WinnerModel === result.models.randomForest
      ? result.models.svm
      : result.models.randomForest
    : undefined;
  const macroF1Leader = macroF1WinnerModel?.name ?? "";
  const reportConclusion: AnalyticsReportConclusion | undefined = macroF1WinnerModel && macroF1OtherModel
    ? {
        title: text.opinionTitle,
        content: [
          text.opinionSummary(
            macroF1WinnerModel.name,
            macroF1WinnerModel.macroF1.toFixed(3),
            macroF1OtherModel.name,
            macroF1OtherModel.macroF1.toFixed(3),
          ),
          text.opinionReference,
          text.opinionRecommendation,
          text.opinionDisclaimer,
        ].join("\n\n"),
      }
    : undefined;
  const classPerformance = result
    ? result.models.randomForest.perClass.map((randomForestClass) => ({
        ...randomForestClass,
        svm: result.models.svm.perClass.find((metric) => metric.code === randomForestClass.code),
        color: result.classLegend.find((item) => item.code === randomForestClass.code)?.color ?? "#94a3b8",
      }))
    : [];
  const confusionCodes = result?.models.randomForest.confusionClassCodes ?? [];
  const reportContent = result && job
    ? [
        `Scena: ${result.scene.id}`,
        `Data acquisizione: ${result.scene.datetime}`,
        `Copertura nuvolosa: ${result.scene.tileCloudCoverPercent.toFixed(1)}%`,
        `Riferimento: ${result.reference.name} — ${result.reference.meaning}`,
        `Modello mappa: ${result.processing.mapModel}`,
        `Risoluzione: ${result.processing.pixelSizeMeters} m`,
        `Campioni: ${result.processing.trainingSampleCount} training, ${result.processing.testSampleCount} test`,
        "",
        "Metriche Random Forest:",
        `Accuracy: ${result.models.randomForest.accuracy.toFixed(3)}`,
        `Balanced accuracy: ${result.models.randomForest.balancedAccuracy.toFixed(3)}`,
        `Macro F1: ${result.models.randomForest.macroF1.toFixed(3)}`,
        `Cohen's kappa: ${result.models.randomForest.kappa.toFixed(3)}`,
        "",
        "Metriche SVM:",
        `Accuracy: ${result.models.svm.accuracy.toFixed(3)}`,
        `Balanced accuracy: ${result.models.svm.balancedAccuracy.toFixed(3)}`,
        `Macro F1: ${result.models.svm.macroF1.toFixed(3)}`,
        `Cohen's kappa: ${result.models.svm.kappa.toFixed(3)}`,
        "",
        "Superficie per classe:",
        ...result.classAreas.map((area) => `${area.name}: ${area.areaHa.toFixed(2)} ha`),
        "",
        "Prestazioni per classe — Random Forest:",
        ...result.models.randomForest.perClass.map((metric) => `${metric.className}: precision ${metric.precision.toFixed(3)}, recall ${metric.recall.toFixed(3)}, F1 ${metric.f1.toFixed(3)}, supporto ${metric.support}`),
        "",
        "Prestazioni per classe — SVM:",
        ...result.models.svm.perClass.map((metric) => `${metric.className}: precision ${metric.precision.toFixed(3)}, recall ${metric.recall.toFixed(3)}, F1 ${metric.f1.toFixed(3)}, supporto ${metric.support}`),
        "",
        "Importanza feature — Random Forest:",
        ...result.models.randomForest.featureImportance.map((feature) => `${feature.name}: ${feature.importance.toFixed(3)}`),
        "",
        "Limiti:",
        ...result.limitations,
      ].join("\n")
    : "";
  const reportVisuals = useMemo<AnalyticsReportVisual[]>(() => {
    if (!result) return [];
    const metricNames = ["Accuracy", "Balanced accuracy", "F1 macro", "Cohen's kappa"];
    const modelMetricValues = (model: SentinelAoiJob["result"]["models"]["randomForest"]) => [
      model.accuracy,
      model.balancedAccuracy,
      model.macroF1,
      model.kappa,
    ];
    const confusionCodes = result.models.randomForest.confusionClassCodes;
    const confusionLabels = confusionCodes.map((code) => result.classLegend.find((item) => item.code === code)?.name ?? String(code));
    const visuals: AnalyticsReportVisual[] = [{
      type: "image",
      title: `Mappa tematica Sentinel-2 — ${result.scene.id}`,
      dataUrl: result.mapImage,
      caption: `Acquisizione: ${result.scene.datetime}. Copertura nuvolosa: ${result.scene.tileCloudCoverPercent.toFixed(1)}%. Risoluzione: ${result.processing.pixelSizeMeters} m. Modello: ${result.processing.mapModel}. Riferimento: ${result.reference.name} — ${result.reference.meaning}`,
      legend: result.classLegend.map((item) => ({ label: item.name, color: item.color })),
    }, {
      type: "chart",
      title: "Confronto delle metriche del modello",
      chartType: "bar",
      categories: metricNames,
      series: [
        { name: "Random Forest", color: "#2563eb", values: modelMetricValues(result.models.randomForest) },
        { name: "SVM", color: "#16a34a", values: modelMetricValues(result.models.svm) },
      ],
      minValue: 0,
      maxValue: 1,
    }, {
      type: "chart",
      title: "F1 per classe",
      chartType: "bar",
      orientation: "horizontal",
      categories: result.models.randomForest.perClass.map((metric) => metric.className),
      series: [
        { name: "Random Forest", color: "#2563eb", values: result.models.randomForest.perClass.map((metric) => metric.f1) },
        { name: "SVM", color: "#16a34a", values: result.models.randomForest.perClass.map((metric) => result.models.svm.perClass.find((svmMetric) => svmMetric.code === metric.code)?.f1 ?? 0) },
      ],
      minValue: 0,
      maxValue: 1,
    }, {
      type: "chart",
      title: "Superficie stimata per classe (ettari)",
      chartType: "bar",
      orientation: "horizontal",
      categories: result.classAreas.map((area) => area.name),
      series: [{ name: "Ettari", color: "#0f766e", values: result.classAreas.map((area) => area.areaHa) }],
      minValue: 0,
    }, {
      type: "chart",
      title: "Importanza delle feature — Random Forest",
      chartType: "bar",
      orientation: "horizontal",
      categories: result.models.randomForest.featureImportance.map((feature) => feature.name),
      series: [{ name: "Importanza", color: "#9333ea", values: result.models.randomForest.featureImportance.map((feature) => feature.importance) }],
      minValue: 0,
    }];
    if (confusionLabels.length && result.models.randomForest.confusionMatrix.length) {
      visuals.push({
        type: "matrix",
        title: "Matrice di confusione — Random Forest",
        rowLabels: confusionLabels,
        columnLabels: confusionLabels,
        values: result.models.randomForest.confusionMatrix,
      });
    }
    return visuals;
  }, [result]);

  return (
    <main className="min-h-screen bg-background">
      <Seo title={`${text.title} | Tatik.space`} description={text.description} path="/analysis/remote-sensing" language={language} />
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-6xl px-4 py-14 md:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground">
            <Satellite className="h-4 w-4 text-primary" /> {text.title}
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">{text.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{text.intro}</p>
        </div>
      </section>
      <section className="container max-w-6xl space-y-8 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary" />Workflow Sentinel-2 L2A</CardTitle>
            <CardDescription>{text.reference}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <AnalyticsUsageNotice language={language === "it" ? "it" : "en"} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                {text.bbox}
                <Input value={bbox} onChange={(event) => setBbox(event.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm font-medium">
                  {text.start}
                  <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  {text.end}
                  <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                </label>
              </div>
              <label className="space-y-2 text-sm font-medium">
                {text.clouds}
                <Input type="number" min="0" max="100" value={maxCloudCover} onChange={(event) => setMaxCloudCover(event.target.value)} />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {text.mapModelLabel}
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={mapModel}
                  onChange={(event) => {
                    if (event.target.value === "randomForest" || event.target.value === "svm") {
                      setMapModel(event.target.value);
                    }
                  }}
                >
                  <option value="randomForest">{text.randomForest}</option>
                  <option value="svm">{text.svm}</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                {text.samplesPerClass}
                <Input
                  type="number"
                  min="100"
                  max="2000"
                  step="100"
                  value={maxSamplesPerClass}
                  onChange={(event) => setMaxSamplesPerClass(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {text.spatialBlock}
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={spatialBlockMeters}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (value === 250 || value === 500 || value === 1000) setSpatialBlockMeters(value);
                  }}
                >
                  <option value={250}>250 m</option>
                  <option value={500}>500 m</option>
                  <option value={1000}>1000 m</option>
                </select>
              </label>
              <fieldset className="space-y-2 rounded-md border p-3 md:col-span-2">
                <legend className="px-1 text-sm font-medium">{text.selectedClasses}</legend>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {WORLDCOVER_CLASS_OPTIONS.map((item) => (
                    <label key={item.code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(item.code)}
                        onChange={() => toggleSelectedClass(item.code)}
                      />
                      <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      {item.name} ({item.code})
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-2 rounded-md border p-3 md:col-span-2">
                <legend className="px-1 text-sm font-medium">{text.metricsToShow}</legend>
                <div className="flex flex-wrap gap-4">
                  {metricOptions.map((metric) => (
                    <label key={metric.key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={visibleMetrics.includes(metric.key)}
                        onChange={() => toggleVisibleMetric(metric.key)}
                      />
                      {metric.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="space-y-2 rounded-md border p-3 text-sm md:col-span-2">
                <span className="flex items-start gap-2 font-medium">
                  <input type="checkbox" checked={includeUnetData} onChange={(event) => setIncludeUnetData(event.target.checked)} />
                  {text.prepareUnet}
                </span>
                <span className="block text-xs text-muted-foreground">{text.prepareUnetNote}</span>
              </label>
            </div>
            {!isAuthenticated && !authLoading && (
              <p className="text-sm text-muted-foreground">{text.signIn} <Link href="/login" className="font-medium text-primary underline">{text.signInLink}</Link></p>
            )}
            {error && (
              <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
              </p>
            )}
            <Button onClick={runAnalysis} disabled={isRunning || authLoading || !isAuthenticated}>
              {isRunning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{text.loading}</> : text.run}
            </Button>
            {job?.steps && job.steps.length > 0 && (
              <ol className="space-y-2 border-l pl-4 text-sm text-muted-foreground">
                {job.steps.map((step, index) => <li key={`${step.stage}-${index}`}>{step.message}</li>)}
              </ol>
            )}
          </CardContent>
        </Card>

        <EuroSatCnn language={language === "it" ? "it" : "en"} />

        {result && job && (
          <Card>
            <CardHeader>
              <CardTitle>{text.result}</CardTitle>
              <CardDescription>{text.scene}: {result.scene.id} · {result.scene.datetime} · {result.scene.tileCloudCoverPercent.toFixed(1)}% {text.sceneClouds}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
              <div className="space-y-4">
                <img className="w-full rounded-lg border" src={result.mapImage} alt={text.title} />
                <Button onClick={downloadMap} disabled={downloadBusy}>
                  {downloadBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {text.mapDownload}
                </Button>
                <p className="text-xs text-muted-foreground">{text.mapBandNote}</p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">{text.accuracy}</h3>
                {modelMetrics.map(({ name, metrics }) => (
                  <div key={name} className="rounded-lg border p-4">
                    <p className="font-medium">{name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {metricOptions.filter((metric) => visibleMetrics.includes(metric.key)).map((metric) => (
                        <span key={metric.key} className="mr-3 inline-block">{metric.label}: {metrics[metric.key].toFixed(3)}</span>
                      ))}
                    </p>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">{result.reference.meaning}</p>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {result.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <AnalyticsReportDownload
          title={result ? `Report Sentinel-2 - ${result.scene.id}` : "Report Sentinel-2"}
          content={reportContent}
          visuals={reportVisuals}
          conclusion={reportConclusion}
          returnPath="/analysis/remote-sensing"
        />

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>{text.reportTitle}</CardTitle>
              <CardDescription>{text.reportDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
                <p>{text.methodTitle}: Sentinel-2 L2A, {result.processing.pixelSizeMeters} m, bande {result.processing.bands.join(", ")}, indici {result.processing.indices.join(", ")}.</p>
                <p>{text.sampleCounts(result.processing.trainingSampleCount, result.processing.testSampleCount, result.processing.spatialValidationBlockMeters)}</p>
                <p>{text.mapModel}: {result.processing.mapModel}. {text.mapComparison}</p>
                <p>{text.macroWinner(macroF1Leader)}</p>
                <p>{text.deepLearningNote}</p>
              </div>

              <section className="space-y-3">
                <h3 className="font-semibold">{text.classMetricsTitle}</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="p-3">{text.className}</th>
                        <th className="p-3">RF {text.precision}</th>
                        <th className="p-3">RF {text.recall}</th>
                        <th className="p-3">RF {text.f1}</th>
                        <th className="p-3">SVM {text.precision}</th>
                        <th className="p-3">SVM {text.recall}</th>
                        <th className="p-3">SVM {text.f1}</th>
                        <th className="p-3">{text.support}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classPerformance.map((metric) => (
                        <tr key={metric.code} className="border-t">
                          <td className="p-3">
                            <span className="mr-2 inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: metric.color }} />
                            {metric.className} ({metric.code})
                          </td>
                          <td className="p-3">{metric.precision.toFixed(3)}</td>
                          <td className="p-3">{metric.recall.toFixed(3)}</td>
                          <td className="p-3">{metric.f1.toFixed(3)}</td>
                          <td className="p-3">{metric.svm?.precision.toFixed(3) ?? "—"}</td>
                          <td className="p-3">{metric.svm?.recall.toFixed(3) ?? "—"}</td>
                          <td className="p-3">{metric.svm?.f1.toFixed(3) ?? "—"}</td>
                          <td className="p-3">{metric.support}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold">{text.featureTitle}</h3>
                <p className="text-sm text-muted-foreground">{text.featureDescription}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {modelMetrics.map(({ name, metrics }) => {
                    const maxImportance = Math.max(...metrics.featureImportance.map((item) => item.importance), 0);
                    return (
                      <div key={name} className="space-y-3 rounded-lg border p-4">
                        <h4 className="font-medium">{name}</h4>
                        {metrics.featureImportance.map((item) => (
                          <div key={item.name} className="space-y-1">
                            <div className="flex justify-between gap-3 text-xs">
                              <span>{item.name}</span><span>{item.importance.toFixed(3)}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded bg-muted">
                              <div className="h-full bg-primary" style={{ width: `${maxImportance > 0 ? item.importance / maxImportance * 100 : 0}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-8 xl:grid-cols-2">
                <section className="space-y-3">
                  <h3 className="font-semibold">{text.areaTitle}</h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr><th className="p-3">{text.className}</th><th className="p-3">{text.areaHa}</th></tr>
                      </thead>
                      <tbody>
                        {result.classAreas.map((item) => (
                          <tr key={item.code} className="border-t">
                            <td className="p-3">
                              <span className="mr-2 inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                              {item.name} ({item.code})
                            </td>
                            <td className="p-3">{item.areaHa.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="font-semibold">{text.confusionTitle}</h3>
                  <p className="text-sm text-muted-foreground">{text.confusionDescription}</p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-2 text-left">{text.referenceLabel} / {text.predicted}</th>
                          {confusionCodes.map((code) => (
                            <th key={code} className="min-w-14 p-2 text-center">
                              {result.classLegend.find((item) => item.code === code)?.name ?? code}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {confusionCodes.map((code, rowIndex) => (
                          <tr key={code} className="border-t">
                            <th className="p-2 text-left">{result.classLegend.find((item) => item.code === code)?.name ?? code}</th>
                            {confusionCodes.map((predictedCode, columnIndex) => (
                              <td key={predictedCode} className="p-2 text-center">
                                {result.models.randomForest.confusionMatrix[rowIndex]?.[columnIndex] ?? 0}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        )}

        <AoiUnet
          language={language === "it" ? "it" : "en"}
          data={result?.unetTrainingData}
          classLegend={result?.classLegend ?? []}
        />

        <DataInsightSources language={language} />
        <div className="rounded-lg border p-5 text-sm text-muted-foreground">
          {text.portal} · <Link className="font-medium text-primary underline" href="/analysis/portals">{text.portalLink}</Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{text.sourcesTitle}</CardTitle>
            <CardDescription>{text.sourcesDescription}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {text.sources.map((source) => (
              <a
                key={source.url}
                className="inline-flex items-start gap-2 rounded-md border p-3 text-sm font-medium text-primary underline underline-offset-4 hover:bg-accent"
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
                {source.label}
              </a>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
