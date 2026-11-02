import type { Dimensions, Image } from '~/domain/types';

/** Deterministic, opaque RGBA data; allocate outside timed benchmark callbacks. */
export function makeImage(dimensions: Dimensions, frameCount: number): Image {
  const [width, height] = dimensions;
  return {
    dimensions,
    frames: Array.from({ length: frameCount }, (_, frameIndex) => {
      const frame = new Uint8ClampedArray(width * height * 4);
      for (let offset = 0; offset < frame.length; offset += 4) {
        frame[offset] = (offset / 4 + frameIndex * 17) % 256;
        frame[offset + 1] = ((offset / 4) * 3 + frameIndex * 11) % 256;
        frame[offset + 2] = ((offset / 4) * 7 + frameIndex * 5) % 256;
        frame[offset + 3] = 255;
      }
      return frame;
    }),
  };
}

interface GifPatch {
  width: number;
  height: number;
  left?: number;
  top?: number;
  disposal?: number;
  /** Hundredths of a second, as stored in GIF. */
  delay?: number;
  /** Palette: transparent black, red, green, blue. */
  pixels: Array<number>;
}

/**
 * Tiny test-only GIF fixture writer, independent of the app's encoder.
 * Clear the LZW dictionary before each palette index, keeping codes at 3 bits.
 * Deliberately inefficient compression keeps the fixture format easy to audit.
 */
export function makeGif(
  dimensions: Dimensions,
  patches: Array<GifPatch>,
): File {
  const word = (value: number) => [value & 255, (value >> 8) & 255];
  const bytes = [
    ...Array.from('GIF89a', (char) => char.charCodeAt(0)),
    ...word(dimensions[0]),
    ...word(dimensions[1]),
    0x81,
    0,
    0,
    0,
    0,
    0,
    255,
    0,
    0,
    0,
    255,
    0,
    0,
    0,
    255,
  ];
  for (const patch of patches) {
    if (patch.pixels.length !== patch.width * patch.height) {
      throw new Error('GIF fixture pixel count must match patch dimensions');
    }
    bytes.push(
      0x21,
      0xf9,
      4,
      ((patch.disposal ?? 1) << 2) | 1,
      ...word(patch.delay ?? 10),
      0,
      0,
      0x2c,
      ...word(patch.left ?? 0),
      ...word(patch.top ?? 0),
      ...word(patch.width),
      ...word(patch.height),
      0,
      2,
    );
    const codes = patch.pixels.flatMap((pixel) => [4, pixel]);
    codes.push(5);
    const compressed = new Uint8Array(Math.ceil((codes.length * 3) / 8));
    codes.forEach((code, index) => {
      const bit = index * 3;
      compressed[bit >> 3] |= code << bit % 8;
      if (bit % 8 > 5) compressed[(bit >> 3) + 1] |= code >> (8 - (bit % 8));
    });
    for (let offset = 0; offset < compressed.length; offset += 255) {
      const block = compressed.subarray(offset, offset + 255);
      bytes.push(block.length, ...block);
    }
    bytes.push(0);
  }
  bytes.push(0x3b);
  return new File([new Uint8Array(bytes)], 'fixture.gif', {
    type: 'image/gif',
  });
}
