import { buildEffect } from '../domain/types';
import { mapImage, shiftTowardsHue } from '../domain/utils';
import { huePickerParam } from '../params/huePickerParam';
import { sliderParam } from '../params/sliderParam';

export const hueChange = buildEffect({
  name: 'Hue Change',
  description: 'Change the hue of the image to some other color',
  params: [
    huePickerParam({
      name: 'Hue',
      defaultValue: 180,
    }),
    sliderParam({
      name: 'Amount',
      description: 'How strong the effect is.',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 75,
    }),
  ] as const,
  fn: mapImage(({ coord, getSrcPixel, parameters: [newHue, amount] }) =>
    shiftTowardsHue(getSrcPixel(coord), newHue, amount)
  ),
});
