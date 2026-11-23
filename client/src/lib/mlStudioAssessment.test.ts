import { describe, expect, it } from "vitest";
import {
  createMlAssessment,
  getMlStudioLanguage,
  localizeMlModelName,
  localizeMlWarning,
} from "./mlStudioAssessment";

describe("createMlAssessment", () => {
  it("localizes model names in English assessments", () => {
    expect(localizeMlModelName("SVM lineare", "en")).toBe("Linear SVM");
    expect(localizeMlModelName("SVM lineare", "it")).toBe("SVM lineare");
  });

  it("localizes backend warnings without changing Italian output", () => {
    const warnings = [
      [
        "Metriche calcolate su un singolo split casuale 80/20; non sono una validazione indipendente.",
        "Metrics are based on a single random 80/20 split; this is not independent validation.",
      ],
      [
        "La rete MLP e un modello neurale tabellare leggero, addestrato entro limiti CPU; non equivale a CNN o a un modello di deep learning per immagini.",
        "The MLP is a lightweight tabular neural network trained under CPU limits; it is not an image CNN or image deep-learning model.",
      ],
      [
        "Le associazioni predittive non dimostrano causalita; controlla leakage, sbilanciamento e qualita delle etichette.",
        "Predictive associations do not demonstrate causality; check for leakage, class imbalance, and label quality.",
      ],
      [
        "La rete MLP non ha raggiunto la convergenza entro il limite CPU; interpreta le sue metriche con cautela.",
        "The MLP did not converge within the CPU limit; interpret its metrics with caution.",
      ],
    ];

    for (const [italian, english] of warnings) {
      expect(localizeMlWarning(italian, "en")).toBe(english);
      expect(localizeMlWarning(italian, "it")).toBe(italian);
    }
  });

  it("explains classification performance and test-set limitations", () => {
    const assessment = createMlAssessment(
      {
        task: "classification",
        target: "purchased",
        usableRows: 100,
        testRows: 20,
        models: [
          {
            name: "Random Forest",
            macroF1: 0.9,
            balancedAccuracy: 0.88,
            confusionMatrix: [
              [12, 1],
              [1, 6],
            ],
          },
        ],
        bestModel: "Random Forest",
        classLabels: ["no", "yes"],
        featureImportance: [{ name: "income", importance: 0.7 }],
        warnings: [],
      },
      "en"
    );

    expect(assessment.summary).toContain("macro F1 0.9");
    expect(assessment.findings.join(" ")).toContain(
      "18 correct predictions out of 20"
    );
    expect(assessment.findings.join(" ")).toContain("single random split");
    expect(assessment.disclaimer).toContain("not a certification");
  });

  it("flags regression below the mean-prediction baseline", () => {
    const assessment = createMlAssessment(
      {
        task: "regression",
        target: "sales",
        usableRows: 50,
        testRows: 10,
        models: [{ name: "Ridge", r2: -0.2, mae: 12, rmse: 15 }],
        bestModel: "Ridge",
        classLabels: [],
        featureImportance: [],
        warnings: [],
      },
      "it"
    );

    expect(assessment.summary).toContain(
      "nelle unita della variabile obiettivo"
    );
    expect(assessment.findings[0]).toContain("R² negativo");
  });

  it("localizes Spanish assessments and formats decimal values by locale", () => {
    const assessment = createMlAssessment(
      {
        task: "classification",
        target: "comprado",
        usableRows: 1234,
        testRows: 247,
        models: [{ name: "SVM lineare", macroF1: 0.875, balancedAccuracy: 0.8125 }],
        bestModel: "SVM lineare",
        classLabels: [],
        featureImportance: [],
        warnings: [],
      },
      "es"
    );

    expect(assessment.title).toBe("Evaluación técnica automática");
    expect(assessment.summary).toContain("SVM lineal");
    expect(assessment.summary).toContain("0,875");
    expect(assessment.findings.join(" ")).toContain("validación cruzada");
    expect(localizeMlWarning(
      "Metriche calcolate su un singolo split casuale 80/20; non sono una validazione indipendente.",
      "es"
    )).toContain("partición aleatoria");
  });

  it("localizes Russian regression assessments, warnings, and locale number formatting", () => {
    const assessment = createMlAssessment(
      {
        task: "regression",
        target: "выручка",
        usableRows: 1234,
        testRows: 247,
        models: [{ name: "Ridge", r2: -0.25, mae: 12.5, rmse: 15.75 }],
        bestModel: "Ridge",
        classLabels: [],
        featureImportance: [{ name: "цена", importance: 0.75 }],
        warnings: ["La rete MLP non ha raggiunto la convergenza entro il limite CPU."],
      },
      "ru"
    );

    expect(assessment.title).toBe("Автоматическая техническая оценка");
    expect(assessment.summary).toContain("12,5");
    expect(assessment.findings.join(" ")).toContain("Отрицательный R²");
    expect(assessment.findings.join(" ")).toContain("не достигла сходимости");
    expect(localizeMlWarning(
      "Le associazioni predittive non dimostrano causalita; controlla leakage, sbilanciamento e qualita delle etichette.",
      "ru"
    )).toContain("не доказывают причинность");
  });

  it("falls back to English for unsupported writing systems", () => {
    for (const language of ["zh", "ja", "ko", "ar", "hi"]) {
      expect(getMlStudioLanguage(language)).toBe("en");
    }
    expect(createMlAssessment({
      task: "classification",
      target: "label",
      usableRows: 10,
      testRows: 2,
      models: [{ name: "Random Forest", macroF1: 0.5, balancedAccuracy: 0.5 }],
      bestModel: "Random Forest",
      classLabels: [],
      featureImportance: [],
      warnings: [],
    }, "zh").title).toBe("Automated technical assessment");
  });

  it("recognizes all supported Latin and Cyrillic locales", () => {
    for (const language of ["en", "it", "es", "fr", "de", "pt", "ru", "pl", "nl", "tr", "sv", "da", "no", "fi", "uk", "cs"]) {
      expect(getMlStudioLanguage(language)).toBe(language);
    }
  });
});
