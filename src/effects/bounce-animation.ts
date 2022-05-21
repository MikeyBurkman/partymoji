import { concat, drop, pipe, reverse } from 'remeda';
import { buildEffect } from '../domain/types';

export const bounceAnimation = buildEffect({
  name: 'Bounce Animation',
  description: 'When the animation finishes, it will be replayed in reverse',
  params: [],
  fn: ({ image }) => ({
    dimensions: image.dimensions,
    frames: concat(
      image.frames,
      pipe(image.frames, drop(1), reverse(), drop(1))
    ),
  }),
});
