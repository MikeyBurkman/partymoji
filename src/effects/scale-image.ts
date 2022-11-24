import { buildEffect } from '../domain/types';
import { scaleImage as scaleImageUtil } from '../domain/utils/image';
import { sliderParam } from '../params/sliderParam';

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
    scaleImageUtil({ image, horizontalScale: scale, verticalScale: scale }),
});
