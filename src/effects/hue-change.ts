import { colorUtil, imageUtil } from '~/domain/utils';
import { huePickerParam, sliderParam } from '~/params';
import { buildEffect } from './utils';

export const hueChange = buildEffect({
  name: 'Hue Change',
  group: 'Colors',
  description: 'Change the hue of each pixel towards some other color',
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
  fn: imageUtil.mapImage(
    ({ coord, getSrcPixel, parameters: [newHue, amount] }) =>
      colorUtil.shiftTowardsHue(getSrcPixel(coord), newHue, amount)
  ),
});
