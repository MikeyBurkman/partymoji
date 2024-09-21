import { imageUtil } from '~/domain/utils';
import { floatParam } from '~/params';
import { buildEffect } from './utils';

export const shake = buildEffect({
  name: 'Shake',
  group: 'Misc',
  description: 'Make the image shake left and right',
  params: [
    floatParam({
      name: 'Amplitude',
      defaultValue: (image) =>
        image ? Math.floor(image.dimensions[0] / 10) : 10,
      min: 0,
    }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({ animationProgress, parameters: [amplitude] }) => ({
      xOffset: Math.round(
        amplitude * Math.cos(animationProgress * 2 * Math.PI)
      ),
    }),
    ({ computed: { xOffset }, coord: [x, y], getSrcPixel }) =>
      getSrcPixel([x + xOffset, y])
  ),
});
