import { buildTransform } from '../types';
import { mapImage, isTransparent, getAveragePixelValue } from '../utils';

export const grayscale = buildTransform({
  name: 'Grayscale',
  params: [],
  fn: mapImage(({ coord, getSrcPixel }) => {
    const srcPixel = getSrcPixel(coord);

    if (isTransparent(srcPixel)) {
      return [0, 0, 0, 0];
    }

    const gray = getAveragePixelValue(srcPixel);

    return [gray, gray, gray, 255];
  }),
});
