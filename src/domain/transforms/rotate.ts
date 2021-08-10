import { mapImage } from '../utils';
import { buildTransform, Coord } from '../types';
import { dropdownParam } from './params/dropdownParam';

export const rotate = buildTransform({
  name: 'Rotate',
  params: [
    dropdownParam({
      name: 'Direction',
      defaultValue: -1,
      options: [
        { name: 'Clockwise', value: -1 },
        { name: 'Counter-Clockwise', value: 1 },
      ],
    }),
  ],
  fn: mapImage(
    ({
      dimensions,
      coord,
      frameCount,
      frameIndex,
      getSrcPixel,
      parameters,
    }) => {
      const [sign] = parameters;
      const centerX = dimensions[0] / 2;
      const centerY = dimensions[1] / 2;
      const [x, y] = coord;
      const xRelCenter = x - centerX;
      const yRelCenter = y - centerY;

      const amount = (frameIndex / frameCount) * (sign || 1);
      const cos = Math.cos(2 * Math.PI * amount);
      const sin = Math.sin(2 * Math.PI * amount);

      const newCoord: Coord = [
        Math.round(centerX + xRelCenter * cos - yRelCenter * sin),
        Math.round(centerY + yRelCenter * cos + xRelCenter * sin),
      ];

      return getSrcPixel(newCoord);
    }
  ),
});
