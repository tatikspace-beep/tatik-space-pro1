import { useState } from "react";
import { Link } from "wouter";
import type { inferRouterOutputs } from "@trpc/server";
import { AlertCircle, ExternalLink, FileText, Loader2, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "../../../server/routers";

const MAX_FILE_BYTES = 2.5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set(["pdf", "docx", "xlsx", "csv", "json", "txt", "md"]);
const copy = {
  it: {
    title: "Documenti e portali",
    description: "Carica materiali di ricerca oppure indica pagine di catalogo e dataset pubblici da esplorare.",
    question: "Obiettivo della ricerca",
    questionPlaceholder: "Es. individuare dataset Sentinel-2 per mappare l'espansione urbana...",
    urls: "URL dei portali o dataset (uno per riga, massimo 5)",
    files: "Documenti (PDF, DOCX, XLSX, CSV, JSON, TXT o MD; massimo 2,5 MB ciascuno)",
    analyze: "Analizza fonti e documenti",
    login: "Accedi per avviare un'analisi.",
    loginLink: "Accedi",
    limits: "I file sono elaborati in memoria dal servizio Python configurato; l'applicazione non li salva. Non caricare materiali riservati; i PDF scansiti senza testo selezionabile non sono leggibili.",
    noInput: "Aggiungi almeno un documento o un URL.",
    tooManyFiles: "Puoi elaborare al massimo 3 documenti per volta.",
    tooManyUrls: "Puoi esplorare al massimo 5 URL per volta.",
    invalidUrl: "Controlla gli URL: sono ammessi solo indirizzi HTTP o HTTPS validi.",
    unsupportedFile: "Formato non supportato",
    tooLarge: "supera il limite di 2,5 MB.",
    result: "Risultati",
    recommendations: "Risorse individuate",
    preview: "Estratto del documento",
    method: "Indicazioni metodologiche",
    characters: "caratteri estratti",
    processing: "Analisi in corso…",
    emptyResult: "Nessun risultato da mostrare.",
  },
  en: {
    title: "Documents and portals",
    description: "Upload research material or enter public catalog and dataset pages to explore.",
    question: "Research objective",
    questionPlaceholder: "e.g. find Sentinel-2 datasets for mapping urban expansion...",
    urls: "Portal or dataset URLs (one per line, up to 5)",
    files: "Documents (PDF, DOCX, XLSX, CSV, JSON, TXT or MD; up to 2.5 MB each)",
    analyze: "Analyze sources and documents",
    login: "Sign in to start an analysis.",
    loginLink: "Sign in",
    limits: "Files are processed in memory by the configured Python service; the application does not store them. Do not upload confidential material; scanned PDFs without selectable text cannot be read.",
    noInput: "Add at least one document or URL.",
    tooManyFiles: "You can process up to 3 documents at a time.",
    tooManyUrls: "You can explore up to 5 URLs at a time.",
    invalidUrl: "Check the URLs: only valid HTTP or HTTPS addresses are accepted.",
    unsupportedFile: "Unsupported format",
    tooLarge: "exceeds the 2.5 MB limit.",
    result: "Results",
    recommendations: "Resources found",
    preview: "Document excerpt",
    method: "Method guidance",
    characters: "characters extracted",
    processing: "Analyzing…",
    emptyResult: "No results to display.",
  },
};

type OutputItem = {
  kind: "document" | "portal";
  label: string;
  document?: inferRouterOutputs<AppRouter>["dataInsight"]["analyzeDocument"];
  portal?: inferRouterOutputs<AppRouter>["dataInsight"]["explorePortal"];
};

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossibile leggere il file selezionato."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Il contenuto del file non e disponibile."));
        return;
      }
      const separator = reader.result.indexOf(",");
      if (separator < 0) {
        reject(new Error("Formato del file caricato non valido."));
        return;
      }
      resolve(reader.result.slice(separator + 1));
    };
    reader.readAsDataURL(file);
  });
}

