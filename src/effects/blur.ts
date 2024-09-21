import { canvasUtil, imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const blur = buildEffect({
  name: 'Blur',
  group: 'Transform',
  description: 'Blurs the image',
  params: [
    sliderParam({
      name: 'Amount',
      defaultValue: 2,
      min: 0,
      max: 20,
    }),
  ] as const,
  fn: ({ image, parameters: [amount] }) =>
    imageUtil.mapFrames(image, (frame) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          canvasUtil.applyFilter(canvasData, { blur: amount }),
      })
    ),
});
