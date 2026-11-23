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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  AnalyticsReportDownload,
  AnalyticsUsageNotice,
} from "@/components/AnalyticsReportDownload";
import { useLanguage } from "@/contexts/LanguageContext";
import type {
  AnalyticsReportConclusion,
  AnalyticsReportLanguage,
  AnalyticsReportVisual,
} from "@/lib/analyticsReportPdf";
import { resolveAnalyticsReportLanguage } from "@/lib/analyticsReportPdf";
import {
  createStatisticalAssessment,
  localizeStatisticalCorrelationInterpretation,
  localizeStatisticalDirection,
  localizeStatisticalSeriesLabel,
  localizeStatisticalText,
  localizeStatisticalUnit,
} from "@/lib/statisticalAssessment";
import type { AppRouter } from "../../../server/routers";

type ProviderId = "worldbank" | "nasa" | "ecb" | "eurostat";
type DataRow = { date: string; value: number };
type Series = {
  name: string;
  unit: string;
  source: string;
  url?: string;
  officialProvider?: ProviderId;
  rows: DataRow[];
};
type ImportedData = {
  name: string;
  headers: string[];
  rows: Record<string, unknown>[];
};

function formatReportNumber(
  value: number,
  language: AnalyticsReportLanguage,
  maximumFractionDigits = 2
) {
  const locale: Record<AnalyticsReportLanguage, string> = {
    en: "en-US", it: "it-IT", es: "es-ES", fr: "fr-FR", de: "de-DE",
    pt: "pt-PT", ru: "ru-RU", pl: "pl-PL", nl: "nl-NL", tr: "tr-TR",
    sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI", uk: "uk-UA",
    cs: "cs-CZ",
  };
  return value.toLocaleString(locale[language], {
    maximumFractionDigits,
  });
}

const providers: Record<
  ProviderId,
  {
    name: string;
    indicators: Array<{ id: string; label: string; unit: string }>;
    pageUrl: string;
    apiUrl: string;
    docsUrl: string;
  }
> = {
  worldbank: {
    name: "Banca Mondiale",
    indicators: [
      { id: "NY.GDP.MKTP.CD", label: "PIL (USD correnti)", unit: "USD" },
      { id: "SP.POP.TOTL", label: "Popolazione totale", unit: "persone" },
      {
        id: "MS.MIL.XPND.GD.ZS",
        label: "Spesa militare (% PIL; WDI/SIPRI)",
        unit: "% PIL",
      },
    ],
    pageUrl: "https://data.worldbank.org/",
    apiUrl:
      "https://api.worldbank.org/v2/country/ITA/indicator/NY.GDP.MKTP.CD?format=json",
    docsUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392",
  },
  nasa: {
    name: "NASA POWER",
    indicators: [
      { id: "T2M", label: "Temperatura media giornaliera", unit: "°C" },
    ],
    pageUrl: "https://power.larc.nasa.gov/",
    apiUrl:
      "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M&community=RE&longitude=12.4964&latitude=41.9028&start=20210101&end=20211231&format=JSON",
    docsUrl: "https://power.larc.nasa.gov/docs/services/api/temporal/daily/",
  },
  ecb: {
    name: "BCE",
    indicators: [
      {
        id: "USD_EUR",
        label: "Cambio di riferimento USD per EUR",
        unit: "USD/EUR",
      },
    ],
    pageUrl: "https://data.ecb.europa.eu/",
    apiUrl:
      "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?format=csvdata",
    docsUrl: "https://data.ecb.europa.eu/help/api/data-examples",
  },
  eurostat: {
    name: "Eurostat",
    indicators: [
      { id: "POP", label: "Popolazione residente in Italia", unit: "persone" },
    ],
    pageUrl: "https://ec.europa.eu/eurostat/databrowser/",
    apiUrl:
      "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjan?geo=IT&sex=T&age=TOTAL&unit=NR",
    docsUrl:
      "https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started",
  },
};

const additionalSources = [
  {
    name: "Fondo Monetario Internazionale",
    description:
      "WEO, bilancia dei pagamenti, conti nazionali e altri dataset macroeconomici. Seleziona dataset e schema prima di collegare un connettore.",
    links: [
      { label: "Portale dati IMF", url: "https://data.imf.org/" },
      {
        label: "Database e accesso ai dati",
        url: "https://www.imf.org/en/Data",
      },
    ],
  },
  {
    name: "FAO · FAOSTAT",
    description:
      "Statistiche globali su agricoltura, alimentazione, produzione, prezzi e risorse, per oltre 245 Paesi e territori.",
    links: [
      {
        label: "Catalogo FAOSTAT",
        url: "https://www.fao.org/faostat/en/#data",
      },
    ],
  },
  {
    name: "OCSE · OECD Data Explorer",
    description:
      "Statistiche internazionali comparabili su economia, società, istruzione, energia e ambiente.",
    links: [
      { label: "Data Explorer", url: "https://data-explorer.oecd.org/" },
      { label: "Portale SDMX", url: "https://sdmx.oecd.org/" },
    ],
  },
  {
    name: "NOAA · clima e oceani",
    description:
      "Dati meteorologici e climatici, incluse serie globali. L'API Climate Data Online richiede un token gratuito.",
    links: [
      {
        label: "Documentazione API",
        url: "https://www.ncei.noaa.gov/cdo-web/webservices/v2",
      },
      {
        label: "Richiedi un token",
        url: "https://www.ncei.noaa.gov/cdo-web/token",
      },
    ],
  },
  {
    name: "Copernicus Climate Data Store",
    description:
      "Rianalisi, osservazioni e proiezioni climatiche europee. Alcuni download richiedono account, credenziali API e accettazione delle condizioni del dataset.",
    links: [
      {
        label: "Climate Data Store",
        url: "https://cds.climate.copernicus.eu/",
      },
      {
        label: "Guida API",
        url: "https://cds.climate.copernicus.eu/how-to-api",
      },
    ],
  },
  {
    name: "Copernicus Data Space · osservazione della Terra",
    description:
      "Catalogo di immagini satellitari Copernicus, compresi i dati Sentinel accessibili tramite catalogo STAC.",
    links: [
      {
        label: "Browser Sentinel",
        url: "https://browser.dataspace.copernicus.eu/",
      },
      {
        label: "Documentazione API STAC",
        url: "https://documentation.dataspace.copernicus.eu/APIs/STAC.html",
      },
    ],
  },
  {
    name: "USGS EarthExplorer · Landsat",
    description:
      "Catalogo USGS per cercare e scaricare scene Landsat e altri prodotti di osservazione della Terra.",
    links: [
      {
        label: "Portale EarthExplorer",
        url: "https://earthexplorer.usgs.gov/",
      },
      {
        label: "Documentazione API M2M",
        url: "https://m2m.cr.usgs.gov/api/docs/json/",
      },
    ],
  },
  {
    name: "NASA Earthdata",
    description:
      "Catalogo NASA di prodotti di osservazione della Terra, dati ambientali e collezioni satellitari.",
    links: [
      { label: "Earthdata Search", url: "https://search.earthdata.nasa.gov/" },
      {
        label: "Documentazione API CMR",
        url: "https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html",
      },
    ],
  },
  {
    name: "Copernicus Land Monitoring Service",
    description:
      "Dati e prodotti europei sul territorio, la copertura del suolo e i cambiamenti ambientali.",
    links: [
      {
        label: "Catalogo prodotti",
        url: "https://land.copernicus.eu/en/products",
      },
    ],
  },
  {
    name: "NATO · spesa per la difesa",
    description:
      "Statistiche annuali aggregate secondo la definizione NATO, limitate ai Paesi alleati; non sono dati operativi o tattici.",
    links: [
      {
        label: "Metodologia e statistiche NATO",
        url: "https://www.nato.int/en/what-we-do/introduction-to-nato/defence-expenditures-and-natos-5-commitment",
      },
    ],
  },
  {
    name: "ONU · Registro delle armi convenzionali",
    description:
      "Registro basato sulle comunicazioni nazionali sui trasferimenti di armi convenzionali: dati aggregati e dichiarativi, non in tempo reale.",
    links: [
      { label: "UNROCA", url: "https://www.unroca.org/" },
      {
        label: "Informazioni UNODA",
        url: "https://disarmament.unoda.org/convarms/register/",
      },
    ],
  },
  {
    name: "Portale dati dell'Unione europea",
    description:
      "Indice europeo per scoprire dataset pubblicati da istituzioni e amministrazioni dell'UE.",
    links: [{ label: "data.europa.eu", url: "https://data.europa.eu/" }],
  },
  {
    name: "dati.gov.it",
    description:
      "Catalogo nazionale dei dati aperti pubblicati dalle amministrazioni italiane.",
    links: [
      {
        label: "Portale dati aperti italiano",
        url: "https://www.dati.gov.it/",
      },
    ],
  },
  {
    name: "Data.gov · Stati Uniti",
    description:
      "Catalogo federale statunitense di dataset pubblici, con API per il catalogo.",
    links: [
      { label: "Catalogo Data.gov", url: "https://www.data.gov/" },
      { label: "Documentazione API", url: "https://api.data.gov/docs/" },
    ],
  },
  {
    name: "UN Data",
    description:
      "Portale statistico delle Nazioni Unite con dataset internazionali per numerosi temi e Paesi.",
    links: [{ label: "Catalogo UN Data", url: "https://data.un.org/" }],
  },
];

const palette = [
  "#2563eb",
  "#ea580c",
  "#16a34a",
  "#9333ea",
  "#db2777",
  "#0891b2",
  "#ca8a04",
  "#4f46e5",
];

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  let normalized = value.trim().replace(/\s/g, "");
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized =
      normalized.lastIndexOf(",") > normalized.lastIndexOf(".")
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
  if (/^\d{8}$/.test(text))
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  if (/^\d{4}$/.test(text)) return `${text}-01-01`;
  if (/^\d{4}-\d{2}$/.test(text)) return `${text}-01`;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const local = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (local)
    return `${local[3]}-${local[2].padStart(2, "0")}-${local[1].padStart(2, "0")}`;
  const timestamp = Date.parse(text);
  return Number.isNaN(timestamp)
    ? ""
    : new Date(timestamp).toISOString().slice(0, 10);
}

function parseCsv(text: string, language: AnalyticsReportLanguage): {
  headers: string[];
  rows: Record<string, unknown>[];
} {
  const matrix: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const delimiter =
    (text.split(/\r?\n/, 1)[0].match(/;/g)?.length ?? 0) >
    (text.split(/\r?\n/, 1)[0].match(/,/g)?.length ?? 0)
      ? ";"
      : ",";
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
      if (row.some(value => value.trim())) matrix.push(row);
      row = [];
      cell = "";
    } else cell += character;
  }
  if (quoted) throw new Error(analysisErrorCopy[language].csvQuotes);
  row.push(cell);
  if (row.some(value => value.trim())) matrix.push(row);
  if (matrix.length < 2)
    throw new Error(analysisErrorCopy[language].csvRows);
  const headers = matrix[0].map(
    (value, index) => value.trim() || `Colonna ${index + 1}`
  );
  if (new Set(headers).size !== headers.length)
    throw new Error(analysisErrorCopy[language].csvUnique);
  return {
    headers,
    rows: matrix
      .slice(1)
      .map(values =>
        Object.fromEntries(
          headers.map((header, index) => [header, values[index] ?? ""])
        )
      ),
  };
}

function parseImportedText(
  text: string,
  name: string,
  language: AnalyticsReportLanguage
): ImportedData {
  if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
    const data: unknown = JSON.parse(text);
    if (
      !Array.isArray(data) ||
      !data.length ||
      data.some(row => !row || typeof row !== "object" || Array.isArray(row))
    ) {
      throw new Error(analysisErrorCopy[language].jsonRows);
    }
    if (data.length > 15_000)
      throw new Error(analysisErrorCopy[language].tooManyRows);
    return {
      name,
      headers: [...new Set(data.flatMap(item => Object.keys(item)))],
      rows: data as Record<string, unknown>[],
    };
  }
  const parsed = parseCsv(text, language);
  if (parsed.rows.length > 15_000)
    throw new Error(analysisErrorCopy[language].tooManyRows);
  return { ...parsed, name };
}

function importedSeries(
  data: ImportedData,
  dateColumn: string,
  numericColumns: string[],
  unit: string
): Series[] {
  return numericColumns.map(column => ({
    name: `${data.name}: ${column}`,
    unit: unit.trim() || "unità",
    source: data.name,
    rows: data.rows
      .flatMap(row => {
        const date = normalizeDate(row[dateColumn]);
        const value = parseNumber(row[column]);
        return date && value !== null ? [{ date, value }] : [];
      })
      .sort((left, right) => left.date.localeCompare(right.date)),
  }));
}

