import { useState } from "react";
import { AlertCircle, Download, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import type { SentinelAoiJob } from "../../../server/data-insight";

type TrainingData = NonNullable<SentinelAoiJob["result"]["unetTrainingData"]>;
type ClassLegend = SentinelAoiJob["result"]["classLegend"];
type UnetResult = {
  accuracy: number;
  balancedAccuracy: number;
  macroF1: number;
  testPixels: number;
  classes: Array<{ code: number; name: string; color: string }>;
  perClass: Array<{ code: number; precision: number; recall: number; f1: number; support: number }>;
  confusionMatrix: number[][];
  preview: string;
  exportPayload: {
    width: number;
    height: number;
    classCodes: number[];
    predictedClassCodesBase64: string;
    transform: TrainingData["transform"];
    crs: string;
    bbox: TrainingData["bbox"];
    sceneId: string;
  };
};

const PATCH_SIZE = 32;
const FEATURE_CHANNELS = 8;

const copy = {
  it: {
    title: "U-Net · Segmentazione pixel per pixel dell'AOI",
    description: "Training CNN leggero nel browser, usando i dati Sentinel-2 e ESA WorldCover dell'analisi appena completata.",
    labelTitle: "Fonte delle etichette",
    proxy: "ESA WorldCover 2021 · etichette proxy",
    verified: "Etichette verificate indipendenti · non disponibili",
    proxyNote: "WorldCover è un prodotto cartografico derivato da classificazione, non ground truth indipendente. Le metriche misurano l'accordo con questo proxy su patch spaziali escluse dal training.",
    missing: "Esegui prima l'analisi Sentinel-2 con l'opzione «Prepara dati per U-Net» attiva.",
    epochs: "Epoche",
    run: "Addestra e valuta U-Net nel browser",
    running: "Training U-Net in corso…",
    progress: (epoch: number, total: number, loss: number) => `Epoca ${epoch}/${total} · loss ${loss.toFixed(3)}`,
    accuracy: "Accuracy proxy",
    balanced: "Balanced accuracy proxy",
    f1: "Macro F1 proxy",
    testPixels: "Pixel test spaziali",
    class: "Classe",
    precision: "Precision",
    recall: "Recall",
    support: "Pixel test",
    matrix: "Matrice di confusione (righe: WorldCover, colonne: predetta)",
    actual: "Riferimento / predetta",
    preview: "Anteprima U-Net (griglia ridotta, non georeferenziata)",
    download: "Scarica GeoTIFF U-Net georeferenziato",
    note: "La preview non è georeferenziata; il download produce un GeoTIFF a griglia ridotta. Il risultato resta esplorativo e non sostituisce validazione indipendente o rilievi sul campo.",
    error: "Training U-Net non riuscito.",
    unavailable: "Non ci sono abbastanza patch spaziali o classi proxy per una valutazione indipendente. Prova un'AOI più ampia o seleziona meno classi.",
    badData: "I dati raster compressi non sono validi o non corrispondono alla griglia dichiarata.",
    invalidEpochs: "Scegli da 1 a 10 epoche.",
    classCoverage: "Copertura di classi insufficiente nei blocchi spaziali esclusi. Amplia l'area o riduci le classi selezionate.",
  },
  en: {
    title: "U-Net · Pixel-wise AOI segmentation",
    description: "Lightweight CNN training in your browser using Sentinel-2 and ESA WorldCover data from the completed analysis.",
    labelTitle: "Label source",
    proxy: "ESA WorldCover 2021 · proxy labels",
    verified: "Independent verified labels · unavailable",
    proxyNote: "WorldCover is a classified map product, not independent ground truth. Metrics report agreement with this proxy on spatial patches held out from training.",
    missing: "First run Sentinel-2 analysis with «Prepare data for U-Net» enabled.",
    epochs: "Epochs",
    run: "Train and evaluate U-Net in browser",
    running: "U-Net training…",
    progress: (epoch: number, total: number, loss: number) => `Epoch ${epoch}/${total} · loss ${loss.toFixed(3)}`,
    accuracy: "Proxy accuracy",
    balanced: "Proxy balanced accuracy",
    f1: "Proxy macro F1",
    testPixels: "Spatial test pixels",
    class: "Class",
    precision: "Precision",
    recall: "Recall",
    support: "Test pixels",
    matrix: "Confusion matrix (rows: WorldCover, columns: predicted)",
    actual: "Reference / predicted",
    preview: "U-Net preview (reduced grid, not georeferenced)",
    download: "Download georeferenced U-Net GeoTIFF",
    note: "The preview is not georeferenced; the download produces a reduced-grid GeoTIFF. Results remain exploratory and do not replace independent validation or field surveys.",
    error: "U-Net training failed.",
    unavailable: "There are not enough spatial patches or proxy classes for independent evaluation. Try a larger AOI or select fewer classes.",
    badData: "Compressed raster data is invalid or does not match the declared grid.",
    invalidEpochs: "Choose 1–10 epochs.",
    classCoverage: "Insufficient class coverage in held-out spatial blocks. Expand the AOI or select fewer classes.",
  },
};

type Patch = { values: Float32Array; labels: Uint8Array; classCodes: Set<number> };

function seededShuffle<T>(items: T[], seed: number): T[] {
  const shuffled = [...items];
  let state = seed >>> 0;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function AoiUnet({
  data,
  classLegend,
  language,
}: {
  data?: TrainingData | null;
  classLegend: ClassLegend;
  language: "it" | "en";
}) {
  const text = copy[language];
  const [epochs, setEpochs] = useState("5");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<UnetResult | null>(null);
  const exportMutation = trpc.dataInsight.exportUnetClassification.useMutation();

  const run = async () => {
    setError("");
    setResult(null);
    const epochCount = Number(epochs);
    if (!Number.isInteger(epochCount) || epochCount < 1 || epochCount > 10) {
      setError(text.invalidEpochs);
      return;
    }
    if (!data) {
      setError(text.missing);
      return;
    }
    if (data.encoding !== "zlib-f32le-interleaved-features-then-u8-worldcover"
      || data.channels.length !== FEATURE_CHANNELS
      || data.width < 1 || data.height < 1) {
      setError(text.badData);
      return;
    }

    setRunning(true);
    let tf: typeof import("@tensorflow/tfjs") | undefined;
    let model: import("@tensorflow/tfjs").LayersModel | undefined;
    let allX: import("@tensorflow/tfjs").Tensor4D | undefined;
    let trainX: import("@tensorflow/tfjs").Tensor4D | undefined;
    let trainY: import("@tensorflow/tfjs").Tensor4D | undefined;
    let testX: import("@tensorflow/tfjs").Tensor4D | undefined;
    let prediction: import("@tensorflow/tfjs").Tensor | undefined;
    try {
      const { unzlibSync } = await import("fflate");
      tf = await import("@tensorflow/tfjs");
      await tf.setBackend("cpu");
      await tf.ready();
      const compressed = Uint8Array.from(atob(data.dataBase64), (character) => character.charCodeAt(0));
      const raw = unzlibSync(compressed);
      const featureByteCount = data.width * data.height * FEATURE_CHANNELS * 4;
      if (raw.length !== featureByteCount + data.width * data.height) throw new Error(text.badData);
      const featureView = new DataView(raw.buffer, raw.byteOffset, featureByteCount);
      const labelGrid = raw.subarray(featureByteCount);
      const gridFeature = (row: number, column: number, channel: number) =>
        featureView.getFloat32(((row * data.width + column) * FEATURE_CHANNELS + channel) * 4, true);

      const paddedWidth = Math.ceil(data.width / PATCH_SIZE) * PATCH_SIZE;
      const paddedHeight = Math.ceil(data.height / PATCH_SIZE) * PATCH_SIZE;
      const columns = paddedWidth / PATCH_SIZE;
      const rows = paddedHeight / PATCH_SIZE;
      const patches: Patch[] = [];
      for (let tileRow = 0; tileRow < rows; tileRow += 1) {
        for (let tileColumn = 0; tileColumn < columns; tileColumn += 1) {
          const values = new Float32Array(PATCH_SIZE * PATCH_SIZE * FEATURE_CHANNELS);
          const labels = new Uint8Array(PATCH_SIZE * PATCH_SIZE);
          const patchClasses = new Set<number>();
          let validPixels = 0;
          for (let row = 0; row < PATCH_SIZE; row += 1) {
            for (let column = 0; column < PATCH_SIZE; column += 1) {
              const globalRow = tileRow * PATCH_SIZE + row;
              const globalColumn = tileColumn * PATCH_SIZE + column;
              const pixel = row * PATCH_SIZE + column;
              if (globalRow >= data.height || globalColumn >= data.width) continue;
              const classCode = labelGrid[globalRow * data.width + globalColumn];
              labels[pixel] = classCode;
              if (classCode > 0 && data.classCodes.includes(classCode)) {
                patchClasses.add(classCode);
                validPixels += 1;
              }
              for (let channel = 0; channel < FEATURE_CHANNELS; channel += 1) {
                const value = gridFeature(globalRow, globalColumn, channel);
                values[pixel * FEATURE_CHANNELS + channel] = channel < 5
                  ? Math.min(1, Math.max(0, value))
                  : Math.min(1, Math.max(0, (value + 1) / 2));
              }
            }
          }
          patches.push({ values, labels, classCodes: patchClasses });
        }
      }

      const classCountByPatch = new Map<number, number>();
      data.classCodes.forEach((code) => classCountByPatch.set(code, 0));
      patches.forEach((patch) => patch.classCodes.forEach((code) => {
        classCountByPatch.set(code, (classCountByPatch.get(code) ?? 0) + 1);
      }));
      const usableClasses = data.classCodes.filter((code) => (classCountByPatch.get(code) ?? 0) >= 2);
      const candidatePatchIndices = patches.flatMap((patch, index) => patch.classCodes.size ? [index] : []);
      if (usableClasses.length < 2 || candidatePatchIndices.length < 4) throw new Error(text.unavailable);
      const legendByCode = new Map(classLegend.map((entry) => [entry.code, entry]));
      const classes = usableClasses.map((code) => ({
        code,
        name: legendByCode.get(code)?.name ?? String(code),
        color: legendByCode.get(code)?.color ?? "#94a3b8",
      }));

      const totalPatches = candidatePatchIndices;
      let split: { training: number[]; test: number[] } | null = null;
      let bestScore = -1;
      for (let attempt = 0; attempt < 120; attempt += 1) {
        const order = seededShuffle(totalPatches, 2026 + attempt);
        const testCount = Math.max(1, Math.ceil(candidatePatchIndices.length * 0.2));
        const test = order.slice(0, testCount);
        const training = order.slice(testCount);
        const trainingClasses = new Set(training.flatMap((index) => [...patches[index].classCodes]));
        const testClasses = new Set(test.flatMap((index) => [...patches[index].classCodes]));
        if (!usableClasses.every((code) => trainingClasses.has(code)) || testClasses.size < 2) continue;
        const score = usableClasses.filter((code) => testClasses.has(code)).length * 1_000_000
          + test.reduce((sum, index) => sum + patches[index].labels.filter((code) => usableClasses.includes(code)).length, 0);
        if (score > bestScore) {
          split = { training, test };
          bestScore = score;
        }
        if (testClasses.size === usableClasses.length) break;
      }
      if (!split) throw new Error(text.classCoverage);

      const classIndex = new Map(usableClasses.map((code, index) => [code, index]));
      const patchPixels = PATCH_SIZE * PATCH_SIZE;
      const trainingPixels = new Float32Array(split.training.length * patchPixels * FEATURE_CHANNELS);
      const trainingTargets = new Float32Array(split.training.length * patchPixels * usableClasses.length);
      const testPixels = new Float32Array(split.test.length * patchPixels * FEATURE_CHANNELS);
      split.training.forEach((patchIndex, sample) => {
        const patch = patches[patchIndex];
        trainingPixels.set(patch.values, sample * patch.values.length);
        patch.labels.forEach((code, pixel) => {
          const targetClass = classIndex.get(code);
          if (targetClass !== undefined) trainingTargets[(sample * patchPixels + pixel) * usableClasses.length + targetClass] = 1;
        });
      });
      split.test.forEach((patchIndex, sample) => testPixels.set(patches[patchIndex].values, sample * patches[patchIndex].values.length));
      const allPixels = new Float32Array(patches.length * patchPixels * FEATURE_CHANNELS);
      patches.forEach((patch, index) => allPixels.set(patch.values, index * patch.values.length));

      trainX = tf.tensor4d(trainingPixels, [split.training.length, PATCH_SIZE, PATCH_SIZE, FEATURE_CHANNELS]);
      trainY = tf.tensor4d(trainingTargets, [split.training.length, PATCH_SIZE, PATCH_SIZE, usableClasses.length]);
      testX = tf.tensor4d(testPixels, [split.test.length, PATCH_SIZE, PATCH_SIZE, FEATURE_CHANNELS]);
      allX = tf.tensor4d(allPixels, [patches.length, PATCH_SIZE, PATCH_SIZE, FEATURE_CHANNELS]);

      const input = tf.input({ shape: [PATCH_SIZE, PATCH_SIZE, FEATURE_CHANNELS] });
      const encoder1 = tf.layers.conv2d({ filters: 16, kernelSize: 3, padding: "same", activation: "relu" }).apply(input) as import("@tensorflow/tfjs").SymbolicTensor;
      const pool1 = tf.layers.maxPooling2d({ poolSize: 2 }).apply(encoder1) as import("@tensorflow/tfjs").SymbolicTensor;
      const encoder2 = tf.layers.conv2d({ filters: 32, kernelSize: 3, padding: "same", activation: "relu" }).apply(pool1) as import("@tensorflow/tfjs").SymbolicTensor;
      const pool2 = tf.layers.maxPooling2d({ poolSize: 2 }).apply(encoder2) as import("@tensorflow/tfjs").SymbolicTensor;
      const bridge = tf.layers.conv2d({ filters: 64, kernelSize: 3, padding: "same", activation: "relu" }).apply(pool2) as import("@tensorflow/tfjs").SymbolicTensor;
      const up2 = tf.layers.upSampling2d({ size: [2, 2] }).apply(bridge) as import("@tensorflow/tfjs").SymbolicTensor;
      const merge2 = tf.layers.concatenate().apply([up2, encoder2]) as import("@tensorflow/tfjs").SymbolicTensor;
      const decoder2 = tf.layers.conv2d({ filters: 32, kernelSize: 3, padding: "same", activation: "relu" }).apply(merge2) as import("@tensorflow/tfjs").SymbolicTensor;
      const up1 = tf.layers.upSampling2d({ size: [2, 2] }).apply(decoder2) as import("@tensorflow/tfjs").SymbolicTensor;
      const merge1 = tf.layers.concatenate().apply([up1, encoder1]) as import("@tensorflow/tfjs").SymbolicTensor;
      const decoder1 = tf.layers.conv2d({ filters: 16, kernelSize: 3, padding: "same", activation: "relu" }).apply(merge1) as import("@tensorflow/tfjs").SymbolicTensor;
      const output = tf.layers.conv2d({ filters: usableClasses.length, kernelSize: 1, activation: "softmax" }).apply(decoder1) as import("@tensorflow/tfjs").SymbolicTensor;
      model = tf.model({ inputs: input, outputs: output });
      model.compile({ optimizer: tf.train.adam(0.001), loss: "categoricalCrossentropy" });
      await model.fit(trainX, trainY, {
        epochs: epochCount,
        batchSize: 2,
        shuffle: true,
        yieldEvery: "batch",
        callbacks: {
          onEpochEnd: (epoch, logs) => setProgress(text.progress(epoch + 1, epochCount, logs?.loss ?? 0)),
        },
      });

      const testOutput = model.predict(testX);
      if (Array.isArray(testOutput)) throw new Error("Il modello U-Net ha restituito più output del previsto.");
      prediction = testOutput;
      const testPredictions = await prediction.data();
      const matrix = usableClasses.map(() => usableClasses.map(() => 0));
      let evaluatedPixels = 0;
      split.test.forEach((patchIndex, sample) => {
        patches[patchIndex].labels.forEach((code, pixel) => {
          const actualClass = classIndex.get(code);
          if (actualClass === undefined) return;
          let predictedClass = 0;
          let maxProbability = -1;
          const offset = (sample * patchPixels + pixel) * usableClasses.length;
          for (let classId = 0; classId < usableClasses.length; classId += 1) {
            if (testPredictions[offset + classId] > maxProbability) {
              maxProbability = testPredictions[offset + classId];
              predictedClass = classId;
            }
          }
          matrix[actualClass][predictedClass] += 1;
          evaluatedPixels += 1;
        });
      });
      if (evaluatedPixels === 0) throw new Error(text.unavailable);
      const perClass = usableClasses.map((code, index) => {
        const truePositive = matrix[index][index];
        const support = matrix[index].reduce((sum, value) => sum + value, 0);
        const predictedCount = matrix.reduce((sum, row) => sum + row[index], 0);
        const precision = predictedCount ? truePositive / predictedCount : 0;
        const recall = support ? truePositive / support : 0;
        return {
          code,
          precision,
          recall,
          f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0,
          support,
        };
      });
      const evaluatedClasses = perClass.filter((metric) => metric.support > 0);

      const allOutput = model.predict(allX);
      if (Array.isArray(allOutput)) throw new Error("Il modello U-Net ha restituito più output del previsto.");
      const allPredictions = await allOutput.data();
      allOutput.dispose();
      const canvas = document.createElement("canvas");
      canvas.width = data.width;
      canvas.height = data.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas 2D non disponibile.");
      const image = context.createImageData(data.width, data.height);
      const predictedClassCodes = new Uint8Array(data.width * data.height);
      const palette = classes.map(({ color }) =>
        color.match(/[0-9a-f]{2}/gi)?.map((value) => parseInt(value, 16)) ?? [148, 163, 184],
      );
      patches.forEach((patch, patchIndex) => {
        const tileRow = Math.floor(patchIndex / columns);
        const tileColumn = patchIndex % columns;
        for (let pixel = 0; pixel < patchPixels; pixel += 1) {
          const row = tileRow * PATCH_SIZE + Math.floor(pixel / PATCH_SIZE);
          const column = tileColumn * PATCH_SIZE + pixel % PATCH_SIZE;
          if (row >= data.height || column >= data.width || patch.labels[pixel] === 0) continue;
          const offset = (patchIndex * patchPixels + pixel) * usableClasses.length;
          let bestClass = 0;
          for (let classId = 1; classId < usableClasses.length; classId += 1) {
            if (allPredictions[offset + classId] > allPredictions[offset + bestClass]) bestClass = classId;
          }
          predictedClassCodes[row * data.width + column] = usableClasses[bestClass];
          const color = palette[bestClass];
          const imageOffset = (row * data.width + column) * 4;
          image.data[imageOffset] = color[0];
          image.data[imageOffset + 1] = color[1];
          image.data[imageOffset + 2] = color[2];
          image.data[imageOffset + 3] = 255;
        }
      });
      context.putImageData(image, 0, 0);
      setResult({
        accuracy: matrix.reduce((sum, row, index) => sum + row[index], 0) / evaluatedPixels,
        balancedAccuracy: evaluatedClasses.reduce((sum, metric) => sum + metric.recall, 0) / evaluatedClasses.length,
        macroF1: evaluatedClasses.reduce((sum, metric) => sum + metric.f1, 0) / evaluatedClasses.length,
        testPixels: evaluatedPixels,
        classes,
        perClass,
        confusionMatrix: matrix,
        preview: canvas.toDataURL("image/png"),
        exportPayload: {
          width: data.width,
          height: data.height,
          classCodes: usableClasses,
          predictedClassCodesBase64: btoa(String.fromCharCode(...predictedClassCodes)),
          transform: data.transform,
          crs: data.crs,
          bbox: data.bbox,
          sceneId: data.sceneId,
        },
      });
      setProgress("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.error);
    } finally {
      prediction?.dispose();
      testX?.dispose();
      trainY?.dispose();
      trainX?.dispose();
      allX?.dispose();
      model?.dispose();
      setRunning(false);
    }
  };

  const downloadGeoTiff = async () => {
    if (!result) return;
    setError("");
    try {
      const exported = await exportMutation.mutateAsync(result.exportPayload);
      const bytes = Uint8Array.from(atob(exported.geoTiffBase64), (character) => character.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/tiff" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `sentinel-2-unet-${result.exportPayload.sceneId.replace(/[^a-zA-Z0-9._-]/g, "_")}.tif`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <fieldset className="space-y-2 rounded-md border p-3">
          <legend className="px-1 text-sm font-medium">{text.labelTitle}</legend>
          <label className="flex items-center gap-2 text-sm"><input type="radio" checked disabled />{text.proxy}</label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="radio" disabled />{text.verified}</label>
          <p className="text-xs text-muted-foreground">{text.proxyNote}</p>
        </fieldset>
        {!data && <p className="text-sm text-muted-foreground">{text.missing}</p>}
        <label className="block max-w-xs space-y-2 text-sm font-medium">
          {text.epochs}
          <Input type="number" min="1" max="10" value={epochs} onChange={(event) => setEpochs(event.target.value)} />
        </label>
        {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        {progress && <p aria-live="polite" className="text-sm text-muted-foreground">{progress}</p>}
        <Button onClick={run} disabled={running || !data}>
          {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{text.running}</> : <><Play className="mr-2 h-4 w-4" />{text.run}</>}
        </Button>
        {result && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                [text.accuracy, result.accuracy],
                [text.balanced, result.balancedAccuracy],
                [text.f1, result.macroF1],
                [text.testPixels, result.testPixels],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-semibold">{typeof value === "number" && value <= 1 ? value.toFixed(3) : value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <h3 className="font-semibold">{text.preview}</h3>
                <img className="w-full rounded-lg border" src={result.preview} alt={text.preview} />
                <p className="text-xs text-muted-foreground">{text.note}</p>
                <Button onClick={downloadGeoTiff} disabled={exportMutation.isPending}>
                  {exportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {text.download}
                </Button>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">{text.matrix}</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="text-xs">
                    <thead className="bg-muted/50"><tr><th className="p-2 text-left">{text.actual}</th>{result.classes.map((item) => <th key={item.code} className="min-w-16 p-2">{item.name}</th>)}</tr></thead>
                    <tbody>{result.confusionMatrix.map((row, index) => <tr key={result.classes[index].code} className="border-t"><th className="p-2 text-left">{result.classes[index].name}</th>{row.map((count, column) => <td key={result.classes[column].code} className="p-2 text-center">{count}</td>)}</tr>)}</tbody>
                  </table>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left"><tr><th className="p-3">{text.class}</th><th className="p-3">{text.precision}</th><th className="p-3">{text.recall}</th><th className="p-3">F1</th><th className="p-3">{text.support}</th></tr></thead>
                    <tbody>{result.perClass.map((metric) => <tr key={metric.code} className="border-t"><td className="p-3">{result.classes.find((item) => item.code === metric.code)?.name}</td><td className="p-3">{metric.precision.toFixed(3)}</td><td className="p-3">{metric.recall.toFixed(3)}</td><td className="p-3">{metric.f1.toFixed(3)}</td><td className="p-3">{metric.support}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
