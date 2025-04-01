import type { Coord } from '~/domain/types';
import { colorUtil, miscUtil, imageUtil } from '~/domain/utils';
import { intParam, sliderParam } from '~/params';
import { buildEffect } from './utils';

export const pinwheelRainbow = buildEffect({
  name: 'Pinwheel Rainbow',
  group: 'Party',
  description: 'Make the image look like a pinwheel rainbow',
  requiresAnimation: true,
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
    }),
    sliderParam({
      name: 'Strength',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 75,
    }),
    intParam({
      name: 'Offset X',
      description: 'Change the horizontal center of the pinwheel',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      description: 'Change the vertical center of the pinwheel',
      defaultValue: 0,
    }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({ dimensions: [width, height], parameters: [, , offsetX, offsetY] }) => {
      const center: Coord = [width / 2 + offsetX, height / 2 - offsetY];
      return { center };
    },
    ({
      computed: { center },
      coord,
      animationProgress,
      getSrcPixel,
      parameters: [groupCount, strength],
    }) => {
      const srcPixel = getSrcPixel(coord);

      const pointAngle = miscUtil.calculateAngle(coord, center);
      const newH = (pointAngle * groupCount + animationProgress * 360) % 360;

      return colorUtil.shiftTowardsHue(srcPixel, newH, strength);
    },
  ),
});
