import { imageUtil, miscUtil } from '~/domain/utils';
import { bezierParam, intParam } from '~/params';
import { buildEffect } from './utils';

export const expand = buildEffect({
  name: 'Expand',
  group: 'Transform',
  description: 'Make the image grow and shrink',
  params: [
    intParam({
      name: 'Radius',
      description: 'Positive number',
      defaultValue: (image) =>
        image ? Math.floor(image.dimensions[0] / 6) : 10,
      min: 0,
    }),
    bezierParam({
      name: 'Easing',
      defaultValue: miscUtil.LINEAR_BEZIER,
    }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({
      dimensions: [width, height],
      animationProgress,
      parameters: [radius, easing],
    }) => ({
      dist: miscUtil.bezierCurve(easing, true)(animationProgress) * radius,
      centerX: width / 2,
      centerY: height / 2,
    }),
    ({
      computed: { centerX, centerY, dist },
      dimensions: [width, height],
      coord: [x, y],
      getSrcPixel,
    }) => {
      // Kind of follows the same algorithm as resize, except the amount is dynamic
      const xRatio = (x - centerX) / width;
      const yRatio = (y - centerY) / height;

      const xOffset = Math.floor(dist * xRatio);
      const yOffset = Math.round(dist * yRatio);
      return getSrcPixel([x - xOffset, y - yOffset]);
    }
  ),
});
