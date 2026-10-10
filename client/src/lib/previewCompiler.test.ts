import { build } from 'esbuild';
import { describe, expect, it } from 'vitest';
import { createPreviewCompilerBuildOptions } from './previewCompiler';

describe('browser preview project compiler', () => {
  it('bundles a TSX React entry with relative TypeScript imports', async () => {
    const options = createPreviewCompilerBuildOptions([
      {
        path: 'src/main.tsx',
        content: 'import { createRoot } from "react-dom/client"; import App from "./App"; createRoot(document.getElementById("root")!).render(<App />);',
      },
      {
        path: 'src/App.tsx',
        content: 'import { useState } from "react"; export default function App(){ const [count, setCount] = useState(0); return <button onClick={() => setCount(count + 1)}>Clicks: {count}</button>; }',
      },
    ], 'src/main.tsx');

    const result = await build(options);
    const output = result.outputFiles?.find(file => file.path.endsWith('.js'))?.text || '';

    expect(output).toContain('Clicks:');
    expect(output).toContain('TatikPreviewReact');
    expect(result.metafile?.inputs).toHaveProperty('tatik-react-runtime:react');
    expect(Object.keys(result.metafile?.inputs || {})).toEqual(expect.arrayContaining([
      'tatik-project:src/main.tsx',
      'tatik-project:src/app.tsx',
    ]));
  });

  it('bundles local MJS imports into the browser preview', async () => {
    const result = await build(createPreviewCompilerBuildOptions([
      { path: 'src/main.mjs', content: 'import { greeting } from "./greeting.mjs"; document.body.textContent = greeting;' },
      { path: 'src/greeting.mjs', content: 'export const greeting = "Hello from MJS";' },
    ], 'src/main.mjs'));
    const output = result.outputFiles?.find(file => file.path.endsWith('.js'))?.text || '';

    expect(output).toContain('Hello from MJS');
    expect(Object.keys(result.metafile?.inputs || {})).toEqual(expect.arrayContaining([
      'tatik-project:src/main.mjs',
      'tatik-project:src/greeting.mjs',
    ]));
  });

  it('transforms standalone TypeScript without pulling in the React runtime', async () => {
    const options = createPreviewCompilerBuildOptions([
      { path: 'main.ts', content: 'const total: number = 4 + 5; document.body.textContent = String(total);' },
    ], 'main.ts');

    const result = await build(options);

    expect(result.outputFiles?.some(file => file.text.includes('document.body.textContent'))).toBe(true);
    expect(Object.keys(result.metafile?.inputs || {}).some(path => path.startsWith('tatik-react-runtime:'))).toBe(false);
  });

  it('creates a React mounting entry for a standalone TSX component', async () => {
    const options = createPreviewCompilerBuildOptions([
      {
        path: 'components/Greeting.tsx',
        content: 'export default function Greeting(){ return <h1>Hello from TSX</h1>; }',
      },
    ], 'components/Greeting.tsx', '', { mountDefaultComponent: true });

    const result = await build(options);
    const output = result.outputFiles?.find(file => file.path.endsWith('.js'))?.text || '';

    expect(output).toContain('Hello from TSX');
    expect(output).toContain('createRoot');
    expect(output).toContain('tatik-react-runtime:react');
    expect(Object.keys(result.metafile?.inputs || {})).toContain('tatik-project:components/greeting.tsx');
  });

  it('compiles and mounts a standalone Vue component with scoped Sass styles', async () => {
    const result = await build(createPreviewCompilerBuildOptions([
      {
        path: 'components/Greeting.vue',
        content: '<script setup lang="ts">import { ref, type Ref } from "vue"; const message: Ref<string> = ref("Hello Vue");</script><template><h1 class="greeting">{{ message }}</h1></template><style lang="scss" scoped>.greeting { color: red; }</style>',
      },
    ], 'components/Greeting.vue', '', { mountDefaultComponent: true }));
    const javascript = result.outputFiles?.find(file => file.path.endsWith('.js'))?.text || '';
    const css = result.outputFiles?.find(file => file.path.endsWith('.css'))?.text || '';

    expect(javascript).toContain('TatikPreviewFramework');
    expect(javascript).toContain('createApp');
    expect(javascript).toContain('Hello Vue');
    expect(css).toContain('color: red');
    expect(css).toContain('data-v-');
  });

  it('compiles and mounts a standalone Svelte component with component styles', async () => {
    const result = await build(createPreviewCompilerBuildOptions([
      {
        path: 'components/Greeting.svelte',
        content: '<script>import { onMount } from "svelte"; let message = "Hello Svelte"; onMount(() => {});</script><h1>{message}</h1><style>h1 { color: red; }</style>',
      },
    ], 'components/Greeting.svelte', '', { mountDefaultComponent: true }));
    const javascript = result.outputFiles?.find(file => file.path.endsWith('.js'))?.text || '';
    const css = result.outputFiles?.find(file => file.path.endsWith('.css'))?.text || '';

    expect(javascript).toContain('TatikPreviewFramework');
    expect(javascript).toContain('svelteApi');
    expect(javascript).toContain('Hello Svelte');
    expect(css).toContain('color: red');
    expect(Object.keys(result.metafile?.inputs || {})).toContain('tatik-project:components/greeting.svelte');
  });

  it('rejects automatic component mounting for non-JSX entries', () => {
    expect(() => createPreviewCompilerBuildOptions([
      { path: 'main.ts', content: 'export default 1;' },
    ], 'main.ts', '', { mountDefaultComponent: true }))
      .toThrow('available only for component files');
  });

  it('reports npm packages outside the built-in React runtime', async () => {
    const options = createPreviewCompilerBuildOptions([
      { path: 'src/main.tsx', content: 'import Widget from "missing-package"; export default Widget;' },
    ], 'src/main.tsx');

    await expect(build(options)).rejects.toThrow(
      'Package "missing-package" is not installed in the browser preview',
    );
  });

  it('enforces the browser build size limit before compiling', () => {
    const files = Array.from({ length: 101 }, (_, index) => ({
      path: `src/file-${index}.ts`,
      content: '',
    }));

    expect(() => createPreviewCompilerBuildOptions(files, 'src/file-0.ts'))
      .toThrow('100 files or 1 MB');
  });
});