const localeCodes: AnalyticsReportLanguage[] = [
  "en", "it", "es", "fr", "de", "pt", "ru", "pl", "nl", "tr", "sv", "da", "no", "fi", "uk", "cs",
];
const localeNames: Record<AnalyticsReportLanguage, string> = {
  en: "en-US", it: "it-IT", es: "es-ES", fr: "fr-FR", de: "de-DE",
  pt: "pt-PT", ru: "ru-RU", pl: "pl-PL", nl: "nl-NL", tr: "tr-TR",
  sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI", uk: "uk-UA",
  cs: "cs-CZ",
};
const commonResultCopy = {
  pageTitle: [
    "Time series and official data sources", "Analisi di serie storiche e fonti dati ufficiali", "Series temporales y fuentes de datos oficiales", "Séries temporelles et sources de données officielles", "Zeitreihen und offizielle Datenquellen", "Séries temporais e fontes de dados oficiais", "Временные ряды и официальные источники данных", "Szeregi czasowe i oficjalne źródła danych", "Tijdreeksen en officiële gegevensbronnen", "Zaman serileri ve resmî veri kaynakları", "Tidsserier och officiella datakällor", "Tidsserier og officielle datakilder", "Tidsserier og offisielle datakilder", "Aikasarjat ja viralliset tietolähteet", "Часові ряди та офіційні джерела даних", "Časové řady a oficiální zdroje dat",
  ],
  pageDescription: [
    "Connect verified providers, import CSV/JSON files, compare time series, and generate exploratory projections.",
    "Collega i connettori verificati, importa CSV/JSON, confronta serie temporali e genera proiezioni esplorative.",
    "Conecta proveedores verificados, importa archivos CSV/JSON, compara series temporales y genera proyecciones exploratorias.",
    "Connectez des fournisseurs vérifiés, importez des fichiers CSV/JSON, comparez des séries temporelles et générez des projections exploratoires.",
    "Verbinden Sie geprüfte Anbieter, importieren Sie CSV-/JSON-Dateien, vergleichen Sie Zeitreihen und erstellen Sie explorative Projektionen.",
    "Conecte provedores verificados, importe arquivos CSV/JSON, compare séries temporais e gere projeções exploratórias.",
    "Подключайте проверенные источники, импортируйте файлы CSV/JSON, сравнивайте временные ряды и создавайте исследовательские проекции.",
    "Połącz zweryfikowane źródła, importuj pliki CSV/JSON, porównuj szeregi czasowe i twórz projekcje eksploracyjne.",
    "Koppel geverifieerde bronnen, importeer CSV-/JSON-bestanden, vergelijk tijdreeksen en maak verkennende projecties.",
    "Doğrulanmış sağlayıcılara bağlanın, CSV/JSON dosyalarını içe aktarın, zaman serilerini karşılaştırın ve keşif amaçlı projeksiyonlar oluşturun.",
    "Anslut verifierade källor, importera CSV-/JSON-filer, jämför tidsserier och skapa explorativa projektioner.",
    "Tilslut verificerede udbydere, importér CSV-/JSON-filer, sammenlign tidsserier, og opret eksplorative projektioner.",
    "Koble til verifiserte kilder, importer CSV-/JSON-filer, sammenlign tidsserier og lag utforskende projeksjoner.",
    "Yhdistä vahvistettuihin lähteisiin, tuo CSV-/JSON-tiedostoja, vertaa aikasarjoja ja luo tutkivia projektioita.",
    "Підключайте перевірені джерела, імпортуйте файли CSV/JSON, порівнюйте часові ряди та створюйте дослідницькі проєкції.",
    "Připojte ověřené zdroje, importujte soubory CSV/JSON, porovnávejte časové řady a vytvářejte průzkumné projekce.",
  ],
  officialSources: ["Official data sources to analyze", "Fonti dati ufficiali da analizzare", "Fuentes oficiales de datos para analizar", "Sources officielles à analyser", "Zu analysierende offizielle Datenquellen", "Fontes oficiais de dados para análise", "Официальные источники данных для анализа", "Oficjalne źródła danych do analizy", "Te analyseren officiële gegevensbronnen", "Analiz edilecek resmî veri kaynakları", "Officiella datakällor att analysera", "Officielle datakilder til analyse", "Offisielle datakilder som skal analyseres", "Analysoitavat viralliset tietolähteet", "Офіційні джерела даних для аналізу", "Oficiální zdroje dat k analýze"],
  runAnalysis: ["Load and analyze data", "Carica e analizza i dati", "Cargar y analizar datos", "Charger et analyser les données", "Daten laden und analysieren", "Carregar e analisar dados", "Загрузить и проанализировать данные", "Wczytaj i analizuj dane", "Gegevens laden en analyseren", "Verileri yükle ve analiz et", "Läs in och analysera data", "Indlæs og analysér data", "Last inn og analyser data", "Lataa ja analysoi tiedot", "Завантажити й проаналізувати дані", "Načíst a analyzovat data"],
  title: ["Analysis results", "Risultati dell’analisi", "Resultados del análisis", "Résultats de l’analyse", "Analyseergebnisse", "Resultados da análise", "Результаты анализа", "Wyniki analizy", "Analyseresultaten", "Analiz sonuçları", "Analysresultat", "Analyseresultater", "Analyseresultater", "Analyysin tulokset", "Результати аналізу", "Výsledky analýzy"],
  chartDescription: ["Series are indexed to 100 when the first value is nonzero; zero-valued series retain their original units.", "Serie indicizzate a base 100 quando il primo valore è diverso da zero; per i valori zero si mantengono le unità originali.", "Las series se indexan a 100 si el primer valor no es cero; las series con valores iniciales cero conservan sus unidades originales.", "Les séries sont indexées à 100 si la première valeur est non nulle ; les séries commençant par zéro conservent leurs unités d’origine.", "Reihen werden auf 100 normiert, wenn der erste Wert ungleich null ist; Reihen mit dem Wert null behalten ihre ursprünglichen Einheiten.", "As séries são indexadas em 100 quando o primeiro valor não é zero; séries com valor inicial zero mantêm as unidades originais.", "Ряды индексируются к 100, если первое значение не равно нулю; для рядов с нулевым значением сохраняются исходные единицы.", "Szeregi są indeksowane do 100, jeśli pierwsza wartość jest różna od zera; przy zerowej wartości początkowej zachowywane są jednostki oryginalne.", "Reeksen worden geïndexeerd op 100 als de eerste waarde niet nul is; reeksen met een nulwaarde behouden de oorspronkelijke eenheden.", "İlk değer sıfır değilse seriler 100'e endekslenir; sıfır değerli seriler özgün birimlerini korur.", "Serier indexeras till 100 om det första värdet inte är noll; serier med nollvärde behåller sina ursprungliga enheter.", "Serier indekseres til 100, når den første værdi ikke er nul; serier med værdien nul beholder deres oprindelige enheder.", "Serier indekseres til 100 når den første verdien ikke er null; serier med nullverdi beholder de opprinnelige enhetene.", "Sarjat indeksoidaan arvoon 100, jos ensimmäinen arvo ei ole nolla; nollasta alkavat sarjat säilyttävät alkuperäiset yksikkönsä.", "Ряди індексуються до 100, якщо перше значення не дорівнює нулю; для нульових значень зберігаються початкові одиниці.", "Řady se indexují na 100, pokud první hodnota není nula; řady s nulovou hodnotou zachovávají původní jednotky."],
  date: ["Date", "Data", "Fecha", "Date", "Datum", "Data", "Дата", "Data", "Datum", "Tarih", "Datum", "Dato", "Dato", "Päivämäärä", "Дата", "Datum"],
  seriesSource: ["Series / source", "Serie / fonte", "Serie / fuente", "Série / source", "Reihe / Quelle", "Série / fonte", "Ряд / источник", "Szereg / źródło", "Reeks / bron", "Seri / kaynak", "Serie / källa", "Serie / kilde", "Serie / kilde", "Sarja / lähde", "Ряд / джерело", "Řada / zdroj"],
  observations: ["Observations", "Osservazioni", "Observaciones", "Observations", "Beobachtungen", "Observações", "Наблюдения", "Obserwacje", "Waarnemingen", "Gözlem", "Observationer", "Observationer", "Observasjoner", "Havainnot", "Спостереження", "Pozorování"],
  period: ["Period", "Periodo", "Periodo", "Période", "Zeitraum", "Período", "Период", "Okres", "Periode", "Dönem", "Period", "Periode", "Periode", "Jakso", "Період", "Období"],
  trend: ["Trend", "Andamento", "Tendencia", "Tendance", "Trend", "Tendência", "Тенденция", "Trend", "Trend", "Eğilim", "Trend", "Tendens", "Trend", "Suunta", "Тенденція", "Trend"],
  historicalMae: ["Historical test MAE", "MAE del test storico", "MAE de la prueba histórica", "MAE du test historique", "MAE des historischen Tests", "MAE do teste histórico", "MAE исторической проверки", "MAE testu historycznego", "MAE van historische test", "Geçmiş testi MAE", "MAE för historiskt test", "MAE for historisk test", "MAE for historisk test", "Historiallisen testin MAE", "MAE історичної перевірки", "MAE historického testu"],
  officialSource: ["Official source", "Fonte ufficiale", "Fuente oficial", "Source officielle", "Offizielle Quelle", "Fonte oficial", "Официальный источник", "Oficjalne źródło", "Officiële bron", "Resmî kaynak", "Officiell källa", "Officiel kilde", "Offisiell kilde", "Virallinen lähde", "Офіційне джерело", "Oficiální zdroj"],
  openData: ["Open data", "Apri dati", "Abrir datos", "Ouvrir les données", "Daten öffnen", "Abrir dados", "Открыть данные", "Otwórz dane", "Gegevens openen", "Verileri aç", "Öppna data", "Åbn data", "Åpne data", "Avaa tiedot", "Відкрити дані", "Otevřít data"],
  openPortal: ["Open portal", "Apri portale", "Abrir portal", "Ouvrir le portail", "Portal öffnen", "Abrir portal", "Открыть портал", "Otwórz portal", "Portaal openen", "Portalı aç", "Öppna portal", "Åbn portal", "Åpne portal", "Avaa portaali", "Відкрити портал", "Otevřít portál"],
  association: ["Association between", "Associazione tra", "Asociación entre", "Association entre", "Zusammenhang zwischen", "Associação entre", "Связь между", "Związek między", "Samenhang tussen", "Arasındaki ilişki", "Samband mellan", "Sammenhæng mellem", "Sammenheng mellom", "Yhteys sarjojen", "Зв'язок між", "Vztah mezi"],
  sharedDates: ["shared dates", "date comuni", "fechas coincidentes", "dates communes", "gemeinsame Daten", "datas coincidentes", "общих дат", "wspólnych dat", "overlappende datums", "ortak tarih", "gemensamma datum", "fælles datoer", "felles datoer", "yhteistä päivämäärää", "спільних дат", "společných dat"],
  source: ["Source", "Fonte", "Fuente", "Source", "Quelle", "Fonte", "Источник", "Źródło", "Bron", "Kaynak", "Källa", "Kilde", "Kilde", "Lähde", "Джерело", "Zdroj"],
  indicator: ["Indicator", "Indicatore", "Indicador", "Indicateur", "Indikator", "Indicador", "Показатель", "Wskaźnik", "Indicator", "Gösterge", "Indikator", "Indikator", "Indikator", "Indikaattori", "Показник", "Ukazatel"],
  remove: ["Remove variable", "Rimuovi variabile", "Quitar variable", "Supprimer la variable", "Variable entfernen", "Remover variável", "Удалить переменную", "Usuń zmienną", "Variabele verwijderen", "Değişkeni kaldır", "Ta bort variabel", "Fjern variabel", "Fjern variabel", "Poista muuttuja", "Вилучити змінну", "Odebrat proměnnou"],
  add: ["Add variable", "Aggiungi variabile", "Añadir variable", "Ajouter une variable", "Variable hinzufügen", "Adicionar variável", "Добавить переменную", "Dodaj zmienną", "Variabele toevoegen", "Değişken ekle", "Lägg till variabel", "Tilføj variabel", "Legg til variabel", "Lisää muuttuja", "Додати змінну", "Přidat proměnnou"],
  upload: ["Load data from device or URL", "Carica dati dal dispositivo o da un URL", "Cargar datos desde el dispositivo o una URL", "Charger des données depuis l’appareil ou une URL", "Daten vom Gerät oder über eine URL laden", "Carregar dados do dispositivo ou de um URL", "Загрузить данные с устройства или по URL", "Wczytaj dane z urządzenia lub adresu URL", "Gegevens laden vanaf apparaat of URL", "Cihazdan veya URL'den veri yükle", "Läs in data från enheten eller en URL", "Indlæs data fra enhed eller URL", "Last inn data fra enheten eller en URL", "Lataa tiedot laitteelta tai URL-osoitteesta", "Завантажити дані з пристрою або URL", "Načíst data ze zařízení nebo URL"],
  file: ["CSV or JSON file", "File CSV o JSON", "Archivo CSV o JSON", "Fichier CSV ou JSON", "CSV- oder JSON-Datei", "Arquivo CSV ou JSON", "Файл CSV или JSON", "Plik CSV lub JSON", "CSV- of JSON-bestand", "CSV veya JSON dosyası", "CSV- eller JSON-fil", "CSV- eller JSON-fil", "CSV- eller JSON-fil", "CSV- tai JSON-tiedosto", "Файл CSV або JSON", "Soubor CSV nebo JSON"],
  chooseFile: ["Choose file", "Scegli file", "Elegir archivo", "Choisir un fichier", "Datei auswählen", "Escolher ficheiro", "Выбрать файл", "Wybierz plik", "Bestand kiezen", "Dosya seç", "Välj fil", "Vælg fil", "Velg fil", "Valitse tiedosto", "Вибрати файл", "Vybrat soubor"],
  noFileChosen: ["No file chosen", "Nessun file selezionato", "Ningún archivo seleccionado", "Aucun fichier sélectionné", "Keine Datei ausgewählt", "Nenhum ficheiro selecionado", "Файл не выбран", "Nie wybrano pliku", "Geen bestand geselecteerd", "Dosya seçilmedi", "Ingen fil vald", "Ingen fil valgt", "Ingen fil valgt", "Tiedostoa ei ole valittu", "Файл не вибрано", "Není vybrán žádný soubor"],
  remoteUrl: ["CSV/JSON URL", "URL di CSV/JSON", "URL de CSV/JSON", "URL CSV/JSON", "CSV-/JSON-URL", "URL de CSV/JSON", "URL CSV/JSON", "Adres URL CSV/JSON", "CSV-/JSON-URL", "CSV/JSON URL'si", "CSV-/JSON-URL", "CSV-/JSON-URL", "CSV-/JSON-URL", "CSV-/JSON-URL-osoite", "URL CSV/JSON", "URL CSV/JSON"],
  loadUrl: ["Load URL", "Carica URL", "Cargar URL", "Charger l’URL", "URL laden", "Carregar URL", "Загрузить URL", "Wczytaj URL", "URL laden", "URL'yi yükle", "Läs in URL", "Indlæs URL", "Last inn URL", "Lataa URL", "Завантажити URL", "Načíst URL"],
  dateColumn: ["Date column", "Colonna data", "Columna de fecha", "Colonne de date", "Datumsspalte", "Coluna de data", "Столбец даты", "Kolumna daty", "Datumkolom", "Tarih sütunu", "Datumskolumn", "Datokolonne", "Datokolonne", "Päivämääräsarake", "Стовпець дати", "Sloupec s datem"],
  unitColumn: ["Units for imported columns", "Unità colonne caricate", "Unidades de las columnas importadas", "Unités des colonnes importées", "Einheiten importierter Spalten", "Unidades das colunas importadas", "Единицы импортированных столбцов", "Jednostki importowanych kolumn", "Eenheden van geïmporteerde kolommen", "İçe aktarılan sütunların birimleri", "Enheter för importerade kolumner", "Enheder for importerede kolonner", "Enheter for importerte kolonner", "Tuotujen sarakkeiden yksiköt", "Одиниці імпортованих стовпців", "Jednotky importovaných sloupců"],
  numericColumns: ["Numeric columns", "Colonne numeriche", "Columnas numéricas", "Colonnes numériques", "Numerische Spalten", "Colunas numéricas", "Числовые столбцы", "Kolumny liczbowe", "Numerieke kolommen", "Sayısal sütunlar", "Numeriska kolumner", "Numeriske kolonner", "Numeriske kolonner", "Numeeriset sarakkeet", "Числові стовпці", "Číselné sloupce"],
  interval: ["Historical period and projections", "Intervallo storico e proiezioni", "Periodo histórico y proyecciones", "Période historique et projections", "Historischer Zeitraum und Projektionen", "Período histórico e projeções", "Исторический период и проекции", "Okres historyczny i projekcje", "Historische periode en projecties", "Geçmiş dönemi ve projeksiyonlar", "Historisk period och projektioner", "Historisk periode og projektioner", "Historisk periode og projeksjoner", "Historiallinen jakso ja projektiot", "Історичний період і проєкції", "Historické období a projekce"],
  from: ["From", "Dal", "Desde", "Du", "Von", "De", "С", "Od", "Van", "Başlangıç", "Från", "Fra", "Fra", "Alkaen", "Від", "Od"],
  to: ["To", "Al", "Hasta", "À", "Bis", "Até", "По", "Do", "Tot", "Bitiş", "Till", "Til", "Til", "Asti", "До", "Do"],
  minimum: ["Minimum value", "Valore minimo", "Valor mínimo", "Valeur minimale", "Mindestwert", "Valor mínimo", "Минимальное значение", "Wartość minimalna", "Minimumwaarde", "En düşük değer", "Minimivärde", "Minimumværdi", "Minimumsverdi", "Vähimmäisarvo", "Мінімальне значення", "Minimální hodnota"],
  maximum: ["Maximum value", "Valore massimo", "Valor máximo", "Valeur maximale", "Höchstwert", "Valor máximo", "Максимальное значение", "Wartość maksymalna", "Maximumwaarde", "En yüksek değer", "Maximivärde", "Maksimumværdi", "Maksimumsverdi", "Enimmäisarvo", "Максимальне значення", "Maximální hodnota"],
  forecastSteps: ["Future projection steps", "Passi proiettati nel futuro", "Pasos proyectados al futuro", "Pas de projection futurs", "Projektionsschritte in die Zukunft", "Etapas projetadas para o futuro", "Шаги проекции в будущее", "Kroki projekcji w przyszłość", "Projectiestappen naar de toekomst", "Geleceğe yönelik projeksiyon adımları", "Prognostiserade framtidssteg", "Projicerede fremtidige trin", "Projiserte fremtidige steg", "Ennustejaksot tulevaisuuteen", "Кроки проєкції в майбутнє", "Kroky projekce do budoucna"],
  backtestSteps: ["Historical points to validate", "Punti storici da validare", "Puntos históricos que validar", "Points historiques à valider", "Zu prüfende historische Punkte", "Pontos históricos a validar", "Исторические точки для проверки", "Punkty historyczne do walidacji", "Historische punten om te valideren", "Doğrulanacak geçmiş noktalar", "Historiska punkter att validera", "Historiske punkter til validering", "Historiske punkter som skal valideres", "Vahvistettavat historialliset pisteet", "Історичні точки для перевірки", "Historické body k ověření"],
  assistantQuestion: ["Question for the analysis assistant", "Domanda per l’assistente di analisi", "Pregunta para el asistente de análisis", "Question pour l’assistant d’analyse", "Frage an den Analyseassistenten", "Pergunta para o assistente de análise", "Вопрос помощнику по анализу", "Pytanie do asystenta analizy", "Vraag voor de analyseassistent", "Analiz asistanına soru", "Fråga till analysassistenten", "Spørgsmål til analyseassistenten", "Spørsmål til analyseassistenten", "Kysymys analyysiavustajalle", "Запитання до помічника з аналізу", "Otázka pro analytického asistenta"],
  target: ["Variable to assess as the target", "Variabile da valutare come obiettivo", "Variable que se evaluará como objetivo", "Variable cible à évaluer", "Als Zielvariable auszuwertende Variable", "Variável a avaliar como alvo", "Переменная для оценки в качестве целевой", "Zmienna oceniana jako cel", "Variabele om als doel te beoordelen", "Hedef olarak değerlendirilecek değişken", "Variabel att utvärdera som mål", "Variabel, der skal vurderes som mål", "Variabel som skal vurderes som mål", "Kohteena arvioitava muuttuja", "Змінна для оцінювання як цільова", "Proměnná hodnocená jako cíl"],
  explanation: ["Projections use simple linear regression. The historical test compares estimates with the latest observed points. These are exploratory tools: they do not measure causality or guarantee future results.", "La proiezione usa una regressione lineare semplice. Il test storico confronta stime con gli ultimi punti già osservati. Sono strumenti esplorativi: non misurano causalità e non garantiscono risultati futuri.", "La proyección usa una regresión lineal simple. La prueba histórica compara las estimaciones con los últimos puntos observados. Son herramientas exploratorias: no miden causalidad ni garantizan resultados futuros.", "La projection utilise une régression linéaire simple. Le test historique compare les estimations aux derniers points observés. Ces outils exploratoires ne mesurent pas la causalité et ne garantissent pas les résultats futurs.", "Die Projektion verwendet eine einfache lineare Regression. Der historische Test vergleicht Schätzungen mit den zuletzt beobachteten Punkten. Dies sind explorative Werkzeuge: Sie messen keine Kausalität und garantieren keine zukünftigen Ergebnisse.", "A projeção usa regressão linear simples. O teste histórico compara estimativas com os últimos pontos observados. São ferramentas exploratórias: não medem causalidade nem garantem resultados futuros.", "Для проекции используется простая линейная регрессия. Историческая проверка сравнивает оценки с последними наблюдавшимися точками. Это исследовательские инструменты: они не измеряют причинность и не гарантируют будущих результатов.", "Projekcja wykorzystuje prostą regresję liniową. Test historyczny porównuje szacunki z ostatnimi zaobserwowanymi punktami. To narzędzia eksploracyjne: nie mierzą przyczynowości ani nie gwarantują przyszłych wyników.", "De projectie gebruikt eenvoudige lineaire regressie. De historische test vergelijkt schattingen met de laatst waargenomen punten. Dit zijn verkennende hulpmiddelen: ze meten geen causaliteit en garanderen geen toekomstige resultaten.", "Projeksiyon basit doğrusal regresyon kullanır. Geçmiş testi tahminleri en son gözlemlenen noktalarla karşılaştırır. Bunlar keşif araçlarıdır; nedenselliği ölçmez ve gelecekteki sonuçları garanti etmez.", "Projektionen använder enkel linjär regression. Det historiska testet jämför uppskattningar med de senast observerade punkterna. Det här är explorativa verktyg: de mäter inte orsakssamband eller garanterar framtida resultat.", "Projektionen bruger simpel lineær regression. Den historiske test sammenligner estimater med de senest observerede punkter. Det er eksplorative værktøjer: de måler ikke årsagssammenhænge eller garanterer fremtidige resultater.", "Projeksjonen bruker enkel lineær regresjon. Den historiske testen sammenligner estimater med de sist observerte punktene. Dette er utforskende verktøy: de måler ikke årsakssammenhenger eller garanterer fremtidige resultater.", "Projektio käyttää yksinkertaista lineaarista regressiota. Historiallinen testi vertaa arvioita viimeisimpiin havaittuihin pisteisiin. Nämä ovat tutkivia työkaluja: ne eivät mittaa syy-seuraussuhteita tai takaa tulevia tuloksia.", "Для проєкції використовується проста лінійна регресія. Історична перевірка порівнює оцінки з останніми спостереженими точками. Це дослідницькі інструменти: вони не вимірюють причинності й не гарантують майбутніх результатів.", "Projekce používá jednoduchou lineární regresi. Historický test porovnává odhady s posledními pozorovanými body. Jde o průzkumné nástroje: neměří příčinnou souvislost ani nezaručují budoucí výsledky."],
  catalog: ["Official catalogs and APIs", "Catalogo e API ufficiali", "Catálogos y API oficiales", "Catalogues et API officiels", "Offizielle Kataloge und APIs", "Catálogos e APIs oficiais", "Официальные каталоги и API", "Oficjalne katalogi i interfejsy API", "Officiële catalogi en API's", "Resmî kataloglar ve API'ler", "Officiella kataloger och API:er", "Officielle kataloger og API'er", "Offisielle kataloger og API-er", "Viralliset luettelot ja rajapinnat", "Офіційні каталоги та API", "Oficiální katalogy a rozhraní API"],
  moreCatalogs: ["Other official catalogs and sources", "Altri cataloghi e fonti ufficiali", "Otros catálogos y fuentes oficiales", "Autres catalogues et sources officiels", "Weitere offizielle Kataloge und Quellen", "Outros catálogos e fontes oficiais", "Другие официальные каталоги и источники", "Inne oficjalne katalogi i źródła", "Andere officiële catalogi en bronnen", "Diğer resmî kataloglar ve kaynaklar", "Andra officiella kataloger och källor", "Andre officielle kataloger og kilder", "Andre offisielle kataloger og kilder", "Muut viralliset luettelot ja lähteet", "Інші офіційні каталоги та джерела", "Další oficiální katalogy a zdroje"],
  catalogDescription: ["These portals expand dataset discovery. They are not automatic connectors: choose a dataset on the source site and import a supported CSV/JSON file or URL.", "Questi portali ampliano la ricerca dei dataset. Non sono connettori automatici: scegli il dataset sul sito della fonte e importa un CSV/JSON o un URL supportato.", "Estos portales amplían la búsqueda de conjuntos de datos. No son conectores automáticos: elige un conjunto en el sitio de origen e importa un archivo CSV/JSON o una URL compatible.", "Ces portails élargissent la recherche de jeux de données. Ce ne sont pas des connecteurs automatiques : choisissez un jeu sur le site source et importez un fichier CSV/JSON ou une URL compatible.", "Diese Portale erweitern die Suche nach Datensätzen. Sie sind keine automatischen Konnektoren: Wählen Sie einen Datensatz auf der Quellwebsite und importieren Sie eine unterstützte CSV-/JSON-Datei oder URL.", "Estes portais ampliam a descoberta de conjuntos de dados. Não são conectores automáticos: escolha um conjunto no site da fonte e importe um arquivo CSV/JSON ou URL compatível.", "Эти порталы расширяют поиск наборов данных. Это не автоматические коннекторы: выберите набор на сайте источника и импортируйте поддерживаемый файл CSV/JSON или URL.", "Te portale ułatwiają wyszukiwanie zbiorów danych. Nie są automatycznymi konektorami: wybierz zbiór w witrynie źródła i zaimportuj obsługiwany plik CSV/JSON lub adres URL.", "Deze portalen breiden het zoeken naar datasets uit. Het zijn geen automatische connectors: kies een dataset op de bronwebsite en importeer een ondersteund CSV-/JSON-bestand of URL.", "Bu portallar veri kümelerini keşfetme olanağını genişletir. Otomatik bağlayıcı değildir: kaynak sitesinden bir veri kümesi seçip desteklenen CSV/JSON dosyasını veya URL'yi içe aktarın.", "Portalerna utökar sökningen efter datamängder. De är inte automatiska anslutningar: välj en datamängd på källwebbplatsen och importera en CSV-/JSON-fil eller URL som stöds.", "Portalerne udvider søgningen efter datasæt. De er ikke automatiske forbindelser: vælg et datasæt på kildens websted, og importér en understøttet CSV-/JSON-fil eller URL.", "Portalene utvider søket etter datasett. De er ikke automatiske koblinger: velg et datasett på kildens nettsted og importer en støttet CSV-/JSON-fil eller URL.", "Portaalit laajentavat tietojoukkojen hakua. Ne eivät ole automaattisia liittimiä: valitse tietojoukko lähdesivustolta ja tuo tuettu CSV-/JSON-tiedosto tai URL-osoite.", "Ці портали розширюють пошук наборів даних. Це не автоматичні конектори: виберіть набір на сайті джерела й імпортуйте підтримуваний файл CSV/JSON або URL.", "Tyto portály rozšiřují vyhledávání datových sad. Nejde o automatické konektory: vyberte datovou sadu na webu zdroje a importujte podporovaný soubor CSV/JSON nebo URL."],
  projectionLabel: ["forecast", "proiezione", "proyección", "projection", "Prognose", "projeção", "проекция", "projekcja", "projectie", "projeksiyon", "prognos", "projektion", "projeksjon", "projektio", "проєкція", "projekce"],
  reportTitle: ["Time-series analysis report", "Report analisi serie storiche", "Informe de análisis de series temporales", "Rapport d’analyse des séries temporelles", "Zeitreihenanalysebericht", "Relatório de análise de séries temporais", "Отчёт об анализе временных рядов", "Raport z analizy szeregów czasowych", "Rapport tijdreeksanalyse", "Zaman serisi analizi raporu", "Rapport om tidsserieanalys", "Rapport om tidsserieanalyse", "Rapport om tidsserieanalyse", "Aikasarja-analyysiraportti", "Звіт про аналіз часових рядів", "Zpráva o analýze časových řad"],
  seriesAnalyzed: ["Series analyzed", "Serie analizzate", "Series analizadas", "Séries analysées", "Analysierte Reihen", "Séries analisadas", "Проанализировано рядов", "Przeanalizowane szeregi", "Geanalyseerde reeksen", "Analiz edilen seriler", "Analyserade serier", "Analyserede serier", "Analyserte serier", "Analysoidut sarjat", "Проаналізовано рядів", "Analyzované řady"],
  totalObservations: ["Total observations", "Osservazioni complessive", "Observaciones totales", "Observations totales", "Beobachtungen insgesamt", "Total de observações", "Всего наблюдений", "Łączna liczba obserwacji", "Totaal aantal waarnemingen", "Toplam gözlem", "Totalt antal observationer", "Observationer i alt", "Totalt antall observasjoner", "Havaintoja yhteensä", "Загалом спостережень", "Celkem pozorování"],
  resultsBySeries: ["Results by series:", "Risultati per serie:", "Resultados por serie:", "Résultats par série :", "Ergebnisse nach Reihe:", "Resultados por série:", "Результаты по рядам:", "Wyniki według szeregu:", "Resultaten per reeks:", "Seriye göre sonuçlar:", "Resultat per serie:", "Resultater efter serie:", "Resultater per serie:", "Tulokset sarjoittain:", "Результати за рядами:", "Výsledky podle řady:"],
  change: ["Change", "Variazione", "Cambio", "Variation", "Änderung", "Variação", "Изменение", "Zmiana", "Verandering", "Değişim", "Förändring", "Ændring", "Endring", "Muutos", "Зміна", "Změna"],
  warning: ["Warning", "Avvertenza", "Advertencia", "Avertissement", "Warnung", "Aviso", "Предупреждение", "Ostrzeżenie", "Waarschuwing", "Uyarı", "Varning", "Advarsel", "Advarsel", "Varoitus", "Попередження", "Upozornění"],
  correlations: ["Correlations:", "Correlazioni:", "Correlaciones:", "Corrélations :", "Korrelationen:", "Correlações:", "Корреляции:", "Korelacje:", "Correlaties:", "Korelasyonlar:", "Korrelationer:", "Korrelationer:", "Korrelasjoner:", "Korrelaatiot:", "Кореляції:", "Korelace:"],
  noCorrelations: ["No correlations were calculated.", "Nessuna correlazione calcolata.", "No se calcularon correlaciones.", "Aucune corrélation n’a été calculée.", "Es wurden keine Korrelationen berechnet.", "Nenhuma correlação foi calculada.", "Корреляции не рассчитаны.", "Nie obliczono korelacji.", "Er zijn geen correlaties berekend.", "Korelasyon hesaplanmadı.", "Inga korrelationer beräknades.", "Der blev ikke beregnet korrelationer.", "Ingen korrelasjoner ble beregnet.", "Korrelaatioita ei laskettu.", "Кореляції не обчислювалися.", "Nebyly vypočteny žádné korelace."],
  factorModel: ["Factor model", "Modello fattoriale", "Modelo factorial", "Modèle factoriel", "Faktormodell", "Modelo fatorial", "Факторная модель", "Model czynnikowy", "Factormodel", "Faktör modeli", "Faktormodell", "Faktormodel", "Faktormodell", "Faktorimalli", "Факторна модель", "Faktorový model"],
  observationsLabel: ["Observations", "Osservazioni", "Observaciones", "Observations", "Beobachtungen", "Observações", "Наблюдения", "Obserwacje", "Waarnemingen", "Gözlem", "Observationer", "Observationer", "Observasjoner", "Havainnot", "Спостереження", "Pozorování"],
  noPoints: ["n/a", "n.d.", "n/d", "n.d.", "k. A.", "n.d.", "н/д", "b.d.", "n.v.t.", "yok", "ej tillgängligt", "ikke tilgængelig", "ikke tilgjengelig", "ei saatavilla", "н/д", "není k dispozici"],
  tokenRequest: ["Request a token", "Richiedi un token", "Solicitar un token", "Demander un jeton", "Token anfordern", "Solicitar um token", "Запросить токен", "Uzyskaj token", "Token aanvragen", "Token iste", "Begär en token", "Anmod om et token", "Be om et token", "Pyydä tunnistetta", "Запросити токен", "Požádat o token"],
  chartTitle: ["Time-series trends (base 100)", "Andamento delle serie storiche (base 100)", "Tendencias de series temporales (base 100)", "Tendances des séries temporelles (base 100)", "Zeitreihentrends (Basis 100)", "Tendências das séries temporais (base 100)", "Динамика временных рядов (база 100)", "Trendy szeregów czasowych (baza 100)", "Trends in tijdreeksen (basis 100)", "Zaman serisi eğilimleri (taban 100)", "Tidsserietrender (bas 100)", "Tidsserietendenser (basis 100)", "Tidsserietrender (basis 100)", "Aikasarjojen trendit (perusta 100)", "Тенденції часових рядів (база 100)", "Trendy časových řad (základ 100)"],
  country: ["ISO-3 country", "Paese ISO-3", "País ISO-3", "Pays ISO-3", "ISO-3-Land", "País ISO-3", "Код страны ISO-3", "Kraj ISO-3", "ISO-3-land", "ISO-3 ülke kodu", "ISO-3-land", "ISO-3-land", "ISO-3-land", "ISO-3-maa", "Код країни ISO-3", "Země ISO-3"],
  latitude: ["NASA POWER latitude", "Latitudine NASA POWER", "Latitud de NASA POWER", "Latitude NASA POWER", "NASA-POWER-Breitengrad", "Latitude NASA POWER", "Широта NASA POWER", "Szerokość geograficzna NASA POWER", "Breedtegraad NASA POWER", "NASA POWER enlemi", "NASA POWER-latitud", "NASA POWER-breddegrad", "NASA POWER-breddegrad", "NASA POWER -leveysaste", "Широта NASA POWER", "Zeměpisná šířka NASA POWER"],
  longitude: ["NASA POWER longitude", "Longitudine NASA POWER", "Longitud de NASA POWER", "Longitude NASA POWER", "NASA-POWER-Längengrad", "Longitude NASA POWER", "Долгота NASA POWER", "Długość geograficzna NASA POWER", "Lengtegraad NASA POWER", "NASA POWER boylamı", "NASA POWER-longitud", "NASA POWER-længdegrad", "NASA POWER-lengdegrad", "NASA POWER -pituusaste", "Довгота NASA POWER", "Zeměpisná délka NASA POWER"],
  loginRequired: ["Sign in to load and analyze data.", "Accedi per caricare e analizzare dati.", "Inicia sesión para cargar y analizar datos.", "Connectez-vous pour charger et analyser les données.", "Melden Sie sich an, um Daten zu laden und zu analysieren.", "Inicie sessão para carregar e analisar dados.", "Войдите, чтобы загружать и анализировать данные.", "Zaloguj się, aby wczytywać i analizować dane.", "Meld u aan om gegevens te laden en te analyseren.", "Verileri yüklemek ve analiz etmek için oturum açın.", "Logga in för att läsa in och analysera data.", "Log ind for at indlæse og analysere data.", "Logg inn for å laste inn og analysere data.", "Kirjaudu sisään ladataksesi ja analysoidaksesi tietoja.", "Увійдіть, щоб завантажувати й аналізувати дані.", "Přihlaste se, abyste mohli načítat a analyzovat data."],
  signIn: ["Sign in", "Accedi", "Iniciar sesión", "Se connecter", "Anmelden", "Iniciar sessão", "Войти", "Zaloguj się", "Aanmelden", "Oturum aç", "Logga in", "Log ind", "Logg inn", "Kirjaudu sisään", "Увійти", "Přihlásit se"],
  providersPortal: ["Data portal", "Portale dati", "Portal de datos", "Portail de données", "Datenportal", "Portal de dados", "Портал данных", "Portal danych", "Dataportaal", "Veri portalı", "Dataportal", "Dataportal", "Dataportal", "Tietoportaali", "Портал даних", "Datový portál"],
  officialApi: ["Official API", "API ufficiale", "API oficial", "API officielle", "Offizielle API", "API oficial", "Официальный API", "Oficjalne API", "Officiële API", "Resmî API", "Officiellt API", "Officiel API", "Offisiell API", "Virallinen API", "Офіційний API", "Oficiální API"],
  documentation: ["Documentation", "Documentazione", "Documentación", "Documentation", "Dokumentation", "Documentação", "Документация", "Dokumentacja", "Documentatie", "Belgeler", "Dokumentation", "Dokumentation", "Dokumentasjon", "Ohjeet", "Документація", "Dokumentace"],
  csvQuotes: ["Invalid CSV: unbalanced quotation marks.", "CSV non valido: virgolette non bilanciate.", "CSV no válido: comillas sin cerrar.", "CSV invalide : guillemets non équilibrés.", "Ungültige CSV-Datei: unausgeglichene Anführungszeichen.", "CSV inválido: aspas desequilibradas.", "Недопустимый CSV: кавычки не сбалансированы.", "Nieprawidłowy CSV: niedopasowane cudzysłowy.", "Ongeldige CSV: aanhalingstekens zijn niet in balans.", "Geçersiz CSV: eşleşmeyen tırnak işaretleri.", "Ogiltig CSV: obalanserade citationstecken.", "Ugyldig CSV: ulige antal anførselstegn.", "Ugyldig CSV: ubalanserte anførselstegn.", "Virheellinen CSV: lainausmerkit eivät täsmää.", "Некоректний CSV: лапки не збалансовані.", "Neplatné CSV: nevyvážené uvozovky."],
  csvRows: ["The CSV must contain headers and at least one data row.", "Il CSV deve contenere intestazioni e almeno una riga di dati.", "El CSV debe contener encabezados y al menos una fila de datos.", "Le CSV doit contenir des en-têtes et au moins une ligne de données.", "Die CSV-Datei muss Kopfzeilen und mindestens eine Datenzeile enthalten.", "O CSV deve conter cabeçalhos e pelo menos uma linha de dados.", "CSV должен содержать заголовки и хотя бы одну строку данных.", "Plik CSV musi zawierać nagłówki i co najmniej jeden wiersz danych.", "Het CSV-bestand moet kopteksten en minimaal één gegevensrij bevatten.", "CSV dosyası başlıklar ve en az bir veri satırı içermelidir.", "CSV-filen måste innehålla rubriker och minst en datarad.", "CSV-filen skal indeholde overskrifter og mindst én datarække.", "CSV-filen må inneholde overskrifter og minst én datarad.", "CSV-tiedostossa on oltava otsikot ja vähintään yksi tietorivi.", "CSV має містити заголовки та щонайменше один рядок даних.", "CSV musí obsahovat záhlaví a alespoň jeden řádek dat."],
  csvUnique: ["CSV headers must be unique.", "Le intestazioni CSV devono essere univoche.", "Los encabezados CSV deben ser únicos.", "Les en-têtes CSV doivent être uniques.", "CSV-Kopfzeilen müssen eindeutig sein.", "Os cabeçalhos CSV devem ser exclusivos.", "Заголовки CSV должны быть уникальными.", "Nagłówki CSV muszą być unikatowe.", "CSV-kopteksten moeten uniek zijn.", "CSV başlıkları benzersiz olmalıdır.", "CSV-rubriker måste vara unika.", "CSV-overskrifter skal være unikke.", "CSV-overskrifter må være unike.", "CSV-otsikoiden on oltava yksilöllisiä.", "Заголовки CSV мають бути унікальними.", "Záhlaví CSV musí být jedinečná."],
  jsonRows: ["JSON must be a non-empty array of objects, one per observation.", "Il JSON deve essere un array non vuoto di oggetti, uno per osservazione.", "El JSON debe ser una matriz no vacía de objetos, uno por observación.", "Le JSON doit être un tableau non vide d’objets, un par observation.", "JSON muss ein nicht leeres Array mit einem Objekt pro Beobachtung sein.", "O JSON deve ser um array não vazio de objetos, um por observação.", "JSON должен быть непустым массивом объектов (по одному на наблюдение).", "JSON musi być niepustą tablicą obiektów (po jednym na obserwację).", "JSON moet een niet-lege array met objecten bevatten, één per waarneming.", "JSON, her gözlem için bir nesne içeren boş olmayan bir dizi olmalıdır.", "JSON måste vara en icke-tom lista med objekt, ett per observation.", "JSON skal være et ikke-tomt array af objekter, ét pr. observation.", "JSON må være en ikke-tom liste med objekter, ett per observasjon.", "JSON-tiedoston on oltava ei-tyhjä luettelo objekteja, yksi kutakin havaintoa kohti.", "JSON має бути непорожнім масивом об’єктів (по одному на спостереження).", "JSON musí být neprázdné pole objektů, jeden objekt na pozorování."],
  tooManyRows: ["The file exceeds the 15,000-row limit.", "Il file supera il limite di 15.000 righe.", "El archivo supera el límite de 15.000 filas.", "Le fichier dépasse la limite de 15 000 lignes.", "Die Datei überschreitet das Limit von 15.000 Zeilen.", "O arquivo excede o limite de 15.000 linhas.", "Файл превышает лимит в 15 000 строк.", "Plik przekracza limit 15 000 wierszy.", "Het bestand overschrijdt de limiet van 15.000 rijen.", "Dosya 15.000 satır sınırını aşıyor.", "Filen överskrider gränsen på 15 000 rader.", "Filen overskrider grænsen på 15.000 rækker.", "Filen overskrider grensen på 15 000 rader.", "Tiedosto ylittää 15 000 rivin rajan.", "Файл перевищує ліміт у 15 000 рядків.", "Soubor překračuje limit 15 000 řádků."],
  chartAria: ["Chart of analyzed time series", "Grafico delle serie temporali analizzate", "Gráfico de las series temporales analizadas", "Graphique des séries temporelles analysées", "Diagramm der analysierten Zeitreihen", "Gráfico das séries temporais analisadas", "График анализируемых временных рядов", "Wykres analizowanych szeregów czasowych", "Grafiek van geanalyseerde tijdreeksen", "Analiz edilen zaman serileri grafiği", "Diagram över analyserade tidsserier", "Diagram over analyserede tidsserier", "Diagram over analyserte tidsserier", "Analysoitujen aikasarjojen kaavio", "Графік аналізованих часових рядів", "Graf analyzovaných časových řad"],
  questionPlaceholder: ["e.g. Which series is growing fastest, and with what uncertainty?", "Es. Quale serie cresce più rapidamente e con quale incertezza?", "P. ej., ¿qué serie crece más rápido y con qué incertidumbre?", "Ex. : quelle série croît le plus vite et avec quelle incertitude ?", "Z. B. Welche Reihe wächst am schnellsten und mit welcher Unsicherheit?", "Ex.: qual série está crescendo mais rapidamente e com que incerteza?", "Например, какой ряд растёт быстрее всего и с какой неопределённостью?", "Np. który szereg rośnie najszybciej i z jaką niepewnością?", "Bijv. welke reeks groeit het snelst en met welke onzekerheid?", "Örn. hangi seri en hızlı büyüyor ve belirsizlik düzeyi nedir?", "T.ex. vilken serie växer snabbast och med vilken osäkerhet?", "F.eks. hvilken serie vokser hurtigst, og med hvilken usikkerhed?", "F.eks. hvilken serie vokser raskest, og med hvilken usikkerhet?", "Esim. mikä sarja kasvaa nopeimmin ja millä epävarmuudella?", "Напр., який ряд зростає найшвидше і з якою невизначеністю?", "Např. která řada roste nejrychleji a s jakou nejistotou?"],
};

