import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
import { floatParam } from '../params/floatParam';

export const circle = buildTransform({
  name: 'Circle',
  params: [
    floatParam({
      name: 'Radius',
      defaultValue: 10,
      min: 0,
    }),
  ],
  fn: mapImage(({ coord, frameCount, frameIndex, getSrcPixel, parameters }) => {
    const [radius] = parameters;
    const [x, y] = coord;
    const xOffset = Math.round(
      radius * Math.sin(-2 * Math.PI * (frameIndex / frameCount))
    );
    const yOffset = Math.round(
      radius * Math.cos(-2 * Math.PI * (frameIndex / frameCount))
    );
    return getSrcPixel([x + xOffset, y + yOffset]);
  }),
});
