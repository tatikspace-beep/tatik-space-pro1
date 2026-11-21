import { describe, expect, it } from 'vitest';
import { prepareDeploymentArchive } from './projectDeployment';

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

async function readZipEntryNames(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const decoder = new TextDecoder();
  let endOffset = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65_557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      endOffset = offset;
      break;
    }
  }
  if (endOffset < 0) throw new Error('ZIP end record missing');

  const entryCount = view.getUint16(endOffset + 10, true);
  let offset = view.getUint32(endOffset + 16, true);
  const names: string[] = [];
  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('ZIP central directory entry missing');
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    names.push(decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength)));
    const expectedCrc = view.getUint32(offset + 16, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const localOffset = view.getUint32(offset + 42, true);
    if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('ZIP local file entry missing');
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const data = bytes.subarray(dataOffset, dataOffset + uncompressedSize);
    if (view.getUint32(localOffset + 14, true) !== expectedCrc || crc32(data) !== expectedCrc) {
      throw new Error('ZIP file checksum mismatch');
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return { bytes, names };
}

describe('prepareDeploymentArchive', () => {
  it('creates a readable ZIP, adds SQL migrations, and excludes credentials and unsafe paths', async () => {
    const prepared = prepareDeploymentArchive([
      { path: 'index.html', content: '<h1>Hello</h1>' },
      { path: 'package.json', content: '{"scripts":{"build":"vite build"}}' },
      { path: '.env', content: 'PRIVATE_TOKEN=not-for-export' },
      { path: '.env.example', content: 'PUBLIC_URL=' },
      { path: 'src/credentials.ts', content: 'const key = "service_role_key = sample-placeholder-1234567890";' },
      { path: 'schema/setup.sql', content: 'create table example (id int);' },
      { path: '../outside.txt', content: 'unsafe' },
    ], 'Demo project');

    expect(prepared.error).toBeNull();
    expect(prepared.blob).not.toBeNull();
    expect(prepared.buildRequired).toBe(true);
    expect(prepared.sqlMigrationCount).toBe(1);
    expect(prepared.excludedPaths).toEqual(expect.arrayContaining([
      '.env',
      'src/credentials.ts',
      '../outside.txt',
    ]));

    const archive = await readZipEntryNames(prepared.blob!);
    expect(archive.bytes[0]).toBe(0x50);
    expect(archive.bytes[1]).toBe(0x4b);
    expect(archive.names).toContain('index.html');
    expect(archive.names).toContain('.env.example');
    expect(archive.names).toContain('TATIK-DEPLOY-README.txt');
    expect(archive.names.some(name => /^supabase\/migrations\/\d{14}_001_setup\.sql$/.test(name))).toBe(true);
    expect(archive.names).not.toContain('.env');
    expect(archive.names).not.toContain('src/credentials.ts');
    expect(archive.names).not.toContain('../outside.txt');
  });

  it('returns a clear result when the project has no safe files', () => {
    const prepared = prepareDeploymentArchive([
      { path: '.env.production', content: 'DATABASE_URL=private' },
    ], 'Private project');

    expect(prepared.blob).toBeNull();
    expect(prepared.error).toBe('Nessun file sicuro da preparare.');
    expect(prepared.excludedPaths).toContain('.env.production');
  });
});
