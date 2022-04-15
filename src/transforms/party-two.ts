import { buildTransform } from '../domain/types';
import { isTransparent, mapImage, shiftHue } from '../domain/utils';

export const partyTwo = buildTransform({
  name: 'Party Two',
  description:
    'Shift the hue of each individual pixel over the course of the animation',
  params: [],
  fn: mapImage(({ coord, getSrcPixel, frameCount, frameIndex }) => {
    const srcPixel = getSrcPixel(coord);
    const isBackground = isTransparent(srcPixel);

    if (isBackground) {
      return srcPixel;
    }

    const amount = (frameIndex / frameCount) * 360;
    return shiftHue(srcPixel, amount);
  }),
});
