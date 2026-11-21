export type PreviewExecutionSupport = 'browser' | 'browser-wasm' | 'compiled' | 'build' | 'runtime' | 'tool' | 'data';

const browserRunnableExtensions = new Set(['html', 'htm', 'css', 'js', 'javascript']);
const browserWasmExtensions = new Set(['py']);
const browserCompiledExtensions = new Set(['ts', 'tsx', 'jsx', 'mjs', 'vue', 'svelte', 'scss', 'sass', 'less']);
const nonExecutableDataExtensions = new Set(['json', 'xml', 'md', 'markdown', 'yaml', 'yml', 'toml', 'ini', 'conf']);
const externalToolFileNames = new Set(['dockerfile', 'makefile']);

function getFileExtension(fileName: string): string {
  const path = fileName.split(/[?#]/, 1)[0] || '';
  const baseName = path.split(/[\\/]/).pop()?.toLowerCase() || '';
  return baseName.split('.').pop() || '';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

export function getPreviewExecutionSupport(fileName: string): PreviewExecutionSupport {
  const extension = getFileExtension(fileName);
  if (browserRunnableExtensions.has(extension)) return 'browser';
  if (browserWasmExtensions.has(extension)) return 'browser-wasm';
  if (browserCompiledExtensions.has(extension)) return 'compiled';
  if (externalToolFileNames.has(extension)) return 'tool';
  if (nonExecutableDataExtensions.has(extension)) return 'data';
  return 'runtime';
}

export function getPreviewRuntimeNotice(fileName: string, locale: string): { heading: string; explanation: string } {
  const extension = getFileExtension(fileName);
  const languageNames: Record<string, string> = {
    c: 'C',
    cc: 'C++',
    cjs: 'CommonJS',
    cpp: 'C++',
    cs: 'C#',
    cxx: 'C++',
    dart: 'Dart',
    dockerfile: 'Dockerfile',
    makefile: 'Makefile',
    fish: 'Shell',
    go: 'Go',
    h: 'C/C++ header',
    hpp: 'C++ header',
    less: 'Less',
    ini: 'INI',
    java: 'Java',
    json: 'JSON',
    kt: 'Kotlin',
    lua: 'Lua',
    m: 'Objective-C',
    bash: 'Shell',
    conf: 'configuration',
    markdown: 'Markdown',
    md: 'Markdown',
    mm: 'Objective-C++',
    mjs: 'JavaScript modules',
    php: 'PHP',
    py: 'Python',
    rb: 'Ruby',
    r: 'R',
    rs: 'Rust',
    sass: 'Sass',
    scss: 'SCSS',
    sh: 'Shell',
    sql: 'SQL',
    svelte: 'Svelte',
    swift: 'Swift',
    ts: 'TypeScript',
    tsx: 'TypeScript/React',
    jsx: 'JavaScript/React',
    toml: 'TOML',
    xml: 'XML',
    vue: 'Vue',
    zsh: 'Shell',
    yaml: 'YAML',
    yml: 'YAML',
  };
  const language = languageNames[extension] || extension.toUpperCase() || 'file';
  const support = getPreviewExecutionSupport(fileName);
  const isItalian = locale.toLowerCase().startsWith('it');
  const isFrameworkComponent = extension === 'vue' || extension === 'svelte';
  const isStylePreprocessor = ['scss', 'sass', 'less'].includes(extension);
  const heading = support === 'browser-wasm'
    ? isItalian ? `Esecuzione browser disponibile per ${language}` : `${language} browser execution available`
    : support === 'compiled'
    ? isItalian ? `Compilazione Preview disponibile per ${language}` : `${language} Preview compilation available`
    : isItalian ? `Anteprima non disponibile per ${language}` : `No live preview for ${language}`;
  const explanation = support === 'browser-wasm'
    ? isItalian
      ? 'Python viene eseguito nel browser in un runner isolato. Il sorgente resta nel browser; sono disponibili solo le librerie compatibili incluse e non è consentito l’accesso alla rete esterna.'
      : 'Python runs in your browser inside an isolated runner. Source stays in the browser; only included compatible packages are available and external network access is blocked.'
    : support === 'compiled'
    ? isItalian
      ? isFrameworkComponent
        ? `${language} viene compilato nel browser con il runtime incluso. Import npm aggiuntivi e plugin esterni non sono disponibili.`
        : isStylePreprocessor
          ? `${language} viene compilato nel browser. Gli import Sass/Less sono disabilitati per sicurezza; incorpora gli stili importati nel file.`
          : extension === 'mjs'
            ? 'I moduli JavaScript vengono raggruppati nel browser per entry point riconosciuti; i pacchetti npm aggiuntivi non sono disponibili.'
            : `${language} può essere compilato nel browser per entry point di progetto riconosciuti. TypeScript viene trasformato senza controllo dei tipi; JSX/TSX usa il runtime React incluso.`
      : isFrameworkComponent
        ? `${language} is compiled in the browser with the included runtime. Additional npm imports and external plugins are unavailable.`
        : isStylePreprocessor
          ? `${language} is compiled in the browser. Sass/Less imports are disabled for safety; inline imported styles in the file.`
          : extension === 'mjs'
            ? 'JavaScript modules are bundled in the browser for recognized entry points; additional npm packages are unavailable.'
            : `${language} can be browser-compiled for recognized project entry points. TypeScript is transpiled without type-checking; JSX/TSX uses the included React runtime.`
    : support === 'data'
    ? isItalian
      ? `${language} è un formato di dati o documentazione, non un linguaggio eseguibile. Puoi modificarlo nell’Editor.`
      : `${language} is a data or documentation format, not an executable language. You can edit it here.`
    : support === 'tool'
      ? isItalian
        ? `${language} contiene istruzioni per strumenti esterni; la Preview browser non esegue build o container. Puoi modificarlo nell’Editor.`
        : `${language} contains instructions for external tools; the browser preview does not run builds or containers. You can edit it here.`
    : support === 'build'
      ? isItalian
        ? `${language} è modificabile, ma il relativo compilatore non è integrato nella Preview. Serve una build di progetto specifica.`
        : `${language} is editable, but its compiler is not integrated into the preview. A framework- or stylesheet-specific build is required.`
    : isItalian
      ? `Il file si può modificare nell’Editor. L’anteprima esegue HTML, CSS e JavaScript del browser; per ${language} serve un runtime dedicato, non incluso.`
      : `You can edit this file here. The preview runs HTML, CSS, and browser JavaScript; ${language} needs a dedicated runtime, which is not included.`;

  return { heading, explanation };
}

export function createPreviewRuntimeDocument(heading: string, explanation: string, locale: string): string {
  const isItalian = locale.toLowerCase().startsWith('it');
  return `<!doctype html><html lang="${isItalian ? 'it' : 'en'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f8fafc;color:#1e293b;font:16px/1.6 system-ui,sans-serif"><main style="max-width:560px;margin:24px;padding:28px;border:1px solid #cbd5e1;border-radius:16px;background:white"><h1 style="font-size:1.35rem;margin:0 0 12px">${escapeHtml(heading)}</h1><p style="margin:0">${escapeHtml(explanation)}</p></main></body></html>`;
}
