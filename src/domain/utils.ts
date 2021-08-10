import seedrandom from 'seedrandom';
import { AssertionError } from 'assert';

import {
  Color,
  Coord,
  Dimensions,
  ImageData,
  Image,
  Random,
  TransformFn,
  TransformFnOpts,
} from './types';

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

export const isTransparent = (pixel: Color) => pixel[3] < 64;

export const randomColor = (random: seedrandom.prng): Color => [
  Math.floor(random.int32() * 256),
  Math.floor(random.int32() * 256),
  Math.floor(random.int32() * 256),
  255,
];

export const getAveragePixelValue = ([r, g, b]: Color) =>
  Math.round((r + g + b) / 3);

export const clampColor = ([r, g, b, a]: Color): Color => {
  const clamp = (n: number) => Math.max(Math.min(n, 255), 0);

  return [clamp(r), clamp(g), clamp(b), clamp(a)];
};

export const getPixelFromSource = (
  dimensions: Dimensions,
  image: ImageData,
  coord: Coord
): Color => {
  const [width, height] = dimensions;
  const [x, y] = coord;
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return [0, 0, 0, 0]; // Default to transparent if an invalid coordinate
  }

  const idx = x * 4 + y * 4 * width;
  return [image[idx], image[idx + 1], image[idx + 2], image[idx + 3]];
};

/**
 * Asserts that a given value is truthy. Uses TypeScript 3.7 assertion types.
 *
 * @example
 * ```ts
 * const foo: string|undefined = getSomeData();
 * asert(foo, 'foo must be defined');
 * console.log(foo.length); // OK
 * ```
 */
export function assert(
  condition: unknown,
  message = 'Unexpected falsy value'
): asserts condition {
  if (!condition) {
    throw new AssertionError({ message, actual: condition });
  }
}

/********** Mapping Utils ***********/
// Maps all frames from the original image into new frames.
// Assumes all mapped frames are the same dimension as the original image.
export const mapFrames = (
  image: Image,
  cb: (
    imageData: ImageData,
    frameIndex: number,
    frameCount: number
  ) => ImageData
): Image => {
  const frames = image.frames.map((frame, idx) => ({
    data: cb(frame.data, idx, image.frames.length),
  }));
  return {
    dimensions: image.dimensions,
    frames,
  };
};

/**
 * Maps the coordinates in a given shape into an image
 */
export const mapCoords = (
  dimensions: Dimensions,
  cb: (coord: Coord) => Color
): ImageData => {
  const [width, height] = dimensions;
  const transformedImageData: ImageData = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      transformedImageData.push(...clampColor(cb([x, y])));
    }
  }
  return transformedImageData;
};

/**
 * Combines mapFrames and mapCoords into one function.
 * Used for transforming each pixel in an image into another pixel.
 */
export const mapImage = <T>(
  cb: (args: {
    image: Image;
    dimensions: Dimensions;
    random: Random;
    parameters: T;
    coord: Coord;
    frameCount: number;
    frameIndex: number;
    getSrcPixel: (coord: Coord) => Color;
  }) => Color
): TransformFn<T> => {
  return ({ image, random, parameters }: TransformFnOpts<T>) =>
    mapFrames(image, (imageData, frameIndex, frameCount) =>
      mapCoords(image.dimensions, (coord) =>
        cb({
          image,
          dimensions: image.dimensions,
          random,
          parameters,
          coord,
          frameCount,
          frameIndex,
          getSrcPixel: (c: Coord) =>
            getPixelFromSource(image.dimensions, imageData, c),
        })
      )
    );
};

/** Create a new array [0, 1, 2, ...N-1] */
export const repeat = (times: number): number[] =>
  [...new Array(times)].map((_, i) => i);
