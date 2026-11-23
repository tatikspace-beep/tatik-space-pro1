import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";

export type PortalExplorationResult = {
  sourceUrl: string;
  sourceHost: string;
  query: string;
  pagesCount: number;
  candidates: Array<{
    url: string;
    label: string;
    kind: string;
    format?: string;
    importable: boolean;
    score: number;
  }>;
  recommendations: Array<{ url: string; label: string; matchedTerms?: string[] }>;
  warnings: string[];
  notes: string[];
};

export type DocumentAnalysisResult = {
  document: {
    name: string;
    format: string;
    bytes: number;
    charactersExtracted: number;
    truncated: boolean;
    pageCount?: number;
    sheetCount?: number;
  };
  extractedTextPreview: string;
  analysis: {
    references: Array<{ label: string; url: string; reason: string }>;
    specialized: { title: string; workflow: string[] } | null;
    note: string;
  };
  processing: string;
};

export type OfficialSeries = {
  name: string;
  unit: string;
  source: string;
  rows: Array<{ date: string; value: number }>;
  url: string;
};

export type StatisticalAnalysis = {
  question: string;
  reports: Array<{
    name: string;
    unit: string;
    source: string;
    count: number;
    firstDate: string;
    lastDate: string;
    direction: string;
    changePercent: number | null;
    forecast: Array<{ date: string; value: number }>;
    validation: Array<{ date: string; actual: number; predicted: number }>;
    mae: number | null;
    mape: number | null;
    warnings: string[];
  }>;
  correlations: Array<{
    first: string;
    second: string;
    r: number;
    count: number;
    interpretation: string;
  }>;
  factorModel: {
    target: string;
    count: number;
    r2: number | null;
    warning: string | null;
  } | null;
  disclaimer: string;
};

export type MlDatasetPreview = {
  name: string;
  rows: number;
  columns: Array<{ name: string; kind: "numeric" | "category"; nonEmpty: number }>;
};

export type MlSourceAnalysisItem = {
  kind: "file" | "url";
  label?: string;
  error?: string;
  document?: DocumentAnalysisResult["document"];
  extractedTextPreview?: string;
  analysis?: DocumentAnalysisResult["analysis"];
  processing?: string;
};

export type MlSourceCorpus = {
  sourceCount: number;
  characters: number;
  keywords: Array<{ term: string; sourceCount: number; occurrences: number }>;
  summary: string[];
  method: string;
};

export type MlSourcesAnalysisResult = {
  items: MlSourceAnalysisItem[];
  corpus: MlSourceCorpus | null;
};

export type MergedMlDataset = {
  name: string;
  contentBase64: string;
  sourceCount: number;
  rows: number;
  columns: string[];
};

export type TabularMlResult = {
  fileName: string;
  task: "classification" | "regression";
  target: string;
  featureCount: number;
  rowCount: number;
  usableRows: number;
  trainRows: number;
  testRows: number;
  models: Array<{
    name: string;
    accuracy?: number;
    balancedAccuracy?: number;
    macroF1?: number;
    confusionMatrix?: number[][];
    r2?: number;
    mae?: number;
    rmse?: number;
  }>;
  bestModel: string;
  classLabels: string[];
  featureImportance: Array<{ name: string; importance: number }>;
  warnings: string[];
};

export type SentinelClassMetrics = {
  code: number;
  className: string;
  precision: number;
  recall: number;
  f1: number;
  support: number;
};

export type SentinelModelMetrics = {
  name: string;
  accuracy: number;
  balancedAccuracy: number;
  macroF1: number;
  kappa: number;
  confusionClassCodes: number[];
  confusionMatrix: number[][];
  perClass: SentinelClassMetrics[];
  featureImportance: Array<{ name: string; importance: number }>;
};

