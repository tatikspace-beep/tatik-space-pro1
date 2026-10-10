import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(projectRoot, 'node_modules/pyodide');
const destination = resolve(projectRoot, '.generated/pyodide');

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });

const [packageJson, lock] = await Promise.all([
  readFile(resolve(source, 'package.json'), 'utf8').then(JSON.parse),
  readFile(resolve(source, 'pyodide-lock.json'), 'utf8').then(JSON.parse),
]);
const packages = new Set();
const addPackageAndDependencies = name => {
  const entry = lock.packages[name];
  if (!entry) throw new Error(`Pyodide lockfile does not contain package "${name}".`);
  if (packages.has(name)) return;
  packages.add(name);
  entry.depends.forEach(addPackageAndDependencies);
};

addPackageAndDependencies('matplotlib');
const packageBaseUrl = `https://cdn.jsdelivr.net/pyodide/v${packageJson.version}/full/`;

await Promise.all([...packages].map(async name => {
  const entry = lock.packages[name];
  const response = await fetch(new URL(entry.file_name, packageBaseUrl));
  if (!response.ok) {
    throw new Error(`Failed to download Pyodide package "${name}": HTTP ${response.status}.`);
  }

  const contents = Buffer.from(await response.arrayBuffer());
  const digest = createHash('sha256').update(contents).digest('hex');
  if (digest !== entry.sha256) {
    throw new Error(`Pyodide package "${name}" failed SHA-256 verification.`);
  }
  await writeFile(resolve(destination, entry.file_name), contents);
}));
