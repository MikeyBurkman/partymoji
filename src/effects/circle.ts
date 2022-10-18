import { buildEffect } from '../domain/types';
import { mapImageWithPrecompute } from '../domain/utils/image';
import { intParam } from '../params/intParam';

export const circle = buildEffect({
  name: 'Circle',
  description: 'Make the image move in a circular pattern',
  params: [
    intParam({
      name: 'Radius',
      description: 'Positive number',
      defaultValue: (image) =>
        image ? Math.floor(image.dimensions[0] / 10) : 10,
      min: 0,
    }),
  ] as const,
  fn: mapImageWithPrecompute(
    ({ animationProgress, parameters: [radius] }) => ({
      xOffset: Math.round(radius * Math.sin(-2 * Math.PI * animationProgress)),
      yOffset: Math.round(radius * Math.cos(-2 * Math.PI * animationProgress)),
    }),
    ({ computed: { xOffset, yOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x + xOffset, y + yOffset])
  ),
});
