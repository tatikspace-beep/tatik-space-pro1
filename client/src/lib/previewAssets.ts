const previewMimeTypes: Record<string, string> = {
  css: 'text/css',
  js: 'text/javascript',
  javascript: 'text/javascript',
  mjs: 'text/javascript',
  cjs: 'text/javascript',
  json: 'application/json',
  html: 'text/html',
  htm: 'text/html',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jpe: 'image/jpeg',
  jfif: 'image/jpeg',
  pjpeg: 'image/jpeg',
  pjp: 'image/jpeg',
  gif: 'image/gif',
  ico: 'image/vnd.microsoft.icon',
  cur: 'image/x-icon',
  bmp: 'image/bmp',
  avif: 'image/avif',
  apng: 'image/apng',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  webp: 'image/webp',
  jxl: 'image/jxl',
  heic: 'image/heic',
  heif: 'image/heif',
  heics: 'image/heic-sequence',
  heifs: 'image/heif-sequence',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
};

const imageExtensions = new Set(
  Object.keys(previewMimeTypes).filter(extension => previewMimeTypes[extension].startsWith('image/')),
);

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

function escapeCssString(value: string): string {
  return value.replace(/[\\"]/g, '\\$&').replace(/[\r\n]/g, '');
}

export function getPreviewFileMimeType(fileName: string): string {
  const extension = fileName.split(/[?#]/, 1)[0]?.split('.').pop()?.toLowerCase() || '';
  return previewMimeTypes[extension] || 'text/plain';
}

export function isPreviewBinaryAsset(fileName: string): boolean {
  const mimeType = getPreviewFileMimeType(fileName);
  return /^(?:image|audio|video|font)\//.test(mimeType);
}

export function isPreviewImageFile(fileName: string): boolean {
  const extension = fileName.split(/[?#]/, 1)[0]?.split('.').pop()?.toLowerCase() || '';
  return imageExtensions.has(extension);
}

export function createPreviewAssetDocument(
  fileName: string,
  dataUrl: string,
  locale: string,
): string {
  const extension = fileName.split(/[?#]/, 1)[0]?.split(/[\\/]/).pop()?.split('.').pop()?.toLowerCase() || '';
  const mimeType = getPreviewFileMimeType(fileName);
  const isItalian = locale.toLowerCase().startsWith('it');
  const title = isItalian ? `Anteprima: ${fileName}` : `Preview: ${fileName}`;
  const source = escapeHtml(dataUrl);
  let content: string;

  if (mimeType.startsWith('image/')) {
    content = `<img src="${source}" alt="${escapeHtml(fileName)}" style="max-width:100%;max-height:100%;object-fit:contain">`;
  } else if (mimeType.startsWith('audio/')) {
    content = `<audio controls preload="metadata" aria-label="${escapeHtml(fileName)}"><source src="${source}" type="${mimeType}">${isItalian ? 'Il browser non supporta questo formato audio.' : 'Your browser does not support this audio format.'}</audio>`;
  } else if (mimeType.startsWith('video/')) {
    content = `<video controls preload="metadata" playsinline aria-label="${escapeHtml(fileName)}" style="max-width:100%;max-height:100%"><source src="${source}" type="${mimeType}">${isItalian ? 'Il browser non supporta questo formato video.' : 'Your browser does not support this video format.'}</video>`;
  } else if (mimeType.startsWith('font/')) {
    const format = extension === 'woff2'
      ? 'woff2'
      : extension === 'woff'
        ? 'woff'
        : extension === 'ttf'
          ? 'truetype'
          : 'opentype';
    content = `<style>@font-face{font-family:PreviewAsset;src:url("${escapeCssString(dataUrl)}") format("${format}");font-display:swap}</style><section style="font-family:PreviewAsset,sans-serif"><h1>Aa Bb Cc 123</h1><p>${isItalian ? 'Anteprima del font locale' : 'Local font preview'}</p></section>`;
  } else {
    throw new Error(`No binary preview is configured for ${fileName}`);
  }

  return `<!doctype html><html lang="${isItalian ? 'it' : 'en'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><body style="box-sizing:border-box;margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f8fafc;color:#1e293b;font:16px/1.5 system-ui,sans-serif"><main style="max-width:100%;max-height:100%;text-align:center"><h2 style="font-size:16px;font-weight:500;overflow-wrap:anywhere">${escapeHtml(fileName)}</h2>${content}</main></body></html>`;
}

export function rewritePreviewSrcset(
  srcset: string,
  rewriteUrl: (url: string) => string,
): string {
  const rewritten: string[] = [];
  let index = 0;

  while (index < srcset.length) {
    while (index < srcset.length && /[\s,]/.test(srcset[index])) index++;
    if (index >= srcset.length) break;

    const urlStart = index;
    while (index < srcset.length && !/\s/.test(srcset[index])) index++;

    let url = srcset.slice(urlStart, index);
    const hasTrailingSeparator = /,+$/.test(url);
    url = url.replace(/,+$/, '');
    if (!url) continue;

    while (index < srcset.length && /\s/.test(srcset[index])) index++;
    const descriptorStart = index;
    if (!hasTrailingSeparator) {
      while (index < srcset.length && srcset[index] !== ',') index++;
    }
    const descriptor = srcset.slice(descriptorStart, index).trim();
    rewritten.push(`${rewriteUrl(url)}${descriptor ? ` ${descriptor}` : ''}`);

    if (index < srcset.length && srcset[index] === ',') index++;
  }

  return rewritten.join(', ');
}
