import { imageUtil } from '~/domain/utils';
import { intParam } from '~/params';
import { buildEffect } from './utils';

// Probably still needs work -- the inner pixels get all funky still
export const fisheye = buildEffect({
  name: 'Fisheye',
  group: 'Misc',
  description: 'Make the image grow and shrink in a distorted fashion',
  requiresAnimation: true,
  params: [
    intParam({
      name: 'Radius',
      description: 'Positive Number',
      defaultValue: (image) =>
        image ? Math.floor(image.dimensions[0] / 6) : 10,
      min: 0,
    }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({
      animationProgress,
      dimensions: [width, height],
      parameters: [radius],
    }) => {
      const expanding = animationProgress < 0.5;
      return {
        dist: (expanding ? animationProgress : 1 - animationProgress) * radius,
        centerX: width / 2,
        centerY: height / 2,
      };
    },
    ({ computed: { dist, centerX, centerY }, coord: [x, y], getSrcPixel }) => {
      const angle = Math.atan2(centerY - y, centerX - x);

      const xOffset = Math.round(dist * Math.cos(angle));
      const yOffset = Math.round(dist * Math.sin(angle));
      return getSrcPixel([x + xOffset, y + yOffset]);
    },
  ),
});
