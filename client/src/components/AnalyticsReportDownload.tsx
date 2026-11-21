import { useEffect, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { AnalyticsReportVisual } from "@/lib/analyticsReportPdf";

type StoredReport = {
  reportId: string;
  title: string;
  content: string;
  visuals?: AnalyticsReportVisual[];
};

const REPORT_STORAGE_PREFIX = "tatik.analytics-report.";
const MAX_STORED_IMAGE_CHARS = 600_000;

type PdfGenerator = typeof import("@/lib/analyticsReportPdf").createAnalyticsReportPdf;

let pdfGenerator: PdfGenerator | null = null;
let pdfGeneratorPromise: Promise<PdfGenerator> | null = null;

function loadPdfGenerator() {
  if (!pdfGeneratorPromise) {
    pdfGeneratorPromise = import("@/lib/analyticsReportPdf").then((module) => {
      pdfGenerator = module.createAnalyticsReportPdf;
      return pdfGenerator;
    });
  }
  return pdfGeneratorPromise;
}

async function compressVisualsForStorage(visuals: AnalyticsReportVisual[]) {
  return Promise.all(visuals.map(async (visual) => {
    if (visual.type !== "image" || visual.dataUrl.length <= MAX_STORED_IMAGE_CHARS) return visual;
    if (!visual.dataUrl.startsWith("data:image/")) {
      throw new Error(`L'immagine "${visual.title}" non può essere preparata per il report.`);
    }

    const image = new Image();
    image.src = visual.dataUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Impossibile preparare l'immagine "${visual.title}" per il report.`));
    });

    const scale = Math.min(1, 1200 / image.naturalWidth, 900 / image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Impossibile preparare l'immagine per il report.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { ...visual, dataUrl: canvas.toDataURL("image/jpeg", 0.84) };
  }));
}

