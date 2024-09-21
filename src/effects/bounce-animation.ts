import { concat, drop, pipe, reverse } from 'remeda';
import { buildEffect } from './utils';

export const bounceAnimation = buildEffect({
  name: 'Bounce Animation',
  group: 'Animation',
  description: 'When the animation finishes, it will be replayed in reverse',
  secondaryDescription: 'This doubles the number of animation frames.',
  requiresAnimation: true,
  params: [],
  fn: ({ image }) => ({
    dimensions: image.dimensions,
    frames: concat(
      image.frames,
      pipe(image.frames, drop(1), reverse(), drop(1))
    ),
  }),
});
