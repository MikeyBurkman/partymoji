import { buildTransform } from '../domain/types';
import { mapImageWithPrecompute } from '../domain/utils';
import { intParam } from '../params/intParam';

// Probably still needs work -- the inner pixels get all funky still
export const fisheye = buildTransform({
  name: 'Fisheye',
  description: 'Make the image grow and shrink in a distorted fashion',
  params: [
    intParam({
      name: 'Radius',
      description: 'Positive Number',
      defaultValue: 10,
      min: 0,
    }),
  ] as const,
  fn: mapImageWithPrecompute(
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
    }
  ),
});
