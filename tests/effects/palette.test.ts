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

// Literal expectations preserve stable tie-breaking, whole-animation palette selection,
// the current omission of the first color's vote, and alpha-discarding RGB keys.
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
      [...black, ...black],
      [...light, ...light],
    ]);
  });

  it('retains RGB values at zero reduction but currently makes all pixels opaque', async () => {
    const image: Image = {
      dimensions: [3, 1],
      frames: [
        new Uint8ClampedArray([0, 0, 0, 0, 8, 8, 8, 63, 240, 240, 240, 128]),
      ],
    };
    expect(pixels(await run(image, 0))).toEqual([
      [...black, ...dark, ...light],
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
    expect(pixels(await run(image, 100))).toEqual([[...dark, ...dark]]);
  });

  it('uses the first palette entry for an equal-distance pixel', async () => {
    // Encounter order makes green=0 and green=20 the selected palette.
    // The green=10 pixel is equidistant and must choose the first entry.
    const image: Image = {
      dimensions: [4, 1],
      frames: [
        new Uint8ClampedArray([
          0, 0, 0, 255, 0, 20, 0, 255, 0, 10, 0, 255, 0, 30, 0, 255,
        ]),
      ],
    };
    expect(pixels(await run(image, 50))).toEqual([
      [0, 0, 0, 255, 0, 20, 0, 255, 0, 0, 0, 255, 0, 20, 0, 255],
    ]);
  });
});
