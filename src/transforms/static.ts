import { buildTransform } from '../domain/types';
import { mapImage, isTransparent } from '../domain/utils';
import { sliderParam } from '../params/sliderParam';

export const staticc = buildTransform({
  name: 'Static',
  description: 'Adds random static to the image',
  params: [
    sliderParam({
      name: 'Strength',
      description: 'Higher number increases the amount of static pixels',
      defaultValue: 25,
      min: 5,
      max: 100,
      step: 5,
    }),
  ],
  fn: mapImage(({ coord, getSrcPixel, parameters, random }) => {
    const [strength] = parameters;
    const src = getSrcPixel(coord);

    if (isTransparent(src)) {
      return [0, 0, 0, 0];
    }

    const isStatic = Math.ceil(random() * 100) < strength;
    const grey = Math.ceil(random() * 255);

    return isStatic ? [grey, grey, grey, src[3]] : src;
  }),
});
