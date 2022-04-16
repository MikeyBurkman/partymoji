import { buildTransform, Coord } from '../domain/types';
import { mapImageWithPrecompute } from '../domain/utils';
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
  fn: mapImageWithPrecompute(
    ({ animationProgress, parameters: [sign] }) => {
      const amount = animationProgress * (sign || 1);
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
