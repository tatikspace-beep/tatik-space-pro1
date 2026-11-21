import { describe, expect, it } from 'vitest';
import {
  createPreviewAssetDocument,
  getPreviewFileMimeType,
  isPreviewBinaryAsset,
  isPreviewImageFile,
  rewritePreviewSrcset,
} from './previewAssets';

describe('preview image assets', () => {
  it.each([
    ['photo.png', 'image/png'],
    ['photo.jpg', 'image/jpeg'],
    ['photo.jpeg', 'image/jpeg'],
    ['photo.jfif', 'image/jpeg'],
    ['photo.jpe', 'image/jpeg'],
    ['photo.pjpeg', 'image/jpeg'],
    ['photo.pjp', 'image/jpeg'],
    ['animation.gif', 'image/gif'],
    ['illustration.svg', 'image/svg+xml'],
    ['photo.webp', 'image/webp'],
    ['photo.avif', 'image/avif'],
    ['animation.apng', 'image/apng'],
    ['photo.bmp', 'image/bmp'],
    ['favicon.ico', 'image/vnd.microsoft.icon'],
    ['cursor.cur', 'image/x-icon'],
    ['animation.jxl', 'image/jxl'],
    ['photo.tif', 'image/tiff'],
    ['photo.tiff', 'image/tiff'],
    ['photo.heic', 'image/heic'],
    ['photo.heif', 'image/heif'],
    ['photo.heics', 'image/heic-sequence'],
    ['photo.heifs', 'image/heif-sequence'],
  ])('sets the correct MIME type for %s', (fileName, mimeType) => {
    expect(getPreviewFileMimeType(fileName)).toBe(mimeType);
    expect(isPreviewImageFile(fileName)).toBe(true);
  });

  it('ignores filename case and URL suffixes when detecting image types', () => {
    expect(isPreviewImageFile('assets/Logo.SvG?revision=2')).toBe(true);
    expect(getPreviewFileMimeType('assets/Logo.PNG#preview')).toBe('image/png');
  });

  it('leaves non-image files out of the image preview MIME map', () => {
    expect(isPreviewImageFile('app.js')).toBe(false);
    expect(getPreviewFileMimeType('app.js')).toBe('text/javascript');
    expect(getPreviewFileMimeType('unknown.file')).toBe('text/plain');
  });

  it.each(['song.mp3', 'song.wav', 'song.ogg', 'song.m4a'])(
    'creates an audio player for %s',
    fileName => {
      const document = createPreviewAssetDocument(fileName, 'data:audio/mpeg;base64,AAAA', 'it');

      expect(isPreviewBinaryAsset(fileName)).toBe(true);
      expect(document).toContain('<audio controls');
      expect(document).toContain('data:audio/mpeg;base64,AAAA');
    },
  );

  it.each(['clip.mp4', 'clip.webm', 'clip.mov'])(
    'creates a video player for %s',
    fileName => {
      const document = createPreviewAssetDocument(fileName, 'data:video/mp4;base64,AAAA', 'en');

      expect(document).toContain('<video controls');
      expect(document).toContain('playsinline');
      expect(document).toContain('data:video/mp4;base64,AAAA');
    },
  );

  it.each(['font.woff', 'font.woff2', 'font.ttf', 'font.otf'])(
    'creates a font sample for %s',
    fileName => {
      const document = createPreviewAssetDocument(fileName, 'data:font/woff2;base64,AAAA', 'it');

      expect(document).toContain('@font-face');
      expect(document).toContain('Aa Bb Cc 123');
      expect(document).toContain('data:font/woff2;base64,AAAA');
    },
  );

  it('escapes asset filenames in the preview document', () => {
    const document = createPreviewAssetDocument('<img onerror=alert(1)>.mp3', 'data:audio/mpeg;base64,AAAA', 'en');

    expect(document).not.toContain('<img onerror=alert(1)>');
    expect(document).toContain('&lt;img onerror=alert(1)&gt;.mp3');
  });

  it('returns no asset document for unsupported formats', () => {
    expect(() => createPreviewAssetDocument('app.js', 'data:text/javascript,alert(1)', 'en'))
      .toThrow('No binary preview is configured for app.js');
    expect(isPreviewBinaryAsset('app.js')).toBe(false);
  });
});

describe('rewritePreviewSrcset', () => {
  it('rewrites local image paths without changing descriptors', () => {
    expect(rewritePreviewSrcset('small.png 1x, large.png 2x', url => `/local/${url}`))
      .toBe('/local/small.png 1x, /local/large.png 2x');
  });

  it('preserves the comma inside a data URL', () => {
    expect(rewritePreviewSrcset(
      'data:image/png;base64,AAAA 1x, photo.png 2x',
      url => url.startsWith('data:') ? url : `/local/${url}`,
    )).toBe('data:image/png;base64,AAAA 1x, /local/photo.png 2x');
  });

  it('handles comma-separated candidates without descriptors', () => {
    expect(rewritePreviewSrcset('one.svg, two.svg', url => `/local/${url}`))
      .toBe('/local/one.svg, /local/two.svg');
  });
});
