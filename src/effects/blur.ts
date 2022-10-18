import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { sliderParam } from '../params/sliderParam';

export const blur = buildEffect({
  name: 'Blur',
  description: 'Blurs the image',
  params: [
    sliderParam({
      name: 'Amount',
      defaultValue: 2,
      min: 0,
      max: 10,
    }),
  ] as const,
  fn: ({ image, parameters: [amount] }) =>
    mapFrames(image, (frame) =>
      applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (ctx) => {
          ctx.filter = `blur(${amount}px)`;
        },
      })
    ),
});
