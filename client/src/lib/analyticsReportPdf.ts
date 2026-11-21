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
      legend?: Array<{ label: string; color: string }>;
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

export type AnalyticsReportConclusion = {
  title: string;
  content: string;
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
  let rowY = y;
  const maximumX = pdf.internal.pageSize.getWidth() - margin;
  for (const [index, item] of visual.series.entries()) {
    const [red, green, blue] = colorForSeries(index, item.color);
    const label = truncate(item.name, 28);
    const itemWidth = 13 + pdf.getTextWidth(label);
    if (x > margin && x + itemWidth > maximumX) {
      x = margin;
      rowY += 6;
    }
    pdf.setDrawColor(red, green, blue);
    pdf.setLineWidth(1.2);
    if (item.dashed) pdf.setLineDashPattern([1.5, 1], 0);
    pdf.line(x, rowY - 1, x + 7, rowY - 1);
    pdf.setLineDashPattern([], 0);
    pdf.setTextColor(45, 55, 72);
    pdf.text(label, x + 9, rowY);
    x += itemWidth;
  }
  return rowY + 5;
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
  const plotHeight = 66;
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
  const showLabels = visual.categories.length <= 8 && visual.series.length <= 2;
  visual.categories.forEach((category, categoryIndex) => {
    visual.series.forEach((item, seriesIndex) => {
      const value = item.values[categoryIndex];
      if (value === null || !Number.isFinite(value)) return;
      const [red, green, blue] = colorForSeries(seriesIndex, item.color);
      const x = plotX + categoryIndex * groupWidth + (groupWidth - visual.series.length * barWidth) / 2 + seriesIndex * barWidth;
      const y = valueY(value);
      pdf.setFillColor(red, green, blue);
      pdf.rect(x, Math.min(y, baseline), barWidth - 1, Math.max(0.7, Math.abs(baseline - y)), "F");
      if (showLabels) {
        pdf.setFontSize(6);
        pdf.setTextColor(45, 55, 72);
        pdf.text(formatNumber(value), x + barWidth / 2, value >= 0 ? y - 1 : y + 4, {
          align: "center",
          maxWidth: groupWidth,
        });
      }
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
  const rowHeight = Math.min(12, Math.max(7, 120 / Math.max(1, visual.categories.length)));
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
  const showLabels = visual.categories.length <= 18 && visual.series.length <= 3;
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
      if (showLabels) {
        const label = formatNumber(value);
        const labelWidth = pdf.getTextWidth(label) + 2;
        const onRight = value >= 0;
        let labelX = valuePosition + (onRight ? 1.5 : -1.5);
        let align: "left" | "right" = onRight ? "left" : "right";
        if (onRight && labelX + labelWidth > plotX + plotWidth) {
          labelX = plotX + plotWidth - 1;
          align = "right";
        } else if (!onRight && labelX - labelWidth < plotX) {
          labelX = plotX + 1;
          align = "left";
        }
        pdf.setFontSize(6);
        pdf.setTextColor(45, 55, 72);
        pdf.text(label, labelX, y + seriesIndex * seriesBand + seriesBand / 2 + 2, { align, maxWidth: 24 });
      }
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
  const plotHeight = 68;
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
    let lastValue: number | null = null;
    item.values.forEach((value, index) => {
      if (value === null || !Number.isFinite(value)) {
        previous = null;
        return;
      }
      const point = { x: pointX(index), y: valueY(value) };
      if (previous) pdf.line(previous.x, previous.y, point.x, point.y);
      previous = point;
      lastValue = value;
    });
    pdf.setLineDashPattern([], 0);
    if (lastValue !== null) {
      pdf.setFontSize(6);
      pdf.setTextColor(red, green, blue);
      pdf.text(formatNumber(lastValue), plotX + plotWidth - 1, valueY(lastValue) - 2, { align: "right" });
    }
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
  return addLegend(pdf, visual, chartBottom + 5);
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
  const rowHeight = Math.min(12, Math.max(6, 90 / Math.max(1, visual.rowLabels.length)));
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
  return startY + visual.rowLabels.length * rowHeight + 4;
}

function getImageLayout(
  pdf: jsPDF,
  visual: Extract<AnalyticsReportVisual, { type: "image" }>,
  top: number,
) {
  const match = visual.dataUrl.match(/^data:image\/(png|jpe?g|webp);base64,/i);
  if (!match) throw new Error(`L'immagine "${visual.title}" non è incorporata nel formato supportato.`);
  const format = match[1].toLowerCase().startsWith("jp") ? "JPEG" : match[1].toUpperCase();
  const properties = pdf.getImageProperties(visual.dataUrl);
  const maximumWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  const captionHeight = visual.caption
    ? pdf.splitTextToSize(visual.caption, maximumWidth).length * 4.5 + 2
    : 0;
  const legendHeight = visual.legend?.length ? Math.ceil(visual.legend.length / 2) * 7 : 0;
  const availableHeight = pdf.internal.pageSize.getHeight() - margin - 12 - top - 5 - captionHeight - legendHeight;
  const maximumHeight = Math.max(80, Math.min(190, availableHeight));
  const scale = Math.min(maximumWidth / properties.width, maximumHeight / properties.height);
  return {
    format,
    maximumWidth,
    width: properties.width * scale,
    height: properties.height * scale,
    captionHeight,
    legendHeight,
  };
}

function addImage(
  pdf: jsPDF,
  visual: Extract<AnalyticsReportVisual, { type: "image" }>,
  top: number,
) {
  const layout = getImageLayout(pdf, visual, top);
  const { format, maximumWidth, width, height } = layout;
  pdf.addImage(visual.dataUrl, format, margin + (maximumWidth - width) / 2, top, width, height);
  let y = top + height + 5;
  if (visual.caption) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(75, 85, 100);
    const caption = pdf.splitTextToSize(visual.caption, maximumWidth);
    pdf.text(caption, margin, y);
    y += caption.length * 4.5 + 2;
  }
  if (visual.legend?.length) {
    const itemWidth = maximumWidth / 2;
    pdf.setFontSize(8);
    visual.legend.forEach((item, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + column * itemWidth;
      const itemY = y + row * 7;
      const [red, green, blue] = rgb(item.color);
      pdf.setFillColor(red, green, blue);
      pdf.rect(x, itemY - 3.2, 4, 4, "F");
      pdf.setTextColor(55, 65, 80);
      pdf.text(truncate(item.label, 32), x + 6, itemY, { maxWidth: itemWidth - 8 });
    });
    y += Math.ceil(visual.legend.length / 2) * 7;
  }
  return y;
}

function extractSummary(content: string) {
  const summary: Array<{ label: string; value: string; sourceLine: string }> = [];
  for (const sourceLine of content.split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line) break;
    const separator = line.indexOf(":");
    if (separator <= 0 || separator > 36) continue;
    const value = line.slice(separator + 1).split(";")[0].trim();
    if (value) summary.push({ label: line.slice(0, separator).trim(), value, sourceLine: line });
    if (summary.length === 4) break;
  }
  return summary;
}

function addCompactHeader(
  pdf: jsPDF,
  title: string,
  summary: ReturnType<typeof extractSummary>,
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const titleLines = pdf.splitTextToSize(title.slice(0, 160), pageWidth - margin * 2).slice(0, 2);
  const headerHeight = titleLines.length > 1 ? 34 : 28;
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageWidth, headerHeight, "F");
  pdf.setFillColor(37, 99, 235);
  pdf.rect(0, 0, 4, headerHeight, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(191, 219, 254);
  pdf.text("TATIK.SPACE  /  REPORT ANALITICO", margin, 9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(219, 226, 239);
  pdf.text(new Date().toLocaleDateString("it-IT"), pageWidth - margin, 9, { align: "right" });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.text(titleLines, margin, titleLines.length > 1 ? 18 : 20, { lineHeightFactor: 1 });

  let y = headerHeight + 5;
  if (!summary.length) return y;
  const cardGap = 8;
  const cardWidth = (pageWidth - margin * 2 - cardGap) / 2;
  const cardHeight = 22;
  summary.forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + column * (cardWidth + cardGap);
    const cardY = y + row * (cardHeight + 4);
    pdf.setFillColor(245, 248, 252);
    pdf.setDrawColor(225, 231, 239);
    pdf.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(90, 100, 115);
    pdf.text(truncate(item.label.toLocaleUpperCase(), 42), x + 5, cardY + 6);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(25, 35, 50);
    const valueLines = pdf.splitTextToSize(item.value, cardWidth - 10).slice(0, 2);
    pdf.text(valueLines, x + 5, cardY + 14, { lineHeightFactor: 1 });
  });
  return y + Math.ceil(summary.length / 2) * (cardHeight + 4) + 2;
}

function addPageHeading(pdf: jsPDF, title: string, section: string) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(37, 99, 235);
  pdf.text("TATIK.SPACE  /  REPORT ANALITICO", margin, 9);
  pdf.setTextColor(80, 90, 105);
  pdf.setFont("helvetica", "normal");
  pdf.text(truncate(title, 72), pageWidth - margin, 9, { align: "right" });
  pdf.setDrawColor(225, 231, 239);
  pdf.line(margin, 13, pageWidth - margin, 13);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(25, 35, 50);
  pdf.text(section, margin, 23);
  return 31;
}

