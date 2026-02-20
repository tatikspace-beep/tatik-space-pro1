import React, { useEffect, useRef } from 'react';

interface PreviewPanelProps {
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  externalUrl?: string | null;
  localFiles?: any[];
  openedFolderName?: string | null;
  onLinkClick?: (filePath: string) => void;
}

export function PreviewPanel({ htmlContent, cssContent, jsContent, externalUrl, localFiles = [], openedFolderName, onLinkClick }: PreviewPanelProps) {
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

    if (externalUrl) {
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
          ${cssContent}
        </style>
      </head>
      <body>
        ${htmlContent}
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

  }, [htmlContent, cssContent, jsContent, externalUrl, onLinkClick, refreshCounter]);
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
        <div className="text-[12px] text-slate-200 bg-slate-800/70 px-2 py-1 rounded">Size: {(sizeBytes / 1024).toFixed(2)} KB</div>
        <button
          onClick={() => {
            try {
              fetch('/api/analytics/optimize-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ size: sizeBytes, timestamp: new Date().toISOString() }) }).catch(() => { });
            } catch (e) { }
            window.open('https://example.com/compress?utm_source=tatik_optimize&utm_medium=app', '_blank', 'noopener,noreferrer');
          }}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
        >
          Optimize
        </button>
      </div>
      {externalUrl ? (
        <iframe
          ref={iframeRef}
          src={externalUrl}
          className="border-0"
          style={{ width: '100%', height: '100%', display: 'block' }}
          title="Preview - External"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      ) : (
        <iframe
          ref={iframeRef}
          className="border-0"
          style={{ width: '100%', height: '100%', display: 'block' }}
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      )}
    </div>
  );
}
