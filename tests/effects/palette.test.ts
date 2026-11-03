import { describe, expect, it } from 'vitest';
import seedrandom from 'seedrandom';
import type { Color, Image } from '~/domain/types';
import { reduceColorPalette } from '~/effects/reduce-color-palette';
import { pixels } from './fixtures';

const black: Color = [0, 0, 0, 255];
const dark: Color = [8, 8, 8, 255];
const light: Color = [240, 240, 240, 255];
const white: Color = [255, 255, 255, 255];
function run(image: Image, reduction: number) {
  return reduceColorPalette.fn({
    image,
    parameters: [reduction],
    random: seedrandom('palette'),
  });
}

// Literal expectations cover stable ties, whole-animation palettes, and source alpha.
describe('Reduce Color Palette', () => {
  it('selects a shared palette using colors from later frames and breaks ranking ties in encounter order', async () => {
    const image: Image = {
      dimensions: [2, 1],
      frames: [
        new Uint8ClampedArray([...black, ...dark]),
        new Uint8ClampedArray([...light, ...white]),
      ],
    };
    expect(pixels(await run(image, 50))).toEqual([
      [...black, ...dark],
      [...dark, ...dark],
    ]);
  });

  it('preserves all bytes at zero reduction without mutating or aliasing the input', async () => {
    const bytes = [
      0, 0, 0, 0, 8, 8, 8, 63, 240, 240, 240, 128, 255, 255, 255, 255,
    ];
    const image: Image = {
      dimensions: [4, 1],
      frames: [new Uint8ClampedArray(bytes)],
    };
    const output = await run(image, 0);
    expect(pixels(output)).toEqual([bytes]);
    expect(pixels(image)).toEqual([bytes]);
    expect(output.frames[0].buffer).not.toBe(image.frames[0].buffer);
  });

  it.each([50, 100])(
    'preserves source alpha at %i percent reduction',
    async (reduction) => {
      const bytes = [
        0, 0, 0, 0, 8, 8, 8, 63, 240, 240, 240, 128, 255, 255, 255, 255,
      ];
      const image: Image = {
        dimensions: [4, 1],
        frames: [new Uint8ClampedArray(bytes)],
      };
      expect(pixels(await run(image, reduction))).toEqual([
        reduction === 50
          ? [0, 0, 0, 0, 8, 8, 8, 63, 8, 8, 8, 128, 8, 8, 8, 255]
          : [0, 0, 0, 0, 0, 0, 0, 63, 0, 0, 0, 128, 0, 0, 0, 255],
      ]);
      expect(pixels(image)).toEqual([bytes]);
    },
  );

  it('includes the first distinct RGB color when voting for nearest palette colors', async () => {
    // Green=0 votes for 1, giving 1 two votes instead of a three-way tie.
    const image: Image = {
      dimensions: [4, 1],
      frames: [
        new Uint8ClampedArray([
          0, 0, 0, 255, 0, 1, 0, 255, 0, 2, 0, 255, 0, 10, 0, 255,
        ]),
      ],
    };
    expect(pixels(await run(image, 100))).toEqual([
      [0, 1, 0, 255, 0, 1, 0, 255, 0, 1, 0, 255, 0, 1, 0, 255],
    ]);
  });

  it('chooses one color at full reduction with stable ties', async () => {
    const image: Image = {
      dimensions: [4, 1],
      frames: [new Uint8ClampedArray([...black, ...dark, ...light, ...white])],
    };
    expect(pixels(await run(image, 100))).toEqual([
      [...black, ...black, ...black, ...black],
    ]);
  });

  it('handles a single unique RGB color with multiple alphas', async () => {
    const image: Image = {
      dimensions: [2, 1],
      frames: [new Uint8ClampedArray([8, 8, 8, 0, 8, 8, 8, 128])],
    };
    expect(pixels(await run(image, 100))).toEqual([[8, 8, 8, 0, 8, 8, 8, 128]]);
  });

  it('uses the first palette entry for an equal-distance pixel', async () => {
    // Four endpoint colors survive; green=20 is equidistant from 10 and 30.
    const image: Image = {
      dimensions: [5, 1],
      frames: [
        new Uint8ClampedArray([
          0, 10, 0, 255, 0, 30, 0, 255, 0, 9, 0, 255, 0, 31, 0, 255, 0, 20, 0,
          255,
        ]),
      ],
    };
    expect(pixels(await run(image, 20))).toEqual([
      [
        0, 10, 0, 255, 0, 30, 0, 255, 0, 9, 0, 255, 0, 31, 0, 255, 0, 10, 0,
        255,
      ],
    ]);
  });
});
