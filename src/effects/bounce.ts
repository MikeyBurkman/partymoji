import { imageUtil, logger, miscUtil } from '~/domain/utils';
import { bezierParam, checkboxParam, intParam } from '~/params';
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
    checkboxParam({
      name: 'Up and Down',
      description: 'If checked, the image will bounce in both directions',
      defaultValue: false,
    }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({
      animationProgress,
      parameters: [perc, easing, upAndDown],
      dimensions: [_, height],
    }) => {
      const b = miscUtil.bezierCurve(easing, true)(animationProgress);
      const baseOffset = (perc / 100) * height;
      return {
        yOffset: Math.round(
          upAndDown
            ? baseOffset * Math.sin(animationProgress * Math.PI * 2)
            : baseOffset * b,
        ),
      };
    },
    ({ computed: { yOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x, y + yOffset]),
  ),
});
