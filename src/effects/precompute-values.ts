import type { Coord, Dimensions } from '~/domain/types';

/** Invocation-local geometry. Float64 preserves the pixel formulas' precision. */
export const precomputeValues = (
  [width, height]: Dimensions,
  compute: (coord: Coord) => number,
): Float64Array => {
  const values = new Float64Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) values[y * width + x] = compute([x, y]);
  }
  return values;
};
