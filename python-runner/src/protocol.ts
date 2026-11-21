export const maxPythonSourceBytes = 100_000;
export const maxPythonInputBytes = 10_000;
export const maxPythonOutputBytes = 100_000;
export const maxPythonPlotBytes = 1_000_000;
export const pythonStartupTimeoutMs = 60_000;
export const pythonExecutionTimeoutMs = 10_000;

const textEncoder = new TextEncoder();

export function utf8ByteLength(value: string): number {
  return textEncoder.encode(value).byteLength;
}

export function truncateUtf8(value: string, maxBytes: number): { text: string; bytes: number } {
  let text = '';
  let bytes = 0;
  for (const character of value) {
    const characterBytes = utf8ByteLength(character);
    if (bytes + characterBytes > maxBytes) break;
    text += character;
    bytes += characterBytes;
  }
  return { text, bytes };
}

export interface PythonSourceUpdate {
  type: 'source-update';
  source: string;
  fileName: string;
  locale: 'it' | 'en';
}

export interface PythonRunRequest {
  type: 'run';
  runId: number;
  source: string;
  stdin: string;
}

export type PythonWorkerMessage =
  | { type: 'loading'; runId: number }
  | { type: 'ready'; runId: number }
  | { type: 'stdout' | 'stderr'; runId: number; text: string }
  | { type: 'plot'; runId: number; data: string }
  | { type: 'finished'; runId: number }
  | { type: 'error'; runId: number; message: string };
