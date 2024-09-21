import { imageUtil } from '~/domain/utils';
import { intParam } from '~/params';
import { buildEffect } from './utils';

export const circle = buildEffect({
  name: 'Circle',
  group: 'Transform',
  description: 'Make the image move in a circular pattern',
  requiresAnimation: true,
  params: [
    intParam({
      name: 'Radius',
      description: 'Positive number',
      defaultValue: (image) =>
        image ? Math.floor(image.dimensions[0] / 10) : 10,
      min: 0,
    }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({ animationProgress, parameters: [radius] }) => ({
      xOffset: Math.round(radius * Math.sin(-2 * Math.PI * animationProgress)),
      yOffset: Math.round(radius * Math.cos(-2 * Math.PI * animationProgress)),
    }),
    ({ computed: { xOffset, yOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x + xOffset, y + yOffset])
  ),
});
