import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
import { floatParam } from '../params/floatParam';

export const doubleVision = buildTransform({
  name: 'Double Vision',
  description: 'See the image in double',
  params: [floatParam({ name: 'Amplitude', defaultValue: 10, min: 0 })],
  fn: mapImage(({ coord, frameCount, frameIndex, getSrcPixel, parameters }) => {
    const [amplitude] = parameters;
    const [x, y] = coord;
    const dir = x % 2 === 0 ? -1 : 1;
    const xOffset = Math.round(
      dir * amplitude * Math.sin(-2 * Math.PI * (frameIndex / frameCount))
    );
    return getSrcPixel([x + xOffset, y]);
  }),
});
