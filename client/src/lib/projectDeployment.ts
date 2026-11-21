export interface DeploymentFile {
  path: string;
  name?: string;
  content?: string | null;
  type?: string;
}

export interface PreparedDeployment {
  blob: Blob | null;
  fileCount: number;
  sqlMigrationCount: number;
  buildRequired: boolean;
  excludedPaths: string[];
  error: string | null;
}

interface ZipEntry {
  name: Uint8Array;
  data: Uint8Array;
  crc: number;
  offset: number;
}

const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;
const MAX_ARCHIVE_FILES = 10_000;
const UTF8_FLAG = 0x0800;

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function write16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function write32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

function safeArchivePath(path: string) {
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments = normalized.split('/');
  if (!normalized || segments.some(segment => !segment || segment === '.' || segment === '..')) return null;
  if (/^[a-z]:/i.test(normalized)) return null;
  return normalized;
}

function isEnvironmentSecretFile(path: string) {
  const name = path.split('/').pop()?.toLowerCase() ?? '';
  return name.startsWith('.env')
    && !['.env.example', '.env.sample', '.env.template'].includes(name);
}

function isCredentialFile(path: string) {
  const name = path.split('/').pop()?.toLowerCase() ?? '';
  return ['.npmrc', '.pypirc', '.netrc', 'credentials.json', 'service-account.json'].includes(name)
    || /\.(?:pem|key|p12|pfx)$/i.test(name);
}

function containsCredential(content: string) {
  const textDataUrl = content.match(/^data:(?:text\/[^;,]+|application\/(?:json|javascript))[^,]*;base64,([\s\S]*)$/i);
  if (textDataUrl) {
    try {
      content = atob(textDataUrl[1]);
    } catch {
      return false;
    }
  }
  return /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:sk_(?:live|proj)[_-]|rk_live_|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|xox[baprs]-|npm_[A-Za-z0-9]{20,}|vercel_[A-Za-z0-9_-]{20,})|(?:service[_-]?role[_-]?key|supabase[_-]?service[_-]?role)[\s"'=:]+[A-Za-z0-9._-]{20,}/i.test(content);
}

function decodeFileContent(content: string) {
  const match = content.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/i);
  if (!match) return new TextEncoder().encode(content);
  if (match[2]) {
    const binary = atob(match[3]);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  }
  return new TextEncoder().encode(decodeURIComponent(match[3]));
}

function buildZip(entries: ZipEntry[]) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    entry.offset = offset;
    const localHeader = new Uint8Array(30 + entry.name.length);
    const localView = new DataView(localHeader.buffer);
    write32(localView, 0, 0x04034b50);
    write16(localView, 4, 20);
    write16(localView, 6, UTF8_FLAG);
    write16(localView, 8, 0);
    write16(localView, 10, 0);
    write16(localView, 12, 33);
    write32(localView, 14, entry.crc);
    write32(localView, 18, entry.data.length);
    write32(localView, 22, entry.data.length);
    write16(localView, 26, entry.name.length);
    write16(localView, 28, 0);
    localHeader.set(entry.name, 30);
    localParts.push(localHeader, entry.data);
    offset += localHeader.length + entry.data.length;

    const centralHeader = new Uint8Array(46 + entry.name.length);
    const centralView = new DataView(centralHeader.buffer);
    write32(centralView, 0, 0x02014b50);
    write16(centralView, 4, 20);
    write16(centralView, 6, 20);
    write16(centralView, 8, UTF8_FLAG);
    write16(centralView, 10, 0);
    write16(centralView, 12, 0);
    write16(centralView, 14, 33);
    write32(centralView, 16, entry.crc);
    write32(centralView, 20, entry.data.length);
    write32(centralView, 24, entry.data.length);
    write16(centralView, 28, entry.name.length);
    write16(centralView, 30, 0);
    write16(centralView, 32, 0);
    write16(centralView, 34, 0);
    write16(centralView, 36, 0);
    write32(centralView, 38, 0);
    write32(centralView, 42, entry.offset);
    centralHeader.set(entry.name, 46);
    centralParts.push(centralHeader);
  }

  const centralDirectory = new Uint8Array(centralParts.reduce((total, part) => total + part.length, 0));
  let centralOffset = 0;
  for (const part of centralParts) {
    centralDirectory.set(part, centralOffset);
    centralOffset += part.length;
  }

  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  write32(endView, 0, 0x06054b50);
  write16(endView, 4, 0);
  write16(endView, 6, 0);
  write16(endView, 8, entries.length);
  write16(endView, 10, entries.length);
  write32(endView, 12, centralDirectory.length);
  write32(endView, 16, offset);
  write16(endView, 20, 0);

  const archiveBuffer = new ArrayBuffer(offset + centralDirectory.length + endRecord.length);
  const archiveBytes = new Uint8Array(archiveBuffer);
  let archiveOffset = 0;
  for (const part of [...localParts, centralDirectory, endRecord]) {
    archiveBytes.set(part, archiveOffset);
    archiveOffset += part.length;
  }
  return new Blob([archiveBuffer], { type: 'application/zip' });
}

