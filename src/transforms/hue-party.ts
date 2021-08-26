import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
import * as convert from 'color-convert';

export const hueParty = buildTransform({
  name: 'Hue Party',
  description: 'Shift through all the hues',
  params: [],
  fn: mapImage(({ coord, getSrcPixel, frameCount, frameIndex }) => {
    const [r, g, b, a] = getSrcPixel(coord);
    const [, s, l] = convert.rgb.hsl([r, g, b]);
    const [newR, newG, newB] = convert.hsl.rgb([
      (frameIndex / frameCount) * 255,
      s,
      l,
    ]);
    return [(r + newR) / 2, (g + newG) / 2, (b + newB) / 2, a];
  }),
});
