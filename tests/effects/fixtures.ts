import seedrandom from 'seedrandom';
import type {
  BezierTuple,
  Color,
  Dimensions,
  EffectFn,
  Image,
} from '~/domain/types';
import { reduceColorPalette } from '~/effects/reduce-color-palette';
import { hueShiftPulse } from '~/effects/hue-shift-pulse';
import { ripple } from '~/effects/ripple';
import { hueWave } from '~/effects/hue-wave';
import { grid } from '~/effects/grid';
import { roxbury } from '~/effects/roxbury';
import { trails } from '~/effects/trails';
import { partyShadow } from '~/effects/party-shadow';
import { pinwheelColors } from '~/effects/pinwheel-colors';
import { radianceColors } from '~/effects/radiance-colors';
import { pinwheelRainbow } from '~/effects/pinwheel-rainbow';
import { radianceRainbow } from '~/effects/radiance-rainbow';
import { pinwheelRainbowBackground } from '~/effects/pinwheel-rainbow-background';
import { radianceRainbowBackground } from '~/effects/radiance-rainbow-background';

export const easing: BezierTuple = [
  [0.25, 0.75],
  [0.75, 0.25],
];
export const colors: Array<Color> = [
  [255, 0, 0, 255],
  [0, 255, 0, 128],
  [0, 0, 255, 255],
];

/** Finite RGB palette; spatial/frame variation and alpha boundaries are intentional. */
export function makeEffectImage(
  dimensions: Dimensions,
  frameCount: number,
  colorCount = 32,
): Image {
  return {
    dimensions,
    frames: Array.from({ length: frameCount }, (_, frameIndex) => {
      const data = new Uint8ClampedArray(dimensions[0] * dimensions[1] * 4);
      for (let i = 0; i < data.length; i += 4) {
        const pixel = i / 4;
        const color =
          (pixel * 13 +
            Math.floor(pixel / dimensions[0]) * 7 +
            frameIndex * 11) %
          colorCount;
        data[i] = color;
        data[i + 1] = (color * 37) % 256;
        data[i + 2] = (color * 71) % 256;
        data[i + 3] = [0, 63, 64, 127, 128, 255][(pixel + frameIndex) % 6];
      }
      return data;
    }),
  };
}

export function effectCase<T>(name: string, fn: EffectFn<T>, parameters: T) {
  // None of these effects consume randomness. Keep PRNG setup outside timed calls.
  const random = seedrandom('effects');
  return { name, run: (image: Image) => fn({ image, parameters, random }) };
}

/** One representative nontrivial configuration per reviewed effect. */
export const effectCases = [
  effectCase('Reduce Color Palette', reduceColorPalette.fn, [70]),
  effectCase('Hue Shift Pulse', hueShiftPulse.fn, [210, easing]),
  effectCase('Ripple', ripple.fn, [3, 2]),
  effectCase('Hue Wave', hueWave.fn, [35, 3]),
  effectCase('Grid', grid.fn, [8, 37]),
  effectCase('Roxbury', roxbury.fn, []),
  effectCase('Trails', trails.fn, [3, 50, 100]),
  effectCase('Party Shadow', partyShadow.fn, [4, 2, 1, -1]),
  effectCase('Pinwheel Colors', pinwheelColors.fn, [2, colors, 1, -1, 60]),
  effectCase('Radiance Colors', radianceColors.fn, [2, colors, 0, 0, 60]),
  effectCase('Pinwheel Rainbow', pinwheelRainbow.fn, [2, 75, 1, -1]),
  effectCase('Radiance Rainbow', radianceRainbow.fn, [2, 75, 1, -1]),
  effectCase(
    'Pinwheel Rainbow Background',
    pinwheelRainbowBackground.fn,
    [2, 1, -1, 60],
  ),
  effectCase(
    'Radiance Rainbow Background',
    radianceRainbowBackground.fn,
    [2, 1, -1, 60],
  ),
];

/** Capture branches most likely to be disturbed by hoisting and canvas reuse. */
export const variantCases = [
  effectCase('Ripple / zero amplitude', ripple.fn, [0, 1]),
  effectCase('Hue Wave / zero amplitude', hueWave.fn, [0, 1]),
  effectCase('Grid / horizontal and vertical', grid.fn, [2, 90]),
  effectCase(
    'Party Shadow / one unblurred layer',
    partyShadow.fn,
    [1, 0, -1, 1],
  ),
  effectCase('Trails / more trails than frames', trails.fn, [10, 75, 0]),
  effectCase('Pinwheel Colors / opaque foreground', pinwheelColors.fn, [
    1,
    colors,
    0,
    0,
    100,
  ]),
  effectCase('Radiance Colors / hidden foreground', radianceColors.fn, [
    1,
    colors,
    0,
    0,
    0,
  ]),
  effectCase(
    'Pinwheel Rainbow Background / hidden foreground',
    pinwheelRainbowBackground.fn,
    [1, 0, 0, 0],
  ),
  effectCase(
    'Radiance Rainbow Background / opaque foreground',
    radianceRainbowBackground.fn,
    [1, 0, 0, 100],
  ),
];

export function pixels(image: Image) {
  return image.frames.map((frame) => Array.from(frame));
}

/** Exact RGBA bytes in a compact, portable snapshot (no hashes or tolerances). */
export function frameHex(image: Image) {
  return image.frames.map((frame) =>
    Array.from(frame, (byte) => byte.toString(16).padStart(2, '0')).join(''),
  );
}
