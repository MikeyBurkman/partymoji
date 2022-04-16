import { buildTransform } from '../domain/types';
import { mapImageWithPrecompute } from '../domain/utils';
import { floatParam } from '../params/floatParam';
import { intParam } from '../params/intParam';

export const ripple = buildTransform({
  name: 'Ripple',
  description: 'Create a ripple effect, like water',
  params: [
    floatParam({
      name: 'Amplitude',
      defaultValue: 10,
      description: 'How strong the ripple effect should be',
    }),
    intParam({
      name: 'Period',
      defaultValue: 2,
      min: 0,
      description: 'How many ripples you want. Positive number.',
    }),
  ] as const,
  fn: mapImageWithPrecompute(
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
