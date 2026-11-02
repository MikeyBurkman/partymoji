import { colorUtil, imageUtil } from '~/domain/utils';
import { intParam, sliderParam } from '~/params';
import { buildEffect } from './utils';
import { precomputeValues } from './precompute-values';
import { createBackgroundCompositor } from './background-compositor';

export const radianceRainbowBackground = buildEffect({
  name: 'Radiance Rainbow Background',
  group: 'Party',
  description: 'Radiate rainbow colors out in rings',
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
      description: 'Change the horizontal center of the radiance',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      description: 'Change the vertical center of the radiance',
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
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(
      (width / 2) * (width / 2) + (height / 2) * (height / 2),
    );
    const baseValues =
      image.frames.length === 0
        ? []
        : precomputeValues(image.dimensions, (coord) => {
            const [x, y] = coord;
            const xRelCenter = x - centerX - offsetX;
            const yRelCenter = y - centerY + offsetY;
            const distance = Math.sqrt(
              yRelCenter * yRelCenter + xRelCenter * xRelCenter,
            );
            return (1 - distance / maxDist) * 360 * groupCount;
          });
    return imageUtil.mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const shift = 360 * animationProgress;
      const background = imageUtil.mapCoords(image.dimensions, ([x, y]) =>
        colorUtil.colorFromHue((baseValues[y * width + x] + shift) % 360),
      );
      return composite(background, frame);
    });
  },
});
