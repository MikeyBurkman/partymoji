import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
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
      const expanding = idx < 0.5;
      const [width, height] = dimensions;
      const dist = (expanding ? idx : 1 - idx) * parameters[0];
      const centerX = width / 2;
      const centerY = height / 2;

      const [x, y] = coord;
      const angle = Math.atan2(centerY - y, centerX - x);

      const xOffset = Math.round(dist * Math.cos(angle));
      const yOffset = Math.round(dist * Math.sin(angle));
      return getSrcPixel([x + xOffset, y + yOffset]);
    }
  ),
});
