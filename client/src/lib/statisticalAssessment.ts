import type { StatisticalAnalysis } from "../../../server/data-insight";
import type { AnalyticsReportConclusion } from "./analyticsReportPdf";

type AssessmentLanguage = "it" | "en";

function formatNumber(value: number, language: AssessmentLanguage) {
  return value.toLocaleString(language === "it" ? "it-IT" : "en-US", { maximumFractionDigits: 2 });
}

function formatDirection(direction: string, language: AssessmentLanguage) {
  if (language === "it") return direction;
  const translations: Record<string, string> = {
    crescente: "rising",
    decrescente: "falling",
    "quasi stabile": "roughly stable",
    "non stimabile": "not estimable",
  };
  return translations[direction] ?? direction;
}

export function createStatisticalAssessment(
  analysis: StatisticalAnalysis,
  language: AssessmentLanguage,
): AnalyticsReportConclusion {
  const isItalian = language === "it";
  const totalObservations = analysis.reports.reduce((total, report) => total + report.count, 0);
  const findings = analysis.reports.map((report) => {
    const validationPoints = report.validation.length;
    const pointLabel = isItalian
      ? validationPoints === 1 ? "punto" : "punti"
      : validationPoints === 1 ? "point" : "points";
    const change = report.changePercent === null
      ? (isItalian ? "variazione complessiva non calcolabile" : "overall change could not be calculated")
      : (isItalian
        ? `variazione complessiva ${formatNumber(report.changePercent, language)}%`
        : `overall change ${formatNumber(report.changePercent, language)}%`);
    const validation = validationPoints
      ? (isItalian
        ? `test storico su ${validationPoints} ${pointLabel}: MAE ${report.mae === null ? "n.d." : formatNumber(report.mae, language)} ${report.unit}${report.mape === null ? "" : `, MAPE ${formatNumber(report.mape, language)}%`}`
        : `historical test on ${validationPoints} ${pointLabel}: MAE ${report.mae === null ? "n/a" : formatNumber(report.mae, language)} ${report.unit}${report.mape === null ? "" : `, MAPE ${formatNumber(report.mape, language)}%`}`)
      : (isItalian ? "nessun punto disponibile per il test storico" : "no points available for historical testing");
    return isItalian
      ? `${report.name}: andamento ${formatDirection(report.direction, language)} dal ${report.firstDate} al ${report.lastDate} (${report.count} osservazioni); ${change}; ${validation}.`
      : `${report.name}: ${formatDirection(report.direction, language)} trend from ${report.firstDate} to ${report.lastDate} (${report.count} observations); ${change}; ${validation}.`;
  });

  const projectedSeries = analysis.reports.filter((report) => report.forecast.length > 0);
  if (projectedSeries.length) {
    findings.push(isItalian
      ? `Sono state generate proiezioni lineari per ${projectedSeries.length} serie. Sono scenari esplorativi senza intervalli di confidenza, non previsioni certificate.`
      : `Linear projections were generated for ${projectedSeries.length} series. They are exploratory scenarios without confidence intervals, not certified forecasts.`);
  }

  const strongestCorrelation = analysis.correlations.reduce<typeof analysis.correlations[number] | null>(
    (strongest, item) => !strongest || Math.abs(item.r) > Math.abs(strongest.r) ? item : strongest,
    null,
  );
  if (strongestCorrelation) {
    findings.push(isItalian
      ? `L'associazione più forte tra le serie è ${strongestCorrelation.first} / ${strongestCorrelation.second} (r=${formatNumber(strongestCorrelation.r, language)}, ${strongestCorrelation.count} date comuni); non dimostra causalità.`
      : `The strongest association between series is ${strongestCorrelation.first} / ${strongestCorrelation.second} (r=${formatNumber(strongestCorrelation.r, language)}, ${strongestCorrelation.count} overlapping dates); this does not establish causality.`);
  }

  if (analysis.factorModel) {
    findings.push(isItalian
      ? `Il modello fattoriale sul target ${analysis.factorModel.target} usa ${analysis.factorModel.count} osservazioni${analysis.factorModel.r2 === null ? "" : ` (R² ${formatNumber(analysis.factorModel.r2, language)})`}.${analysis.factorModel.warning ? ` ${analysis.factorModel.warning}` : ""}`
      : `The factor model for target ${analysis.factorModel.target} uses ${analysis.factorModel.count} observations${analysis.factorModel.r2 === null ? "" : ` (R² ${formatNumber(analysis.factorModel.r2, language)})`}.${analysis.factorModel.warning ? ` ${analysis.factorModel.warning}` : ""}`);
  }

  const warnings = [...new Set(analysis.reports.flatMap((report) => report.warnings))].slice(0, 3);
  if (warnings.length) {
    findings.push(isItalian
      ? `Avvertenze rilevate: ${warnings.join(" ")}`
      : `Warnings identified: ${warnings.join(" ")}`);
  }

  return {
    title: isItalian ? "Valutazione tecnica orientativa (automatica)" : "Automated technical assessment",
    content: [
      isItalian
        ? `L'analisi esplorativa comprende ${analysis.reports.length} serie e ${totalObservations} osservazioni complessive.`
        : `This exploratory analysis covers ${analysis.reports.length} series and ${totalObservations} observations in total.`,
      ...findings,
      isItalian
        ? "Sintesi automatizzata basata sui risultati mostrati; non è una perizia firmata né una certificazione. Le proiezioni non garantiscono risultati futuri e le correlazioni non dimostrano causalità."
        : "Automated summary based on the displayed results; it is not a signed expert opinion or certification. Projections do not guarantee future outcomes, and correlations do not establish causality.",
    ].join("\n\n"),
  };
}
