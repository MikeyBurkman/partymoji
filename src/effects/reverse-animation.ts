import { reverse } from 'remeda';
import { buildEffect } from '../domain/types';

export const reverseAnimation = buildEffect({
  name: 'Reverse Animation',
  description: 'Reverses the animation',
  params: [],
  fn: ({ image }) => ({
    dimensions: image.dimensions,
    frames: reverse(image.frames),
  }),
});
