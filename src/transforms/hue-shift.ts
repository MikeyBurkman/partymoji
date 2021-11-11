import { buildTransform } from '../domain/types';
import { mapImage, shiftHue } from '../domain/utils';
import { huePickerParam } from '../params/huePickerParam';
import { sliderParam } from '../params/sliderParam';

export const hueShift = buildTransform({
  name: 'Hue Shift',
  description: 'Shift the hue to some other color',
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
    shiftHue(getSrcPixel(coord), newHue, amount)
  ),
});
