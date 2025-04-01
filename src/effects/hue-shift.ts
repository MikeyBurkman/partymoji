import { canvasUtil, imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const hueShift = buildEffect({
  name: 'Hue Shift',
  group: 'Colors',
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
    imageUtil.mapFrames(image, (frame) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          canvasUtil.applyFilter(canvasData, {
            hueRotate: amount * 3.6,
          }),
      }),
    ),
});
