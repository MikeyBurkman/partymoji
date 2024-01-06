import { imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

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
    imageUtil.changeFrameCount(image, frameCount),
});
