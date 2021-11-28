import { concat, reverse } from 'remeda';
import { buildTransform } from '../domain/types';

export const bounceAnimation = buildTransform({
  name: 'Bounce Animation',
  description: 'When the animation finishes, it will be replayed in reverse',
  params: [],
  fn: ({ image }) => ({
    dimensions: image.dimensions,
    frames: concat(image.frames, reverse(image.frames)),
  }),
});
