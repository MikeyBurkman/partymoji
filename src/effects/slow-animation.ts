import { range } from 'remeda';
import { buildEffect } from '../domain/types';
import { getPixelFromSource, mapCoords } from '../domain/utils/image';
import { radioParam } from '../params/radioParam';

export const slowAnimation = buildEffect({
  name: 'Slow Animation',
  description: 'Attempts to slow the animation by adding intermediate frames',
  secondaryDescription: 'This will make the final filze size larger',
  params: [
    radioParam<'basic' | 'smooth'>({
      name: 'Interpolation Type',
      options: [
        { name: 'Basic', value: 'basic' },
        { name: 'Smooth', value: 'smooth' },
      ],
      defaultValue: 'basic',
      description:
        'With basic interpolation, frames are simply duplicated. ' +
        'With smooth interpolation, intermediate frames are the average of their surrounding frames.',
    }),
  ],
  fn: ({ image, parameters: [type] }) => ({
    dimensions: image.dimensions,
    frames: range(0, image.frames.length * 2 - 1).map((i) => {
      // IE: if OF frame count = 4 (with indexes [0, 1, 2, 3])
      // Result = [0, 0+1, 1, 1+2, 2, 2+3, 3], 3+4, 4]

      // Even numbered frames are just the original frames
      if (i % 2 === 0) {
        return image.frames[i / 2];
      }

      const ogFrameIdx = (i - 1) / 2;

      if (type === 'basic') {
        // Intermediate frame is simply the previous OG frame
        return image.frames[ogFrameIdx];
      }

      // Smooth interpolation means intermediate frames are an average of the surrounding frames
      return mapCoords(image.dimensions, (coord) => {
        const [r1, g1, b1, a1] = getPixelFromSource(
          image.dimensions,
          image.frames[ogFrameIdx],
          coord
        );
        const [r2, g2, b2, a2] = getPixelFromSource(
          image.dimensions,
          image.frames[ogFrameIdx + 1],
          coord
        );
        return [(r1 + r2) / 2, (g1 + g2) / 2, (b1 + b2) / 2, (a1 + a2) / 2];
      });
    }),
  }),
});
