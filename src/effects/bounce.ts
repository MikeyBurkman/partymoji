import { buildEffect } from '../domain/types';
import { mapImageWithPrecompute } from '../domain/utils';
import { intParam } from '../params/intParam';

export const bounce = buildEffect({
  name: 'Bounce',
  description: 'Make the image bounce up and down',
  params: [
    intParam({
      name: 'Bounce Speed',
      description: 'Positive number',
      defaultValue: (image) =>
        image ? Math.floor(image.dimensions[1] / 10) : 10,
      min: 0,
    }),
  ] as const,
  fn: mapImageWithPrecompute(
    ({ animationProgress, parameters: [speed] }) => ({
      yOffset: Math.round(speed * Math.sin(animationProgress * 2 * Math.PI)),
    }),
    ({ computed: { yOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x, y + yOffset])
  ),
});
