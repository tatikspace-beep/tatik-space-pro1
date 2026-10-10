import {
  maxPythonInputBytes,
  maxPythonOutputBytes,
  maxPythonPlotBytes,
  maxPythonSourceBytes,
  truncateUtf8,
  utf8ByteLength,
  type PythonRunRequest,
  type PythonWorkerMessage,
} from './protocol';

interface PyodideRuntime {
  globals: {
    set(name: string, value: (data: string) => void): void;
  };
  loadPackage(packages: string | string[]): Promise<void>;
  setStdout(options: { batched: (text: string) => void }): void;
  setStderr(options: { batched: (text: string) => void }): void;
  setStdin(options: { stdin: () => number | null }): void;
  runPythonAsync(source: string): Promise<unknown>;
}

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.addEventListener('message', async (event: MessageEvent<PythonRunRequest>) => {
  const request = event.data;
  if (
    !request
    || request.type !== 'run'
    || !Number.isSafeInteger(request.runId)
    || typeof request.source !== 'string'
    || typeof request.stdin !== 'string'
  ) return;

  const send = (message: PythonWorkerMessage) => workerScope.postMessage(message);
  const runId = request.runId;
  if (
    utf8ByteLength(request.source) > maxPythonSourceBytes
    || utf8ByteLength(request.stdin) > maxPythonInputBytes
  ) {
    send({ type: 'error', runId, message: 'Python source or standard input exceeds the configured limit.' });
    return;
  }

  send({ type: 'loading', runId });
  try {
    const runtimeUrl = new URL('../pyodide/pyodide.mjs', workerScope.location.href).href;
    const { loadPyodide } = await import(/* @vite-ignore */ runtimeUrl) as {
      loadPyodide: (options: { indexURL: string }) => Promise<PyodideRuntime>;
    };
    const runtimeBase = new URL('../pyodide/', workerScope.location.href).href;
    const pyodide = await loadPyodide({ indexURL: runtimeBase });
    const usesMatplotlib = /(?:^|\n)\s*(?:import\s+matplotlib\b|from\s+matplotlib\b)/m.test(request.source);
    if (usesMatplotlib) await pyodide.loadPackage('matplotlib');

    const input = request.stdin && !request.stdin.endsWith('\n')
      ? `${request.stdin}\n`
      : request.stdin;
    const inputBytes = new TextEncoder().encode(input);
    let inputIndex = 0;
    pyodide.setStdin({
      stdin: () => inputIndex < inputBytes.length
        ? inputBytes[inputIndex++]
        : null,
    });
    let outputBytes = 0;
    const sendOutput = (type: 'stdout' | 'stderr', text: string) => {
      const remaining = maxPythonOutputBytes - outputBytes;
      if (remaining <= 0) return;
      const limitedText = truncateUtf8(text, remaining);
      outputBytes += limitedText.bytes;
      send({ type, runId, text: limitedText.text });
    };
    pyodide.setStdout({ batched: text => sendOutput('stdout', text) });
    pyodide.setStderr({ batched: text => sendOutput('stderr', text) });
    if (usesMatplotlib) {
      let plotBytes = 0;
      pyodide.globals.set('__tatik_emit_plot', data => {
        const bytes = Math.ceil(data.length * 3 / 4);
        if (bytes > maxPythonPlotBytes - plotBytes) {
          sendOutput('stderr', 'Matplotlib output exceeded the 1 MB display limit.\n');
          return;
        }
        plotBytes += bytes;
        send({ type: 'plot', runId, data });
      });
      await pyodide.runPythonAsync(
        "import matplotlib; matplotlib.use('agg'); import matplotlib.pyplot as plt; plt.show = lambda *args, **kwargs: None",
      );
    }
    send({ type: 'ready', runId });
    await pyodide.runPythonAsync(request.source);
    if (usesMatplotlib) {
      await pyodide.runPythonAsync(`
import base64 as __tatik_base64
import io as __tatik_io
import matplotlib.pyplot as __tatik_plt
for __tatik_number in __tatik_plt.get_fignums():
    __tatik_buffer = __tatik_io.BytesIO()
    __tatik_plt.figure(__tatik_number).savefig(__tatik_buffer, format="png")
    __tatik_emit_plot(__tatik_base64.b64encode(__tatik_buffer.getvalue()).decode("ascii"))
`);
    }
    send({ type: 'finished', runId });
  } catch (error) {
    send({
      type: 'error',
      runId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
