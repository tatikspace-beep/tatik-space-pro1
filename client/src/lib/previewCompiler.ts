import * as esbuild from 'esbuild-wasm/esm/browser.js';
import wasmUrl from 'esbuild-wasm/esbuild.wasm?url';
import { normalizePreviewPath, resolvePreviewFile } from './previewFileResolver';

export interface PreviewCompilerFile {
  name?: string;
  path?: string;
  content?: string;
}

export interface CompiledPreviewProject {
  code: string;
  css: string;
  inputPaths: Set<string>;
  requiresReact: boolean;
  requiresVue: boolean;
  requiresSvelte: boolean;
}

export type PreviewCompilerBuildOptions = Pick<
  esbuild.BuildOptions,
  | 'entryPoints'
  | 'outfile'
  | 'bundle'
  | 'write'
  | 'format'
  | 'platform'
  | 'target'
  | 'jsx'
  | 'sourcemap'
  | 'metafile'
  | 'logLevel'
  | 'plugins'
>;

export interface PreviewCompileOptions {
  mountDefaultComponent?: boolean;
}

const maxProjectFiles = 100;
const maxProjectSourceBytes = 1_000_000;
const reactRuntimeModules = new Set([
  'react',
  'react-dom/client',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
]);
const frameworkComponentExtensions = /\.(?:vue|svelte)$/i;
const previewStyleExtensions = /\.(?:css|scss|sass|less)$/i;

const sourceLoaders: Record<string, 'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'css'> = {
  cjs: 'js',
  js: 'js',
  jsx: 'jsx',
  json: 'json',
  mjs: 'js',
  ts: 'ts',
  tsx: 'tsx',
  css: 'css',
  vue: 'js',
  svelte: 'js',
  scss: 'css',
  sass: 'css',
  less: 'css',
};

const reactExports = [
  'Children',
  'Component',
  'Fragment',
  'PureComponent',
  'Suspense',
  'cloneElement',
  'createContext',
  'createElement',
  'forwardRef',
  'isValidElement',
  'lazy',
  'memo',
  'startTransition',
  'useCallback',
  'useContext',
  'useDebugValue',
  'useDeferredValue',
  'useEffect',
  'useId',
  'useImperativeHandle',
  'useInsertionEffect',
  'useLayoutEffect',
  'useMemo',
  'useReducer',
  'useRef',
  'useState',
  'useSyncExternalStore',
  'useTransition',
] as const;

let initialization: Promise<void> | undefined;

function initializeCompiler(): Promise<void> {
  initialization ??= esbuild.initialize({ wasmURL: wasmUrl }).catch(error => {
    initialization = undefined;
    throw error;
  });
  return initialization;
}

