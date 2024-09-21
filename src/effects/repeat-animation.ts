import { range } from 'remeda';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const repeatAnimation = buildEffect({
  name: 'Repeat Animation',
  group: 'Animation',
  description: 'Repeats the current animation some number of times',
  secondaryDescription: 'This can greatly increase the final file size!',
  requiresAnimation: true,
  params: [
    sliderParam({
      name: 'Number of Repeats',
      defaultValue: 1,
      min: 1,
      max: 50,
    }),
  ] as const,
  fn: ({ image, parameters: [numRepeats] }) => ({
    dimensions: image.dimensions,
    frames: range(0, image.frames.length * (numRepeats + 1)).map(
      (i) => image.frames[i % image.frames.length]
    ),
  }),
});
