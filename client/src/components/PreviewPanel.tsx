import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEditorOutsideCopy } from '@/lib/editorOutsideCopy';
import { normalizePreviewPath, resolvePreviewFile } from '@/lib/previewFileResolver';
import { getPreviewFileMimeType, rewritePreviewSrcset } from '@/lib/previewAssets';
import { getPreviewExecutionSupport, getPreviewRuntimeNotice } from '@/lib/previewRuntime';
import { convertPreviewImageToWebp, needsPreviewImageConversion } from '@/lib/previewImageConversion';
import type { CompiledPreviewProject } from '@/lib/previewCompiler';
import { PythonExecutionPreview } from '@/components/PythonExecutionPreview';

interface PreviewPanelProps {
  mode?: 'static' | 'vite-react' | 'compiled';
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  externalUrl?: string | null;
  localFiles?: Array<{ name?: string; path?: string; content?: string }>;
  openedFolderName?: string | null;
  entryPath?: string | null;
  pythonFileName?: string;
  pythonSource?: string;
  navigationHash?: string;
  onLinkClick?: (filePath: string, fragment?: string) => void;
}

export function PreviewPanel({ mode = 'static', htmlContent, cssContent, jsContent, externalUrl, localFiles = [], openedFolderName, entryPath, pythonFileName, pythonSource, navigationHash, onLinkClick }: PreviewPanelProps) {
  const { language } = useLanguage();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshCounter, setRefreshCounter] = React.useState(0);
  const [sizeBytes, setSizeBytes] = React.useState<number>(0);
  useEffect(() => {
    try {
      const encoder = new TextEncoder();
      const total = encoder.encode(htmlContent + cssContent + jsContent + (pythonSource || '')).length;
      setSizeBytes(total);
    } catch (e) {
      setSizeBytes((htmlContent.length + cssContent.length + jsContent.length));
    }

    if (mode === 'vite-react' || externalUrl || pythonSource !== undefined) {
      console.log('[PreviewPanel] externalUrl provided, rendering src:', externalUrl);
      // For external urls we don't inject content; leave iframe.src alone
      return;
    }

    console.log('[PreviewPanel] useEffect triggered (inject):', {
      htmlLength: htmlContent.length,
      cssLength: cssContent.length,
      jsLength: jsContent.length,
      iframeRefExists: !!iframeRef.current
    });

    if (!iframeRef.current) {
      console.log('[PreviewPanel] ❌ ERROR: iframeRef.current is null');
      return;
    }

    let cancelled = false;
    let handlePreviewMessage: ((event: MessageEvent) => void) | undefined;
    const renderPreview = async () => {
      const convertedImagePaths = new Map<string, string>();
      const convertedImageData = new Map<string, string>();
      const conversionFailures: string[] = [];
      const pendingConversions = new Map<
        string,
        { fileName: string; originalData: string }
      >();

      localFiles.forEach(file => {
        const fileName = file.path || file.name || '';
        if (!needsPreviewImageConversion(fileName) || !file.content?.startsWith('data:')) return;
        const conversionKey = `${fileName.toLowerCase()}:${file.content}`;
        if (pendingConversions.has(conversionKey)) return;
        pendingConversions.set(conversionKey, { fileName, originalData: file.content });
      });

      const conversionQueue = Array.from(pendingConversions.values());
      let nextConversionIndex = 0;
      const convertNextImage = async () => {
        while (nextConversionIndex < conversionQueue.length) {
          const { fileName, originalData } = conversionQueue[nextConversionIndex++];
          try {
            const webpData = await convertPreviewImageToWebp(fileName, originalData);
            convertedImageData.set(originalData, webpData);
            localFiles.forEach(file => {
              if (file.content === originalData) {
                const path = normalizePreviewPath(
                  file.path || file.name || '',
                  openedFolderName || '',
                ).toLowerCase();
                convertedImagePaths.set(path, webpData);
              }
            });
          } catch (error) {
            console.error(`[PreviewPanel] Unable to convert ${fileName} to WebP for preview`, error);
            conversionFailures.push(fileName);
          }
        }
      };
      const conversionWorkers = Math.min(2, conversionQueue.length);
      await Promise.all(Array.from({ length: conversionWorkers }, convertNextImage));
      if (cancelled) return;

      const normalizePath = (value: string) => normalizePreviewPath(value, openedFolderName || '');
      const resolveFile = (reference: string, basePath = '') =>
        resolvePreviewFile(localFiles, reference, basePath, openedFolderName || '');
      const unresolvedAssets = new Set<string>();
      const buildRequiredFiles = new Set<string>();
      const compiledStylesheets = new Map<string, string>();
      const stylesheetCompileFailures = new Map<string, string>();
      let compiledProject: CompiledPreviewProject | undefined;
      let compileEntryPath = '';
      let mountDefaultComponent = false;
      let compileError = '';
      const isLocalReference = (reference: string) =>
        !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference.trim());

      const compileExtension = /\.(?:jsx|tsx?|mjs|js|vue|svelte)$/i;
      const sourceDocument = new DOMParser().parseFromString(htmlContent, 'text/html');
      const moduleScript = Array.from(sourceDocument.querySelectorAll('script[src]'))
        .find(script => {
          const resolved = resolveFile(script.getAttribute('src') || '', entryPath || 'index.html');
          return resolved && (
            /\.(?:jsx|tsx?|vue|svelte)$/i.test(resolved.path)
            || (script.getAttribute('type') === 'module' && /\.(?:m?js)$/i.test(resolved.path))
          );
        });
      if (moduleScript) {
        const resolved = resolveFile(moduleScript.getAttribute('src') || '', entryPath || 'index.html');
        compileEntryPath = resolved?.path || '';
      }
      if (!compileEntryPath) {
        const conventionalEntry = localFiles.find(file =>
          /(?:^|\/)(?:src\/)?(?:main|index)\.(?:tsx?|jsx|m?js|vue|svelte)$/i.test(
            normalizePath(file.path || file.name || ''),
          ),
        );
        compileEntryPath = conventionalEntry
          ? normalizePath(conventionalEntry.path || conventionalEntry.name || '')
          : '';
        mountDefaultComponent = Boolean(conventionalEntry && /\.(?:vue|svelte)$/i.test(compileEntryPath));
      }
      if (!compileEntryPath && entryPath && compileExtension.test(entryPath)) {
        compileEntryPath = resolveFile(entryPath)?.path || entryPath;
        mountDefaultComponent = /\.(?:jsx|tsx|vue|svelte)$/i.test(compileEntryPath);
      }
      if (compileEntryPath) {
        try {
          const { compilePreviewProject } = await import('@/lib/previewCompiler');
          compiledProject = await compilePreviewProject(
            localFiles,
            compileEntryPath,
            openedFolderName || '',
            { mountDefaultComponent },
          );
        } catch (error) {
          compileError = error instanceof Error ? error.message : String(error);
          console.error(`[PreviewPanel] Unable to compile ${compileEntryPath} for preview`, error);
        }
      }
      if (cancelled) return;

      const toLocalUrl = (file: (typeof localFiles)[number] | undefined) => {
        if (!file || typeof file.content !== 'string') return undefined;
        const path = normalizePath(file.path || file.name || '').toLowerCase();
        const convertedImage = convertedImagePaths.get(path) || convertedImageData.get(file.content);
        if (convertedImage) return convertedImage;
        if (file.content.startsWith('data:')) return file.content;
        const mimeType = getPreviewFileMimeType(file.name || file.path || '');
        return `data:${mimeType};charset=utf-8,${encodeURIComponent(file.content)}`;
      };

      const styleFiles = localFiles.filter(file =>
        /\.(?:scss|sass|less)$/i.test(file.path || file.name || '')
        && typeof file.content === 'string',
      );
      if (styleFiles.length > 0) {
        const { compilePreviewStylesheet } = await import('@/lib/previewStyleCompiler');
        await Promise.all(styleFiles.map(async file => {
          const filePath = normalizePath(file.path || file.name || '');
          try {
            compiledStylesheets.set(
              filePath.toLowerCase(),
              await compilePreviewStylesheet(filePath, file.content || ''),
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            stylesheetCompileFailures.set(filePath.toLowerCase(), message);
            console.error(`[PreviewPanel] Unable to compile stylesheet ${filePath}`, error);
          }
        }));
      }
      if (cancelled) return;

    const rewriteCss = (css: string, sourcePath = '', importedPaths = new Set<string>()): string => {
      const withImports = css.replace(
        /@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^'"\s)]+))\s*\)?\s*([^;]*);/gi,
        (match, doubleQuoted, singleQuoted, unquoted, conditions) => {
          const reference = doubleQuoted || singleQuoted || unquoted;
          const resolved = resolveFile(reference, sourcePath);
          if (!resolved) {
            if (isLocalReference(reference)) unresolvedAssets.add(reference);
            return match;
          }
          if (getPreviewExecutionSupport(resolved.path) !== 'browser' || !/\.css$/i.test(resolved.path)) {
            buildRequiredFiles.add(resolved.path);
            return match;
          }
          if (typeof resolved.file.content !== 'string') return match;

          const path = resolved.path.toLowerCase();
          if (importedPaths.has(path)) return '';
          importedPaths.add(path);

          const importedCss = rewriteCss(
            resolved.file.content,
            resolved.file.path || resolved.file.name || '',
            importedPaths,
          );
          const media = (conditions || '').trim();
          return media ? `@media ${media} { ${importedCss} }` : importedCss;
        },
      );

      return withImports.replace(
        /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi,
      (match, quote, reference) => {
        const resolved = resolveFile(reference, sourcePath);
      const url = convertedImageData.get(reference) || toLocalUrl(resolved?.file);
        if (!url && isLocalReference(reference)) unresolvedAssets.add(reference);
        const suffix = reference.match(/[?#].*$/)?.[0] || '';
        return url ? `url("${url}${url.startsWith('data:') ? '' : suffix}")` : match;
      },
      );
    };

    const rewriteHtml = (html: string) => {
      const parser = new DOMParser();
      const parsed = parser.parseFromString(html, 'text/html');
      const sourcePath = entryPath || localFiles.find(file => file.content === html)?.path || 'index.html';
      const linkedCssPaths = new Set<string>();
      const linkedScriptPaths = new Set<string>();

      parsed.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
        const resolved = resolveFile(link.getAttribute('href') || '', sourcePath);
        if (resolved && typeof resolved.file.content === 'string') {
          if (!/\.(?:css|scss|sass|less)$/i.test(resolved.path)) {
            buildRequiredFiles.add(resolved.path);
            link.remove();
            return;
          }
          const resolvedPath = normalizePath(resolved.path).toLowerCase();
          const css = compiledStylesheets.get(resolvedPath) || resolved.file.content;
          if (stylesheetCompileFailures.has(resolvedPath)) {
            link.remove();
            return;
          }
          const style = parsed.createElement('style');
          for (const attribute of ['media', 'title']) {
            const value = link.getAttribute(attribute);
            if (value) style.setAttribute(attribute, value);
          }
          linkedCssPaths.add(resolvedPath);
          style.textContent = rewriteCss(
            css,
            resolved.file.path || resolved.file.name || '',
            new Set([resolved.path.toLowerCase()]),
          );
          link.replaceWith(style);
        }
      });

      parsed.querySelectorAll('script[src]').forEach(script => {
        const resolved = resolveFile(script.getAttribute('src') || '', sourcePath);
        if (resolved && typeof resolved.file.content === 'string') {
          if (compileExtension.test(resolved.path) && resolved.path.toLowerCase() === compileEntryPath.toLowerCase()) {
            linkedScriptPaths.add(resolved.path);
            script.remove();
            return;
          }
          if (getPreviewExecutionSupport(resolved.path) !== 'browser') {
            buildRequiredFiles.add(resolved.path);
            linkedScriptPaths.add(resolved.path);
            script.remove();
            return;
          }
          const type = script.getAttribute('type');
          if (type === 'module') {
            const localUrl = toLocalUrl(resolved.file);
            if (localUrl) script.setAttribute('src', localUrl);
          } else {
            script.removeAttribute('src');
            script.textContent = resolved.file.content;
          }
          linkedScriptPaths.add(resolved.path);
        }
      });

      const rewriteLocalAssets = (root: ParentNode) => {
        root.querySelectorAll('[src], [href], [poster]').forEach(element => {
          if (element instanceof HTMLAnchorElement) return;
          const attribute = element.hasAttribute('src') ? 'src' : element.hasAttribute('poster') ? 'poster' : 'href';
          const reference = element.getAttribute(attribute);
          if (!reference || reference.startsWith('#')) return;
          const resolved = resolveFile(reference, sourcePath);
          const url = convertedImageData.get(reference) || toLocalUrl(resolved?.file);
          if (url) {
            const suffix = reference.match(/[?#].*$/)?.[0] || '';
            element.setAttribute(attribute, `${url}${url.startsWith('data:') ? '' : suffix}`);
          } else if (isLocalReference(reference)) unresolvedAssets.add(reference);
        });
        root.querySelectorAll('[srcset]').forEach(element => {
          const srcset = element.getAttribute('srcset');
          if (!srcset) return;
          const rewritten = rewritePreviewSrcset(srcset, reference => {
            const resolved = resolveFile(reference, sourcePath);
            const url = convertedImageData.get(reference) || toLocalUrl(resolved?.file);
            if (!url && isLocalReference(reference)) unresolvedAssets.add(reference);
            const suffix = reference.match(/[?#].*$/)?.[0] || '';
            return url ? `${url}${url.startsWith('data:') ? '' : suffix}` : reference;
          });
          element.setAttribute('srcset', rewritten);
        });
      };

      rewriteLocalAssets(parsed.head);
      rewriteLocalAssets(parsed.body);
      parsed.head.querySelectorAll('style').forEach(style => {
        style.textContent = rewriteCss(style.textContent || '', sourcePath);
      });

      const diagnostics: string[] = [];
      if (compiledProject) {
        const compiledFrameworks = [
          compiledProject.requiresReact ? 'React' : '',
          compiledProject.requiresVue ? 'Vue' : '',
          compiledProject.requiresSvelte ? 'Svelte' : '',
        ].filter(Boolean).join(', ');
        diagnostics.push(language.toLowerCase().startsWith('it')
          ? `Compilazione browser attiva${compiledFrameworks ? ` (${compiledFrameworks})` : ''}. TypeScript viene trasformato senza controllo dei tipi; i pacchetti npm aggiuntivi non sono disponibili.`
          : `Browser compilation is active${compiledFrameworks ? ` (${compiledFrameworks})` : ''}. TypeScript is transpiled without type-checking; additional npm packages are unavailable.`);
      }
      if (compileError) {
        diagnostics.push(language.toLowerCase().startsWith('it')
          ? `Compilazione Preview non riuscita: ${compileError}`
          : `Preview build failed: ${compileError}`);
      }
      if (buildRequiredFiles.size > 0) {
        const [fileName] = buildRequiredFiles;
        const notice = getPreviewRuntimeNotice(fileName, language);
        diagnostics.push(`${notice.heading}: ${notice.explanation}`);
      }
      if (compiledStylesheets.size > 0) {
        diagnostics.push(language.toLowerCase().startsWith('it')
          ? `Fogli di stile compilati nel browser: ${Array.from(compiledStylesheets.keys()).join(', ')}.`
          : `Stylesheets compiled in the browser: ${Array.from(compiledStylesheets.keys()).join(', ')}.`);
      }
      if (stylesheetCompileFailures.size > 0) {
        const failures = Array.from(stylesheetCompileFailures, ([path, message]) => `${path}: ${message}`).join(' ');
        diagnostics.push(language.toLowerCase().startsWith('it')
          ? `Compilazione CSS non riuscita. ${failures}`
          : `CSS compilation failed. ${failures}`);
      }
      if (unresolvedAssets.size > 0) {
        const references = Array.from(unresolvedAssets).join(', ');
        diagnostics.push(language.toLowerCase().startsWith('it')
          ? `Risorse locali non trovate: ${references}. Controlla percorso e nome del file.`
          : `Local assets not found: ${references}. Check the file path and name.`);
      }
      if (conversionFailures.length > 0) {
        const fileNames = conversionFailures.join(', ');
        diagnostics.push(language.toLowerCase().startsWith('it')
          ? `Conversione WebP non riuscita per: ${fileNames}. Il file originale è stato mantenuto.`
          : `Could not convert to WebP: ${fileNames}. The original files were kept.`);
      }
      if (diagnostics.length > 0) {
        const diagnostic = parsed.createElement('aside');
        diagnostic.setAttribute('role', 'status');
        diagnostic.style.cssText = 'position:relative;z-index:2147483647;margin:12px;padding:12px 16px;border:1px solid #f59e0b;border-radius:8px;background:#fffbeb;color:#78350f;font:14px/1.5 system-ui,sans-serif;overflow-wrap:anywhere';
        diagnostic.textContent = diagnostics.join(' ');
        parsed.body.prepend(diagnostic);
      }

      const projectStyles = localFiles
        .filter(file => {
          const path = normalizePath(file.path || file.name || '').toLowerCase();
          return /\.(?:css|scss|sass|less)$/i.test(path)
            && typeof file.content === 'string'
            && !linkedCssPaths.has(path)
            && !stylesheetCompileFailures.has(path);
        })
        .map(file => {
          const path = normalizePath(file.path || file.name || '').toLowerCase();
          const css = compiledStylesheets.get(path) || file.content || '';
          return `<style>${rewriteCss(css, file.path || file.name || '', new Set([path]))}</style>`;
        })
        .join('\n');
      const projectScripts = localFiles
        .filter(file => {
          const path = normalizePath(file.path || file.name || '').toLowerCase();
          return /\.js$/i.test(path)
            && typeof file.content === 'string'
            && !linkedScriptPaths.has(path)
            && !compiledProject?.inputPaths.has(path);
        })
        .map(file => {
          const content = (file.content || '').replace(/<\/script/gi, '<\\/script');
          return `<script>${content}</script>`;
        })
        .join('\n');

      const hasProjectStyles = localFiles.some(file => /\.(?:css|scss|sass|less)$/i.test(file.path || file.name || '') && typeof file.content === 'string');
      const hasProjectScripts = localFiles.some(file => /\.js$/i.test(file.path || file.name || '') && typeof file.content === 'string');
      const extraStyles = projectStyles || (!hasProjectStyles && cssContent ? `<style>${rewriteCss(cssContent, sourcePath)}</style>` : '');
      const compiledScripts = compiledProject
        ? [
            compiledProject.requiresReact ? '<script src="/preview-react-runtime.js"></script>' : '',
            compiledProject.requiresVue || compiledProject.requiresSvelte ? '<script src="/preview-framework-runtime.js"></script>' : '',
            `<script>${compiledProject.code.replace(/<\/script/gi, '<\\/script')}</script>`,
          ].filter(Boolean).join('\n')
        : '';
      const extraScripts = [
        projectScripts || (!hasProjectScripts && jsContent ? `<script>${jsContent}</script>` : ''),
        compiledScripts,
      ].filter(Boolean).join('\n');
      const compiledStyles = compiledProject?.css ? `<style>${rewriteCss(compiledProject.css, compileEntryPath)}</style>` : '';
      return {
        head: parsed.head.innerHTML,
        body: parsed.body.innerHTML,
        extraStyles: `${extraStyles}\n${compiledStyles}`,
        extraScripts,
        sourcePath,
      };
    };

    const rewrittenHtml = rewriteHtml(htmlContent);
    const imageLoadErrorMessage = language.toLowerCase().startsWith('it')
      ? 'Immagine non visualizzabile (formato non supportato o file non disponibile): '
      : 'Image could not be displayed (unsupported format or unavailable file): ';
    const imageLoadErrorHandler = `<script>(()=>{const message=${JSON.stringify(imageLoadErrorMessage)};const markFailed=image=>{image.alt=message+(image.currentSrc||image.src);image.title=image.alt;};document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement)markFailed(event.target);},true);document.querySelectorAll('img').forEach(image=>{if(image.complete&&image.naturalWidth===0)markFailed(image);});})();</script>`;
    const runtimeErrorHandler = `<script>(()=>{const report=message=>{let panel=document.getElementById('tatik-preview-runtime-error');if(!panel){panel=document.createElement('aside');panel.id='tatik-preview-runtime-error';panel.setAttribute('role','alert');panel.style.cssText='position:relative;z-index:2147483647;margin:12px;padding:12px 16px;border:1px solid #ef4444;border-radius:8px;background:#fef2f2;color:#7f1d1d;font:14px/1.5 system-ui,sans-serif;overflow-wrap:anywhere';document.body.prepend(panel)}panel.textContent=${JSON.stringify(language.toLowerCase().startsWith('it') ? 'Errore durante l’esecuzione della Preview: ' : 'Preview runtime error: ')}+message;parent.postMessage({source:'tatik-preview',type:'runtime-error',message},'*')};window.addEventListener('error',event=>{report(event.message||event.target?.src||'Script loading failed')});window.addEventListener('unhandledrejection',event=>{report(String(event.reason?.message||event.reason||'Unhandled promise rejection'))})})();</script>`;
    const localLinkHandler = onLinkClick
      ? `<script>(()=>{document.addEventListener('click',event=>{const target=event.target;const link=target instanceof Element?target.closest('a'):null;if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||(link.target&&link.target.toLowerCase()!=='_self'))return;const href=link.getAttribute('href')||'';if(!href||/^(?:[a-z]+:|\\/\\/|#)/i.test(href))return;event.preventDefault();parent.postMessage({source:'tatik-preview',type:'local-link',href},'*');},true);})();</script>`
      : '';
    const navigationScript = navigationHash
      ? `<script>(()=>{const fragment=${JSON.stringify((() => {
          try {
            return decodeURIComponent(navigationHash.replace(/^#/, ''));
          } catch {
            return navigationHash.replace(/^#/, '');
          }
        })())};requestAnimationFrame(()=>{const target=document.getElementById(fragment)||Array.from(document.getElementsByName(fragment))[0];target?.scrollIntoView();});})();</script>`
      : '';

    // Create complete HTML with CSS and JS
    const completeHTML = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          html { height: 100%; margin: 0; padding: 0; }
          body { 
            height: 100%; 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; 
            overflow: scroll;
            display: block;
          }
        </style>
        ${rewrittenHtml.extraStyles}
        ${rewrittenHtml.head}
      </head>
      <body>
        ${rewrittenHtml.body}
        ${imageLoadErrorHandler}
        ${runtimeErrorHandler}
        ${localLinkHandler}
        ${navigationScript}
        ${rewrittenHtml.extraScripts}
      </body>
      </html>`;

    try {
      if (onLinkClick) {
        const targetWindow = iframeRef.current?.contentWindow;
        handlePreviewMessage = event => {
          if (event.source !== targetWindow || event.origin !== 'null') return;
          const data = event.data as { source?: unknown; type?: unknown; href?: unknown; message?: unknown } | null;
          if (!data || data.source !== 'tatik-preview') return;
          if (data.type === 'runtime-error' && typeof data.message === 'string') {
            console.error('[PreviewPanel] Preview runtime error:', data.message);
            return;
          }
          if (
            data.type !== 'local-link'
            || typeof data.href !== 'string'
            || data.href.length > 2048
            || /^(?:[a-z]+:|\/\/|#)/i.test(data.href)
          ) return;
          const resolved = resolveFile(data.href, rewrittenHtml.sourcePath);
          const fragment = data.href.includes('#') ? data.href.slice(data.href.indexOf('#')) : '';
          onLinkClick(resolved?.file.path || resolved?.file.name || data.href, fragment);
        };
        window.addEventListener('message', handlePreviewMessage);
      }
      if (!iframeRef.current) throw new Error('Preview iframe is unavailable');
      iframeRef.current.srcdoc = completeHTML;
      console.log('[PreviewPanel] ✅ Isolated preview document loaded');
    } catch (e) {
      console.error('[PreviewPanel] Error writing to iframe:', e);
    }
    };

    void renderPreview();

    return () => {
      cancelled = true;
      if (handlePreviewMessage) window.removeEventListener('message', handlePreviewMessage);
    };
  }, [mode, htmlContent, cssContent, jsContent, externalUrl, localFiles, openedFolderName, entryPath, pythonFileName, pythonSource, navigationHash, onLinkClick, refreshCounter]);
  // Render iframe with refresh button overlay
  const handleRefresh = () => {
    if (externalUrl) {
      try {
        iframeRef.current?.contentWindow?.location.reload();
      } catch (e) {
        // fallback: reset src
        if (iframeRef.current) {
          const src = iframeRef.current.src;
          iframeRef.current.src = src;
        }
      }
      return;
    }

    // For injected content, bump counter to re-run injection effect
    setRefreshCounter(c => c + 1);
  };

  return (
    <div className="relative w-full h-full" style={{ width: '100%', height: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
      {/* Optimize overlay: size + Optimize button (affiliate) */}
      <div className="absolute top-2 right-2 z-40 flex items-center gap-2">
        <div className="text-[12px] text-slate-200 bg-slate-800/70 px-2 py-1 rounded">{getEditorOutsideCopy(language, 'previewSize', { size: (sizeBytes / 1024).toFixed(2) })}</div>
        <button
          onClick={() => {
            try {
              fetch('/api/analytics/optimize-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ size: sizeBytes, timestamp: new Date().toISOString() }) }).catch(() => { });
            } catch (e) { }
            window.open('https://example.com/compress?utm_source=tatik_optimize&utm_medium=app', '_blank', 'noopener,noreferrer');
          }}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
        >
          {getEditorOutsideCopy(language, 'optimize')}
        </button>
      </div>
      {pythonSource !== undefined && pythonFileName ? (
        <PythonExecutionPreview
          key={pythonFileName}
          fileName={pythonFileName}
          source={pythonSource}
          locale={language}
        />
      ) : externalUrl ? (
        <iframe
          ref={iframeRef}
          src={externalUrl}
          className="border-0"
          style={{ width: '100%', height: '100%', display: 'block' }}
          title={getEditorOutsideCopy(language, 'externalPreviewTitle')}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      ) : (
        <iframe
          ref={iframeRef}
          className="border-0"
          style={{ width: '100%', height: '100%', display: 'block' }}
          title={getEditorOutsideCopy(language, 'previewTitle')}
          sandbox="allow-scripts allow-forms allow-popups"
        />
      )}
    </div>
  );
}
