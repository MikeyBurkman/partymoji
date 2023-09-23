import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyFilter } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { sliderParam } from '../params/sliderParam';

export const hueShift = buildEffect({
  name: 'Hue Shift',
  description: 'Shift the hue of each pixel in the image by some amount',
  params: [
    sliderParam({
      name: 'Amount',
      description: 'How much to shift the hue of each pixel',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 50,
    }),
  ] as const,
  fn: ({ image, parameters: [amount] }) =>
    mapFrames(image, (frame) =>
      applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          applyFilter(canvasData, {
            hueRotate: amount * 3.6,
          }),
      })
    ),
});
