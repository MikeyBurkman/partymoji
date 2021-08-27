import { buildTransform } from '../domain/types';
import { mapImage } from '../domain/utils';
import { floatParam } from '../params/floatParam';

export const bounce = buildTransform({
  name: 'Bounce',
  description: 'Make the image bounce up and down',
  params: [
    floatParam({
      name: 'Bounce Speed',
      description: 'Positive number',
      defaultValue: 5,
      min: 0,
    }),
  ],
  fn: mapImage(({ coord, frameCount, frameIndex, getSrcPixel, parameters }) => {
    const [x, y] = coord;
    const yOffset =
      y +
      Math.round(
        parameters[0] * Math.sin((frameIndex / frameCount) * 2 * Math.PI)
      );

    return getSrcPixel([x, yOffset]);
  }),
});
