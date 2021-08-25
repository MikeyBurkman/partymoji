import { buildTransform } from '../domain/types';
import { mapImage, isTransparent, getAveragePixelValue } from '../domain/utils';

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
