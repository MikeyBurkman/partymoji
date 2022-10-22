import { buildEffect } from '../domain/types';
import { shiftHue } from '../domain/utils/color';
import { mapImage } from '../domain/utils/image';

export const partyHarder = buildEffect({
  name: 'Party Harder',
  description:
    'Shift the hue of each individual pixel over the course of the animation',
  params: [],
  fn: mapImage(({ coord, getSrcPixel, animationProgress }) =>
    shiftHue(getSrcPixel(coord), animationProgress * 360)
  ),
});
