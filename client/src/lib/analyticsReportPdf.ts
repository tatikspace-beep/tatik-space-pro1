import { jsPDF } from "jspdf";

export type AnalyticsReportChartSeries = {
  name: string;
  values: Array<number | null>;
  color?: string;
  dashed?: boolean;
};

export type AnalyticsReportVisual =
  | {
      type: "image";
      title: string;
      dataUrl: string;
      caption?: string;
    }
  | {
      type: "chart";
      title: string;
      chartType: "bar" | "line";
      orientation?: "horizontal" | "vertical";
      categories: string[];
      series: AnalyticsReportChartSeries[];
      minValue?: number;
      maxValue?: number;
    }
  | {
      type: "matrix";
      title: string;
      rowLabels: string[];
      columnLabels: string[];
      values: number[][];
    };

const margin = 14;
const defaultColors = ["#2563eb", "#16a34a", "#f59e0b", "#9333ea", "#db2777", "#0891b2"];

function rgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized;
  if (!/^[\da-f]{6}$/i.test(value)) return [37, 99, 235];
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function colorForSeries(index: number, color?: string): [number, number, number] {
  return rgb(color ?? defaultColors[index % defaultColors.length]);
}

function formatNumber(value: number) {
  return value.toLocaleString("it-IT", { maximumFractionDigits: 2 });
}

function truncate(value: string, maximum = 24) {
  return value.length > maximum ? `${value.slice(0, maximum - 3)}...` : value;
}

function getDomain(
  visual: Extract<AnalyticsReportVisual, { type: "chart" }>,
  values: number[],
): [number, number] {
  let minimum = visual.minValue ?? (visual.chartType === "bar" ? Math.min(0, ...values) : Math.min(...values));
  let maximum = visual.maxValue ?? Math.max(...values);
  if (!Number.isFinite(minimum)) minimum = 0;
  if (!Number.isFinite(maximum)) maximum = 1;
  if (minimum === maximum) {
    const padding = Math.abs(minimum) * 0.1 || 1;
    minimum -= padding;
    maximum += padding;
  }
  return [minimum, maximum];
}

function addLegend(pdf: jsPDF, visual: Extract<AnalyticsReportVisual, { type: "chart" }>, y: number) {
  pdf.setFontSize(8);
  let x = margin;
  for (const [index, item] of visual.series.entries()) {
    const [red, green, blue] = colorForSeries(index, item.color);
    pdf.setDrawColor(red, green, blue);
    pdf.setLineWidth(1.2);
    if (item.dashed) pdf.setLineDashPattern([1.5, 1], 0);
    pdf.line(x, y - 1, x + 7, y - 1);
    pdf.setLineDashPattern([], 0);
    pdf.setTextColor(45, 55, 72);
    const label = truncate(item.name, 28);
    pdf.text(label, x + 9, y);
    x += 13 + pdf.getTextWidth(label);
    if (x > pdf.internal.pageSize.getWidth() - margin - 35) {
      x = margin;
      y += 6;
    }
  }
}

