import { buildTransform } from '../domain/types';
import { mapImage, clampColor } from '../domain/utils';
import { intParam } from '../params/intParam';

export const brightness = buildTransform({
  name: 'Brightness',
  description: 'Increase or decrease the brightness of the image',
  params: [
    intParam({
      name: 'Percent (-100 to 100)',
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
