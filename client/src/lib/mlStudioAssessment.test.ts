import { describe, expect, it } from "vitest";
import { createMlAssessment } from "./mlStudioAssessment";

describe("createMlAssessment", () => {
  it("explains classification performance and test-set limitations", () => {
    const assessment = createMlAssessment({
      task: "classification",
      target: "purchased",
      usableRows: 100,
      testRows: 20,
      models: [{
        name: "Random Forest",
        macroF1: 0.9,
        balancedAccuracy: 0.88,
        confusionMatrix: [[12, 1], [1, 6]],
      }],
      bestModel: "Random Forest",
      classLabels: ["no", "yes"],
      featureImportance: [{ name: "income", importance: 0.7 }],
      warnings: [],
    }, "en");

    expect(assessment.summary).toContain("macro F1 0.9");
    expect(assessment.findings.join(" ")).toContain("18 correct predictions out of 20");
    expect(assessment.findings.join(" ")).toContain("single random split");
    expect(assessment.disclaimer).toContain("not a certification");
  });

  it("flags regression below the mean-prediction baseline", () => {
    const assessment = createMlAssessment({
      task: "regression",
      target: "sales",
      usableRows: 50,
      testRows: 10,
      models: [{ name: "Ridge", r2: -0.2, mae: 12, rmse: 15 }],
      bestModel: "Ridge",
      classLabels: [],
      featureImportance: [],
      warnings: [],
    }, "it");

    expect(assessment.summary).toContain("nelle unita della variabile obiettivo");
    expect(assessment.findings[0]).toContain("R² negativo");
  });
});
