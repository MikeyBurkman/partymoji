import { afterAll, bench, describe, expect } from 'vitest';
import type { Dimensions, Image } from '~/domain/types';
import { reduceColorPalette } from '~/effects/reduce-color-palette';
import { trails } from '~/effects/trails';
import { partyShadow } from '~/effects/party-shadow';
import { effectCase, effectCases, makeEffectImage } from './fixtures';

const options = {
  time: 500,
  warmupTime: 200,
  iterations: 10,
  warmupIterations: 3,
};
let observedResult: Image | undefined;
afterAll(() => {
  expect(observedResult?.frames.length).toBeGreaterThan(0);
});

// Allocation, computation, compositing and readback stay inside the timed call.
// Fixture construction and PRNG setup stay outside. No timing thresholds.
for (const dimensions of [
  [32, 32],
  [128, 128],
] satisfies Array<Dimensions>) {
  const source = makeEffectImage(dimensions, 12);
  describe(`effects / ${dimensions.join('x')} / 12 frames / 32 RGB colors / mixed alpha`, () => {
    for (const { name, run } of effectCases) {
      bench(
        name,
        async () => {
          observedResult = await run(source);
        },
        options,
      );
    }
  });
}

// Frame scaling exposes repeated whole-animation setup; unique color scaling
// exposes the existing quadratic palette ranking and per-pixel palette search.
for (const frameCount of [1, 12]) {
  for (const colorCount of [32, 256]) {
    const source = makeEffectImage([32, 32], frameCount, colorCount);
    describe(`palette scaling / 32x32 / ${frameCount} frames / ${colorCount} RGB colors`, () => {
      for (const reduction of [0, 70, 100]) {
        const { run } = effectCase('palette', reduceColorPalette.fn, [
          reduction,
        ]);
        bench(
          `${reduction}% reduction`,
          async () => {
            observedResult = await run(source);
          },
          options,
        );
      }
    });
  }
}

const layeredSource = makeEffectImage([128, 128], 12);
describe('canvas layer scaling / 128x128 / 12 frames', () => {
  for (const layers of [1, 10]) {
    for (const blur of [0, 100]) {
      const shadowBlur = blur === 0 ? 0 : 10;
      const trail = effectCase('trails', trails.fn, [layers, 50, blur]);
      const shadow = effectCase('shadows', partyShadow.fn, [
        layers,
        shadowBlur,
        2,
        -2,
      ]);
      bench(
        `Trails / ${layers} trails / blur ${blur}`,
        async () => {
          observedResult = await trail.run(layeredSource);
        },
        options,
      );
      bench(
        `Party Shadow / ${layers} layers / blur ${shadowBlur}`,
        async () => {
          observedResult = await shadow.run(layeredSource);
        },
        options,
      );
    }
  }
});
