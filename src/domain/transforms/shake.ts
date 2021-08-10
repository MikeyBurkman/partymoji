import { buildTransform } from '../types';
import { mapImage } from '../utils';
import { floatParam } from './params/floatParam';

export const shake = buildTransform({
  name: 'Shake',
  params: [floatParam({ name: 'Shake Speed', defaultValue: 10, min: 0 })],
  fn: mapImage(({ coord, frameCount, frameIndex, getSrcPixel, parameters }) => {
    const [shakeSpeed] = parameters;
    const [x, y] = coord;
    const xOffset =
      x +
      Math.round(
        shakeSpeed * Math.cos((frameIndex / frameCount) * 2 * Math.PI)
      );

    return getSrcPixel([xOffset, y]);
  }),
});
