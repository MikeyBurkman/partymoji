import { buildEffect } from '../domain/types';
import { mapImageWithPrecompute, shiftHue } from '../domain/utils';
import { sliderParam } from '../params/sliderParam';

export const hueWave = buildEffect({
  name: 'Hue Wave',
  description: 'Shifts the hue of pixels in the image in a wave motion',
  params: [
    sliderParam({
      name: 'Amplitude',
      defaultValue: 20,
      min: 0,
      max: 100,
      step: 5,
      description: 'How strong the hue shift effect should be',
    }),
    sliderParam({
      name: 'Period',
      defaultValue: 1,
      min: 1,
      max: 20,
      description: 'How many waves you want',
    }),
  ] as const,
  fn: mapImageWithPrecompute(
    ({ animationProgress }) => ({
      shift: -1 * animationProgress * 2 * Math.PI,
    }),
    ({
      computed: { shift },
      coord,
      dimensions: [, height],
      parameters: [amplitude, period],
      getSrcPixel,
    }) => {
      const [, y] = coord;
      const amount = Math.round(
        amplitude * Math.sin((y / height) * period * Math.PI + shift)
      );

      return shiftHue(getSrcPixel(coord), (amount / 100) * 360);
    }
  ),
});
