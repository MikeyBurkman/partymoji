import { buildTransform } from '../domain/types';
import { mapImage, clampColor } from '../domain/utils';
import { sliderParam } from '../params/sliderParam';

export const brightness = buildTransform({
  name: 'Brightness',
  description: 'Increase or decrease the brightness of the image',
  params: [
    sliderParam({
      name: 'Amount',
      defaultValue: 0,
      min: -100,
      max: 100,
    }),
  ],
  fn: mapImage(({ coord, getSrcPixel, parameters }) => {
    const [amount] = parameters;
    const rawAmount = (amount / 100) * 255;
    const p = getSrcPixel(coord);
    return clampColor([
      p[0] + rawAmount,
      p[1] + rawAmount,
      p[2] + rawAmount,
      p[3],
    ]);
  }),
});
