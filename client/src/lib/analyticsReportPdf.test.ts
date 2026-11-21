import { describe, expect, it } from "vitest";
import { createAnalyticsReportPdf } from "./analyticsReportPdf";

const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==";

describe("createAnalyticsReportPdf", () => {
  it("includes image, chart, and confusion-matrix pages in the generated report", () => {
    const report = createAnalyticsReportPdf("Test report", "Aggregated results.", [
      {
        type: "image",
        title: "Classified map",
        dataUrl: pixel,
        caption: "Preview image.",
        legend: [{ label: "Vegetation", color: "#16a34a" }],
      },
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

    expect(report.getNumberOfPages()).toBe(3);
    const bytes = report.output("arraybuffer");
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(2_000);
  });

  it("groups compact charts on a shared visual-results page", () => {
    const chart = (title: string) => ({
      type: "chart" as const,
      title,
      chartType: "bar" as const,
      orientation: "horizontal" as const,
      categories: ["Model A", "Model B"],
      series: [{ name: "Accuracy", values: [0.92, 0.88] }],
      minValue: 0,
      maxValue: 1,
    });
    const report = createAnalyticsReportPdf(
      "Compact report",
      "Dataset: sample.csv\nRows: 120\n\nSummary:\nAccuracy: 0.92",
      [chart("Accuracy"), chart("Balanced accuracy"), chart("Macro F1")],
    );

    expect(report.getNumberOfPages()).toBe(2);
    expect(new TextDecoder().decode(report.output("arraybuffer").slice(0, 5))).toBe("%PDF-");
  });

  it("places the optional conclusion after the visual results", () => {
    const report = createAnalyticsReportPdf(
      "Technical report",
      "Aggregated results.",
      [{
        type: "chart",
        title: "Visual result marker",
        chartType: "bar",
        categories: ["Random Forest", "SVM"],
        series: [{ name: "Macro F1", values: [0.7, 0.6] }],
      }],
      { title: "Technical assessment", content: "Closing assessment marker." },
    );
    const output = new TextDecoder().decode(report.output("arraybuffer"));

    expect(output.indexOf("Visual result marker")).toBeGreaterThanOrEqual(0);
    expect(output.indexOf("Closing assessment marker.")).toBeGreaterThan(output.indexOf("Visual result marker"));
  });
});
