import { describe, expect, it } from "vitest";
import type { StatisticalAnalysis } from "../../../server/data-insight";
import { createStatisticalAssessment } from "./statisticalAssessment";

const analysis: StatisticalAnalysis = {
  question: "",
  reports: [{
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
  }],
  correlations: [{
    first: "GDP",
    second: "Population",
    r: 0.8,
    count: 8,
    interpretation: "associazione positiva",
  }],
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
    const conclusion = createStatisticalAssessment({
      ...analysis,
      reports: [{ ...analysis.reports[0], validation: [], mae: null, mape: null, forecast: [] }],
      correlations: [],
    }, "en");

    expect(conclusion.content).toContain("no points available for historical testing");
    expect(conclusion.content).not.toContain("historical test on");
    expect(conclusion.content).toContain("not a signed expert opinion");
  });
});
