import { buildTransform } from '../types';
import { mapImage } from '../utils';
import { floatParam } from '../../params/floatParam';

// Probably still needs work -- the inner pixels get all funky still
export const fisheye = buildTransform({
  name: 'Fisheye',
  params: [floatParam({ name: 'radius', defaultValue: 10, min: 0 })],
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
