import { buildEffect } from '../domain/types';
import { mapImageWithPrecompute } from '../domain/utils/image';
import { bezierCurve, LINEAR_BEZIER } from '../domain/utils/misc';
import { bezierParam } from '../params';
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
    bezierParam({
      name: 'Easing',
      defaultValue: LINEAR_BEZIER,
    }),
  ] as const,
  fn: mapImageWithPrecompute(
    ({ animationProgress, parameters: [height, easing] }) => {
      const b = bezierCurve(easing, true)(animationProgress);
      return {
        yOffset: Math.round(height * b),
      };
    },
    ({ computed: { yOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x, y + yOffset])
  ),
});