const analysisResultCopy = Object.fromEntries(
  localeCodes.map((code, index) => {
    const text = Object.fromEntries(
      Object.entries(commonResultCopy).map(([key, values]) => [key, values[index]])
    ) as Record<string, string>;
    const format = (value: number) => value.toLocaleString(localeNames[code]);
    return [code, {
      ...text,
      loadedRecords: (count: number, name: string) => `${format(count)} ${code === "en" ? "records loaded from" : code === "it" ? "record caricati da" : code === "es" ? "registros cargados de" : code === "fr" ? "enregistrements chargés depuis" : code === "de" ? "Datensätze geladen von" : code === "pt" ? "registos carregados de" : code === "ru" ? "записей загружено из" : code === "pl" ? "rekordów wczytanych z" : code === "nl" ? "records geladen van" : code === "tr" ? "kayıt yüklendi:" : code === "sv" ? "poster inlästa från" : code === "da" ? "poster indlæst fra" : code === "no" ? "poster lastet fra" : code === "fi" ? "tietuetta ladattu lähteestä" : code === "uk" ? "записів завантажено з" : "záznamů načteno z"} ${name}.`,
      loadingSeries: code === "it" ? "Caricamento delle serie dalle fonti ufficiali…" : code === "es" ? "Cargando series de fuentes oficiales…" : code === "fr" ? "Chargement des séries depuis les sources officielles…" : code === "de" ? "Zeitreihen aus offiziellen Quellen werden geladen…" : code === "pt" ? "Carregando séries de fontes oficiais…" : code === "ru" ? "Загрузка рядов из официальных источников…" : code === "pl" ? "Wczytywanie szeregów z oficjalnych źródeł…" : code === "nl" ? "Reeksen laden uit officiële bronnen…" : code === "tr" ? "Resmî kaynaklardan seriler yükleniyor…" : code === "sv" ? "Läser in serier från officiella källor…" : code === "da" ? "Indlæser serier fra officielle kilder…" : code === "no" ? "Laster inn serier fra offisielle kilder…" : code === "fi" ? "Ladataan sarjoja virallisista lähteistä…" : code === "uk" ? "Завантаження рядів з офіційних джерел…" : code === "cs" ? "Načítání řad z oficiálních zdrojů…" : "Loading series from official sources…",
      complete: (series: number, observations: number) => {
        const prefix: Record<AnalyticsReportLanguage, string> = {
          en: "Analysis complete", it: "Analisi completata", es: "Análisis completado", fr: "Analyse terminée", de: "Analyse abgeschlossen", pt: "Análise concluída", ru: "Анализ завершён", pl: "Analiza zakończona", nl: "Analyse voltooid", tr: "Analiz tamamlandı", sv: "Analysen är klar", da: "Analysen er fuldført", no: "Analysen er fullført", fi: "Analyysi valmis", uk: "Аналіз завершено", cs: "Analýza dokončena",
        };
        const noun: Record<AnalyticsReportLanguage, string> = {
          en: "series", it: "serie", es: "series", fr: "séries", de: "Reihen", pt: "séries", ru: "рядов", pl: "szeregi", nl: "reeksen", tr: "seri", sv: "serier", da: "serier", no: "serier", fi: "sarjaa", uk: "рядів", cs: "řad",
        };
        const obs: Record<AnalyticsReportLanguage, string> = {
          en: "observations", it: "osservazioni", es: "observaciones", fr: "observations", de: "Beobachtungen", pt: "observações", ru: "наблюдений", pl: "obserwacji", nl: "waarnemingen", tr: "gözlem", sv: "observationer", da: "observationer", no: "observasjoner", fi: "havaintoa", uk: "спостережень", cs: "pozorování",
        };
        return `${prefix[code]}: ${format(series)} ${noun[code]}, ${format(observations)} ${obs[code]}.`;
      },
    }];
  })
) as unknown as Record<AnalyticsReportLanguage, Record<string, any>>;

