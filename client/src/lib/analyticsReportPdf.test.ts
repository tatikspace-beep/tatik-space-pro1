import { describe, expect, it } from "vitest";
import { createAnalyticsReportPdf } from "./analyticsReportPdf";

const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==";

describe("createAnalyticsReportPdf", () => {
  it("includes image, chart, and confusion-matrix pages in the generated report", () => {
    const report = createAnalyticsReportPdf("Test report", "Aggregated results.", [
      { type: "image", title: "Classified map", dataUrl: pixel, caption: "Preview image." },
      {
        type: "chart",
        title: "Model comparison",
        chartType: "bar",
        orientation: "horizontal",
        categories: ["Random Forest", "SVM"],
        series: [
          { name: "Accuracy", values: [0.93, 0.9] },
          { name: "Macro F1", values: [0.92, 0.89] },
        ],
        minValue: 0,
        maxValue: 1,
      },
      {
        type: "matrix",
        title: "Confusion matrix",
        rowLabels: ["setosa", "versicolor"],
        columnLabels: ["setosa", "versicolor"],
        values: [[8, 1], [0, 9]],
      },
    ]);

    expect(report.getNumberOfPages()).toBe(4);
    const bytes = report.output("arraybuffer");
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(2_000);
  });
});
