import { describe, expect, it } from 'vitest';
import { createPreviewDataDocument } from './previewDataViewer';

describe('safe read-only preview for data and documentation', () => {
  it('pretty prints valid JSON', () => {
    const document = createPreviewDataDocument('data.json', '{"enabled":true,"count":2}', 'en');

    expect(document).toContain('&quot;enabled&quot;: true');
    expect(document).toContain('&quot;count&quot;: 2');
    expect(document).toContain('Safe read-only view.');
  });

  it('reports invalid JSON and preserves its original content', () => {
    const document = createPreviewDataDocument('settings.json', '{"enabled":', 'it');

    expect(document).toContain('JSON non valido');
    expect(document).toContain('{&quot;enabled&quot;:');
  });

  it.each(['feed.xml', 'README.md', 'config.yml', 'config.toml', 'settings.conf'])(
    'shows %s as escaped text rather than executable markup',
    fileName => {
      const document = createPreviewDataDocument(fileName, '<script>alert(1)</script>', 'en');

      expect(document).not.toContain('<script>alert(1)</script>');
      expect(document).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    },
  );
});
