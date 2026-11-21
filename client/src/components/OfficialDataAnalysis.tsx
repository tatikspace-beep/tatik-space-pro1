import { useMemo, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { AlertCircle, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AnalyticsReportDownload, AnalyticsUsageNotice } from "@/components/AnalyticsReportDownload";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AnalyticsReportConclusion, AnalyticsReportVisual } from "@/lib/analyticsReportPdf";
import { createStatisticalAssessment } from "@/lib/statisticalAssessment";
import type { AppRouter } from "../../../server/routers";

type ProviderId = "worldbank" | "nasa" | "ecb" | "eurostat";
type DataRow = { date: string; value: number };
type Series = { name: string; unit: string; source: string; url?: string; rows: DataRow[] };
type ImportedData = { name: string; headers: string[]; rows: Record<string, unknown>[] };

const providers: Record<ProviderId, {
  name: string;
  indicators: Array<{ id: string; label: string; unit: string }>;
  pageUrl: string;
  apiUrl: string;
  docsUrl: string;
}> = {
  worldbank: {
    name: "Banca Mondiale",
    indicators: [
      { id: "NY.GDP.MKTP.CD", label: "PIL (USD correnti)", unit: "USD" },
      { id: "SP.POP.TOTL", label: "Popolazione totale", unit: "persone" },
      { id: "MS.MIL.XPND.GD.ZS", label: "Spesa militare (% PIL; WDI/SIPRI)", unit: "% PIL" },
    ],
    pageUrl: "https://data.worldbank.org/",
    apiUrl: "https://api.worldbank.org/v2/country/ITA/indicator/NY.GDP.MKTP.CD?format=json",
    docsUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392",
  },
  nasa: {
    name: "NASA POWER",
    indicators: [{ id: "T2M", label: "Temperatura media giornaliera", unit: "°C" }],
    pageUrl: "https://power.larc.nasa.gov/",
    apiUrl: "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M&community=RE&longitude=12.4964&latitude=41.9028&start=20210101&end=20211231&format=JSON",
    docsUrl: "https://power.larc.nasa.gov/docs/services/api/temporal/daily/",
  },
  ecb: {
    name: "BCE",
    indicators: [{ id: "USD_EUR", label: "Cambio di riferimento USD per EUR", unit: "USD/EUR" }],
    pageUrl: "https://data.ecb.europa.eu/",
    apiUrl: "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?format=csvdata",
    docsUrl: "https://data.ecb.europa.eu/help/api/data-examples",
  },
  eurostat: {
    name: "Eurostat",
    indicators: [{ id: "POP", label: "Popolazione residente in Italia", unit: "persone" }],
    pageUrl: "https://ec.europa.eu/eurostat/databrowser/",
    apiUrl: "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjan?geo=IT&sex=T&age=TOTAL&unit=NR",
    docsUrl: "https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started",
  },
};

