import { describe, expect, it } from "vitest";
import type { StatisticalAnalysis } from "../../../server/data-insight";
import type { AnalyticsReportLanguage } from "./analyticsReportPdf";
import {
  createStatisticalAssessment,
  localizeStatisticalCorrelationInterpretation,
  localizeStatisticalDirection,
  localizeStatisticalSeriesLabel,
  localizeStatisticalText,
  localizeStatisticalUnit,
} from "./statisticalAssessment";

const analysis: StatisticalAnalysis = {
  question: "",
  reports: [
    {
      name: "GDP",
      unit: "USD",
      source: "World Bank",
      count: 8,
      firstDate: "2017-01-01",
      lastDate: "2024-01-01",
      direction: "crescente",
      changePercent: 12.5,
      forecast: [{ date: "2025-01-01", value: 130 }],
      validation: [{ date: "2024-01-01", actual: 120, predicted: 118 }],
      mae: 2,
      mape: 1.67,
      warnings: ["Estrapolazione lineare sensibile a shock."],
    },
  ],
  correlations: [
    {
      first: "GDP",
      second: "Population",
      r: 0.8,
      count: 8,
      interpretation: "associazione positiva",
    },
  ],
  factorModel: null,
  disclaimer: "Le correlazioni non dimostrano causalità.",
};

