import { describe, expect, it } from 'vitest';
import { compilePreviewStylesheet } from './previewStyleCompiler';

describe('browser preview stylesheet compiler', () => {
  it('passes CSS through unchanged', async () => {
    await expect(compilePreviewStylesheet('styles.css', 'h1 { color: red }'))
      .resolves.toBe('h1 { color: red }');
  });

  it('compiles SCSS variables and nesting', async () => {
    const css = await compilePreviewStylesheet(
      'styles.scss',
      '$accent: #123456; .card { color: $accent; &:hover { color: white; } }',
    );

    expect(css).toContain('.card {');
    expect(css).toContain('color: #123456;');
    expect(css).toContain('.card:hover');
  });

  it('compiles indented Sass syntax', async () => {
    const css = await compilePreviewStylesheet(
      'styles.sass',
      '$accent: #123456\n.card\n  color: $accent',
    );

    expect(css).toContain('.card');
    expect(css).toContain('color: #123456');
  });

  it('compiles Less variables and nesting', async () => {
    const css = await compilePreviewStylesheet(
      'styles.less',
      '@accent: #123456; .card { color: @accent; &:hover { color: white; } }',
    );

    expect(css).toContain('.card {');
    expect(css).toContain('color: #123456;');
    expect(css).toContain('.card:hover');
  });

  it('rejects stylesheet imports instead of fetching arbitrary files', async () => {
    await expect(compilePreviewStylesheet('styles.scss', '@import "https://example.test/theme";'))
      .rejects.toThrow('Stylesheet imports are not supported');
  });
});