const additionalSources = [
  {
    name: "Fondo Monetario Internazionale",
    description: "WEO, bilancia dei pagamenti, conti nazionali e altri dataset macroeconomici. Seleziona dataset e schema prima di collegare un connettore.",
    links: [
      { label: "Portale dati IMF", url: "https://data.imf.org/" },
      { label: "Database e accesso ai dati", url: "https://www.imf.org/en/Data" },
    ],
  },
  {
    name: "FAO · FAOSTAT",
    description: "Statistiche globali su agricoltura, alimentazione, produzione, prezzi e risorse, per oltre 245 Paesi e territori.",
    links: [{ label: "Catalogo FAOSTAT", url: "https://www.fao.org/faostat/en/#data" }],
  },
  {
    name: "OCSE · OECD Data Explorer",
    description: "Statistiche internazionali comparabili su economia, società, istruzione, energia e ambiente.",
    links: [
      { label: "Data Explorer", url: "https://data-explorer.oecd.org/" },
      { label: "Portale SDMX", url: "https://sdmx.oecd.org/" },
    ],
  },
  {
    name: "NOAA · clima e oceani",
    description: "Dati meteorologici e climatici, incluse serie globali. L'API Climate Data Online richiede un token gratuito.",
    links: [
      { label: "Documentazione API", url: "https://www.ncei.noaa.gov/cdo-web/webservices/v2" },
      { label: "Richiedi un token", url: "https://www.ncei.noaa.gov/cdo-web/token" },
    ],
  },
  {
    name: "Copernicus Climate Data Store",
    description: "Rianalisi, osservazioni e proiezioni climatiche europee. Alcuni download richiedono account, credenziali API e accettazione delle condizioni del dataset.",
    links: [
      { label: "Climate Data Store", url: "https://cds.climate.copernicus.eu/" },
      { label: "Guida API", url: "https://cds.climate.copernicus.eu/how-to-api" },
    ],
  },
  {
    name: "Copernicus Data Space · osservazione della Terra",
    description: "Catalogo di immagini satellitari Copernicus, compresi i dati Sentinel accessibili tramite catalogo STAC.",
    links: [
      { label: "Browser Sentinel", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "Documentazione API STAC", url: "https://documentation.dataspace.copernicus.eu/APIs/STAC.html" },
    ],
  },
  {
    name: "USGS EarthExplorer · Landsat",
    description: "Catalogo USGS per cercare e scaricare scene Landsat e altri prodotti di osservazione della Terra.",
    links: [
      { label: "Portale EarthExplorer", url: "https://earthexplorer.usgs.gov/" },
      { label: "Documentazione API M2M", url: "https://m2m.cr.usgs.gov/api/docs/json/" },
    ],
  },
  {
    name: "NASA Earthdata",
    description: "Catalogo NASA di prodotti di osservazione della Terra, dati ambientali e collezioni satellitari.",
    links: [
      { label: "Earthdata Search", url: "https://search.earthdata.nasa.gov/" },
      { label: "Documentazione API CMR", url: "https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html" },
    ],
  },
  {
    name: "Copernicus Land Monitoring Service",
    description: "Dati e prodotti europei sul territorio, la copertura del suolo e i cambiamenti ambientali.",
    links: [{ label: "Catalogo prodotti", url: "https://land.copernicus.eu/en/products" }],
  },
  {
    name: "NATO · spesa per la difesa",
    description: "Statistiche annuali aggregate secondo la definizione NATO, limitate ai Paesi alleati; non sono dati operativi o tattici.",
    links: [{ label: "Metodologia e statistiche NATO", url: "https://www.nato.int/en/what-we-do/introduction-to-nato/defence-expenditures-and-natos-5-commitment" }],
  },
  {
    name: "ONU · Registro delle armi convenzionali",
    description: "Registro basato sulle comunicazioni nazionali sui trasferimenti di armi convenzionali: dati aggregati e dichiarativi, non in tempo reale.",
    links: [
      { label: "UNROCA", url: "https://www.unroca.org/" },
      { label: "Informazioni UNODA", url: "https://disarmament.unoda.org/convarms/register/" },
    ],
  },
  {
    name: "Portale dati dell'Unione europea",
    description: "Indice europeo per scoprire dataset pubblicati da istituzioni e amministrazioni dell'UE.",
    links: [{ label: "data.europa.eu", url: "https://data.europa.eu/" }],
  },
  {
    name: "dati.gov.it",
    description: "Catalogo nazionale dei dati aperti pubblicati dalle amministrazioni italiane.",
    links: [{ label: "Portale dati aperti italiano", url: "https://www.dati.gov.it/" }],
  },
  {
    name: "Data.gov · Stati Uniti",
    description: "Catalogo federale statunitense di dataset pubblici, con API per il catalogo.",
    links: [
      { label: "Catalogo Data.gov", url: "https://www.data.gov/" },
      { label: "Documentazione API", url: "https://api.data.gov/docs/" },
    ],
  },
  {
    name: "UN Data",
    description: "Portale statistico delle Nazioni Unite con dataset internazionali per numerosi temi e Paesi.",
    links: [{ label: "Catalogo UN Data", url: "https://data.un.org/" }],
  },
];

