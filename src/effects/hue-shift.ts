import { buildEffect } from '../domain/types';
import { mapImage, shiftHue } from '../domain/utils';
import { sliderParam } from '../params/sliderParam';

export const hueShift = buildEffect({
  name: 'Hue Shift',
  description: 'Shift the hue of each pixel in the image by some amount',
  params: [
    sliderParam({
      name: 'Amount',
      description: 'How much to shift the hue of each pixel',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 50,
    }),
  ] as const,
  fn: mapImage(({ coord, getSrcPixel, parameters: [amount] }) =>
    shiftHue(getSrcPixel(coord), (amount / 100) * 360)
  ),
});