const analysisErrorCopy = Object.fromEntries(
  localeCodes.map((code, index) => {
    const values: Record<string, string[]> = {
      invalidColumns: ["No numeric columns were found in the file.", "Non sono state trovate colonne numeriche nel file.", "No se encontraron columnas numéricas en el archivo.", "Aucune colonne numérique n’a été trouvée dans le fichier.", "Die Datei enthält keine numerischen Spalten.", "Não foram encontradas colunas numéricas no arquivo.", "В файле не найдены числовые столбцы.", "W pliku nie znaleziono kolumn liczbowych.", "Geen numerieke kolommen gevonden in het bestand.", "Dosyada sayısal sütun bulunamadı.", "Inga numeriska kolumner hittades i filen.", "Der blev ikke fundet numeriske kolonner i filen.", "Fant ingen numeriske kolonner i filen.", "Tiedostosta ei löytynyt numeerisia sarakkeita.", "У файлі не знайдено числових стовпців.", "V souboru nebyly nalezeny žádné číselné sloupce."],
      badUrl: ["Only HTTP or HTTPS URLs are accepted.", "Sono accettati solo URL HTTP o HTTPS.", "Solo se aceptan URL HTTP o HTTPS.", "Seules les URL HTTP ou HTTPS sont acceptées.", "Nur HTTP- oder HTTPS-URLs sind zulässig.", "Só são aceites URLs HTTP ou HTTPS.", "Допускаются только URL HTTP или HTTPS.", "Akceptowane są tylko adresy URL HTTP lub HTTPS.", "Alleen HTTP- of HTTPS-URL's zijn toegestaan.", "Yalnızca HTTP veya HTTPS URL'leri kabul edilir.", "Endast HTTP- eller HTTPS-URL:er godtas.", "Kun HTTP- eller HTTPS-URL'er accepteres.", "Bare HTTP- eller HTTPS-URL-er godtas.", "Vain HTTP- tai HTTPS-URL-osoitteet hyväksytään.", "Дозволено лише URL-адреси HTTP або HTTPS.", "Přijímají se pouze adresy URL HTTP nebo HTTPS."],
      badDateRange: ["Check the date range: the start date must be before the end date.", "Controlla l'intervallo: la data iniziale deve precedere quella finale.", "Comprueba el intervalo: la fecha inicial debe ser anterior a la fecha final.", "Vérifiez la période : la date de début doit précéder la date de fin.", "Prüfen Sie den Zeitraum: Das Startdatum muss vor dem Enddatum liegen.", "Verifique o intervalo: a data inicial deve ser anterior à data final.", "Проверьте диапазон: начальная дата должна быть раньше конечной.", "Sprawdź zakres: data początkowa musi poprzedzać datę końcową.", "Controleer het bereik: de begindatum moet vóór de einddatum liggen.", "Tarih aralığını kontrol edin: başlangıç tarihi bitiş tarihinden önce olmalıdır.", "Kontrollera datumintervallet: startdatumet måste infalla före slutdatumet.", "Kontrollér datointervallet: startdatoen skal ligge før slutdatoen.", "Kontroller datointervallet: startdatoen må være før sluttdatoen.", "Tarkista aikaväli: alkupäivän on oltava ennen loppupäivää.", "Перевірте діапазон: початкова дата має передувати кінцевій.", "Zkontrolujte rozsah: počáteční datum musí předcházet koncovému."],
      badMinMax: ["The minimum value cannot exceed the maximum value.", "Il valore minimo non può superare il valore massimo.", "El valor mínimo no puede superar el valor máximo.", "La valeur minimale ne peut pas dépasser la valeur maximale.", "Der Mindestwert darf den Höchstwert nicht überschreiten.", "O valor mínimo não pode exceder o valor máximo.", "Минимальное значение не может превышать максимальное.", "Wartość minimalna nie może przekraczać maksymalnej.", "De minimumwaarde mag niet hoger zijn dan de maximumwaarde.", "En düşük değer en yüksek değeri aşamaz.", "Minimivärdet får inte överstiga maximivärdet.", "Minimumværdien må ikke overstige maksimumværdien.", "Minimumsverdien kan ikke overstige maksimumsverdien.", "Vähimmäisarvo ei voi ylittää enimmäisarvoa.", "Мінімальне значення не може перевищувати максимальне.", "Minimální hodnota nesmí překročit maximální."],
      badCoordinates: ["Invalid NASA POWER coordinates.", "Coordinate NASA POWER non valide.", "Coordenadas de NASA POWER no válidas.", "Coordonnées NASA POWER non valides.", "Ungültige NASA-POWER-Koordinaten.", "Coordenadas NASA POWER inválidas.", "Недопустимые координаты NASA POWER.", "Nieprawidłowe współrzędne NASA POWER.", "Ongeldige NASA POWER-coördinaten.", "NASA POWER koordinatları geçersiz.", "Ogiltiga NASA POWER-koordinater.", "Ugyldige NASA POWER-koordinater.", "Ugyldige NASA POWER-koordinater.", "Virheelliset NASA POWER -koordinaatit.", "Некоректні координати NASA POWER.", "Neplatné souřadnice NASA POWER."],
      fileTooLarge: ["The file must not exceed 7 MB.", "Il file non può superare 7 MB.", "El archivo no puede superar los 7 MB.", "Le fichier ne doit pas dépasser 7 Mo.", "Die Datei darf höchstens 7 MB groß sein.", "O arquivo não pode exceder 7 MB.", "Размер файла не должен превышать 7 МБ.", "Plik nie może przekraczać 7 MB.", "Het bestand mag niet groter zijn dan 7 MB.", "Dosya 7 MB boyutunu aşamaz.", "Filen får inte vara större än 7 MB.", "Filen må ikke være større end 7 MB.", "Filen kan ikke være større enn 7 MB.", "Tiedoston koko saa olla enintään 7 Mt.", "Розмір файлу не може перевищувати 7 МБ.", "Soubor nesmí být větší než 7 MB."],
      noRows: ["No observations remain in the selected range and filters.", "Nessuna osservazione rimasta nell'intervallo e nei filtri scelti.", "No quedan observaciones en el intervalo y los filtros seleccionados.", "Aucune observation ne reste dans la période et les filtres sélectionnés.", "Im ausgewählten Zeitraum und mit den gewählten Filtern bleiben keine Beobachtungen übrig.", "Não restam observações no intervalo e nos filtros selecionados.", "В выбранном диапазоне и фильтрах не осталось наблюдений.", "Brak obserwacji w wybranym zakresie i filtrach.", "Er zijn geen waarnemingen over in het gekozen bereik en de filters.", "Seçilen aralık ve filtrelerde gözlem kalmadı.", "Inga observationer återstår i det valda intervallet och filtren.", "Der er ingen observationer tilbage i det valgte interval og filtrene.", "Ingen observasjoner gjenstår i valgt intervall og filtre.", "Valitulla aikavälillä ja suodattimilla ei ole havaintoja.", "У вибраному діапазоні та фільтрах не залишилося спостережень.", "Ve vybraném rozsahu a filtrech nezůstala žádná pozorování."],
      tooManySeries: ["Select no more than 10 series to analyze together.", "Seleziona al massimo 10 serie da analizzare insieme.", "Selecciona como máximo 10 series para analizarlas juntas.", "Sélectionnez au maximum 10 séries à analyser ensemble.", "Wählen Sie höchstens 10 Reihen zur gemeinsamen Analyse aus.", "Selecione no máximo 10 séries para analisar em conjunto.", "Выберите не более 10 рядов для совместного анализа.", "Wybierz maksymalnie 10 szeregów do wspólnej analizy.", "Selecteer maximaal 10 reeksen om samen te analyseren.", "Birlikte analiz etmek için en fazla 10 seri seçin.", "Välj högst 10 serier att analysera tillsammans.", "Vælg højst 10 serier til samlet analyse.", "Velg maksimalt 10 serier for felles analyse.", "Valitse yhteisanalyysiin enintään 10 sarjaa.", "Виберіть не більше 10 рядів для спільного аналізу.", "Vyberte maximálně 10 řad ke společné analýze."],
      invalidIndicator: ["Invalid indicator for {provider}.", "Indicatore non valido per {provider}.", "Indicador no válido para {provider}.", "Indicateur invalide pour {provider}.", "Ungültiger Indikator für {provider}.", "Indicador inválido para {provider}.", "Недопустимый показатель для источника {provider}.", "Nieprawidłowy wskaźnik dla źródła {provider}.", "Ongeldige indicator voor {provider}.", "{provider} için geçersiz gösterge.", "Ogiltig indikator för {provider}.", "Ugyldig indikator for {provider}.", "Ugyldig indikator for {provider}.", "Virheellinen tunnus {provider}-lähteelle.", "Недопустимий показник для джерела {provider}.", "Neplatný ukazatel pro zdroj {provider}."],
    };
    return [code, Object.fromEntries(Object.entries(values).map(([key, translations]) => [key, translations[index]]))];
  })
) as unknown as Record<AnalyticsReportLanguage, Record<string, string>>;