const palette = ["#2563eb", "#ea580c", "#16a34a", "#9333ea", "#db2777", "#0891b2", "#ca8a04", "#4f46e5"];

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  let normalized = value.trim().replace(/\s/g, "");
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.lastIndexOf(",") > normalized.lastIndexOf(".")
      ? normalized.replace(/\./g, "").replace(",", ".")
      : normalized.replace(/,/g, "");
  } else {
    normalized = normalized.replace(",", ".");
  }
  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
}

function normalizeDate(value: unknown): string {
  const text = String(value ?? "").trim();
  if (/^\d{8}$/.test(text)) return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  if (/^\d{4}$/.test(text)) return `${text}-01-01`;
  if (/^\d{4}-\d{2}$/.test(text)) return `${text}-01`;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const local = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (local) return `${local[3]}-${local[2].padStart(2, "0")}-${local[1].padStart(2, "0")}`;
  const timestamp = Date.parse(text);
  return Number.isNaN(timestamp) ? "" : new Date(timestamp).toISOString().slice(0, 10);
}

function parseCsv(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const matrix: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const delimiter = (text.split(/\r?\n/, 1)[0].match(/;/g)?.length ?? 0)
    > (text.split(/\r?\n/, 1)[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else cell += character;
    } else if (character === '"' && cell.length === 0) quoted = true;
    else if (character === delimiter) {
      row.push(cell);
      cell = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) matrix.push(row);
      row = [];
      cell = "";
    } else cell += character;
  }
  if (quoted) throw new Error("CSV non valido: virgolette non bilanciate.");
  row.push(cell);
  if (row.some((value) => value.trim())) matrix.push(row);
  if (matrix.length < 2) throw new Error("Il CSV deve contenere intestazioni e almeno una riga di dati.");
  const headers = matrix[0].map((value, index) => value.trim() || `Colonna ${index + 1}`);
  if (new Set(headers).size !== headers.length) throw new Error("Le intestazioni CSV devono essere univoche.");
  return {
    headers,
    rows: matrix.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))),
  };
}

function parseImportedText(text: string, name: string): ImportedData {
  if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
    const data: unknown = JSON.parse(text);
    if (!Array.isArray(data) || !data.length || data.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
      throw new Error("Il JSON deve essere un array non vuoto di oggetti, uno per osservazione.");
    }
    if (data.length > 15_000) throw new Error("Il file supera il limite di 15.000 righe.");
    return { name, headers: [...new Set(data.flatMap((item) => Object.keys(item)))], rows: data as Record<string, unknown>[] };
  }
  const parsed = parseCsv(text);
  if (parsed.rows.length > 15_000) throw new Error("Il file supera il limite di 15.000 righe.");
  return { ...parsed, name };
}

function importedSeries(data: ImportedData, dateColumn: string, numericColumns: string[], unit: string): Series[] {
  return numericColumns.map((column) => ({
    name: `${data.name}: ${column}`,
    unit: unit.trim() || "unità",
    source: data.name,
    rows: data.rows.flatMap((row) => {
      const date = normalizeDate(row[dateColumn]);
      const value = parseNumber(row[column]);
      return date && value !== null ? [{ date, value }] : [];
    }).sort((left, right) => left.date.localeCompare(right.date)),
  }));
}

