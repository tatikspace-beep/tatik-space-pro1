import type { IFD } from 'utif';

const conversionExtensions = new Set([
  'heic',
  'heif',
  'heics',
  'heifs',
  'jxl',
  'tif',
  'tiff',
]);

function getExtension(fileName: string): string {
  return fileName.split(/[?#]/, 1)[0]?.split('.').pop()?.toLowerCase() || '';
}

async function encodeWebp(imageData: ImageData): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create an image conversion canvas');
  context.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      result =>
        result
          ? resolve(result)
          : reject(new Error('WebP encoding is not supported')),
      'image/webp',
      0.92
    );
  });
  if (blob.type !== 'image/webp')
    throw new Error('The browser did not encode the image as WebP');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error('Unable to read converted WebP data'));
    reader.readAsDataURL(blob);
  });
}

async function convertWithBitmap(blob: Blob): Promise<string> {
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context)
      throw new Error('Unable to create an image conversion canvas');
    context.drawImage(bitmap, 0, 0);
    const converted = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        result =>
          result
            ? resolve(result)
            : reject(new Error('WebP encoding is not supported')),
        'image/webp',
        0.92
      );
    });
    if (converted.type !== 'image/webp')
      throw new Error('The browser did not encode the image as WebP');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () =>
        reject(reader.error ?? new Error('Unable to read converted WebP data'));
      reader.readAsDataURL(converted);
    });
  } finally {
    bitmap.close();
  }
}

async function decodeTiff(blob: Blob): Promise<ImageData> {
  const module = await import('utif');
  const buffer = await blob.arrayBuffer();
  const pages = module.decode(buffer);
  const page = pages[0];
  if (!page) throw new Error('The TIFF file contains no decodable image');
  module.decodeImage(buffer, page);
  const rgba = module.toRGBA8(page);
  return new ImageData(new Uint8ClampedArray(rgba), page.width, page.height);
}

export function needsPreviewImageConversion(fileName: string): boolean {
  return conversionExtensions.has(getExtension(fileName));
}

export async function convertPreviewImageToWebp(
  fileName: string,
  dataUrl: string
): Promise<string> {
  const extension = getExtension(fileName);
  if (!conversionExtensions.has(extension)) {
    throw new Error(
      `No WebP conversion is configured for .${extension || 'unknown'} files`
    );
  }

  const source = await fetch(dataUrl);
  if (!source.ok) throw new Error(`Unable to read image data for ${fileName}`);
  const blob = await source.blob();

  if (extension === 'jxl') {
    const { default: decode } = await import('@jsquash/jxl/decode.js');
    return encodeWebp(await decode(await blob.arrayBuffer()));
  }
  if (extension === 'tif' || extension === 'tiff') {
    return encodeWebp(await decodeTiff(blob));
  }

  const { default: convertHeic } = await import('heic2any');
  const converted = await convertHeic({ blob, toType: 'image/png' });
  const firstImage = Array.isArray(converted) ? converted[0] : converted;
  if (!firstImage)
    throw new Error(`No image could be decoded from ${fileName}`);
  return convertWithBitmap(firstImage);
}