function addInlineSectionHeading(pdf: jsPDF, section: string, y: number) {
  pdf.setFillColor(37, 99, 235);
  pdf.rect(margin, y - 3, 1.3, 9, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(25, 35, 50);
  pdf.text(section, margin + 5, y + 3);
  return y + 11;
}

function addRichContent(
  pdf: jsPDF,
  title: string,
  content: string,
  startY: number,
  summary: ReturnType<typeof extractSummary>,
  sectionTitle = "Risultati e interpretazione",
  includeSectionHeading = true,
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = includeSectionHeading ? addInlineSectionHeading(pdf, sectionTitle, startY) : startY;
  const summaryLines = new Set(summary
    .filter((item) => item.sourceLine.slice(item.sourceLine.indexOf(":") + 1).trim() === item.value && item.value.length <= 60)
    .map((item) => item.sourceLine));
  const nextPage = () => {
    pdf.addPage();
    y = addPageHeading(pdf, title, sectionTitle);
  };
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (summaryLines.has(line)) continue;
    if (!line) {
      y += 2;
      continue;
    }
    if (line.endsWith(":")) {
      if (y + 11 > pageHeight - margin - 12) nextPage();
      y += 2;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(margin, y - 2, 1.3, 8, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(25, 35, 50);
      pdf.text(line.slice(0, -1), margin + 5, y + 3);
      y += 10;
      continue;
    }

    const isBullet = /^[-•]\s*/.test(line);
    const contentLine = isBullet ? line.replace(/^[-•]\s*/, "") : line;
    const separator = contentLine.indexOf(":");
    const isKeyValue = !isBullet && separator > 0 && separator <= 38;
    if (isKeyValue) {
      const label = `${contentLine.slice(0, separator)}:`;
      const value = contentLine.slice(separator + 1).trim();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      const labelWidth = pdf.getTextWidth(label) + 3;
      pdf.setFont("helvetica", "normal");
      const valueLines = pdf.splitTextToSize(value, contentWidth - labelWidth);
      const blockHeight = Math.max(4.5, valueLines.length * 4.2);
      if (y + blockHeight > pageHeight - margin - 12) nextPage();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(55, 65, 80);
      pdf.text(label, margin + 1, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(55, 65, 80);
      pdf.text(valueLines, margin + labelWidth, y);
      y += blockHeight + 1;
      continue;
    }

    const isNamedResult = contentLine.length <= 110 && contentLine.includes(" — ");
    pdf.setFont("helvetica", isNamedResult ? "bold" : "normal");
    pdf.setFontSize(isNamedResult ? 9.5 : 8.5);
    const textWidth = contentWidth - (isBullet ? 8 : 0);
    const wrapped = pdf.splitTextToSize(contentLine, textWidth);
    const blockHeight = wrapped.length * (isNamedResult ? 4.8 : 4.2);
    if (y + blockHeight > pageHeight - margin - 12) nextPage();
    pdf.setTextColor(isNamedResult ? 35 : 55, isNamedResult ? 45 : 65, isNamedResult ? 60 : 80);
    if (isBullet) {
      pdf.setFillColor(37, 99, 235);
      pdf.circle(margin + 2, y - 1, 0.8, "F");
    }
    pdf.text(wrapped, margin + (isBullet ? 6 : 1), y);
    y += blockHeight + 1;
  }
  return y;
}

function estimateVisualHeight(
  pdf: jsPDF,
  visual: AnalyticsReportVisual,
) {
  if (visual.type === "image") {
    const layout = getImageLayout(pdf, visual, 38);
    const { height, captionHeight, legendHeight } = layout;
    return height + captionHeight + legendHeight + 12;
  }
  if (visual.type === "matrix") {
    const rowHeight = Math.min(12, Math.max(6, 90 / Math.max(1, visual.rowLabels.length)));
    return 22 + visual.rowLabels.length * rowHeight;
  }
  if (visual.chartType === "line") return 106 + Math.ceil(visual.series.length / 3) * 6;
  if (visual.orientation === "horizontal") {
    const rowHeight = Math.min(12, Math.max(7, 120 / Math.max(1, visual.categories.length)));
    return 30 + rowHeight * visual.categories.length + Math.ceil(visual.series.length / 3) * 6;
  }
  return 108 + Math.ceil(visual.series.length / 3) * 6;
}

function addVisual(
  pdf: jsPDF,
  visual: AnalyticsReportVisual,
  top: number,
) {
  if (visual.type === "image") {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(25, 35, 50);
    pdf.text(visual.title, margin, top);
    return addImage(pdf, visual, top + 7);
  }
  if (visual.type === "chart") return addChart(pdf, visual, top);
  return addMatrix(pdf, visual, top);
}

export function createAnalyticsReportPdf(
  title: string,
  content: string,
  visuals: AnalyticsReportVisual[] = [],
  conclusion?: AnalyticsReportConclusion,
) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setProperties({ title, subject: "Report di analisi Tatik.space" });
  const summary = extractSummary(content);
  let visualY = addCompactHeader(pdf, title, summary);
  if (content.trim()) visualY = addRichContent(pdf, title, content, visualY, summary);
  for (const visual of visuals) {
    const estimatedHeight = estimateVisualHeight(pdf, visual);
    if (
      visual.type === "image" ||
      visualY + estimatedHeight > pageHeight - margin - 12
    ) {
      pdf.addPage();
      visualY = addPageHeading(pdf, title, "Grafici e visualizzazioni");
    }
    visualY = addVisual(pdf, visual, visualY) + 6;
  }

  if (conclusion?.content.trim()) {
    const pageBottom = pageHeight - margin - 12;
    if (visualY + 50 > pageBottom) {
      pdf.addPage();
      visualY = addPageHeading(pdf, title, conclusion.title);
      addRichContent(pdf, title, conclusion.content, visualY, [], conclusion.title, false);
    } else {
      addRichContent(pdf, title, conclusion.content, visualY, [], conclusion.title);
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
