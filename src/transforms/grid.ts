import { buildTransform } from '../domain/types';
import { mapImage, adjustSaturation } from '../domain/utils';
import { sliderParam } from '../params/sliderParam';

const MAX_GRID_SIZE = 64;

export const grid = buildTransform({
  name: 'Grid',
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
  fn: mapImage(
    ({ coord, getSrcPixel, parameters: [gridSize, gridAngle], dimensions }) => {
      const p = getSrcPixel(coord);
      const [x, y] = coord;

      let isOnGrid = false;
      if (gridAngle % 90 === 0) {
        // Vertical/Horizonal lines
        isOnGrid = x % gridSize === 0 || y % gridSize === 0;
      } else {
        // Threshold should be between 0.13 and 0.03, smaller for larger grid sizes.
        // Larger threshold = thicker lines.
        const threshold =
          ((MAX_GRID_SIZE - gridSize) / MAX_GRID_SIZE) * 0.1 + 0.03;

        const onGrid = (angleDegrees: number) => {
          const n = (1 / gridSize) * (y - Math.tan(toRad(angleDegrees)) * x);
          return Math.abs(Math.round(n) - n) < threshold;
        };

        isOnGrid = onGrid(gridAngle) || onGrid(gridAngle + 90);
      }

      return isOnGrid ? p : adjustSaturation(p, -100);
    }
  ),
});

const toRad = (degrees: number) => (degrees * Math.PI) / 180;
