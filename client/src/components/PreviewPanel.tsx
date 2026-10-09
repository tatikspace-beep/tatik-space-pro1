import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEditorOutsideCopy } from '@/lib/editorOutsideCopy';
import { normalizePreviewPath, resolvePreviewFile } from '@/lib/previewFileResolver';

interface PreviewPanelProps {
  mode?: 'static' | 'vite-react';
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  externalUrl?: string | null;
  localFiles?: Array<{ name?: string; path?: string; content?: string }>;
  openedFolderName?: string | null;
  entryPath?: string | null;
  navigationHash?: string;
  onLinkClick?: (filePath: string, fragment?: string) => void;
}

export function PreviewPanel({ mode = 'static', htmlContent, cssContent, jsContent, externalUrl, localFiles = [], openedFolderName, entryPath, navigationHash, onLinkClick }: PreviewPanelProps) {
  const { language } = useLanguage();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshCounter, setRefreshCounter] = React.useState(0);
  const [sizeBytes, setSizeBytes] = React.useState<number>(0);
  useEffect(() => {
    try {
      const encoder = new TextEncoder();
      const total = encoder.encode(htmlContent + cssContent + jsContent).length;
      setSizeBytes(total);
    } catch (e) {
      setSizeBytes((htmlContent.length + cssContent.length + jsContent.length));
    }

    if (mode === 'vite-react' || externalUrl) {
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

    const doc = iframeRef.current.contentDocument;
    if (!doc) {
      console.log('[PreviewPanel] ❌ ERROR: contentDocument is null');
      return;
    }

    const normalizePath = (value: string) => normalizePreviewPath(value, openedFolderName || '');
    const resolveFile = (reference: string, basePath = '') =>
      resolvePreviewFile(localFiles, reference, basePath, openedFolderName || '');
    const objectUrls: string[] = [];

    const mimeTypeFor = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      const types: Record<string, string> = {
        css: 'text/css',
        js: 'text/javascript',
        json: 'application/json',
        html: 'text/html',
        svg: 'image/svg+xml',
        xml: 'application/xml',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        ico: 'image/x-icon',
        bmp: 'image/bmp',
        avif: 'image/avif',
        apng: 'image/apng',
        tif: 'image/tiff',
        tiff: 'image/tiff',
        webp: 'image/webp',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        mp4: 'video/mp4',
        webm: 'video/webm',
        mov: 'video/quicktime',
        woff: 'font/woff',
        woff2: 'font/woff2',
        ttf: 'font/ttf',
        otf: 'font/otf',
      };
      return types[extension || ''] || 'text/plain';
    };

    const toLocalUrl = (file: (typeof localFiles)[number] | undefined) => {
      if (!file || typeof file.content !== 'string') return undefined;
      if (file.content.startsWith('data:')) return file.content;
      const path = normalizePath(file.path || file.name || '').toLowerCase();
      const existingUrl = fileObjectUrls.get(path);
      if (existingUrl) return existingUrl;
      const blob = new Blob([file.content], { type: mimeTypeFor(file.name || file.path || '') });
      const url = URL.createObjectURL(blob);
      objectUrls.push(url);
      fileObjectUrls.set(path, url);
      return url;
    };

    const fileObjectUrls = new Map<string, string>();
    const rewriteCss = (css: string, sourcePath = '', importedPaths = new Set<string>()): string => {
      const withImports = css.replace(
        /@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^'"\s)]+))\s*\)?\s*([^;]*);/gi,
        (match, doubleQuoted, singleQuoted, unquoted, conditions) => {
          const reference = doubleQuoted || singleQuoted || unquoted;
          const resolved = resolveFile(reference, sourcePath);
          if (!resolved || !/\.css$/i.test(resolved.path) || typeof resolved.file.content !== 'string') return match;

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
        const url = toLocalUrl(resolved?.file);
        const suffix = reference.match(/[?#].*$/)?.[0] || '';
        return url ? `url("${url}${suffix}")` : match;
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
          const style = parsed.createElement('style');
          for (const attribute of ['media', 'title']) {
            const value = link.getAttribute(attribute);
            if (value) style.setAttribute(attribute, value);
          }
          style.textContent = rewriteCss(
            resolved.file.content,
            resolved.file.path || resolved.file.name || '',
            new Set([resolved.path.toLowerCase()]),
          );
          link.replaceWith(style);
          linkedCssPaths.add(resolved.path);
        }
      });

      parsed.querySelectorAll('script[src]').forEach(script => {
        const resolved = resolveFile(script.getAttribute('src') || '', sourcePath);
        if (resolved && typeof resolved.file.content === 'string') {
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
          const url = toLocalUrl(resolved?.file);
          if (url) element.setAttribute(attribute, `${url}${reference.match(/[?#].*$/)?.[0] || ''}`);
        });
        root.querySelectorAll('[srcset]').forEach(element => {
          const srcset = element.getAttribute('srcset');
          if (!srcset) return;
          const rewritten = srcset.split(',').map(candidate => {
            const [reference, ...descriptors] = candidate.trim().split(/\s+/);
            const resolved = resolveFile(reference, sourcePath);
            const url = toLocalUrl(resolved?.file);
            const suffix = reference.match(/[?#].*$/)?.[0] || '';
            return `${url ? `${url}${suffix}` : reference}${descriptors.length ? ` ${descriptors.join(' ')}` : ''}`;
          }).join(', ');
          element.setAttribute('srcset', rewritten);
        });
      };

      rewriteLocalAssets(parsed.head);
      rewriteLocalAssets(parsed.body);
      parsed.head.querySelectorAll('style').forEach(style => {
        style.textContent = rewriteCss(style.textContent || '', sourcePath);
      });

      const projectStyles = localFiles
        .filter(file => {
          const path = normalizePath(file.path || file.name || '').toLowerCase();
          return /\.css$/i.test(path) && typeof file.content === 'string' && !linkedCssPaths.has(path);
        })
        .map(file => {
          const path = normalizePath(file.path || file.name || '').toLowerCase();
          return `<style>${rewriteCss(file.content || '', file.path || file.name || '', new Set([path]))}</style>`;
        })
        .join('\n');
      const projectScripts = localFiles
        .filter(file => {
          const path = normalizePath(file.path || file.name || '').toLowerCase();
          return /\.(?:js|ts)$/i.test(path) && !/\.d\.ts$/i.test(path) && typeof file.content === 'string' && !linkedScriptPaths.has(path);
        })
        .map(file => {
          const content = (file.content || '').replace(/<\/script/gi, '<\\/script');
          return `<script>${content}</script>`;
        })
        .join('\n');

      const hasProjectStyles = localFiles.some(file => /\.css$/i.test(file.path || file.name || '') && typeof file.content === 'string');
      const hasProjectScripts = localFiles.some(file => /\.(?:js|ts)$/i.test(file.path || file.name || '') && !/\.d\.ts$/i.test(file.path || file.name || '') && typeof file.content === 'string');
      const extraStyles = projectStyles || (!hasProjectStyles && cssContent ? `<style>${rewriteCss(cssContent, sourcePath)}</style>` : '');
      const extraScripts = projectScripts || (!hasProjectScripts && jsContent ? `<script>${jsContent}</script>` : '');

      return {
        head: parsed.head.innerHTML,
        body: parsed.body.innerHTML,
        extraStyles,
        extraScripts,
        sourcePath,
      };
    };

    const rewrittenHtml = rewriteHtml(htmlContent);

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
        ${rewrittenHtml.extraScripts}
      </body>
      </html>`;

    try {
      doc.open();
      doc.write(completeHTML);
      doc.close();
      console.log('[PreviewPanel] ✅ Content written to iframe (injected)');
      if (navigationHash) {
        const fragment = (() => {
          try {
            return decodeURIComponent(navigationHash.replace(/^#/, ''));
          } catch {
            return navigationHash.replace(/^#/, '');
          }
        })();
        window.requestAnimationFrame(() => {
          const target = doc.getElementById(fragment)
            || Array.from(doc.getElementsByName(fragment))[0];
          target?.scrollIntoView();
        });
      }

      // Add click listener for links within the iframe
      if (doc.body) {
        const handleLinkClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const link = target.closest('a') as HTMLAnchorElement;

          if (!link || !link.href || !onLinkClick) return;
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          if (link.hasAttribute('download') || (link.target && link.target.toLowerCase() !== '_self')) return;
          const href = link.getAttribute('href') || '';
          if (!href || /^(?:[a-z]+:|\/\/)/i.test(href)) return;
          if (href.startsWith('#')) return;
          const resolved = resolveFile(href, rewrittenHtml.sourcePath);
          const fragment = href.includes('#') ? href.slice(href.indexOf('#')) : '';
          e.preventDefault();
          onLinkClick(resolved?.file.path || resolved?.file.name || href, fragment);
        };

        doc.body.addEventListener('click', handleLinkClick);
      }
    } catch (e) {
      console.error('[PreviewPanel] Error writing to iframe:', e);
    }

    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mode, htmlContent, cssContent, jsContent, externalUrl, localFiles, openedFolderName, entryPath, navigationHash, onLinkClick, refreshCounter]);
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
      {externalUrl ? (
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
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      )}
    </div>
  );
}
