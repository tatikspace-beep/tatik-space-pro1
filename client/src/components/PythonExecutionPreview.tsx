import { useCallback, useEffect, useRef } from 'react';

interface PythonExecutionPreviewProps {
  fileName: string;
  source: string;
  locale: string;
}

const maxPythonSourceBytes = 100_000;

function getRunnerOrigin(): string | null {
  const configuredUrl = import.meta.env.VITE_PYTHON_RUNNER_URL?.trim();
  if (!configuredUrl) return null;
  try {
    const url = new URL(configuredUrl);
    const localDevelopment = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (
      (url.protocol !== 'https:' && !(localDevelopment && url.protocol === 'http:'))
      || url.username
      || url.password
      || url.pathname !== '/'
      || url.search
      || url.hash
    ) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function PythonExecutionPreview({ fileName, source, locale }: PythonExecutionPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const runnerOrigin = getRunnerOrigin();
  const isItalian = locale.toLowerCase().startsWith('it');
  const sourceBytes = new TextEncoder().encode(source).byteLength;

  const sendSource = useCallback(() => {
    const target = iframeRef.current?.contentWindow;
    if (!target || !runnerOrigin) return;
    target.postMessage({
      type: 'source-update',
      fileName,
      source,
      locale: isItalian ? 'it' : 'en',
    }, runnerOrigin);
  }, [fileName, isItalian, runnerOrigin, source]);

  useEffect(() => {
    if (!runnerOrigin) return;
    const timer = window.setTimeout(sendSource, 100);
    return () => window.clearTimeout(timer);
  }, [runnerOrigin, sendSource]);

  if (!runnerOrigin) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6 text-center text-sm text-slate-700">
        {isItalian
          ? 'Runtime Python non configurato per questa Preview. Il codice non viene inviato né eseguito.'
          : 'Python runtime is not configured for this preview. The code is not sent or executed.'}
      </div>
    );
  }

  if (sourceBytes > maxPythonSourceBytes) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6 text-center text-sm text-slate-700">
        {isItalian
          ? 'Il file supera il limite di esecuzione Python di 100 KB.'
          : 'The file exceeds the 100 KB Python execution limit.'}
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      src={`${runnerOrigin}/`}
      onLoad={sendSource}
      title={isItalian ? 'Esecuzione Python isolata' : 'Isolated Python execution'}
      referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin"
      className="h-full w-full border-0"
    />
  );
}
