import { reverse } from 'remeda';
import { buildEffect } from './utils';

export const reverseAnimation = buildEffect({
  name: 'Reverse Animation',
  group: 'Animation',
  description: 'Reverses the animation',
  requiresAnimation: true,
  params: [],
  fn: ({ image }) => ({
    dimensions: image.dimensions,
    frames: reverse(image.frames),
  }),
});
