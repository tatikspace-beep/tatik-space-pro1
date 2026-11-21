import { useState } from "react";
import { AlertCircle, Download, Loader2, Play, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const EURO_SAT_URL = "https://zenodo.org/records/7711810/files/EuroSAT_RGB.zip?download=1";
const CLASS_NAMES = [
  "AnnualCrop",
  "Forest",
  "HerbaceousVegetation",
  "Highway",
  "Industrial",
  "Pasture",
  "PermanentCrop",
  "Residential",
  "River",
  "SeaLake",
];

type Language = "it" | "en";
type CnnResult = {
  accuracy: number;
  balancedAccuracy: number;
  macroF1: number;
  testCount: number;
  classNames: string[];
  confusionMatrix: number[][];
  perClass: Array<{ name: string; precision: number; recall: number; f1: number; support: number }>;
};

const copy = {
  it: {
    title: "CNN · Computer vision EuroSAT",
    description: "Benchmark di classificazione di immagini Sentinel-2 a chip. L’archivio viene elaborato nel browser: non viene caricato sul server.",
    download: "Scarica EuroSAT RGB (94,7 MB)",
    choose: "Seleziona il file EuroSAT_RGB.zip scaricato",
    samples: "Campioni per classe",
    epochs: "Epoche",
    run: "Addestra e valuta CNN nel browser",
    running: "Il browser sta elaborando EuroSAT…",
    ready: "Archivio caricato localmente. Avvia il benchmark per continuare.",
    downloadNote: "Il download avviene dal repository Zenodo ufficiale e salva il file sul tuo dispositivo; poi selezionalo qui. La rete e la memoria del dispositivo possono rendere il training lento.",
    method: "CNN convoluzionale compatta · split stratificato 80/20 · seed fisso.",
    metrics: "Metriche sul test EuroSAT",
    accuracy: "Accuracy",
    balanced: "Balanced accuracy",
    f1: "Macro F1",
    class: "Classe",
    precision: "Precision",
    recall: "Recall",
    support: "Campioni test",
    confusion: "Matrice di confusione (righe: classe reale, colonne: predetta)",
    actual: "Reale / predetta",
    error: "Benchmark CNN non riuscito.",
    invalidFile: "Seleziona l’archivio EuroSAT_RGB.zip ufficiale.",
    invalidSample: "Scegli da 20 a 150 campioni per classe e da 1 a 10 epoche.",
    license: "EuroSAT è distribuito con licenza MIT. Il risultato classifica chip RGB e non produce una mappa georeferenziata della tua AOI.",
    progress: (current: number, total: number) => `Decodifica delle immagini: ${current}/${total}`,
    epoch: (current: number, total: number, loss: number) => `Epoca ${current}/${total} · loss ${loss.toFixed(3)}`,
  },
  en: {
    title: "CNN · EuroSAT computer vision",
    description: "Sentinel-2 image-chip classification benchmark. The archive is processed in your browser and is not uploaded to the server.",
    download: "Download EuroSAT RGB (94.7 MB)",
    choose: "Select the downloaded EuroSAT_RGB.zip file",
    samples: "Samples per class",
    epochs: "Epochs",
    run: "Train and evaluate CNN in browser",
    running: "The browser is processing EuroSAT…",
    ready: "Archive loaded locally. Start the benchmark to continue.",
    downloadNote: "The official Zenodo archive is downloaded to your device; select it here afterward. Network speed and device memory can make training slow.",
    method: "Compact convolutional CNN · stratified 80/20 split · fixed seed.",
    metrics: "EuroSAT test metrics",
    accuracy: "Accuracy",
    balanced: "Balanced accuracy",
    f1: "Macro F1",
    class: "Class",
    precision: "Precision",
    recall: "Recall",
    support: "Test samples",
    confusion: "Confusion matrix (rows: actual, columns: predicted)",
    actual: "Actual / predicted",
    error: "CNN benchmark failed.",
    invalidFile: "Select the official EuroSAT_RGB.zip archive.",
    invalidSample: "Choose 20–150 samples per class and 1–10 epochs.",
    license: "EuroSAT is distributed under the MIT license. This classifies RGB image chips; it does not create a georeferenced map of your AOI.",
    progress: (current: number, total: number) => `Decoding images: ${current}/${total}`,
    epoch: (current: number, total: number, loss: number) => `Epoch ${current}/${total} · loss ${loss.toFixed(3)}`,
  },
};

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

async function decodeChip(bytes: Uint8Array, pixels: Float32Array, offset: number): Promise<void> {
  const blob = new Blob([bytes.slice().buffer]);
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas 2D non disponibile.");
    context.drawImage(bitmap, 0, 0, 64, 64);
    const image = context.getImageData(0, 0, 64, 64).data;
    for (let source = 0, target = offset; source < image.length; source += 4) {
      pixels[target] = image[source] / 255;
      pixels[target + 1] = image[source + 1] / 255;
      pixels[target + 2] = image[source + 2] / 255;
      target += 3;
    }
  } finally {
    bitmap.close();
  }
}

