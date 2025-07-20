import { imageUtil, miscUtil } from '~/domain/utils';
import { bezierParam, radioParam, sliderParam } from '~/params';
import { buildEffect } from './utils';

export const bounce = buildEffect({
  name: 'Bounce',
  group: 'Transform',
  description: 'Make the image bounce up and/or down',
  requiresAnimation: true,
  params: [
    radioParam({
      name: 'Direction',
      description: 'The direction of the bounce',
      defaultValue: 'upAndDown',
      options: [
        { name: 'Up and Down', value: 'upAndDown' },
        { name: 'Up', value: 'up' },
        { name: 'Down', value: 'down' },
      ],
    }),
    sliderParam({
      name: 'Bounce Height %',
      description: 'Percentage of the image height',
      defaultValue: 30,
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
      parameters: [bounceDir, bounceHeight, easing],
      dimensions,
    }) => {
      const imageHeight = dimensions[1];
      const baseOffset = (bounceHeight / 100) * imageHeight;

      if (bounceDir === 'upAndDown') {
        const firstHalf = animationProgress < 0.5;
        const b = miscUtil.bezierCurve(
          easing,
          true,
        )(Math.abs(animationProgress - (firstHalf ? 0 : 0.5)) * 2);
        return {
          yOffset: Math.round(baseOffset * b * (firstHalf ? 1 : -1)),
        };
      }

      const b = miscUtil.bezierCurve(easing, true)(animationProgress);
      return {
        yOffset: Math.round(baseOffset * b * (bounceDir === 'up' ? 1 : -1)),
      };
    },
    ({ computed: { yOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x, y + yOffset]),
  ),
});
