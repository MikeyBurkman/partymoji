import { imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const scaleImage = buildEffect({
  name: 'Scale Image',
  description: 'Scale the image without changing the dimensions',
  params: [
    sliderParam({
      name: 'Scale',
      min: 0.1,
      max: 3,
      step: 0.1,
      defaultValue: 1,
    }),
  ] as const,
  fn: ({ image, parameters: [scale] }) =>
    imageUtil.scaleImage({
      image,
      horizontalScale: scale,
      verticalScale: scale,
    }),
});
