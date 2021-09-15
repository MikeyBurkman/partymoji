import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
import * as convert from 'color-convert';
import { sliderParam } from '../params/sliderParam';

export const party = buildTransform({
  name: 'Party',
  description: 'Party time!',
  params: [
    sliderParam({
      name: 'Shift Speed',
      description: 'Controls how quickly it shifts through the various colors',
      min: 1,
      max: 8,
      defaultValue: 1,
    }),
  ],
  fn: mapImage(({ coord, getSrcPixel, frameCount, frameIndex, parameters }) => {
    const [shiftSpeed] = parameters;
    const [r, g, b, a] = getSrcPixel(coord);
    const [, s, l] = convert.rgb.hsl([r, g, b]);
    const [newR, newG, newB] = convert.hsl.rgb([
      ((frameIndex / frameCount) * shiftSpeed * 360) % 360,
      s,
      l,
    ]);
    return [newR, newG, newB, a];
  }),
});
