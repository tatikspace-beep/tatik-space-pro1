export type MlAssessmentLanguage = "it" | "en";

type AssessmentModel = {
  name: string;
  accuracy?: number;
  balancedAccuracy?: number;
  macroF1?: number;
  r2?: number;
  mae?: number;
  rmse?: number;
  confusionMatrix?: number[][];
};

export type MlAssessmentResult = {
  task: "classification" | "regression";
  target: string;
  usableRows: number;
  testRows: number;
  models: AssessmentModel[];
  bestModel: string;
  classLabels: string[];
  featureImportance: Array<{ name: string; importance: number }>;
  warnings: string[];
};

function formatMetric(value: number | undefined, language: MlAssessmentLanguage) {
  return value === undefined
    ? "—"
    : value.toLocaleString(language === "it" ? "it-IT" : "en-US", { maximumFractionDigits: 3 });
}

export function createMlAssessment(result: MlAssessmentResult, language: MlAssessmentLanguage) {
  const isItalian = language === "it";
  const best = result.models.find((model) => model.name === result.bestModel) ?? result.models[0];

  if (!best) {
    return {
      title: isItalian ? "Lettura tecnica automatica" : "Automated technical assessment",
      summary: isItalian ? "Non ci sono metriche da interpretare." : "There are no metrics to interpret.",
      findings: [],
      disclaimer: isItalian
        ? "Questa lettura automatica non è una certificazione né un parere professionale firmato."
        : "This automated assessment is not a certification or a signed professional opinion.",
    };
  }

  const findings = isItalian
    ? [
      `Valutazione su ${result.testRows} osservazioni di test, estratte da ${result.usableRows} righe utilizzabili. Un solo split casuale non quantifica la variabilità delle metriche: ripeti la valutazione con cross-validation e un test indipendente.`,
      "Prima dell'uso operativo, verifica qualità delle etichette, sbilanciamento delle classi, leakage e costo degli errori nel tuo settore.",
    ]
    : [
      `Evaluation used ${result.testRows} test observations from ${result.usableRows} usable rows. A single random split does not quantify metric variability: repeat with cross-validation and an independent test set.`,
      "Before operational use, check label quality, class imbalance, data leakage, and the cost of errors in your domain.",
    ];

  let summary: string;
  if (result.task === "classification") {
    summary = isItalian
      ? `${best.name} ha ottenuto il risultato migliore tra i modelli confrontati sul test: F1 macro ${formatMetric(best.macroF1, language)} e accuratezza bilanciata ${formatMetric(best.balancedAccuracy, language)}.`
      : `${best.name} scored highest among the compared models on this test: macro F1 ${formatMetric(best.macroF1, language)} and balanced accuracy ${formatMetric(best.balancedAccuracy, language)}.`;

    const matrix = best.confusionMatrix ?? [];
    if (matrix.length) {
      const correct = matrix.reduce((sum, row, index) => sum + (row[index] ?? 0), 0);
      const total = matrix.reduce((sum, row) => sum + row.reduce((rowSum, count) => rowSum + count, 0), 0);
      if (total) {
        findings.unshift(isItalian
          ? `La matrice di confusione mostra ${correct} previsioni corrette su ${total} nel test; controlla gli errori per classe, soprattutto se i costi degli errori sono diversi.`
          : `The confusion matrix shows ${correct} correct predictions out of ${total} in the test set; inspect per-class errors, especially when error costs differ.`);
      }
    }
  } else {
    summary = isItalian
      ? `${best.name} ha ottenuto il MAE piu basso tra i modelli confrontati: ${formatMetric(best.mae, language)} (nelle unita della variabile obiettivo “${result.target}”); RMSE ${formatMetric(best.rmse, language)}, R² ${formatMetric(best.r2, language)}.`
      : `${best.name} achieved the lowest MAE among compared models: ${formatMetric(best.mae, language)} (in the units of target “${result.target}”); RMSE ${formatMetric(best.rmse, language)}, R² ${formatMetric(best.r2, language)}.`;

    if (best.r2 !== undefined && best.r2 < 0) {
      findings.unshift(isItalian
        ? "R² negativo: su questo test il modello è andato peggio della baseline che predice la media del target."
        : "Negative R²: on this test, the model performed worse than a baseline that predicts the target mean.");
    }
  }

  const leadingFeature = result.featureImportance[0];
  if (leadingFeature) {
    findings.push(isItalian
      ? `La Random Forest attribuisce il maggior peso a “${leadingFeature.name}” (${formatMetric(leadingFeature.importance, language)}); l'importanza descrive un'associazione predittiva, non causalità.`
      : `Random Forest assigns the highest importance to “${leadingFeature.name}” (${formatMetric(leadingFeature.importance, language)}); importance describes predictive association, not causality.`);
  }

  if (result.warnings.some((warning) => warning.toLowerCase().includes("non ha raggiunto la convergenza"))) {
    findings.push(isItalian
      ? "La rete MLP non ha raggiunto la convergenza entro il limite CPU; non interpretarne il punteggio come confronto definitivo."
      : "The MLP did not converge within the CPU limit; do not treat its score as a definitive comparison.");
  }

  return {
    title: isItalian ? "Lettura tecnica automatica" : "Automated technical assessment",
    summary,
    findings,
    disclaimer: isItalian
      ? "Indicazione automatica basata solo sui risultati mostrati: non è una certificazione, un audit indipendente o un parere professionale firmato. Per decisioni rilevanti, richiedi la revisione di un professionista del settore."
      : "Automated guidance based only on the results shown: it is not a certification, independent audit, or signed professional opinion. For consequential decisions, seek review by a qualified domain professional.",
  };
}
