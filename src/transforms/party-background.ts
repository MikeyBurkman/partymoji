import { buildTransform } from '../domain/types';
import { isTransparent, mapImage } from '../domain/utils';
import * as convert from 'color-convert';
import { sliderParam } from '../params/sliderParam';

export const partyBackground = buildTransform({
  name: 'Party Background',
  description: 'Party time for the background (transparent) pixels!',
  params: [
    sliderParam({
      name: 'Shift Speed',
      description: 'Controls how quickly it shifts through the various colors',
      min: 1,
      max: 12,
      defaultValue: 1,
    }),
  ],
  fn: mapImage(
    ({
      coord,
      getSrcPixel,
      frameCount,
      frameIndex,
      parameters: [shiftSpeed],
    }) => {
      const src = getSrcPixel(coord);
      if (isTransparent(src)) {
        const [newR, newG, newB] = convert.hsl.rgb([
          ((frameIndex / frameCount) * shiftSpeed * 360) % 360,
          100,
          50,
        ]);
        return [newR, newG, newB, 255];
      }

      return src;
    }
  ),
});
