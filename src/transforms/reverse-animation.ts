import { reverse } from 'remeda';
import { buildTransform } from '../domain/types';

export const reverseAnimation = buildTransform({
  name: 'Reverse Animation',
  description: 'Reverses the animation',
  params: [],
  fn: ({ image }) => ({
    dimensions: image.dimensions,
    frames: reverse(image.frames),
  }),
});
