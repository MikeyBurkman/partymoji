import { colorUtil, imageUtil } from '~/domain/utils';
import { buildEffect } from './utils';

export const partyHarder = buildEffect({
  name: 'Party Harder',
  description:
    'Shift the hue of each individual pixel over the course of the animation',
  params: [],
  fn: imageUtil.mapImage(({ coord, getSrcPixel, animationProgress }) =>
    colorUtil.shiftHue(getSrcPixel(coord), animationProgress * 360)
  ),
});
