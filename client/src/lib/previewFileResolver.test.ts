import { describe, expect, it } from 'vitest';
import { resolvePreviewFile } from './previewFileResolver';

const projectFiles = [
  { path: 'website/index.html', content: 'home' },
  { path: 'website/pages/about.html', content: 'about' },
  { path: 'website/pages/index.html', content: 'pages' },
  { path: 'website/assets/about.html', content: 'wrong basename' },
  { path: 'website/assets/site.css', content: 'styles' },
];

describe('resolvePreviewFile', () => {
  it('resolves nested relative paths from the current HTML file', () => {
    expect(resolvePreviewFile(projectFiles, '../assets/site.css', 'website/pages/about.html', 'website')?.file.content)
      .toBe('styles');
  });

  it('resolves folder links to their index.html', () => {
    expect(resolvePreviewFile(projectFiles, 'pages/', 'website/index.html', 'website')?.file.content)
      .toBe('pages');
  });

  it('ignores query and fragment for lookup while resolving the exact path', () => {
    expect(resolvePreviewFile(projectFiles, 'pages/about.html?view=full#team', 'website/index.html', 'website')?.file.content)
      .toBe('about');
  });

  it('normalizes Windows separators and a root-prefixed absolute project path', () => {
    expect(resolvePreviewFile(projectFiles, '/website/pages/about.html', 'website/index.html', 'website')?.file.content)
      .toBe('about');
    expect(resolvePreviewFile(projectFiles, '..\\assets\\site.css', 'website/pages/about.html', 'website')?.file.content)
      .toBe('styles');
  });

  it('does not guess by basename when a relative path is missing', () => {
    expect(resolvePreviewFile(projectFiles, 'missing/about.html', 'website/index.html', 'website'))
      .toBeUndefined();
  });

  it('does not treat external URLs or in-page fragments as project files', () => {
    expect(resolvePreviewFile(projectFiles, 'https://example.com', 'website/index.html', 'website'))
      .toBeUndefined();
    expect(resolvePreviewFile(projectFiles, '#section', 'website/index.html', 'website'))
      .toBeUndefined();
  });
});
