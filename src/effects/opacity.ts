import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyFilter } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { sliderParam } from '../params/sliderParam';

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
    mapFrames(image, (frame) =>
      applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) => applyFilter(canvasData, { opacity: amount }),
      })
    ),
});
