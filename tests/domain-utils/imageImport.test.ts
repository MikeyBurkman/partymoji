import { describe, expect, it } from 'vitest';
import { readImage, getImageFromUrl } from '~/domain/utils/imageImport';
import { blobOrFileToDataUrl } from '~/domain/utils/misc';
import { makeGif } from './fixtures';

const red = [255, 0, 0, 255];
const green = [0, 255, 0, 255];
const blue = [0, 0, 255, 255];
const clear = [0, 0, 0, 0];

describe('GIF import using real encoded files', () => {
  it('replaces equal-size patches completely when transparent pixels follow opaque ones', async () => {
    const file = makeGif(
      [2, 1],
      [
        { width: 1, height: 1, pixels: [1] },
        { width: 1, height: 1, left: 1, pixels: [0] },
        { width: 1, height: 1, left: 1, pixels: [2] },
        { width: 1, height: 1, pixels: [0], disposal: 2 },
      ],
    );
    const result = await readImage(file);
    expect(result.image.frames.map((frame) => Array.from(frame))).toEqual([
      [...red, ...clear],
      [...red, ...clear],
      [...red, ...green],
      [...clear, ...clear],
    ]);
  });

  it('composites offset patches, preserves transparent pixels, and averages delays', async () => {
    const file = makeGif(
      [2, 2],
      [
        { width: 2, height: 2, pixels: [1, 1, 1, 1], delay: 10 },
        { width: 1, height: 2, left: 1, pixels: [2, 0], delay: 20 },
        { width: 2, height: 1, top: 1, pixels: [0, 3], delay: 30 },
      ],
    );
    const result = await readImage(file);
    expect(result.image.dimensions).toEqual([2, 2]);
    expect(result.fps).toBe(5);
    expect(result.dataUrl.startsWith('data:image/gif;base64,')).toBe(true);
    expect(result.image.frames.map((frame) => Array.from(frame))).toEqual([
      [...red, ...red, ...red, ...red],
      [...red, ...green, ...red, ...red],
      [...red, ...green, ...red, ...blue],
    ]);
    result.image.frames[2][0] = 12;
    expect(result.image.frames[0][0]).toBe(255);
  });

  it('preserves current disposal-2 behavior: clear before drawing that patch', async () => {
    // Characterization of existing behavior, not a claim of GIF-spec compliance.
    const file = makeGif(
      [2, 1],
      [
        { width: 2, height: 1, pixels: [1, 1] },
        { width: 1, height: 1, left: 1, pixels: [2], disposal: 2 },
        { width: 1, height: 1, pixels: [3] },
      ],
    );
    const result = await readImage(file);
    expect(result.image.frames.map((frame) => Array.from(frame))).toEqual([
      [...red, ...red],
      [...clear, ...green],
      [...blue, ...green],
    ]);
  });

  it('accepts a GIF data URL and preserves it in the result', async () => {
    const file = makeGif(
      [1, 1],
      [{ width: 1, height: 1, pixels: [3], delay: 5 }],
    );
    const dataUrl = await blobOrFileToDataUrl(file);
    const result = await readImage(dataUrl);
    expect(result.dataUrl).toBe(dataUrl);
    expect(result.fps).toBe(20);
    expect(Array.from(result.image.frames[0])).toEqual(blue);
  });
});

describe('static image import', () => {
  it('decodes PNG files and data URLs with default FPS', async () => {
    // Encode with the browser, independently of the domain's canvas helpers.
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 1, 1);
    const dataUrl = canvas.toDataURL('image/png');
    const file = new File(
      [await (await fetch(dataUrl)).blob()],
      'fixture.png',
      { type: 'image/png' },
    );
    for (const input of [dataUrl, file]) {
      const result = await readImage(input);
      expect(result.image.dimensions).toEqual([2, 1]);
      expect(result.fps).toBe(20);
      expect(result.image.frames).toHaveLength(1);
      expect(result.image.frames[0]).toBeInstanceOf(Uint8ClampedArray);
      expect(Array.from(result.image.frames[0])).toEqual([...red, ...clear]);
    }
  });
});

describe('URL conversion', () => {
  it('converts a real fetched response to a data URL without losing binary bytes', async () => {
    const url = URL.createObjectURL(
      new Blob([new Uint8Array([0, 1, 127, 128, 255])], { type: 'image/png' }),
    );
    try {
      expect(await getImageFromUrl(url)).toBe('data:image/png;base64,AAF/gP8=');
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  it('rejects a fetched response without a content type', async () => {
    const url = URL.createObjectURL(new Blob([new Uint8Array([0])]));
    try {
      await expect(getImageFromUrl(url)).rejects.toThrow(
        'Unable to determine content type',
      );
    } finally {
      URL.revokeObjectURL(url);
    }
  });
});
