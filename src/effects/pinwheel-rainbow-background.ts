import type { Coord } from '~/domain/types';
import { colorUtil, miscUtil, imageUtil } from '~/domain/utils';
import { intParam, sliderParam } from '~/params';
import { buildEffect } from './utils';
import { precomputeValues } from './precompute-values';
import { createBackgroundCompositor } from './background-compositor';

export const pinwheelRainbowBackground = buildEffect({
  name: 'Pinwheel Rainbow Background',
  group: 'Party',
  description: 'Create a background pinwheel of rainbow colors',
  requiresAnimation: true,
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
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
    sliderParam({
      name: 'Foreground Opacity',
      defaultValue: 100,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image, parameters: [groupCount, offsetX, offsetY, opacity] }) => {
    const [width, height] = image.dimensions;
    const composite = createBackgroundCompositor(image.dimensions, opacity);
    const center: Coord = [width / 2 + offsetX, height / 2 - offsetY];
    const baseValues =
      image.frames.length === 0
        ? []
        : precomputeValues(image.dimensions, (coord) => {
            const angle = miscUtil.calculateAngle(coord, center);
            return angle * groupCount;
          });
    return imageUtil.mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const shift = animationProgress * 360;
      const background = imageUtil.mapCoords(image.dimensions, ([x, y]) =>
        colorUtil.colorFromHue((baseValues[y * width + x] + shift) % 360),
      );
      return composite(background, frame);
    });
  },
});
