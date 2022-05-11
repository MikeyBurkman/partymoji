import { buildTransform, Coord } from '../domain/types';
import { mapImageWithPrecompute } from '../domain/utils';
import { radioParam } from '../params/radioParam';

export const rotate = buildTransform({
  name: 'Rotate',
  description: 'Make the image rotate about the center point',
  params: [
    radioParam<'clockwise' | 'counter'>({
      name: 'Direction',
      defaultValue: 'clockwise',
      options: [
        { name: 'Clockwise', value: 'clockwise' },
        { name: 'Counter-Clockwise', value: 'counter' },
      ],
    }),
  ] as const,
  fn: mapImageWithPrecompute(
    ({ animationProgress, parameters: [direction] }) => {
      const amount = animationProgress * (direction === 'counter' ? 1 : -1);
      return {
        cos: Math.cos(2 * Math.PI * amount),
        sin: Math.sin(2 * Math.PI * amount),
      };
    },
    ({
      dimensions: [width, height],
      coord: [x, y],
      computed: { cos, sin },
      getSrcPixel,
    }) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const xRelCenter = x - centerX;
      const yRelCenter = y - centerY;

      const newCoord: Coord = [
        Math.round(centerX + xRelCenter * cos - yRelCenter * sin),
        Math.round(centerY + yRelCenter * cos + xRelCenter * sin),
      ];

      return getSrcPixel(newCoord);
    }
  ),
});
