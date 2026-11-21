import { useEffect, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type StoredReport = {
  reportId: string;
  title: string;
  content: string;
};

const REPORT_STORAGE_PREFIX = "tatik.analytics-report.";

async function downloadPdf(title: string, content: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const lines = pdf.splitTextToSize(content, pageWidth - margin * 2);
  pdf.setProperties({ title, subject: "Report di analisi Tatik.space" });
  pdf.setFontSize(18);
  pdf.text(title.slice(0, 100), margin, 18);
  pdf.setFontSize(10);
  let y = 28;
  for (const line of lines) {
    if (y > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += 5;
  }
  pdf.save(`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tatik-report"}.pdf`);
}

export function AnalyticsReportDownload({
  title,
  content,
  returnPath,
}: {
  title: string;
  content: string;
  returnPath: "/analysis/ml-studio" | "/analysis/remote-sensing" | "/analysis/portals";
}) {
  const { isAuthenticated } = useAuth();
  const accessQuery = trpc.analyticsAccess.getStatus.useQuery(undefined, { enabled: isAuthenticated });
  const checkoutMutation = trpc.analyticsReports.startCheckout.useMutation();
  const verifyMutation = trpc.analyticsReports.verifyPurchase.useMutation();
  const [verifiedReport, setVerifiedReport] = useState<StoredReport | null>(null);
  const [error, setError] = useState("");
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

  const currentReport = content
    ? { reportId: "", title, content }
    : verifiedReport;
  const isCurrentReportPaid = Boolean(
    verifiedReport &&
    currentReport &&
    verifiedReport.title === currentReport.title &&
    verifiedReport.content === currentReport.content,
  );
  const access = accessQuery.data;
  const freeDownload = Boolean(access?.staff);
  const isPreparingCheckout = checkoutMutation.isPending || verifyMutation.isPending;

  const startCheckout = async () => {
    if (!content.trim()) return;
    setError("");
    const reportId = crypto.randomUUID();
    const report = { reportId, title, content };
    try {
      sessionStorage.setItem(`${REPORT_STORAGE_PREFIX}${reportId}`, JSON.stringify(report));
      const checkout = await checkoutMutation.mutateAsync({ reportId, reportTitle: title, returnPath });
      window.location.assign(checkout.checkoutUrl);
    } catch (reason) {
      sessionStorage.removeItem(`${REPORT_STORAGE_PREFIX}${reportId}`);
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  if (!content && !returnParams.sessionId && !returnParams.cancelled && !verifiedReport) return null;

  const reportToDownload = freeDownload && content
    ? { title, content }
    : isCurrentReportPaid && verifiedReport
      ? verifiedReport
      : null;
  const reportPrice = access
    ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(access.reportPriceCents / 100)
    : null;

  const download = (reportTitle: string, reportContent: string) => {
    void downloadPdf(reportTitle, reportContent).catch((reason) => {
      setError(reason instanceof Error ? reason.message : "Impossibile generare il PDF.");
    });
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
          Il PDF contiene solo risultati aggregati, non le righe originali. Per il ritorno dal checkout il riepilogo è conservato temporaneamente nella sessione di questa scheda.
        </p>
        {content && (
          freeDownload ? (
            <Button onClick={() => download(title, content)}>
              <Download className="mr-2 h-4 w-4" />Scarica PDF gratuitamente
            </Button>
          ) : isCurrentReportPaid && verifiedReport ? (
            <Button onClick={() => download(verifiedReport.title, verifiedReport.content)}>
              <Download className="mr-2 h-4 w-4" />Scarica il report acquistato
            </Button>
          ) : (
            <Button onClick={startCheckout} disabled={!isAuthenticated || !access || isPreparingCheckout}>
              {isPreparingCheckout ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Acquista PDF{reportPrice ? ` · ${reportPrice}` : ""}
            </Button>
          )
        )}
        {!content && reportToDownload && (
          <Button onClick={() => download(reportToDownload.title, reportToDownload.content)}>
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
