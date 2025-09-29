import { canvasUtil, imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const invertColors = buildEffect({
  name: 'Invert Colors',
  group: 'Colors',
  description: 'Inverts the colors of the image',
  params: [
    sliderParam({
      name: 'Percentage',
      defaultValue: 100,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image, parameters: [amount] }) =>
    imageUtil.mapFrames(image, (frame) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          canvasUtil.applyFilter(canvasData, { invert: amount }),
      }),
    ),
});
