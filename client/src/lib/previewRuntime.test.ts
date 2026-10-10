import { describe, expect, it } from 'vitest';
import { createPreviewRuntimeDocument, getPreviewExecutionSupport, getPreviewRuntimeNotice } from './previewRuntime';

describe('static browser preview capabilities', () => {
  it.each(['index.html', 'page.htm', 'styles.css', 'app.js', 'app.javascript'])(
    'runs browser-native %s files in the live preview',
    fileName => {
      expect(getPreviewExecutionSupport(fileName)).toBe('browser');
    },
  );

  it.each([
    'app.ts', 'app.tsx', 'app.jsx', 'module.mjs', 'App.vue',
    'App.svelte', 'theme.scss', 'theme.sass', 'theme.less',
  ])(
    'supports browser compilation for %s',
    fileName => {
      expect(getPreviewExecutionSupport(fileName)).toBe('compiled');
    },
  );

  it.each([
    'Main.java', 'main.rs', 'main.go', 'main.cpp', 'script.php',
    'main.swift', 'Main.cs', 'script.rb', 'Main.kt', 'main.c', 'main.h',
    'main.cc', 'main.cxx', 'main.hpp', 'main.m', 'main.mm', 'script.sh',
    'script.bash', 'script.zsh', 'script.fish', 'main.dart', 'main.lua',
    'analysis.r', 'query.sql',
  ])(
    'requires a language runtime for %s',
    fileName => {
      expect(getPreviewExecutionSupport(fileName)).toBe('runtime');
    },
  );

  it.each(['Dockerfile', 'project/Makefile', 'project\\Makefile'])(
    'requires an external build tool for %s',
    fileName => {
      expect(getPreviewExecutionSupport(fileName)).toBe('tool');
    },
  );

  it.each(['data.json', 'feed.xml', 'README.md', 'config.yaml', 'config.yml', 'config.toml', 'config.ini', 'settings.conf'])(
    'identifies %s as non-executable data or documentation',
    fileName => {
      expect(getPreviewExecutionSupport(fileName)).toBe('data');
    },
  );

  it('explains the browser execution limit in Italian and English', () => {
    expect(getPreviewRuntimeNotice('Main.java', 'it').explanation)
      .toContain('L’anteprima esegue HTML, CSS e JavaScript del browser');
    expect(getPreviewRuntimeNotice('Main.java', 'en').explanation)
      .toContain('Java needs a dedicated runtime');
  });

  it('runs Python in the isolated browser WASM runner', () => {
    expect(getPreviewExecutionSupport('main.py')).toBe('browser-wasm');
    expect(getPreviewRuntimeNotice('main.py', 'it').explanation)
      .toContain('Il sorgente resta nel browser');
    expect(getPreviewRuntimeNotice('main.py', 'en').explanation)
      .toContain('Source stays in the browser');
  });

  it('escapes file-derived text before placing it in the preview document', () => {
    const notice = getPreviewRuntimeNotice('file.<script>alert(1)', 'en');
    const document = createPreviewRuntimeDocument(notice.heading, notice.explanation, 'en');

    expect(document).not.toContain('<script>alert(1)');
    expect(document).toContain('&lt;SCRIPT&gt;ALERT(1)');
  });

  it('does not claim data files require a runtime', () => {
    expect(getPreviewRuntimeNotice('config.yaml', 'it').explanation)
      .toContain('non un linguaggio eseguibile');
    expect(getPreviewRuntimeNotice('README.md', 'en').explanation)
      .toContain('not an executable language');
  });

  it('explains that MJS project imports are bundled in the browser', () => {
    expect(getPreviewRuntimeNotice('app.mjs', 'it').explanation)
      .toContain('raggruppati nel browser');
    expect(getPreviewRuntimeNotice('app.mjs', 'en').explanation)
      .toContain('bundled in the browser');
  });

  it('distinguishes included browser compilation from missing framework compilers', () => {
    expect(getPreviewRuntimeNotice('App.tsx', 'it').explanation)
      .toContain('runtime React incluso');
    expect(getPreviewRuntimeNotice('App.vue', 'it').explanation)
      .toContain('runtime incluso');
    expect(getPreviewRuntimeNotice('theme.scss', 'en').explanation)
      .toContain('compiled in the browser');
  });

  it('explains that Dockerfile and Makefile need external tools, not a language runtime', () => {
    expect(getPreviewRuntimeNotice('Dockerfile', 'it').explanation)
      .toContain('strumenti esterni');
    expect(getPreviewRuntimeNotice('Makefile', 'en').explanation)
      .toContain('external tools');
  });
});
