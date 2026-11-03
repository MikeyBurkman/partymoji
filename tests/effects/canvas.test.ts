import { expect, it } from 'vitest';
import type { Color, Image } from '~/domain/types';
import { trails } from '~/effects/trails';
import { partyShadow } from '~/effects/party-shadow';
import { pinwheelRainbowBackground } from '~/effects/pinwheel-rainbow-background';
import { radianceColors } from '~/effects/radiance-colors';
import { effectCase, pixels } from './fixtures';

// Chromium's filter opacity quantizes 50% to alpha 127 before compositing.
it('Trails currently clamps early history to the first frame instead of wrapping', async () => {
  const source: Image = {
    dimensions: [1, 1],
    frames: [
      new Uint8ClampedArray([255, 0, 0, 255]),
      new Uint8ClampedArray(4),
      new Uint8ClampedArray(4),
    ],
  };
  const result = await effectCase('trails', trails.fn, [3, 50, 0]).run(source);
  expect(pixels(result)).toEqual([
    [255, 0, 0, 255],
    [255, 0, 0, 169],
    [255, 0, 0, 127],
  ]);
});

it('Party Shadow draws an offset shadow and does not carry it into a clear frame', async () => {
  const source: Image = {
    dimensions: [3, 1],
    frames: [
      new Uint8ClampedArray([0, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0]),
      new Uint8ClampedArray(12),
    ],
  };
  const result = await effectCase('shadow', partyShadow.fn, [1, 0, 1, 0]).run(
    source,
  );
  expect(pixels(result)).toEqual([
    [0, 0, 255, 255, 255, 0, 0, 255, 0, 0, 0, 0],
    Array<number>(12).fill(0),
  ]);
});

it('an opaque foreground covers a generated background at 100% opacity', async () => {
  const source: Image = {
    dimensions: [1, 1],
    frames: [new Uint8ClampedArray([0, 0, 255, 255])],
  };
  expect(
    pixels(
      await effectCase(
        'background',
        pinwheelRainbowBackground.fn,
        [1, 0, 0, 100],
      ).run(source),
    ),
  ).toEqual([[0, 0, 255, 255]]);
});

it('a hidden foreground reveals the generated background', async () => {
  const source: Image = {
    dimensions: [2, 2],
    frames: [new Uint8ClampedArray(Array<number>(16).fill(255))],
  };
  // At (0,0), distance=maxDist, selecting palette index zero.
  const result = await effectCase('radiance', radianceColors.fn, [
    1,
    [[255, 0, 0, 255]],
    0,
    0,
    0,
  ]).run(source);
  expect(pixels(result)).toEqual([
    Array.from({ length: 4 }, () => [255, 0, 0, 255]).flat(),
  ]);
});

it('Radiance Colors renders the offset fixture with repeated palette entries', async () => {
  const source: Image = {
    dimensions: [7, 5],
    frames: [new Uint8ClampedArray(7 * 5 * 4)],
  };
  const result = await effectCase('offset radiance', radianceColors.fn, [
    2,
    [[255, 0, 0, 255]],
    1,
    -1,
    60,
  ]).run(source);
  expect(pixels(result)).toEqual([
    Array.from({ length: 35 }, () => [255, 0, 0, 255]).flat(),
  ]);
});

it.each([
  {
    offsetX: 1,
    offsetY: 1,
    expectedIndices: [
      [1, 0, 1, 0],
      [2, 1, 2, 1],
      [0, 2, 0, 2],
    ],
  },
  {
    offsetX: -1,
    offsetY: -1,
    expectedIndices: [
      [1, 1, 0, 0],
      [2, 2, 1, 1],
      [0, 0, 2, 2],
    ],
  },
  {
    offsetX: 3,
    offsetY: 3,
    expectedIndices: [
      [2, 1, 1, 0],
      [0, 2, 2, 1],
      [1, 0, 0, 2],
    ],
  },
])(
  'Radiance Colors wraps offset ($offsetX, $offsetY) across animation phases',
  async ({ offsetX, offsetY, expectedIndices }) => {
    const palette: Array<Color> = [
      [255, 0, 0, 255],
      [0, 255, 0, 255],
      [0, 0, 255, 255],
    ];
    const source: Image = {
      dimensions: [2, 2],
      frames: Array.from({ length: 3 }, () => new Uint8ClampedArray(16)),
    };
    // Row-major ring indices are hand-derived from distances to the offset
    // center. The large offset crosses more than one complete palette cycle.
    const result = await effectCase('offset radiance', radianceColors.fn, [
      1,
      palette,
      offsetX,
      offsetY,
      60,
    ]).run(source);
    expect(pixels(result)).toEqual(
      expectedIndices.map((indices) =>
        indices.flatMap((index) => palette[index]),
      ),
    );
  },
);

it('Trails spreads previous-frame alpha when its scaled blur radius is nonzero', async () => {
  const frame = new Uint8ClampedArray(128 * 128 * 4);
  frame.set([255, 0, 0, 255], (64 * 128 + 64) * 4);
  const source: Image = {
    dimensions: [128, 128],
    frames: [frame, new Uint8ClampedArray(frame.length)],
  };
  const blurred = await effectCase(
    'blurred trails',
    trails.fn,
    [3, 50, 100],
  ).run(source);
  const sharp = await effectCase('sharp trails', trails.fn, [3, 50, 0]).run(
    source,
  );
  const neighboringAlpha = (64 * 128 + 65) * 4 + 3;
  expect(blurred.frames[1][neighboringAlpha]).toBeGreaterThan(0);
  expect(sharp.frames[1][neighboringAlpha]).toBe(0);
  expect(blurred.frames[1][(64 * 128 + 64) * 4 + 3]).toBeLessThan(
    sharp.frames[1][(64 * 128 + 64) * 4 + 3],
  );
});
