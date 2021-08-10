import { Frame, buildTransform } from '../types';
import { assert, repeat } from '../utils';
import { intParam } from './params/intParam';

export const frameCount = buildTransform({
  name: 'Frame Count',
  params: [
    intParam({
      name: 'Number of Frames',
      defaultValue: 10,
      min: 1,
    }),
  ],
  fn: ({ image, parameters }) => {
    assert(
      image.frames.length === 1,
      'The frame-count transform requires a static image with just one frame'
    );

    const [frameCount] = parameters;

    const frames = repeat(frameCount).map(
      (): Frame => ({
        data: image.frames[0].data,
      })
    );

    return {
      dimensions: image.dimensions,
      frames,
    };
  },
});
