import { buildTransform } from '../domain/types';
import { mapImage, adjustSaturation } from '../domain/utils';
import { sliderParam } from '../params/sliderParam';

// TODO Still needs a lot of work for various angles...

export const gridThing = buildTransform({
  name: 'Grid',
  description: 'Change all transparent pixles to the given color',
  params: [
    sliderParam({
      name: 'Grid Size',
      defaultValue: 8,
      min: 2,
      max: 48,
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

      if (gridAngle % 90 === 0) {
        // Vertical/Horizonal lines
        return x % gridSize === 0 || y % gridSize === 0
          ? p
          : adjustSaturation(p, -100);
      }

      // By doing this, we break the image into lots of little square grids.
      // Each grid will have two perpendicular lines.
      // We'll want to see if the normalized [x,y] lie on either of these lines.
      const normX = x % gridSize;
      const normY = y % gridSize;

      // const nx = Math.floor(gridSize * Math.cos(toRad(gridAngle)));
      // const ny = Math.floor(gridSize * Math.sin(toRad(gridAngle)));

      // y = mx
      const m = Math.tan(toRad(gridAngle));
      // console.log({ x, y, normX, normY, m, });
      if (normY === Math.round(m * normX)) {
        return p;
      }

      // const coordAngle = Math.floor(calculateAngle([0, 0], [normX, normY]));
      // console.log({ x, y, nx, ny, coordAngle });

      // if (coordAngle === gridAngle) {
      //   // If aligned with the grid, keep it the same color
      //   return p;
      // }

      // Make it black and white
      return adjustSaturation(p, -100);
    }
  ),
});

const toRad = (degrees: number) => (degrees * Math.PI) / 180;
