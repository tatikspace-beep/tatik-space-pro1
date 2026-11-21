import { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { AlertCircle, ExternalLink, FileText, Loader2, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "../../../server/routers";

type MlSourceResult = inferRouterOutputs<AppRouter>["mlStudio"]["analyzeSources"];
type MergedDataset = inferRouterOutputs<AppRouter>["mlStudio"]["mergeSources"];
type MlSourceDocument = { name: string; contentBase64: string };
type SourceMode = "separate" | "corpus" | "tables" | "both";

const MAX_SOURCE_BYTES = 2_500_000;
const MAX_SOURCE_FILES = 5;
const supportedExtensions = new Set(["pdf", "docx", "xlsx", "csv", "json", "txt", "md"]);
const tableExtensions = new Set(["csv", "json", "xlsx"]);

const copy = {
  it: {
    title: "Documenti e URL",
    description: "Analizza più fonti pubbliche, crea un corpus testuale oppure unisci tabelle compatibili per il training ML.",
    mode: "Flusso di elaborazione",
    separate: "Analisi separata e confronto fonti",
    corpus: "Corpus testuale e temi ricorrenti",
    tables: "Unisci tabelle per il training ML",
    both: "Analisi testo + tabelle per ML",
    objective: "Domanda o obiettivo (facoltativo)",
    objectivePlaceholder: "Es. confronta le evidenze su qualità dell'aria...",
    urls: "URL pubblici (uno per riga, massimo 5)",
    files: "File (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; massimo 5)",
    chooseFiles: "Scegli più file",
    limits: "Massimo 5 file e 5 URL; totale file 2,5 MB. I file e le pagine pubbliche vengono elaborati in memoria e non salvati. Le pagine web devono esporre testo HTML; per tabelle ML, gli URL devono puntare direttamente a CSV o JSON.",
    run: "Elabora fonti",
    busy: "Elaborazione…",
    extracted: "Estratto",
    recommendations: "Risorse correlate",
    corpusTitle: "Corpus combinato",
    corpusMethod: "Sintesi estrattiva e parole ricorrenti, senza LLM.",
    summary: "Frasi rappresentative",
    keywords: "Parole ricorrenti",
    sources: "fonti",
    characters: "caratteri",
    tablesReady: "Tabelle unite e caricate nel pannello ML sottostante",
    tableNote: "Non sono state selezionate tabelle CSV/JSON/XLSX o URL diretti a dataset tabellari.",
    noSources: "Aggiungi almeno un file o un URL.",
    tooManyFiles: "Puoi aggiungere al massimo 5 file.",
    tooManyUrls: "Puoi aggiungere al massimo 5 URL.",
    badUrl: "Usa URL HTTP o HTTPS pubblici validi, senza credenziali nell'indirizzo.",
    unsupported: "Formato file non supportato",
    tooLarge: "La dimensione complessiva dei file supera 2,5 MB.",
    tableOnly: "Il flusso tabelle richiede file CSV, JSON o XLSX e URL diretti a CSV/JSON.",
    login: "Accedi per elaborare più fonti.",
    signIn: "Accedi",
  },
  en: {
    title: "Documents and URLs",
    description: "Analyze multiple public sources, build a text corpus, or merge compatible tables for ML training.",
    mode: "Processing workflow",
    separate: "Analyze and compare sources separately",
    corpus: "Combined text corpus and recurring terms",
    tables: "Merge tables for ML training",
    both: "Text analysis + ML tables",
    objective: "Question or objective (optional)",
    objectivePlaceholder: "e.g. compare evidence about air quality...",
    urls: "Public URLs (one per line, up to 5)",
    files: "Files (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; up to 5)",
    chooseFiles: "Choose multiple files",
    limits: "Up to 5 files and 5 URLs; combined file size 2.5 MB. Files and public pages are processed in memory and are not stored. Webpages must expose HTML text; ML tables require direct CSV or JSON URLs.",
    run: "Process sources",
    busy: "Processing…",
    extracted: "Extract",
    recommendations: "Related resources",
    corpusTitle: "Combined corpus",
    corpusMethod: "Extractive summary and recurring terms; no LLM.",
    summary: "Representative sentences",
    keywords: "Recurring terms",
    sources: "sources",
    characters: "characters",
    tablesReady: "Tables merged and loaded in the ML panel below",
    tableNote: "No CSV/JSON/XLSX tables or direct tabular dataset URLs were selected.",
    noSources: "Add at least one file or URL.",
    tooManyFiles: "You can add up to 5 files.",
    tooManyUrls: "You can add up to 5 URLs.",
    badUrl: "Use valid public HTTP or HTTPS URLs without embedded credentials.",
    unsupported: "Unsupported file format",
    tooLarge: "Combined file size exceeds 2.5 MB.",
    tableOnly: "Table mode requires CSV, JSON, or XLSX files and direct CSV/JSON URLs.",
    login: "Sign in to process multiple sources.",
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

async function readSourceFiles(files: File[]): Promise<MlSourceDocument[]> {
  return Promise.all(files.map(async (file) => ({
    name: file.name,
    contentBase64: encodeBase64(new Uint8Array(await file.arrayBuffer())),
  })));
}

function extensionOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isDirectTableUrl(value: string) {
  const path = new URL(value).pathname.toLowerCase();
  return path.endsWith(".csv") || path.endsWith(".json");
}

export function MlStudioSources({
  language,
  onMergedDataset,
}: {
  language: string;
  onMergedDataset: (dataset: Pick<MergedDataset, "name" | "contentBase64">) => Promise<void>;
}) {
  const text = copy[language === "it" ? "it" : "en"];
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<SourceMode>("both");
  const [question, setQuestion] = useState("");
  const [urlText, setUrlText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [analysis, setAnalysis] = useState<MlSourceResult | null>(null);
  const [error, setError] = useState("");
  const [tableMessage, setTableMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const analyzeMutation = trpc.mlStudio.analyzeSources.useMutation();
  const mergeMutation = trpc.mlStudio.mergeSources.useMutation();

  const analyze = async () => {
    setError("");
    setTableMessage("");
    setAnalysis(null);
    const urls = urlText.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
    if (!files.length && !urls.length) {
      setError(text.noSources);
      return;
    }
    if (files.length > MAX_SOURCE_FILES) {
      setError(text.tooManyFiles);
      return;
    }
    if (urls.length > MAX_SOURCE_FILES) {
      setError(text.tooManyUrls);
      return;
    }
    if (urls.some((value) => {
      try {
        const parsed = new URL(value);
        return !["http:", "https:"].includes(parsed.protocol) || Boolean(parsed.username || parsed.password);
      } catch {
        return true;
      }
    })) {
      setError(text.badUrl);
      return;
    }
    if (files.some((file) => !supportedExtensions.has(extensionOf(file.name)))) {
      setError(text.unsupported);
      return;
    }
    if (files.reduce((total, file) => total + file.size, 0) > MAX_SOURCE_BYTES) {
      setError(text.tooLarge);
      return;
    }

    setBusy(true);
    try {
      const documents = await readSourceFiles(files);
      if (mode === "separate" || mode === "corpus" || mode === "both") {
        try {
          setAnalysis(await analyzeMutation.mutateAsync({ documents, urls, query: question.trim() }));
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      }

      if (mode === "tables" || mode === "both") {
        const tableDocuments = documents.filter((document) => tableExtensions.has(extensionOf(document.name)));
        const unsupportedUrl = urls.some((url) => !isDirectTableUrl(url));
        if (mode === "tables" && (
          tableDocuments.length !== documents.length
          || unsupportedUrl
        )) {
          setError(text.tableOnly);
        } else {
          const tableUrls = urls.filter(isDirectTableUrl);
          if (!tableDocuments.length && !tableUrls.length) {
            setTableMessage(text.tableNote);
          } else {
            try {
              const merged = await mergeMutation.mutateAsync({ documents: tableDocuments, urls: tableUrls });
              await onMergedDataset({ name: merged.name, contentBase64: merged.contentBase64 });
              setTableMessage(`${text.tablesReady}: ${merged.sourceCount} · ${merged.rows.toLocaleString()} rows.`);
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : String(reason));
            }
          }
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" />{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="block max-w-xl space-y-1 text-sm font-medium">
          {text.mode}
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3"
            value={mode}
            onChange={(event) => setMode(event.target.value as SourceMode)}
          >
            <option value="separate">{text.separate}</option>
            <option value="corpus">{text.corpus}</option>
            <option value="tables">{text.tables}</option>
            <option value="both">{text.both}</option>
          </select>
        </label>
        {mode !== "tables" && (
          <label className="block space-y-1 text-sm font-medium">
            {text.objective}
            <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} rows={2} placeholder={text.objectivePlaceholder} />
          </label>
        )}
        <label className="block space-y-1 text-sm font-medium">
          {text.urls}
          <Textarea value={urlText} onChange={(event) => setUrlText(event.target.value)} maxLength={10_500} rows={3} placeholder={"https://example.org/report\nhttps://example.org/data.csv"} />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          {text.files}
          <span className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
            <Upload className="h-4 w-4" />
            {files.length ? files.map((file) => file.name).join(", ") : text.chooseFiles}
            <Input
              className="sr-only"
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.json,.txt,.md"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </span>
        </label>
        <p className="text-xs text-muted-foreground">{text.limits}</p>
        {!isAuthenticated && !authLoading && <p className="text-sm text-muted-foreground">{text.login} <a className="text-primary underline" href="/login">{text.signIn}</a></p>}
        {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        {tableMessage && <p role="status" className="text-sm text-muted-foreground">{tableMessage}</p>}
        <Button onClick={analyze} disabled={busy || authLoading || !isAuthenticated}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          {busy ? text.busy : text.run}
        </Button>

        {analysis?.corpus && mode !== "separate" && (
          <section className="space-y-3 rounded-lg border bg-muted/30 p-4" aria-live="polite">
            <h3 className="font-semibold">{text.corpusTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {analysis.corpus.sourceCount} {text.sources} · {analysis.corpus.characters.toLocaleString()} {text.characters} · {analysis.corpus.method}
            </p>
            {analysis.corpus.summary.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">{text.summary}</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                  {analysis.corpus.summary.map((sentence) => <li key={sentence}>{sentence}</li>)}
                </ul>
              </div>
            )}
            {analysis.corpus.keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">{text.keywords}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {analysis.corpus.keywords.map((keyword) => (
                    <span key={keyword.term} className="rounded-full border bg-background px-2 py-1 text-xs">
                      {keyword.term} · {keyword.sourceCount}/{analysis.corpus?.sourceCount}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {analysis?.items.map((item, index) => (
          <article key={`${item.kind}-${item.label ?? item.document?.name ?? index}-${index}`} className="rounded-lg border p-4">
            <h3 className="flex items-center gap-2 font-medium">
              {item.kind === "file" ? <FileText className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
              {item.label ?? item.document?.name}
            </h3>
            {item.error && <p role="alert" className="mt-2 text-sm text-destructive">{item.error}</p>}
            {item.document && (
              <div className="mt-3 space-y-2 text-sm">
                {item.label && item.document.name !== item.label && <p className="text-muted-foreground">{item.document.name}</p>}
                <p className="text-muted-foreground">{item.document.format} · {item.document.charactersExtracted.toLocaleString()} {text.characters}{item.document.truncated ? " · truncated" : ""}</p>
                <p className="text-xs text-muted-foreground">{item.processing}</p>
                {item.extractedTextPreview && (
                  <>
                    <p className="font-medium">{text.extracted}</p>
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">{item.extractedTextPreview}</pre>
                  </>
                )}
                {item.analysis?.references.length ? (
                  <div>
                    <h4 className="font-medium">{text.recommendations}</h4>
                    <ul className="mt-1 space-y-1">
                      {item.analysis.references.slice(0, 5).map((reference) => (
                        <li key={reference.url}>
                          <a className="text-primary underline" href={reference.url} target="_blank" rel="noopener noreferrer">{reference.label}</a>
                          <p className="text-xs text-muted-foreground">{reference.reason}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
