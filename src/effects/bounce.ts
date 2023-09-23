import { buildEffect } from '../domain/types';
import { mapImageWithPrecompute } from '../domain/utils/image';
import { intParam } from '../params/intParam';

export const bounce = buildEffect({
  name: 'Bounce',
  description: 'Make the image bounce up and down',
  params: [
    intParam({
      name: 'Bounce Height',
      description: 'Positive number',
      defaultValue: (image) =>
        image ? Math.floor(image.dimensions[1] / 10) : 10,
      min: 0,
    }),
  ] as const,
  fn: mapImageWithPrecompute(
    ({ animationProgress, parameters: [height] }) => ({
      yOffset: Math.round(height * Math.sin(animationProgress * 2 * Math.PI)),
    }),
    ({ computed: { yOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x, y + yOffset])
  ),
});
