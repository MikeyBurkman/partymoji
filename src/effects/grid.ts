import { colorUtil, imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';
import { precomputeValues } from './precompute-values';

const MAX_GRID_SIZE = 64;

export const grid = buildEffect({
  name: 'Grid',
  group: 'Misc',
  description: 'Removes the color from all pixels not aligned with a grid',
  params: [
    sliderParam({
      name: 'Grid Size',
      description: 'The length of each square in the grid',
      defaultValue: 24,
      min: 2,
      max: MAX_GRID_SIZE,
      step: 2,
    }),
    sliderParam({
      name: 'Grid Angle',
      defaultValue: 45,
      min: 0,
      max: 90,
    }),
  ] as const,
  fn: ({ image, parameters: [gridSize, gridAngle] }) => {
    const [width] = image.dimensions;
    const threshold = ((MAX_GRID_SIZE - gridSize) / MAX_GRID_SIZE) * 0.1 + 0.03;
    const inverseSize = 1 / gridSize;
    const slope = Math.tan(toRad(gridAngle));
    const perpendicularSlope = Math.tan(toRad(gridAngle + 90));
    const mask =
      image.frames.length === 0
        ? []
        : precomputeValues(image.dimensions, ([x, y]) => {
            if (gridAngle % 90 === 0)
              return Number(x % gridSize === 0 || y % gridSize === 0);
            const first = inverseSize * (y - slope * x);
            const second = inverseSize * (y - perpendicularSlope * x);
            return Number(
              Math.abs(Math.round(first) - first) < threshold ||
                Math.abs(Math.round(second) - second) < threshold,
            );
          });
    return imageUtil.mapFrames(image, (frame) =>
      imageUtil.mapCoords(image.dimensions, (coord) => {
        const pixel = imageUtil.getPixelFromSource(
          image.dimensions,
          frame,
          coord,
        );
        return mask[coord[1] * width + coord[0]]
          ? pixel
          : colorUtil.adjustSaturation(pixel, -100);
      }),
    );
  },
});

const toRad = (degrees: number) => (degrees * Math.PI) / 180;
