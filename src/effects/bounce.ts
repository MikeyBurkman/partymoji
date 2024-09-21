import { imageUtil, miscUtil } from '~/domain/utils';
import { bezierParam, intParam } from '~/params';
import { buildEffect } from './utils';

export const bounce = buildEffect({
  name: 'Bounce',
  group: 'Transform',
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
      defaultValue: miscUtil.LINEAR_BEZIER,
    }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({ animationProgress, parameters: [height, easing] }) => {
      const b = miscUtil.bezierCurve(easing, true)(animationProgress);
      return {
        yOffset: Math.round(height * b),
      };
    },
    ({ computed: { yOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x, y + yOffset])
  ),
});
