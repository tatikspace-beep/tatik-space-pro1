import { afterEach, describe, expect, it, vi } from 'vitest';
import { encodeImage } from 'utif';
import {
  convertPreviewImageToWebp,
  needsPreviewImageConversion,
} from './previewImageConversion';

class TestImageData {
  constructor(
    public data: Uint8ClampedArray,
    public width: number,
    public height: number
  ) {}
}

function toDataUrl(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  return `data:image/tiff;base64,${btoa(binary)}`;
}

function mockCanvas(webpType = 'image/webp') {
  const putImageData = vi.fn();
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ({ putImageData })),
    toBlob: (callback: BlobCallback) =>
      callback(new Blob(['webp'], { type: webpType })),
  };
  vi.stubGlobal('document', { createElement: () => canvas });
  vi.stubGlobal('ImageData', TestImageData);
  vi.stubGlobal(
    'FileReader',
    class {
      result: string | null = null;
      error: DOMException | null = null;
      onload: ((event: ProgressEvent<FileReader>) => unknown) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => unknown) | null = null;

      readAsDataURL() {
        this.result = 'data:image/webp;base64,d2VicA==';
        this.onload?.({} as ProgressEvent<FileReader>);
      }
    }
  );
  return { canvas, putImageData };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('preview image conversion', () => {
  it.each([
    'photo.heic',
    'photo.heif',
    'photo.heics',
    'photo.heifs',
    'photo.jxl',
    'photo.tif',
    'photo.tiff',
  ])('recognizes %s as requiring preview conversion', fileName => {
    expect(needsPreviewImageConversion(fileName)).toBe(true);
  });

  it('converts TIFF pixels to WebP preview data', async () => {
    const { putImageData } = mockCanvas();
    const tiff = encodeImage(new Uint8Array([255, 0, 0, 255]), 1, 1);

    await expect(
      convertPreviewImageToWebp('pixel.tiff', toDataUrl(tiff))
    ).resolves.toBe('data:image/webp;base64,d2VicA==');

    expect(putImageData).toHaveBeenCalledWith(
      expect.objectContaining({
        data: new Uint8ClampedArray([255, 0, 0, 255]),
        width: 1,
        height: 1,
      }),
      0,
      0
    );
  });

  it('rejects when the browser does not produce WebP output', async () => {
    mockCanvas('image/png');
    const tiff = encodeImage(new Uint8Array([0, 0, 0, 255]), 1, 1);

    await expect(
      convertPreviewImageToWebp('pixel.tif', toDataUrl(tiff))
    ).rejects.toThrow('The browser did not encode the image as WebP');
  });

  it('rejects unsupported conversion requests explicitly', async () => {
    await expect(
      convertPreviewImageToWebp('photo.png', 'data:image/png;base64,AA==')
    ).rejects.toThrow('No WebP conversion is configured for .png files');
  });
});
