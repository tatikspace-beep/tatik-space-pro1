function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

export function createPreviewDataDocument(fileName: string, content: string, locale: string): string {
  const isItalian = locale.toLowerCase().startsWith('it');
  const extension = fileName.split(/[?#]/, 1)[0]?.split(/[\\/]/).pop()?.split('.').pop()?.toLowerCase() || '';
  let displayedContent = content;
  let validationMessage = '';

  if (extension === 'json') {
    try {
      displayedContent = JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      validationMessage = isItalian
        ? 'JSON non valido: viene mostrato il contenuto originale.'
        : 'Invalid JSON: showing the original content.';
    }
  }

  const title = isItalian ? `Visualizzazione dati: ${fileName}` : `Data viewer: ${fileName}`;
  const note = isItalian
    ? 'Vista sicura di sola lettura. Questo formato non viene eseguito.'
    : 'Safe read-only view. This format is not executed.';
  return `<!doctype html><html lang="${isItalian ? 'it' : 'en'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><body style="margin:0;padding:20px;background:#f8fafc;color:#1e293b;font:14px/1.6 ui-monospace,monospace"><main style="max-width:1000px;margin:auto"><h1 style="font:600 18px/1.4 system-ui,sans-serif">${escapeHtml(title)}</h1><p style="font:14px/1.5 system-ui,sans-serif">${escapeHtml(note)}</p>${validationMessage ? `<p role="status" style="color:#b45309;font:14px/1.5 system-ui,sans-serif">${escapeHtml(validationMessage)}</p>` : ''}<pre style="white-space:pre-wrap;overflow-wrap:anywhere;padding:16px;border:1px solid #cbd5e1;border-radius:8px;background:#fff">${escapeHtml(displayedContent)}</pre></main></body></html>`;
}