const additionalCatalogDescriptions: Record<
  AnalyticsReportLanguage,
  string[]
> = {
  en: [
    "Macroeconomic datasets; choose a dataset and schema before connecting a source.",
    "Global statistics on agriculture, food, production, prices, and resources across 245+ countries and territories.",
    "Comparable international statistics on the economy, society, education, energy, and the environment.",
    "Weather and climate data, including global series. A free API token is required.",
    "European climate reanalysis, observations, and projections. Some datasets require an account, API credentials, and acceptance of terms.",
    "Copernicus satellite imagery catalog, including Sentinel data available through STAC.",
  ],
  it: [
    "Dataset macroeconomici: seleziona dataset e schema prima di collegare una fonte.",
    "Statistiche globali su agricoltura, alimentazione, produzione, prezzi e risorse per oltre 245 Paesi e territori.",
    "Statistiche internazionali comparabili su economia, società, istruzione, energia e ambiente.",
    "Dati meteorologici e climatici, incluse serie globali. È richiesto un token API gratuito.",
    "Rianalisi, osservazioni e proiezioni climatiche europee. Alcuni dataset richiedono account, credenziali API e accettazione delle condizioni.",
    "Catalogo di immagini satellitari Copernicus, inclusi i dati Sentinel accessibili tramite STAC.",
  ],
  es: [
    "Conjuntos de datos macroeconómicos; selecciona el conjunto y el esquema antes de conectar una fuente.",
    "Estadísticas mundiales sobre agricultura, alimentación, producción, precios y recursos de más de 245 países y territorios.",
    "Estadísticas internacionales comparables sobre economía, sociedad, educación, energía y medio ambiente.",
    "Datos meteorológicos y climáticos, incluidas series mundiales. Se requiere un token API gratuito.",
    "Reanálisis, observaciones y proyecciones climáticas europeas. Algunos conjuntos requieren cuenta, credenciales API y aceptación de las condiciones.",
    "Catálogo de imágenes satelitales de Copernicus, incluidos datos Sentinel accesibles mediante STAC.",
  ],
  fr: [
    "Jeux de données macroéconomiques ; choisissez un jeu et un schéma avant de connecter une source.",
    "Statistiques mondiales sur l’agriculture, l’alimentation, la production, les prix et les ressources dans plus de 245 pays et territoires.",
    "Statistiques internationales comparables sur l’économie, la société, l’éducation, l’énergie et l’environnement.",
    "Données météorologiques et climatiques, y compris des séries mondiales. Un jeton API gratuit est requis.",
    "Réanalyses, observations et projections climatiques européennes. Certains jeux nécessitent un compte, des identifiants API et l’acceptation des conditions.",
    "Catalogue d’images satellites Copernicus, y compris les données Sentinel accessibles via STAC.",
  ],
  de: [
    "Makroökonomische Datensätze; wählen Sie vor dem Verbinden eine Datenreihe und ein Schema aus.",
    "Globale Statistiken zu Landwirtschaft, Ernährung, Produktion, Preisen und Ressourcen aus über 245 Ländern und Gebieten.",
    "Vergleichbare internationale Statistiken zu Wirtschaft, Gesellschaft, Bildung, Energie und Umwelt.",
    "Wetter- und Klimadaten einschließlich globaler Zeitreihen. Ein kostenloses API-Token ist erforderlich.",
    "Europäische Klimareanalysen, Beobachtungen und Projektionen. Für einige Datensätze sind Konto, API-Zugangsdaten und Zustimmung zu Bedingungen erforderlich.",
    "Copernicus-Satellitenbildkatalog einschließlich über STAC zugänglicher Sentinel-Daten.",
  ],
  pt: [
    "Conjuntos de dados macroeconómicos; escolha o conjunto e o esquema antes de ligar uma fonte.",
    "Estatísticas globais sobre agricultura, alimentação, produção, preços e recursos em mais de 245 países e territórios.",
    "Estatísticas internacionais comparáveis sobre economia, sociedade, educação, energia e ambiente.",
    "Dados meteorológicos e climáticos, incluindo séries globais. É necessário um token API gratuito.",
    "Reanálises, observações e projeções climáticas europeias. Alguns conjuntos exigem conta, credenciais API e aceitação dos termos.",
    "Catálogo de imagens de satélite Copernicus, incluindo dados Sentinel acessíveis por STAC.",
  ],
  ru: [
    "Макроэкономические наборы данных; перед подключением выберите набор и схему.",
    "Глобальная статистика сельского хозяйства, продовольствия, производства, цен и ресурсов более чем в 245 странах и территориях.",
    "Сопоставимая международная статистика экономики, общества, образования, энергетики и окружающей среды.",
    "Метеорологические и климатические данные, включая глобальные ряды. Требуется бесплатный токен API.",
    "Европейские реанализы, наблюдения и климатические проекции. Для некоторых наборов нужны учётная запись, учётные данные API и принятие условий.",
    "Каталог спутниковых снимков Copernicus, включая данные Sentinel, доступные через STAC.",
  ],
  pl: [
    "Zbiory danych makroekonomicznych; przed podłączeniem źródła wybierz zbiór i schemat.",
    "Globalne statystyki rolnictwa, żywności, produkcji, cen i zasobów z ponad 245 krajów i terytoriów.",
    "Porównywalne statystyki międzynarodowe dotyczące gospodarki, społeczeństwa, edukacji, energii i środowiska.",
    "Dane pogodowe i klimatyczne, w tym globalne szeregi. Wymagany jest bezpłatny token API.",
    "Europejskie reanalizy, obserwacje i projekcje klimatyczne. Niektóre zbiory wymagają konta, danych API i akceptacji warunków.",
    "Katalog zdjęć satelitarnych Copernicus, w tym dane Sentinel dostępne przez STAC.",
  ],
  nl: [
    "Macro-economische datasets; kies een dataset en schema voordat u een bron koppelt.",
    "Wereldwijde statistieken over landbouw, voedsel, productie, prijzen en hulpbronnen in meer dan 245 landen en gebieden.",
    "Vergelijkbare internationale statistieken over economie, samenleving, onderwijs, energie en milieu.",
    "Weer- en klimaatgegevens, inclusief wereldwijde reeksen. Een gratis API-token is vereist.",
    "Europese klimaatreanalyses, waarnemingen en projecties. Voor sommige datasets zijn een account, API-inloggegevens en akkoord met voorwaarden nodig.",
    "Catalogus met Copernicus-satellietbeelden, inclusief Sentinel-gegevens via STAC.",
  ],
  tr: [
    "Makroekonomik veri kümeleri; kaynağı bağlamadan önce veri kümesini ve şemayı seçin.",
    "245'ten fazla ülke ve bölgede tarım, gıda, üretim, fiyatlar ve kaynaklara ilişkin küresel istatistikler.",
    "Ekonomi, toplum, eğitim, enerji ve çevre hakkında karşılaştırılabilir uluslararası istatistikler.",
    "Küresel seriler dâhil hava ve iklim verileri. Ücretsiz API belirteci gerekir.",
    "Avrupa iklim yeniden analizleri, gözlemleri ve projeksiyonları. Bazı veri kümeleri hesap, API kimlik bilgileri ve koşulların kabulünü gerektirir.",
    "STAC üzerinden erişilebilen Sentinel verileri dâhil Copernicus uydu görüntüsü kataloğu.",
  ],
  sv: [
    "Makroekonomiska datamängder; välj datamängd och schema innan du ansluter en källa.",
    "Global statistik om jordbruk, livsmedel, produktion, priser och resurser i över 245 länder och territorier.",
    "Jämförbar internationell statistik om ekonomi, samhälle, utbildning, energi och miljö.",
    "Väder- och klimatdata, inklusive globala serier. En kostnadsfri API-token krävs.",
    "Europeiska klimatreanalyser, observationer och projektioner. Vissa datamängder kräver konto, API-uppgifter och godkännande av villkor.",
    "Katalog med Copernicus-satellitbilder, inklusive Sentinel-data som nås via STAC.",
  ],
  da: [
    "Makroøkonomiske datasæt; vælg datasæt og skema, før du tilslutter en kilde.",
    "Global statistik om landbrug, fødevarer, produktion, priser og ressourcer fra over 245 lande og territorier.",
    "Sammenlignelig international statistik om økonomi, samfund, uddannelse, energi og miljø.",
    "Vejr- og klimadata, herunder globale serier. Et gratis API-token er påkrævet.",
    "Europæiske klimareanalyser, observationer og projektioner. Nogle datasæt kræver konto, API-legitimationsoplysninger og accept af vilkår.",
    "Copernicus-katalog med satellitbilleder, herunder Sentinel-data via STAC.",
  ],
  no: [
    "Makroøkonomiske datasett; velg datasett og skjema før du kobler til en kilde.",
    "Global statistikk om landbruk, mat, produksjon, priser og ressurser i over 245 land og territorier.",
    "Sammenlignbar internasjonal statistikk om økonomi, samfunn, utdanning, energi og miljø.",
    "Vær- og klimadata, inkludert globale serier. Et gratis API-token kreves.",
    "Europeiske klimareanalyser, observasjoner og projeksjoner. Enkelte datasett krever konto, API-legitimasjon og godkjenning av vilkår.",
    "Copernicus-katalog over satellittbilder, inkludert Sentinel-data via STAC.",
  ],
  fi: [
    "Makrotalouden tietojoukot; valitse tietojoukko ja skeema ennen lähteen yhdistämistä.",
    "Maailmanlaajuisia tilastoja maataloudesta, ruoasta, tuotannosta, hinnoista ja resursseista yli 245 maasta ja alueelta.",
    "Vertailukelpoisia kansainvälisiä tilastoja taloudesta, yhteiskunnasta, koulutuksesta, energiasta ja ympäristöstä.",
    "Sää- ja ilmastotietoja, mukaan lukien maailmanlaajuiset sarjat. Ilmainen API-tunniste vaaditaan.",
    "Euroopan ilmaston uudelleenanalyysit, havainnot ja projektiot. Osa tietojoukoista edellyttää tiliä, API-tunnuksia ja ehtojen hyväksymistä.",
    "Copernicus-satelliittikuvien luettelo, mukaan lukien STACin kautta saatavat Sentinel-tiedot.",
  ],
  uk: [
    "Макроекономічні набори даних; перед підключенням джерела виберіть набір і схему.",
    "Глобальна статистика сільського господарства, харчування, виробництва, цін і ресурсів у понад 245 країнах і територіях.",
    "Порівнювана міжнародна статистика економіки, суспільства, освіти, енергетики та довкілля.",
    "Метеорологічні та кліматичні дані, зокрема глобальні ряди. Потрібен безкоштовний токен API.",
    "Європейські реаналізи, спостереження та кліматичні проєкції. Для деяких наборів потрібні обліковий запис, облікові дані API та прийняття умов.",
    "Каталог супутникових знімків Copernicus, зокрема дані Sentinel через STAC.",
  ],
  cs: [
    "Makroekonomické datové sady; před připojením zdroje vyberte datovou sadu a schéma.",
    "Globální statistiky zemědělství, potravin, produkce, cen a zdrojů z více než 245 zemí a území.",
    "Srovnatelné mezinárodní statistiky ekonomiky, společnosti, vzdělávání, energetiky a životního prostředí.",
    "Meteorologická a klimatická data včetně globálních řad. Je vyžadován bezplatný token API.",
    "Evropské klimatické reanalýzy, pozorování a projekce. Některé datové sady vyžadují účet, přihlašovací údaje API a souhlas s podmínkami.",
    "Katalog satelitních snímků Copernicus včetně dat Sentinel dostupných přes STAC.",
  ],
};

