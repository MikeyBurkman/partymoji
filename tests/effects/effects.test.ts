import { describe, expect, it } from 'vitest';
import {
  effectCases,
  variantCases,
  frameHex,
  makeEffectImage,
  pixels,
} from './fixtures';

// These characterize the current implementations before optimization. Snapshot changes
// need pixel-level review, especially canvas alpha rounding and geometry boundaries.
for (const { name, run } of [...effectCases, ...variantCases]) {
  describe(name, () => {
    it('preserves captured pixels through eight animation phases on a rectangular image', async () => {
      const source = makeEffectImage([7, 5], 8);
      const before = pixels(source);
      const result = await run(source);
      expect(result.dimensions).toEqual([7, 5]);
      expect(result.frames).toHaveLength(8);
      expect(frameHex(result)).toMatchSnapshot();
      expect(pixels(source)).toEqual(before);
      expect(new Set(result.frames.map((frame) => frame.buffer)).size).toBe(8);
      for (const frame of result.frames) {
        expect(frame).toHaveLength(7 * 5 * 4);
        for (const input of source.frames)
          expect(frame.buffer).not.toBe(input.buffer);
      }
      const savedResult = pixels(result);
      // Exercise reuse across invocations with different dimensions and frame counts.
      await run(makeEffectImage([3, 2], 1));
      expect(pixels(result)).toEqual(savedResult);
      expect(pixels(await run(source))).toEqual(savedResult);
      result.frames[0][0] ^= 255;
      expect(result.frames[1][0]).toBe(savedResult[1][0]);
      expect(pixels(source)).toEqual(before);
    });

    it('handles a single frame at progress zero', async () => {
      const result = await run(makeEffectImage([3, 2], 1));
      expect(result.dimensions).toEqual([3, 2]);
      expect(frameHex(result)).toMatchSnapshot();
    });

    it('returns no frames for an empty animation', async () => {
      expect(await run({ dimensions: [7, 5], frames: [] })).toEqual({
        dimensions: [7, 5],
        frames: [],
      });
    });
  });
}
