import { describe, expect, it } from 'vitest';
import type { Color, Image } from '~/domain/types';
import { ripple } from '~/effects/ripple';
import { grid } from '~/effects/grid';
import { roxbury } from '~/effects/roxbury';
import { hueShiftPulse } from '~/effects/hue-shift-pulse';
import { hueWave } from '~/effects/hue-wave';
import { effectCase, makeEffectImage, pixels } from './fixtures';

const red: Color = [255, 0, 0, 255];

describe('hand-checked pixel behavior', () => {
  it('Ripple shifts whole rows, rounds offsets, and makes out-of-bounds samples transparent', async () => {
    const frame = new Uint8ClampedArray(
      [1, 2, 3, 4, 5, 6].flatMap((value) => [value, 0, 0, 255]),
    );
    const image: Image = {
      dimensions: [3, 2],
      frames: Array.from({ length: 4 }, () => frame.slice()),
    };
    const output = await effectCase('ripple', ripple.fn, [1, 1]).run(image);
    expect(
      output.frames.map((data) =>
        Array.from(data).filter((_, i) => i % 4 === 0),
      ),
    ).toEqual([
      [1, 2, 3, 5, 6, 0],
      [2, 3, 0, 4, 5, 6],
      [1, 2, 3, 0, 4, 5],
      [0, 1, 2, 4, 5, 6],
    ]);
    expect(Array.from(output.frames[0].slice(-4))).toEqual([0, 0, 0, 0]);
  });

  it('zero-amplitude Ripple preserves every byte including hidden RGB and partial alpha', async () => {
    const source = makeEffectImage([5, 3], 3);
    expect(
      pixels(await effectCase('identity', ripple.fn, [0, 20]).run(source)),
    ).toEqual(pixels(source));
  });

  it.each([0, 90])(
    'Grid at %i degrees retains axis-aligned lines and desaturates the interior',
    async (angle) => {
      const source: Image = {
        dimensions: [3, 3],
        frames: [
          new Uint8ClampedArray(Array.from({ length: 9 }, () => red).flat()),
        ],
      };
      const output = await effectCase('grid', grid.fn, [2, angle]).run(source);
      expect(pixels(output)).toEqual([
        [
          ...red,
          ...red,
          ...red,
          ...red,
          128,
          128,
          128,
          255,
          ...red,
          ...red,
          ...red,
          ...red,
        ],
      ]);
    },
  );

  it('Roxbury holds its transform during each freeze phase', async () => {
    const source = makeEffectImage([32, 24], 1);
    source.frames = Array.from({ length: 8 }, () => source.frames[0].slice());
    const output = await effectCase('roxbury', roxbury.fn, []).run(source);
    // At angle zero, the existing transform still samples eight rows down.
    expect(output.frames[0].slice(0, 32 * 4)).toEqual(
      source.frames[0].slice(32 * 8 * 4, 32 * 9 * 4),
    );
    expect(output.frames[1]).toEqual(output.frames[0]);
    expect(output.frames[5]).toEqual(output.frames[4]);
    expect(output.frames[4]).not.toEqual(output.frames[0]);
  });

  it('Hue Shift Pulse uses one mirrored easing amount per frame and preserves alpha', async () => {
    const frame = new Uint8ClampedArray([
      255,
      0,
      0,
      0,
      ...red,
      255,
      0,
      0,
      63,
      255,
      0,
      0,
      128,
    ]);
    const source: Image = {
      dimensions: [4, 1],
      frames: Array.from({ length: 8 }, () => frame.slice()),
    };
    const output = await effectCase('pulse', hueShiftPulse.fn, [
      120,
      [
        [0, 0],
        [1, 1],
      ],
    ]).run(source);
    expect(output.frames[0]).toEqual(frame);
    expect(output.frames[1]).toEqual(output.frames[7]);
    expect(output.frames[2]).toEqual(output.frames[6]);
    expect(Array.from(output.frames[1].slice(0, 4))).toEqual([191, 64, 0, 0]);
    expect(Array.from(output.frames[2].slice(0, 4))).toEqual([128, 128, 0, 0]);
    expect(Array.from(output.frames[3].slice(0, 4))).toEqual([64, 191, 0, 0]);
    expect(Array.from(output.frames[4].slice(0, 4))).toEqual([0, 255, 0, 0]);
    for (const data of output.frames) {
      expect([data[3], data[7], data[11], data[15]]).toEqual([0, 255, 63, 128]);
      expect(Array.from(data.slice(0, 3))).toEqual(
        Array.from(data.slice(4, 7)),
      );
    }
  });

  it('Hue Wave applies the same shift along a row while preserving alpha', async () => {
    const source: Image = {
      dimensions: [2, 2],
      frames: Array.from(
        { length: 4 },
        () =>
          new Uint8ClampedArray([
            ...red,
            255,
            0,
            0,
            63,
            ...red,
            255,
            0,
            0,
            128,
          ]),
      ),
    };
    const output = await effectCase('hue wave', hueWave.fn, [25, 1]).run(
      source,
    );
    expect(pixels(output)[0]).toEqual([
      ...red,
      255,
      0,
      0,
      63,
      128,
      255,
      0,
      255,
      128,
      255,
      0,
      128,
    ]);
    for (const data of output.frames) {
      expect([data[3], data[7], data[11], data[15]]).toEqual([
        255, 63, 255, 128,
      ]);
      expect(Array.from(data.slice(8, 11))).toEqual(
        Array.from(data.slice(12, 15)),
      );
    }
  });
});