function addVerticalBarChart(
  pdf: jsPDF,
  visual: Extract<AnalyticsReportVisual, { type: "chart" }>,
  top: number,
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const plotX = margin + 16;
  const plotY = top + 14;
  const plotWidth = pageWidth - margin - plotX;
  const plotHeight = 78;
  const values = visual.series.flatMap((item) => item.values.filter((value): value is number => value !== null && Number.isFinite(value)));
  if (!values.length || !visual.categories.length) {
    pdf.setFontSize(9);
    pdf.text("Nessun dato numerico disponibile per il grafico.", margin, plotY + 8);
    return plotY + 16;
  }

  const [minimum, maximum] = getDomain(visual, values);
  const valueY = (value: number) => plotY + plotHeight - ((value - minimum) / (maximum - minimum)) * plotHeight;
  pdf.setFontSize(7);
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = minimum + (maximum - minimum) * tick / 4;
    const y = valueY(value);
    pdf.setDrawColor(225, 231, 239);
    pdf.setLineWidth(0.2);
    pdf.line(plotX, y, plotX + plotWidth, y);
    pdf.setTextColor(90, 100, 115);
    pdf.text(formatNumber(value), plotX - 2, y + 1, { align: "right" });
  }

  const baseline = valueY(Math.min(maximum, Math.max(minimum, 0)));
  const groupWidth = plotWidth / visual.categories.length;
  const barWidth = Math.max(1.5, Math.min(10, (groupWidth - 4) / visual.series.length));
  visual.categories.forEach((category, categoryIndex) => {
    visual.series.forEach((item, seriesIndex) => {
      const value = item.values[categoryIndex];
      if (value === null || !Number.isFinite(value)) return;
      const [red, green, blue] = colorForSeries(seriesIndex, item.color);
      const x = plotX + categoryIndex * groupWidth + (groupWidth - visual.series.length * barWidth) / 2 + seriesIndex * barWidth;
      const y = valueY(value);
      pdf.setFillColor(red, green, blue);
      pdf.rect(x, Math.min(y, baseline), barWidth - 1, Math.max(0.7, Math.abs(baseline - y)), "F");
    });
    const x = plotX + categoryIndex * groupWidth + groupWidth / 2;
    pdf.setTextColor(65, 75, 90);
    pdf.setFontSize(7);
    pdf.text(truncate(category, 16), x, plotY + plotHeight + 8, { align: "center", maxWidth: groupWidth - 1 });
  });

  return plotY + plotHeight + 18;
}

function addHorizontalBarChart(
  pdf: jsPDF,
  visual: Extract<AnalyticsReportVisual, { type: "chart" }>,
  top: number,
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const labelWidth = 48;
  const plotX = margin + labelWidth;
  const plotY = top + 14;
  const plotWidth = pageWidth - margin - plotX;
  const rowHeight = Math.min(16, Math.max(8, 140 / Math.max(1, visual.categories.length)));
  const plotHeight = rowHeight * visual.categories.length;
  const values = visual.series.flatMap((item) => item.values.filter((value): value is number => value !== null && Number.isFinite(value)));
  if (!values.length || !visual.categories.length) {
    pdf.setFontSize(9);
    pdf.text("Nessun dato numerico disponibile per il grafico.", margin, plotY + 8);
    return plotY + 16;
  }

  const [minimum, maximum] = getDomain(visual, values);
  const valueX = (value: number) => plotX + ((value - minimum) / (maximum - minimum)) * plotWidth;
  pdf.setFontSize(7);
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = minimum + (maximum - minimum) * tick / 4;
    const x = valueX(value);
    pdf.setDrawColor(225, 231, 239);
    pdf.setLineWidth(0.2);
    pdf.line(x, plotY, x, plotY + plotHeight);
    pdf.setTextColor(90, 100, 115);
    pdf.text(formatNumber(value), x, plotY - 3, { align: "center" });
  }

  const baseline = valueX(Math.min(maximum, Math.max(minimum, 0)));
  const seriesBand = rowHeight / visual.series.length;
  visual.categories.forEach((category, categoryIndex) => {
    const y = plotY + categoryIndex * rowHeight;
    pdf.setFontSize(7);
    pdf.setTextColor(65, 75, 90);
    pdf.text(truncate(category, 25), plotX - 3, y + rowHeight / 2 + 1, { align: "right", maxWidth: labelWidth - 4 });
    visual.series.forEach((item, seriesIndex) => {
      const value = item.values[categoryIndex];
      if (value === null || !Number.isFinite(value)) return;
      const [red, green, blue] = colorForSeries(seriesIndex, item.color);
      const valuePosition = valueX(value);
      pdf.setFillColor(red, green, blue);
      pdf.rect(
        Math.min(baseline, valuePosition),
        y + seriesIndex * seriesBand + 1,
        Math.max(0.7, Math.abs(valuePosition - baseline)),
        Math.max(1, seriesBand - 2),
        "F",
      );
    });
  });

  return plotY + plotHeight + 8;
}

