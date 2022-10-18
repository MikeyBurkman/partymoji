import { buildEffect } from '../domain/types';
import { isTransparent, shiftHue } from '../domain/utils/color';
import { mapImage } from '../domain/utils/image';

export const partyTwo = buildEffect({
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
