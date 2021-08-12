import { Frame, buildTransform } from '../types';
import { repeat } from '../utils';
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
    const [frameCount] = parameters;

    const currentFrames = image.frames;

    // Resulting image will contain frameCount frames.
    // If the original image had less than that, then we'll copy the last frame until we have enough.
    // If the original has more frames, then we'll discard the last ones.
    const frames = repeat(frameCount).map(
      (i): Frame => ({
        data: currentFrames[i]
          ? currentFrames[i].data
          : currentFrames[currentFrames.length - 1].data,
      })
    );

    return {
      dimensions: image.dimensions,
      frames,
    };
  },
});