export type SentinelAoiJob = {
  jobId: string;
  status: "complete";
  progress: number;
  steps: Array<{ stage: string; progress: number; message: string }>;
  mapDataBase64: string;
  result: {
    scene: { id: string; datetime: string; tileCloudCoverPercent: number };
    reference: { name: string; meaning: string };
    classLegend: Array<{ code: number; name: string; color: string }>;
    processing: {
      pixelSizeMeters: number;
      bands: string[];
      indices: string[];
      cloudMask: string;
      spatialValidationBlockMeters: number;
      clearPixelCount: number;
      referencePixelCount: number;
      trainingSampleCount: number;
      testSampleCount: number;
      modelComparison: string;
      mapModel: string;
      mapTrainingSampleCount: number;
      maxSamplesPerClass: number;
      selectedClasses: number[];
    };
    models: {
      randomForest: SentinelModelMetrics;
      svm: SentinelModelMetrics;
    };
    classAreas: Array<{ code: number; name: string; color: string; areaHa: number }>;
    mapImage: string;
    limitations: string[];
    unetTrainingData: {
      width: number;
      height: number;
      channels: string[];
      classCodes: number[];
      encoding: "zlib-f32le-interleaved-features-then-u8-worldcover";
      dataBase64: string;
      bbox: [number, number, number, number];
      transform: [number, number, number, number, number, number];
      crs: string;
      sceneId: string;
    } | null;
  };
};

export type UnetGeoTiffExport = {
  width: number;
  height: number;
  classCodes: number[];
  predictedClassCodesBase64: string;
  transform: [number, number, number, number, number, number];
  crs: string;
  bbox: [number, number, number, number];
  sceneId: string;
};

export type UnetGeoTiffExportResult = {
  geoTiffBase64: string;
};

type DataInsightRequestOptions = {
  cookieHeader?: string;
};

type DataInsightTarget = {
  url: URL;
  apiKey: string;
  vercelPreview: boolean;
};

function getServiceTarget(path: string): DataInsightTarget {
  const vercelUrl = process.env.VERCEL_URL;
  const vercelFunctionBaseUrl = process.env.VERCEL_ENV === "production"
    ? process.env.APP_URL
    : vercelUrl
      ? `https://${vercelUrl}`
      : undefined;
  const vercelFunction = !ENV.dataInsightApiUrl && Boolean(vercelFunctionBaseUrl);
  if (!ENV.dataInsightApiUrl && !vercelFunction) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Il servizio Data Insight non e configurato.",
    });
  }

  let base: URL;
  const vercelPreview = vercelFunction && process.env.VERCEL_ENV === "preview";
  try {
    base = new URL(ENV.dataInsightApiUrl || vercelFunctionBaseUrl || "");
  } catch {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "L'URL del servizio Data Insight non e valido.",
    });
  }
  const isLoopback = base.hostname === "localhost" || base.hostname === "127.0.0.1" || base.hostname === "[::1]";
  if (base.protocol !== "https:" && !isLoopback) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Il servizio Data Insight remoto deve usare HTTPS.",
    });
  }
  const apiKey = (vercelFunction ? ENV.dataInsightApiKey || ENV.cookieSecret : ENV.dataInsightApiKey) ?? "";
  if (!isLoopback && !apiKey) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Manca la chiave di accesso del servizio Data Insight.",
    });
  }
  if (!isLoopback && apiKey.length < 32) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "La chiave del servizio Data Insight deve contenere almeno 32 caratteri.",
    });
  }
  if (vercelFunction) {
    const url = new URL("/api/data_insight", base);
    url.searchParams.set("path", path);
    return { url, apiKey, vercelPreview };
  }

  return {
    url: new URL(path, `${base.toString().replace(/\/+$/, "")}/`),
    apiKey,
    vercelPreview: false,
  };
}

export async function callDataInsight<T>(
  path: string,
  payload?: unknown,
  options: DataInsightRequestOptions = {},
): Promise<T> {
  const target = getServiceTarget(path);
  let response: Response;
  try {
    response = await fetch(target.url, {
      method: payload === undefined ? "GET" : "POST",
      headers: {
        Accept: "application/json",
        ...(payload === undefined ? {} : { "Content-Type": "application/json" }),
        ...(target.apiKey ? { Authorization: `Bearer ${target.apiKey}` } : {}),
        ...(target.vercelPreview && options.cookieHeader ? { Cookie: options.cookieHeader } : {}),
      },
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
      signal: AbortSignal.timeout(280_000),
    });
  } catch (error) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `Servizio Data Insight non raggiungibile: ${error instanceof Error ? error.message : "errore di rete"}`,
    });
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `Il servizio Data Insight ha restituito una risposta non JSON (HTTP ${response.status}).`,
    });
  }

  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "Il servizio Data Insight ha restituito JSON non valido.",
    });
  }

  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
      ? data.error
      : `Servizio Data Insight: HTTP ${response.status}.`;
    throw new TRPCError({
      code: response.status === 401 ? "PRECONDITION_FAILED" : "BAD_GATEWAY",
      message,
    });
  }
  return data as T;
}
