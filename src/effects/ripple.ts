import { imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const ripple = buildEffect({
  name: 'Ripple',
  group: 'Misc',
  description: 'Create a ripple effect, like water',
  params: [
    sliderParam({
      name: 'Amplitude',
      defaultValue: 20,
      min: 0,
      max: 100,
      step: 5,
      description: 'How strong the ripple effect should be',
    }),
    sliderParam({
      name: 'Period',
      defaultValue: 1,
      min: 1,
      max: 20,
      description: 'How many ripples you want',
    }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({ animationProgress }) => ({
      shift: animationProgress * 2 * Math.PI,
    }),
    ({
      computed: { shift },
      coord: [x, y],
      dimensions: [, height],
      parameters: [amplitude, period],
      getSrcPixel,
    }) => {
      const offset = Math.round(
        amplitude * Math.sin((y / height) * period * Math.PI + shift)
      );

      return getSrcPixel([x + offset, y]);
    }
  ),
});
