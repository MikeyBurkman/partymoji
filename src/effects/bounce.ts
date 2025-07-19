import { imageUtil, miscUtil } from '~/domain/utils';
import { bezierParam, intParam, radioParam } from '~/params';
import { buildEffect } from './utils';

export const bounce = buildEffect({
  name: 'Bounce',
  group: 'Transform',
  description: 'Make the image bounce up and down',
  requiresAnimation: true,
  params: [
    radioParam({
      name: 'Direction',
      description: 'The direction of the bounce',
      defaultValue: 'Up and Down',
      options: [
        { name: 'Up and Down', value: 'upAndDown' },
        { name: 'Up', value: 'up' },
        { name: 'Down', value: 'down' },
      ],
    }),
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
      parameters: [upAndDown, perc, easing],
      dimensions: [_, height],
    }) => {
      const b = miscUtil.bezierCurve(easing, true)(animationProgress);
      const baseOffset = (perc / 100) * height;
      let yOffset = 0;
      switch (upAndDown) {
        case 'upAndDown':
          yOffset = baseOffset/2 * Math.sin(animationProgress * Math.PI * 2);
          break;
        case 'up':
          yOffset = baseOffset * b;
          break;
        case 'down':
          yOffset = baseOffset * b * -1;
          break;
      }

      return {
        yOffset: Math.round(yOffset),
      };
    },
    ({ computed: { yOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x, y + yOffset]),
  ),
});
