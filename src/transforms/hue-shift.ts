import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
import { intParam } from '../params/intParam';
import * as convert from 'color-convert';

export const hueShift = buildTransform({
  name: 'Hue Shift',
  description: 'Shift the hue by some amount',
  params: [
    intParam({
      name: 'Amount',
      defaultValue: 0,
      min: 0,
      max: 100,
    }),
  ],
  fn: mapImage(({ coord, getSrcPixel, parameters }) => {
    const [amount] = parameters;
    const rawAmount = (amount / 100) * 255;
    const [r, g, b, a] = getSrcPixel(coord);
    const [h, s, l] = convert.rgb.hsl(r, g, b);
    const newH = (h + rawAmount) % 255;
    const [newR, newG, newB] = convert.hsl.rgb([newH, s, l]);
    return [newR, newG, newB, a];
  }),
});
