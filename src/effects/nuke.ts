import * as convert from 'color-convert';
import { buildEffect } from '../domain/types';
import { mapImage } from '../domain/utils';

export const nuke = buildEffect({
  name: 'Nuke',
  description: 'Oh no...',
  params: [],
  fn: mapImage(({ coord, getSrcPixel, animationProgress }) => {
    const threshold = animationProgress * 100;
    const [r, g, b, a] = getSrcPixel(coord);
    const [h, s, l] = convert.rgb.hsl(r, g, b);
    const [newR, newG, newB] = convert.hsl.rgb([h, s, l > threshold ? l : 0]);
    return [newR, newG, newB, l > threshold ? a : 0];
  }),
});
