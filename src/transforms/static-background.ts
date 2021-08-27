import { buildTransform } from '../domain/types';
import { mapImage, isTransparent } from '../domain/utils';
import { sliderParam } from '../params/sliderParam';

export const staticBackground = buildTransform({
  name: 'Static Background',
  description: 'Adds random static to the background',
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
      const inverse = Math.ceil(random() * 100) < strength;
      const grey = Math.ceil(random() * 255);

      return inverse ? [grey, grey, grey, 255] : src;
    }

    return src;
  }),
});
