import { buildTransform } from '../domain/types';
import seedrandom from 'seedrandom';

import { Color } from '../domain/types';
import {
  mapFrames,
  mapCoords,
  getPixelFromSource,
  isTransparent,
} from '../domain/utils';
import { textParam } from '../params/textParam';

const lightningIntensities: Color[] = [
  [0, 15, 40, 255], // dark color
  [150, 150, 175, 255],
  [180, 180, 205, 255],
  [210, 210, 235, 255],
];

export const lightning = buildTransform({
  name: 'Lightning',
  params: [
    textParam({
      name: 'Random Seed',
      defaultValue: 'lightning',
    }),
  ],
  fn: ({ image, parameters }) => {
    const random = seedrandom(parameters[0]);
    return mapFrames(image, (data) => {
      const i = random();
      const flashIntensity = i < 0.9 ? 0 : i < 0.95 ? 1 : i < 0.98 ? 2 : 3;

      return mapCoords(image.dimensions, (coord) => {
        const src = getPixelFromSource(image.dimensions, data, coord);

        if (isTransparent(src)) {
          return lightningIntensities[flashIntensity];
        }

        if (flashIntensity > 0) {
          // We're flashing, so brighten up the image a little
          const icf = 1.02 * flashIntensity;
          return [src[0] * icf, src[1] * icf, src[2] * icf, src[3]];
        }

        // No lightning
        return src;
      });
    });
  },
});
