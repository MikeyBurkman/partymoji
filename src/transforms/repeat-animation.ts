import { range } from 'remeda';
import { buildTransform } from '../domain/types';
import { sliderParam } from '../params/sliderParam';

export const repeatAnimation = buildTransform({
  name: 'Repeat Animation',
  description: 'Repeats the current animation some number of times',
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
