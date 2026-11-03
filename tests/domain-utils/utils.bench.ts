import { afterAll, beforeAll, bench, describe, expect } from 'vitest';
import seedrandom from 'seedrandom';
import type { Color, Dimensions } from '~/domain/types';
import * as image from '~/domain/utils/image';
import { applyCanvasFromFrame, applyFilter } from '~/domain/utils/canvas';
import { bezierCurve, blobOrFileToDataUrl } from '~/domain/utils/misc';
import { getImageFromUrl, readImage } from '~/domain/utils/imageImport';
import { makeGif, makeImage } from './fixtures';

// No timing assertions: use the saved JSON to compare the same case across revisions.
let observedResult: unknown;
afterAll(() => {
  expect(observedResult).toBeDefined();
});

const options = {
  time: 500,
  warmupTime: 200,
  iterations: 30,
  warmupIterations: 5,
};

for (const dimensions of [
  [32, 32],
  [128, 128],
  [256, 256],
] satisfies Array<Dimensions>) {
  const source = makeImage(dimensions, 12);
  const lateTransparent = image.duplicateImage(source);
  const lastFrame = lateTransparent.frames[lateTransparent.frames.length - 1];
  lastFrame[lastFrame.length - 1] = 0;
  const latePartial = image.duplicateImage(source);
  const partialFrame = latePartial.frames[latePartial.frames.length - 1];
  partialFrame[partialFrame.length - 1] = 100;
  const earlyTransparent = image.duplicateImage(source);
  earlyTransparent.frames[0][3] = 0;

  describe(`${dimensions.join('x')} / 12 frames`, () => {
    bench(
      'hasTransparentPixels / opaque full scan',
      () => {
        observedResult = image.hasTransparentPixels(source);
      },
      options,
    );
    bench(
      'hasTransparentPixels / first pixel',
      () => {
        observedResult = image.hasTransparentPixels(earlyTransparent);
      },
      options,
    );
    bench(
      'hasTransparentPixels / last pixel',
      () => {
        observedResult = image.hasTransparentPixels(lateTransparent);
      },
      options,
    );
    bench(
      'isPartiallyTransparent / opaque full scan',
      () => {
        observedResult = image.isPartiallyTransparent(source);
      },
      options,
    );
    bench(
      'isPartiallyTransparent / last pixel',
      () => {
        observedResult = image.isPartiallyTransparent(latePartial);
      },
      options,
    );

    const identity = image.mapImage<null>(({ coord, getSrcPixel }) =>
      getSrcPixel(coord),
    );
    const precomputed = image.mapImageWithPrecompute<null, number>(
      ({ animationProgress }) => animationProgress * 100,
      ({ coord, getSrcPixel, computed }) => {
        const [r, g, b, a] = getSrcPixel(coord);
        return [r + computed, g, b, a];
      },
    );
    // These effects do not consume randomness, so reusing the seeded generator is safe.
    const args = {
      image: source,
      random: seedrandom('benchmark'),
      parameters: null,
    };
    bench(
      'mapImage / identity',
      async () => {
        observedResult = await identity(args);
      },
      options,
    );
    bench(
      'mapImageWithPrecompute / brightness offset',
      async () => {
        observedResult = await precomputed(args);
      },
      options,
    );
    bench(
      'mapCoords / fractional and out-of-range channels / one frame',
      () => {
        observedResult = image.mapCoords(
          dimensions,
          ([x, y]): Color => [x - 30, y + 250, 2.5, 255],
        );
      },
      options,
    );

    bench(
      'resizeImage / half size / all frames',
      () => {
        observedResult = image.resizeImage({
          image: source,
          newWidth: dimensions[0] / 2,
          newHeight: dimensions[1] / 2,
          keepScale: true,
        });
      },
      options,
    );
    bench(
      'applyCanvasFromFrame / invert / one frame',
      () => {
        observedResult = applyCanvasFromFrame({
          dimensions,
          frame: source.frames[0],
          preEffect: (data) => {
            applyFilter(data, { invert: 100 });
          },
        });
      },
      options,
    );
  });
}

describe('Bézier / 16384 evaluations', () => {
  const points = [
    [0.25, 0.75],
    [0.75, 0.25],
  ] as const;
  bench(
    'construct repeated same-value curves and evaluate',
    () => {
      let result = 0;
      for (let i = 0; i < 16384; i++) {
        result += bezierCurve(
          [[...points[0]], [...points[1]]],
          true,
        )((i % 100) / 100);
      }
      observedResult = result;
    },
    options,
  );
  const evaluate = bezierCurve([[...points[0]], [...points[1]]], true);
  bench(
    'evaluate an already constructed curve',
    () => {
      let result = 0;
      for (let i = 0; i < 16384; i++) result += evaluate((i % 100) / 100);
      observedResult = result;
    },
    options,
  );
});

describe('image import', () => {
  const file = makeGif(
    [64, 64],
    Array.from({ length: 12 }, (_, frame) => ({
      width: frame % 2 ? 32 : 64,
      height: 64,
      left: frame % 2 ? 16 : 0,
      pixels: Array<number>(frame % 2 ? 32 * 64 : 64 * 64).fill(
        (frame % 3) + 1,
      ),
      disposal: frame % 3 === 0 ? 2 : 1,
    })),
  );
  bench(
    'readImage / 64x64 GIF / 12 varying-size patches',
    async () => {
      const result = await readImage(file);
      observedResult = result.image.frames.length;
    },
    options,
  );

  const bytes = new Uint8Array(256 * 1024);
  for (let i = 0; i < bytes.length; i++) bytes[i] = i % 256;
  const blob = new Blob([bytes], { type: 'image/png' });
  // Data URL fetch is local and deterministic; no external server or network timing.
  let url: string;
  beforeAll(async () => {
    url = await blobOrFileToDataUrl(blob);
  });
  bench(
    'getImageFromUrl / 256 KiB local binary response',
    async () => {
      observedResult = await getImageFromUrl(url);
    },
    options,
  );

  const equalSizeFile = makeGif(
    [64, 64],
    Array.from({ length: 12 }, (_, frame) => ({
      width: 64,
      height: 64,
      pixels: Array<number>(64 * 64).fill((frame % 3) + 1),
      disposal: frame % 3 === 0 ? 2 : 1,
    })),
  );
  bench(
    'readImage / 64x64 GIF / 12 equal-size patches',
    async () => {
      const result = await readImage(equalSizeFile);
      observedResult = result.image.frames.length;
    },
    options,
  );
});
