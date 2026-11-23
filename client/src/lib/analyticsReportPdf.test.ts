import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  createAnalyticsReportPdf,
  resolveAnalyticsReportLanguage,
} from "./analyticsReportPdf";

const pixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==";
let reportFont: Uint8Array;

beforeAll(async () => {
  reportFont = new Uint8Array(
    await readFile(new URL("../../public/fonts/NotoSans.ttf", import.meta.url))
  );
  vi.stubGlobal(
    "fetch",
    async () => new Response(reportFont, { status: 200 })
  );
});

afterAll(() => vi.unstubAllGlobals());

type PdfDocument = Awaited<ReturnType<typeof createAnalyticsReportPdf>>;

function getPdfPageStreams(pdf: PdfDocument) {
  const output = new TextDecoder("windows-1252").decode(
    pdf.output("arraybuffer")
  );
  const contentReferences = [
    ...output.matchAll(/\/Type \/Page\b[\s\S]*?\/Contents (\d+) 0 R/g),
  ].map(match => match[1]);
  return contentReferences.map(reference => {
    const stream = output.match(
      new RegExp(
        `${reference} 0 obj\\n<<\\n/Length \\d+\\n>>\\nstream\\n([\\s\\S]*?)\\nendstream`
      )
    );
    return stream?.[1] ?? "";
  });
}

describe("createAnalyticsReportPdf", () => {
  it("preserves supported Latin and Cyrillic report languages", () => {
    expect(resolveAnalyticsReportLanguage("es")).toBe("es");
    expect(resolveAnalyticsReportLanguage("ru")).toBe("ru");
    expect(resolveAnalyticsReportLanguage("uk")).toBe("uk");
    expect(resolveAnalyticsReportLanguage("zh")).toBe("en");
  });

  it("includes image, chart, and confusion-matrix pages in the generated report", async () => {
    const report = await createAnalyticsReportPdf(
      "Test report",
      "Aggregated results.",
      [
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
          values: [
            [8, 1],
            [0, 9],
          ],
        },
      ]
    );

    expect(report.getNumberOfPages()).toBe(3);
    const bytes = report.output("arraybuffer");
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(2_000);
  });

  it("groups compact charts on a shared visual-results page", async () => {
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
    const report = await createAnalyticsReportPdf(
      "Compact report",
      "Dataset: sample.csv\nRows: 120\n\nSummary:\nAccuracy: 0.92",
      [chart("Accuracy"), chart("Balanced accuracy"), chart("Macro F1")]
    );

    expect(report.getNumberOfPages()).toBe(2);
    expect(
      new TextDecoder().decode(report.output("arraybuffer").slice(0, 5))
    ).toBe("%PDF-");
  });

  it("places the optional conclusion after the visual results", async () => {
    const report = await createAnalyticsReportPdf(
      "Technical report",
      "Aggregated results.",
      [
        {
          type: "chart",
          title: "Visual result marker",
          chartType: "bar",
          categories: ["Random Forest", "SVM"],
          series: [{ name: "Macro F1", values: [0.7, 0.6] }],
        },
      ],
      { title: "Technical assessment", content: "Closing assessment marker." }
    );
    const output = new TextDecoder().decode(report.output("arraybuffer"));

    expect(output.indexOf("Visual result marker")).toBeGreaterThanOrEqual(0);
    expect(output.indexOf("Closing assessment marker.")).toBeGreaterThan(
      output.indexOf("Visual result marker")
    );
  });

  it("moves the final chart to share its page with a conclusion when needed", async () => {
    const content = Array.from(
      { length: 18 },
      (_, index) => `Detailed observation ${index + 1} provides context.`
    ).join("\n");
    const closingMarker =
      "Final assessment detail remains with the final chart.";
    const conclusion =
      Array.from(
        { length: 8 },
        (_, index) =>
          `Finding ${index + 1} explains the test results and limitations in enough detail to wrap across multiple lines on the page.`
      ).join("\n\n") + `\n\n${closingMarker}`;
    const report = await createAnalyticsReportPdf(
      "Technical report",
      content,
      [
        {
          type: "chart",
          title: "Final chart marker",
          chartType: "line",
          categories: ["2019", "2020", "2021", "2022"],
          series: [{ name: "Observed", values: [4, 5, 6, 7] }],
        },
      ],
      { title: "Technical assessment", content: conclusion }
    );
    const pages = getPdfPageStreams(report);
    const closingPage = pages.find(page => page.includes(closingMarker));

    expect(pages).toHaveLength(2);
    expect(closingPage).toContain("Final chart marker");
  });

  it("preserves long chart legend labels and localizes shared PDF headings", async () => {
    const report = await createAnalyticsReportPdf(
      "ML report",
      "Dataset: sample.csv",
      [
        {
          type: "chart",
          title: "Model comparison",
          chartType: "bar",
          categories: ["Model A", "Model B"],
          series: [
            {
              name: "Most influential variables (Random Forest)",
              values: [0.8, 0.6],
            },
          ],
        },
      ],
      undefined,
      "en"
    );
    const output = new TextDecoder("windows-1252").decode(
      report.output("arraybuffer")
    );

    expect(output).toContain("Most influential variables \\(Random Forest\\)");
    expect(output).toContain("ANALYTICAL REPORT");
    expect(output).toContain("Results and interpretation");

    const italianOutput = new TextDecoder("windows-1252").decode(
      (
        await createAnalyticsReportPdf(
        "Rapporto ML",
        "Risultati aggregati.",
        [],
        undefined,
        "it"
        )
      )
        .output("arraybuffer")
    );
    expect(italianOutput).toContain("REPORT ANALITICO");
    expect(italianOutput).toContain("Risultati e interpretazione");
    expect(italianOutput).not.toContain("ANALYTICAL REPORT");
  });

  it("uses the selected Latin or Cyrillic language for PDF headings and numbers", async () => {
    const spanishReport = await createAnalyticsReportPdf(
      "Informe",
      "Resultado",
      [],
      undefined,
      "es"
    );
    const spanishOutput = new TextDecoder("windows-1252").decode(
      spanishReport.output("arraybuffer")
    );
    expect(spanishOutput).toContain("INFORME ANAL");
    expect(spanishOutput).toContain("Resultados e interpretación");

    const russianReport = await createAnalyticsReportPdf(
        "Отчёт",
        "Результаты",
        [],
        undefined,
        "ru"
    );
    const russianOutput = new TextDecoder("windows-1252").decode(
      russianReport.output("arraybuffer")
    );
    expect(russianOutput).toContain("/FontFile2");
    expect(russianOutput).toContain("/ToUnicode");
    expect(russianOutput).toContain("<0420>");
    expect(russianOutput).toContain("<0435>");
  });
});