function addLineChart(
  pdf: jsPDF,
  visual: Extract<AnalyticsReportVisual, { type: "chart" }>,
  top: number,
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const plotX = margin + 18;
  const plotY = top + 14;
  const plotWidth = pageWidth - margin - plotX;
  const plotHeight = 88;
  const values = visual.series.flatMap((item) => item.values.filter((value): value is number => value !== null && Number.isFinite(value)));
  if (!values.length || !visual.categories.length) {
    pdf.setFontSize(9);
    pdf.text("Nessun dato numerico disponibile per il grafico.", margin, plotY + 8);
    return plotY + 16;
  }

  const [minimum, maximum] = getDomain(visual, values);
  const valueY = (value: number) => plotY + plotHeight - ((value - minimum) / (maximum - minimum)) * plotHeight;
  pdf.setFontSize(7);
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = minimum + (maximum - minimum) * tick / 4;
    const y = valueY(value);
    pdf.setDrawColor(225, 231, 239);
    pdf.setLineWidth(0.2);
    pdf.line(plotX, y, plotX + plotWidth, y);
    pdf.setTextColor(90, 100, 115);
    pdf.text(formatNumber(value), plotX - 2, y + 1, { align: "right" });
  }

  const pointX = (index: number) => plotX + (visual.categories.length <= 1 ? 0 : index * plotWidth / (visual.categories.length - 1));
  visual.series.forEach((item, seriesIndex) => {
    const [red, green, blue] = colorForSeries(seriesIndex, item.color);
    pdf.setDrawColor(red, green, blue);
    pdf.setLineWidth(1);
    pdf.setLineDashPattern(item.dashed ? [2, 1.4] : [], 0);
    let previous: { x: number; y: number } | null = null;
    item.values.forEach((value, index) => {
      if (value === null || !Number.isFinite(value)) {
        previous = null;
        return;
      }
      const point = { x: pointX(index), y: valueY(value) };
      if (previous) pdf.line(previous.x, previous.y, point.x, point.y);
      previous = point;
    });
    pdf.setLineDashPattern([], 0);
  });

  const labelCount = Math.min(6, visual.categories.length);
  for (let labelIndex = 0; labelIndex < labelCount; labelIndex += 1) {
    const categoryIndex = labelCount <= 1
      ? 0
      : Math.round(labelIndex * (visual.categories.length - 1) / (labelCount - 1));
    pdf.setFontSize(7);
    pdf.setTextColor(65, 75, 90);
    pdf.text(truncate(visual.categories[categoryIndex] ?? "", 16), pointX(categoryIndex), plotY + plotHeight + 7, { align: "center" });
  }

  return plotY + plotHeight + 14;
}

function addChart(
  pdf: jsPDF,
  visual: Extract<AnalyticsReportVisual, { type: "chart" }>,
  top: number,
) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(25, 35, 50);
  pdf.text(visual.title, margin, top);
  const chartBottom = visual.chartType === "line"
    ? addLineChart(pdf, visual, top)
    : visual.orientation === "horizontal"
      ? addHorizontalBarChart(pdf, visual, top)
      : addVerticalBarChart(pdf, visual, top);
  addLegend(pdf, visual, chartBottom + 5);
}

