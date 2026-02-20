import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorView, basicSetup } from 'codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { Decoration } from '@codemirror/view';
import { EditorState, StateEffect, StateField, RangeSetBuilder } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { xml } from '@codemirror/lang-xml';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { sql } from '@codemirror/lang-sql';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { cpp } from '@codemirror/lang-cpp';
import { yaml } from '@codemirror/lang-yaml';
import { autocompletion } from '@codemirror/autocomplete';

// Auto-detect programming language from code content
function detectLanguage(code: string): 'javascript' | 'typescript' | 'html' | 'css' | 'python' | 'xml' | 'json' | 'plaintext' | 'markdown' | 'sql' | 'java' | 'rust' | 'go' | 'ruby' | 'php' | 'swift' | 'kotlin' | 'csharp' | 'cpp' | 'shell' | 'yaml' | 'dockerfile' {
  if (!code.trim()) return 'plaintext';

  // JSON detection
  if (code.trim().startsWith('{') || code.trim().startsWith('[')) {
    try {
      JSON.parse(code);
      return 'json';
    } catch {
      // Not valid JSON, continue
    }
  }

  // SQL detection
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\b/i.test(code)) {
    return 'sql';
  }

  // Python detection
  if (/^\s*(import|from|def|class|if __name__|async def)\b/i.test(code) || /:\s*$/.test(code.split('\n')[0])) {
    return 'python';
  }

  // HTML/XML detection
  if (/<[!?]?[a-zA-Z]/.test(code)) {
    if (/<html|<!DOCTYPE|<body|<head/i.test(code)) {
      return 'html';
    }
    return 'xml';
  }

  // CSS detection
  if (/[a-zA-Z-]+\s*:\s*[^;]*;/.test(code)) {
    return 'css';
  }

  // Markdown detection
  if (/^#+\s|^\*\*\*|^---/.test(code)) {
    return 'markdown';
  }

  // Shell/Bash detection
  if (/^#!\/bin\/bash|^#!\/bin\/sh|^\$\s|^for |^while |^case /i.test(code)) {
    return 'shell';
  }

  // Java detection
  if (/\bpublic\s+class\b|\bimport\s+java|@Override|public\s+static\s+void\s+main/.test(code)) {
    return 'java';
  }

  // C# detection
  if (/\busing\s+System|namespace\s+\w+|public\s+class\b|public\s+async\s+Task/.test(code)) {
    return 'csharp';
  }

  // Go detection
  if (/package\s+\w+|^func\s+|import\s+\(|:=/.test(code)) {
    return 'go';
  }

  // Rust detection
  if (/^fn\s+\w+|impl\s+\w+|pub\s+fn|let\s+mut\s+/.test(code)) {
    return 'rust';
  }

  // Ruby detection
  if (/def\s+\w+\s*\(|\.each\s*{|@\w+\s*=/.test(code) || code.includes('ruby')) {
    return 'ruby';
  }

  // PHP detection
  if (/php|\$\w+\s*=|function\s+\w+\s*\(/.test(code)) {
    return 'php';
  }

  // Swift detection
  if (/^import\s+Foundation|func\s+\w+|class\s+\w+|let\s+\w+\s*:/.test(code)) {
    return 'swift';
  }

  // Kotlin detection
  if (/fun\s+\w+|class\s+\w+\s*{|val\s+\w+|var\s+\w+|\:\s+String|->/.test(code)) {
    return 'kotlin';
  }

  // C++ detection
  if (/#include\s*[<"]|std::|void\s+\w+|int\s+main|template\s*</.test(code)) {
    return 'cpp';
  }

  // TypeScript detection (must come after other detections)
  if (/interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean|any|interface|type|void)\b/.test(code)) {
    return 'typescript';
  }

  // JavaScript detection (default for code-like content)
  if (/\bfunction\b|\bconst\b|\blet\b|\bvar\b|=>|\/\/|\/\*/.test(code)) {
    return 'javascript';
  }

  return 'plaintext';
}

// Stable effect and field for highlights
const setHighlights = StateEffect.define<{ ranges: { from: number; to: number }[] }>();
const highlightField = StateField.define<any>({
  create() { return Decoration.none; },
  update(deco, tr) {
    for (let e of tr.effects) {
      if (e.is(setHighlights)) {
        const builder = new RangeSetBuilder<Decoration>();
        for (const r of e.value.ranges) {
          builder.add(r.from, r.to, Decoration.mark({ class: 'cm-search-match' }));
        }
        deco = builder.finish();
      }
    }
    return deco.map(tr.changes);
  },
  provide: f => EditorView.decorations.from(f)
});

// Light theme for CodeMirror
const lightTheme = EditorView.theme({
  '.cm-content': { color: '#333', backgroundColor: '#ffffff' },
  '.cm-gutters': { backgroundColor: '#f5f5f5', color: '#666' },
  '.cm-activeLineGutter': { backgroundColor: '#e8f4f8' },
  '.cm-cursor': { borderLeftColor: '#333' },
  '.cm-matchingBracket': { backgroundColor: '#d6eaef', outline: '1px solid #b0d4e3' },
  '.cm-selectionBackground': { backgroundColor: '#cfe8f3' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#add6ff' },
  '.cm-searchMatch': { backgroundColor: '#fff59d', outline: '1px solid #f57f17' },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: '#f57c00' },
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'javascript' | 'typescript' | 'html' | 'css' | 'python' | 'xml' | 'json' | 'plaintext' | 'markdown' | 'sql' | 'java' | 'rust' | 'go' | 'ruby' | 'php' | 'swift' | 'kotlin' | 'csharp' | 'cpp' | 'shell' | 'yaml' | 'dockerfile';
  height?: string;
  highlightRanges?: { from: number; to: number }[];
  jumpToLine?: number | null;
  autoDetectLanguage?: boolean;
}

const languageMap: Record<string, () => any> = {
  javascript: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  html: () => html(),
  css: () => css(),
  python: () => python(),
  xml: () => xml(),
  json: () => json(),
  markdown: () => markdown(),
  sql: () => sql(),
  java: () => java(),
  rust: () => rust(),
  go: () => go(),
  cpp: () => cpp(),
  yaml: () => yaml(),
  ruby: () => javascript(),
  php: () => javascript(),
  swift: () => javascript(),
  kotlin: () => javascript(),
  csharp: () => javascript(),
  shell: () => javascript(),
  dockerfile: () => javascript(),
  plaintext: () => [],
};

export function CodeEditor({
  value,
  onChange,
  language = 'plaintext',
  height = '400px',
  highlightRanges = [],
  jumpToLine = null,
  autoDetectLanguage = false,
}: CodeEditorProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Listen for theme changes on document.documentElement
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      console.log('[CodeEditor] Theme changed, isDark:', isDark);
      setIsDarkTheme(isDark);
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    window.addEventListener('storage', updateTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', updateTheme);
    };
  }, []);

  const detectedLanguage = useMemo(() => {
    return autoDetectLanguage ? detectLanguage(value) : language;
  }, [value, autoDetectLanguage, language]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    containerRef.current.innerHTML = '';

    const languageExtension = languageMap[detectedLanguage] ? languageMap[detectedLanguage]() : [];

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        isDarkTheme ? oneDark : lightTheme,
        languageExtension,
        highlightField,
        autocompletion(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '.cm-search-match': { background: isDarkTheme ? 'rgba(167,139,250,0.35)' : 'rgba(255,193,7,0.4)' },
          '.cm-editor': {
            height: '100%',
            width: '100%',
            overflow: 'auto'
          },
          '.cm-scroller': {
            paddingBottom: '160px',
            height: '100%',
            width: '100%',
            overflow: 'auto'
          },
          '.cm-line': { whiteSpace: 'pre' },
          '.cm-completionLabel': { fontSize: '0.9em' },
          '.cm-completion': { borderRadius: '4px', },
        }, { dark: isDarkTheme }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    view.dom.style.height = '100%';
    view.dom.style.width = '100%';

    const scroller = view.dom.querySelector('.cm-scroller') as HTMLElement;
    if (scroller) {
      scroller.style.height = '100%';
      scroller.style.width = '100%';
    }

    viewRef.current = view;
    console.log('[CodeEditor] Editor recreated with isDarkTheme:', isDarkTheme);

    return () => {
      view.destroy();
    };
  }, [detectedLanguage, isDarkTheme]);

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }

    if (viewRef.current) {
      try {
        viewRef.current.dispatch({ effects: setHighlights.of({ ranges: highlightRanges || [] }) });
      } catch (e) {
        // ignore
      }

      if (jumpToLine) {
        try {
          const line = viewRef.current.state.doc.line(jumpToLine);
          viewRef.current.dispatch({ selection: { anchor: line.from }, scrollIntoView: true });
        } catch (e) {
          // ignore
        }
      }
    }
  }, [value, highlightRanges, jumpToLine]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        style={{
          height: '100%',
          width: '100%',
          border: '1px solid #334155',
          borderRadius: '4px',
          overflow: 'auto',
        }}
        className={`w-full h-full ${isDarkTheme ? 'bg-slate-900' : 'bg-white'}`}
      />

      <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs">
        <div className={`px-2 py-1 rounded border ${isDarkTheme ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>{t('selectNextOccurrence')}</div>
        <a href="https://example.com/dev-courses" target="_blank" rel="noreferrer noopener" className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">{t('devCourses')}</a>
      </div>
    </div>
  );
}
