import { buildTransform } from '../domain/types';
import { isTransparent, mapImage, shiftHue } from '../domain/utils';

export const partyTwo = buildTransform({
  name: 'Party Two',
  description:
    'Shift the hue of each individual pixel over the course of the animation',
  params: [],
  fn: mapImage(({ coord, getSrcPixel, animationProgress }) => {
    const srcPixel = getSrcPixel(coord);
    const isBackground = isTransparent(srcPixel);

    return isBackground
      ? srcPixel
      : shiftHue(srcPixel, animationProgress * 360);
  }),
});
