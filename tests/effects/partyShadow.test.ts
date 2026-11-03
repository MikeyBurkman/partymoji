import { expect, it } from 'vitest';
import type { Image } from '~/domain/types';
import { canvasUtil } from '~/domain/utils';
import { partyShadow } from '~/effects/party-shadow';
import { effectCase, makeEffectImage, pixels } from './fixtures';

it('wraps negative hues so every offset shadow layer is rendered', async () => {
  const source: Image = {
    dimensions: [5, 1],
    frames: [
      new Uint8ClampedArray([
        255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    ],
  };

  const result = await effectCase('shadow', partyShadow.fn, [4, 0, 1, 0]).run(
    source,
  );

  // Hues 0, -90, -180, -270 must render as 0, 270, 180, 90.
  expect(pixels(result)).toEqual([
    [
      255, 255, 255, 255, 255, 0, 0, 255, 127, 0, 255, 255, 0, 255, 255, 255,
      128, 255, 0, 255,
    ],
  ]);
});

it('matches valid positive-hue shadows through multiple animation phases', async () => {
  const source = makeEffectImage([7, 5], 4);
  const colorsByPhase = [
    ['#FF0000', '#7F00FF', '#00FFFF', '#80FF00'],
    ['#80FF00', '#FF0000', '#7F00FF', '#00FFFF'],
    ['#00FFFF', '#80FF00', '#FF0000', '#7F00FF'],
    ['#7F00FF', '#00FFFF', '#80FF00', '#FF0000'],
  ];
  const expected = source.frames.map((frame, phase) => {
    let result = frame;
    for (const color of colorsByPhase[phase]) {
      // Fresh canvases provide an independent reference for reuse and readback
      // rounding, with hand-specified colors for hues 0, 90, 180 and 270.
      result = canvasUtil.applyCanvasFromFrame({
        dimensions: source.dimensions,
        frame: result,
        preEffect: ({ ctx }) => {
          ctx.filter = `drop-shadow(1px -1px 2px ${color})`;
        },
      });
    }
    return Array.from(result);
  });

  const result = await effectCase('shadow', partyShadow.fn, [4, 2, 1, -1]).run(
    source,
  );
  expect(pixels(result)).toEqual(expected);
});