function addMatrix(
  pdf: jsPDF,
  visual: Extract<AnalyticsReportVisual, { type: "matrix" }>,
  top: number,
) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(25, 35, 50);
  pdf.text(visual.title, margin, top);
  const labelWidth = 44;
  const availableWidth = pdf.internal.pageSize.getWidth() - margin * 2 - labelWidth;
  const cellWidth = Math.min(24, availableWidth / Math.max(1, visual.columnLabels.length));
  const rowHeight = Math.min(14, Math.max(8, 120 / Math.max(1, visual.rowLabels.length)));
  const startX = margin + labelWidth;
  const startY = top + 14;
  const maximum = Math.max(1, ...visual.values.flat());
  pdf.setFontSize(7);
  visual.columnLabels.forEach((label, index) => {
    pdf.setTextColor(55, 65, 80);
    pdf.text(truncate(label, 15), startX + index * cellWidth + cellWidth / 2, startY - 3, { align: "center", maxWidth: cellWidth });
  });
  visual.rowLabels.forEach((label, rowIndex) => {
    const y = startY + rowIndex * rowHeight;
    pdf.setTextColor(55, 65, 80);
    pdf.text(truncate(label, 25), startX - 3, y + rowHeight / 2 + 1, { align: "right", maxWidth: labelWidth - 4 });
    visual.columnLabels.forEach((_, columnIndex) => {
      const value = visual.values[rowIndex]?.[columnIndex] ?? 0;
      const intensity = Math.min(1, Math.max(0, value / maximum));
      pdf.setFillColor(219 - Math.round(120 * intensity), 234 - Math.round(90 * intensity), 254 - Math.round(35 * intensity));
      pdf.setDrawColor(255, 255, 255);
      pdf.rect(startX + columnIndex * cellWidth, y, cellWidth, rowHeight, "FD");
      pdf.setFont("helvetica", intensity > 0.55 ? "bold" : "normal");
      pdf.setTextColor(intensity > 0.55 ? 255 : 35, intensity > 0.55 ? 255 : 45, intensity > 0.55 ? 255 : 60);
      pdf.text(String(value), startX + columnIndex * cellWidth + cellWidth / 2, y + rowHeight / 2 + 1, { align: "center" });
    });
  });
}

function addImage(
  pdf: jsPDF,
  visual: Extract<AnalyticsReportVisual, { type: "image" }>,
  top: number,
) {
  const match = visual.dataUrl.match(/^data:image\/(png|jpe?g|webp);base64,/i);
  if (!match) throw new Error(`L'immagine "${visual.title}" non è incorporata nel formato supportato.`);
  const format = match[1].toLowerCase().startsWith("jp") ? "JPEG" : match[1].toUpperCase();
  const properties = pdf.getImageProperties(visual.dataUrl);
  const maximumWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  const maximumHeight = 226;
  const scale = Math.min(maximumWidth / properties.width, maximumHeight / properties.height);
  const width = properties.width * scale;
  const height = properties.height * scale;
  pdf.addImage(visual.dataUrl, format, margin + (maximumWidth - width) / 2, top, width, height);
  if (visual.caption) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(75, 85, 100);
    const caption = pdf.splitTextToSize(visual.caption, maximumWidth);
    pdf.text(caption, margin, top + height + 7);
  }
}

export function createAnalyticsReportPdf(
  title: string,
  content: string,
  visuals: AnalyticsReportVisual[] = [],
) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  pdf.setProperties({ title, subject: "Report di analisi Tatik.space" });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  const titleLines = pdf.splitTextToSize(title.slice(0, 160), contentWidth);
  pdf.text(titleLines, margin, 18);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(35, 45, 60);
  let y = 18 + titleLines.length * 8 + 4;
  const lines = pdf.splitTextToSize(content, contentWidth);
  for (const line of lines) {
    if (y > pageHeight - margin - 7) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += 5;
  }

  for (const visual of visuals) {
    pdf.addPage();
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(75, 85, 100);
    pdf.setFontSize(8);
    pdf.text(truncate(title, 90), margin, 9);
    if (visual.type === "image") {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(25, 35, 50);
      pdf.text(visual.title, margin, 20);
      addImage(pdf, visual, 27);
    } else if (visual.type === "chart") {
      addChart(pdf, visual, 21);
    } else {
      addMatrix(pdf, visual, 21);
    }
  }

  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.setDrawColor(225, 231, 239);
    pdf.setLineWidth(0.2);
    pdf.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 110, 125);
    pdf.text(`Tatik.space - ${page} / ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
  }
  return pdf;
}
