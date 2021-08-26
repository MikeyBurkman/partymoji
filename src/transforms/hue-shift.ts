import { buildTransform } from '../domain/types';
import { fromHexColor, mapImage } from '../domain/utils';
import * as convert from 'color-convert';
import { colorPickerParam } from '../params/colorPickerParam';

export const hueShift = buildTransform({
  name: 'Hue Shift',
  description: 'Shift the hue to some other color',
  params: [
    colorPickerParam({
      name: 'Hue',
      defaultValue: fromHexColor('#000000'),
    }),
  ],
  fn: mapImage(({ coord, getSrcPixel, parameters }) => {
    const [newColor] = parameters;
    const [newHue] = convert.rgb.hsl([newColor[0], newColor[1], newColor[2]]);
    const [r, g, b, a] = getSrcPixel(coord);
    const [, s, l] = convert.rgb.hsl(r, g, b);
    const [newR, newG, newB] = convert.hsl.rgb([newHue, s, l]);
    return [newR, newG, newB, a];
  }),
});