export function prepareDeploymentArchive(files: DeploymentFile[], projectName: string): PreparedDeployment {
  const uniqueFiles = new Map<string, string>();
  const excludedPaths: string[] = [];
  let buildRequired = false;
  let archiveBytes = 0;

  for (const file of files) {
    if (file.type === 'folder') continue;
    const path = safeArchivePath(file.path || file.name || '');
    if (!path) {
      excludedPaths.push(file.path || file.name || '(percorso non valido)');
      continue;
    }
    if (/(^|\/)(?:node_modules|\.git|\.next|\.nuxt)(?:\/|$)/i.test(path)) continue;
    if (isEnvironmentSecretFile(path) || isCredentialFile(path)) {
      excludedPaths.push(path);
      continue;
    }
    if (typeof file.content !== 'string') {
      excludedPaths.push(path);
      continue;
    }
    if (containsCredential(file.content)) {
      excludedPaths.push(path);
      continue;
    }
    if (path.toLowerCase() === 'package.json') {
      try {
        const manifest = JSON.parse(file.content) as { scripts?: { build?: unknown } };
        buildRequired = typeof manifest.scripts?.build === 'string';
      } catch {
        excludedPaths.push(path);
        continue;
      }
    }
    uniqueFiles.set(path, file.content);
  }

  if (!uniqueFiles.size) {
    return { blob: null, fileCount: 0, sqlMigrationCount: 0, buildRequired, excludedPaths, error: 'Nessun file sicuro da preparare.' };
  }
  if (uniqueFiles.size > MAX_ARCHIVE_FILES) {
    return { blob: null, fileCount: uniqueFiles.size, sqlMigrationCount: 0, buildRequired, excludedPaths, error: 'Il progetto contiene troppi file per un singolo pacchetto.' };
  }

  const encoder = new TextEncoder();
  const entries: ZipEntry[] = [];
  const sqlFiles = [...uniqueFiles.entries()]
    .filter(([path]) => path.toLowerCase().endsWith('.sql'))
    .sort(([left], [right]) => left.localeCompare(right));
  const migrationPrefix = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  let migrationIndex = 0;

  for (const [path, content] of uniqueFiles) {
    let data: Uint8Array;
    try {
      data = decodeFileContent(content);
    } catch (error) {
      console.error(`Failed to read project file ${path} for deployment:`, error);
      return { blob: null, fileCount: uniqueFiles.size, sqlMigrationCount: 0, buildRequired, excludedPaths, error: `Impossibile leggere il file ${path}.` };
    }
    archiveBytes += data.length;
    if (archiveBytes > MAX_ARCHIVE_BYTES) {
      return { blob: null, fileCount: uniqueFiles.size, sqlMigrationCount: 0, buildRequired, excludedPaths, error: 'Il progetto supera il limite di 100 MB.' };
    }
    const name = encoder.encode(path);
    entries.push({ name, data, crc: crc32(data), offset: 0 });
  }

  for (const [path, content] of sqlFiles) {
    if (/^supabase\/migrations\//i.test(path)) continue;
    migrationIndex += 1;
    const migrationName = `${migrationPrefix}_${String(migrationIndex).padStart(3, '0')}_${path.split('/').pop()}`;
    const data = encoder.encode(content);
    archiveBytes += data.length;
    if (archiveBytes > MAX_ARCHIVE_BYTES) {
      return { blob: null, fileCount: uniqueFiles.size, sqlMigrationCount: 0, buildRequired, excludedPaths, error: 'Il progetto supera il limite di 100 MB.' };
    }
    entries.push({
      name: encoder.encode(`supabase/migrations/${migrationName}`),
      data,
      crc: crc32(data),
      offset: 0,
    });
  }

  const sqlMigrationCount = sqlFiles.length;
  const readme = [
    `${projectName || 'Tatik project'} - deployment package`,
    '',
    'Cloudflare Pages (free plan availability and limits are set by Cloudflare):',
    '1. Sign in to Cloudflare and open Workers & Pages > Create > Pages > Upload assets.',
    '2. Upload this ZIP archive and follow the provider prompts.',
    buildRequired
      ? 'This project has a build script. Build it first and upload the generated output directory (commonly dist/); source ZIP upload alone will not run the build.'
      : 'This archive contains project files. For a static site, ensure index.html is at the upload root.',
    '',
    'Supabase:',
    '1. Create a project in your own Supabase account and choose its free plan if available.',
    sqlFiles.length
      ? `2. SQL files are included under supabase/migrations/ as a starting point. Review and apply them in order in your own project.`
      : '2. No SQL migrations were found in this workspace; create and review a schema before applying database changes.',
    '3. Never put service-role keys or database passwords in browser code or commit them to this project.',
    '',
    'Optional domain: search and register it with a registrar, then connect its DNS to your hosting provider. Domain registration is separately billed by the registrar.',
    'Tatik.space does not create provider accounts, purchase domains, or incur provider charges on your behalf.',
  ].join('\n');
  const readmeData = encoder.encode(readme);
  archiveBytes += readmeData.length;
  if (archiveBytes > MAX_ARCHIVE_BYTES) {
    return { blob: null, fileCount: uniqueFiles.size, sqlMigrationCount: 0, buildRequired, excludedPaths, error: 'Il progetto supera il limite di 100 MB.' };
  }
  entries.push({
    name: encoder.encode('TATIK-DEPLOY-README.txt'),
    data: readmeData,
    crc: crc32(readmeData),
    offset: 0,
  });

  try {
    const blob = buildZip(entries);
    if (blob.size > MAX_ARCHIVE_BYTES) {
      return { blob: null, fileCount: uniqueFiles.size, sqlMigrationCount, buildRequired, excludedPaths, error: 'Il pacchetto finale supera il limite di 100 MB.' };
    }
    return {
      blob,
      fileCount: entries.length,
      sqlMigrationCount,
      buildRequired,
      excludedPaths,
      error: null,
    };
  } catch (error) {
    console.error('Failed to build project deployment archive:', error);
    return {
      blob: null,
      fileCount: 0,
      sqlMigrationCount: 0,
      buildRequired,
      excludedPaths,
      error: 'Impossibile preparare il pacchetto. Controlla i file e riprova.',
    };
  }
}
