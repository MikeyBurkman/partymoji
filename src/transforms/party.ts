import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
import * as convert from 'color-convert';
import { sliderParam } from '../params/sliderParam';

export const party = buildTransform({
  name: 'Party',
  description: 'Party time!',
  params: [
    sliderParam({
      name: 'Amount',
      description: 'How strong the effect is',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 50,
    }),
    sliderParam({
      name: 'Shift Speed',
      description: 'Controls how quickly it shifts through the various colors',
      min: 1,
      max: 8,
      defaultValue: 1,
    }),
  ],
  fn: mapImage(
    ({
      coord,
      getSrcPixel,
      frameCount,
      frameIndex,
      parameters: [amount, shiftSpeed],
    }) => {
      const adjust = (c1: number, c2: number) =>
        (1 - amount / 100) * c1 + (amount / 100) * c2;
      const [r, g, b, a] = getSrcPixel(coord);
      const [, s, l] = convert.rgb.hsl([r, g, b]);
      const newH = ((frameIndex / frameCount) * shiftSpeed * 360) % 360;
      const [newR, newG, newB] = convert.hsl.rgb([newH, s, l]);
      return [adjust(r, newR), adjust(g, newG), adjust(b, newB), a];
    }
  ),
});