export function OfficialDataAnalysis() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>("worldbank");
  const [indicator, setIndicator] = useState(providers.worldbank.indicators[0].id);
  const [country, setCountry] = useState("ITA");
  const [latitude, setLatitude] = useState("41.9028");
  const [longitude, setLongitude] = useState("12.4964");
  const [startDate, setStartDate] = useState("2015-01-01");
  const [endDate, setEndDate] = useState(new Date(Date.now() - 86_400_000).toISOString().slice(0, 10));
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [forecastSteps, setForecastSteps] = useState("5");
  const [backtestSteps, setBacktestSteps] = useState("3");
  const [question, setQuestion] = useState("");
  const [sourceRows, setSourceRows] = useState([{ id: 1, provider: "worldbank" as ProviderId, indicator: "NY.GDP.MKTP.CD", country: "ITA" }]);
  const [imported, setImported] = useState<ImportedData | null>(null);
  const [dateColumn, setDateColumn] = useState("");
  const [numericColumns, setNumericColumns] = useState<string[]>([]);
  const [externalUnit, setExternalUnit] = useState("unità");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [targetKey, setTargetKey] = useState("official:1");
  const [series, setSeries] = useState<Series[]>([]);
  const [analysis, setAnalysis] = useState<inferRouterOutputs<AppRouter>["dataInsight"]["analyzeData"] | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const officialMutation = trpc.dataInsight.fetchOfficialSeries.useMutation();
  const importMutation = trpc.dataInsight.importDataUrl.useMutation();
  const analyzeMutation = trpc.dataInsight.analyzeData.useMutation();
  const busy = officialMutation.isPending || importMutation.isPending || analyzeMutation.isPending;

  const currentProvider = providers[selectedProvider];
  const allDates = useMemo(() => [...new Set([
    ...series.flatMap((item) => item.rows.map((row) => row.date)),
    ...(analysis?.reports.flatMap((report) => report.forecast.map((row) => row.date)) ?? []),
  ])].sort(), [analysis, series]);
  const chartData = useMemo(() => allDates.map((date) => {
    const point: Record<string, string | number> = { date };
    series.forEach((item) => {
      const base = item.rows.find((row) => row.value !== 0)?.value;
      const observed = item.rows.find((row) => row.date === date)?.value;
      if (observed !== undefined) point[item.name] = base ? observed / base * 100 : observed;
      const forecast = analysis?.reports.find((report) => report.name === item.name)?.forecast.find((row) => row.date === date);
      if (forecast) point[`${item.name} (proiezione)`] = base ? forecast.value / base * 100 : forecast.value;
    });
    return point;
  }), [allDates, analysis, series]);
  const reportContent = useMemo(() => {
    if (!analysis) return "";
    return [
      `Serie analizzate: ${analysis.reports.length}`,
      `Osservazioni complessive: ${analysis.reports.reduce((count, report) => count + report.count, 0)}`,
      "",
      "Risultati per serie:",
      ...analysis.reports.flatMap((report) => [
        `${report.name} — ${report.source} (${report.unit})`,
        `Osservazioni: ${report.count}; periodo: ${report.firstDate} – ${report.lastDate}; direzione: ${report.direction}`,
        `Variazione: ${report.changePercent === null ? "n.d." : `${report.changePercent.toFixed(2)}%`}; MAE: ${report.mae === null ? "n.d." : report.mae.toFixed(3)}; MAPE: ${report.mape === null ? "n.d." : report.mape.toFixed(2)}`,
        ...report.warnings.map((warning) => `Avvertenza: ${warning}`),
        "",
      ]),
      "Correlazioni:",
      ...(analysis.correlations.length
        ? analysis.correlations.map((item) => `${item.first} / ${item.second}: r=${item.r.toFixed(3)} su ${item.count} date comuni; ${item.interpretation}`)
        : ["Nessuna correlazione calcolata."]),
      ...(analysis.factorModel
        ? ["", `Modello fattoriale: target ${analysis.factorModel.target}; osservazioni ${analysis.factorModel.count}; R² ${analysis.factorModel.r2 ?? "n.d."}.`, analysis.factorModel.warning || ""]
        : []),
      "",
      analysis.disclaimer,
    ].filter(Boolean).join("\n");
  }, [analysis]);
  const reportVisuals = useMemo<AnalyticsReportVisual[]>(() => {
    if (!analysis || !series.length || !allDates.length) return [];
    const observed = series.map((item, index) => ({
      name: item.name,
      color: palette[index % palette.length],
      values: chartData.map((point) => typeof point[item.name] === "number" ? point[item.name] as number : null),
    }));
    const forecasts = series.flatMap((item, index) => {
      const forecastName = `${item.name} (proiezione)`;
      if (!analysis.reports.find((report) => report.name === item.name)?.forecast.length) return [];
      return [{
        name: forecastName,
        color: palette[index % palette.length],
        dashed: true,
        values: chartData.map((point) => typeof point[forecastName] === "number" ? point[forecastName] as number : null),
      }];
    });
    return [{
      type: "chart",
      title: "Andamento delle serie storiche (base 100)",
      chartType: "line",
      categories: allDates,
      series: [...observed, ...forecasts],
    }];
  }, [allDates, analysis, chartData, series]);
  const reportConclusion = useMemo<AnalyticsReportConclusion | undefined>(
    () => analysis ? createStatisticalAssessment(analysis, language === "it" ? "it" : "en") : undefined,
    [analysis, language],
  );

  const addSource = () => setSourceRows((rows) => [
    ...rows,
    { id: Math.max(0, ...rows.map((row) => row.id)) + 1, provider: "worldbank", indicator: providers.worldbank.indicators[0].id, country: "ITA" },
  ]);
  const updateSource = (id: number, patch: Partial<typeof sourceRows[number]>) => {
    setSourceRows((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const setImportedText = (text: string, name: string) => {
    const data = parseImportedText(text, name);
    const guessedDate = data.headers.find((header) => /date|time|year|period|data|anno/i.test(header)) ?? data.headers[0];
    const numeric = data.headers.filter((header) => data.rows.some((row) => parseNumber(row[header]) !== null));
    if (!numeric.length) throw new Error("Non sono state trovate colonne numeriche nel file.");
    setImported(data);
    setDateColumn(guessedDate);
    setNumericColumns(numeric.slice(0, 1));
    setError("");
    setStatus(`${data.rows.length.toLocaleString()} record caricati da ${name}.`);
  };

  const loadUrl = async () => {
    setError("");
    try {
      const url = new URL(remoteUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Sono accettati solo URL HTTP o HTTPS.");
      const result = await importMutation.mutateAsync({ url: url.href });
      setImportedText(result.content, result.name);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const runAnalysis = async () => {
    setError("");
    setStatus("");
    setAnalysis(null);
    const start = startDate || "1900-01-01";
    const end = endDate;
    if (!end || start > end) {
      setError("Controlla l'intervallo: la data iniziale deve precedere quella finale.");
      return;
    }
    const min = parseNumber(minValue);
    const max = parseNumber(maxValue);
    if (min !== null && max !== null && min > max) {
      setError("Il valore minimo non può superare il valore massimo.");
      return;
    }
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
      setError("Coordinate NASA POWER non valide.");
      return;
    }

    try {
      setStatus("Caricamento delle serie dalle fonti ufficiali…");
      const official = await Promise.all(sourceRows.map(async (row) => {
        const definition = providers[row.provider];
        const selected = definition.indicators.find((item) => item.id === row.indicator);
        if (!selected) throw new Error(`Indicatore non valido per ${definition.name}.`);
        const fetched = await officialMutation.mutateAsync({
          provider: row.provider,
          indicator: row.indicator,
          ...(row.provider === "worldbank" ? { country: row.country.trim().toUpperCase() } : {}),
          start,
          end,
          latitude: lat,
          longitude: lon,
        });
        return {
          targetKey: `official:${row.id}`,
          series: {
            ...fetched,
            rows: fetched.rows.filter((item) => item.date >= start && item.date <= end
              && (min === null || item.value >= min) && (max === null || item.value <= max)),
          },
        };
      }));
      const userSeries = imported && numericColumns.length
        ? importedSeries(imported, dateColumn, numericColumns, externalUnit).map((item, index) => ({
            targetKey: `file:${numericColumns[index]}`,
            series: {
              ...item,
              rows: item.rows.filter((row) => row.date >= start && row.date <= end
                && (min === null || row.value >= min) && (max === null || row.value <= max)),
            },
          }))
        : [];
      const selectedSeries = [...official, ...userSeries].filter((item) => item.series.rows.length);
      const all = selectedSeries.map((item) => item.series);
      if (!all.length) throw new Error("Nessuna osservazione rimasta nell'intervallo e nei filtri scelti.");
      if (all.length > 10) throw new Error("Seleziona al massimo 10 serie da analizzare insieme.");
      const selectedTargetIndex = Math.max(0, selectedSeries.findIndex((item) => item.targetKey === targetKey));
      const assessment = await analyzeMutation.mutateAsync({
        series: all,
        targetIndex: selectedTargetIndex,
        forecastSteps: Math.min(20, Math.max(0, Number(forecastSteps) || 0)),
        backtestSteps: Math.min(10, Math.max(0, Number(backtestSteps) || 0)),
        question: question.trim(),
      });
      setSeries(all);
      setAnalysis(assessment);
      setStatus(`Analisi completata: ${all.length} serie, ${all.reduce((count, item) => count + item.rows.length, 0).toLocaleString()} osservazioni.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setStatus("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisi di serie storiche e fonti dati ufficiali</CardTitle>
        <CardDescription>
          Collega i connettori verificati, importa CSV/JSON, confronta serie temporali e genera proiezioni esplorative.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-7">
        <AnalyticsUsageNotice language={language === "it" ? "it" : "en"} />
        <section className="space-y-3">
          <h3 className="font-semibold">Fonti dati ufficiali da analizzare</h3>
          <div className="space-y-3">
            {sourceRows.map((row) => {
              const definition = providers[row.provider];
              return (
                <div key={row.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1.5fr_1fr_auto]">
                  <label className="space-y-1 text-sm">Fonte
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3" value={row.provider} onChange={(event) => {
                      const provider = event.target.value as ProviderId;
                      updateSource(row.id, { provider, indicator: providers[provider].indicators[0].id });
                    }}>
                      {(Object.keys(providers) as ProviderId[]).map((id) => <option key={id} value={id}>{providers[id].name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm">Indicatore
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3" value={row.indicator} onChange={(event) => updateSource(row.id, { indicator: event.target.value })}>
                      {definition.indicators.map((item) => <option key={item.id} value={item.id}>{item.label} ({item.unit})</option>)}
                    </select>
                  </label>
                  {row.provider === "worldbank" ? (
                    <label className="space-y-1 text-sm">Paese ISO-3
                      <Input value={row.country} maxLength={3} onChange={(event) => updateSource(row.id, { country: event.target.value })} />
                    </label>
                  ) : <div />}
                  <Button variant="outline" size="icon" aria-label="Rimuovi variabile" disabled={sourceRows.length <= 1} onClick={() => setSourceRows((rows) => rows.filter((item) => item.id !== row.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={addSource}><Plus className="mr-2 h-4 w-4" />Aggiungi variabile</Button>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">Latitudine NASA POWER<Input type="number" min="-90" max="90" step="0.0001" value={latitude} onChange={(event) => setLatitude(event.target.value)} /></label>
            <label className="space-y-1 text-sm">Longitudine NASA POWER<Input type="number" min="-180" max="180" step="0.0001" value={longitude} onChange={(event) => setLongitude(event.target.value)} /></label>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">Carica dati dal dispositivo o da un URL</h3>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="space-y-1 text-sm">File CSV o JSON
              <Input type="file" accept=".csv,.json,text/csv,application/json" onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 7 * 1024 * 1024) {
                  setError("Il file non può superare 7 MB.");
                  return;
                }
                try {
                  setImportedText(await file.text(), file.name);
                  setError("");
                } catch (reason) {
                  setError(reason instanceof Error ? reason.message : String(reason));
                }
              }} />
            </label>
            <label className="space-y-1 text-sm">URL di CSV/JSON
              <Input type="url" value={remoteUrl} onChange={(event) => setRemoteUrl(event.target.value)} placeholder="https://.../dataset.csv" />
            </label>
            <Button variant="outline" onClick={loadUrl} disabled={busy || !remoteUrl.trim()}>
              {importMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Carica URL
            </Button>
          </div>
          {imported && (
            <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3">
              <p className="self-center text-sm">{imported.rows.length.toLocaleString()} righe · {imported.name}</p>
              <label className="space-y-1 text-sm">Colonna data
                <select className="h-10 w-full rounded-md border border-input bg-background px-3" value={dateColumn} onChange={(event) => setDateColumn(event.target.value)}>
                  {imported.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                </select>
              </label>
              <label className="space-y-1 text-sm">Unità colonne caricate<Input value={externalUnit} onChange={(event) => setExternalUnit(event.target.value)} /></label>
              <fieldset className="sm:col-span-3">
                <legend className="mb-2 text-sm">Colonne numeriche</legend>
                <div className="flex flex-wrap gap-3">
                  {imported.headers.filter((header) => imported.rows.some((row) => parseNumber(row[header]) !== null)).map((header) => (
                    <label key={header} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={numericColumns.includes(header)} onChange={(event) => setNumericColumns((columns) => event.target.checked ? [...columns, header] : columns.filter((item) => item !== header))} />
                      {header}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">Intervallo storico e proiezioni</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-sm">Dal<Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
            <label className="space-y-1 text-sm">Al<Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
            <label className="space-y-1 text-sm">Valore minimo<Input type="number" step="any" value={minValue} onChange={(event) => setMinValue(event.target.value)} /></label>
            <label className="space-y-1 text-sm">Valore massimo<Input type="number" step="any" value={maxValue} onChange={(event) => setMaxValue(event.target.value)} /></label>
            <label className="space-y-1 text-sm">Passi proiettati nel futuro<Input type="number" min="0" max="20" value={forecastSteps} onChange={(event) => setForecastSteps(event.target.value)} /></label>
            <label className="space-y-1 text-sm">Punti storici da validare<Input type="number" min="0" max="10" value={backtestSteps} onChange={(event) => setBacktestSteps(event.target.value)} /></label>
          </div>
          <label className="block space-y-1 text-sm">Domanda per l’assistente di analisi
            <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} rows={2} placeholder="Es. Quale serie cresce più rapidamente e con quale incertezza?" />
          </label>
          <label className="block max-w-xl space-y-1 text-sm">Variabile da valutare come obiettivo
            <select className="h-10 w-full rounded-md border border-input bg-background px-3" value={targetKey} onChange={(event) => setTargetKey(event.target.value)}>
              {sourceRows.map((row) => {
                const definition = providers[row.provider];
                const selected = definition.indicators.find((item) => item.id === row.indicator);
                return <option key={`official:${row.id}`} value={`official:${row.id}`}>{selected?.label ?? definition.name} · {definition.name}{row.provider === "worldbank" ? ` (${row.country.toUpperCase()})` : ""}</option>;
              })}
              {numericColumns.map((column) => <option key={`file:${column}`} value={`file:${column}`}>{imported?.name}: {column}</option>)}
            </select>
          </label>
          <p className="text-xs text-muted-foreground">La proiezione usa una regressione lineare semplice. Il test storico confronta stime con gli ultimi punti già osservati. Sono strumenti esplorativi: non misurano causalità e non garantiscono risultati futuri.</p>
          {!isAuthenticated && !authLoading && <p className="text-sm text-muted-foreground">Accedi per caricare e analizzare dati. <Link href="/login" className="text-primary underline">Accedi</Link></p>}
          {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
          {status && <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{status}</p>}
          <Button onClick={runAnalysis} disabled={busy || authLoading || !isAuthenticated}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Carica e analizza i dati
          </Button>
        </section>

        {analysis && (
          <section className="space-y-4 border-t pt-6">
            <h3 className="font-semibold">Risultati dell’analisi</h3>
            <div className="h-80 w-full rounded-lg border p-3" role="img" aria-label="Grafico delle serie temporali analizzate">
              <p className="mb-1 text-xs text-muted-foreground">Serie indicizzate a base 100 quando il primo valore è diverso da zero; per i valori zero si mantengono le unità originali.</p>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={24} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {series.map((item, index) => (
                    <Line key={item.name} type="monotone" dataKey={item.name} stroke={palette[index % palette.length]} dot={false} connectNulls />
                  ))}
                  {series.flatMap((item, index) => analysis.reports.find((report) => report.name === item.name)?.forecast.length
                    ? [<Line key={`${item.name}-forecast`} type="monotone" dataKey={`${item.name} (proiezione)`} stroke={palette[index % palette.length]} strokeDasharray="5 5" dot={false} connectNulls />]
                    : [])}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-muted"><tr><th className="p-3">Data</th>{series.map((item) => <th className="p-3" key={item.name} title={`${item.source} · ${item.unit}`}>{item.name} ({item.unit})</th>)}</tr></thead>
                <tbody>
                  {allDates.filter((date) => series.some((item) => item.rows.some((row) => row.date === date))).slice(-300).map((date) => (
                    <tr key={date} className="border-t">
                      <td className="p-3">{date}</td>
                      {series.map((item) => <td className="p-3" key={item.name}>{item.rows.find((row) => row.date === date)?.value.toLocaleString(undefined, { maximumFractionDigits: 3 }) ?? "—"}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-muted"><tr><th className="p-3">Serie / fonte</th><th className="p-3">Osservazioni</th><th className="p-3">Periodo</th><th className="p-3">Trend</th><th className="p-3">MAE test storico</th><th className="p-3">Fonte ufficiale</th></tr></thead>
                <tbody>
                  {analysis.reports.map((report, index) => (
                    <tr key={`${report.name}-${index}`} className="border-t">
                      <td className="p-3">{report.name}<span className="block text-xs text-muted-foreground">{report.unit} · {report.source}</span></td>
                      <td className="p-3">{report.count.toLocaleString()}</td>
                      <td className="p-3">{report.firstDate} – {report.lastDate}</td>
                      <td className="p-3">{report.direction}</td>
                      <td className="p-3">{report.mae === null ? "—" : report.mae.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                      <td className="p-3">{series[index]?.url
                        ? <a className="text-primary underline" href={series[index].url} target="_blank" rel="noopener noreferrer">Apri dati <ExternalLink className="inline h-3 w-3" /></a>
                        : Object.values(providers).some((provider) => provider.name === report.source)
                          ? <a className="text-primary underline" href={Object.values(providers).find((provider) => provider.name === report.source)?.pageUrl} target="_blank" rel="noopener noreferrer">Apri portale</a>
                          : <span>{report.source}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {analysis.reports.flatMap((report) => report.warnings.map((warning) => <li key={`${report.name}-${warning}`}>• {report.name}: {warning}</li>))}
              {analysis.correlations.map((item) => <li key={`${item.first}-${item.second}`}>• Associazione tra {item.first} e {item.second}: r={item.r.toFixed(3)} su {item.count} date comuni; non implica causalità.</li>)}
              {analysis.factorModel?.warning && <li>• {analysis.factorModel.warning}</li>}
              <li>{analysis.disclaimer}</li>
            </ul>
          </section>
        )}
        <AnalyticsReportDownload
          title="Report analisi serie storiche"
          content={reportContent}
          visuals={reportVisuals}
          conclusion={reportConclusion}
          returnPath="/analysis/portals"
        />
      </CardContent>
    </Card>
  );
}

export function OfficialDataCatalogs() {
  return (
    <section className="space-y-3 border-t pt-6">
      <h3 className="font-semibold">Catalogo e API ufficiali</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.entries(providers) as Array<[ProviderId, typeof providers[ProviderId]]>).map(([id, provider]) => (
          <article key={id} className="rounded-lg border p-4">
            <h4 className="font-medium">{provider.name}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{provider.indicators.map((item) => item.label).join(" · ")}</p>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
              <a className="text-primary underline" href={provider.pageUrl} target="_blank" rel="noopener noreferrer">Portale dati <ExternalLink className="inline h-3 w-3" /></a>
              <a className="text-primary underline" href={provider.apiUrl} target="_blank" rel="noopener noreferrer">API ufficiale <ExternalLink className="inline h-3 w-3" /></a>
              <a className="text-primary underline" href={provider.docsUrl} target="_blank" rel="noopener noreferrer">Documentazione <ExternalLink className="inline h-3 w-3" /></a>
            </div>
          </article>
        ))}
      </div>
      <div className="space-y-3 pt-2">
        <div>
          <h4 className="font-medium">Altri cataloghi e fonti ufficiali</h4>
          <p className="text-sm text-muted-foreground">
            Questi portali ampliano la ricerca dei dataset. Non sono connettori automatici: scegli il dataset sul sito della fonte e importa un CSV/JSON o un URL supportato.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {additionalSources.map((source) => (
            <article key={source.name} className="rounded-lg border p-4">
              <h5 className="font-medium">{source.name}</h5>
              <p className="mt-1 text-sm text-muted-foreground">{source.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {source.links.map((link) => (
                  <a key={link.url} className="text-primary underline" href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label} <ExternalLink className="inline h-3 w-3" />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
