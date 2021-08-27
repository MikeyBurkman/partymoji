import { buildTransform } from '../domain/types';
import { mapImage, isTransparent } from '../domain/utils';
import { floatParam } from '../params/floatParam';

export const staticc = buildTransform({
  name: 'Static',
  description: 'Adds random static to the image',
  params: [
    floatParam({
      name: 'Strength',
      description: 'Positive nunber',
      defaultValue: 1.2,
      min: 0,
    }),
  ],
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
