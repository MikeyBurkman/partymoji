import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
import * as convert from 'color-convert';

export const hueParty = buildTransform({
  name: 'Hue Party',
  description: 'Shift the hue by some amount',
  params: [],
  fn: mapImage(({ coord, getSrcPixel, frameCount, frameIndex }) => {
    const rawAmount = (frameIndex / frameCount) * 255;
    const [r, g, b, a] = getSrcPixel(coord);
    const [h, s, l] = convert.rgb.hsl(r, g, b);
    const newH = (h + rawAmount) % 255;
    const [newR, newG, newB] = convert.hsl.rgb([newH, s, l]);
    return [newR, newG, newB, a];
  }),
});