function getExtension(path: string): string {
  return path.split(/[?#]/, 1)[0]?.split(/[\\/]/).pop()?.split('.').pop()?.toLowerCase() || '';
}

function getModuleLoader(path: string): (typeof sourceLoaders)[string] | undefined {
  return sourceLoaders[getExtension(path)];
}

function findProjectModule<TFile extends PreviewCompilerFile>(
  files: TFile[],
  specifier: string,
  importerPath: string,
  openedFolderName: string,
) {
  const cleanSpecifier = specifier.split(/[?#]/, 1)[0] || '';
  const hasExtension = /\.[^/]+$/.test(cleanSpecifier);
  const candidates = hasExtension
    ? [cleanSpecifier]
    : [
        `${cleanSpecifier}.tsx`,
        `${cleanSpecifier}.ts`,
        `${cleanSpecifier}.jsx`,
        `${cleanSpecifier}.js`,
        `${cleanSpecifier}.mjs`,
        `${cleanSpecifier}.json`,
        `${cleanSpecifier}.css`,
        `${cleanSpecifier}.scss`,
        `${cleanSpecifier}.sass`,
        `${cleanSpecifier}.less`,
        `${cleanSpecifier}.vue`,
        `${cleanSpecifier}.svelte`,
        `${cleanSpecifier}/index.tsx`,
        `${cleanSpecifier}/index.ts`,
        `${cleanSpecifier}/index.jsx`,
        `${cleanSpecifier}/index.js`,
        `${cleanSpecifier}/index.vue`,
        `${cleanSpecifier}/index.svelte`,
      ];

  for (const candidate of candidates) {
    const resolved = resolvePreviewFile(files, candidate, importerPath, openedFolderName);
    if (resolved && typeof resolved.file.content === 'string' && getModuleLoader(resolved.path)) {
      return {
        file: resolved.file,
        path: normalizePreviewPath(resolved.path, openedFolderName).toLowerCase(),
      };
    }
  }
  return undefined;
}

function getReactShim(specifier: string): string | undefined {
  if (specifier === 'react') {
    return [
      'const React = globalThis.TatikPreviewReact?.React;',
      'if (!React) throw new Error("React preview runtime is unavailable.");',
      'export default React;',
      ...reactExports.map(name => `export const ${name} = React.${name};`),
    ].join('\n');
  }
  if (specifier === 'react/jsx-runtime' || specifier === 'react/jsx-dev-runtime') {
    return [
      'const runtime = globalThis.TatikPreviewReact?.jsxRuntime;',
      'if (!runtime) throw new Error("React preview runtime is unavailable.");',
      'export const Fragment = runtime.Fragment;',
      'export const jsx = runtime.jsx;',
      'export const jsxs = runtime.jsxs;',
      'export const jsxDEV = runtime.jsxDEV || runtime.jsx;',
    ].join('\n');
  }
  if (specifier === 'react-dom/client') {
    return [
      'const runtime = globalThis.TatikPreviewReact?.ReactDOM;',
      'if (!runtime) throw new Error("React DOM preview runtime is unavailable.");',
      'export const createRoot = runtime.createRoot;',
      'export const hydrateRoot = runtime.hydrateRoot;',
      'export default runtime;',
    ].join('\n');
  }
  return undefined;
}

function vueRuntimeShim(source: string): string {
  return source
    .replace(/import\s+type\s+(?:\{[^}]+\}|[\w$]+)\s*from\s*["']vue["'];?/g, '')
    .replace(/import\s*\{([^}]+)\}\s*from\s*["']vue["'];?/g, (_match, bindings: string) => {
      const properties = bindings.split(',')
        .filter(binding => !/^type\s+/.test(binding.trim()))
        .map(binding => {
          const [imported, local] = binding.trim().split(/\s+as\s+/);
          return local ? `${imported}: ${local}` : imported;
        }).join(', ');
      return `const { ${properties} } = globalThis.TatikPreviewFramework?.vue;`;
    })
    .replace(
      /import\s+\*\s+as\s+([\w$]+)\s+from\s*["']vue["'];?/g,
      'const $1 = globalThis.TatikPreviewFramework?.vue;',
    )
    .replace(
      /import\s+([\w$]+)\s+from\s*["']vue["'];?/g,
      'const $1 = globalThis.TatikPreviewFramework?.vue?.default;',
    );
}

function svelteRuntimeShim(source: string): string {
  return source
    .replace(/import\s+type\s+(?:\{[^}]+\}|[\w$]+)\s*from\s*["']svelte["'];?/g, '')
    .replace(
      /import\s+\*\s+as\s+([\w$]+)\s+from\s+["']svelte\/internal\/client["'];?/g,
      'const $1 = globalThis.TatikPreviewFramework?.svelte;',
    )
    .replace(/import\s+["']svelte\/internal\/[^"']+["'];?/g, '')
    .replace(/import\s*\{([^}]+)\}\s*from\s*["']svelte(?:\/legacy|\/store)?["'];?/g, (_match, bindings: string) => {
      const properties = bindings.split(',')
        .filter((binding: string) => !/^type\s+/.test(binding.trim()))
        .map((binding: string) => {
          const [imported, local] = binding.trim().split(/\s+as\s+/);
          return local ? `${imported}: ${local}` : imported;
        }).join(', ');
      return `const { ${properties} } = globalThis.TatikPreviewFramework?.svelteApi;`;
    });
}

function stableComponentId(path: string): string {
  let hash = 2166136261;
  for (let index = 0; index < path.length; index++) {
    hash = Math.imul(hash ^ path.charCodeAt(index), 16777619);
  }
  return `tatik-${(hash >>> 0).toString(36)}`;
}

async function compileVueComponent(path: string, source: string): Promise<{ code: string; css: string; loader: 'js' | 'ts' | 'tsx' }> {
  const compiler = await import('@vue/compiler-sfc');
  const { descriptor, errors } = compiler.parse(source, { filename: path });
  if (errors.length > 0) {
    throw new Error(errors.map(error => error instanceof Error ? error.message : String(error)).join('\n'));
  }

  const id = stableComponentId(path);
  let code = '';
  if (descriptor.scriptSetup) {
    code = compiler.compileScript(descriptor, { id, inlineTemplate: true }).content;
  } else if (descriptor.script) {
    code = compiler.compileScript(descriptor, { id, genDefaultAs: '__tatik_sfc__' }).content;
  } else {
    code = 'const __tatik_sfc__ = {};';
  }

  if (descriptor.template && !descriptor.scriptSetup) {
    const template = compiler.compileTemplate({
      source: descriptor.template.content,
      filename: path,
      id,
      compilerOptions: { mode: 'module' },
    });
    if (template.errors.length > 0) {
      throw new Error(template.errors.map(error => error instanceof Error ? error.message : String(error)).join('\n'));
    }
    code += `\n${template.code}\n__tatik_sfc__.render = render;`;
  }
  if (!descriptor.scriptSetup) code += '\nexport default __tatik_sfc__;';

  const styleChunks: string[] = [];
  if (descriptor.styles.some(style => style.module)) {
    throw new Error('Vue CSS modules are not supported in the browser preview yet.');
  }
  for (const style of descriptor.styles) {
    const lang = (style.lang || 'css').toLowerCase();
    const styleSource = lang === 'css'
      ? style.content
      : await (await import('./previewStyleCompiler')).compilePreviewStylesheet(`component.${lang}`, style.content);
    const compiledStyle = await compiler.compileStyleAsync({
      source: styleSource,
      filename: path,
      id,
      scoped: style.scoped,
    });
    if (compiledStyle.errors.length > 0) {
      throw new Error(compiledStyle.errors.map(error => error instanceof Error ? error.message : String(error)).join('\n'));
    }
    styleChunks.push(compiledStyle.code);
  }

  const scriptLang = (descriptor.scriptSetup?.lang || descriptor.script?.lang || '').toLowerCase();
  const loader = scriptLang === 'tsx' ? 'tsx' : scriptLang === 'ts' ? 'ts' : 'js';
  return { code, css: styleChunks.join('\n'), loader };
}

async function compileSvelteComponent(path: string, source: string): Promise<{ code: string; css: string }> {
  const compiler = await import('svelte/compiler');
  const result = compiler.compile(source, { filename: path, generate: 'client' });
  const css = result.css?.code || '';
  return { code: svelteRuntimeShim(result.js.code), css };
}

export function createPreviewCompilerBuildOptions<TFile extends PreviewCompilerFile>(
  files: TFile[],
  entryPath: string,
  openedFolderName = '',
  compileOptions: PreviewCompileOptions = {},
): PreviewCompilerBuildOptions {
  const normalizedEntry = normalizePreviewPath(entryPath, openedFolderName).toLowerCase();
  const mountDefaultComponent = compileOptions.mountDefaultComponent === true;
  if (mountDefaultComponent && !/\.(?:jsx|tsx|vue|svelte)$/i.test(normalizedEntry)) {
    throw new Error('Automatic component mounting is available only for component files.');
  }
  const entryDirectory = normalizedEntry.includes('/')
    ? normalizedEntry.slice(0, normalizedEntry.lastIndexOf('/') + 1)
    : '';
  const bootstrapPath = `${entryDirectory}__tatik_preview_bootstrap__.tsx`;
  const buildEntryPath = mountDefaultComponent ? bootstrapPath : normalizedEntry;
  const componentSpecifier = `./${normalizedEntry.slice(entryDirectory.length)}`;
  const entry = files.find(file =>
    normalizePreviewPath(file.path || file.name || '', openedFolderName).toLowerCase() === normalizedEntry,
  );
  if (!entry || typeof entry.content !== 'string') {
    throw new Error(`Preview entry file not found: ${entryPath}`);
  }

  const projectFiles = new Map<string, TFile>();
  files.forEach(file => {
    const path = normalizePreviewPath(file.path || file.name || '', openedFolderName).toLowerCase();
    if (path && typeof file.content === 'string') projectFiles.set(path, file);
  });

  const entryLoader = getModuleLoader(normalizedEntry);
  if (!entryLoader || !['js', 'jsx', 'ts', 'tsx'].includes(entryLoader)
    || (!['js', 'jsx', 'ts', 'tsx'].includes(entryLoader) && !frameworkComponentExtensions.test(normalizedEntry))) {
    throw new Error(`Unsupported preview entry type: ${entryPath}`);
  }
  const sourceBytes = new TextEncoder().encode(
    Array.from(projectFiles.values(), file => file.content || '').join(''),
  ).byteLength;
  if (projectFiles.size > maxProjectFiles || sourceBytes > maxProjectSourceBytes) {
    throw new Error('This preview build exceeds the current limit of 100 files or 1 MB of source.');
  }
  const compiledStyles = new Map<string, string>();

  return {
    entryPoints: [buildEntryPath],
    outfile: 'preview.js',
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    jsx: 'automatic',
    sourcemap: false,
    metafile: true,
    logLevel: 'silent',
    plugins: [{
      name: 'tatik-preview-project',
      setup(build) {
        build.onResolve({ filter: /.*/ }, args => {
          if (args.kind === 'entry-point' && (projectFiles.has(buildEntryPath) || args.path === buildEntryPath)) {
            return { path: buildEntryPath, namespace: 'tatik-project' };
          }
          if (reactRuntimeModules.has(args.path)) {
            return { path: args.path, namespace: 'tatik-react-runtime' };
          }
          if (args.path.startsWith('tatik-preview-style:')) {
            return { path: args.path.slice('tatik-preview-style:'.length), namespace: 'tatik-preview-style' };
          }
          if (args.path === 'svelte' || args.path.startsWith('svelte/')) {
            return {
              errors: [{ text: `Svelte import "${args.path}" could not be resolved from the browser runtime.` }],
            };
          }
          if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(args.path)) {
            return {
              errors: [{ text: `External URL import "${args.path}" is not available in the browser preview.` }],
            };
          }
          if (!args.path.startsWith('.') && !args.path.startsWith('/')) {
            return {
              errors: [{
                text: `Package "${args.path}" is not installed in the browser preview. Only React and local project imports are available.`,
              }],
            };
          }
          const resolved = findProjectModule(
            files,
            args.path,
            args.importer || normalizedEntry,
            openedFolderName,
          );
          if (!resolved) {
            return {
              errors: [{
                text: `Cannot resolve local import "${args.path}" from "${args.importer || normalizedEntry}".`,
              }],
            };
          }
          return { path: resolved.path, namespace: 'tatik-project' };
        });
        build.onLoad({ filter: /.*/, namespace: 'tatik-react-runtime' }, args => ({
          contents: getReactShim(args.path),
          loader: 'js',
        }));
        build.onLoad({ filter: /.*/, namespace: 'tatik-preview-style' }, args => {
          const css = compiledStyles.get(args.path);
          if (css === undefined) return { errors: [{ text: `Cannot load compiled component styles "${args.path}".` }] };
          return { contents: css, loader: 'css' };
        });
        build.onLoad({ filter: /.*/, namespace: 'tatik-project' }, async args => {
          if (mountDefaultComponent && args.path === bootstrapPath) {
            const componentExtension = getExtension(normalizedEntry);
            if (componentExtension === 'vue') {
              return {
                contents: [
                  `import Component from ${JSON.stringify(componentSpecifier)};`,
                  'const root = document.getElementById("root");',
                  'if (!root) throw new Error("The preview is missing its #root mount point.");',
                  'const runtime = globalThis.TatikPreviewFramework?.vue;',
                  'if (!runtime?.createApp) throw new Error("Vue preview runtime is unavailable.");',
                  'runtime.createApp(Component).mount(root);',
                ].join('\n'),
                loader: 'js',
                resolveDir: entryDirectory.replace(/\/$/, ''),
              };
            }
            if (componentExtension === 'svelte') {
              return {
                contents: [
                  `import Component from ${JSON.stringify(componentSpecifier)};`,
                  'const root = document.getElementById("root");',
                  'if (!root) throw new Error("The preview is missing its #root mount point.");',
                  'const runtime = globalThis.TatikPreviewFramework?.svelteApi;',
                  'if (!runtime?.mount) throw new Error("Svelte preview runtime is unavailable.");',
                  'runtime.mount(Component, { target: root });',
                ].join('\n'),
                loader: 'js',
                resolveDir: entryDirectory.replace(/\/$/, ''),
              };
            }
            return {
              contents: [
                'import * as React from "react";',
                'import { createRoot } from "react-dom/client";',
                `import Component from ${JSON.stringify(componentSpecifier)};`,
                'const root = document.getElementById("root");',
                'if (!root) throw new Error("The preview is missing its #root mount point.");',
                'if (typeof Component !== "function" && (typeof Component !== "object" || Component === null)) throw new Error("This JSX/TSX file must have a default-exported React component to preview by itself.");',
                'createRoot(root).render(React.isValidElement(Component) ? Component : React.createElement(Component));',
              ].join('\n'),
              loader: 'tsx',
              resolveDir: entryDirectory.replace(/\/$/, ''),
            };
          }
          const file = projectFiles.get(args.path);
          const loader = getModuleLoader(args.path);
          if (!file || typeof file.content !== 'string' || !loader) {
            return { errors: [{ text: `Cannot load project module "${args.path}".` }] };
          }
          if (/\.vue$/i.test(args.path)) {
            try {
              const component = await compileVueComponent(args.path, file.content);
              component.code = vueRuntimeShim(component.code);
              if (component.css) {
                compiledStyles.set(args.path, component.css);
                component.code += `\nimport ${JSON.stringify(`tatik-preview-style:${args.path}`)};`;
              }
              return { contents: component.code, loader: component.loader, resolveDir: args.path.slice(0, args.path.lastIndexOf('/')) };
            } catch (error) {
              return { errors: [{ text: error instanceof Error ? error.message : String(error) }] };
            }
          }
          if (/\.svelte$/i.test(args.path)) {
            try {
              const component = await compileSvelteComponent(args.path, file.content);
              if (component.css) {
                compiledStyles.set(args.path, component.css);
                component.code += `\nimport ${JSON.stringify(`tatik-preview-style:${args.path}`)};`;
              }
              return { contents: component.code, loader: 'js', resolveDir: args.path.slice(0, args.path.lastIndexOf('/')) };
            } catch (error) {
              return { errors: [{ text: error instanceof Error ? error.message : String(error) }] };
            }
          }
          if (previewStyleExtensions.test(args.path) && !/\.css$/i.test(args.path)) {
            try {
              const { compilePreviewStylesheet } = await import('./previewStyleCompiler');
              return {
                contents: await compilePreviewStylesheet(args.path, file.content),
                loader: 'css',
                resolveDir: args.path.slice(0, args.path.lastIndexOf('/')),
              };
            } catch (error) {
              return { errors: [{ text: error instanceof Error ? error.message : String(error) }] };
            }
          }
          return { contents: file.content, loader, resolveDir: args.path.slice(0, args.path.lastIndexOf('/')) };
        });
      },
    }],
  };
}

export async function compilePreviewProject<TFile extends PreviewCompilerFile>(
  files: TFile[],
  entryPath: string,
  openedFolderName = '',
  compileOptions: PreviewCompileOptions = {},
): Promise<CompiledPreviewProject> {
  const normalizedEntry = normalizePreviewPath(entryPath, openedFolderName).toLowerCase();
  const options = createPreviewCompilerBuildOptions(files, entryPath, openedFolderName, compileOptions);
  await initializeCompiler();
  const result = await esbuild.build(options);
  const outputFiles = result.outputFiles || [];
  const javascriptOutput = outputFiles.find(file => file.path.endsWith('.js'));
  if (!javascriptOutput) {
    throw new Error(
      `The preview compiler did not produce JavaScript output (files: ${outputFiles.map(file => file.path).join(', ') || 'none'}).`,
    );
  }

  const inputPaths = new Set(
    Object.keys(result.metafile?.inputs || {})
      .filter(path => path.startsWith('tatik-project:'))
      .map(path => path.slice('tatik-project:'.length).toLowerCase()),
  );
  inputPaths.add(normalizedEntry);
  const requiresReact = Object.keys(result.metafile?.inputs || {})
    .some(path => path.startsWith('tatik-react-runtime:'));
  const inputPathsList = Object.keys(result.metafile?.inputs || {});
  const requiresVue = javascriptOutput.text.includes('TatikPreviewFramework?.vue');
  const requiresSvelte = javascriptOutput.text.includes('TatikPreviewFramework?.svelte');

  return {
    code: javascriptOutput.text,
    css: outputFiles.find(file => file.path.endsWith('.css'))?.text || '',
    inputPaths,
    requiresReact,
    requiresVue,
    requiresSvelte,
  };
}
