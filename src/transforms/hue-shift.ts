import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
import * as convert from 'color-convert';
import { huePickerParam } from '../params/huePickerParam';

export const hueShift = buildTransform({
  name: 'Hue Shift',
  description: 'Shift the hue to some other color',
  params: [
    huePickerParam({
      name: 'Hue',
      defaultValue: 128,
    }),
  ],
  fn: mapImage(({ coord, getSrcPixel, parameters }) => {
    const [newHue] = parameters;
    const [r, g, b, a] = getSrcPixel(coord);
    const [, s, l] = convert.rgb.hsl(r, g, b);
    const [newR, newG, newB] = convert.hsl.rgb([newHue, s, l]);
    return [newR, newG, newB, a];
  }),
});
