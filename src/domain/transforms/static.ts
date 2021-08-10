import { buildTransform } from '../types';
import { mapImage, isTransparent } from '../utils';
import { floatParam } from './params/floatParam';

export const staticc = buildTransform({
  name: 'Static',
  params: [floatParam({ name: 'Strength', defaultValue: 10, min: 0 })],
  fn: mapImage(({ coord, getSrcPixel, parameters, random }) => {
    const [strength] = parameters;
    const src = getSrcPixel(coord);

    if (isTransparent(src)) {
      return [0, 0, 0, 0];
    }

    const inverse = Math.ceil(random() * strength) > 1;

    return inverse ? [255 - src[0], 255 - src[1], 255 - src[2], src[3]] : src;
  }),
});