export function EuroSatCnn({ language }: { language: Language }) {
  const text = copy[language];
  const [file, setFile] = useState<File | null>(null);
  const [samplesPerClass, setSamplesPerClass] = useState("50");
  const [epochs, setEpochs] = useState("5");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CnnResult | null>(null);

  const run = async () => {
    setError("");
    setResult(null);
    const sampleLimit = Number(samplesPerClass);
    const epochCount = Number(epochs);
    if (!file || !file.name.toLowerCase().endsWith(".zip") || file.size > 120 * 1024 * 1024) {
      setError(text.invalidFile);
      return;
    }
    if (!Number.isInteger(sampleLimit) || sampleLimit < 20 || sampleLimit > 150
      || !Number.isInteger(epochCount) || epochCount < 1 || epochCount > 10) {
      setError(text.invalidSample);
      return;
    }

    setRunning(true);
    let tf: typeof import("@tensorflow/tfjs") | undefined;
    let model: import("@tensorflow/tfjs").Sequential | undefined;
    let trainingLabels: import("@tensorflow/tfjs").Tensor1D | undefined;
    let testLabels: import("@tensorflow/tfjs").Tensor1D | undefined;
    let trainX: import("@tensorflow/tfjs").Tensor4D | undefined;
    let trainY: import("@tensorflow/tfjs").Tensor | undefined;
    let testX: import("@tensorflow/tfjs").Tensor4D | undefined;
    let predictions: import("@tensorflow/tfjs").Tensor | undefined;
    try {
      const { unzipSync } = await import("fflate");
      tf = await import("@tensorflow/tfjs");
      await tf.setBackend("cpu");
      await tf.ready();
      const zipBytes = new Uint8Array(await file.arrayBuffer());
      const selectedCounts = new Map(CLASS_NAMES.map((className) => [className, 0]));
      let selectedBytes = 0;
      const files = unzipSync(zipBytes, {
        filter: (entry) => {
          if (!entry.name.toLowerCase().endsWith(".jpg")) return false;
          const pathParts = entry.name.replace(/\\/g, "/").split("/");
          const className = CLASS_NAMES.find((name) => pathParts.includes(name));
          if (!className || (selectedCounts.get(className) ?? 0) >= sampleLimit) return false;
          if (entry.originalSize > 512 * 1024 || selectedBytes + entry.originalSize > 40 * 1024 * 1024) {
            throw new Error("Archivio EuroSAT non valido: dimensione dei campioni selezionati oltre il limite.");
          }
          selectedCounts.set(className, (selectedCounts.get(className) ?? 0) + 1);
          selectedBytes += entry.originalSize;
          return true;
        },
      });
      const entriesByClass = CLASS_NAMES.map((className) => {
        const matching = Object.entries(files)
          .filter(([path, bytes]) => path.toLowerCase().endsWith(".jpg")
            && path.replace(/\\/g, "/").split("/").includes(className)
            && bytes.length > 0)
          .map(([, bytes]) => bytes);
        if (matching.length < 20) throw new Error(`Dataset incompleto: immagini insufficienti per ${className}.`);
        return seededShuffle(matching, 2026 + CLASS_NAMES.indexOf(className)).slice(0, sampleLimit);
      });

      const trainingSamples: Array<{ bytes: Uint8Array; label: number }> = [];
      const testSamples: Array<{ bytes: Uint8Array; label: number }> = [];
      entriesByClass.forEach((entries, label) => {
        const shuffled = seededShuffle(entries, 783 + label);
        const testCount = Math.max(1, Math.floor(shuffled.length * 0.2));
        shuffled.slice(0, testCount).forEach((bytes) => testSamples.push({ bytes, label }));
        shuffled.slice(testCount).forEach((bytes) => trainingSamples.push({ bytes, label }));
      });
      const pixelCount = 64 * 64 * 3;
      const trainingPixels = new Float32Array(trainingSamples.length * pixelCount);
      const testPixels = new Float32Array(testSamples.length * pixelCount);
      for (let index = 0; index < trainingSamples.length; index += 1) {
        await decodeChip(trainingSamples[index].bytes, trainingPixels, index * pixelCount);
        if (index % 25 === 0) setProgress(text.progress(index + 1, trainingSamples.length + testSamples.length));
      }
      for (let index = 0; index < testSamples.length; index += 1) {
        await decodeChip(testSamples[index].bytes, testPixels, index * pixelCount);
        if (index % 25 === 0) setProgress(text.progress(trainingSamples.length + index + 1, trainingSamples.length + testSamples.length));
      }

      trainingLabels = tf.tensor1d(trainingSamples.map((sample) => sample.label), "int32");
      testLabels = tf.tensor1d(testSamples.map((sample) => sample.label), "int32");
      trainX = tf.tensor4d(trainingPixels, [trainingSamples.length, 64, 64, 3]);
      trainY = tf.oneHot(trainingLabels, CLASS_NAMES.length);
      testX = tf.tensor4d(testPixels, [testSamples.length, 64, 64, 3]);
      model = tf.sequential({
        layers: [
          tf.layers.conv2d({ inputShape: [64, 64, 3], filters: 16, kernelSize: 3, padding: "same", activation: "relu" }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 32, kernelSize: 3, padding: "same", activation: "relu" }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 64, kernelSize: 3, padding: "same", activation: "relu" }),
          tf.layers.globalAveragePooling2d({}),
          tf.layers.dense({ units: 64, activation: "relu" }),
          tf.layers.dense({ units: CLASS_NAMES.length, activation: "softmax" }),
        ],
      });
      model.compile({ optimizer: tf.train.adam(0.001), loss: "categoricalCrossentropy", metrics: ["accuracy"] });
      await model.fit(trainX, trainY, {
        epochs: epochCount,
        batchSize: 16,
        shuffle: true,
        yieldEvery: "batch",
        callbacks: {
          onEpochEnd: (_epoch, logs) => {
            setProgress(text.epoch(_epoch + 1, epochCount, logs?.loss ?? 0));
          },
        },
      });

      const predictionOutput = model.predict(testX);
      if (Array.isArray(predictionOutput)) throw new Error("Il modello CNN ha restituito più output del previsto.");
      predictions = predictionOutput;
      const predictionLabels = predictions.argMax(1);
      const predicted = Array.from(await predictionLabels.data());
      predictionLabels.dispose();
      const actual = Array.from(await testLabels.data());
      const confusionMatrix = CLASS_NAMES.map(() => CLASS_NAMES.map(() => 0));
      predicted.forEach((label, index) => {
        confusionMatrix[actual[index]][label] += 1;
      });
      const perClass = CLASS_NAMES.map((name, classIndex) => {
        const truePositive = confusionMatrix[classIndex][classIndex];
        const support = confusionMatrix[classIndex].reduce((sum, value) => sum + value, 0);
        const predictedCount = confusionMatrix.reduce((sum, row) => sum + row[classIndex], 0);
        const precision = predictedCount ? truePositive / predictedCount : 0;
        const recall = support ? truePositive / support : 0;
        return {
          name,
          precision,
          recall,
          f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0,
          support,
        };
      });
      setResult({
        accuracy: predicted.reduce((sum, label, index) => sum + Number(label === actual[index]), 0) / actual.length,
        balancedAccuracy: perClass.reduce((sum, metric) => sum + metric.recall, 0) / perClass.length,
        macroF1: perClass.reduce((sum, metric) => sum + metric.f1, 0) / perClass.length,
        testCount: actual.length,
        classNames: CLASS_NAMES,
        confusionMatrix,
        perClass,
      });
      setProgress("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.error);
    } finally {
      predictions?.dispose();
      testX?.dispose();
      trainY?.dispose();
      trainX?.dispose();
      testLabels?.dispose();
      trainingLabels?.dispose();
      model?.dispose();
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a href={EURO_SAT_URL} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />{text.download}
            </a>
          </Button>
          <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm">
            <Upload className="h-4 w-4" />{text.choose}
            <Input
              className="sr-only"
              type="file"
              accept=".zip,application/zip"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setResult(null);
                setError("");
              }}
            />
          </label>
          {file && <span className="self-center text-sm text-muted-foreground">{file.name}</span>}
        </div>
        <p className="text-sm text-muted-foreground">{text.downloadNote}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            {text.samples}
            <Input type="number" min="20" max="150" step="10" value={samplesPerClass} onChange={(event) => setSamplesPerClass(event.target.value)} />
          </label>
          <label className="space-y-2 text-sm font-medium">
            {text.epochs}
            <Input type="number" min="1" max="10" value={epochs} onChange={(event) => setEpochs(event.target.value)} />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">{text.method} {text.license}</p>
        {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        {progress && <p aria-live="polite" className="text-sm text-muted-foreground">{progress}</p>}
        <Button onClick={run} disabled={running || !file}>
          {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{text.running}</> : <><Play className="mr-2 h-4 w-4" />{text.run}</>}
        </Button>
        {result && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                [text.accuracy, result.accuracy],
                [text.balanced, result.balancedAccuracy],
                [text.f1, result.macroF1],
                [text.support, result.testCount],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-semibold">{typeof value === "number" && value <= 1 ? value.toFixed(3) : value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr><th className="p-3">{text.class}</th><th className="p-3">{text.precision}</th><th className="p-3">{text.recall}</th><th className="p-3">{text.f1}</th><th className="p-3">{text.support}</th></tr>
                </thead>
                <tbody>
                  {result.perClass.map((metric) => (
                    <tr key={metric.name} className="border-t">
                      <td className="p-3">{metric.name}</td>
                      <td className="p-3">{metric.precision.toFixed(3)}</td>
                      <td className="p-3">{metric.recall.toFixed(3)}</td>
                      <td className="p-3">{metric.f1.toFixed(3)}</td>
                      <td className="p-3">{metric.support}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <section className="space-y-3">
              <h3 className="font-semibold">{text.confusion}</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="text-xs">
                  <thead className="bg-muted/50">
                    <tr><th className="p-2 text-left">{text.actual}</th>{result.classNames.map((name) => <th key={name} className="min-w-16 p-2">{name}</th>)}</tr>
                  </thead>
                  <tbody>
                    {result.confusionMatrix.map((row, index) => (
                      <tr key={result.classNames[index]} className="border-t">
                        <th className="p-2 text-left">{result.classNames[index]}</th>
                        {row.map((count, column) => <td key={result.classNames[column]} className="p-2 text-center">{count}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