export function AnalyticsReportDownload({
  title,
  content,
  visuals = [],
  returnPath,
}: {
  title: string;
  content: string;
  visuals?: AnalyticsReportVisual[];
  returnPath: "/analysis/ml-studio" | "/analysis/remote-sensing" | "/analysis/portals";
}) {
  const { isAuthenticated } = useAuth();
  const accessQuery = trpc.analyticsAccess.getStatus.useQuery(undefined, { enabled: isAuthenticated });
  const checkoutMutation = trpc.analyticsReports.startCheckout.useMutation();
  const verifyMutation = trpc.analyticsReports.verifyPurchase.useMutation();
  const [verifiedReport, setVerifiedReport] = useState<StoredReport | null>(null);
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [preparingReport, setPreparingReport] = useState(false);
  const [returnParams] = useState(() => {
    if (typeof window === "undefined") return { sessionId: "", reportId: "", cancelled: false };
    const params = new URLSearchParams(window.location.search);
    return {
      sessionId: params.get("session_id") || "",
      reportId: params.get("report_id") || "",
      cancelled: params.get("report_purchase") === "cancelled",
    };
  });

  useEffect(() => {
    if (returnParams.cancelled) {
      setError("Pagamento annullato: il report non è stato acquistato.");
      return;
    }
    if (!isAuthenticated || !returnParams.sessionId || !returnParams.reportId) return;

    let active = true;
    const verify = async () => {
      try {
        const stored = sessionStorage.getItem(`${REPORT_STORAGE_PREFIX}${returnParams.reportId}`);
        if (!stored) throw new Error("Report temporaneo non disponibile in questa scheda. Esegui di nuovo l’analisi per prepararlo.");
        const report = JSON.parse(stored) as StoredReport;
        if (report.reportId !== returnParams.reportId || !report.content || !report.title) {
          throw new Error("Il contenuto temporaneo non corrisponde al report acquistato.");
        }
        await verifyMutation.mutateAsync({
          sessionId: returnParams.sessionId,
          reportId: returnParams.reportId,
        });
        if (!active) return;
        setVerifiedReport(report);
        sessionStorage.setItem(`${REPORT_STORAGE_PREFIX}latest`, JSON.stringify(report));
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : String(reason));
      } finally {
        if (active) {
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
        }
      }
    };
    void verify();
    return () => {
      active = false;
    };
  }, [isAuthenticated, returnParams.cancelled, returnParams.reportId, returnParams.sessionId]);

  useEffect(() => {
    if (content || returnParams.sessionId || typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(`${REPORT_STORAGE_PREFIX}latest`);
      if (saved) setVerifiedReport(JSON.parse(saved) as StoredReport);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossibile leggere il report salvato nella sessione.");
    }
  }, [content, returnParams.sessionId]);

  useEffect(() => {
    if (content) void accessQuery.refetch();
  }, [content]);

  const pdfContent = content || verifiedReport?.content || "";
  useEffect(() => {
    if (!pdfContent) return;
    let active = true;
    setPdfLoading(true);
    void loadPdfGenerator()
      .then(() => {
        if (active) setPdfReady(true);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Impossibile preparare il generatore PDF.");
      })
      .finally(() => {
        if (active) setPdfLoading(false);
      });
    return () => {
      active = false;
    };
  }, [pdfContent]);

  const currentReport: StoredReport | null = content
    ? { reportId: "", title, content, visuals }
    : verifiedReport;
  const isCurrentReportPaid = Boolean(
    verifiedReport &&
    currentReport &&
    verifiedReport.title === currentReport.title &&
    verifiedReport.content === currentReport.content &&
    JSON.stringify(verifiedReport.visuals ?? []) === JSON.stringify(currentReport.visuals ?? []),
  );
  const access = accessQuery.data;
  const freeDownload = Boolean(access?.staff);
  const isPreparingCheckout = checkoutMutation.isPending || verifyMutation.isPending || preparingReport;

  const startCheckout = async () => {
    if (!content.trim()) return;
    setError("");
    const reportId = crypto.randomUUID();
    setPreparingReport(true);
    try {
      const report = { reportId, title, content, visuals: await compressVisualsForStorage(visuals) };
      sessionStorage.setItem(`${REPORT_STORAGE_PREFIX}${reportId}`, JSON.stringify(report));
      const checkout = await checkoutMutation.mutateAsync({ reportId, reportTitle: title, returnPath });
      window.location.assign(checkout.checkoutUrl);
    } catch (reason) {
      sessionStorage.removeItem(`${REPORT_STORAGE_PREFIX}${reportId}`);
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setPreparingReport(false);
    }
  };

  if (!content && !returnParams.sessionId && !returnParams.cancelled && !verifiedReport) return null;

  const reportToDownload = freeDownload && content
    ? { title, content, visuals }
    : isCurrentReportPaid && verifiedReport
      ? verifiedReport
      : null;
  const reportPrice = access
    ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(access.reportPriceCents / 100)
    : null;

  const download = (reportTitle: string, reportContent: string, reportVisuals: AnalyticsReportVisual[] = []) => {
    try {
      if (!pdfGenerator) throw new Error("Il PDF è ancora in preparazione. Riprova tra qualche secondo.");
      const pdf = pdfGenerator(reportTitle, reportContent, reportVisuals);
      const filename = `${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tatik-report"}.pdf`;
      const url = URL.createObjectURL(pdf.output("blob"));
      const anchor = document.createElement("a");
      try {
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
      } finally {
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossibile generare il PDF.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Report scaricabile</CardTitle>
        <CardDescription>
          {access?.staff
            ? "Download gratuito per amministratori e collaboratori."
            : access?.premium
              ? "Le analisi estese sono incluse nel tuo piano Pro; il PDF del report si acquista singolarmente."
              : access
                ? `Analisi gratuite questo mese: ${access.remaining} su ${access.monthlyLimit}. Fino a ${access.freeRowLimit.toLocaleString("it-IT")} righe per analisi tabellare.`
                : "Verifica delle quote e del prezzo in corso."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Il PDF include i grafici e le immagini disponibili, contiene solo risultati aggregati e non include le righe originali. Per il ritorno dal checkout il riepilogo è conservato temporaneamente nella sessione di questa scheda.
        </p>
        {content && (
          freeDownload ? (
            <Button onClick={() => download(title, content, visuals)} disabled={!pdfReady}>
              {pdfLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {pdfLoading ? "Preparazione PDF…" : "Scarica PDF gratuitamente"}
            </Button>
          ) : isCurrentReportPaid && verifiedReport ? (
            <Button onClick={() => download(verifiedReport.title, verifiedReport.content, verifiedReport.visuals)} disabled={!pdfReady}>
              <Download className="mr-2 h-4 w-4" />Scarica il report acquistato
            </Button>
          ) : (
            <Button onClick={startCheckout} disabled={!isAuthenticated || !access || !pdfReady || isPreparingCheckout}>
              {isPreparingCheckout ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Acquista PDF{reportPrice ? ` · ${reportPrice}` : ""}
            </Button>
          )
        )}
        {!content && reportToDownload && (
          <Button onClick={() => download(reportToDownload.title, reportToDownload.content, reportToDownload.visuals)} disabled={!pdfReady}>
            <Download className="mr-2 h-4 w-4" />Scarica il report acquistato
          </Button>
        )}
        {(error || accessQuery.error) && <p role="alert" className="text-sm text-destructive">{error || accessQuery.error?.message}</p>}
      </CardContent>
    </Card>
  );
}

export function AnalyticsUsageNotice({ language }: { language: "it" | "en" }) {
  const { isAuthenticated } = useAuth();
  const statusQuery = trpc.analyticsAccess.getStatus.useQuery(undefined, { enabled: isAuthenticated });
  if (!isAuthenticated) return null;
  const status = statusQuery.data;
  const message = statusQuery.isLoading
    ? (language === "it" ? "Verifica della quota analitica in corso…" : "Checking analytics quota…")
    : statusQuery.error
      ? statusQuery.error.message
      : status?.staff
        ? (language === "it" ? "Analisi illimitate e report gratuiti per amministratori e collaboratori." : "Unlimited analyses and free reports for admins and collaborators.")
        : status?.premium
          ? (language === "it" ? "Piano Pro: analisi estese incluse; i report PDF si acquistano singolarmente." : "Pro plan: extended analyses included; PDF reports are purchased individually.")
          : status
            ? language === "it"
              ? `Piano gratuito: ${status.remaining} analisi su ${status.monthlyLimit} ancora disponibili questo mese, fino a ${status.freeRowLimit.toLocaleString("it-IT")} righe nelle analisi tabellari. Oltre i limiti serve Pro.`
              : `Free plan: ${status.remaining} of ${status.monthlyLimit} analyses remain this month, up to ${status.freeRowLimit.toLocaleString("en-US")} rows for tabular analyses. Pro is required above these limits.`
            : "";
  if (!message) return null;

  return (
    <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground" role={statusQuery.error ? "alert" : "status"}>
      {message}{" "}
      {!status?.staff && !status?.premium && !statusQuery.error && (
        <Link href="/pricing" className="font-medium text-primary underline">
          {language === "it" ? "Vedi Pro" : "View Pro"}
        </Link>
      )}
    </p>
  );
}
