import * as convert from 'color-convert';
import type { Color } from '~/domain/types';
import { clamp, weightedValue } from './misc';

/**
 * Converts a Pixel into a hex string like '#00FF00'
 */
export const toHexColor = ([r, g, b]: Color) => {
  const toHexValue = (c: number) => {
    const s = c.toString(16).toUpperCase();
    return s.length === 2 ? s : '0' + s;
  };

  return `#${toHexValue(r)}${toHexValue(g)}${toHexValue(b)}`;
};

export const fromHexColor = (hex: string): Color => [
  parseInt(hex.toUpperCase().substr(1, 2), 16),
  parseInt(hex.toUpperCase().substr(3, 2), 16),
  parseInt(hex.toUpperCase().substr(5, 2), 16),
  255,
];

export const isHexColor = (s: string) => /^#[0-9A-F]{6}$/.test(s);

/**
 * Our effect functions allow for an alpha channel, but gifs do not.
 * All pixels are either fully solid or fully transparent.
 * This function returns true if the color's alpha is below a certain threshold.
 */
export const isTransparent = (pixel: Color) => pixel[3] < 64;

/**
 * Returns true if the pixel is partially transparent enough that
 *  it would cause issues rendering.
 */
export const isPartiallyTransparent = (pixel: Color) =>
  !isTransparent(pixel) && pixel[3] < 128;

export const randomColor = (random: seedrandom.prng): Color => [
  Math.floor(random.int32() * 256),
  Math.floor(random.int32() * 256),
  Math.floor(random.int32() * 256),
  255,
];

export const getAveragePixelValue = ([r, g, b]: Color) =>
  Math.round((r + g + b) / 3);

export const clampColor = ([r, g, b, a]: Color): Color => [
  clamp(r, 0, 255),
  clamp(g, 0, 255),
  clamp(b, 0, 255),
  clamp(a, 0, 255),
];

export const TRANSPARENT_COLOR: Color = [0, 0, 0, 0];

/**
 * Shift the hue of the pixel towards a certain color, by a certain amount percentage
 * @param hue [0, 360)
 * @param amount [0, 100]
 */
export const shiftTowardsHue = (
  [r, g, b, a]: Color,
  hue: number,
  amount: number
): Color => {
  const [, s, l] = convert.rgb.hsl([r, g, b]);
  const [newR, newG, newB] = convert.hsl.rgb([
    hue,
    weightedValue(amount, s, 100),
    l,
  ]);
  return [
    weightedValue(amount, r, newR),
    weightedValue(amount, g, newG),
    weightedValue(amount, b, newB),
    a,
  ];
};

/**
 * Adds the given amount to the hue of the color.
 * Amount should be between 0 and 360
 */
export const shiftHue = ([r, g, b, a]: Color, amount: number): Color => {
  const [h, s, l] = convert.rgb.hsl([r, g, b]);
  const [newR, newG, newB] = convert.hsl.rgb([(h + amount) % 360, s, l]);
  return [newR, newG, newB, a];
};

// Amount: 0 - 100
export const setBrightness = ([r, g, b, a]: Color, amount: number): Color => {
  const [h, s] = convert.rgb.hsl([r, g, b]);
  const [newR, newG, newB] = convert.hsl.rgb([h, s, amount]);
  return [newR, newG, newB, a];
};

/**
 * Turn a hue value (0 - 360) into a Color
 */
export const colorFromHue = (hue: number): Color => [
  ...convert.hsl.rgb([hue, 100, 50]),
  255,
];

export const adjustSaturation = (color: Color, amount: number): Color => {
  const [r, g, b, a] = color;
  const [h, s, l] = convert.rgb.hsl(r, g, b);
  const newSat = weightedValue(Math.abs(amount), s, amount >= 0 ? 100 : 0);
  const [newR, newG, newB] = convert.hsl.rgb([h, newSat, l]);
  return [newR, newG, newB, a];
};

// Amount: -100 to 100
export const adjustBrightness = (color: Color, amount: number): Color => {
  const d = (amount / 100) * 128;
  const [r, g, b, a] = color;
  return clampColor([r + d, g + d, b + d, a]);
};

// Amount: -100 to 100
export const adjustContrast = (color: Color, amount: number): Color => {
  const d = amount / 100 + 1;
  const [r, g, b, a] = color;
  return clampColor([
    d * (r - 128) + 128,
    d * (g - 128) + 128,
    d * (b - 128) + 128,
    a,
  ]);
};

/**
 * Returns number between 0 and 1, where 1 is the largest difference and 0 is no difference
 */
export const colorDiff = (c1: Color, c2: Color): number => {
  // Red-mean color diff algorithm
  // https://en.wikipedia.org/wiki/Color_difference
  const deltaRed = c1[0] - c2[0];
  const deltaBlue = c1[1] - c2[1];
  const deltaGreen = c1[2] - c2[2];
  const rSomething = (c1[0] + c2[0]) / 2;

  const rComponent = (2 + rSomething / 256) * deltaRed * deltaRed;
  const bComponent = (2 + (255 - rSomething) / 256) * deltaBlue * deltaBlue;
  const gComponent = 4 * deltaGreen * deltaGreen;
  // 765 = ~ difference between black and white pixels
  return Math.sqrt(rComponent + bComponent + gComponent) / 765;
};

/**
 * Returns a color between c1 and c2.
 * Amount is between 0 and 1.
 * An amount of 0 will return c1, and amount of 1 will return c2.
 */
export const linearInterpolation = ({
  c1: [r1, g1, b1],
  c2: [r2, g2, b2],
  amount,
}: {
  c1: Color;
  c2: Color;
  amount: number;
}): Color => {
  return [
    Math.floor((1 - amount) * r1 + amount * r2),
    Math.floor((1 - amount) * g1 + amount * g2),
    Math.floor((1 - amount) * b1 + amount * b2),
    255,
  ];
};
