export interface PreviewProjectFile {
  name?: string;
  path?: string;
  content?: string;
}

export interface ResolvedPreviewFile<TFile extends PreviewProjectFile> {
  file: TFile;
  path: string;
}

export function normalizePreviewPath(value: string, openedFolderName = '') {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep malformed percent-encoding as a literal path.
  }

  const root = openedFolderName.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const path = decoded.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^\.\/+/, '');
  return root && (path === root || path.startsWith(`${root}/`))
    ? path.slice(root.length).replace(/^\/+/, '')
    : path;
}

export function resolvePreviewFile<TFile extends PreviewProjectFile>(
  files: TFile[],
  reference: string,
  basePath = '',
  openedFolderName = '',
): ResolvedPreviewFile<TFile> | undefined {
  const trimmedReference = reference.trim();
  if (!trimmedReference || /^(?:[a-z]+:|\/\/|#)/i.test(trimmedReference)) return undefined;

  const referencePath = normalizePreviewPath(trimmedReference.split(/[?#]/)[0], openedFolderName);
  const referenceHasPath = Boolean(trimmedReference.split(/[?#]/)[0]);
  if (!referenceHasPath) return undefined;

  const baseParts = normalizePreviewPath(basePath, openedFolderName).split('/').filter(Boolean);
  const referenceIsRootRelative = trimmedReference.startsWith('/');
  if (!referenceIsRootRelative) baseParts.pop();
  const candidateParts = referenceIsRootRelative
    ? referencePath.split('/')
    : [...baseParts, ...referencePath.split('/')];
  const normalizedParts: string[] = [];
  candidateParts.forEach(part => {
    if (!part || part === '.') return;
    if (part === '..') normalizedParts.pop();
    else normalizedParts.push(part);
  });

  let resolvedPath = normalizedParts.join('/').toLowerCase();
  const filesByPath = new Map<string, TFile>();
  files.forEach(file => {
    filesByPath.set(normalizePreviewPath(file.path || file.name || '', openedFolderName).toLowerCase(), file);
  });

  let file = filesByPath.get(resolvedPath);
  if (!file && (!resolvedPath || !/\.[^/]+$/.test(resolvedPath))) {
    resolvedPath = `${resolvedPath ? `${resolvedPath}/` : ''}index.html`;
    file = filesByPath.get(resolvedPath);
  }

  return file ? { file, path: resolvedPath } : undefined;
}
