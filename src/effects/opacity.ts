import { canvasUtil, imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const opacity = buildEffect({
  name: 'Opacity',
  description: 'Sets the opacity of the image',
  secondaryDescription:
    'Because gifs do not support transparency, ' +
    'the preview below will not reflect the transparency accurately. ' +
    'It will apply to subsequent effects though.',
  params: [
    sliderParam({
      name: 'Amount',
      defaultValue: 50,
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
          canvasUtil.applyFilter(canvasData, { opacity: amount }),
      })
    ),
});
