import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEditorOutsideCopy } from '@/lib/editorOutsideCopy';

interface PreviewPanelProps {
  mode?: 'static' | 'vite-react';
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  externalUrl?: string | null;
  localFiles?: any[];
  openedFolderName?: string | null;
  onLinkClick?: (filePath: string) => void;
}

export function PreviewPanel({ mode = 'static', htmlContent, cssContent, jsContent, externalUrl, localFiles = [], openedFolderName, onLinkClick }: PreviewPanelProps) {
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

    const normalizePath = (value: string) => value
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/^\.\/+/, '');

    const fileMap = new Map<string, any>();
    const objectUrls: string[] = [];
    localFiles.forEach(file => {
      const fullPath = normalizePath(file.path || file.name || '');
      const relativePath = openedFolderName && fullPath.startsWith(`${normalizePath(openedFolderName)}/`)
        ? fullPath.slice(normalizePath(openedFolderName).length + 1)
        : fullPath;
      fileMap.set(fullPath, file);
      fileMap.set(relativePath, file);
      fileMap.set(normalizePath(file.name || ''), file);
    });

    const resolveFile = (reference: string, basePath = '') => {
      const cleanReference = normalizePath(reference.split(/[?#]/)[0]);
      if (!cleanReference || cleanReference.startsWith('data:') || cleanReference.startsWith('blob:')) return undefined;
      if (/^(https?:|mailto:|javascript:|#)/i.test(reference)) return undefined;

      const baseParts = normalizePath(basePath).split('/').filter(Boolean);
      baseParts.pop();
      const candidateParts = [...baseParts, ...cleanReference.split('/')];
      const normalizedParts: string[] = [];
      candidateParts.forEach(part => {
        if (!part || part === '.') return;
        if (part === '..') normalizedParts.pop();
        else normalizedParts.push(part);
      });
      return fileMap.get(normalizedParts.join('/')) || fileMap.get(cleanReference);
    };

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

    const toLocalUrl = (file: any) => {
      if (!file || typeof file.content !== 'string') return undefined;
      if (file.content.startsWith('data:')) return file.content;
      const blob = new Blob([file.content], { type: mimeTypeFor(file.name || file.path || '') });
      const url = URL.createObjectURL(blob);
      objectUrls.push(url);
      return url;
    };

    const rewriteCss = (css: string, sourcePath = '') => css.replace(
      /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi,
      (match, quote, reference) => {
        const file = resolveFile(reference, sourcePath);
        const url = toLocalUrl(file);
        return url ? `url("${url}")` : match;
      },
    );

    const rewriteHtml = (html: string) => {
      const parser = new DOMParser();
      const parsed = parser.parseFromString(html, 'text/html');
      const sourcePath = localFiles.find(file => file.content === html)?.path || 'index.html';

      parsed.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
        const file = resolveFile(link.getAttribute('href') || '', sourcePath);
        if (file) {
          link.remove();
        }
      });

      parsed.querySelectorAll('script[src]').forEach(script => {
        const file = resolveFile(script.getAttribute('src') || '', sourcePath);
        if (file) {
          script.remove();
        }
      });

      parsed.querySelectorAll('[src], [href], [poster]').forEach(element => {
        const attribute = element.hasAttribute('src') ? 'src' : element.hasAttribute('poster') ? 'poster' : 'href';
        const reference = element.getAttribute(attribute);
        if (!reference || attribute === 'href' && reference.startsWith('#')) return;
        const file = resolveFile(reference, sourcePath);
        const url = toLocalUrl(file);
        if (url) element.setAttribute(attribute, url);
      });

      return parsed.body.innerHTML;
    };

    const rewrittenCss = rewriteCss(cssContent);
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
          ${rewrittenCss}
        </style>
      </head>
      <body>
        ${rewrittenHtml}
        <script>
          ${jsContent}
        </script>
      </body>
      </html>`;

    try {
      doc.open();
      doc.write(completeHTML);
      doc.close();
      console.log('[PreviewPanel] ✅ Content written to iframe (injected)');

      // Add click listener for links within the iframe
      if (doc.body) {
        const handleLinkClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const link = target.closest('a') as HTMLAnchorElement;

          if (link && link.href) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
              e.preventDefault();
              console.log('[PreviewPanel] Link clicked:', href);

              // Call the callback to handle link navigation
              if (onLinkClick) {
                onLinkClick(href);
              }
            }
          }
        };

        doc.body.addEventListener('click', handleLinkClick);
      }
    } catch (e) {
      console.error('[PreviewPanel] Error writing to iframe:', e);
    }

    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mode, htmlContent, cssContent, jsContent, externalUrl, localFiles, openedFolderName, onLinkClick, refreshCounter]);
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
