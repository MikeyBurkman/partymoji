import { buildTransform, Coord } from '../domain/types';
import { mapImage } from '../domain/utils';
import { radioParam } from '../params/radioParam';

export const rotate = buildTransform({
  name: 'Rotate',
  description: 'Make the image rotate about the center point',
  params: [
    radioParam({
      name: 'Direction',
      defaultValue: -1,
      options: [
        { name: 'Clockwise', value: -1 },
        { name: 'Counter-Clockwise', value: 1 },
      ],
    }),
  ] as const,
  fn: mapImage(
    ({
      dimensions: [width, height],
      coord: [x, y],
      frameCount,
      frameIndex,
      getSrcPixel,
      parameters: [sign],
    }) => {
      const centerX = width / 2;
      const centerY = height / 2;
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
