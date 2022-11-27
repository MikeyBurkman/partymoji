import { buildEffect } from '../domain/types';
import { changeFrameCount } from '../domain/utils/image';
import { sliderParam } from '../params/sliderParam';

export const setAnimationLength = buildEffect({
  name: 'Set Animation Length',
  description: 'Change the length of the animation.',
  params: [
    sliderParam({
      name: 'Number of Frames',
      description: 'Set how many frames of animation there will be.',
      defaultValue: (image) => (image ? image.frames.length : 1),
      min: 1,
      max: 60,
    }),
  ] as const,
  fn: ({ image, parameters: [frameCount] }) =>
    changeFrameCount(image, frameCount),
});
