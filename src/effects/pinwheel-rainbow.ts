import type { Coord } from '~/domain/types';
import { colorUtil, miscUtil, imageUtil } from '~/domain/utils';
import { intParam, sliderParam } from '~/params';
import { buildEffect } from './utils';
import { precomputeValues } from './precompute-values';

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
  fn: ({ image, parameters: [groupCount, strength, offsetX, offsetY] }) => {
    const [width, height] = image.dimensions;
    const center: Coord = [width / 2 + offsetX, height / 2 - offsetY];
    const baseHues =
      image.frames.length === 0
        ? []
        : precomputeValues(
            image.dimensions,
            (coord) => miscUtil.calculateAngle(coord, center) * groupCount,
          );
    return imageUtil.mapFrames(image, (frame, frameIndex, frameCount) => {
      const shift = (frameIndex / frameCount) * 360;
      return imageUtil.mapCoords(image.dimensions, (coord) => {
        const hue = (baseHues[coord[1] * width + coord[0]] + shift) % 360;
        return colorUtil.shiftTowardsHue(
          imageUtil.getPixelFromSource(image.dimensions, frame, coord),
          hue,
          strength,
        );
      });
    });
  },
});