type AnalysisStatus =
  | { kind: "loaded"; count: number; name: string }
  | { kind: "loading" }
  | { kind: "complete"; series: number; observations: number }
  | null;

export function OfficialDataAnalysis() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const reportLanguage = resolveAnalyticsReportLanguage(language);
  const resultText = analysisResultCopy[reportLanguage];
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderId>("worldbank");
  const [indicator, setIndicator] = useState(
    providers.worldbank.indicators[0].id
  );
  const [country, setCountry] = useState("ITA");
  const [latitude, setLatitude] = useState("41.9028");
  const [longitude, setLongitude] = useState("12.4964");
  const [startDate, setStartDate] = useState("2015-01-01");
  const [endDate, setEndDate] = useState(
    new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  );
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [forecastSteps, setForecastSteps] = useState("5");
  const [backtestSteps, setBacktestSteps] = useState("3");
  const [question, setQuestion] = useState("");
  const [sourceRows, setSourceRows] = useState([
    {
      id: 1,
      provider: "worldbank" as ProviderId,
      indicator: "NY.GDP.MKTP.CD",
      country: "ITA",
    },
  ]);
  const [imported, setImported] = useState<ImportedData | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [dateColumn, setDateColumn] = useState("");
  const [numericColumns, setNumericColumns] = useState<string[]>([]);
  const [externalUnit, setExternalUnit] = useState("unità");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [targetKey, setTargetKey] = useState("official:1");
  const [series, setSeries] = useState<Series[]>([]);
  const [analysis, setAnalysis] = useState<
    inferRouterOutputs<AppRouter>["dataInsight"]["analyzeData"] | null
  >(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<AnalysisStatus>(null);
  const officialMutation = trpc.dataInsight.fetchOfficialSeries.useMutation();
  const importMutation = trpc.dataInsight.importDataUrl.useMutation();
  const analyzeMutation = trpc.dataInsight.analyzeData.useMutation();
  const busy =
    officialMutation.isPending ||
    importMutation.isPending ||
    analyzeMutation.isPending;

  const currentProvider = providers[selectedProvider];
  const statusText = status
    ? status.kind === "loaded"
      ? resultText.loadedRecords(status.count, status.name)
      : status.kind === "loading"
        ? resultText.loadingSeries
        : resultText.complete(status.series, status.observations)
    : "";
  const allDates = useMemo(
    () =>
      [
        ...new Set([
          ...series.flatMap(item => item.rows.map(row => row.date)),
          ...(analysis?.reports.flatMap(report =>
            report.forecast.map(row => row.date)
          ) ?? []),
        ]),
      ].sort(),
    [analysis, series]
  );
  const chartData = useMemo(
    () =>
      allDates.map(date => {
        const point: Record<string, string | number> = { date };
        series.forEach(item => {
          const base = item.rows.find(row => row.value !== 0)?.value;
          const observed = item.rows.find(row => row.date === date)?.value;
          if (observed !== undefined)
            point[item.name] = base ? (observed / base) * 100 : observed;
          const forecast = analysis?.reports
            .find(report => report.name === item.name)
            ?.forecast.find(row => row.date === date);
          if (forecast)
            point[`${item.name} (proiezione)`] = base
              ? (forecast.value / base) * 100
              : forecast.value;
        });
        return point;
      }),
    [allDates, analysis, series]
  );
  const localizeSeriesName = (name: string) => {
    const item = series.find(candidate => candidate.name === name);
    return item?.officialProvider
      ? localizeStatisticalSeriesLabel(name, reportLanguage)
      : name;
  };
  const localizeSeriesSource = (source: string) => {
    const item = series.find(candidate => candidate.source === source);
    return item?.officialProvider
      ? localizeStatisticalSeriesLabel(source, reportLanguage)
      : source;
  };
  const localizeSeriesUnit = (unit: string, source: string) =>
    series.some(
      item => item.source === source && item.officialProvider !== undefined
    )
      ? localizeStatisticalUnit(unit, reportLanguage)
      : unit;
  const reportContent = useMemo(() => {
    if (!analysis) return "";
    const formatNullable = (value: number | null, digits = 2) =>
      value === null
        ? resultText.noPoints
        : formatReportNumber(value, reportLanguage, digits);
    const formatPercentage = (value: number | null) =>
      value === null
        ? resultText.noPoints
        : `${formatReportNumber(value, reportLanguage)}%`;
    const formatDirection = (direction: string) =>
      localizeStatisticalDirection(direction, reportLanguage);
    return [
      `${resultText.seriesAnalyzed}: ${formatReportNumber(analysis.reports.length, reportLanguage)}`,
      `${resultText.totalObservations}: ${formatReportNumber(analysis.reports.reduce((count, report) => count + report.count, 0), reportLanguage)}`,
      "",
      resultText.resultsBySeries,
      ...analysis.reports.flatMap(report => [
        `${localizeSeriesName(report.name)} — ${localizeSeriesSource(report.source)} (${localizeSeriesUnit(report.unit, report.source)})`,
        `${resultText.observationsLabel}: ${formatReportNumber(report.count, reportLanguage)}; ${resultText.period.toLowerCase()}: ${report.firstDate} – ${report.lastDate}; ${resultText.trend.toLowerCase()}: ${formatDirection(report.direction)}`,
        `${resultText.change}: ${formatPercentage(report.changePercent)}; MAE: ${formatNullable(report.mae, 3)}; MAPE: ${formatPercentage(report.mape)}`,
        ...report.warnings.map(
          warning =>
            `${resultText.warning}: ${localizeStatisticalText(warning, reportLanguage)}`
        ),
        "",
      ]),
      resultText.correlations,
      ...(analysis.correlations.length
        ? analysis.correlations.map(
            item =>
              `${localizeSeriesName(item.first)} / ${localizeSeriesName(item.second)}: r=${formatReportNumber(item.r, reportLanguage, 3)}; ${formatReportNumber(item.count, reportLanguage)} ${resultText.sharedDates}; ${localizeStatisticalCorrelationInterpretation(item.interpretation, reportLanguage)}`
          )
        : [resultText.noCorrelations]),
      ...(analysis.factorModel
        ? [
            "",
            `${resultText.factorModel}: ${localizeSeriesName(analysis.factorModel.target)}; ${resultText.observationsLabel.toLowerCase()}: ${formatReportNumber(analysis.factorModel.count, reportLanguage)}; R² ${analysis.factorModel.r2 === null ? resultText.noPoints : formatReportNumber(analysis.factorModel.r2, reportLanguage, 3)}.`,
            analysis.factorModel.warning
              ? localizeStatisticalText(
                  analysis.factorModel.warning,
                  reportLanguage
                )
              : "",
          ]
        : []),
    ]
      .filter(Boolean)
      .join("\n");
  }, [analysis, reportLanguage, resultText, series]);
  const reportVisuals = useMemo<AnalyticsReportVisual[]>(() => {
    if (!analysis || !series.length || !allDates.length) return [];
    const observed = series.map((item, index) => ({
      name: localizeSeriesName(item.name),
      color: palette[index % palette.length],
      values: chartData.map(point =>
        typeof point[item.name] === "number"
          ? (point[item.name] as number)
          : null
      ),
    }));
    const forecasts = series.flatMap((item, index) => {
      const forecastName = `${item.name} (proiezione)`;
      if (
        !analysis.reports.find(report => report.name === item.name)?.forecast
          .length
      )
        return [];
      return [
        {
          name: `${localizeSeriesName(item.name)} (${resultText.projectionLabel})`,
          color: palette[index % palette.length],
          dashed: true,
          values: chartData.map(point =>
            typeof point[forecastName] === "number"
              ? (point[forecastName] as number)
              : null
          ),
        },
      ];
    });
    return [
      {
        type: "chart",
        title: resultText.chartTitle,
        chartType: "line",
        categories: allDates,
        series: [...observed, ...forecasts],
      },
    ];
  }, [allDates, analysis, chartData, localizeSeriesName, reportLanguage, resultText, series]);
  const reportConclusion = useMemo<AnalyticsReportConclusion | undefined>(
    () =>
      analysis
        ? createStatisticalAssessment(
            analysis,
            reportLanguage,
            new Set(
              series
                .filter(item => item.officialProvider)
                .map(item => item.name)
            )
          )
        : undefined,
    [analysis, reportLanguage, series]
  );

  const addSource = () =>
    setSourceRows(rows => [
      ...rows,
      {
        id: Math.max(0, ...rows.map(row => row.id)) + 1,
        provider: "worldbank",
        indicator: providers.worldbank.indicators[0].id,
        country: "ITA",
      },
    ]);
  const updateSource = (
    id: number,
    patch: Partial<(typeof sourceRows)[number]>
  ) => {
    setSourceRows(rows =>
      rows.map(row => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const setImportedText = (text: string, name: string) => {
    const data = parseImportedText(text, name, reportLanguage);
    const guessedDate =
      data.headers.find(header =>
        /date|time|year|period|data|anno/i.test(header)
      ) ?? data.headers[0];
    const numeric = data.headers.filter(header =>
      data.rows.some(row => parseNumber(row[header]) !== null)
    );
    if (!numeric.length)
      throw new Error(analysisErrorCopy[reportLanguage].invalidColumns);
    setImported(data);
    setDateColumn(guessedDate);
    setNumericColumns(numeric.slice(0, 1));
    setError("");
    setStatus({ kind: "loaded", count: data.rows.length, name });
  };

  const loadUrl = async () => {
    setError("");
    try {
      const url = new URL(remoteUrl);
      if (!["http:", "https:"].includes(url.protocol))
        throw new Error(analysisErrorCopy[reportLanguage].badUrl);
      const result = await importMutation.mutateAsync({ url: url.href });
      setImportedText(result.content, result.name);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const runAnalysis = async () => {
    setError("");
    setStatus(null);
    setAnalysis(null);
    const start = startDate || "1900-01-01";
    const end = endDate;
    if (!end || start > end) {
      setError(
        analysisErrorCopy[reportLanguage].badDateRange
      );
      return;
    }
    const min = parseNumber(minValue);
    const max = parseNumber(maxValue);
    if (min !== null && max !== null && min > max) {
      setError(analysisErrorCopy[reportLanguage].badMinMax);
      return;
    }
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lon) ||
      lon < -180 ||
      lon > 180
    ) {
      setError(analysisErrorCopy[reportLanguage].badCoordinates);
      return;
    }

    try {
      setStatus({ kind: "loading" });
      const official = await Promise.all(
        sourceRows.map(async row => {
          const definition = providers[row.provider];
          const selected = definition.indicators.find(
            item => item.id === row.indicator
          );
          if (!selected)
            throw new Error(
              analysisErrorCopy[reportLanguage].invalidIndicator.replace(
                "{provider}",
                localizeStatisticalSeriesLabel(
                  definition.name,
                  reportLanguage
                )
              )
            );
          const fetched = await officialMutation.mutateAsync({
            provider: row.provider,
            indicator: row.indicator,
            ...(row.provider === "worldbank"
              ? { country: row.country.trim().toUpperCase() }
              : {}),
            start,
            end,
            latitude: lat,
            longitude: lon,
          });
          return {
            targetKey: `official:${row.id}`,
            series: {
              ...fetched,
              officialProvider: row.provider,
              rows: fetched.rows.filter(
                item =>
                  item.date >= start &&
                  item.date <= end &&
                  (min === null || item.value >= min) &&
                  (max === null || item.value <= max)
              ),
            },
          };
        })
      );
      const userSeries =
        imported && numericColumns.length
          ? importedSeries(
              imported,
              dateColumn,
              numericColumns,
              externalUnit
            ).map((item, index) => ({
              targetKey: `file:${numericColumns[index]}`,
              series: {
                ...item,
                rows: item.rows.filter(
                  row =>
                    row.date >= start &&
                    row.date <= end &&
                    (min === null || row.value >= min) &&
                    (max === null || row.value <= max)
                ),
              },
            }))
          : [];
      const selectedSeries = [...official, ...userSeries].filter(
        item => item.series.rows.length
      );
      const all = selectedSeries.map(item => item.series);
      if (!all.length)
        throw new Error(analysisErrorCopy[reportLanguage].noRows);
      if (all.length > 10)
        throw new Error(analysisErrorCopy[reportLanguage].tooManySeries);
      const selectedTargetIndex = Math.max(
        0,
        selectedSeries.findIndex(item => item.targetKey === targetKey)
      );
      const assessment = await analyzeMutation.mutateAsync({
        series: all.map(({ officialProvider: _officialProvider, ...item }) => item),
        targetIndex: selectedTargetIndex,
        forecastSteps: Math.min(20, Math.max(0, Number(forecastSteps) || 0)),
        backtestSteps: Math.min(10, Math.max(0, Number(backtestSteps) || 0)),
        question: question.trim(),
      });
      setSeries(all);
      setAnalysis(assessment);
      setStatus({
        kind: "complete",
        series: all.length,
        observations: all.reduce((count, item) => count + item.rows.length, 0),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setStatus(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{resultText.pageTitle}</CardTitle>
        <CardDescription>{resultText.pageDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-7">
        <AnalyticsUsageNotice language={reportLanguage} />
        <section className="space-y-3">
          <h3 className="font-semibold">{resultText.officialSources}</h3>
          <div className="space-y-3">
            {sourceRows.map(row => {
              const definition = providers[row.provider];
              return (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1.5fr_1fr_auto]"
                >
                  <label className="space-y-1 text-sm">
                    {resultText.source}
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3"
                      value={row.provider}
                      onChange={event => {
                        const provider = event.target.value as ProviderId;
                        updateSource(row.id, {
                          provider,
                          indicator: providers[provider].indicators[0].id,
                        });
                      }}
                    >
                      {(Object.keys(providers) as ProviderId[]).map(id => (
                        <option key={id} value={id}>
                          {localizeStatisticalSeriesLabel(
                            providers[id].name,
                            reportLanguage
                          )}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm">
                    {resultText.indicator}
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3"
                      value={row.indicator}
                      onChange={event =>
                        updateSource(row.id, { indicator: event.target.value })
                      }
                    >
                      {definition.indicators.map(item => (
                        <option key={item.id} value={item.id}>
                          {localizeStatisticalSeriesLabel(
                            item.label,
                            reportLanguage
                          )} ({localizeStatisticalUnit(item.unit, reportLanguage)})
                        </option>
                      ))}
                    </select>
                  </label>
                  {row.provider === "worldbank" ? (
                    <label className="space-y-1 text-sm">
                      {resultText.country}
                      <Input
                        value={row.country}
                        maxLength={3}
                        onChange={event =>
                          updateSource(row.id, { country: event.target.value })
                        }
                      />
                    </label>
                  ) : (
                    <div />
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={resultText.remove}
                    disabled={sourceRows.length <= 1}
                    onClick={() =>
                      setSourceRows(rows =>
                        rows.filter(item => item.id !== row.id)
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={addSource}>
            <Plus className="mr-2 h-4 w-4" />
            {resultText.add}
          </Button>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              {resultText.latitude}
              <Input
                type="number"
                min="-90"
                max="90"
                step="0.0001"
                value={latitude}
                onChange={event => setLatitude(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              {resultText.longitude}
              <Input
                type="number"
                min="-180"
                max="180"
                step="0.0001"
                value={longitude}
                onChange={event => setLongitude(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">
            {resultText.upload}
          </h3>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="space-y-1 text-sm">
              {resultText.file}
              <span className="relative flex min-h-10 items-center overflow-hidden rounded-md border border-input bg-background text-sm">
                <input
                  className="peer sr-only"
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={async event => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setSelectedFileName(file.name);
                    if (file.size > 7 * 1024 * 1024) {
                      setError(analysisErrorCopy[reportLanguage].fileTooLarge);
                      return;
                    }
                    try {
                      setImportedText(await file.text(), file.name);
                      setError("");
                    } catch (reason) {
                      setError(
                        reason instanceof Error ? reason.message : String(reason)
                      );
                    }
                  }}
                />
                <span className="h-10 shrink-0 cursor-pointer border-r px-3 py-2.5 font-medium peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  {resultText.chooseFile}
                </span>
                <span className="truncate px-3 text-muted-foreground" aria-live="polite">
                  {selectedFileName || resultText.noFileChosen}
                </span>
              </span>
            </label>
            <label className="space-y-1 text-sm">
              {resultText.remoteUrl}
              <Input
                type="url"
                value={remoteUrl}
                onChange={event => setRemoteUrl(event.target.value)}
                placeholder="https://.../dataset.csv"
              />
            </label>
            <Button
              variant="outline"
              onClick={loadUrl}
              disabled={busy || !remoteUrl.trim()}
            >
              {importMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {resultText.loadUrl}
            </Button>
          </div>
          {imported && (
            <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3">
              <p className="self-center text-sm">
                {formatReportNumber(imported.rows.length, reportLanguage)} · {imported.name}
              </p>
              <label className="space-y-1 text-sm">
                {resultText.dateColumn}
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                  value={dateColumn}
                  onChange={event => setDateColumn(event.target.value)}
                >
                  {imported.headers.map(header => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                {resultText.unitColumn}
                <Input
                  value={externalUnit}
                  onChange={event => setExternalUnit(event.target.value)}
                />
              </label>
              <fieldset className="sm:col-span-3">
                <legend className="mb-2 text-sm">{resultText.numericColumns}</legend>
                <div className="flex flex-wrap gap-3">
                  {imported.headers
                    .filter(header =>
                      imported.rows.some(
                        row => parseNumber(row[header]) !== null
                      )
                    )
                    .map(header => (
                      <label
                        key={header}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={numericColumns.includes(header)}
                          onChange={event =>
                            setNumericColumns(columns =>
                              event.target.checked
                                ? [...columns, header]
                                : columns.filter(item => item !== header)
                            )
                          }
                        />
                        {header}
                      </label>
                    ))}
                </div>
              </fieldset>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">{resultText.interval}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-sm">
              {resultText.from}
              <Input
                type="date"
                value={startDate}
                onChange={event => setStartDate(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              {resultText.to}
              <Input
                type="date"
                value={endDate}
                onChange={event => setEndDate(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              {resultText.minimum}
              <Input
                type="number"
                step="any"
                value={minValue}
                onChange={event => setMinValue(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              {resultText.maximum}
              <Input
                type="number"
                step="any"
                value={maxValue}
                onChange={event => setMaxValue(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              {resultText.forecastSteps}
              <Input
                type="number"
                min="0"
                max="20"
                value={forecastSteps}
                onChange={event => setForecastSteps(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              {resultText.backtestSteps}
              <Input
                type="number"
                min="0"
                max="10"
                value={backtestSteps}
                onChange={event => setBacktestSteps(event.target.value)}
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            {resultText.assistantQuestion}
            <Textarea
              value={question}
              onChange={event => setQuestion(event.target.value)}
              maxLength={1000}
              rows={2}
              placeholder={resultText.questionPlaceholder}
            />
          </label>
          <label className="block max-w-xl space-y-1 text-sm">
            {resultText.target}
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3"
              value={targetKey}
              onChange={event => setTargetKey(event.target.value)}
            >
              {sourceRows.map(row => {
                const definition = providers[row.provider];
                const selected = definition.indicators.find(
                  item => item.id === row.indicator
                );
                return (
                  <option
                    key={`official:${row.id}`}
                    value={`official:${row.id}`}
                  >
                    {localizeStatisticalSeriesLabel(
                      selected?.label ?? definition.name,
                      reportLanguage
                    )}{" "}
                    ·{" "}
                    {localizeStatisticalSeriesLabel(
                      definition.name,
                      reportLanguage
                    )}
                    {row.provider === "worldbank"
                      ? ` (${row.country.toUpperCase()})`
                      : ""}
                  </option>
                );
              })}
              {numericColumns.map(column => (
                <option key={`file:${column}`} value={`file:${column}`}>
                  {imported?.name}: {column}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-muted-foreground">
            {resultText.explanation}
          </p>
          {!isAuthenticated && !authLoading && (
            <p className="text-sm text-muted-foreground">
              {resultText.loginRequired}{" "}
              <Link href="/login" className="text-primary underline">
                {resultText.signIn}
              </Link>
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          {statusText && (
            <p
              role="status"
              aria-live="polite"
              className="text-sm text-muted-foreground"
            >
              {statusText}
            </p>
          )}
          <Button
            onClick={runAnalysis}
            disabled={busy || authLoading || !isAuthenticated}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {resultText.runAnalysis}
          </Button>
        </section>

        {analysis && (
          <section className="space-y-4 border-t pt-6">
            <h3 className="font-semibold">{resultText.title}</h3>
            <div
              className="h-80 w-full rounded-lg border p-3"
              role="img"
              aria-label={resultText.chartAria}
            >
              <p className="mb-1 text-xs text-muted-foreground">
                {resultText.chartDescription}
              </p>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={24} />
                  <YAxis />
                  <Tooltip
                    formatter={value =>
                      formatReportNumber(Number(value), reportLanguage, 3)
                    }
                  />
                  <Legend />
                  {series.map((item, index) => (
                    <Line
                      key={item.name}
                      type="monotone"
                      dataKey={item.name}
                      name={localizeSeriesName(item.name)}
                      stroke={palette[index % palette.length]}
                      dot={false}
                      connectNulls
                    />
                  ))}
                  {series.flatMap((item, index) =>
                    analysis.reports.find(report => report.name === item.name)
                      ?.forecast.length
                      ? [
                          <Line
                            key={`${item.name}-forecast`}
                            type="monotone"
                            dataKey={`${item.name} (proiezione)`}
                            name={`${localizeSeriesName(item.name)} (${resultText.projectionLabel})`}
                            stroke={palette[index % palette.length]}
                            strokeDasharray="5 5"
                            dot={false}
                            connectNulls
                          />,
                        ]
                      : []
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3">{resultText.date}</th>
                    {series.map(item => (
                      <th
                        className="p-3"
                        key={item.name}
                        title={`${localizeSeriesSource(item.source)} · ${localizeSeriesUnit(item.unit, item.source)}`}
                      >
                        {localizeSeriesName(item.name)}{" "}
                        ({localizeSeriesUnit(item.unit, item.source)})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allDates
                    .filter(date =>
                      series.some(item =>
                        item.rows.some(row => row.date === date)
                      )
                    )
                    .slice(-300)
                    .map(date => (
                      <tr key={date} className="border-t">
                        <td className="p-3">{date}</td>
                        {series.map(item => (
                          <td className="p-3" key={item.name}>
                            {item.rows
                              .find(row => row.date === date)
                              ?.value === undefined
                              ? "—"
                              : formatReportNumber(
                                  item.rows.find(row => row.date === date)!.value,
                                  reportLanguage,
                                  3
                                )}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3">{resultText.seriesSource}</th>
                    <th className="p-3">{resultText.observations}</th>
                    <th className="p-3">{resultText.period}</th>
                    <th className="p-3">{resultText.trend}</th>
                    <th className="p-3">{resultText.historicalMae}</th>
                    <th className="p-3">{resultText.officialSource}</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.reports.map((report, index) => (
                    <tr key={`${report.name}-${index}`} className="border-t">
                      <td className="p-3">
                        {localizeSeriesName(report.name)}
                        <span className="block text-xs text-muted-foreground">
                          {localizeSeriesUnit(report.unit, report.source)}{" "}
                          ·{" "}
                          {localizeSeriesSource(report.source)}
                        </span>
                      </td>
                      <td className="p-3">
                        {formatReportNumber(report.count, reportLanguage)}
                      </td>
                      <td className="p-3">
                        {report.firstDate} – {report.lastDate}
                      </td>
                      <td className="p-3">
                        {localizeStatisticalDirection(
                          report.direction,
                          reportLanguage
                        )}
                      </td>
                      <td className="p-3">
                        {report.mae === null
                          ? "—"
                          : formatReportNumber(report.mae, reportLanguage, 3)}
                      </td>
                      <td className="p-3">
                        {series[index]?.url ? (
                          <a
                            className="text-primary underline"
                            href={series[index].url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {resultText.openData}{" "}
                            <ExternalLink className="inline h-3 w-3" />
                          </a>
                        ) : Object.values(providers).some(
                            provider => provider.name === report.source
                          ) ? (
                          <a
                            className="text-primary underline"
                            href={
                              Object.values(providers).find(
                                provider => provider.name === report.source
                              )?.pageUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {resultText.openPortal}
                          </a>
                        ) : (
                          <span>{report.source}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {analysis.reports.flatMap(report =>
                report.warnings.map(warning => (
                  <li key={`${report.name}-${warning}`}>
                    •{" "}
                    {localizeSeriesName(report.name)}
                    : {localizeStatisticalText(warning, reportLanguage)}
                  </li>
                ))
              )}
              {analysis.correlations.map(item => (
                <li key={`${item.first}-${item.second}`}>
                  • {resultText.association}{" "}
                  {localizeSeriesName(item.first)} /{" "}
                  {localizeSeriesName(item.second)}:{" "}
                  r={formatReportNumber(item.r, reportLanguage, 3)};{" "}
                  {item.count} {resultText.sharedDates};{" "}
                  {localizeStatisticalCorrelationInterpretation(
                    item.interpretation,
                    reportLanguage
                  )}
                </li>
              ))}
              {analysis.factorModel?.warning && (
                <li>
                  •{" "}
                  {localizeStatisticalText(
                    analysis.factorModel.warning,
                    reportLanguage
                  )}
                </li>
              )}
              <li>
                {localizeStatisticalText(analysis.disclaimer, reportLanguage)}
              </li>
            </ul>
          </section>
        )}
        <AnalyticsReportDownload
          title={resultText.reportTitle}
          content={reportContent}
          visuals={reportVisuals}
          conclusion={reportConclusion}
          language={reportLanguage}
          returnPath="/analysis/portals"
        />
      </CardContent>
    </Card>
  );
}

export function OfficialDataCatalogs() {
  const { language } = useLanguage();
  const reportLanguage = resolveAnalyticsReportLanguage(language);
  const resultText = analysisResultCopy[reportLanguage];
  const localizeLinkLabel = (label: string) => {
    if (/token/i.test(label)) return resultText.tokenRequest;
    if (/portale|catalogo|explorer|browser|store/i.test(label)) {
      return resultText.providersPortal;
    }
    return resultText.documentation;
  };
  return (
    <section className="space-y-3 border-t pt-6">
      <h3 className="font-semibold">{resultText.catalog}</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          Object.entries(providers) as Array<
            [ProviderId, (typeof providers)[ProviderId]]
          >
        ).map(([id, provider]) => (
          <article key={id} className="rounded-lg border p-4">
            <h4 className="font-medium">
              {localizeStatisticalSeriesLabel(provider.name, reportLanguage)}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              {provider.indicators
                .map(item =>
                  localizeStatisticalSeriesLabel(item.label, reportLanguage)
                )
                .join(" · ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
              <a
                className="text-primary underline"
                href={provider.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {resultText.providersPortal} <ExternalLink className="inline h-3 w-3" />
              </a>
              <a
                className="text-primary underline"
                href={provider.apiUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {resultText.officialApi} <ExternalLink className="inline h-3 w-3" />
              </a>
              <a
                className="text-primary underline"
                href={provider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {resultText.documentation} <ExternalLink className="inline h-3 w-3" />
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="space-y-3 pt-2">
        <div>
          <h4 className="font-medium">{resultText.moreCatalogs}</h4>
          <p className="text-sm text-muted-foreground">
            {resultText.catalogDescription}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {additionalSources.map((source, index) => (
            <article key={source.name} className="rounded-lg border p-4">
              <h5 className="font-medium">
                {localizeStatisticalSeriesLabel(source.name, reportLanguage)}
              </h5>
              <p className="mt-1 text-sm text-muted-foreground">
                {additionalCatalogDescriptions[reportLanguage][index] ??
                  (reportLanguage === "it"
                    ? source.description
                    : resultText.catalogDescription)}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {source.links.map(link => (
                  <a
                    key={link.url}
                    className="text-primary underline"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {localizeLinkLabel(link.label)}{" "}
                    <ExternalLink className="inline h-3 w-3" />
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