describe("createStatisticalAssessment", () => {
  it("summarizes measured trends and validation while qualifying projections and correlation", () => {
    const conclusion = createStatisticalAssessment(analysis, "it");

    expect(conclusion.title).toContain("automatica");
    expect(conclusion.content).toContain("12,5%");
    expect(conclusion.content).toContain("test storico su 1 punto");
    expect(conclusion.content).toContain("non previsioni certificate");
    expect(conclusion.content).toContain("non dimostra causalità");
  });

  it("does not claim a historical test when no validation points exist", () => {
    const conclusion = createStatisticalAssessment(
      {
        ...analysis,
        reports: [
          {
            ...analysis.reports[0],
            validation: [],
            mae: null,
            mape: null,
            forecast: [],
          },
        ],
        correlations: analysis.correlations,
      },
      "en"
    );

    expect(conclusion.content).toContain(
      "no points available for historical testing"
    );
    expect(conclusion.content).not.toContain("historical test on");
    expect(conclusion.content).toContain(
      "Linear extrapolation is sensitive to shocks."
    );
    expect(conclusion.content).toContain("positive association");
    expect(conclusion.content).toContain("not a signed expert opinion");
  });

  it("translates complete service warnings and correlation interpretations", () => {
    expect(
      localizeStatisticalText(
        "Estrapolazione lineare sensibile a shock, stagionalità e cambi di regime.",
        "en"
      )
    ).toBe(
      "Linear extrapolation is sensitive to shocks, seasonality, and regime changes."
    );
    expect(
      localizeStatisticalText(
        "Associazione osservata sulle date comuni; non implica causalità.",
        "en"
      )
    ).toBe(
      "Association observed on overlapping dates; it does not imply causality."
    );
    expect(
      localizeStatisticalText(
        "Coefficienti associativi condizionati agli altri fattori selezionati; non dimostrano causalità e possono essere instabili con pochi dati o variabili collineari.",
        "en"
      )
    ).toBe(
      "Association coefficients are conditional on the other selected factors; they do not prove causality and may be unstable with few observations or collinear variables."
    );
    expect(
      localizeStatisticalText(
        "Valutazione statistica locale in Python, non un agente LLM. Le correlazioni non dimostrano causalita; le proiezioni lineari non sono previsioni certificate.",
        "en"
      )
    ).toBe(
      "Local statistical assessment in Python, not an LLM agent. Correlations do not establish causality; linear projections are not certified forecasts."
    );
  });

  it("keeps test-result directions and correlation explanations in one language", () => {
    expect(localizeStatisticalDirection("crescente", "en")).toBe("rising");
    expect(
      localizeStatisticalCorrelationInterpretation(
        "Associazione osservata sulle date comuni; non implica causalità.",
        "en"
      )
    ).toBe(
      "Association observed on overlapping dates; it does not imply causality."
    );
    expect(
      localizeStatisticalCorrelationInterpretation(
        "associazione positiva",
        "en"
      )
    ).toBe("positive association; it does not establish causality.");
  });

  it("localizes provider labels, series names, units, and association findings", () => {
    const localized = createStatisticalAssessment(
      {
        ...analysis,
        reports: [
          {
            ...analysis.reports[0],
            name: "Banca Mondiale PIL (USD correnti) · ITA",
            unit: "unità",
          },
        ],
        correlations: [
          {
            ...analysis.correlations[0],
            first: "Banca Mondiale PIL (USD correnti) · ITA",
            interpretation:
              "Associazione osservata sulle date comuni; non implica causalità.",
          },
        ],
      },
      "en"
    );

    expect(
      localizeStatisticalSeriesLabel(
        "Banca Mondiale PIL (USD correnti) · ITA",
        "en"
      )
    ).toBe("World Bank GDP (current USD) · ITA");
    expect(localizeStatisticalUnit("unità", "en")).toBe("units");
    expect(localized.content).toContain("World Bank GDP (current USD) · ITA");
    expect(localized.content).toContain(
      "Association observed on overlapping dates; it does not imply causality."
    );
    expect(localized.content).not.toContain("Banca Mondiale");
    expect(localized.content).not.toContain("non implica causalità");
  });

  it("localizes the GDP-share unit in every supported language", () => {
    const units: Record<AnalyticsReportLanguage, string> = {
      en: "% GDP",
      it: "% PIL",
      es: "% PIB",
      fr: "% PIB",
      de: "% BIP",
      pt: "% PIB",
      ru: "% ВВП",
      pl: "% PKB",
      nl: "% bbp",
      tr: "% GSYH",
      sv: "% av BNP",
      da: "% af BNP",
      no: "% av BNP",
      fi: "% BKT:sta",
      uk: "% ВВП",
      cs: "% HDP",
    } as const;

    for (const [language, unit] of Object.entries(units)) {
      expect(
        localizeStatisticalUnit("% PIL", language as AnalyticsReportLanguage)
      ).toBe(unit);
    }
  });

  it("localizes factor warnings and disclaimer in English assessments", () => {
    const localized = createStatisticalAssessment(
      {
        ...analysis,
        reports: [
          {
            ...analysis.reports[0],
            name: "Banca Mondiale PIL (USD correnti) · ITA",
            warnings: ["Estrapolazione lineare sensibile a shock."],
          },
        ],
        correlations: [
          {
            ...analysis.correlations[0],
            first: "Banca Mondiale PIL (USD correnti) · ITA",
            interpretation:
              "Associazione osservata sulle date comuni; non implica causalità.",
          },
        ],
        factorModel: {
          target: "Banca Mondiale PIL (USD correnti) · ITA",
          count: 3,
          r2: 0.49,
          warning:
            "Coefficienti associativi condizionati agli altri fattori selezionati; non dimostrano causalità e possono essere instabili con pochi dati o variabili collineari.",
        },
      },
      "en"
    );

    expect(localized.content).toContain(
      "Association coefficients are conditional"
    );
    expect(localized.content).toContain("World Bank GDP (current USD) · ITA");
    expect(localized.content).not.toContain("Coefficienti associativi");
    expect(localized.content).not.toContain("Associazione osservata");
  });

  it("localizes the complete assessment and official provider series in Spanish", () => {
    const localized = createStatisticalAssessment(
      {
        ...analysis,
        reports: [
          {
            ...analysis.reports[0],
            name: "Banca Mondiale PIL (USD correnti)",
            source: "Banca Mondiale",
            warnings: [
              "Estrapolazione lineare sensibile a shock, stagionalità e cambi di regime.",
            ],
          },
        ],
        correlations: [
          {
            ...analysis.correlations[0],
            first: "Banca Mondiale PIL (USD correnti)",
            interpretation: "associazione positiva",
          },
        ],
      },
      "es"
    );

    expect(localized.title).toBe("Evaluación técnica orientativa (automática)");
    expect(localized.content).toContain(
      "Banco Mundial PIB (USD actuales): tendencia ascendente"
    );
    expect(localized.content).toContain("12,5%");
    expect(localized.content).toContain("prueba histórica en 1 punto");
    expect(localized.content).toContain("impactos, la estacionalidad");
    expect(localized.content).toContain("asociación positiva");
    expect(localized.content).toContain("no demuestra causalidad");
    expect(localized.content).toContain("no es un dictamen firmado");
  });

  it("localizes the complete assessment and locale-formatted numbers in Russian", () => {
    const localized = createStatisticalAssessment(
      {
        ...analysis,
        reports: [
          {
            ...analysis.reports[0],
            name: "Banca Mondiale PIL (USD correnti)",
            source: "Banca Mondiale",
            warnings: ["Estrapolazione lineare sensibile a shock."],
          },
        ],
        correlations: [],
        factorModel: {
          target: "Banca Mondiale PIL (USD correnti)",
          count: 8,
          r2: 0.875,
          warning:
            "Coefficienti associativi condizionati agli altri fattori selezionati; non dimostrano causalità e possono essere instabili con pochi dati o variabili collineari.",
        },
      },
      "ru"
    );

    expect(localized.title).toBe("Автоматическая техническая оценка");
    expect(localized.content).toContain(
      "Всемирный банк ВВП (в текущих долларах США)"
    );
    expect(localized.content).toContain("12,5%");
    expect(localized.content).toContain("0,88");
    expect(localized.content).toContain("Линейная экстраполяция");
    expect(localized.content).toContain("Факторная модель");
    expect(localized.content).toContain("не доказывают причинность");
  });

  it("preserves user-provided series names when localizing assessment text", () => {
    const customName = "Banca Mondiale PIL (USD correnti) custom label";
    const localized = createStatisticalAssessment(
      {
        ...analysis,
        reports: [
          {
            ...analysis.reports[0],
            name: customName,
            source: "World Bank",
            forecast: [],
          },
        ],
        correlations: [],
      },
      "es",
      new Set()
    );

    expect(localized.content).toContain(`${customName}: tendencia`);
  });
});
