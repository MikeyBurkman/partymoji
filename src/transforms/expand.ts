import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
import { intParam } from '../params/intParam';

export const expand = buildTransform({
  name: 'Expand',
  description: 'Make the image grow and shrink',
  params: [
    intParam({
      name: 'Radius',
      description: 'Positive number',
      defaultValue: 10,
      min: 0,
    }),
  ],
  fn: mapImage(
    ({
      dimensions,
      coord,
      frameCount,
      frameIndex,
      getSrcPixel,
      parameters,
    }) => {
      const idx = frameIndex / frameCount;
      const dist = Math.cos(idx * 2 * Math.PI) * parameters[0];

      // Kind of follows the same algorithm as resize, except the amount is dynamic
      const [width, height] = dimensions;
      const centerX = width / 2;
      const centerY = height / 2;

      const [x, y] = coord;
      const xRatio = (x - centerX) / width;
      const yRatio = (y - centerY) / height;

      const xOffset = Math.floor(dist * xRatio);
      const yOffset = Math.round(dist * yRatio);
      return getSrcPixel([x - xOffset, y - yOffset]);
    }
  ),
});