export function DataInsightSources({ language = "en" }: { language: string }) {
  const text = copy[language === "it" ? "it" : "en"];
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [urls, setUrls] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<OutputItem[]>([]);
  const [error, setError] = useState("");
  const documentMutation = trpc.dataInsight.analyzeDocument.useMutation();
  const portalMutation = trpc.dataInsight.explorePortal.useMutation();
  const busy = documentMutation.isPending || portalMutation.isPending;

  const analyze = async () => {
    setError("");
    setItems([]);
    const portalUrls = urls.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
    if (!files.length && !portalUrls.length) {
      setError(text.noInput);
      return;
    }
    if (files.length > 3) {
      setError(text.tooManyFiles);
      return;
    }
    if (portalUrls.length > 5) {
      setError(text.tooManyUrls);
      return;
    }
    if (portalUrls.some((value) => {
      try {
        const parsed = new URL(value);
        return !["http:", "https:"].includes(parsed.protocol);
      } catch {
        return true;
      }
    })) {
      setError(text.invalidUrl);
      return;
    }

    const results: OutputItem[] = [];
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ACCEPTED_EXTENSIONS.has(extension)) {
        setError(`${text.unsupportedFile}: ${file.name}`);
        setItems(results);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} ${text.tooLarge}`);
        setItems(results);
        return;
      }
      try {
        const contentBase64 = await readAsBase64(file);
        const document = await documentMutation.mutateAsync({
          name: file.name,
          contentBase64,
          query,
        });
        results.push({ kind: "document", label: file.name, document });
        setItems([...results]);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason));
        setItems([...results]);
        return;
      }
    }
    for (const url of portalUrls) {
      try {
        const portal = await portalMutation.mutateAsync({ url, query });
        results.push({ kind: "portal", label: url, portal });
        setItems([...results]);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason));
        setItems([...results]);
        return;
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" />{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="block space-y-2 text-sm font-medium">
          {text.question}
          <Textarea value={query} onChange={(event) => setQuery(event.target.value)} maxLength={1000} rows={3} placeholder={text.questionPlaceholder} />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          {text.urls}
          <Textarea value={urls} onChange={(event) => setUrls(event.target.value)} rows={3} placeholder={"https://..."} />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          {text.files}
          <span className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
            <Upload className="h-4 w-4" />
            {files.length ? files.map((file) => file.name).join(", ") : "Scegli file / Choose files"}
            <input
              className="sr-only"
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.json,.txt,.md"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </span>
        </label>
        <p className="text-xs text-muted-foreground">{text.limits}</p>
        {!isAuthenticated && !authLoading && (
          <p className="text-sm text-muted-foreground">
            {text.login} <Link href="/login" className="font-medium text-primary underline">{text.loginLink}</Link>
          </p>
        )}
        {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        <Button onClick={analyze} disabled={busy || authLoading || !isAuthenticated} className="w-full sm:w-auto">
          {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{text.processing}</> : text.analyze}
        </Button>

        {items.length > 0 && (
          <section aria-live="polite" className="space-y-4 border-t pt-5">
            <h3 className="font-semibold">{text.result}</h3>
            {items.map((item, index) => (
              <article key={`${item.kind}-${item.label}-${index}`} className="rounded-lg border p-4">
                <h4 className="flex items-center gap-2 font-medium">
                  {item.kind === "document" ? <FileText className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                  {item.label}
                </h4>
                {item.kind === "document" && item.document && (
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      {item.document.document.format} · {item.document.document.charactersExtracted.toLocaleString()} {text.characters}
                      {item.document.document.truncated ? " · estrazione limitata" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.document.processing}</p>
                    <p className="text-xs text-muted-foreground">{item.document.analysis.note}</p>
                    <p className="font-medium">{text.preview}</p>
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">{item.document.extractedTextPreview}</pre>
                    {item.document.analysis.references.length > 0 && (
                      <>
                        <p className="font-medium">{text.recommendations}</p>
                        <ul className="space-y-2">
                          {item.document.analysis.references.slice(0, 5).map((reference) => (
                            <li key={reference.url}>
                              <a className="font-medium text-primary underline" href={reference.url} target="_blank" rel="noopener noreferrer">{reference.label}</a>
                              <p className="text-muted-foreground">{reference.reason}</p>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {item.document.analysis.specialized && (
                      <div className="rounded-md bg-muted p-3">
                        <p className="font-medium">{text.method}: {item.document.analysis.specialized.title}</p>
                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                          {item.document.analysis.specialized.workflow.map((step) => <li key={step}>{step}</li>)}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
                {item.kind === "portal" && item.portal && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-muted-foreground">{item.portal.pagesCount} pagine esaminate</p>
                    <p className="text-sm font-medium">{text.recommendations}</p>
                    <ul className="space-y-1">
                      {item.portal.recommendations.slice(0, 5).map((resource) => (
                        <li key={resource.url}>
                          <a className="text-sm text-primary underline" href={resource.url} target="_blank" rel="noopener noreferrer">
                            {resource.label} <ExternalLink className="inline h-3 w-3" />
                          </a>
                        </li>
                      ))}
                    </ul>
                    {item.portal.recommendations.length === 0 && <p className="text-sm text-muted-foreground">{text.emptyResult}</p>}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </CardContent>
    </Card>
  );
}
