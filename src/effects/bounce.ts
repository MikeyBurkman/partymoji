import { imageUtil, logger, miscUtil } from '~/domain/utils';
import { bezierParam, intParam } from '~/params';
import { buildEffect } from './utils';

export const bounce = buildEffect({
  name: 'Bounce',
  group: 'Transform',
  description: 'Make the image bounce up and down',
  requiresAnimation: true,
  params: [
    intParam({
      name: 'Bounce Height %',
      description: 'Percentage of the image height',
      defaultValue: 50,
      min: 0,
      max: 100,
    }),
    bezierParam({
      name: 'Easing',
      defaultValue: miscUtil.LINEAR_BEZIER,
    }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({
      animationProgress,
      parameters: [perc, easing],
      dimensions: [_, height],
    }) => {
      logger.info('height', height, 'perc', perc, 'easing', easing);
      const b = miscUtil.bezierCurve(easing, true)(animationProgress);
      return {
        yOffset: Math.round((perc / 100) * height * b),
      };
    },
    ({ computed: { yOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x, y + yOffset]),
  ),
});
